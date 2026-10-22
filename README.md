# dsh-passage-annotations

给 **DeepSeek Harness** Web UI 用的「文段备注」插件：在对话或文件预览中选中一段文字，给它写一条备注；模型在该会话后续每一步请求中都会看到这些备注，并可据此修改。

## 功能

- **对话内备注**：选中文字 → 浮出「＋ 备注」→ 保存。备注会以紧凑的内联 chip 放入输入框（发送时才展开为正文），同时作为上下文注入模型。
- **文件预览备注**：打开 Markdown / 代码 / 纯文本预览时，预览头部出现「＋ 备注」按钮；保存时自动记录**文件绝对路径**与**源码行号**（启发式）。
- **按会话隔离**：备注只对当前会话的模型可见。
- **一次性**：一轮对话结束（`turn/end`）后自动清空，不会跨轮累积。
- **可验证**：面板里可展开「查看模型收到的内容」，直接看到注入给模型的全文与是否已挂载。
- **可收起**：备注面板锚定在选中文段旁，保存后收起为「备注 N」小气泡。

## 安装

要求：DeepSeek Harness 的 **Web profile**。已在 `0.2.1-rc.2` 上验证。

### 本机目录方式（推荐）

1. 把本目录放到任意位置。
2. 在 Harness 中让 agent 执行 `plugin_manager install_bundle`，`target` 指向本目录的**绝对路径**；
   或在 Plugins 页面安装本地包。
3. 安装后 profile 的 `package.json` 会增加一条 `link:` 依赖，`dsh.profile.bundles` 增加本包。

### npm 方式（发布后）

```bash
# 在 Harness 中让 agent 执行：
plugin_manager install_bundle target=@<your-scope>/dsh-passage-annotations@1.0.0
```

## 数据

备注保存在 `$DSH_HOME/storages/passage_annotations.json`（Harness 的 JSON 存储后端）。

## 兼容性

插件使用 DSH 的 Client Slot、`inputTriggers`、`sidebarRight`、`workspaceFiles` 等接口，
这些接口随 DSH 版本可能变化；升级 DSH 后请重新验证。

## 已知限制

- **文件行号是启发式**：按引文在文件前 4000 行中首次出现的位置推断。Markdown 渲染文本与源码不完全一致（加粗、链接、表格）时可能偏差或缺失。
- **PDF / Word / PPT / HTML** 预览不保证能映射到源码行。
- 备注不写入会话日志，只作为运行时上下文注入 + 输入框 chip；不会出现在对话历史里。
- 对话里的备注不区分文件；文件备注请用预览头部的按钮。

## 开源

MIT License（见 `LICENSE`）。

发布前建议：
1. 把 `package.json` 的 `name` 改成你自己的 scope，例如 `@your-name/dsh-passage-annotations`。
2. 补充 `repository`、`author`、`homepage` 字段。
3. 若要发布 npm，确认 `private` 已移除（当前未设置）。
