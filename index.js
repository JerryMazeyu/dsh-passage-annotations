import { randomUUID } from "node:crypto";

export const inject = ["storage", "webServer", "connection", "agents"];

const UNIT_NAME = "passage_annotations";
const TABLE = "notes";
const ROUTE_PATH = "/passage-annotations/notes";
const MAX_BODY_BYTES = 256 * 1024;
const CONTEXT_ORDER = 90;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(payload));
}

function sendMethodNotAllowed(res, allow) {
  res.statusCode = 405;
  res.setHeader("allow", allow);
  res.end();
}

async function readBoundedBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.byteLength;
    if (size > MAX_BODY_BYTES) {
      req.resume();
      return null;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, size).toString("utf8");
}

export function apply(ctx) {
  // In-memory authoritative cache: sessionId -> [{ id, quote, note, createdAt }]
  const notesBySession = new Map();
  let unitPromise;

  async function ensureUnit() {
    if (unitPromise === void 0) {
      unitPromise = (async () => {
        const backend = ctx.storage.backend.get("json");
        const unit = await backend.kv.open({
          name: UNIT_NAME,
          version: 1,
          tables: [TABLE],
          hasGlobal: false,
          layout: "single",
        });
        const snapshot = await unit.loadAll();
        const stored = snapshot.tables[TABLE] ?? {};
        for (const [sessionId, list] of Object.entries(stored)) {
          if (Array.isArray(list)) notesBySession.set(sessionId, list);
        }
        return unit;
      })();
    }
    return unitPromise;
  }

  function listNotes(sessionId) {
    return notesBySession.get(sessionId) ?? [];
  }

  async function persistSession(sessionId) {
    const unit = await ensureUnit();
    const list = notesBySession.get(sessionId);
    if (list !== void 0 && list.length > 0) {
      await unit.putRecord(TABLE, sessionId, list);
    } else {
      notesBySession.delete(sessionId);
      await unit.deleteRecord(TABLE, sessionId);
    }
  }

  function renderContext(sessionId) {
    const list = notesBySession.get(sessionId) ?? [];
    if (list.length === 0) return "";
    const lines = list.map((n, i) => {
      const quote = n.quote.length > 160 ? n.quote.slice(0, 160) + "…" : n.quote;
      const location = typeof n.filePath === "string" && n.filePath !== ""
        ? `文件：${n.filePath}${typeof n.line === "number" ? `（第 ${n.line} 行附近）` : ""}\n   文段：`
        : "文段：";
      return `${i + 1}. ${location}“${quote}”\n   备注：${n.note}`;
    });
    return "用户对以下文段添加了备注（这些是针对对话上下文的批注，请在修改时遵循）：\n" + lines.join("\n");
  }

  // Per-agent dynamic context: each agent sees only its own session's notes.
  // Attach to agents created later AND to agents that already existed when this
  // plugin loaded, so a session opened before installation is covered too.
  const perAgent = new Map();
  function attachAgent(agent) {
    if (perAgent.has(agent.id)) return;
    const dispose = agent.ctx.effect(() => {
      const systemPrompt = agent.ctx.get("systemPrompt");
      if (systemPrompt === void 0) return undefined;
      return systemPrompt.context({
        name: "passage-annotations",
        order: CONTEXT_ORDER,
        text: () => renderContext(agent.id),
      });
    });
    perAgent.set(agent.id, dispose);
  }
  ctx.on("agent/created", ({ agent }) => attachAgent(agent));
  for (const agent of ctx.agents.list()) attachAgent(agent);
  ctx.on("agent/disposed", ({ agent }) => {
    perAgent.delete(agent.id);
  });
  ctx.effect(() => () => {
    for (const dispose of perAgent.values()) dispose();
    perAgent.clear();
  });

  // Trust fence borrowed from the shipped open-in-app routes.
  const rejected = (req, res) => {
    const rejection = ctx.connection.requestRejection(req);
    if (rejection === void 0) return false;
    res.statusCode = rejection;
    res.end();
    return true;
  };

  ctx.effect(() => ctx.webServer.register({
    kind: "exact",
    path: ROUTE_PATH,
    handler: async (req, res) => {
      if (rejected(req, res)) return;
      const url = new URL(String(req.url), "http://localhost");
      const sessionId = url.searchParams.get("sessionId") ?? "";
      if (sessionId === "") {
        sendJson(res, 400, { code: "bad-request", message: "sessionId is required" });
        return;
      }

      if (req.method === "GET") {
        sendJson(res, 200, { notes: listNotes(sessionId) });
        return;
      }

      if (req.method === "POST") {
        const text = await readBoundedBody(req);
        if (text === null) {
          sendJson(res, 413, { code: "payload-too-large", message: "request body is too large" });
          return;
        }
        let body;
        try {
          body = JSON.parse(text);
        } catch {
          sendJson(res, 400, { code: "bad-request", message: "request body must be JSON" });
          return;
        }
        const quote = typeof body.quote === "string" ? body.quote.trim() : "";
        const note = typeof body.note === "string" ? body.note.trim() : "";
        if (quote === "" || note === "") {
          sendJson(res, 400, { code: "bad-request", message: "quote and note must be non-empty" });
          return;
        }
        const filePath = typeof body.filePath === "string" ? body.filePath.trim() : "";
        const line = Number.isSafeInteger(body.line) && body.line > 0 ? body.line : undefined;
        const previous = listNotes(sessionId);
        const entry = {
          id: randomUUID(),
          quote,
          note,
          createdAt: Date.now(),
          ...filePath === "" ? {} : { filePath },
          ...line === void 0 ? {} : { line },
        };
        const list = [...previous, entry];
        notesBySession.set(sessionId, list);
        try {
          await persistSession(sessionId);
        } catch (error) {
          if (previous.length === 0) notesBySession.delete(sessionId);
          else notesBySession.set(sessionId, previous);
          sendJson(res, 500, { code: "storage-failed", message: String(error?.message ?? error) });
          return;
        }
        sendJson(res, 200, { notes: list });
        return;
      }

      if (req.method === "DELETE") {
        const id = url.searchParams.get("id") ?? "";
        if (id === "") {
          sendJson(res, 400, { code: "bad-request", message: "id is required" });
          return;
        }
        const previous = listNotes(sessionId);
        const list = previous.filter((n) => n.id !== id);
        if (list.length === 0) notesBySession.delete(sessionId);
        else notesBySession.set(sessionId, list);
        try {
          await persistSession(sessionId);
        } catch (error) {
          if (previous.length === 0) notesBySession.delete(sessionId);
          else notesBySession.set(sessionId, previous);
          sendJson(res, 500, { code: "storage-failed", message: String(error?.message ?? error) });
          return;
        }
        sendJson(res, 200, { notes: list });
        return;
      }

      sendMethodNotAllowed(res, "GET, POST, DELETE");
    },
  }), "passage-annotations: notes route");

  // Read-only diagnostic: what the model receives as injected context, and
  // whether this session's agent is currently attached.
  ctx.effect(() => ctx.webServer.register({
    kind: "exact",
    path: "/passage-annotations/context",
    handler: async (req, res) => {
      if (rejected(req, res)) return;
      if (req.method !== "GET") {
        sendMethodNotAllowed(res, "GET");
        return;
      }
      const url = new URL(String(req.url), "http://localhost");
      const sessionId = url.searchParams.get("sessionId") ?? "";
      if (sessionId === "") {
        sendJson(res, 400, { code: "bad-request", message: "sessionId is required" });
        return;
      }
      sendJson(res, 200, {
        attached: perAgent.has(sessionId),
        count: listNotes(sessionId).length,
        text: renderContext(sessionId),
      });
    },
  }), "passage-annotations: context diagnostic route");

  // Notes are one-shot: when a turn for the owning session ends, drop them so
  // they never accumulate across conversation rounds.
  ctx.on("session/event", (session, event) => {
    if (event.type !== "turn/end") return;
    const sessionId = session.id;
    if (!notesBySession.has(sessionId)) return;
    notesBySession.delete(sessionId);
    if (unitPromise !== void 0) {
      unitPromise.then((unit) => unit.deleteRecord(TABLE, sessionId)).catch(() => {});
    }
  });

  ctx.effect(() => () => {
    if (unitPromise !== void 0) {
      unitPromise.then((unit) => unit.close()).catch(() => {});
    }
  });
}
