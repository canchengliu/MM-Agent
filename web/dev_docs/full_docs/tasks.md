#### 任务 0.1：代码库清理与项目结构初始化

*   **目标：** 将 Deer-Flow 代码库重构为 O-Award 平台的初始结构，移除无关代码，集成必要的新依赖。
*   **输入：** `<deer_flow_frontend_code>`, `<architecture> (Section 2)`, `<front_stack>`.
*   **输出：** 清理后的、符合 O-Award 架构的项目骨架。
*   **核心关注点：** 目录结构调整，依赖项管理，代码清理。
*   **实现策略：**
    1.  **清理 `app/` 目录：** 删除 `app/chat/` 和 `app/landing/`。根据 `<architecture> 2` 创建新的路由分组和占位文件：`app/(auth)/`（`login/`, `register/`, `verify-email/`）和 `app/(dashboard)/`（`projects/`, `settings/`, `projects/[projectId]/`）。修改 `app/page.tsx` 重定向到 `/projects`。
    2.  **清理 `core/` 目录：** 移除 Deer-Flow 特定的 API（如 `chat.ts`）。清空或删除旧的 `store/` 内容。保留 `core/utils/`。
    3.  **重组 `components/` 目录：** 保留 `ui/` 和 `magicui/`。将 `components/deer-flow/` 重命名为 `components/platform/`，迁移可复用的通用组件（如 `ThemeProviderWrapper`, `Tooltip`, `Markdown`）。保留 `components/editor/` 备用。
    4.  **配置与依赖：** 更新 `src/env.js`。安装新依赖：`immer`（用于 Zustand 不可变更新），`@monaco-editor/react`（代码编辑），`react-resizable-panels` (Shadcn Resizable)。
*   **边界：** 仅关注结构、依赖和清理。

---

#### 任务 0.2：设计系统实现（色彩、字体、主题、动效）

*   **目标：** 实现 Design Doc Phase 4.1 和 4.2 定义的“精密未来主义”设计系统和动效令牌。
*   **输入：** `<design_doc> 4.1, 4.2`.
*   **输出：** 更新后的 `styles/globals.css`, `components/platform/ThemeProviderWrapper.tsx`, 新建 `src/styles/motion-tokens.ts`。
*   **核心关注点：** CSS 变量精确定义 (4.1.1.3)；深色模式优先；Geist 字体配置；全局圆角基准 (4.1.4.2)；动效令牌定义 (4.2.2.3)。
*   **实现策略：**
    1.  **`styles/globals.css`：** 严格按照 Design Doc 4.1.1.3 的规范，在 `:root` 和 `.dark` 中定义所有 CSS 变量（HSL 格式）。设置 `--radius: 0.375rem`。
    2.  **字体配置：** 确保 `app/layout.tsx` 正确加载 Geist 字体（复用 Deer-Flow）。
    3.  **`ThemeProviderWrapper.tsx`：** 配置 `next-themes`，设置 `defaultTheme="dark"`, `enableSystem={true}`。
    4.  **`src/styles/motion-tokens.ts`：** 创建文件并严格按照 Design Doc 4.2.2.3 实现 `MotionDurations`, `MotionEasings`, `Transitions` 常量。
*   **边界：** 仅关注全局视觉基础配置和动效令牌定义。

---

#### 任务 1.1：API 类型定义与通用 API 客户端实现

*   **目标：** 定义所有后端 API 的 TypeScript 类型，并实现一个健壮的、集中式的 REST API 客户端。
*   **输入：** `<api> (所有文档)`, `<architecture> 4.1`.
*   **输出：** `core/api/types/`（所有类型定义）, `core/api/ApiClient.ts`, `core/api/utils.ts`。
*   **核心关注点：** 类型定义的完整性；JWT 注入；全局错误处理（特别是 401）；支持 `FormData` 和 `x-www-form-urlencoded`。
*   **实现策略：**
    1.  **类型定义：** 系统地将所有 API 文档中的“核心响应模型定义”转换为 TypeScript 接口，存放在 `core/api/types/` 下（按模块划分文件）。
    2.  **`resolveServiceURL`：** 在 `core/api/utils.ts` 中实现（复用 Deer-Flow 逻辑）。
    3.  **`ApiClient.ts`：** 实现 `<architecture> 4.1` 定义的 `apiClient.request`。实现从 `AuthStore`（待创建）动态获取 Token 并注入 `Authorization` 头。实现全局 401 错误处理（调用 `AuthStore.logout()`）。实现对不同 `Content-Type` 的请求处理。
*   **边界：** 仅实现客户端基础架构和类型定义。

---

#### 任务 1.2：状态管理 - 认证与用户设置 (AuthStore & SettingsStore) 实现

*   **目标：** 实现用户会话和用户设置的状态管理逻辑及对应的 API 服务。
*   **输入：** `<architecture> 3.1.1, 3.1.2`, `<api> (Docs 1 & 2)`, 任务 1.1。
*   **输出：** `core/store/AuthStore.ts`, `core/store/SettingsStore.ts`, `core/api/services/AuthService.ts`, `core/api/services/UserService.ts`。
*   **核心关注点：** Token 持久化（`sessionStorage`）；BYOK“写后即忘”模型（`has_api_key` 标志同步）。
*   **实现策略：**
    1.  **`AuthService.ts` & `UserService.ts`：** 实现所有相关 API 调用。
    2.  **`AuthStore.ts`：** 实现 `<architecture> 3.1.1`。使用 `zustand/persist` 中间件。实现 `login`, `logout`, `register`, `initialize` 动作。`login` 成功后需获取用户 Profile 和 Settings。
    3.  **`SettingsStore.ts`：** 实现 `<architecture> 3.1.2`。实现 `fetchSettings`, `updateSettings`。`updateSettings` 需实现乐观更新，并在 API 成功后同步后端响应（确保 BYOK 标志正确）。
*   **边界：** 实现认证和用户设置的完整数据流逻辑。

---

#### 任务 1.3：状态管理 - 项目管理 (ProjectsStore) 实现

*   **目标：** 实现项目管理的状态管理逻辑及对应的 API 服务。
*   **输入：** `<architecture> 3.1.3`, `<api> (Doc 3)`, 任务 1.1。
*   **输出：** `core/store/ProjectsStore.ts`, `core/api/services/ProjectService.ts`。
*   **核心关注点：** 管理 `projects` 列表和 `activeProject` 详情；CRUD 操作；文件上传；`startWorkflow` 的状态转换逻辑。
*   **实现策略：**
    1.  **`ProjectService.ts`：** 实现所有项目管理 API 调用（CRUD, `uploadFile`, `initializeFromHistorical`, `startWorkflow`, `getHistoricalProblems`, `exportProject`）。
    2.  **`ProjectsStore.ts`：** 实现 `<architecture> 3.1.3`。实现所有定义的动作。重点关注 `startWorkflow` 动作：处理 202 响应，并立即更新本地 `activeProject` 的 `status` 为 `Running` 和 `workflow_instance_id`。
*   **边界：** 实现项目管理的完整数据流逻辑。

---

#### 任务 1.4：状态管理 - 工作流核心 (WorkflowStore & InspectorStore) 实现

*   **目标：** 实现复杂的工作流状态管理和检查器 UI 状态管理及对应的 API 服务。
*   **输入：** `<architecture> 3.1.4, 3.1.5`, `<api> (Docs 4 & 5)`, 任务 1.1。
*   **输出：** `core/store/WorkflowStore.ts`, `core/store/InspectorStore.ts`, `core/api/services/WorkflowService.ts`, `core/api/services/NodeService.ts`。
*   **核心关注点：** 数据规范化（Normalization）；使用 Immer 进行不可变更新；实现所有执行控制和版本控制动作。
*   **实现策略：**
    1.  **`WorkflowService.ts` & `NodeService.ts`：** 实现所有相关 API 调用（查询、执行控制、HITL、版本控制）。
    2.  **`WorkflowStore.ts`：** 实现 `<architecture> 3.1.4`。
        *   实现 `normalizeWorkflow` 辅助函数（将 `phases` 展平为 `nodes` 映射）。
        *   实现 `loadWorkflow`, `refreshWorkflow`。
        *   实现所有执行控制、HITL 和版本控制动作（`reExecuteNode`, `submitHITL`, `manualEdit`, `activateVersion` 等）。
        *   实现 WebSocket 处理程序骨架（`_processNodeUpdate`, `_processStructureUpdate`），使用 `immer` 的 `produce` 函数确保数据一致性（同时更新 `nodes` 映射和 `phases` 树）。
    3.  **`InspectorStore.ts`：** 实现 `<architecture> 3.1.5`。
        *   管理 UI 状态（`selectedNodeId`, `activeTab`, `isEditing`）。
        *   实现 `selectNode` 动作：并行获取节点详情和版本历史并缓存。处理加载状态和错误（如 403 超出执行前沿）。
*   **边界：** 实现工作流和检查器的核心状态管理逻辑。

---

#### 任务 1.5：实时通信基础设施 (WebSocket Manager) 实现

*   **目标：** 实现 WebSocket 连接管理、认证和事件分发机制。
*   **输入：** `<api> (Doc 6)`, `<architecture> 4.3`, 任务 1.2 (AuthStore), 任务 1.4 (WorkflowStore)。
*   **输出：** `core/websocket/WebSocketManager.ts`, `core/websocket/EventHandler.ts`, `core/store/ConnectionStore.ts`。
*   **核心关注点：** 连接生命周期管理；JWT 认证；断线重连（指数退避）；重连后的状态同步 (API Doc 6.1.3)。
*   **实现策略：**
    1.  **`ConnectionStore.ts`：** 创建新的 Store 管理全局连接状态（`isConnected`, `isReconnecting`）。
    2.  **`WebSocketManager.ts` (单例):** 实现 `<architecture> 4.3.1`。
        *   `connect(workflowId)`：从 `AuthStore` 获取 Token 构建 WS URL。
        *   `onopen`：更新 `ConnectionStore`，调用 `WorkflowStore.refreshWorkflow()` 进行状态同步。
        *   `onclose`/`onerror`：更新 `ConnectionStore`，实现指数退避重连逻辑。
    3.  **`EventHandler.ts`:** 实现 `<architecture> 4.3.2`。解析事件并调用 `WorkflowStore` 的处理程序。对 `NODE_ACTIVE_VERSION_CHANGED` 事件，调用 `refreshWorkflow()`。
*   **边界：** 实现通信基础设施和事件分发逻辑。

---

#### 任务 2.1：认证页面实现 (Login, Register, Verify)

*   **目标：** 构建用户认证流程的 UI 页面。
*   **输入：** 任务 1.2 (AuthStore/Service), `<api> (Doc 1)`, React Hook Form, Zod, Shadcn/ui。
*   **输出：** `app/(auth)/login/page.tsx`, `register/page.tsx`, `verify-email/page.tsx`。
*   **核心关注点：** 表单实现；错误处理（区分 401 和 403 未验证）；流程引导。
*   **实现策略：**
    1.  创建 `app/(auth)/layout.tsx`。
    2.  实现登录页：连接 `AuthStore.login`。根据 API Doc 1.1.1 指南处理错误提示。成功后重定向到 `/projects`。
    3.  实现注册页：连接 `AuthStore.register`。成功后显示“请检查邮箱激活账户”提示。
    4.  实现邮箱验证页：从 URL 获取 `token`，自动调用 `AuthStore.verifyEmail(token)`。显示结果状态。
*   **边界：** 实现认证 UI 流程。

---

#### 任务 2.2：全局应用外壳和导航实现

*   **目标：** 实现受保护路由的全局布局外壳和导航栏。
*   **输入：** `<design_doc> (2.2.1, 3.2.1)`, 任务 1.2 (AuthStore), 任务 1.5 (ConnectionStore)。
*   **输出：** `app/(dashboard)/layout.tsx`, `components/platform/GlobalNavbar.tsx`, `hooks/useAuth.ts`。
*   **核心关注点：** 路由保护；全局导航链接；用户信息显示；WebSocket 状态指示器。
*   **实现策略：**
    1.  **`useAuth.ts`：** 实现路由保护 Hook，检查 `AuthStore` 状态并重定向。
    2.  **`(dashboard)/layout.tsx`：** 实现应用外壳布局，应用路由保护。在加载时调用 `AuthStore.initialize()`。
    3.  **`GlobalNavbar.tsx`：** 实现导航栏。显示用户 `display_name`，提供 `logout`。集成 `ThemeToggle`。
    4.  **连接状态指示器：** 创建 `ConnectionStatusIndicator.tsx`，订阅 `ConnectionStore`，在 `GlobalNavbar` 中集成。断开连接时显示全局横幅警告（Design Doc 3.1.2.2）。
*   **边界：** 实现全局导航和布局框架。

---

#### 任务 2.3：用户设置中心实现

*   **目标：** 实现用户设置中心页面 (L2.3)。
*   **输入：** 任务 1.2 (SettingsStore/Service), `<api> (Doc 2)`, `<design_doc> (2.2.2 L2.3)`.
*   **输出：** `app/(dashboard)/settings/page.tsx` 及其 Tab 组件。
*   **核心关注点：** BYOK 字段的 UI 处理（密码类型，`has_key` 状态）；表单实现。
*   **实现策略:**
    1.  实现 `settings/page.tsx` 布局（侧边栏+内容区）。确保 `SettingsStore.fetchSettings()` 已调用。
    2.  实现各个 Tab 组件（Interface, Engine/BYOK, AI Behavior）。使用 React Hook Form + Zod。
    3.  **BYOK UI 实现：** 严格实现 API Doc 2 的要求。根据 `has_api_key` 显示占位符（“已设置，输入以覆盖”）。确保输入框类型为 `password`。支持发送空字符串以清除密钥。
    4.  连接表单提交到 `SettingsStore.updateSettings`。
*   **边界：** 实现设置页面的 UI 和逻辑。

---

#### 任务 3.1：项目仪表板实现 (列表视图与 CRUD)

*   **目标：** 实现项目管理仪表板 (L2.1)。
*   **输入：** 任务 1.3 (ProjectsStore/Service), `<design_doc> (5.1.1)`.
*   **输出：** `app/(dashboard)/projects/page.tsx`, `components/platform/ProjectTable.tsx`, `CreateProjectDialog.tsx`, `StatusBadge.tsx`。
*   **核心关注点：** 使用 Shadcn Table 实现高密度列表；状态可视化；CRUD 操作交互。
*   **实现策略:**
    1.  实现 `projects/page.tsx`，调用 `fetchProjects`。
    2.  实现 `ProjectTable.tsx`。实现 `StatusBadge.tsx`（根据项目状态显示颜色）。
    3.  实现 `CreateProjectDialog.tsx`。调用 `createProject`。
    4.  实现删除项目的 `AlertDialog` 确认流程（Design Doc 3.1.1.1）。
    5.  实现行点击导航到 `/projects/{id}`。
*   **边界：** 实现项目列表和基础 CRUD 操作 UI。

---

#### 任务 3.2：项目配置视图实现与启动流程

*   **目标：** 实现项目工作区入口点、配置视图 (L2.2.A)，并完成启动工作流流程。
*   **输入：** 任务 1.3, `<design_doc> (2.2.2 L2.2.A, 2.3.1)`, `<api> (Doc 3)`.
*   **输出：** `app/(dashboard)/projects/[projectId]/page.tsx`, `ConfigurationView.tsx`, `FileUploader.tsx`。
*   **核心关注点：** 状态驱动的视图切换；文件上传与角色管理；启动前置条件校验；历史案例初始化。
*   **实现策略:**
    1.  **`[projectId]/page.tsx`：** 实现入口点。调用 `loadActiveProject`。根据 `status` 条件渲染 `ConfigurationView` 或 `ExecutionView`（占位符）。
    2.  **`ConfigurationView.tsx`：**
        *   实现元数据编辑表单（名称、描述、赛题类型）。
        *   实现 `FileUploader.tsx` 和 `FileList.tsx`：处理文件上传（`FormData`）和角色分配。
        *   实现历史案例初始化 UI：获取历史案例列表并实现选择初始化。
        *   实现“启动工作流”按钮：实现客户端激活条件逻辑（已设类型，已上传问题描述）。
    3.  **启动流程：** 点击按钮调用 `ProjectsStore.startWorkflow`。确认状态更新后 UI 自动切换到 `ExecutionView`。
*   **边界：** 实现项目配置和启动工作流的完整流程。

---

#### 任务 4.1：工作区执行视图布局实现 (Canvas + Inspector)

*   **目标：** 实现沉浸式工作区的核心布局（模板二）。
*   **输入：** `<design_doc> (5.1.2)`, `<architecture> (5.1.1)`, Shadcn Resizable。
*   **输出：** `app/(dashboard)/projects/[projectId]/layout.tsx`, `ExecutionView.tsx`, `ProjectControlBar.tsx`。
*   **核心关注点：** 全屏布局；可调整大小的面板集成；WebSocket 连接生命周期。
*   **实现策略:**
    1.  **`[projectId]/layout.tsx`：** 实现 `<architecture> 5.1.1` 布局。使用 `ResizablePanelGroup` 实现画布和检查器面板的可调分割。
    2.  **`ProjectControlBar.tsx`：** 实现顶部控制栏（项目信息、导出按钮占位）。
    3.  **`ExecutionView.tsx`：** 作为画布容器。在 `useEffect` 中，确保 `WorkflowStore.loadWorkflow` 被调用，并调用 `WebSocketManager.connect()`。在卸载时调用 `disconnect()`。
*   **边界：** 实现布局框架和 WebSocket 连接管理。

---

#### 任务 4.2：React Flow 集成与布局算法实现

*   **目标：** 集成 React Flow，实现工作流数据的可视化布局（Phase/Stage/Node 层级）。
*   **输入：** `<architecture> (5.2.1)`, `<design_doc> (2.1.1)`, 任务 1.4 (WorkflowStore)。
*   **输出：** `WorkflowCanvas.tsx`, `LayoutUtils.ts`。
*   **核心关注点：** 数据转换（`phases` 到 `nodes`/`edges`）；布局算法（分列网格布局）。
*   **实现策略:**
    1.  **`WorkflowCanvas.tsx`：** 初始化 `ReactFlow` 实例。配置背景（点状网格）、控件、小地图。订阅 `WorkflowStore.workflow.phases`。
    2.  **`LayoutUtils.ts`：** 实现 `calculateLayout(phases)`。
        *   实现确定性的网格布局算法：将 Phase 映射为列，Stage/Node 在列内垂直排列。
        *   使用 React Flow 的 "Group Nodes" 功能创建代表 Stage 的父节点，以可视化分组。
        *   计算精确的 (x, y) 坐标并生成连接线（`edges`）。
    3.  **集成：** 使用 `useMemo` 在 `phases` 变化时重新计算布局。
*   **边界：** 实现画布和布局逻辑。

---

#### 任务 4.3：自定义节点卡片（CustomNode）实现与交互

*   **目标：** 实现高保真的工作流节点卡片 UI、状态显示、动态效果和交互。
*   **输入：** `<design_doc> (5.1.2.1, 3.1.2.1)`, `<architecture> (5.2.2)`, Magic UI (BorderBeam)。
*   **输出：** `CustomNode.tsx`, `StatusBadge.tsx` (更新), `StalenessIndicator.tsx`。
*   **核心关注点：** 状态可视化；`Executing` 状态的 `BorderBeam` 效果；`is_stale` 指示器；节点选择交互。
*   **实现策略:**
    1.  **`StatusBadge.tsx` (更新):** 扩展以支持所有 `NodeStatus` 和颜色（Design Doc 3.1.2.1）。
    2.  **`StalenessIndicator.tsx`：** 创建陈旧性警告图标组件。
    3.  **`CustomNode.tsx`：** 创建自定义节点组件（参考 `<architecture> 5.2.2`）。
    4.  **动态效果：** 当 `status === 'Executing'` 时，集成并显示 `BorderBeam`。当 `status === 'Awaiting HITL'` 时，添加微妙脉动效果（Framer Motion）。
    5.  **交互：** 实现 `selected` 状态样式。在 `WorkflowCanvas.tsx` 中实现 `onNodeClick`，调用 `InspectorStore.selectNode(nodeId)`。
*   **边界：** 实现节点 UI、视觉效果和选择交互。

---

#### 任务 5.1：检查器面板框架与导航实现

*   **目标：** 实现检查器面板的整体结构和标签页导航。
*   **输入：** `<design_doc> (5.1.2 C)`, `<architecture> (5.3)`, 任务 1.4 (InspectorStore)。
*   **输出：** `InspectorPanel.tsx`。
*   **核心关注点：** 数据订阅；面板头部；Shadcn Tabs 导航。
*   **实现策略:**
    1.  **`InspectorPanel.tsx`：** 实现面板框架。订阅 `InspectorStore` 获取 `details` 和加载状态。
    2.  **面板头部：** 显示选中节点信息和 `StatusBadge`。
    3.  **标签页导航：** 使用 Shadcn Tabs 实现（Results, History, Dependencies），并与 `InspectorStore.activeTab` 同步。
    4.  **状态处理：** 处理加载中和未选择节点的空状态。
*   **边界：** 实现面板框架和导航。

---

#### 任务 5.2：结果与操作标签页 (ResultsTab) - 动态视图与执行控制

*   **目标：** 实现 ResultsTab，根据节点状态动态显示内容（不含 HITL），并集成执行控制操作。
*   **输入：** `<design_doc> (5.1.2 Tab 1)`, `<api> 5.2`, 任务 1.4 (WorkflowStore)。
*   **输出：** `ResultsTab.tsx`, `ExecutingView.tsx`, `FailedView.tsx`, `CompletedView.tsx`。
*   **核心关注点：** 状态驱动的视图切换；工件渲染；执行控制按钮集成（Re-execute, Retry, Cancel）；陈旧性警告显示。
*   **实现策略:**
    1.  **`ResultsTab.tsx`：** 实现状态路由逻辑。如果 `is_stale` 为 true，在顶部显示 `Alert`（Design Doc 3.1.2.3）。
    2.  **`ExecutingView`：** 显示 `current_stage`。实现“Cancel”按钮，连接 `WorkflowStore.cancelNode`。
    3.  **`FailedView`/`CanceledView`：** 显示错误日志。实现“Retry”按钮，连接 `WorkflowStore.retryNode`。
    4.  **`CompletedView`：** 渲染输出工件（使用 `Markdown` 组件）。实现“Re-execute”按钮（弹出对话框输入修改意见），连接 `WorkflowStore.reExecuteNode`。
    5.  **异步反馈：** 确保按钮点击后（API 202）有即时反馈（禁用按钮），并依赖 WebSocket 更新 UI。
*   **边界：** 实现除 HITL 和编辑模式外的所有状态视图和执行控制。

---

#### 任务 5.3：历史与依赖标签页实现

*   **目标：** 实现“History”和“Dependencies”标签页的内容展示。
*   **输入：** `<design_doc> (5.1.2 Tab 2 & 3)`, 任务 1.4 (InspectorStore)。
*   **输出：** `HistoryTab.tsx`, `DependenciesTab.tsx`, `VersionReviewDialog.tsx`。
*   **核心关注点：** 版本列表展示；版本审查（模态框）；依赖关系和陈旧性详情展示。
*   **实现策略:**
    1.  **`HistoryTab.tsx`：** 渲染 `InspectorStore.versionHistory`。实现“Review”按钮，打开 `VersionReviewDialog` 显示历史版本快照。
    2.  **`DependenciesTab.tsx`：** 显示上游依赖。如果存在 `staleness_report`，清晰高亮显示版本不一致详情。
*   **边界：** 实现信息展示功能。

---

#### 任务 6.1：HITL 容器与提交流程实现

*   **目标：** 实现 HITL 交互的通用容器和数据提交流程。
*   **输入：** `<api> (5.3 HITL)`, `<design_doc> (5.1.3)`, `<architecture> (5.4)`.
*   **输出：** `HITLContainer.tsx`, 更新 `WorkflowStore.ts` (HITL actions)。
*   **核心关注点：** 布局（内容区 + 固定操作栏）；`submitHITL` 调用与响应处理（根据 `action` 字段决定下一步操作）。
*   **实现策略:**
    1.  **`HITLContainer.tsx`：** 实现容器框架和布局。根据 `node.hitl_mode` 分发到专业接口组件。
    2.  **通用操作栏：** 实现“Discard”、“Reject & Modify”（需输入反馈）、“Approve”的基础逻辑。
    3.  **`WorkflowStore.submitHITL` (完善)：** 处理 API 响应，根据返回的 `action`（如 `ExecuteNext`, `NavigateNext`）执行后续操作（如导航到下一节点）。
*   **边界：** 实现 HITL 通用框架和提交流程。

---

#### 任务 6.2：HITL 模式实现 (SCA, AVL, VARL)

*   **目标：** 实现 SCA、AVL 和 VARL 模式的特定交互界面。
*   **输入：** `<design_doc> (5.1.3.1, 5.1.3.2)`, Magic UI (ShineBorder)。
*   **输出：** `SCAInterface.tsx`, `AVLInterface.tsx`, `VARLInterface.tsx`。
*   **核心关注点：**
    *   **SCA：** 比较分析报告渲染；候选方案选择；选中状态的 `ShineBorder` 效果（Design Doc 5.1.3.1）；提交 `selected_ids`。
    *   **AVL：** 批判列表渲染；裁决控件（Accept/Reject）；状态管理（确保所有项已裁决才能提交）；提交 `adjudication` 数据。
    *   **VARL：** 简单结果展示。
*   **实现策略:**
    1.  实现 `SCAInterface.tsx`，重点关注选中状态管理和 `ShineBorder` 集成。
    2.  实现 `AVLInterface.tsx`，重点关注复杂的裁决状态管理和提交条件。
    3.  实现 `VARLInterface.tsx`。
*   **边界：** 实现所有 HITL 模式界面。

---

#### 任务 7.1：人工编辑实现 (Manual Editing - R4)

*   **目标：** 集成富文本 (Tiptap/Novel) 和代码编辑器 (Monaco)，实现人工编辑和版本创建流程。
*   **输入：** `<design_doc> (5.1.4)`, `<architecture> (5.5)`, `<api> (5.4.1)`, Deer-Flow Editor 代码。
*   **输出：** `PlatformEditor.tsx` (封装 Novel/Monaco), 更新 `CompletedView.tsx`, `InspectorStore.ts`。
*   **核心关注点：** 编辑模式切换；编辑器集成；保存逻辑与版本摘要输入。
*   **实现策略:**
    1.  **编辑器封装：** 迁移并适配 Deer-Flow 的 Tiptap/Novel 实现。集成 Monaco Editor。创建 `PlatformEditor.tsx` 根据工件类型选择渲染。
    2.  **`InspectorStore` 更新：** 实现 `isEditing` 状态管理。
    3.  **`CompletedView.tsx` (更新):** 实现“Manual Edit”按钮。根据 `isEditing` 状态切换视图。
    4.  **保存流程：** 实现“Save & Activate”按钮。弹出 `Dialog` 输入 `summary`。调用 `WorkflowStore.submitManualEdit`。成功后退出编辑模式。
*   **边界：** 实现完整的人工编辑流程。

---

#### 任务 7.2：版本切换与陈旧性管理实现

*   **目标：** 实现历史版本的激活功能，并确保陈旧性管理（静默状态管理）正确运行。
*   **输入：** `<design_doc> (3.1.2.3, 3.3.4)`, `<api> (5.4.2)`, 任务 5.4 (HistoryTab)。
*   **输出：** 更新 `HistoryTab.tsx`。
*   **核心关注点：** “Activate”操作；强制性确认对话框（警告下游陈旧性）；Generator 节点限制；WebSocket 联动刷新验证。
*   **实现策略:**
    1.  **`HistoryTab.tsx` (更新):** 实现“Activate”按钮逻辑。
    2.  **限制：** 禁用 Generator 节点的激活按钮。
    3.  **确认对话框：** 弹出 `AlertDialog`，文案严格遵循 Design Doc 3.3.4。
    4.  **激活逻辑：** 确认后，调用 `WorkflowStore.activateVersion`。
    5.  **验证陈旧性：** 确认操作后，WebSocket 事件（`NODE_ACTIVE_VERSION_CHANGED`）能正确触发 `refreshWorkflow`（已在任务 1.5 实现），并更新 UI 上的陈旧性标志（已在任务 4.3 实现）。
*   **边界：** 实现版本切换和陈旧性管理的完整闭环。

---

#### 任务 8.1：项目导出功能实现

*   **目标：** 实现项目成果导出为 ZIP 包的功能 (R6)。
*   **输入：** `<api> (3.3.2)`, 任务 4.1 (ProjectControlBar)。
*   **输出：** 更新 `ProjectControlBar.tsx`, `ProjectService.ts`。
*   **核心关注点：** 处理二进制（ZIP）响应；触发浏览器下载。
*   **实现策略:**
    1.  **`ProjectService.ts` (更新):** 实现 `exportProject` 方法。特殊处理 `fetch` 响应（获取 Blob），使用 `URL.createObjectURL` 和动态创建的 `<a>` 标签触发下载。
    2.  **`ProjectControlBar.tsx` (更新):** 连接“Export Project”按钮，实现加载状态管理和反馈（Toast）。
*   **边界：** 实现导出功能。

---

#### 任务 8.2：复杂动效和转场实现

*   **目标：** 实现 Design Doc 5.2 中定义的复杂动画效果，提升用户体验。
*   **输入：** `<design_doc> (5.2)`, 任务 0.2 (Motion Tokens), Framer Motion。
*   **输出：** 更新 `WorkflowCanvas.tsx`, `CustomNode.tsx`, `InspectorPanel.tsx`。
*   **核心关注点：** 布局动画（Layout Animation）；交错进入动画（Staggering）；内容切换动画（AnimatePresence）。
*   **实现策略:**
    1.  **动态结构更新 (5.2.2)：** 在 `WorkflowCanvas.tsx` 和 `CustomNode.tsx` 中，集成 Framer Motion。使用 `layout` 属性实现节点位置变化的平滑过渡。为新生成的节点实现交错进入动画（使用 `staggerChildren`）。
    2.  **节点状态转换 (5.2.1)：** 优化 `CustomNode.tsx` 中的状态过渡动画（如图标旋转、BorderBeam 淡入）。
    3.  **上下文切换 (5.2.4)：** 在 `InspectorPanel.tsx` 中，使用 `<AnimatePresence mode="wait">` 包裹内容区域（以 `selectedNodeId` 为 key），实现切换节点时的平滑转场。
*   **边界：** 实现指定的动画效果。

---

#### 任务 8.3：国际化 (i18n) 与响应式设计

*   **目标：** 集成国际化支持，审查文案，并确保响应式设计（Desktop-First）。
*   **输入：** `<design_doc> (3.3, 4.1.3.3)`.
*   **输出：** 更新所有 UI 组件，`messages/en.json`，更新布局文件。
*   **核心关注点：** 文案规范化；工作区布局适应（`< lg` 断点）。
*   **实现策略:**
    1.  **i18n 集成：** 复用 Deer-Flow 的 `next-intl` 配置。系统地将所有 UI 硬编码文本提取到 `messages/en.json`，并使用 `useTranslations()`。根据 Design Doc 3.3 审查关键文案。
    2.  **响应式设计：** 在 `[projectId]/layout.tsx` 中，使用媒体查询或 Hook 检测屏幕尺寸。当尺寸小于 `lg` (1024px) 时，将 `ResizablePanel` 布局切换为 `Shadcn Drawer`（抽屉）模式来显示 `InspectorPanel`。
*   **边界：** 完成国际化、文案标准化和主要的响应式布局调整。