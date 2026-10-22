window.__ModuleLoader__.load({
  id: "@local/dsh-passage-annotations",
  factory(require) {
    const React = require("react");
    const h = React.createElement;
    const { useState, useEffect, useRef, useCallback } = React;

    // Document-relative routes, matching the Host's /passage-annotations/*.
    const ROUTE = "passage-annotations/notes";
    const CONTEXT_ROUTE = "passage-annotations/context";

    const PANEL_WIDTH = 328;

    const style = {
      // Floating "add note" tooltip pinned just above the selection.
      tooltip: {
        position: "fixed",
        transform: "translateX(-50%)",
        zIndex: 10000,
        pointerEvents: "auto",
        borderRadius: "var(--dsw-radius-md, 8px)",
        border: "1px solid var(--dsw-alias-border-l2)",
        background: "var(--dsw-alias-bg-overlay)",
        color: "var(--dsw-alias-label-primary)",
        fontSize: "13px",
        fontWeight: 600,
        padding: "5px 11px",
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(0,0,0,0.28)",
        whiteSpace: "nowrap",
      },
      // Collapsed pin: a small bubble anchored beside the annotated passage.
      pin: {
        position: "fixed",
        transform: "translateX(-50%)",
        zIndex: 10000,
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        gap: 6,
        borderRadius: "999px",
        border: "1px solid var(--dsw-alias-border-l2)",
        background: "var(--dsw-alias-label-primary)",
        color: "var(--dsw-alias-bg-base)",
        fontSize: "12px",
        fontWeight: 700,
        padding: "5px 11px",
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(0,0,0,0.28)",
        whiteSpace: "nowrap",
      },
      pinBadge: {
        minWidth: 16,
        height: 16,
        borderRadius: 999,
        background: "rgba(255,255,255,0.28)",
        color: "inherit",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        padding: "0 4px",
      },
      panel: {
        position: "fixed",
        zIndex: 10000,
        pointerEvents: "auto",
        boxSizing: "border-box",
        width: PANEL_WIDTH,
        display: "flex",
        flexDirection: "column",
        borderRadius: "var(--dsw-radius-lg, 12px)",
        border: "1px solid var(--dsw-alias-border-l1)",
        background: "var(--dsw-alias-bg-overlay)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.32)",
        fontSize: "var(--dsh-content-font-size, 14px)",
        color: "var(--dsw-alias-label-primary)",
        overflow: "hidden",
      },
      panelHeader: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 12px",
        borderBottom: "1px solid var(--dsw-alias-border-l1)",
        background: "var(--dsw-alias-bg-layer-1)",
      },
      panelTitle: {
        flex: 1,
        minWidth: 0,
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--dsw-alias-label-secondary)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
      iconBtn: {
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        borderRadius: "var(--dsw-radius-md, 8px)",
        border: "1px solid var(--dsw-alias-border-l2)",
        background: "transparent",
        color: "var(--dsw-alias-label-secondary)",
        fontSize: "14px",
        lineHeight: 1,
        cursor: "pointer",
        padding: 0,
      },
      body: {
        flex: 1,
        minHeight: 0,
        maxHeight: "42vh",
        overflowY: "auto",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      },
      quoteBox: {
        borderRadius: "var(--dsw-radius-md, 8px)",
        background: "var(--dsw-alias-bg-layer-2)",
        border: "1px solid var(--dsw-alias-border-l1)",
        padding: "6px 8px",
        fontSize: "13px",
        color: "var(--dsw-alias-label-secondary)",
        maxHeight: 84,
        overflowY: "auto",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
      },
      input: {
        boxSizing: "border-box",
        width: "100%",
        borderRadius: "var(--dsw-radius-md, 8px)",
        border: "1px solid var(--dsw-alias-border-l2)",
        background: "var(--dsw-alias-bg-base)",
        color: "var(--dsw-alias-label-primary)",
        fontSize: "13px",
        padding: "6px 8px",
        resize: "vertical",
        fontFamily: "inherit",
      },
      textarea: {
        boxSizing: "border-box",
        width: "100%",
        minHeight: 64,
        borderRadius: "var(--dsw-radius-md, 8px)",
        border: "1px solid var(--dsw-alias-border-l2)",
        background: "var(--dsw-alias-bg-base)",
        color: "var(--dsw-alias-label-primary)",
        fontSize: "13px",
        padding: "6px 8px",
        resize: "vertical",
        fontFamily: "inherit",
      },
      row: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        justifyContent: "flex-end",
      },
      primaryButton: {
        borderRadius: "var(--dsw-radius-md, 8px)",
        border: "none",
        background: "var(--dsw-alias-label-primary)",
        color: "var(--dsw-alias-bg-base)",
        fontSize: "13px",
        fontWeight: 600,
        padding: "5px 12px",
        cursor: "pointer",
      },
      ghostButton: {
        borderRadius: "var(--dsw-radius-md, 8px)",
        border: "1px solid var(--dsw-alias-border-l2)",
        background: "transparent",
        color: "var(--dsw-alias-label-secondary)",
        fontSize: "13px",
        padding: "5px 10px",
        cursor: "pointer",
      },
      error: {
        color: "var(--dsw-alias-state-error-primary)",
        fontSize: "12px",
      },
      empty: {
        color: "var(--dsw-alias-label-secondary)",
        fontSize: "13px",
        padding: "4px 0",
        lineHeight: 1.5,
      },
      note: {
        borderTop: "1px solid var(--dsw-alias-border-l1)",
        padding: "8px 0",
      },
      noteHead: {
        display: "flex",
        justifyContent: "space-between",
        gap: 8,
        alignItems: "flex-start",
      },
      noteQuote: {
        fontSize: "13px",
        color: "var(--dsw-alias-label-primary)",
        background: "var(--dsw-alias-bg-layer-2)",
        borderRadius: "var(--dsw-radius-md, 8px)",
        padding: "4px 8px",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        marginBottom: 4,
      },
      noteText: {
        fontSize: "13px",
        color: "var(--dsw-alias-label-secondary)",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
      },
      deleteButton: {
        flex: "none",
        borderRadius: "var(--dsw-radius-md, 8px)",
        border: "1px solid var(--dsw-alias-border-l2)",
        background: "transparent",
        color: "var(--dsw-alias-label-secondary)",
        fontSize: "12px",
        padding: "2px 8px",
        cursor: "pointer",
      },
      preview: {
        marginTop: 6,
        maxHeight: 170,
        overflowY: "auto",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        fontSize: "12px",
        lineHeight: 1.5,
        color: "var(--dsw-alias-label-secondary)",
        background: "var(--dsw-alias-bg-base)",
        border: "1px solid var(--dsw-alias-border-l1)",
        borderRadius: "var(--dsw-radius-md, 8px)",
        padding: "6px 8px",
        fontFamily: "inherit",
        margin: 0,
      },
    };

    function truncate(text, max) {
      return text.length > max ? text.slice(0, max) + "…" : text;
    }

    // Mirror the Host's renderContext() exactly, so the preview shows the same
    // text the model receives as injected context.
    function renderInjected(notes) {
      if (notes.length === 0) return "";
      const lines = notes.map((n, i) => {
        const quote = n.quote.length > 160 ? n.quote.slice(0, 160) + "…" : n.quote;
        return `${i + 1}. 文段：“${quote}”\n   备注：${n.note}`;
      });
      return "用户对以下文段添加了备注（这些是针对对话上下文的批注，请在修改时遵循）：\n" + lines.join("\n");
    }

    // Location prefix for a note made inside a previewed file.
    function noteLocation(n) {
      if (typeof n.filePath !== "string" || n.filePath === "") return "";
      return `文件《${n.filePath}》${typeof n.line === "number" ? `第 ${n.line} 行附近，` : ""}`;
    }

    // Draft text inserted into the composer when the user asks to place a note
    // there; it is ordinary user content the model then receives as a message.
    function formatNoteForInput(n) {
      const quote = n.quote.length > 80 ? n.quote.slice(0, 80) + "…" : n.quote;
      return `【文段备注】${noteLocation(n)}针对“${quote}”：${n.note}\n`;
    }

    // Compact inline chip label shown inside the composer instead of the full
    // note body (the full text rides in the chip's clipboard projection).
    function chipLabelForNote(n) {
      const text = n.note.length > 16 ? n.note.slice(0, 16) + "…" : n.note;
      return `备注：${text}`;
    }

    function clampPoint(x, y) {
      const pad = 10;
      const left = Math.min(Math.max(pad, x), Math.max(pad, window.innerWidth - PANEL_WIDTH - pad));
      const top = Math.min(Math.max(pad, y), Math.max(pad, window.innerHeight - 220));
      return { left, top };
    }

    function PassageAnnotationsPanel({ sessionId, insertIntoInput }) {
      const [notes, setNotes] = useState([]);
      const [selection, setSelection] = useState(null); // { text, x, y }
      const [anchor, setAnchor] = useState(null);       // { left, top } panel/pin anchor
      const [mode, setMode] = useState("hidden");        // hidden | compose | open | collapsed
      const [pendingQuote, setPendingQuote] = useState("");
      const [draft, setDraft] = useState("");
      const [busy, setBusy] = useState(false);
      const [error, setError] = useState("");
      const [previewOpen, setPreviewOpen] = useState(false);
      const [previewText, setPreviewText] = useState("");
      const [previewAttached, setPreviewAttached] = useState(null);
      const [previewLoading, setPreviewLoading] = useState(false);
      const textareaRef = useRef(null);
      const panelRef = useRef(null);

      const load = useCallback(async () => {
        try {
          const res = await fetch(`${ROUTE}?sessionId=${encodeURIComponent(sessionId)}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setNotes(data.notes ?? []);
        } catch (e) {
          setError(String(e?.message ?? e));
        }
      }, [sessionId]);

      const loadPreview = useCallback(async () => {
        setPreviewLoading(true);
        try {
          const res = await fetch(`${CONTEXT_ROUTE}?sessionId=${encodeURIComponent(sessionId)}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setPreviewText(typeof data.text === "string" ? data.text : "");
          setPreviewAttached(data.attached === true);
        } catch {
          setPreviewText("");
          setPreviewAttached(null);
        } finally {
          setPreviewLoading(false);
        }
      }, [sessionId]);

      useEffect(() => {
        setNotes([]);
        setSelection(null);
        setAnchor(null);
        setMode("hidden");
        setPendingQuote("");
        setDraft("");
        setError("");
        load();
      }, [load]);

      // Notes are one-shot (the Host clears them when the turn ends), so poll
      // while mounted to reflect the cleared state without a manual refresh.
      useEffect(() => {
        const timer = setInterval(() => {
          load();
          if (previewOpen) loadPreview();
        }, 3000);
        return () => clearInterval(timer);
      }, [load, previewOpen, loadPreview]);

      useEffect(() => {
        function inspectSelection() {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) { setSelection(null); return; }
          const text = sel.toString().trim();
          if (text === "") { setSelection(null); return; }
          const node = sel.anchorNode;
          const el = node && node.nodeType === 3 ? node.parentElement : node;
          if (el && el.closest('textarea, input, [contenteditable="true"]')) { setSelection(null); return; }
          // Ignore selections made inside our own panel.
          if (panelRef.current && el && panelRef.current.contains(el)) { setSelection(null); return; }
          let rect;
          try {
            rect = sel.getRangeAt(0).getBoundingClientRect();
          } catch {
            setSelection(null);
            return;
          }
          setSelection({ text, x: rect.left + rect.width / 2, y: rect.top });
        }
        document.addEventListener("mouseup", inspectSelection);
        document.addEventListener("selectionchange", inspectSelection);
        return () => {
          document.removeEventListener("mouseup", inspectSelection);
          document.removeEventListener("selectionchange", inspectSelection);
        };
      }, []);

      function beginCompose(quote) {
        setPendingQuote(quote);
        setDraft("");
        setError("");
        setMode("compose");
        setSelection(null);
        try { window.getSelection()?.removeAllRanges(); } catch { /* ignore */ }
        requestAnimationFrame(() => textareaRef.current?.focus());
      }

      function placeAtSelection() {
        if (selection) {
          setAnchor(clampPoint(selection.x, selection.y + 28));
        }
      }

      function openPanel() {
        if (!anchor) {
          setAnchor({ left: window.innerWidth - PANEL_WIDTH - 24, top: 72 });
        }
        setMode("open");
      }

      async function submit() {
        const quote = pendingQuote.trim();
        const note = draft.trim();
        if (!quote || !note) return;
        setBusy(true);
        setError("");
        try {
          const res = await fetch(`${ROUTE}?sessionId=${encodeURIComponent(sessionId)}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ sessionId, quote, note }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setNotes(data.notes ?? []);
          setPendingQuote("");
          setDraft("");
          setMode("collapsed");
          setPreviewOpen(false);
          const saved = Array.isArray(data.notes) ? data.notes[data.notes.length - 1] : undefined;
          if (saved !== undefined && typeof insertIntoInput === "function") {
            insertIntoInput(formatNoteForInput(saved), chipLabelForNote(saved));
          }
        } catch (e) {
          setError(String(e?.message ?? e));
        } finally {
          setBusy(false);
        }
      }

      async function remove(id) {
        setBusy(true);
        setError("");
        try {
          const res = await fetch(`${ROUTE}?sessionId=${encodeURIComponent(sessionId)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setNotes(data.notes ?? []);
        } catch (e) {
          setError(String(e?.message ?? e));
        } finally {
          setBusy(false);
        }
      }

      // Tooltip above the selection: visible only while text is selected and the
      // panel is not already composing in place.
      const tooltip = selection && mode !== "compose"
        ? h("button", {
            type: "button",
            style: { ...style.tooltip, left: selection.x, top: selection.y - 40 },
            onMouseDown: (e) => e.preventDefault(),
            onClick: () => {
              placeAtSelection();
              beginCompose(selection.text);
            },
          }, "＋ 备注")
        : null;

      const collapsed = mode === "collapsed" && anchor
        ? h("button", {
            type: "button",
            style: { ...style.pin, left: anchor.left, top: anchor.top },
            onMouseDown: (e) => e.preventDefault(),
            onClick: () => setMode("open"),
          },
          "备注",
          h("span", { style: style.pinBadge }, notes.length))
        : null;

      const panel = (mode === "compose" || mode === "open") && anchor
        ? h("div", { ref: panelRef, style: { ...style.panel, left: anchor.left, top: anchor.top } },
            h("div", { style: style.panelHeader },
              h("span", { style: style.panelTitle }, mode === "compose" ? "添加文段备注" : `文段备注（${notes.length}）`),
              h("button", { type: "button", style: style.iconBtn, title: "收起", onClick: () => setMode("collapsed") }, "−"),
              h("button", { type: "button", style: style.iconBtn, title: "关闭", onClick: () => { setMode("hidden"); setSelection(null); } }, "×"),
            ),
            h("div", { style: style.body },
              mode === "compose"
                ? h(React.Fragment, null,
                    pendingQuote
                      ? h("div", { style: style.quoteBox }, truncate(pendingQuote, 400))
                      : h("input", {
                          style: style.input,
                          placeholder: "粘贴或输入要备注的文段…",
                          value: pendingQuote,
                          onChange: (e) => setPendingQuote(e.target.value),
                        }),
                    h("textarea", {
                      ref: textareaRef,
                      style: style.textarea,
                      placeholder: "备注内容（Enter 直接放入输入框，Shift+Enter 换行）…",
                      value: draft,
                      onChange: (e) => setDraft(e.target.value),
                      onKeyDown: (e) => {
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          if (!busy && pendingQuote.trim() && draft.trim()) submit();
                        }
                      },
                    }),
                    error ? h("div", { style: style.error }, error) : null,
                    h("div", { style: style.row },
                      h("button", {
                        type: "button",
                        style: style.ghostButton,
                        onClick: () => { setMode("collapsed"); setPendingQuote(""); setDraft(""); },
                      }, "取消"),
                      h("button", {
                        type: "button",
                        style: style.primaryButton,
                        disabled: busy || !pendingQuote.trim() || !draft.trim(),
                        onClick: submit,
                      }, busy ? "保存中…" : "保存"),
                    ),
                  )
                : h(React.Fragment, null,
                    error ? h("div", { style: style.error }, error) : null,
                    h("div", { style: { ...style.row, justifyContent: "flex-start" } },
                      h("button", {
                        type: "button",
                        style: style.ghostButton,
                        disabled: busy,
                        onClick: () => beginCompose(""),
                      }, "＋ 添加备注"),
                    ),
                    notes.length === 0
                      ? h("div", { style: style.empty }, "在对话中选中一段文字，点击“＋ 备注”即可针对该文段添加备注。")
                      : notes.map((n) => h("div", { key: n.id, style: style.note },
                          h("div", { style: style.noteHead },
                            h("div", { style: { flex: 1, minWidth: 0 } },
                              n.filePath ? h("div", { style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary)", marginBottom: 4, overflowWrap: "anywhere" } }, `${n.filePath}${typeof n.line === "number" ? ` · 第 ${n.line} 行` : ""}`) : null,
                              h("div", { style: style.noteQuote }, truncate(n.quote, 200)),
                              h("div", { style: style.noteText }, n.note),
                            ),
                            h("button", {
                              type: "button",
                              style: style.deleteButton,
                              disabled: busy,
                              onClick: () => insertIntoInput(formatNoteForInput(n), chipLabelForNote(n)),
                            }, "放入输入框"),
                            h("button", {
                              type: "button",
                              style: style.deleteButton,
                              disabled: busy,
                              onClick: () => remove(n.id),
                            }, "删除"),
                          ),
                        )),
                    notes.length > 0
                      ? h("div", { style: { marginTop: 4 } },
                          h("button", {
                            type: "button",
                            style: style.ghostButton,
                            onClick: () => {
                              const next = !previewOpen;
                              setPreviewOpen(next);
                              if (next) loadPreview();
                            },
                          }, previewOpen ? "隐藏模型收到的内容" : "查看模型收到的内容"),
                          previewOpen
                            ? h(React.Fragment, null,
                                h("div", { style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary)", marginTop: 6 } },
                                  previewLoading
                                    ? "读取中…"
                                    : previewAttached === null
                                      ? "（离线预览，未能连接 Host）"
                                      : previewAttached
                                        ? "已挂载到当前会话 ✓"
                                        : "未挂载到当前会话 ✗"),
                                h("pre", { style: style.preview }, previewLoading ? "读取中…" : (previewText || renderInjected(notes) || "（暂无备注）")),
                              )
                            : null,
                        )
                      : null,
                  ),
            ),
          )
        : null;

      return h(React.Fragment, null, tooltip, collapsed, panel);
    }

    function PassageAnnotationsOverlay({ useSessions, insertIntoInput }) {
      const sessionId = useSessions((state) => {
        return Object.values(state.byId).find((session) => (session.retainedBy.mainView ?? 0) > 0)?.id;
      });
      if (!sessionId) return null;
      return h(PassageAnnotationsPanel, {
        sessionId,
        insertIntoInput: (text, label) => insertIntoInput(sessionId, text, label),
      });
    }

    // Session-scoped bridge: captures the composer's `inputActions` so the
    // frame-level overlay can write into the resident draft.
    const inputBridge = new Map();

    function PassageAnnotationsInputBridge({ sessionId, inputActions }) {
      useEffect(() => {
        if (!sessionId || !inputActions) return undefined;
        inputBridge.set(sessionId, inputActions);
        return () => {
          if (inputBridge.get(sessionId) === inputActions) inputBridge.delete(sessionId);
        };
      }, [sessionId, inputActions]);
      return null;
    }

    // Header button on a previewed file: annotates the selected passage and
    // records the file's absolute path plus the located source line.
    function FileAnnotationButton({ sessionId, absolutePath, readFileText }) {
      const [open, setOpen] = useState(false);
      const [quote, setQuote] = useState("");
      const [note, setNote] = useState("");
      const [busy, setBusy] = useState(false);
      const [error, setError] = useState("");
      const [anchor, setAnchor] = useState({ left: 8, top: 8 });
      const btnRef = useRef(null);
      const taRef = useRef(null);
      const path = typeof absolutePath === "string" ? absolutePath : "";
      if (path === "") return null;

      function openCompose() {
        const sel = window.getSelection();
        setQuote(sel ? sel.toString().trim() : "");
        setNote("");
        setError("");
        const rect = btnRef.current?.getBoundingClientRect();
        const left = rect === undefined ? 8 : Math.max(8, Math.min(rect.left, window.innerWidth - 340));
        const top = rect === undefined ? 8 : rect.bottom + 6;
        setAnchor({ left, top });
        setOpen(true);
        requestAnimationFrame(() => taRef.current?.focus());
      }

      async function save() {
        const q = quote.trim();
        const n = note.trim();
        if (!q || !n) return;
        setBusy(true);
        setError("");
        try {
          let line;
          try {
            const text = await readFileText(sessionId, path);
            if (typeof text === "string" && text !== "") {
              const idx = text.indexOf(q);
              if (idx >= 0) line = text.slice(0, idx).split("\n").length;
            }
          } catch {
            // position is best-effort
          }
          const res = await fetch(`${ROUTE}?sessionId=${encodeURIComponent(sessionId)}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ sessionId, quote: q, note: n, filePath: path, line }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          setOpen(false);
          setQuote("");
          setNote("");
        } catch (e) {
          setError(String(e?.message ?? e));
        } finally {
          setBusy(false);
        }
      }

      const button = h("button", {
        ref: btnRef,
        type: "button",
        style: style.ghostButton,
        title: `针对当前文件的文段备注：${path}`,
        onMouseDown: (e) => e.preventDefault(),
        onClick: openCompose,
      }, "＋ 备注");

      if (!open) return button;

      const popover = h("div", {
        style: {
          position: "fixed",
          left: anchor.left,
          top: anchor.top,
          zIndex: 10000,
          width: 320,
          boxSizing: "border-box",
          background: "var(--dsw-alias-bg-overlay)",
          border: "1px solid var(--dsw-alias-border-l1)",
          borderRadius: "var(--dsw-radius-lg, 12px)",
          boxShadow: "0 12px 36px rgba(0,0,0,0.32)",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        },
      },
        h("div", { style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary)", overflowWrap: "anywhere" } }, path),
        h("textarea", {
          ref: taRef,
          style: style.textarea,
          placeholder: "选中的文段（可编辑）…",
          value: quote,
          onChange: (e) => setQuote(e.target.value),
        }),
        h("textarea", {
          style: style.textarea,
          placeholder: "备注内容…",
          value: note,
          onChange: (e) => setNote(e.target.value),
        }),
        error ? h("div", { style: style.error }, error) : null,
        h("div", { style: { ...style.row, justifyContent: "flex-end" } },
          h("button", { type: "button", style: style.ghostButton, onClick: () => setOpen(false) }, "取消"),
          h("button", {
            type: "button",
            style: style.primaryButton,
            disabled: busy || !quote.trim() || !note.trim(),
            onClick: save,
          }, busy ? "保存中…" : "保存"),
        ),
      );

      return h(React.Fragment, null, button, popover);
    }

    return {
      inject: ["slots", "sessions", "inputTriggers", "remote", "remote.workspaceFiles"],
      apply(ctx) {
        // Register a serializer for the custom chip source. Without a codec the
        // composer raises "no serializer for reference source" when it
        // serializes the draft. Empty candidates keep it out of the @ menu.
        const inputTriggers = ctx.get("inputTriggers");
        if (inputTriggers !== undefined) {
          ctx.effect(() => inputTriggers.registerSource({
            trigger: "@",
            name: "passage-annotation",
            showGroupTitle: false,
            candidates: async () => [],
            header: () => undefined,
            onPick: () => undefined,
            openReference: () => false,
            codec: {
              clipboardText: (ref) => ref,
              serialize: (ref) => Promise.resolve(ref),
            },
          }), "passage-annotations: reference source");
        }
        // Insert a compact inline reference chip into the composer. The chip
        // shows a short label; its clipboard projection carries the full note so
        // a sent message stays self-contained without bloating the draft.
        const insertIntoInput = (sessionId, text, label) => {
          const actions = inputBridge.get(sessionId);
          if (actions === undefined) return false;
          let span;
          try {
            span = actions.captureInsertion();
          } catch {
            return false;
          }
          const binding = typeof ctx.sessions.binding === "function"
            ? ctx.sessions.binding(sessionId)
            : undefined;
          const actx = binding?.ctx;
          if (actx !== undefined && typeof actx.emit === "function") {
            try {
              actx.emit("slash/input-insert-reference", {
                reference: {
                  source: "passage-annotation",
                  ref: text,
                  label: label ?? "文段备注",
                  clipboardText: text,
                },
                span,
              });
              return true;
            } catch {
              // fall through to a plain-text insertion
            }
          }
          try {
            return actions.insertText(text, actions.captureInsertion()) !== false;
          } catch {
            return false;
          }
        };
        ctx.slots.inject("shell.overlay", () => ctx.slots.register({
          name: "shell.overlay", id: "passage-annotations", order: 0,
        }, (props) => h(PassageAnnotationsOverlay, { ...props, insertIntoInput })));
        ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
          name: "conversation.input.dock", id: "passage-annotations-bridge", order: 999,
        }, PassageAnnotationsInputBridge));
        // Read the previewed file so a file note can carry its source line.
        const readFileText = async (sessionId, path) => {
          if (ctx.remote === undefined || ctx.remote.workspaceFiles === undefined) return "";
          const res = await ctx.remote.workspaceFiles.read(
            sessionId,
            path,
            { offset: 0, limit: 4000 },
            new AbortController().signal,
          );
          if (res !== undefined && res.ok === true && res.value !== undefined && typeof res.value.text === "string") {
            return res.value.text;
          }
          return "";
        };
        ctx.slots.inject("sidebar.right.tab.document.actions", () => ctx.slots.register({
          name: "sidebar.right.tab.document.actions", id: "passage-annotations-file", order: 5,
        }, (props) => h(FileAnnotationButton, { ...props, readFileText })));
      },
    };
  },
});
