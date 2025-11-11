--- (49-49 lines) ---
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |


--- (64-81 lines) ---

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Novel** | 基于 Tiptap 构建的所见即所得（WYSIWYG）富文本编辑器，用于报告编辑功能。 |
| **Tiptap** | 作为 Novel 的核心，是一个无头（Headless）、可扩展的富文本编辑器框架。 |
| **ProseMirror** | Tiptap 底层的核心工具库，提供了编辑器状态管理、视图和事务模型。 |
| **tiptap-markdown** | Tiptap 的扩展，用于在 Markdown 和 Tiptap 的 JSON 格式之间进行双向转换。 |
| **Tiptap 扩展集** | 使用了一系列扩展来增强编辑器功能，包括 `StarterKit`, `Placeholder`, `Link`, `Image`, `TaskList`, `Table`, `CodeBlockLowlight`, `TextStyle`, `Color`, `Highlight`, `Mathematics` 等。 |
| **`MathematicsWithMarkdown`** | 在 `components/editor/math-serializer.ts` 中自定义的 Tiptap 扩展，增强了对 KaTeX 数学公式的 Markdown 序列化支持。 |
| **React Markdown** | 用于在非编辑区域（如聊天消息）安全地渲染 Markdown 内容。 |
| **Remark / Rehype** | Markdown AST (抽象语法树) 生态系统，用于处理和转换 Markdown。 |
| | ↳ `remark-gfm` | 支持 GitHub Flavored Markdown (表格、删除线等)。 |
| | ↳ `remark-math` | 支持 Markdown 中的数学公式语法。 |
| | ↳ `rehype-katex` | 将数学公式 AST 渲染为 HTML。 |
| | ↳ **`unist-util-visit`** | 用于遍历和操作 AST 的核心工具，是编写自定义 Rehype 插件的基础。 |
| **KaTeX** | 用于在 Web 上高性能地排版和渲染数学公式。 |
| **react-syntax-highlighter** | 用于在 `research-activities-block` 中对 Python 代码进行语法高亮。 |
| **lowlight / highlight.js** | 作为 `CodeBlockLowlight` 扩展和 `react-syntax-highlighter` 的底层引擎，提供代码语法高亮能力。 |


--- (142-142 lines) ---
| **`InputBox`** | 一个功能完备的聊天输入框组件。它封装了：<br>- **富文本输入**: 基于 Tiptap/Novel，支持 `@mention` 等功能。<br>- **异步操作**: 内置“增强提示” (`Enhance Prompt`) 功能，包含加载和动画状态。<br>- **状态同步**: 通过 `useRef` 和 `useImperativeHandle` 暴露 `submit`, `setContent` 等方法，供父组件调用。<br>- **动态 UI**: 使用 `AnimatePresence` 展示用户反馈提示，并带有精美的动画效果。 |


--- (169-169 lines) ---
| **Markdown 预处理** | `core/utils/markdown.ts` 提供了一系列用于清理和规范化 Markdown 文本的函数，特别是 `normalizeMathForEditor` 和 `unescapeLatexInMath`，它们解决了在富文本编辑器中正确处理 LaTeX 数学公式的痛点。 |


--- (219-227 lines) ---
### 十vii、 高级编辑器 (Tiptap/Novel) 定制

项目对 Novel 编辑器进行了深度定制，这些定制方案可以直接复用。

| 定制/模式 | 描述与复用价值 |
| :--- | :--- |
| **自定义 Markdown 序列化器** | `components/editor/math-serializer.ts` 文件展示了如何扩展 Tiptap 的现有插件。通过 `.extend()` 方法为 `Mathematics` 插件添加了自定义的 `markdown.serialize` 逻辑，确保数学公式能够被正确地转换回 `$...$` 和 `$$...$$` 格式的 Markdown。这是扩展 Tiptap 功能的核心模式。 |
| **斜杠命令 (Slash Command) 实现** | `components/editor/slash-command.tsx` 提供了一个完整的斜杠命令实现范例。它定义了一个 `suggestionItems` 数组，每个对象包含命令的标题、图标和执行逻辑，然后通过 `Command.configure` 集成到编辑器中。这套代码几乎可以原封不动地移植到任何 Tiptap 项目中。 |
| **异步 `@mention` 建议系统** | `components/deer-flow/resource-suggestion.tsx` 是一个非常高级的模式。它配置了 Tiptap 的 `Mention` 插件，使其 `items` 属性成为一个异步函数，该函数通过 `fetch` 动态查询 RAG 资源。同时，它使用 `ReactRenderer` 和 `Tippy.js` 来渲染自定义的浮动建议列表 (`ResourceMentions` 组件)。这为实现任何需要异步数据源的编辑器建议功能提供了完美的蓝图。 |


--- (269-269 lines) ---
| **安全性** | **防范 XSS 攻击**: 渲染用户生成或来自 API 的内容时，项目始终使用 `react-markdown` (`Markdown` 组件) 或通过 Tiptap 的安全机制进行渲染，而不是直接使用 `dangerouslySetInnerHTML`。<br>**安全处理用户输入**: `components/editor/index.tsx` 中的富文本编辑器在处理粘贴内容时，通过 `handleImagePaste` 和 `transformPastedHTML` 等逻辑对输入进行过滤和转换，防止粘贴恶意的 HTML 代码。<br>**安全的外部链接**: 在所有 `target="_blank"` 的链接中，都添加了 `rel="noopener noreferrer"`，防止了潜在的 "tabnabbing" 漏洞。 |
