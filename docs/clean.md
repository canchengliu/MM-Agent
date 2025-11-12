好的，我将扮演一名前端架构师的角色，在将 `deer-flow` 项目改造为 O-Award 建模平台之前，进行一次彻底的分析和清理规划。

我的核心任务是**识别并移除那些与新项目需求完全无关、没有复用或参考价值的代码资产**，同时保留所有可用于加速新平台开发的基础设施、组件和模式。本次操作仅涉及清理，不包含任何重构工作。

---

## 清理分析与执行计划

经过对 O-Award 平台的 `<design_doc>`、`<api>` 规范与 `deer-flow` 的 `<front_stack>` 和 `<deer_flow_frontend_code>` 的深入比对分析，我制定了以下清理计划。

**核心分析结论：**

1.  **技术栈高度匹配**：`deer-flow` 使用的现代技术栈（Next.js App Router, Tailwind, Shadcn/ui, Zustand, Framer Motion, Tiptap/Novel）与 O-Award 平台新架构 (`<architecture>`) 的要求完全一致。因此，项目的**技术基础设施、核心库、UI 组件库和大部分工具函数都具有极高的复用价值**。
2.  **业务逻辑完全不同**：`deer-flow` 是一个**对话式、流式响应的 AI 研究应用**，其核心是聊天界面、多智能体协作和报告生成。而 O-Award 是一个**结构化、状态驱动的建模工作流平台**，核心是项目、工作流、节点、版本和人机交互（HITL）。二者的领域模型、用户交互范式和核心业务流程截然不同。
3.  **清理策略**：清理的重点应聚焦于**移除 `deer-flow` 特有的业务逻辑和围绕“聊天”范式构建的 UI 组件**，保留其通用的、与业务无关的底层能力。

---

### A. 待清理（删除）的文件与文件夹

以下资产与 O-Award 平台的需求在概念上完全不符，不具备直接复用或重构的价值，应予以删除。

| 路径 | 类型 | 清理理由 |
| :--- | :--- | :--- |
| `src/app/page.tsx` | 页面 | Deer-Flow 的落地页入口。O-Award 平台将以项目仪表盘 (`/projects`) 作为主入口。 |
| `src/app/landing/` | 文件夹 | **整个目录删除**。包含 Deer-Flow 的产品介绍、案例研究、多智能体可视化等，与 O-Award 的功能和品牌完全无关。 |
| `src/app/chat/` | 文件夹 | **整个目录删除**。这是 Deer-Flow 的核心功能——聊天界面。其所有组件和布局（消息列表、输入框、研究面板）都是为对话式交互设计的，无法适应 O-Award 的“驾驶舱”式三栏布局和基于节点的工作流。 |
| `src/app/settings/tabs/general-tab.tsx` | 组件 | Deer-Flow 的通用设置（如自动接受计划、最大澄清轮次）与 O-Award 的设置（HITL Profile、思考深度）完全不同。保留其表单实现模式（React Hook Form + Zod），但该文件本身应删除重建。 |
| `src/app/settings/tabs/mcp-tab.tsx` | 组件 | MCP (Model Context Protocol) 是 Deer-Flow 特有的工具扩展协议，在 O-Award 的设计中没有对应概念。 |
| `src/app/settings/tabs/about-*.md` & `about-tab.tsx` | 组件 & 文件 | 项目的“关于”页面，内容特定于 Deer-Flow。 |
| `src/components/deer-flow/link.tsx` | 组件 | 自定义链接组件，包含检查链接是否在“研究结果”中出现过的业务逻辑，对 O-Award 无用。 |
| `src/components/deer-flow/message-input.tsx` | 组件 | 为聊天场景高度定制的富文本输入框，集成了 `@mention` RAG 功能。O-Award 需要的是更通用的编辑器（用于人工编辑）和输入控件，而非聊天输入框。 |
| `src/components/deer-flow/report-style-dialog.tsx` | 组件 | 用于选择 Deer-Flow 的报告风格，该概念在 O-Award 中不存在。 |
| `src/components/deer-flow/resource-suggestion.tsx` & `resource-mentions.tsx` | 组件 | 与 `@mention` RAG 功能强绑定的 UI 组件，不适用于新平台。 |
| `src/core/api/chat.ts`, `podcast.ts`, `prompt-enhancer.ts`, `rag.ts`, `hooks.ts`, `mcp.ts` | 文件 | 这些是调用 Deer-Flow 特定后端服务的客户端。O-Award 有一套全新的 API 规范。 |
| `src/core/config/` | 文件夹 | Deer-Flow 的后端配置类型定义，与 O-Award 无关。 |
| `src/core/mcp/` | 文件夹 | MCP 相关的核心逻辑和类型定义。 |
| `src/core/messages/` | 文件夹 | 定义了 Deer-Flow 的核心数据模型（`Message`, `ToolCallRuntime`）。O-Award 的核心模型是 `Project`, `WorkflowInstance`, `NodeInstance`, `NodeVersion` 等，完全不同。 |
| `src/core/replay/` | 文件夹 | Deer-Flow 用于演示的“录制回放”功能，在新平台中无此需求。 |
| `src/core/store/store.ts` | 文件 | **核心清理项**。这是 Deer-Flow 的主 Zustand store，管理着整个聊天会话的状态。其内部逻辑（`sendMessage`, 消息合并等）与流式对话强绑定，对于 O-Award 基于工作流和节点的状态管理模型，没有参考价值。需要根据新架构重新设计 Store。 |

---

### B. 需保留的核心资产及理由

以下资产是构建 O-Award 平台的宝贵基础，应予以保留。它们构成了项目的技术底座和可复用的组件库。

| 路径 | 类型 | 保留理由 |
| :--- | :--- | :--- |
| `src/` (根目录文件) | `env.js`, `i18n.ts` | **基础配置**。类型安全的环境变量和国际化设置是任何健壮应用的基础。 |
| `src/app/layout.tsx` | 布局 | **应用根布局**。提供了字体、主题、全局 Provider 的基础设置，是新平台的起点。 |
| `src/app/settings/` (部分) | 文件夹 | **设置模块框架**。`dialogs/settings-dialog.tsx` 提供了设置对话框的完整框架，其标签页切换模式 (`tabs/index.tsx`) 可直接复用。只需替换掉无效的标签页内容即可。 |
| `src/components/ui/` | 文件夹 | **UI 基础**。完整的 Shadcn/ui 组件库，是实现 O-Award "精密未来主义"美学的基石。 |
| `src/components/magicui/` | 文件夹 | **视觉特效**。提供了如 `BorderBeam` 等高级视觉效果组件，非常适合用于实现 O-Award 设计文档中描述的动态光效和加载指示。 |
| `src/components/editor/` | 文件夹 | **核心功能资产**。一个功能完备、深度定制的 Tiptap/Novel 富文本编辑器，支持 Markdown 和 LaTeX。这是实现 O-Award **人工编辑（FRS 4.1）** 功能的关键，可直接复用。 |
| `src/components/deer-flow/` (大部分) | 文件夹 | **通用应用组件**。包含大量与业务逻辑解耦的高质量组件，如 `markdown.tsx` (Markdown/LaTeX 渲染), `loading-animation.tsx`, `scroll-container.tsx`, `theme-toggle.tsx`, `toaster.tsx`, `tooltip.tsx` 等。这些是构建新平台 UI 的现成积木。 |
| `src/core/api/` (部分) | 文件夹 | **API 架构模式**。保留 `resolve-service-url.ts` 作为统一的 API 地址解析工具。可以清空其他文件，但保留该目录作为新 API 服务层的存放位置。 |
| `src/core/markdown/` & `src/core/rehype/` | 文件夹 | **内容渲染能力**。提供了处理 Markdown 和 LaTeX 的底层能力，这对于在 O-Award 中清晰展示数学公式和格式化文本至关重要。 |
| `src/core/sse/` | 文件夹 | **流式通信工具**。`fetch-stream.ts` 是一个健壮的 SSE 客户端实现。虽然 O-Award 主要使用 WebSocket，但保留这个工具以备不时之需（如处理流式日志下载等）是有价值的。 |
| `src/core/store/settings-store.ts` | 文件 | **持久化状态管理模式**。提供了将 Zustand store 与 `localStorage` 同步的完美范例。其内部 state 可以被替换，但文件本身的架构和 `load/save` 逻辑可直接用于 O-Award 的用户设置持久化。 |
| `src/core/utils/` | 文件夹 | **通用工具函数**。提供了如 `best-effort-json-parser` (处理 LLM 可能返回的不规范 JSON)、防抖、深拷贝等大量实用的工具函数。 |
| `src/hooks/`, `src/lib/`, `src/styles/`, `src/typings/` | 文件夹 | **项目基础设施**。包含了通用 Hooks、Tailwind `cn` 工具函数、全局样式与主题变量、以及类型定义。这些都是项目能正常运行和高效开发的基础。 |

---

### 执行摘要

清理工作将移除约占 `deer-flow` 应用层代码 70-80% 的内容，主要集中在 `src/app/chat`, `src/app/landing`, `src/core/messages`, `src/core/store/store.ts` 等与聊天业务强绑定的模块。

清理后，项目将保留一个坚实的技术骨架，包含：
1.  **一个配置完整的 Next.js 应用框架。**
2.  **一套与设计系统匹配的、功能齐全的 UI 组件库 (Shadcn/ui)。**
3.  **一个强大的富文本与 Markdown/LaTeX 编辑和渲染引擎 (Tiptap/Novel)。**
4.  **一套成熟的状态管理、主题切换、国际化和持久化方案。**
5.  **大量高质量的通用组件和工具函数。**

这个经过清理的项目版本将是一个理想的“启动模板”，让开发团队可以立即开始构建 O-Award 平台的核心功能，而无需从零搭建基础设施，从而极大地提高开发效率。