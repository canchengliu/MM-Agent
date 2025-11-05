## 清理计划：将 DeerFlow 改造为“时空知识工作站”

### 1. 核心战略分析

在深入文件细节之前，我们首先从概念层面比较现有项目 (`deer-flow`) 与目标项目 (`design_doc`) 的核心差异，以确立清理的宏观原则。

*   **现有项目 (`deer-flow`)**:
    *   **核心范式**: **线性对话式 AI 研究助手**。其 UI 和状态管理完全围绕一个单线程的、持续进行的对话流（`MessageList`）以及与之关联的“研究”过程。
    *   **用户入口**: Landing Page (营销/介绍页) -> Chat (核心应用)。
    *   **数据模型**: 以 `Message` 为核心，串联起用户输入、AI 思考、工具调用和最终报告。

*   **目标项目 (`design_doc`)**:
    *   **核心范式**: **非线性、项目制的建模工作站**。其核心是“项目工作区”，具有明确的“执行视图”（线性步骤）和“历史视图”（图状、可分支）。对话的概念被结构化的人机协同（HITL）交互点取代。
    *   **用户入口**: 认证 (登录/注册) -> Dashboard (项目列表) -> Project Workspace (核心应用)。
    *   **数据模型**: 以 `Project`, `ExecutionTrace`, `StateSnapshot` 为核心，构建一个支持版本控制和溯源的有向无环图（DAG）。

**清理原则**:
1.  **保留地基**: 完整保留与“动态信息几何学”美学愿景高度一致的技术栈和设计系统基础（`Shadcn/ui`, `Magic UI`, `Tailwind CSS`, `Framer Motion`, `Geist` 字体）。
2.  **移除旧范式**: 彻底移除所有与“线性对话”和“黑盒研究”范式强绑定的布局、组件、状态管理和 API 调用。
3.  **保留工具**: 保留所有通用的、与具体业务逻辑解耦的 UI 组件（如 `Tooltip`, `Dialog`, `Markdown` 渲染器）和编辑器（`Novel/Tiptap`）。
4.  **明确意图**: 清理的目标是消除歧义。宁可删除一个可能“有点用”但与新概念冲突的组件，也不要保留它给 Coding Agent 带来困惑。

### 2. 详细文件清理计划

以下是按文件结构组织的具体清理指令和理由。

---

#### `src/` (项目根目录)

*   `env.js`: **保留**
    *   **理由**: 环境变量管理是项目基础。后续需要根据新后端 API 和认证需求进行调整，但文件结构本身是必要的。
*   `i18n.ts`: **保留**
    *   **理由**: 国际化是项目的重要部分。`next-intl` 的配置是标准实践，可直接复用。

---

#### `src/app/` (应用路由)

*   `layout.tsx`: **保留**
    *   **理由**: 这是应用的根布局。它正确地设置了 HTML 结构、字体 (`Geist`)、`ThemeProvider` 和 `Toaster`，是新应用的完美起点。
*   `page.tsx` (当前的主页/Landing Page): **删除**
    *   **理由**: 这是 `deer-flow` 的营销登陆页面。新应用的主入口将是 `/dashboard` (项目仪表盘) 或 `/login` (登录页)。所有相关的营销内容和布局都与新应用作为“工具”的定位完全无关。

---

#### `src/app/chat/` (核心对话应用)

**整个 `/chat` 目录应被彻底重构。清理计划如下：**

*   `main.tsx`: **删除**
    *   **理由**: 此文件定义了 `MessagesBlock` 和 `ResearchBlock` 的双栏布局，这是旧的“对话+研究”核心范式。新应用的核心是 `Project Workspace` 的多面板布局，此文件逻辑完全不可复用。
*   `page.tsx`: **删除**
    *   **理由**: 这是聊天页面的外壳，包含了旧的 `SiteHeader`。新应用的 `Project Workspace` 将拥有全新的、符合 `design_doc` 规范的头部。

---

#### `src/app/chat/components/`

*   `conversation-starter.tsx`: **删除**
    *   **理由**: 用于在空对话开始时提供引导问题。新应用没有“空对话”的概念，起点是项目仪表盘。
*   `input-box.tsx`: **删除**
    *   **理由**: 这是为发送聊天消息而设计的复杂组件。虽然 UI 精美，但其核心逻辑（发送消息、增强提示、深度思考开关）与新应用的“结构化HITL交互”完全不同。保留它会造成巨大困惑。后续开发中，其部分 UI 元素（如按钮、Tooltip）可以借鉴，但作为一个整体组件，它必须被移除。
*   `message-list-view.tsx`: **删除**
    *   **理由**: `deer-flow` 应用的核心，用于渲染线性消息流。新应用没有这个概念。其核心将被“执行视图”的步骤列表和“历史视图”的图谱所取代。
*   `messages-block.tsx`: **删除**
    *   **理由**: 包含 `MessageListView` 和 `InputBox` 的容器，是旧范式的直接体现。
*   `research-activities-block.tsx`: **删除**
    *   **理由**: 用于展示“研究”过程中的工具调用。新应用的“历史溯源与探索器”将以一种更结构化、更可视化的方式（图谱节点）来展示工作流的每一步，此组件的线性列表展示方式已过时。
*   `research-block.tsx`: **删除**
    *   **理由**: 包含“研究活动”和“研究报告”的容器，与旧的 `Research` 概念强绑定。
*   `research-report-block.tsx`: **删除**
    *   **理由**: 虽然新应用也产出报告，但此组件与旧的 `Message` 数据模型和线性流程绑定。新应用的报告产出将在“阶段三”的富文本编辑器中进行，并具有完整的溯源能力。保留此组件会与 `components/editor` 的功能产生混淆。
*   `site-header.tsx`: **删除**
    *   **理由**: 这是 Landing Page 的页头。新应用将有 `Global Navigation Bar` 和 `Workspace Header`，设计完全不同。
*   `welcome.tsx`: **删除**
    *   **理由**: 用于展示欢迎语，是对话开始前的一部分，在新应用中无对应场景。

---

#### `src/app/landing/`

*   **整个 `/landing` 目录**: **删除**
    *   **理由**: 包含 `deer-flow` 的所有营销/介绍页面组件和逻辑。如前所述，新应用是一个功能性工具，不再需要这些页面。删除整个目录可以极大地减少无关代码。

---

#### `src/app/settings/`

*   `dialogs/add-mcp-server-dialog.tsx`: **删除**
    *   **理由**: MCP (Model Context Protocol) 是 `deer-flow` 的一个特定功能，在新的 `design_doc` 中没有提及。为保持专注，应移除此特定于旧功能的配置项。
*   `dialogs/settings-dialog.tsx`: **保留**
    *   **理由**: 提供了一个优秀的设置对话框框架，包括 `Dialog` 容器和 `Tabs` 结构。这完全符合 `design_doc` 中对设置页面的描述。后续只需修改 `SETTINGS_TABS` 的内容即可。
*   `tabs/about-tab.tsx`, `about-en.md`, `about-zh.md`: **保留并待修改**
    *   **理由**: “关于”页面是标准功能。内容需要更新，但文件结构和 Markdown 渲染机制可复用。
*   `tabs/general-tab.tsx`: **删除**
    *   **理由**: 包含的设置（如自动接受计划、澄清轮次）与 `deer-flow` 的 Planner Agent 强相关，在新应用的工作流引擎配置中不存在。新的设置页将包含 `账户`、`界面`、`工作流引擎` 三个标签页，内容完全不同。
*   `tabs/mcp-tab.tsx`: **删除**
    *   **理由**: 同 `add-mcp-server-dialog.tsx`，MCP 功能不再需要。
*   `tabs/index.tsx`: **保留并修改**
    *   **理由**: 这是组织设置标签页的入口文件。需要保留，但其导入的 `tab` 组件将全部替换为新应用所需的。
*   `tabs/types.ts`: **保留**
    *   **理由**: 定义了 `Tab` 的类型，是可复用的结构。

---

#### `src/components/`

*   `theme-provider.tsx`: **保留**
    *   **理由**: `next-themes` 的标准封装，必不可少。

---

#### `src/components/deer-flow/` (自定义组件库)

*   **保留以下通用组件**:
    *   `fav-icon.tsx`, `image.tsx`, `language-switcher.tsx`, `link.tsx`, `loading-animation.tsx`, `logo.tsx`, `markdown.tsx`, `rainbow-text.tsx`, `rolling-text.tsx`, `scroll-container.tsx`, `theme-provider-wrapper.tsx`, `theme-toggle.tsx`, `toaster.tsx`, `tooltip.tsx`
    *   **理由**: 这些是与业务逻辑解耦的、纯粹的 UI 展示或工具性组件，完全符合新设计系统的要求，可直接复用。
*   **删除以下特定功能组件**:
    *   `message-input.tsx`: **删除** (理由见上文)。
    *   `report-style-dialog.tsx`: **删除**。这是旧 `InputBox` 的一部分，新应用的工作流配置将在设置页完成。
    *   `resource-mentions.tsx`, `resource-suggestion.tsx`: **删除**。与旧的 RAG 和消息输入框强绑定，新应用中文件和数据源的管理方式不同。

---

#### `src/components/editor/`

*   **整个 `/editor` 目录**: **保留**
    *   **理由**: 一个功能完备、基于 `Novel/Tiptap` 的富文本编辑器。这对于实现 `design_doc` 中“阶段三：论文锻造”至关重要，是项目中最有价值的可复用资产之一。

---

#### `src/components/magicui/` & `src/components/ui/`

*   **整个 `/magicui` 和 `/ui` 目录**: **保留**
    *   **理由**: 这是项目的核心设计系统实现，`design_doc` 明确要求使用 `Shadcn/ui` 和 `Magic UI` 的组件。这是新应用 UI 的基石。

---

#### `src/core/` (核心逻辑)

*   `api/chat.ts`, `api/podcast.ts`, `api/prompt-enhancer.ts`: **删除**
    *   **理由**: 这些 API 客户端完全服务于旧功能。新应用需要一套全新的、基于 `api.md` 规范的 API 客户端。
*   `api/hooks.ts`: **删除**
    *   **理由**: `useReplayMetadata` 和 `useConfig` 均服务于旧的 `deer-flow` 逻辑。
*   `api/mcp.ts`, `api/rag.ts`: **删除**
    *   **理由**: 同上，功能不再需要。
*   `api/index.ts`, `api/resolve-service-url.ts`, `api/types.ts`: **保留并清空/修改**
    *   **理由**: 保留这些文件的结构作为新 API 客户端的骨架是好做法。`index.ts` 将导出新的 API 客户端，`types.ts` 将定义新的 API 类型，`resolve-service-url.ts` 是可复用的工具函数。
*   `config/`: **删除**
    *   **理由**: 旧的应用配置，将被新的工作流引擎等配置取代。
*   `markdown/`, `rehype/`: **保留**
    *   **理由**: 处理 Markdown 和 KaTeX 的实用工具，与编辑器和内容显示密切相关，可复用。
*   `mcp/`: **删除**
    *   **理由**: MCP 功能相关逻辑，不再需要。
*   `messages/`: **删除**
    *   **理由**: 定义了旧的 `Message` 数据模型和合并逻辑，与新应用的 `StateSnapshot` 模型完全不兼容。
*   `replay/`: **删除**
    *   **理由**: 旧的回放功能，将被新的“历史溯源”功能完全取代。
*   `sse/`: **保留**
    *   **理由**: Server-Sent Events (SSE) 的客户端实现。`design_doc` 的 API 规范中明确包含 `/stream` 接口，因此这个 SSE 客户端是实现实时更新的关键，极具复用价值。
*   `store/settings-store.ts`: **保留并修改**
    *   **理由**: 提供了加载/保存设置到 LocalStorage 的良好模式。内部的状态结构 (`SettingsState`) 需要根据新需求重写。
*   `store/store.ts`: **删除**
    *   **理由**: 这是 `deer-flow` 的核心 Zustand store，其数据模型（`messages`, `researchIds` 等）完全面向旧范式，必须移除以避免混淆。Coding Agent 将根据 `design_doc` 创建全新的 stores（如 `projectStore`, `workflowStore`）。
*   `utils/`: **保留**
    *   **理由**: 包含通用的工具函数（`deepClone`, `json`, `time`），有很高的复用价值。

---

### 3. 清理行动总结

| 路径 | 行动 | 理由 |
| :--- | :--- | :--- |
| `/src/app/page.tsx` | **删除** | 移除旧的 Landing Page。 |
| `/src/app/chat/**` | **删除** | 移除整个旧的核心“对话”应用。 |
| `/src/app/landing/**`| **删除** | 移除所有营销/介绍页面组件。 |
| `/src/app/settings/**`| **部分清理** | 保留 `SettingsDialog` 框架，移除与旧功能相关的 `tabs` 和 `dialogs`。 |
| `/src/components/deer-flow/**`| **部分清理** | 保留通用 UI 组件，删除与“对话”和“研究”强绑定的组件。 |
| `/src/components/editor/**`| **保留** | 核心资产：功能强大的富文本编辑器。 |
| `/src/components/magicui/**`| **保留** | 核心设计系统资产。 |
| `/src/components/ui/**`| **保留** | 核心设计系统资产 (Shadcn/ui)。 |
| `/src/core/api/**`| **大规模清理**| 移除所有旧 API 客户端，保留骨架和 SSE 实现。 |
| `/src/core/store/store.ts`| **删除** | 移除与旧数据模型强绑定的核心状态管理。 |
| 其他工具/配置 | **保留** | `env.js`, `i18n.ts`, `hooks`, `lib`, `styles` 等基础配置和工具。 |

