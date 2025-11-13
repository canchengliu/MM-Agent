<design_doc>
--- (96-96 lines) ---
| P2.3 | 历年赛题库初始化 | 从平台提供的历年赛题库中选择并初始化项目。 | FRS 3.3 | P2 |


--- (97-97 lines) ---
| P2.4 | 赛题类型选择 | 用户必须选择建模赛题的类型 (A-F 或 '-'). | FRS 3.4 | P0 |


--- (103-103 lines) ---
| W1.1 | 工作流启动 | 创建 WorkflowInstance，捕获配置快照，并自动开始执行第一个节点。 | FRS 3.5 | P0 |


--- (253-258 lines) ---
  * **Project (项目)**
      * *定义:* 封装一次建模任务的顶级容器。
      * `id`, `name`, `description`.
      * `status` (enum: Configuring, Running, Completed): 项目生命周期状态。**(前端关键：决定项目视图和可用操作)**。
      * `problem_type` (enum).
      * `workflow_instance_id` (integer | null): **(前端关键：判断工作流是否已启动)**。


--- (259-261 lines) ---
  * **ProjectFile (项目文件)**
      * `id`, `filename`.
      * `role` (enum: Problem Description, Dataset, Reference Material): **(前端关键：启动工作流的前置条件检查)**。


--- (347-349 lines) ---
              * **/{project\_id}** (项目详情)
                  * /config (配置页面：上传文件、设置类型)
                  * **/workflow** (工作流执行界面 - 核心交互区)


--- (453-457 lines) ---
        2.  用户点击 [Approve & Continue] (B3)。
        3.  **系统响应 (API):** `POST /nodes/{id}/hitl` (action: Continue, data: Option X)。
        4.  **系统处理 (后端):** 固化新版本 V1，设为 `active_version`。Node A 状态更新为 `Completed`。判断并启动下一个节点 (Node B)。
        5.  **系统响应 (API/WebSocket):** API 返回 `action: ExecuteNext`。WebSocket 推送 `NODE_STATUS_UPDATED` (A-\>Completed, B-\>Executing) 和 `NODE_ACTIVE_VERSION_CHANGED` (A)。
        6.  **UI 更新与导航:** UI 自动导航到 Node B。Left Navigator 更新状态图标。


--- (648-652 lines) ---
##### 1\. 状态同步范式 (State Synchronization Paradigm)

  * 严格遵循 API 6.1 原则：**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新。**
  * **关键规则:** WebSocket 断线重连后，必须立即重新调用 REST API 获取全量快照，以保证数据一致性。



--- (657-662 lines) ---
  * **检测与传播逻辑:**
    1.  **触发:** 前端监听到 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。
    2.  **同步:** 前端必须立即调用 `GET /workflows/{id}` 重新获取全量工作流状态，以更新所有节点的 `is_stale` 标志。
  * **视觉传达:**
      * **全局 (Navigator A):** 在 `is_stale: true` 的节点旁显示清晰的 ⚠️ 图标。Hover 显示 Tooltip 解释原因。
      * **局部 (Workspace B1):** 如果当前节点过时，显示醒目的、不可关闭的 `Staleness Banner`。


--- (702-704 lines) ---
#### C. 布局模板 2：三栏式工作流执行布局 (Template 2: The Cockpit Layout)

  * **应用场景：** 工作流执行界面 (`/projects/{id}/workflow`)。


--- (1512-1513 lines) ---
  * 图标: `AlertTriangle`, `text-status-awaiting` (Amber 500)。
  * **交互:** 必须使用 `Shadcn/ui Tooltip` 包裹。Hover 时显示：“Stale: Upstream dependency [Node Name] has changed.”


--- (1737-1743 lines) ---
##### B. 实现约定与最佳实践

1.  **主题与样式:** 严格遵守 Design Tokens。使用 CSS Variables 实现主题。默认深色模式。使用 `cn` 工具函数组合类名。
2.  **状态同步范式 (关键):** 严格遵循“REST API 为全量快照（Source of Truth），WebSocket 提供增量更新”的原则（参见 3.1.2.C.1）。实现健壮的断线重连和重连后的全量同步。
3.  **Staleness 处理逻辑:** 监听到 `NODE_ACTIVE_VERSION_CHANGED` 事件后，必须立即重新获取全量工作流状态以更新 `is_stale` 标志。
4.  **动态结构处理:** `WORKFLOW_STRUCTURE_UPDATED` 事件必须触发 Zustand Store 的全量替换。


</design_doc>

<api>
--- (508-517 lines) ---
### 核心概念

*   **项目 (Project)**: 用户工作的基本单元。一个项目封装了特定的建模任务，包含了所有相关的输入文件、配置快照、以及一个（且仅一个）工作流实例。
*   **项目生命周期 (Project Lifecycle)**:
    1.  **`Configuring` (配置中)**: 项目的初始状态。在此阶段，用户可以上传文件、修改项目元数据、并从历史案例库中初始化数据。
    2.  **`Running` (运行中)**: 当用户启动工作流后，项目进入此状态。此状态下，项目的主要配置（如名称、描述）仍可修改，但工作流已激活并开始执行。
    3.  **`Completed` (已完成)**: 当项目内的工作流执行完毕后，项目进入此最终状态。
*   **文件角色 (File Role)**: 上传到项目的文件必须被赋予一个明确的角色（如 `Problem Description`, `Dataset`），以便工作流中的节点能够准确地消费它们。
*   **配置快照 (Configuration Snapshot)**: 在“启动工作流”的瞬间，系统会捕获用户当前的个人设置（如自定义的 LLM API Key）。这个快照被永久保存在项目中，确保了工作流执行的可复现性，即使之后用户更改了个人设置，也不会影响正在运行或已完成的项目。



--- (560-573 lines) ---
```jsonc
{
  "id": 1,
  "name": "2024 MCM Problem A Analysis",
  "status": "Configuring", // UI应根据此状态决定启用/禁用“启动工作流”按钮
  "problem_type": "-", // 若为"-"，UI应提示用户设置此项
  "created_at": "2024-05-25T10:00:00Z",
  "updated_at": "2024-05-25T10:00:00Z",
  "workflow_instance_id": null, // 若非null，表示工作流已创建，UI应显示工作流相关信息
  "description": "An initial attempt to model the dynamics of the specified ecosystem.",
  "files": [], // 用于渲染项目文件列表
  "historical_problem_id": null // 若非null，UI可显示“基于xxx案例初始化”
}
```


--- (638-643 lines) ---
*   `problem_type` (enum, *optional*): 问题类型。可选值: `"A"`, `"B"`, `"C"`, `"D"`, `"E"`, `"F"`, `"-"`。

##### 状态相关的可变性
*   在 `Configuring` 状态下，`name`, `description`, 和 `problem_type` 均可修改。
*   在 `Running` 或 `Completed` 状态下，只有 `name` 和 `description` 可以修改。尝试修改 `problem_type` 将导致 `409 Conflict` 错误。



--- (671-678 lines) ---
*   **`role`** (string, **required**): 文件的角色。其值决定了文件在工作流中如何被使用。
    *   `Problem Description`: 核心问题描述文档，通常是启动工作流的必要条件。
    *   `Dataset`: 建模所需的数据文件，如 CSV, JSON, TXT 等。
    *   `Reference Material`: 辅助性的参考资料，如相关论文、背景介绍等。

##### **重要说明**
虽然系统允许您为一个项目上传多个相同角色的文件（例如，多个 `Dataset` 文件），但工作流的特定节点可能要求某个角色是唯一的。例如，`start_workflow` 操作要求项目中**有且仅有一个** `Problem Description` 文件。前端应在 UI 层面引导用户，对于需要唯一性的角色，后续上传应视为“替换”而非“新增”。



--- (690-709 lines) ---
#### 2.2. 从历史案例库初始化项目

*   **Endpoint**: `POST /projects/{project_id}/initialize-from-historical`
*   **权限**: 项目所有者。
*   **描述**: 使用一个预置的历史竞赛题目来快速配置项目。此操作会自动将历史题目的描述文件和数据集（如果存在）复制并关联到当前项目，同时设置项目的 `problem_type`。

##### 请求体 (`HistoricalInitializationRequest`)
```json
{
  "historical_problem_id": 5
}
```
*   `historical_problem_id` (integer, **required**): 历史题目的唯一ID。 (可通过 `GET /historical-problems` 获取)

##### 成功响应 (`200 OK`)
返回更新后的 `ProjectDetailRead` 对象，其 `files` 列表和 `problem_type` 字段已被填充。

##### 错误响应
*   `424 Dependency Failed` (`DEPENDENCY_FAILED`): 后端服务器上找不到历史题目对应的物理文件。



--- (714-752 lines) ---
#### 3.1. 启动项目工作流

*   **Endpoint**: `POST /projects/{project_id}/start`
*   **权限**: 项目所有者。
*   **描述**: 这是项目从“配置”到“运行”的关键操作。执行此操作会：
    1.  **校验前置条件**: 检查项目状态、问题类型是否设置、以及是否已上传“问题描述”文件。
    2.  **创建配置快照**: 永久记录用户当前的个人设置。
    3.  **创建工作流实例**: 在数据库中生成完整的工作流结构。
    4.  **变更项目状态**: 将项目状态更新为 `Running`。
    5.  **启动执行**: 将工作流的第一个节点加入后台执行队列。

##### 执行影响
*   **异步处理**: 这是一个异步操作，API 会立即返回 `202 Accepted`，表示任务已接收。
*   **状态变更**: 项目的 `status` 将变为 `Running`。
*   **WebSocket 事件**: 后续的节点状态更新将通过 WebSocket 的 `NODE_STATUS_UPDATED` 事件推送。
*   **UI 交互**: 前端在收到 `202` 响应后，应立即禁用“启动”按钮并显示加载状态，然后根据 WebSocket 事件更新界面。

##### 成功响应 (`202 Accepted`)
请求被接受，后台任务已启动。响应体是新创建工作流的**第一个节点**的实例信息 (`NodeInstanceRead`)。前端可以利用这个信息直接导航到第一个节点的视图。
```jsonc
{
  "id": 100,
  "definition_id": "1.1.1",
  "name": "Problem Deconstruction and Mathematical Formulation",
  "status": "Executing", // 注意：状态已是Executing，表示任务已成功入队
  "current_stage": "Initializing",
  "node_type": "Standard",
  "hitl_mode": "AVL",
  "order_index": 0,
  "active_version_id": null,
  "phase_id": "Phase 1: Strategic Analysis & Macro Architecture",
  "task_group_id": null,
  "is_stale": false
}
```

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): 不满足启动的前置条件（如状态不正确、缺少文件等）。



--- (777-802 lines) ---
#### 4.1. 获取历史案例库列表

*   **Endpoint**: `GET /historical-problems`
*   **权限**: 任何已认证的用户。
*   **描述**: 获取所有可用于初始化项目的历史竞赛题目列表。此数据用于填充前端的“从模板创建”或“选择历史题目”下拉菜单/列表。

##### 成功响应 (`200 OK`)
返回一个历史问题对象的数组。
```jsonc
[
  {
    "id": 5, // 这个ID将用于 POST /projects/{id}/initialize-from-historical
    "year": 2023,
    "type": "C", // 用于预填充项目的 problem_type
    "name": "Wordle Problem Analysis",
    "has_dataset": true // UI可根据此标志决定是否显示“包含数据集”的标签
  },
  {
    "id": 6,
    "year": 2022,
    "type": "A",
    "name": "Bicycle Gearing Optimization",
    "has_dataset": false
  }
]
```


--- (824-834 lines) ---
#### 5.2. ProjectDetailRead

用于展示单个项目详情的完整信息对象，继承自 `ProjectSummaryRead`。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| *(所有 ProjectSummaryRead 字段)* | | ... |
| `description` | string \| null | 项目的详细描述。 |
| `files` | array (ProjectFileRead) | 与项目关联的文件列表。参见 `ProjectFileRead` 定义。 |
| `historical_problem_id` | integer \| null | 如果项目基于历史案例初始化，则为该案例的 ID。 |



--- (846-866 lines) ---
#### 5.4. NodeInstanceRead

表示工作流中单个节点的当前状态和基本信息。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 节点实例的唯一标识符。 |
| `definition_id` | string | 节点在工作流定义中的静态 ID (例如, "1.1.1")。 |
| `name` | string | 节点的显示名称。 |
| `status` | string (enum) | 节点的当前执行状态。可选值: `"Not Started"`, `"Executing"`, `"Awaiting HITL Approval"`, `"Completed"`, `"Failed"`, `"Canceled"`。**[新增]** `Canceled` 状态表示执行被用户取消。 |
| `current_stage` | string (enum) | 节点更详细的执行阶段。可选值: `"Not Started"`, `"Initializing"`, `"Processing"`, `"Generating Outputs"`, `"Awaiting Review"`, `"Completed"`, `"Failed"`。 |
| `node_type` | string (enum) | 节点的类型。可选值: `"Standard"`, `"Generator"`。 |
| `hitl_mode` | string (enum) | 节点的人机交互模式。可选值: `"VARL"`, `"SCA"`, `"AVL"`。 |
| `order_index` | integer | 节点在工作流中的顺序索引 (从 0 开始)。 |
| `active_version_id` | integer \| null | 当前活动的版本 ID。若节点未完成，则为 `null`。 |
| `phase_id` | string | 节点所属的阶段名称 (例如, "Phase 1: ...")。 |
| `stage_id` | string | 节点所属 Stage 的唯一 ID (例如, "1.1" 或 "Task_A1.2.1")。 |
| `stage_name` | string | Stage 的显示名称 (例如, "Strategic Definition")。 |
| `task_group_id` | string \| null | 如果节点是动态生成的，则为所属的任务组 ID。 |
| `is_stale` | boolean | **[新增]** 指示该节点的输入依赖相对于其上游节点的最新活动版本是否已过时。`true` 表示过时，前端应提供视觉提示（如警告图标），建议用户重新执行。 |



--- (878-879 lines) ---

*   **项目与工作流**: 每个`项目 (Project)`在生命周期中最多拥有一个`工作流实例 (WorkflowInstance)`。工作流的创建和管理都与项目强绑定。


--- (964-964 lines) ---
> *   请注意，启动工作流的操作并非此 API，而是属于项目管理的一部分 (`POST /projects/{project_id}/start`)。


--- (1680-1689 lines) ---
#### 5.1. `NODE_STATUS_UPDATED` (高频)

*   **描述**: 工作流中单个节点的状态发生变化。这是构建动态 UI 的核心事件。
*   **`data` 负载**: `NodeInstanceRead` 对象 (节点的**完整**最新数据，**包含 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **状态变更**: 根据 `status` (现在包括 `Canceled`) 和 `current_stage` 更新节点的视觉表现。
    *   **交互锁定**: 当 `status` 变为 `Executing` 时，应禁用该节点上的所有操作按钮（如"执行"、"批准"），并显示加载指示器。
    *   **交互解锁**: 当 `status` 变为 `Awaiting HITL Approval`, `Failed`, 或 `Canceled` 时，应解锁对应的 HITL 操作按钮（如"批准/拒绝"或"重试"）。
    *   **数据刷新**: 如果用户正在查看该节点的详细视图，应使用事件 `data` 中的信息刷新视图内容。


</api>

<front_stack>
--- (5-11 lines) ---
### 一、 核心框架与构建

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **React** | 项目的核心 UI 库，所有组件都基于 React 构建。 |
| **Next.js** | 应用框架，提供了服务器端渲染 (SSR)、静态站点生成 (SSG)、基于 `app` 目录的文件系统路由、API 路由以及其他现代化 Web 开发功能。 |
| | ↳ **App Router** | 项目采用最新的 App Router 架构，支持 React Server Components (RSC) 和客户端组件。 |


--- (20-24 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |


--- (45-52 lines) ---
### 五、 UI 组件库与视觉效果

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |
| **Sonner** | 用于显示轻量级的 Toast 通知（消息提示）。 |


--- (83-90 lines) ---
### 七、 表单处理与数据校验

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **React Hook Form** | 用于管理设置页面 (`settings`) 的表单状态、校验和提交。 |
| **Zod** | 一个 TypeScript-first 的 schema 声明和校验库，用于定义表单数据结构和验证规则。 |
| **`@hookform/resolvers`** | 用于将 Zod schema 与 React Hook Form 集成，实现无缝的表单验证。 |



--- (138-142 lines) ---
项目在 Shadcn/ui 的基础上构建了丰富且高度可复用的应用层组件，集中体现于 `app/chat/components/` 目录。

| 组件/模式 | 描述与复用价值 |
| :--- | :--- |
| **`InputBox`** | 一个功能完备的聊天输入框组件。它封装了：<br>- **富文本输入**: 基于 Tiptap/Novel，支持 `@mention` 等功能。<br>- **异步操作**: 内置“增强提示” (`Enhance Prompt`) 功能，包含加载和动画状态。<br>- **状态同步**: 通过 `useRef` 和 `useImperativeHandle` 暴露 `submit`, `setContent` 等方法，供父组件调用。<br>- **动态 UI**: 使用 `AnimatePresence` 展示用户反馈提示，并带有精美的动画效果。 |


--- (151-162 lines) ---
#### 2. 核心业务逻辑与状态管理模式

项目基于 Zustand 构建了清晰、高效的状态管理架构，核心代码位于 `core/store/`。

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **状态与设置分离** | `store.ts` 负责管理**会话相关的动态状态**（如消息、响应状态），而 `settings-store.ts` 负责管理**用户配置**。这种分离使得状态管理更加清晰，易于维护。 |
| **`sendMessage` 异步流程编排** | 这个核心函数是整个聊天功能的驱动器。它展示了：<br>1. **乐观更新**: 立即将用户消息追加到状态中。<br>2. **流式处理**: 调用 `chatStream` 并通过 `for await...of` 循环处理 SSE 事件。<br>3. **批量更新**: 使用 `setTimeout` 和 `Map` 对来自流的多个消息更新事件进行批处理，减少 React 的重渲染次数，提升性能。<br>4. **错误处理**: 使用 `try...finally` 确保无论成功与否，`responding` 状态都能被正确重置。 |
| **`mergeMessage` 纯函数** | 位于 `core/messages/merge-message.ts`，这是一个独立的、无副作用的函数，负责根据收到的 SSE 事件更新单个消息对象的状态。这种模式将状态变更的复杂逻辑从主流程中剥离，使其易于测试和维护，是 Reducer 模式的体现。 |
| **派生状态选择器 (Selectors)** | 项目定义了多个自定义 Hook (`useMessage`, `useRenderableMessageIds`, `useLastInterruptMessage`) 来从 store 中派生和选择数据。它们结合 `useShallow` 进行性能优化，封装了获取特定状态的逻辑，避免了组件内的重复计算。`useRenderableMessageIds` 尤其巧妙，它预先过滤出需要在 UI 中渲染的消息，从根源上解决了 React 列表渲染时的 `key` 值警告问题。 |
| **LocalStorage 持久化** | `settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数提供了一个简洁明了的模式，用于将 Zustand store 的状态与 `localStorage` 同步，实现了用户设置的持久化。 |



--- (163-171 lines) ---
#### 3. API 通信与数据处理模式

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **模拟流式响应 (`chatReplayStream`)** | `core/api/chat.ts` 中的 `chatReplayStream` 函数是一个极具价值的工具。它能够读取静态文本文件，并**模拟**一个实时的 SSE 流，甚至可以控制快进。这对于开发、调试、演示和编写测试用例都非常有用。 |
| **健壮的 JSON 解析 (`parseJSON`)** | 位于 `core/utils/json.ts`，这个工具函数使用 `best-effort-json-parser` 并结合自定义逻辑来处理来自 LLM 的、可能不完全合规的 JSON 字符串（例如，后面跟着多余的文本）。这对于与大语言模型交互的应用来说至关重要。 |
| **Markdown 预处理** | `core/utils/markdown.ts` 提供了一系列用于清理和规范化 Markdown 文本的函数，特别是 `normalizeMathForEditor` 和 `unescapeLatexInMath`，它们解决了在富文本编辑器中正确处理 LaTeX 数学公式的痛点。 |
| **统一的 API URL 解析** | `core/api/resolve-service-url.ts` 中的 `resolveServiceURL` 函数确保了所有对后端服务的请求都通过一个统一的函数来构建 URL，便于管理和切换 API 基地址。 |



--- (172-178 lines) ---
#### 4. 国际化 (i18n) 实现模式

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **服务端 Cookie 读取** | `src/i18n.ts` 中使用 `next/headers` 的 `cookies()` 函数，在**服务端**直接读取 `NEXT_LOCALE` Cookie。这使得在 RSC 或服务器端渲染时就能确定用户的语言偏好，无需等待客户端加载。 |
| **动静结合的语言切换** | `components/deer-flow/language-switcher.tsx` 组件展示了一种实用的语言切换策略：通过客户端 JavaScript 设置 Cookie (`document.cookie = ...`)，然后强制刷新页面 (`window.location.reload()`)。虽然会刷新页面，但这种方法简单可靠，能确保服务端的 `i18n.ts` 能立即读到最新的 Cookie 值并应用正确的语言包。 |



--- (181-185 lines) ---
| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **类型安全的环境变量** | `src/env.js` 使用 `@t3-oss/env-nextjs` 将环境变量分为 `server` 和 `client` 两部分，并使用 Zod 进行校验和类型定义。`runtimeEnv` 则负责将 `process.env` 的值安全地映射到这些定义上，同时处理了布尔值等类型的转换。这是一个确保应用配置正确、避免运行时错误的最佳实践。 |
| **运行时配置获取** | `core/api/hooks.ts` 中的 `useConfig` Hook 展示了如何从后端异步获取应用配置（如可用的 LLM 模型）。它包含了**重试逻辑**和**超时机制**，并在失败后回退到默认配置，增强了应用的鲁棒性。 |



--- (198-208 lines) ---
### 十五、 架构模式与项目组织

项目的目录结构和代码组织方式遵循了现代大型前端应用的**最佳实践**，非常值得借鉴。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **功能切片 (Feature-Sliced) 路由** | `app/` 目录下的结构（如 `app/chat/`, `app/landing/`, `app/settings/`）体现了按功能组织代码的原则。每个功能模块都是一个独立的单元，包含了自身的页面、组件和逻辑，使得项目结构清晰，易于扩展和维护。 |
| **组件分层** | 项目中的 `components/` 目录被清晰地划分为三层：<br>1. **`ui/`**: 基础 UI 组件，源自 Shadcn/ui，是应用的视觉基石。<br>2. **`deer-flow/`**: 应用级的共享组件，如 `Logo`, `Markdown`, `Tooltip` 等。它们封装了通用逻辑，在多个功能模块中复用。<br>3. **`magicui/`**: 高度定制化的视觉特效组件，与业务逻辑解耦，可轻松移植到任何项目中。 |
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |
| **自定义 Hooks 封装** | `hooks/` 目录提供了可复用的 React Hooks，如 `useIntersectionObserver` 和 `useIsMobile`。它们将复杂的浏览器 API 或重复的逻辑封装成简单易用的钩子，简化了组件代码。 |



--- (213-218 lines) ---
| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **基于 CSS 变量的主题系统** | `styles/globals.css` 中，通过在 `:root` 和 `.dark` 选择器下定义大量的 CSS 自定义属性 (custom properties)，构建了整个应用的主题系统。所有颜色、半径等设计令牌 (design tokens) 都被变量化，使得主题切换（通过 `next-themes`）仅需切换一个顶层 class，浏览器即可高效地重绘。 |
| **Tailwind `@theme` 指令** | 通过 `@theme` 指令，项目将 CSS 变量（如 `--app-background`）与 Tailwind 的配置相结合，创建了语义化的工具类（如 `bg-app`）。这使得在组件中可以直观地使用主题颜色，而无需关心具体的色值。 |
| **`cn` 工具函数** | `lib/utils.ts` 中的 `cn` 函数是整个项目的标准实践。它结合了 `clsx` 和 `tailwind-merge`，解决了在 React 组件中动态、条件性地组合 Tailwind 类名时的所有痛点（如条件判断、样式覆盖冲突），是现代 Tailwind 项目的必备工具。 |



--- (229-236 lines) ---
### 十viii、 鲁棒性与回退策略

项目在代码中体现了防御性编程的思想，确保在各种异常情况下应用依然能稳定运行。

| 策略/模式 | 描述与复用价值 |
| :--- | :--- |
| **API 请求重试与超时** | `core/api/hooks.ts` 中的 `useConfig` Hook 在 `fetch` 配置时，不仅设置了超时 (`AbortSignal.timeout`)，还实现了带有指数退避 (exponential backoff) 的重试逻辑。这显著提高了应用在网络不佳情况下的稳定性。 |
| **组件级错误回退** | `components/deer-flow/fav-icon.tsx` 组件的 `img` 标签上使用了 `onError` 事件处理器。当网站图标加载失败时，它会自动切换到一个通用的备用图标，避免了在 UI 上显示破碎的图片。 |


--- (267-271 lines) ---
| 领域 | 实践与价值 |
| :--- | :--- |
| **安全性** | **防范 XSS 攻击**: 渲染用户生成或来自 API 的内容时，项目始终使用 `react-markdown` (`Markdown` 组件) 或通过 Tiptap 的安全机制进行渲染，而不是直接使用 `dangerouslySetInnerHTML`。<br>**安全处理用户输入**: `components/editor/index.tsx` 中的富文本编辑器在处理粘贴内容时，通过 `handleImagePaste` 和 `transformPastedHTML` 等逻辑对输入进行过滤和转换，防止粘贴恶意的 HTML 代码。<br>**安全的外部链接**: 在所有 `target="_blank"` 的链接中，都添加了 `rel="noopener noreferrer"`，防止了潜在的 "tabnabbing" 漏洞。 |
| **可访问性 (a11y)** | **语义化 HTML**: 项目结构良好，使用了恰当的 HTML5 标签（`header`, `main`, `footer`, `section` 等）。<br>**Radix UI 基础**: 由于 UI 组件库基于 Radix UI，所有组件（如 `Dialog`, `DropdownMenu`, `Tooltip`）都内置了完善的键盘导航支持、焦点管理和 ARIA 属性，提供了坚实的可访问性基础。例如，弹窗打开时焦点会自动移入，关闭后会返回原处。 |


</front_stack>

<deer_flow_frontend_code>
--- (772-857 lines) ---
### core/models/project.model.ts Content:

```ts
import { z } from "zod";

import {
  FileRoleEnum,
  ProblemTypeEnum,
  ProjectStatusEnum,
} from "~/constants/enums";

import { NodeInstanceReadSchema } from "./workflow.model";

// --- Read Models (Responses) ---

// API 3.5.3: ProjectFileRead
export const ProjectFileReadSchema = z.object({
  id: z.number().int(),
  filename: z.string(),
  role: FileRoleEnum,
  created_at: z.string().datetime(), // ISO 8601 format
});
export type ProjectFileRead = z.infer<typeof ProjectFileReadSchema>;

// API 3.5.1: ProjectSummaryRead (Used in project lists - FRS 2.3)
export const ProjectSummaryReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: ProjectStatusEnum,
  problem_type: ProblemTypeEnum,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // Indicates if the workflow has been started (Design Doc 2.1.1.B)
  workflow_instance_id: z.number().int().nullable(),
});
export type ProjectSummaryRead = z.infer<typeof ProjectSummaryReadSchema>;

// API 3.5.2: ProjectDetailRead (Extends Summary with details)
export const ProjectDetailReadSchema = ProjectSummaryReadSchema.extend({
  description: z.string().nullable(),
  files: z.array(ProjectFileReadSchema),
  historical_problem_id: z.number().int().nullable(),
});
export type ProjectDetailRead = z.infer<typeof ProjectDetailReadSchema>;

// API 3.4.1: HistoricalProblemRead (For the historical case library - FRS 3.3)
export const HistoricalProblemReadSchema = z.object({
  id: z.number().int(),
  year: z.number().int(),
  type: ProblemTypeEnum,
  name: z.string(),
  has_dataset: z.boolean(),
});
export type HistoricalProblemRead = z.infer<typeof HistoricalProblemReadSchema>;

// API 3.3.1 Response: Start Workflow (Returns the first NodeInstanceRead)
export const StartWorkflowResponseSchema = NodeInstanceReadSchema;
export type StartWorkflowResponse = z.infer<typeof StartWorkflowResponseSchema>;

// --- Create/Update Models (Requests) ---

// API 3.1.1: ProjectCreate (FRS 2.2)
export const ProjectCreateSchema = z.object({
  name: z.string().trim().min(1, "Project name cannot be empty."),
  description: z.string().optional(),
});
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;

// API 3.1.4: ProjectUpdate (PATCH request)
export const ProjectUpdateSchema = z.object({
  name: z.string().trim().min(1, "Project name cannot be empty.").optional(),
  description: z.string().optional(),
  // Can only be updated in 'Configuring' state (enforced by backend)
  problem_type: ProblemTypeEnum.optional(),
});
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

// API 3.2.2: HistoricalInitializationRequest
export const HistoricalInitializationRequestSchema = z.object({
  historical_problem_id: z.number().int(),
});
export type HistoricalInitializationRequest = z.infer<
  typeof HistoricalInitializationRequestSchema
>;

```


--- (905-928 lines) ---
// API 3.5.4: NodeInstanceRead (Central model for Workflow visualization and state management)
export const NodeInstanceReadSchema = z.object({
  id: z.number().int(),
  definition_id: z.string(), // Static ID (e.g., "1.1.1")
  name: z.string(),
  // Execution State
  status: NodeStatusEnum,
  current_stage: ExecutionStageEnum,
  // Configuration
  node_type: NodeTypeEnum,
  hitl_mode: HITLModeEnum,
  order_index: z.number().int(),
  // Versioning
  active_version_id: z.number().int().nullable(),
  // Structural Context (Design Doc 2.1.1.D)
  phase_id: z.string(),
  stage_id: z.string(),
  stage_name: z.string(),
  task_group_id: z.string().nullable(), // For dynamically generated nodes
  // Staleness Indicator (R5.2, V4.1)
  is_stale: z.boolean(),
});
export type NodeInstanceRead = z.infer<typeof NodeInstanceReadSchema>;



--- (1490-1703 lines) ---
### core/api/project.service.ts Content:

```ts
import { AxiosError } from "axios";

import type { FileRole } from "~/constants/enums";
import type { PaginatedResponse } from "~/core/models/common.model";
import type {
  HistoricalInitializationRequest,
  HistoricalProblemRead,
  ProjectCreate,
  ProjectDetailRead,
  ProjectFileRead,
  ProjectSummaryRead,
  ProjectUpdate,
  StartWorkflowResponse,
} from "~/core/models/project.model";

import apiClient from "./client";

/**
 * API Service for Project Management (API 3).
 */
export const ProjectService = {
  // --- 1. Project Lifecycle Management (CRUD) (API 3.1) ---

  /**
   * Creates a new project (API 3.1.1).
   */
  createProject: async (data: ProjectCreate): Promise<ProjectDetailRead> => {
    try {
      // Expect 201 Created
      const response = await apiClient.post<ProjectDetailRead>("/projects/", data, {
        validateStatus: (status) => status === 201,
      });
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (PROJECT_NAME_EXISTS)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("PROJECT_NAME_EXISTS");
      }
      throw error;
    }
  },

  /**
   * Gets the list of projects for the current user (API 3.1.2).
   */
  getProjects: async (
    skip = 0,
    limit = 20,
  ): Promise<PaginatedResponse<ProjectSummaryRead>> => {
    const response = await apiClient.get<PaginatedResponse<ProjectSummaryRead>>(
      "/projects/",
      {
        params: { skip, limit },
      },
    );
    return response.data;
  },

  /**
   * Gets the detailed information of a specific project (API 3.1.3).
   */
  getProjectById: async (projectId: number): Promise<ProjectDetailRead> => {
    const response = await apiClient.get<ProjectDetailRead>(
      `/projects/${projectId}`,
    );
    return response.data;
  },

  /**
   * Updates a project's basic information (API 3.1.4).
   */
  updateProject: async (
    projectId: number,
    data: ProjectUpdate,
  ): Promise<ProjectDetailRead> => {
    try {
      const response = await apiClient.patch<ProjectDetailRead>(
        `/projects/${projectId}`,
        data,
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (e.g., modifying problem_type when not Configuring)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("INVALID_STATE_FOR_UPDATE");
      }
      throw error;
    }
  },

  /**
   * Deletes a project and all associated data (API 3.1.5).
   */
  deleteProject: async (projectId: number): Promise<void> => {
    // Expect 204 No Content
    await apiClient.delete(`/projects/${projectId}`, {
      validateStatus: (status) => status === 204,
    });
  },

  // --- 2. Project Configuration & Data Management (API 3.2) ---

  /**
   * Uploads a file to a project (API 3.2.1). Handles multipart/form-data.
   */
  uploadFile: async (
    projectId: number,
    file: File,
    role: FileRole,
  ): Promise<ProjectFileRead> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    // Expect 201 Created
    const response = await apiClient.post<ProjectFileRead>(
      `/projects/${projectId}/files`,
      formData,
      {
        headers: {
          // Axios automatically sets the correct Content-Type with boundary
          "Content-Type": "multipart/form-data",
        },
        validateStatus: (status) => status === 201,
        // Increase timeout for potentially large file uploads
        timeout: 120000, // 2 minutes
      },
    );
    return response.data;
  },

  /**
   * Initializes a project from a historical problem (API 3.2.2).
   */
  initializeFromHistorical: async (
    projectId: number,
    data: HistoricalInitializationRequest,
  ): Promise<ProjectDetailRead> => {
    try {
      const response = await apiClient.post<ProjectDetailRead>(
        `/projects/${projectId}/initialize-from-historical`,
        data,
      );
      return response.data;
    } catch (error) {
      // Handle 424 Dependency Failed (Historical files missing on server)
      if (error instanceof AxiosError && error.response?.status === 424) {
        throw new Error("DEPENDENCY_FAILED");
      }
      throw error;
    }
  },

  // --- 3. Workflow Orchestration & Export (API 3.3) ---

  /**
   * Starts the workflow for a project (API 3.3.1).
   */
  startWorkflow: async (projectId: number): Promise<StartWorkflowResponse> => {
    try {
      // Expect 202 Accepted. Returns the first node instance information.
      const response = await apiClient.post<StartWorkflowResponse>(
        `/projects/${projectId}/start`,
        null, // No body required
        {
          validateStatus: (status) => status === 202,
        },
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (Preconditions not met or invalid state)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("PRECONDITIONS_NOT_MET");
      }
      throw error;
    }
  },

  /**
   * Exports the project results as a ZIP file (API 3.3.2).
   */
  exportProject: async (projectId: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/export`, {
        responseType: "blob", // Important for handling binary file downloads
        timeout: 300000, // 5 minutes timeout for export generation
      });
      return response.data;
    } catch (error) {
      // Handle 404 Not Found (Workflow not started)
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new Error("WORKFLOW_NOT_STARTED");
      }
      throw error;
    }
  },

  // --- 4. Auxiliary Data Query (API 3.4) ---

  /**
   * Gets the list of historical problems (API 3.4.1).
   */
  getHistoricalProblems: async (): Promise<HistoricalProblemRead[]> => {
    const response = await apiClient.get<HistoricalProblemRead[]>(
      "/historical-problems",
    );
    return response.data;
  },
};

```


--- (2966-3248 lines) ---
### core/store/slices/project.slice.ts Content:

```ts
import { toast } from "sonner";

import { ProjectService } from "~/core/api/project.service";
import type { FileRole } from "~/constants/enums";
import type {
  ProjectCreate,
  ProjectDetailRead,
  ProjectSummaryRead,
  ProjectUpdate,
} from "~/core/models/project.model";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { type SliceCreator } from "~/core/store";

export interface ProjectSlice {
  // State
  projects: ProjectSummaryRead[];
  currentProject: ProjectDetailRead | null;
  isLoadingProjects: boolean;
  isLoadingProjectDetail: boolean;
  isMutatingProject: boolean; // Covers create, update, delete
  isStartingWorkflow: boolean;

  // Actions
  fetchProjects: (force?: boolean) => Promise<void>;
  loadProjectDetail: (projectId: number) => Promise<ProjectDetailRead | null>;
  createProject: (
    data: ProjectCreate,
  ) => Promise<{
    success: boolean;
    project: ProjectDetailRead | null;
    error?: string;
  }>;
  updateProject: (projectId: number, data: ProjectUpdate) => Promise<boolean>;
  deleteProject: (projectId: number) => Promise<boolean>;
  uploadFile: (
    projectId: number,
    file: File,
    role: FileRole,
  ) => Promise<boolean>;
  startWorkflow: (projectId: number) => Promise<NodeInstanceRead | null>;
  clearCurrentProject: () => void;
}

export const createProjectSlice: SliceCreator<ProjectSlice> = (set, get) => ({
  projects: [],
  currentProject: null,
  isLoadingProjects: false,
  isLoadingProjectDetail: false,
  isMutatingProject: false,
  isStartingWorkflow: false,

  fetchProjects: async (force = false) => {
    if (get().isLoadingProjects || (!force && get().projects.length > 0)) return;

    set({ isLoadingProjects: true });
    try {
      // Fetching the first 100 projects (API 3.1.2).
      const response = await ProjectService.getProjects(0, 100);
      set({ projects: response.items });
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects.");
    } finally {
      set({ isLoadingProjects: false });
    }
  },

  loadProjectDetail: async (projectId) => {
    // Clear previous project details and set loading state
    set({ isLoadingProjectDetail: true, currentProject: null });
    try {
      const project = await ProjectService.getProjectById(projectId);
      set({ currentProject: project });
      return project;
    } catch (error) {
      console.error("Failed to load project detail:", error);
      toast.error(
        "Failed to load project details. It might not exist or you lack permissions.",
      );
      return null;
    } finally {
      set({ isLoadingProjectDetail: false });
    }
  },

  createProject: async (data) => {
    set({ isMutatingProject: true });
    try {
      const newProject = await ProjectService.createProject(data);
      set((state) => ({
        // Prepend the new project to the list (assuming list is sorted by creation/update time desc)
        // Cast required as ProjectDetailRead extends ProjectSummaryRead
        projects: [newProject as ProjectSummaryRead, ...state.projects],
      }));
      toast.success("Project created successfully.");
      return { success: true, project: newProject };
    } catch (error) {
      console.error("Failed to create project:", error);
      let errorType: string | undefined = "UNKNOWN";
      if (error instanceof Error && error.message === "PROJECT_NAME_EXISTS") {
        errorType = "PROJECT_NAME_EXISTS";
        toast.error("Project creation failed", {
          description: "A project with this name already exists.",
        });
      } else {
        toast.error("Failed to create project.");
      }
      return { success: false, project: null, error: errorType };
    } finally {
      set({ isMutatingProject: false });
    }
  },

  updateProject: async (projectId, data) => {
    if (Object.keys(data).length === 0) return true;

    set({ isMutatingProject: true });
    try {
      const updatedProject = await ProjectService.updateProject(projectId, data);

      set((state) => ({
        // Update the project in the summary list
        projects: state.projects.map((p) =>
          p.id === projectId ? (updatedProject as ProjectSummaryRead) : p,
        ),
        // Update the current project detail if it's the one being updated
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
      }));
      toast.success("Project updated successfully.");
      return true;
    } catch (error) {
      console.error("Failed to update project:", error);
      if (
        error instanceof Error &&
        error.message === "INVALID_STATE_FOR_UPDATE"
      ) {
        // API 3.1.4 State-related mutability constraint
        toast.error("Update failed", {
          description:
            "Cannot modify certain fields (like Problem Type) after the workflow has started.",
        });
      } else {
        toast.error("Failed to update project.");
      }
      return false;
    } finally {
      set({ isMutatingProject: false });
    }
  },

  deleteProject: async (projectId) => {
    set({ isMutatingProject: true });
    try {
      await ProjectService.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId
            ? null
            : state.currentProject,
      }));
      toast.success("Project deleted successfully.");
      return true;
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project.");
      return false;
    } finally {
      set({ isMutatingProject: false });
    }
  },

  uploadFile: async (projectId, file, role) => {
    // File upload state handling (not blocking main mutation state)
    try {
      const newFile = await ProjectService.uploadFile(projectId, file, role);

      // Update the currentProject details in the store to reflect the new file
      set((state) => {
        if (state.currentProject && state.currentProject.id === projectId) {
          let updatedFiles = [...state.currentProject.files];

          // API 3.2.1 Note: Handle unique roles (like Problem Description) as replacements in the UI.
          if (role === "Problem Description") {
            updatedFiles = updatedFiles.filter(
              (f) => f.role !== "Problem Description",
            );
          }
          updatedFiles.push(newFile);

          const updatedProject = {
            ...state.currentProject,
            files: updatedFiles,
          };
          return { currentProject: updatedProject };
        }
        return {};
      });

      toast.success(`File "${file.name}" uploaded successfully.`);
      return true;
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error(`Failed to upload file "${file.name}".`);
      return false;
    }
  },

  startWorkflow: async (projectId) => {
    set({ isStartingWorkflow: true });
    try {
      // API 3.3.1 returns the first node instance.
      const firstNode = await ProjectService.startWorkflow(projectId);

      // Optimistically update the project status locally before the confirmation fetch.
      const optimisticUpdate = (state: ProjectSlice) => {
        const updateFn = <T extends ProjectSummaryRead | ProjectDetailRead>(
          p: T,
        ): T => ({
          ...p,
          status: "Running" as const,
          // We don't have the workflow_instance_id yet, but we know it's active.
        });

        const updatedProjects = state.projects.map((p) =>
          p.id === projectId ? updateFn(p) : p,
        );
        const updatedCurrentProject =
          state.currentProject && state.currentProject.id === projectId
            ? updateFn(state.currentProject)
            : state.currentProject;

        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
        };
      };

      set(optimisticUpdate);

      // We must refresh the project detail to get the actual workflow_instance_id (API 3.1.3).
      // This ensures the UI correctly navigates to the workflow view.
      try {
        await get().loadProjectDetail(projectId);
      } catch (refreshError) {
        console.warn(
          "Workflow started, but failed to refresh project details immediately.",
          refreshError,
        );
      }

      toast.success(
        "Workflow started successfully. Navigating to the first task.",
      );
      return firstNode;
    } catch (error) {
      console.error("Failed to start workflow:", error);
      if (error instanceof Error && error.message === "PRECONDITIONS_NOT_MET") {
        // API 3.3.1 Error handling
        toast.error("Cannot start workflow", {
          description:
            "Please ensure the Problem Type is set and a Problem Description file is uploaded.",
        });
      } else {
        toast.error("Failed to start workflow.");
      }
      return null;
    } finally {
      set({ isStartingWorkflow: false });
    }
  },

  clearCurrentProject: () => {
    set({ currentProject: null });
  },
});



--- (4633-4653 lines) ---
### app/(platform)/projects/[projectId]/config/page.tsx Content:

```tsx
import { notFound } from "next/navigation";

import { ProjectConfigContainer } from "./components/project-config-container";

interface ProjectConfigPageProps {
  params: { projectId: string };
}

export default function ProjectConfigPage({ params }: ProjectConfigPageProps) {
  const numericProjectId = Number(params.projectId);

  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
    notFound();
  }

  return <ProjectConfigContainer projectId={numericProjectId} />;
}



--- (4661-4864 lines) ---

### app/(platform)/projects/[projectId]/config/components/project-config-container.tsx Content:

```tsx
"use client";

import {
  AlertCircle,
  ChevronLeft,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useShallow } from "zustand/react/shallow";

import { ProjectStatusBadge } from "~/components/platform/data-display/project-status-badge";
import { Timestamp } from "~/components/platform/data-display/timestamp";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useStore } from "~/core/store";

import { FileManagement } from "./file-management";
import { ProblemTypeSelector } from "./problem-type-selector";
import { ProjectDetailsForm } from "./project-details-form";

interface ProjectConfigContainerProps {
  projectId: number;
}

export function ProjectConfigContainer({
  projectId,
}: ProjectConfigContainerProps) {
  const {
    currentProject,
    isLoadingProjectDetail,
    loadProjectDetail,
    clearCurrentProject,
  } = useStore(
    useShallow((state) => ({
      currentProject: state.currentProject,
      isLoadingProjectDetail: state.isLoadingProjectDetail,
      loadProjectDetail: state.loadProjectDetail,
      clearCurrentProject: state.clearCurrentProject,
    })),
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoadError(null);
    setIsRefreshing(true);
    try {
      const project = await loadProjectDetail(projectId);
      if (!project) {
        setLoadError(
          "We couldn't load this project. It may have been deleted or you may not have access.",
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [loadProjectDetail, projectId]);

  useEffect(() => {
    void fetchProject();
    return () => {
      clearCurrentProject();
    };
  }, [clearCurrentProject, fetchProject]);

  const projectMeta = useMemo(() => {
    if (!currentProject) return null;
    const items: Array<{ label: string; value: ReactNode }> = [
      { label: "Project ID", value: `#${currentProject.id}` },
      {
        label: "Created",
        value: <Timestamp time={currentProject.created_at} />,
      },
      {
        label: "Updated",
        value: <Timestamp time={currentProject.updated_at} />,
      },
      {
        label: "Workflow",
        value: currentProject.workflow_instance_id ? "Started" : "Not started",
      },
    ];
    return items;
  }, [currentProject]);

  const showLoader = isLoadingProjectDetail && !currentProject && !loadError;

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link href="/projects">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {currentProject ? (
              <>
                <ProjectStatusBadge status={currentProject.status} />
                <span>
                  Last updated <Timestamp time={currentProject.updated_at} />
                </span>
              </>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchProject()}
              disabled={isRefreshing || isLoadingProjectDetail}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        {loadError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to load project</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        {showLoader ? (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed bg-background">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {currentProject ? (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-6">
              <ProjectDetailsForm project={currentProject} />
              <ProblemTypeSelector project={currentProject} />
            </div>

            <div className="space-y-6">
              <FileManagement project={currentProject} />
              {projectMeta ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Snapshot</CardTitle>
                    <CardDescription>
                      Quick reference for auditing and workflow readiness.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-3 text-sm">
                      {projectMeta.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between"
                        >
                          <dt className="text-muted-foreground">
                            {item.label}
                          </dt>
                          <dd className="font-medium text-foreground">
                            {item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}



--- (4867-5057 lines) ---
### app/(platform)/projects/[projectId]/config/components/problem-type-selector.tsx Content:

```tsx
"use client";

import { Info, Loader2 } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { ProblemType } from "~/constants/enums";
import type { ProjectDetailRead } from "~/core/models/project.model";
import { useStore } from "~/core/store";
import { cn } from "~/lib/utils";

const PROBLEM_TYPE_OPTIONS: Array<{
  value: ProblemType;
  title: string;
  description: string;
}> = [
  {
    value: "A",
    title: "Problem A",
    description:
      "Classical continuous modeling scenarios with heavy analytical reasoning.",
  },
  {
    value: "B",
    title: "Problem B",
    description:
      "Discrete, network, or combinatorial challenges often requiring heuristics.",
  },
  {
    value: "C",
    title: "Problem C",
    description: "Data-rich investigations with emphasis on statistical modeling.",
  },
  {
    value: "D",
    title: "Problem D",
    description: "Interdisciplinary scenario analysis and policy recommendations.",
  },
  {
    value: "E",
    title: "Problem E",
    description: "Emerging domains such as AI alignment or complex simulations.",
  },
  {
    value: "F",
    title: "Problem F",
    description: "Wildcard or “create your own” prompts with custom constraints.",
  },
  {
    value: "-",
    title: "Unassigned",
    description: "Leave unset until the official contest problem is announced.",
  },
];

interface ProblemTypeSelectorProps {
  project: ProjectDetailRead;
}

export function ProblemTypeSelector({ project }: ProblemTypeSelectorProps) {
  const { updateProject, isMutatingProject } = useStore(
    useShallow((state) => ({
      updateProject: state.updateProject,
      isMutatingProject: state.isMutatingProject,
    })),
  );
  const [pendingSelection, setPendingSelection] = useState<ProblemType | null>(
    null,
  );

  const isLocked = project.status !== "Configuring";
  const disabled = isLocked || isMutatingProject;

  const handleSelection = async (value: ProblemType) => {
    if (value === project.problem_type || disabled) return;
    setPendingSelection(value);
    try {
      await updateProject(project.id, { problem_type: value });
    } finally {
      setPendingSelection(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              Problem Type
            </CardTitle>
            <Tooltip>
              <TooltipTrigger className="text-muted-foreground">
                <Info className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-center">
                Pick the official contest problem letter (FRS P2.4). Once the
                workflow starts, this setting becomes immutable per Design Doc
                2.1.1.B.
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <CardDescription>
          Align the project configuration with the official contest statement to
          unlock task-specific automations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={isLocked ? "info" : "warning"}>
          <AlertTitle>
            {isLocked ? "Locked after workflow start" : "Required for execution"}
          </AlertTitle>
          <AlertDescription>
            {isLocked
              ? "The workflow has already progressed, so the problem type can no longer be modified."
              : "Select the problem type before starting the workflow to ensure model templates and heuristics are aligned."}
          </AlertDescription>
        </Alert>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROBLEM_TYPE_OPTIONS.map((option) => {
            const isActive = project.problem_type === option.value;
            const isPending = pendingSelection === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => void handleSelection(option.value)}
                disabled={disabled}
                className={cn(
                  "group rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{option.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.value === "-"
                        ? "Unassigned"
                        : `Letter ${option.value}`}
                    </p>
                  </div>
                  <Badge
                    variant={isActive ? "success" : "outline"}
                    className="whitespace-nowrap"
                  >
                    {isActive ? (
                      "Selected"
                    ) : isPending ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Saving
                      </>
                    ) : (
                      "Select"
                    )}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}



--- (5060-5318 lines) ---
### app/(platform)/projects/[projectId]/config/components/file-management.tsx Content:

```tsx
"use client";

import { AlertTriangle, UploadCloud } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useShallow } from "zustand/react/shallow";

import { Timestamp } from "~/components/platform/data-display/timestamp";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { FileRole } from "~/constants/enums";
import type { ProjectDetailRead } from "~/core/models/project.model";
import { useStore } from "~/core/store";
import { cn } from "~/lib/utils";

const FILE_ROLES: FileRole[] = [
  "Problem Description",
  "Dataset",
  "Reference Material",
];

type FileRoleDisplay = {
  label: string;
  description: string;
};

const ROLE_COPY: Record<FileRole, FileRoleDisplay> = {
  "Problem Description": {
    label: "Problem Description",
    description: "Primary contest prompt (must exist before starting workflow).",
  },
  Dataset: {
    label: "Dataset",
    description: "CSV, XLSX, or other structured data referenced downstream.",
  },
  "Reference Material": {
    label: "Reference Material",
    description: "Papers, notes, or supporting PDFs for the research team.",
  },
};

const ROLE_BADGE_VARIANT: Record<FileRole, "info" | "secondary" | "outline"> = {
  "Problem Description": "info",
  Dataset: "secondary",
  "Reference Material": "outline",
};

interface FileManagementProps {
  project: ProjectDetailRead;
}

export function FileManagement({ project }: FileManagementProps) {
  const { uploadFile } = useStore(
    useShallow((state) => ({
      uploadFile: state.uploadFile,
    })),
  );
  const [selectedRole, setSelectedRole] = useState<FileRole | "">("");
  const [roleError, setRoleError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const hasProblemDescription = project.files.some(
    (file) => file.role === "Problem Description",
  );
  const shouldWarnReplacement =
    selectedRole === "Problem Description" && hasProblemDescription;

  const sortedFiles = useMemo(
    () =>
      [...project.files].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [project.files],
  );

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!selectedRole) {
        setRoleError(true);
        return;
      }
      if (acceptedFiles.length === 0) return;

      setRoleError(false);
      setIsUploading(true);
      try {
        for (const file of acceptedFiles) {
          const success = await uploadFile(project.id, file, selectedRole);
          if (!success) break;
        }
      } finally {
        setIsUploading(false);
      }
    },
    [project.id, selectedRole, uploadFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      void handleDrop(acceptedFiles);
    },
    multiple: true,
    disabled: isUploading,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files & Evidence</CardTitle>
        <CardDescription>
          Upload contest statements, data, or references. Role assignment is
          required so downstream tasks can discover the correct inputs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasProblemDescription ? (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Problem Description missing</AlertTitle>
            <AlertDescription>
              Upload the official problem statement before starting the
              workflow. It is a prerequisite for API 3.3.1.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              File Role
            </label>
            <Select
              value={selectedRole || undefined}
              onValueChange={(value) => {
                setSelectedRole(value as FileRole);
                setRoleError(false);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role for incoming files" />
              </SelectTrigger>
              <SelectContent>
                {FILE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{ROLE_COPY[role].label}</span>
                      <span className="text-xs text-muted-foreground">
                        {ROLE_COPY[role].description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {roleError ? (
            <p className="text-sm text-destructive">
              Please choose a role before uploading files.
            </p>
          ) : null}
          {shouldWarnReplacement ? (
            <Alert variant="info">
              <AlertTitle>Replacement behavior</AlertTitle>
              <AlertDescription>
                Projects can only have one Problem Description at a time. A new
                upload will replace the previous file automatically (API 3.2.1).
              </AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-background px-6 py-12 text-center transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDragActive && "border-primary bg-primary/5",
            (roleError || !selectedRole) &&
              "cursor-not-allowed opacity-70 hover:border-muted-foreground/40",
            isUploading && "pointer-events-none opacity-60",
          )}
          aria-disabled={!selectedRole || isUploading}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drag and drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports multiple files per upload. Assigns them to the selected
            role.
          </p>
          {isUploading ? (
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              Uploading...
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Uploaded Files</h4>
            <span className="text-xs text-muted-foreground">
              {sortedFiles.length} total
            </span>
          </div>
          {sortedFiles.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No files uploaded yet. Add at least the problem statement to
              proceed.
            </div>
          ) : (
            <ul className="space-y-3">
              {sortedFiles.map((file) => (
                <li
                  key={file.id}
                  className="rounded-lg border bg-background/80 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">
                      {file.filename}
                    </p>
                    <Badge
                      variant={ROLE_BADGE_VARIANT[file.role]}
                      className="flex-shrink-0"
                    >
                      {file.role}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Added <Timestamp time={file.created_at} />
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



--- (5506-5539 lines) ---
                     - page.tsx

### app/(platform)/projects/[projectId]/workflow/page.tsx Content:

```tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "~/components/ui/button";

export default function ProjectWorkflowPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <div className="h-full bg-background p-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/projects">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">
        Project Workflow (ID: {params.projectId})
      </h1>
      <p className="mt-4 text-muted-foreground">
        Workflow cockpit interface implementation coming soon.
      </p>
    </div>
  );
}

```


--- (5643-5741 lines) ---
/**
 * Compact summary card for a project with quick actions.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const primaryHref = project.workflow_instance_id
    ? `/projects/${project.id}/workflow`
    : `/projects/${project.id}/config`;

  const workflowSummary = project.workflow_instance_id
    ? "Workflow in progress. Continue where you left off."
    : "Workflow not started. Configure the project to begin execution.";

  return (
    <>
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <Link href={primaryHref} className="flex-1 hover:underline">
              <CardTitle className="line-clamp-2 text-lg">
                {project.name}
              </CardTitle>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  aria-label={`Project actions for ${project.name}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <ProjectStatusBadge status={project.status} />
            {project.problem_type !== "-" ? (
              <span className="text-xs font-medium text-muted-foreground">
                Problem {project.problem_type}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex-1 text-sm text-muted-foreground">
          <p className="line-clamp-3">{workflowSummary}</p>
          <dl className="mt-4 space-y-2 text-xs uppercase tracking-wide text-muted-foreground">
            <div className="flex items-center justify-between">
              <dt>Workflow</dt>
              <dd className="font-medium normal-case text-foreground">
                {project.workflow_instance_id ? "Active" : "Not started"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Project ID</dt>
              <dd className="font-mono text-foreground">#{project.id}</dd>
            </div>
          </dl>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <span className="text-xs text-muted-foreground">
            Updated <Timestamp time={project.updated_at} />
          </span>
          <Button size="sm" variant="outline" asChild>
            <Link href={primaryHref}>
              {project.workflow_instance_id ? (
                <>
                  <Workflow className="mr-2 h-4 w-4" />
                  Workflow
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </>
              )}
            </Link>
          </Button>
        </CardFooter>
      </Card>
      <DeleteProjectDialog
        project={project}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}



--- (6523-6611 lines) ---
### constants/enums.ts Content:

```ts
import { z } from "zod";

// --- Project Management (API 3) ---

// API 3.5.1: Project Status (Design Doc 2.1.1.B)
export const ProjectStatusEnum = z.enum(["Configuring", "Running", "Completed"]);
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

// API 3.5.1: Problem Type (FRS 3.4)
// Note: "-" represents an unset or custom type.
export const ProblemTypeEnum = z.enum(["A", "B", "C", "D", "E", "F", "-"]);
export type ProblemType = z.infer<typeof ProblemTypeEnum>;

// API 3.5.3: File Role (FRS 3.2.2)
export const FileRoleEnum = z.enum([
  "Problem Description",
  "Dataset",
  "Reference Material",
]);
export type FileRole = z.infer<typeof FileRoleEnum>;

// --- Workflow Management (API 4) ---

// API 4.4.1: Workflow Status (Design Doc 2.1.1.C)
export const WorkflowStatusEnum = z.enum(["Running", "Completed"]);
export type WorkflowStatus = z.infer<typeof WorkflowStatusEnum>;

// --- Node & Execution (API 5, Design Doc 2.1.2.A) ---

// API 3.5.4, SRS 4.1: Node Lifecycle Main Status
export const NodeStatusEnum = z.enum([
  "Not Started",
  "Executing",
  "Awaiting HITL Approval",
  "Completed",
  "Failed",
  "Canceled",
]);
export type NodeStatus = z.infer<typeof NodeStatusEnum>;

// API 3.5.4: Detailed Execution Stage (for progress indication)
export const ExecutionStageEnum = z.enum([
  "Not Started",
  "Initializing",
  "Processing",
  "Generating Outputs",
  "Awaiting Review",
  "Completed",
  "Failed",
]);
export type ExecutionStage = z.infer<typeof ExecutionStageEnum>;

// API 3.5.4: Node Type (SRS 2.2)
export const NodeTypeEnum = z.enum(["Standard", "Generator"]);
export type NodeType = z.infer<typeof NodeTypeEnum>;

// API 3.5.4: HITL Mode
export const HITLModeEnum = z.enum(["VARL", "SCA", "AVL"]);
export type HITLMode = z.infer<typeof HITLModeEnum>;

// API 5.5.2: Version Source (FRS 4.3)
export const VersionSourceEnum = z.enum(["AI_GENERATED", "MANUALLY_EDITED"]);
export type VersionSource = z.infer<typeof VersionSourceEnum>;

// --- HITL Interaction (API 5.3) ---

// API 5.3: HITL Submission Action (User intent)
export const HITLActionEnum = z.enum([
  "Continue", // (H2.1)
  "RejectAndProvideModificationComments", // (H2.2)
  "Discard", // (H2.3)
]);
export type HITLAction = z.infer<typeof HITLActionEnum>;

// API 5.3: HITL Response Action (Frontend Navigation Guidance)
export const HITLResponseActionEnum = z.enum([
  "ExecuteNext",
  "NavigateNext",
  "Completed", // Workflow finished
  "AVLLoop", // Internal iteration (AVL mode)
  "ReExecute", // Node is re-executing
  "Discarded",
]);
export type HITLResponseAction = z.infer<typeof HITLResponseActionEnum>;

```


--- (7886-7922 lines) ---
### components/ui/tooltip.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "~/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };



--- (7925-7993 lines) ---
### components/ui/alert.tsx Content:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        // Added custom variants for better UX feedback in configuration flows
        info: "border-blue-500/50 text-blue-700 dark:text-blue-400 dark:border-blue-500 [&>svg]:text-blue-500 bg-blue-50/50 dark:bg-blue-950/30",
        warning:
          "border-amber-500/50 text-amber-700 dark:text-amber-400 dark:border-amber-500 [&>svg]:text-amber-500 bg-amber-50/50 dark:bg-amber-950/30",
        success:
          "border-green-500/50 text-green-700 dark:text-green-400 dark:border-green-500 [&>svg]:text-green-500 bg-green-50/50 dark:bg-green-950/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };



--- (8272-8410 lines) ---
### components/ui/dialog.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}



--- (8494-8560 lines) ---
### components/ui/button.tsx Content:

```tsx
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        "cursor-pointer active:scale-105",
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };

```


--- (8902-9091 lines) ---
### components/ui/select.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

```

</deer_flow_frontend_code>

<architecture>
--- (109-111 lines) ---
    │       ├── config/page.tsx      # 项目配置页面
    │       └── workflow/            # 工作流执行界面 (The Cockpit)
    │           ├── page.tsx


--- (171-175 lines) ---
├── /api/               # API 服务层
│   ├── client.ts       # Axios 实例配置 (拦截器)
│   ├── auth.service.ts
│   ├── project.service.ts
│   └── workflow.service.ts


--- (226-230 lines) ---
#### 4.3.3 ProjectSlice (`projectSlice.ts`)

  * **State**: `projects: ProjectSummaryRead[]`, `currentProject: ProjectDetailRead | null`, `isLoading`.
  * **Actions**: `fetchProjects`, `loadProjectDetail`, `createProject`, `updateProject`, `deleteProject`, `uploadFile`, `startWorkflow`.



--- (329-332 lines) ---
#### 5.1.2 服务层抽象 (Service Layer)

将 API 调用封装在类型安全的服务中（`src/core/api/*.service.ts`），供 Zustand Store 调用。



--- (352-358 lines) ---
#### 5.3.1 初始化流程 (Initialization)

1.  UI 加载。
2.  **Fetch Snapshot (REST)**: `GET /workflows/{id}`。
3.  **Hydrate Store**: 使用快照初始化 Zustand。
4.  **Connect (WS)**: 建立 WebSocket 连接。



--- (582-584 lines) ---
  * **工具**: Playwright / Cypress。
  * **重点**: 核心用户旅程：项目创建 -\> 工作流启动 -\> HITL 审批 -\> 版本切换 -\> Staleness 处理 -\> 重新执行。测试实时同步的正确性。


</architecture>



---

<task>


### 任务 7：工作流启动流程与历史案例初始化实现

**目标：** 实现启动工作流的核心操作和从历史案例库初始化项目的功能，完成项目从“配置”到“运行”的转换。

**核心关注点：** 前置条件校验、异步任务启动、状态转换、UI 导航、辅助数据获取。

**实现策略：**

1.  **历史案例初始化（`<api> 3.2.2, 3.4.1`，可选 P2）：**
    *   实现 `ProjectSlice.fetchHistoricalProblems` 和 `initializeFromHistorical` Actions（任务 3 和 4 已实现服务和 Action）。
    *   在项目配置页面实现“从历史案例初始化”功能（`Select` 或模态框）。
    *   用户选择后调用初始化 Action，成功后刷新 `currentProject` 数据。
2.  **启动工作流（`<api> 3.3.1`）：**
    *   在项目配置页面实现“启动工作流”主按钮。
3.  **前置条件校验（关键实现）：**
    *   在前端实现严格的校验逻辑：项目状态必须是 `Configuring`；`problem_type` 必须已设置（非 `"-"`）；必须存在至少一个 `Problem Description` 角色的文件。
    *   如果不满足条件，禁用按钮并显示清晰的 Tooltip 提示。
4.  **启动流程与导航：**
    *   点击后调用 `ProjectSlice.startWorkflow`。
    *   处理 `202 Accepted` 响应。
    *   成功后，更新 `ProjectSlice.currentProject` 状态为 `Running` 和 `workflow_instance_id`。
    *   自动将用户导航到工作流执行界面（`/projects/[projectId]/workflow`）。

**输入：** 任务 6 的输出, `<api> 3.2.2, 3.3.1, 3.4.1`。
**输出：** 能够校验前置条件、从历史案例初始化、成功启动工作流并正确导航的完整流程。


</task>


---

你的任务是完成 <task> 中的开发任务，要求：

1. 在开发前务必深入理解 需求背景和项目代码，确保全面把握任务目标与上下文；
2. 尽可能复用及参考现有的组件、框架、库（UI样式、动画等），以提高开发效率和降低出错的概率，这是最重要的原则；
3. 如果现有的技术栈不满足需求，引入其他合适的组件、框架、库，进一步提高开发效率和降低出错的概率；
4. 使用成熟的组件、框架、库、UI样式、动画等；
5. 避免过度设计，过度封装，过度抽象，追求实用性和可维护性；
6. 在确保实现成熟可靠的基础上，**进一步提升UI美观性和优化用户交互体验**；
7. 务必先深入思考，反复推敲，反复权衡，反复反思，然后进行架构设计；
8. 架构设计确定后再进行完整的细节代码实现，确保实现代码的完整性和正确性；
9. 保证与其他任务的逻辑连贯、衔接紧密；
10. 必须确保完成该任务范围内的所有功能点，无遗漏，不涉及其他任务；
11. 必须包含对现有代码必要的修改（如果需要）以及完整新增代码的实现，使用英文注释。

**高标准完成本任务，严格对齐要求，不要遗漏任何功能点，代码简洁健壮无误。深入分析项目架构及依赖，预判风险并持续优化，仅在方案完善后开始开发，确保每一行代码皆有充分理解与把控。对实现的代码进行充分的检查、测试、验证，确保没有bug。**
