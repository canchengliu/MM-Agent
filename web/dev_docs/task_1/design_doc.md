--- (446-499 lines) ---
#### 2.2.2 主要视图区域 (L2 Views)

应用包含三个主要的顶层视图区域。

**L2.1: 项目仪表板 (Project Dashboard)**
用户的默认入口点，用于管理所有项目。

  * **路由:** `/projects`
  * **核心组件:** 项目列表/网格视图，新建项目按钮，搜索/筛选功能。

**L2.2: 项目工作区 (Project Workspace)**
核心工作区域，用户在此进行建模、执行工作流和分析结果。这是一个沉浸式的视图。

  * **路由:** `/projects/{project_id}`

  * **布局结构:** 此视图的布局会根据项目的当前状态 (`Configuring` 或 `Running`/`Completed`) 动态切换。

    **L2.2.A: 项目配置视图 (Project Configuration View) (当 `Configuring`)**

      * **描述:** 用户上传文件、定义角色、选择赛题类型的界面。
      * **主要内容:**
          * 项目元数据编辑区（名称、描述、赛题类型）。
          * 文件管理区（上传、角色定义）。
          * 初始化选项（自定义 vs. 历年赛题）。
          * 核心操作：“启动工作流 (Start Workflow)” 按钮（满足前置条件后激活）。

    **L2.2.B: 工作流执行视图 (Workflow Execution View) (当 `Running`/`Completed`)**

      * **描述:** 平台的核心操作区，采用“画布+检查器”布局模型。
      * **结构:**
          * **B.1: 项目控制栏 (Project Control Bar):** 位于顶部。显示项目名称、状态、全局操作（如“导出项目”）。
          * **B.2: 工作流可视化画布 (Workflow Visualization Canvas):** 位于中央/左侧。
              * 使用 React Flow 渲染工作流结构（分阶段流程图或 DAG）。
              * **实时状态与陈旧性:** 清晰展示每个节点的状态和“陈旧性”标记。
              * **交互性 (回溯支持):** 用户可以点击任何已执行的节点以选中它。
              * **动态适应性:** 必须能够动态渲染由 Generator 节点生成的结构变化。
          * **B.3: 节点检查器面板 (Node Inspector Panel):** 位于右侧。根据选中的节点动态显示内容。
              * **面板头部:** 显示选中节点的名称、状态。
              * **标签页结构:**
                  * **Tab 1: 执行与结果 (Execution & Results):** 根据节点状态动态变化。
                      * `Awaiting HITL`: 显示 HITL 交互界面 (SCA/AVL/VARL) 和 `pending_result`。提供批准/拒绝/丢弃操作。
                      * `Completed`: 显示 `active_version` 的输出工件。提供“编辑”和“重新执行”操作。如果陈旧，显示警告。
                      * `Executing`: 显示执行进度 (`current_stage`)。
                      * `Failed`: 显示错误日志。提供“重试”操作。
                  * **Tab 2: 版本历史 (Version History):** 列出所有历史版本。提供“审查”和“激活此版本”操作。
                  * **Tab 3: 依赖关系 (Dependencies):** 显示上游输入依赖。清晰展示“陈旧性”报告详情。

**L2.3: 用户设置中心 (User Settings Center)**
用户配置个人偏好和工作流引擎参数的区域。

  * **路由:** `/settings`
  * **布局结构:** 采用标准的设置面板布局（侧边栏导航+内容区）。
  * **核心模块:** 账户设置、界面设置（主题/语言）、工作流引擎（BYOK）、AI 行为（HITL Profile/Depth）。



--- (709-716 lines) ---
##### 4\. 结构化内容编辑 (人工编辑 R4)

*   **技术基础:** `Tiptap/Novel` (富文本/LaTeX), Code Editor。
*   **交互规则:**
    *   **进入编辑模式:** 在已完成节点的检查器面板中，点击“人工编辑”。内容区切换为编辑器实例。
    *   **AI 辅助 (Ask AI):** 集成 Deer-Flow 的 Ask AI 功能。用户可通过斜杠命令 (`/ai`) 或选中文本后的浮动工具栏调用 AI 辅助编辑。
    *   **保存与版本创建:** 点击“保存并激活”按钮。弹出对话框要求用户输入“版本摘要 (Summary)”。提交后，创建一个新的 `MANUALLY_EDITED` 版本并自动激活。



--- (803-812 lines) ---
**模板二：沉浸式工作区布局 (Immersive Workspace Layout - Canvas + Inspector)**

*   **适用场景:** L2.2.B 工作流执行视图。
*   **结构:** 全屏、全高布局。
    *   **[A] 项目控制栏:** 位于顶部。提供项目级上下文和操作。
    *   **[B] 工作区容器:** 占据剩余所有高度。采用水平 Flex 布局。
        *   **[B.1] 工作流画布区 (Canvas):** 占据主要空间 (`flex-1`)。承载 React Flow 可视化。
        *   **[B.2] 节点检查器面板 (Inspector):** 固定在右侧。固定宽度（例如 `w-96` 或 `w-1/3`）。支持独立滚动。
*   **动态调整:** B.1 和 B.2 之间应提供一个可拖拽的分隔条（Resizable Splitter），并支持折叠/展开 B.2。



--- (1024-1029 lines) ---
#### 4.1.1.1 主题策略 (Theming Strategy)

1.  **深色优先 (Dark Mode First):** 平台默认采用深色模式，以营造沉浸式的专业环境，减少视觉疲劳，并强化科技感。浅色模式作为备选提供。
2.  **实现机制:** 利用 `next-themes` 进行主题切换。所有颜色必须定义为 CSS 变量，并遵循 `Shadcn/ui` 的 HSL 格式约定。主题切换通过在 `<html>` 标签上切换 `class="dark"` 来实现。
3.  **无障碍性 (Accessibility):** 所有前景文本与背景色的组合必须满足 WCAG AA 级的对比度要求。



--- (1197-1202 lines) ---
**2. 生成的报告内容 (Markdown/LaTeX Rendering)**

  * **技术基础:** `Tiptap/Novel`, `react-markdown`, `@tailwindcss/typography` (prose)。
  * **基础字体:** `Body M` (16px)，行高 1.7。
  * **定制化:** 必须定制 `prose` 样式以适应全局字体和色彩主题（特别是深色模式 `prose-invert`）。
  * **数学公式 (KaTeX):** 确保 KaTeX 渲染的字体大小与周围文本协调一致。


--- (1291-1300 lines) ---
**2. 动态光效 (Dynamic Effects - Magic UI Integration)**

利用 `Magic UI` 组件库提供精致的动态效果，服务于功能。

  * **`BorderBeam` / 动态光环:**
      * **应用场景:** 用于工作流画布中处于 `Executing` 状态的节点边缘，可视化正在进行的活动。
      * **参数:** 速度适中，颜色使用主色 (`--primary`)。
  * **`ShineBorder` / 闪亮边框:**
      * **应用场景:** 用于关键容器（如选中的 HITL 候选方案卡片）的悬停或激活状态，提供精致的反馈。



--- (1883-1891 lines) ---

##### 1\. 信息架构 (2.2)

  * 主要视图：项目仪表板、项目工作区（配置视图 vs. 执行视图）、用户设置中心。

##### 2\. 布局模板 (3.2.1)

  * **模板二：沉浸式工作区布局 (Canvas + Inspector).** 核心工作区布局。

--- (239-243 lines) ---
## 阶段 2：信息架构与流程逻辑 (Phase 2: Information Architecture & Flow Logic)

### 2.1 内容模型与分类法 (Content Model and Taxonomy)

本文档定义了 O-Award 建模平台的核心内容实体模型、属性、相互关系及其分类体系。这是构建数据库结构、API 接口和前端状态管理的基础。


--- (428-445 lines) ---
### 2.2 信息架构图（文本描述）(Information Architecture Diagram - Textual Description)

本文档提供了 O-Award 建模平台全局信息架构的详尽文本描述。该架构旨在支持“线性探索与回溯”的设计哲学，并适应动态变化的工作流结构。

#### 2.2.1 全局结构与应用外壳 (Global Structure and Application Shell)

应用采用标准的 Web 应用结构，分为全局应用外壳和主要内容区域。

**L1: 应用外壳 (Application Shell)**
用户认证成功后加载的全局容器，提供统一的导航和上下文信息。

  * **全局导航栏 (Global Navigation Bar):** 位于屏幕顶部或左侧，提供对应用主要功能区域的快速访问。
      * Logo/主页链接（返回 L2.1 项目仪表板）。
      * 主导航链接：项目 (Projects)。
      * 用户控制区：用户头像、设置 (Settings) 链接（指向 L2.3）、登出。
      * 实时连接状态指示器（WebSocket 状态）。
  * **主内容区 (Main Content Area):** 动态加载 L2 层的具体视图。



--- (446-499 lines) ---
#### 2.2.2 主要视图区域 (L2 Views)

应用包含三个主要的顶层视图区域。

**L2.1: 项目仪表板 (Project Dashboard)**
用户的默认入口点，用于管理所有项目。

  * **路由:** `/projects`
  * **核心组件:** 项目列表/网格视图，新建项目按钮，搜索/筛选功能。

**L2.2: 项目工作区 (Project Workspace)**
核心工作区域，用户在此进行建模、执行工作流和分析结果。这是一个沉浸式的视图。

  * **路由:** `/projects/{project_id}`

  * **布局结构:** 此视图的布局会根据项目的当前状态 (`Configuring` 或 `Running`/`Completed`) 动态切换。

    **L2.2.A: 项目配置视图 (Project Configuration View) (当 `Configuring`)**

      * **描述:** 用户上传文件、定义角色、选择赛题类型的界面。
      * **主要内容:**
          * 项目元数据编辑区（名称、描述、赛题类型）。
          * 文件管理区（上传、角色定义）。
          * 初始化选项（自定义 vs. 历年赛题）。
          * 核心操作：“启动工作流 (Start Workflow)” 按钮（满足前置条件后激活）。

    **L2.2.B: 工作流执行视图 (Workflow Execution View) (当 `Running`/`Completed`)**

      * **描述:** 平台的核心操作区，采用“画布+检查器”布局模型。
      * **结构:**
          * **B.1: 项目控制栏 (Project Control Bar):** 位于顶部。显示项目名称、状态、全局操作（如“导出项目”）。
          * **B.2: 工作流可视化画布 (Workflow Visualization Canvas):** 位于中央/左侧。
              * 使用 React Flow 渲染工作流结构（分阶段流程图或 DAG）。
              * **实时状态与陈旧性:** 清晰展示每个节点的状态和“陈旧性”标记。
              * **交互性 (回溯支持):** 用户可以点击任何已执行的节点以选中它。
              * **动态适应性:** 必须能够动态渲染由 Generator 节点生成的结构变化。
          * **B.3: 节点检查器面板 (Node Inspector Panel):** 位于右侧。根据选中的节点动态显示内容。
              * **面板头部:** 显示选中节点的名称、状态。
              * **标签页结构:**
                  * **Tab 1: 执行与结果 (Execution & Results):** 根据节点状态动态变化。
                      * `Awaiting HITL`: 显示 HITL 交互界面 (SCA/AVL/VARL) 和 `pending_result`。提供批准/拒绝/丢弃操作。
                      * `Completed`: 显示 `active_version` 的输出工件。提供“编辑”和“重新执行”操作。如果陈旧，显示警告。
                      * `Executing`: 显示执行进度 (`current_stage`)。
                      * `Failed`: 显示错误日志。提供“重试”操作。
                  * **Tab 2: 版本历史 (Version History):** 列出所有历史版本。提供“审查”和“激活此版本”操作。
                  * **Tab 3: 依赖关系 (Dependencies):** 显示上游输入依赖。清晰展示“陈旧性”报告详情。

**L2.3: 用户设置中心 (User Settings Center)**
用户配置个人偏好和工作流引擎参数的区域。

  * **路由:** `/settings`
  * **布局结构:** 采用标准的设置面板布局（侧边栏导航+内容区）。
  * **核心模块:** 账户设置、界面设置（主题/语言）、工作流引擎（BYOK）、AI 行为（HITL Profile/Depth）。



--- (500-509 lines) ---
#### 2.2.3 导航模型与路径定义

**导航模型：混合模型（全局导航 + 上下文导航）**

1.  **全局导航 (Global Navigation):** 通过 L1 导航栏在 L2 主要视图区域之间切换。
2.  **列表到详情 (List to Detail):** 从项目仪表板 (L2.1) 点击项目，导航到项目工作区 (L2.2)。
3.  **状态驱动的视图切换:** 在 L2.2 中，系统根据项目状态自动选择显示配置视图 (L2.2.A) 或执行视图 (L2.2.B)。
4.  **上下文导航 (Contextual Navigation - 支持回溯):** 在工作流执行视图 (L2.2.B) 中，用户通过点击画布 (B.2) 中的不同节点来切换焦点。这不会改变 URL 路由，而是更新节点检查器面板 (B.3) 的内容。这使得用户可以在保持全局上下文的同时进行回溯和审查。
5.  **流程推进 (Proceeding):** 在 HITL 环节点击“继续”后，系统会自动将焦点推进到下一个节点。



--- (635-638 lines) ---
### 3.1.1 全局交互模式库 (Global Interaction Pattern Library)

本文档建立了一套可复用的全局交互模式库，旨在为 O-Award 建模平台提供高效、一致且支持专家级操作的交互体验。这些模式基于 `Shadcn/ui`, `Radix UI`, `React Flow`, 和 `Tiptap/Novel` 等技术栈构建。



--- (710-711 lines) ---

*   **技术基础:** `Tiptap/Novel` (富文本/LaTeX), Code Editor。


--- (784-787 lines) ---
**1\. 栅格系统与响应式策略 (Grid System and Responsiveness)**

*   **技术基础:** `Tailwind CSS` Flexbox 和 Grid 布局。
*   **设计策略:** **Desktop-First**。优先保证在大屏幕上的高信息密度和操作效率。`lg` (1024px) 是支持完整功能体验的最小推荐尺寸。


--- (810-811 lines) ---
        *   **[B.2] 节点检查器面板 (Inspector):** 固定在右侧。固定宽度（例如 `w-96` 或 `w-1/3`）。支持独立滚动。
*   **动态调整:** B.1 和 B.2 之间应提供一个可拖拽的分隔条（Resizable Splitter），并支持折叠/展开 B.2。


--- (817-827 lines) ---
**1\. 全局路由导航 (Global Routing Navigation - URL Driven)**

*   **机制:** 基于 URL 路由 (`Next.js App Router`)。
*   **用途:** 在 L2 主要视图区域之间切换（项目列表 \<-\> 工作区 \<-\> 设置）。

**2\. 上下文状态导航 (Contextual State Navigation - State Driven)**

*   **机制:** 基于客户端状态管理（`Zustand`）而非 URL 路由。
*   **用途:** 在工作流执行视图中切换焦点节点（回溯和审查）。
*   **行为:** 用户点击画布节点，更新 `selectedNodeId` 状态，检查器面板局部更新内容。URL 保持不变（或仅更新查询参数 `?node={id}`）。这使得导航极为快速和流畅。



--- (1026-1027 lines) ---
1.  **深色优先 (Dark Mode First):** 平台默认采用深色模式，以营造沉浸式的专业环境，减少视觉疲劳，并强化科技感。浅色模式作为备选提供。
2.  **实现机制:** 利用 `next-themes` 进行主题切换。所有颜色必须定义为 CSS 变量，并遵循 `Shadcn/ui` 的 HSL 格式约定。主题切换通过在 `<html>` 标签上切换 `class="dark"` 来实现。


--- (1142-1145 lines) ---
**1. 主字体 (Primary Typeface): Geist Sans**

  * **选择理由:** 专为现代界面设计，风格简洁、几何感强，具有出色的屏幕可读性。
  * **实现:** 使用 `next/font` 加载 Vercel Geist Font。


--- (1197-1202 lines) ---
**2. 生成的报告内容 (Markdown/LaTeX Rendering)**

  * **技术基础:** `Tiptap/Novel`, `react-markdown`, `@tailwindcss/typography` (prose)。
  * **基础字体:** `Body M` (16px)，行高 1.7。
  * **定制化:** 必须定制 `prose` 样式以适应全局字体和色彩主题（特别是深色模式 `prose-invert`）。
  * **数学公式 (KaTeX):** 确保 KaTeX 渲染的字体大小与周围文本协调一致。


--- (1291-1293 lines) ---
**2. 动态光效 (Dynamic Effects - Magic UI Integration)**

利用 `Magic UI` 组件库提供精致的动态效果，服务于功能。


--- (1330-1331 lines) ---
  * **技术基础:** `Framer Motion`。

