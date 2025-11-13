<design_doc>
--- (139-151 lines) ---

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| N1.1 | 工作流可视化 | 以可视化格式（分阶段流程图）显示完整的工作流结构。 | FRS 5.1 | P0 |
| N1.2 | 动态结构可视化 | 可视化工具必须能够动态展示 Generator 节点生成的结构。 | FRS 5.1 | P0 |
| N2.1 | 实时状态显示 | 实时显示每个节点的状态和执行阶段。 | FRS 5.2 | P0 |
| N2.2 | 过时状态可视化 | 清晰标识“陈旧 (Stale)”的节点。 | FRS 5.2 | P1 |
| N3.1 | 节点回溯与审查 (Jumping) | 用户可以选择任何已执行的节点以查看其详细信息。 | FRS 5.3, SRS 5.2 | P0 |
| N3.2 | 执行前沿控制 | 不允许跳转到尚未执行的未来节点。 | SRS 5.2 | P0 |
| R1.1 | WebSocket 实时通信 | 建立安全的 WebSocket 连接，实现实时状态更新。 | API 6 | P1 |
| R1.2 | 实时事件处理 | 客户端处理 `NODE_STATUS_UPDATED`, `WORKFLOW_STRUCTURE_UPDATED`, `NODE_ACTIVE_VERSION_CHANGED` 等事件。 | API 6.5 | P1 |
| R1.3 | 断线重连与状态同步 | 客户端实现断线重连，并在重连后通过 REST API 同步全量状态。 | API 6.1 | P1 |



--- (232-306 lines) ---
### 2.1 内容模型与分类法 (Content Model and Taxonomy)

本节定义了平台中所有核心信息对象的属性、层级关系和组织逻辑。这些模型是系统数据结构在用户体验层面的抽象，是构建信息架构和交互界面的基础。

#### 2.1.1 核心对象模型 (Core Object Models)

以下定义了系统中的关键实体及其核心属性，主要基于 API 文档中的 `Read` 模型，并标注了对前端实现的关键影响点。

##### A. 用户与设置 (User and Settings)

  * **User (用户画像)**
      * `id`, `email`, `display_name`.
      * `is_active`, `is_verified` (boolean): **(前端关键：用于控制登录和功能访问权限)**。
  * **UserSettings (用户设置)**
      * *Interface:* `language` (enum), `theme` (enum).
      * *Engine Behavior:* `hitl_profile` (enum), `thinking_depth` (enum).
      * *BYOK Configuration:* `llm_model_name`, `llm_base_url`.
      * *Security Indicators:* `has_llm_api_key`, `has_e2b_api_key` (boolean). **(前端关键：遵循“写后即忘”，UI 仅显示存在性，不显示密钥)**。

##### B. 项目与文件 (Project and Files)

  * **Project (项目)**
      * *定义:* 封装一次建模任务的顶级容器。
      * `id`, `name`, `description`.
      * `status` (enum: Configuring, Running, Completed): 项目生命周期状态。**(前端关键：决定项目视图和可用操作)**。
      * `problem_type` (enum).
      * `workflow_instance_id` (integer | null): **(前端关键：判断工作流是否已启动)**。
  * **ProjectFile (项目文件)**
      * `id`, `filename`.
      * `role` (enum: Problem Description, Dataset, Reference Material): **(前端关键：启动工作流的前置条件检查)**。

##### C. 工作流结构 (Workflow Structure)

  * **WorkflowInstance (工作流实例)**
      * `id`, `name`.
      * `status` (enum: Running, Completed).
      * `phases` (array[Phase]): 结构化的节点组织层级 (Phase -\> Stage -\> NodeInstance)。**(前端关键：工作流导航器 Navigator 的核心数据源)**。
  * **Phase / Stage (阶段与步骤)**
      * *定义:* 用于在 UI 中对 NodeInstance 进行分组和导航的逻辑容器。

##### D. 节点实例与状态 (Node Instance and State)

  * **NodeInstance (节点实例)**
      * *定义:* 工作流中一个具体的执行步骤的实例。
      * `id`, `definition_id`, `name`.
      * *Execution State:*
          * `status` (enum: NodeStatus): 主状态。**(前端关键：驱动 UI 视觉状态和可用操作)**。
          * `current_stage` (enum: ExecutionStage): 详细执行阶段（用于进度展示）。
      * *Behavioral Configuration:*
          * `node_type` (enum: Standard, Generator). **(前端关键：用于控制“重新执行/编辑”的可用性)**。
          * `hitl_mode` (enum: VARL, SCA, AVL). **(前端关键：决定 HITL 界面的渲染逻辑)**。
      * *Versioning & Staleness:*
          * `active_version_id` (integer | null).
          * `is_stale` (boolean): 指示输入依赖是否已过时。**(前端关键：用于显示警告图标和横幅)**。

##### E. 执行结果与版本 (Execution Results and Versions)

  * **TemporaryExecutionResult (临时执行结果)**
      * *定义:* 节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时产物（存储于 `NodeDetailView.pending_result`）。
      * `output_data` (object): AI 生成的当前临时输出。
      * `execution_artifacts` (object): 当前执行周期内产生的产物（详见 2.1.2）。
      * `accumulated_hitl_interactions` (array): 当前周期内累积的 HITL 记录。
      * `error_log` (string | null).
  * **NodeVersion (节点版本快照)**
      * *定义:* 节点执行成功并被批准后的不可变、完整上下文快照 (SRS 3.2)。
      * `id`, `version_number`.
      * `source` (enum: AI\_GENERATED, MANUALLY\_EDITED).
      * `summary` (string).
      * *The Snapshot (核心内容):*
          * `output_data` (object): 最终输出数据。
          * `execution_artifacts` (object): 执行产物。
          * `input_dependencies` (object: `{upstream_node_id: version_id}`): **(前端关键：用于溯源和展示依赖详情)**。
          * `hitl_history` (array): 创建此版本的所有 HITL 交互记录。
      * *Environment Parameters:* `llm_model_name`, `temperature`.



--- (309-318 lines) ---
##### A. 核心枚举 (Core Enumerations)

定义了系统中的关键状态和类型，是前端实现条件渲染和业务逻辑的核心依据。

  * **`NodeStatus` (生命周期主状态)**: `Not Started`, `Executing`, `Awaiting HITL Approval`, `Completed`, `Failed`, `Canceled`.
  * **`ExecutionStage` (执行详细阶段)**: `Initializing`, `Processing`, `Generating Outputs` 等。
  * **`NodeType`**: `Standard`, `Generator`.
  * **`HITLMode`**: `SCA`, `AVL`, `VARL`.
  * **`VersionSource`**: `AI_GENERATED`, `MANUALLY_EDITED`.



--- (379-391 lines) ---
##### A. 左侧栏：工作流导航器 (Workflow Navigator - The Map)

  * **目标:** 提供全局工作流结构概览、实时状态监控和快速导航。
  * **结构:** 采用高密度的**层级树状视图 (Hierarchical Tree View)**，映射 `Phase -> Stage -> Node` 层级。
  * **节点展示关键信息:**
    1.  **Status Icon:** 实时状态图标（✅, ⚙️ (Animated), ⏳, ❌, 🛑, ◯）。
    2.  **Node Identifier and Name.**
    3.  **Staleness Indicator (⚠️):** 如果 `is_stale: true`，则显示清晰的警告图标。
  * **交互逻辑:**
      * 点击可访问节点加载到 Workspace (B)。
      * **Execution Frontier:** 尚未执行的未来节点视觉上禁用且不可点击 (SRS 5.2)。
      * **Dynamic Updates:** 当收到 `WORKFLOW_STRUCTURE_UPDATED` 事件时，此树结构会动态刷新。



--- (392-423 lines) ---
##### B. 中心面板：节点交互工作区 (Node Interaction Workspace - The Action)

  * **目标:** 提供当前选中节点的专注交互环境。

  * **结构:** 采用“交互记录 (Interaction Transcript)”的视觉隐喻，按时间顺序展示节点的活动记录。

  * **B1. Workspace Header (固定顶部):**

      * [Node Title] 和 [Current Status]。
      * [Contextual Toolbar]: 根据节点状态动态显示操作按钮（Re-execute, Manual Edit, Cancel, Retry）。
      * [Staleness Banner]: 如果 `is_stale: true`，显示醒目的横幅提示。

  * **B2. Interaction Transcript (主内容区，可滚动):**

      * 展示当前查看的版本（`active_version` 或 `pending_result`）的完整上下文。
      * **Block 1: Inputs & Dependencies:** (默认折叠) 显示消费的上游节点版本信息。
      * **Block 2: Execution Artifacts:** 展示 `prompt`, `generated_code.py`, `execution.log`。使用专用的查看器组件。
      * **Block 3: Generated Output:** 核心内容展示区（Markdown, LaTeX, 图表）。
      * **Block 4: HITL Interaction Zone:**
          * `Awaiting HITL Approval` 时: 激活特定的 HITL 界面（SCA/AVL/VARL）。
          * `Completed` 时: 显示该版本的 HITL 历史记录。

  * **B3. Action Footer (固定底部，条件显示):**

      * 仅在 `Awaiting HITL Approval` 状态下显示。
      * 提供主要的 HITL 操作：[Discard Execution], [Reject & Provide Feedback], [Approve & Continue]。

  * **动态行为 (Dynamic Behavior):**

      * `Executing`: B2 突出显示实时日志/进度。B1 显示 [Cancel]。
      * `Manual Editing Mode`: B2.Block 3 切换为编辑器。B3 变为 [Cancel Edit], [Save New Version]。



--- (468-499 lines) ---

**场景:** 用户回退到上游 Node A 的历史版本 V1（当前 V2 激活），并希望更新下游 Node B。

**流程:**

1.  **用户导航与审阅:**
      * 用户在 Left Navigator (A) 点击 Node A。
      * Center Workspace (B) 加载 V2（Review Mode）。Right Sidebar (C) 显示。
2.  **用户审查历史版本:**
      * 用户在 Right Sidebar (C) 点击 V1 卡片。Center Workspace (B) 加载 V1 详情。
3.  **用户执行版本切换:**
      * 用户在 V1 卡片上点击 [Set as Active Version]。
      * **系统响应 (API):** `POST /nodes/A/versions/V1/activate`。
      * **系统处理 (后端):** 更新 Node A 的 `active_version_id` 为 V1。
4.  **系统状态传播 (关键步骤 - Staleness Update):**
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node A)。
      * **前端响应 (关键):** 前端监听到此事件，立即调用 `GET /workflows/{id}` 重新获取全量工作流状态。
      * 新的状态中，Node B 的 `is_stale` 标志为 `true`。
5.  **UI 更新与过时感知:**
      * Right Sidebar (C): V1 标记为 Active。
      * Left Navigator (A) 刷新：Node B 旁边出现 ⚠️ Staleness Indicator。
      * *(遵循 SRS 1.4 静默状态管理，系统不自动执行)*。
6.  **用户处理下游依赖:**
      * 用户点击 Node B。
      * Center Workspace (B) 加载 Node B。Workspace Header (B1) 显示醒目的 `Staleness Banner`：“⚠️ Inputs have changed. Node A has a new active version (V1).”
7.  **用户触发下游重执行:**
      * 用户点击 Contextual Toolbar (B1) 的 [Re-execute]。
      * **系统响应 (API):** `POST /nodes/B/re-execute`。
      * **系统处理 (后端):** 后端拉取 Node A 的当前激活版本 (V1) 作为输入（SRS 3.4），启动 Node B 执行。
      * **系统响应 (WebSocket):** WebSocket 推送 `NODE_STATUS_UPDATED` (B-\>Executing)。
8.  **UI 更新:** Node B 进入执行状态，⚠️ 图标消失。



--- (500-520 lines) ---
#### 2.3.3 任务流 3：中间结果的人工编辑 (Task Flow: Manual Editing of Intermediate Results)

**场景:** 用户决定直接修改 Node C 的输出，而不通过 AI 重新生成。

**流程:**

1.  **用户启动编辑模式:**
      * 用户查看 Node C（`Completed` 状态）。
      * 用户点击 Contextual Toolbar (B1) 的 [Manual Edit]。*(校验：Generator Node 禁用此操作)*。
2.  **UI 切换到编辑器:**
      * Center Workspace (B) 的 `Generated Output` 区块切换为编辑器（e.g., Novel/Tiptap 或 Code Editor），加载当前版本内容。
      * Toolbar 按钮更换为 [Cancel Edit] 和 [Save New Version]。
3.  **用户编辑与保存:**
      * 用户修改内容。
      * 用户点击 [Save New Version]，输入版本摘要并确认。
      * **系统响应 (API):** `POST /nodes/C/manual-edit`。
      * **系统处理 (后端):** 创建新的 `NodeVersion` (V2)，`source="MANUALLY_EDITED"`。将 V2 设为 `active_version`。
4.  **状态更新与传播:**
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node C)。
      * **前端响应:** UI 退出编辑模式。Right Sidebar 更新。前端触发工作流全量状态刷新（同 2.3.2 步骤 4），更新下游节点的 `is_stale` 标志。



--- (521-539 lines) ---
#### 2.3.4 任务流 4：处理动态工作流结构更新 (Task Flow: Handling Dynamic Structure Updates)

**场景:** 一个 `Generator` 节点（例如 1.1.2）被批准，导致工作流结构动态变化。

**流程:**

1.  **Generator 节点批准:** 用户完成 Generator 节点的 HITL 审批（参见 2.3.1）。
2.  **系统处理结构变更 (后端):**
      * 后端根据 Generator 节点的输出，动态创建新的 NodeInstance 记录，并插入到工作流序列中。
3.  **系统广播结构更新 (WebSocket - 关键):**
      * 后端广播 `WORKFLOW_STRUCTURE_UPDATED` 事件。负载包含**全新且完整**的 `WorkflowInstanceRead` 对象。
4.  **前端响应与状态同步 (关键):**
      * 前端监听到此事件。
      * **全量替换:** 前端（Zustand Workflow Store）必须立即丢弃当前的 `phases` 结构，并用事件负载中的新数据进行**全量替换**。
5.  **UI 更新与重渲染:**
      * Left Navigator (A) 根据新结构完全重渲染，平滑展示新插入的节点。
      * UI 显示短暂通知（Toast: "Workflow structure updated."）。
6.  **导航:** 根据 HITL 审批的返回结果（`action: ExecuteNext`），前端自动导航到新插入序列的第一个节点，该节点通常会自动开始执行。



--- (575-582 lines) ---
#### B. 交互记录（Interaction Transcript）

这是“节点交互工作区 (Workspace)”的核心组织模式，用于实现“彻底的透明度与可追溯性”。

  * **结构模型：** 将节点的完整上下文（输入、过程、输出、交互）组织成一个线性的记录流。
  * **区块实现：** 记录流由多个区块组成（Inputs, Artifacts, Output, HITL Zone）。使用 Shadcn/ui `Accordion` 或 `Collapsible` 实现区块的展开/折叠。
  * **默认状态：** 关键区块（Output, HITL Zone）默认展开；辅助信息区块（Inputs, Artifacts）默认折叠。



--- (585-589 lines) ---
1.  **版本审阅 (Version Review):**

      * **流程：** 用户点击 `Version History Panel` (C) 中的任意版本卡片。
      * **响应：** Center Workspace (B) 立即加载该版本的详细信息（Review Mode）。Workspace 必须清晰标明当前查看的是否为活动版本（例如，显示“Historical Version V1”标签）。



--- (597-606 lines) ---
#### D. 人工编辑与模式切换 (Manual Editing and Mode Switching)

支持用户直接干预结果（FRS 4）。

  * **模式：View-to-Edit Transition**
      * **触发：** 用户在 `Completed` 节点点击 [Manual Edit]。
      * **切换：** Center Workspace 的 `Generated Output` 区块原位切换为编辑器。根据内容类型选择 `Novel/Tiptap`（富文本/Markdown）或 `Monaco Editor`（代码）。
      * **控制：** Workspace 工具栏按钮变更为 [Cancel Edit] 和 [Save New Version]。
      * **保存：** 点击 [Save New Version] 后，弹出模态框要求输入“版本摘要 (Summary)”。保存成功后，UI 切换回 Review Mode，显示新版本。



--- (645-673 lines) ---

实现依赖于前端状态管理（Zustand）与后端实时通信（WebSocket, REST API）的精确协同。

##### 1\. 状态同步范式 (State Synchronization Paradigm)

  * 严格遵循 API 6.1 原则：**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新。**
  * **关键规则:** WebSocket 断线重连后，必须立即重新调用 REST API 获取全量快照，以保证数据一致性。

##### 2\. 依赖过时状态 (Staleness)

实现“静默状态管理”（SRS 1.4）。

  * **检测与传播逻辑:**
    1.  **触发:** 前端监听到 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。
    2.  **同步:** 前端必须立即调用 `GET /workflows/{id}` 重新获取全量工作流状态，以更新所有节点的 `is_stale` 标志。
  * **视觉传达:**
      * **全局 (Navigator A):** 在 `is_stale: true` 的节点旁显示清晰的 ⚠️ 图标。Hover 显示 Tooltip 解释原因。
      * **局部 (Workspace B1):** 如果当前节点过时，显示醒目的、不可关闭的 `Staleness Banner`。

##### 3\. 工作流结构动态更新 (Dynamic Structure Updates)

处理 `Generator` 节点导致的结构变化。

  * **触发:** 监听到 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件。
  * **处理逻辑 (关键):** 前端状态管理器必须执行**全量替换**操作，使用事件负载数据覆盖本地缓存。
  * **视觉传达:**
      * **通知:** 显示短暂 Toast：“Workflow structure updated.”。
      * **平滑过渡:** Navigator (A) 重新渲染。使用 `Framer Motion` (Layout Animations) 实现新节点的平滑插入动画，帮助用户理解结构变化。



--- (1531-1536 lines) ---
**B2. 交互记录内容区 (Interaction Transcript - Scrollable):**

  * **布局:** `space-y-6 p-6`。

  * **区块实现:** 使用 `Shadcn/ui Card` 作为容器，并结合 `Collapsible` 实现展开/折叠。



--- (1737-1743 lines) ---
##### B. 实现约定与最佳实践

1.  **主题与样式:** 严格遵守 Design Tokens。使用 CSS Variables 实现主题。默认深色模式。使用 `cn` 工具函数组合类名。
2.  **状态同步范式 (关键):** 严格遵循“REST API 为全量快照（Source of Truth），WebSocket 提供增量更新”的原则（参见 3.1.2.C.1）。实现健壮的断线重连和重连后的全量同步。
3.  **Staleness 处理逻辑:** 监听到 `NODE_ACTIVE_VERSION_CHANGED` 事件后，必须立即重新获取全量工作流状态以更新 `is_stale` 标志。
4.  **动态结构处理:** `WORKFLOW_STRUCTURE_UPDATED` 事件必须触发 Zustand Store 的全量替换。


</design_doc>

<api>
--- (540-658 lines) ---
### 1. 项目生命周期管理 (CRUD)

#### 1.1. 创建新项目

*   **Endpoint**: `POST /projects/`
*   **权限**: 任何已认证的用户。
*   **描述**: 为当前登录的用户创建一个新的空项目，初始状态为 `Configuring`。项目名称在同一用户下必须是唯一的。

##### 请求体 (`ProjectCreate`)
```json
{
  "name": "2024 MCM Problem A Analysis",
  "description": "An initial attempt to model the dynamics of the specified ecosystem."
}
```
*   `name` (string, **required**): 项目名称。前后空格会被剔除，且不能为空。
*   `description` (string, *optional*): 项目的详细描述。

##### 成功响应 (`201 Created`)
返回新创建项目的完整详细信息 (`ProjectDetailRead`)。
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

##### 错误响应
*   `409 Conflict` (`PROJECT_NAME_EXISTS`): 用户已存在同名项目。

#### 1.2. 获取项目列表 (分页)

*   **Endpoint**: `GET /projects/`
*   **权限**: 任何已认证的用户。
*   **描述**: 获取当前用户的所有项目摘要信息，支持分页，默认按更新时间降序排列。

##### 查询参数
*   `skip` (integer, *optional*, default: `0`): 跳过的项目数量。
*   `limit` (integer, *optional*, default: `20`): 每页返回的项目数量。

##### 成功响应 (`200 OK`)
返回一个分页响应对象，其中 `items` 包含 `ProjectSummaryRead` 数组。
```json
{
  "total": 15,
  "items": [
    {
      "id": 12,
      "name": "Latest Project",
      "status": "Running",
      "problem_type": "A",
      "created_at": "2024-05-26T14:00:00Z",
      "updated_at": "2024-05-26T15:30:00Z",
      "workflow_instance_id": 10
    }
  ]
}
```

#### 1.3. 获取项目详细信息

*   **Endpoint**: `GET /projects/{project_id}`
*   **权限**: 项目所有者。
*   **描述**: 获取单个项目的完整信息，包括其关联的文件列表。

##### 路径参数
*   `project_id` (integer, **required**): 项目的唯一ID。

##### 成功响应 (`200 OK`)
返回 `ProjectDetailRead` 对象，结构参见 `1.1. 创建新项目`。

##### 错误响应
*   `404 Not Found`: 项目不存在。
*   `403 Forbidden`: 用户无权访问该项目。

#### 1.4. 更新项目信息

*   **Endpoint**: `PATCH /projects/{project_id}`
*   **权限**: 项目所有者。
*   **描述**: 更新项目的基本信息。部分字段的修改受项目当前状态限制。

##### 请求体 (`ProjectUpdate`)
```json
{
  "description": "Updated description with new findings.",
  "problem_type": "C"
}
```
*   `name` (string, *optional*)
*   `description` (string, *optional*)
*   `problem_type` (enum, *optional*): 问题类型。可选值: `"A"`, `"B"`, `"C"`, `"D"`, `"E"`, `"F"`, `"-"`。

##### 状态相关的可变性
*   在 `Configuring` 状态下，`name`, `description`, 和 `problem_type` 均可修改。
*   在 `Running` 或 `Completed` 状态下，只有 `name` 和 `description` 可以修改。尝试修改 `problem_type` 将导致 `409 Conflict` 错误。

##### 成功响应 (`200 OK`)
返回更新后的 `ProjectDetailRead` 对象。

#### 1.5. 删除项目

*   **Endpoint**: `DELETE /projects/{project_id}`
*   **权限**: 项目所有者。
*   **描述**: **永久删除**一个项目及其所有关联数据，包括工作流实例、所有节点版本以及在服务器上存储的所有上传文件。

##### **警告**
此操作将**立即终止**与该项目关联的任何正在运行的后台工作流任务。这是一个破坏性且不可恢复的操作。前端应在执行此操作前，通过一个醒目的模态框向用户进行二次确认。

##### 成功响应 (`204 No Content`)
成功删除后，响应体为空。



--- (661-688 lines) ---
### 2. 项目配置与数据管理

#### 2.1. 上传项目文件

*   **Endpoint**: `POST /projects/{project_id}/files`
*   **权限**: 项目所有者。
*   **描述**: 以 `multipart/form-data` 格式上传一个文件，并将其与项目关联。

##### 请求格式: `multipart/form-data`
*   **`file`** (file, **required**): 要上传的文件内容。
*   **`role`** (string, **required**): 文件的角色。其值决定了文件在工作流中如何被使用。
    *   `Problem Description`: 核心问题描述文档，通常是启动工作流的必要条件。
    *   `Dataset`: 建模所需的数据文件，如 CSV, JSON, TXT 等。
    *   `Reference Material`: 辅助性的参考资料，如相关论文、背景介绍等。

##### **重要说明**
虽然系统允许您为一个项目上传多个相同角色的文件（例如，多个 `Dataset` 文件），但工作流的特定节点可能要求某个角色是唯一的。例如，`start_workflow` 操作要求项目中**有且仅有一个** `Problem Description` 文件。前端应在 UI 层面引导用户，对于需要唯一性的角色，后续上传应视为“替换”而非“新增”。

##### 成功响应 (`201 Created`)
返回新创建的 `ProjectFileRead` 对象。
```json
{
  "id": 25,
  "filename": "problem_data.csv",
  "role": "Dataset",
  "created_at": "2024-05-26T16:00:00Z"
}
```


--- (712-752 lines) ---
### 3. 工作流编排与导出

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



--- (806-866 lines) ---
### 5. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了项目管理模块中使用的核心数据对象。

#### 5.1. ProjectSummaryRead

用于项目列表 (`GET /projects/`) 的轻量级项目信息对象。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 项目的唯一标识符。 |
| `name` | string | 项目名称。 |
| `status` | string (enum) | 项目的当前生命周期状态。可选值: `"Configuring"`, `"Running"`, `"Completed"`。 |
| `problem_type` | string (enum) | 项目关联的竞赛问题类型。可选值: `"A"`, `"B"`, `"C"`, `"D"`, `"E"`, `"F"`, `"-"`。 |
| `created_at` | string (datetime) | 项目创建时间 (ISO 8601 格式)。 |
| `updated_at` | string (datetime) | 项目最后更新时间 (ISO 8601 格式)。 |
| `workflow_instance_id` | integer \| null | 关联的工作流实例 ID，如果已创建。 |

#### 5.2. ProjectDetailRead

用于展示单个项目详情的完整信息对象，继承自 `ProjectSummaryRead`。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| *(所有 ProjectSummaryRead 字段)* | | ... |
| `description` | string \| null | 项目的详细描述。 |
| `files` | array (ProjectFileRead) | 与项目关联的文件列表。参见 `ProjectFileRead` 定义。 |
| `historical_problem_id` | integer \| null | 如果项目基于历史案例初始化，则为该案例的 ID。 |

#### 5.3. ProjectFileRead

表示与项目关联的单个文件的元数据。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 文件的唯一标识符。 |
| `filename` | string | 文件的原始名称。 |
| `role` | string (enum) | 文件在项目中的角色。可选值: `"Problem Description"`, `"Dataset"`, `"Reference Material"`。 |
| `created_at` | string (datetime) | 文件上传时间 (ISO 8601 格式)。 |

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



--- (1001-1080 lines) ---
#### 2.1. 获取工作流详细信息

获取指定工作流的完整信息，是加载和刷新工作流画布页面的核心 API。

*   **Endpoint**: `GET /workflows/{workflow_id}`
*   **权限**: 工作流所有者。

##### 路径参数
*   `workflow_id` (integer, **required**): 要查询的工作流实例的唯一ID。

##### 成功响应 (`200 OK`)
返回 `WorkflowInstanceRead` 对象，包含最新的 `phases` 树（每个阶段下有若干 Stage 和节点列表）。**[重要变化]** 每个节点对象现在都包含一个 `is_stale` 布尔标志。
```jsonc
{
  "id": 1,
  "name": "Updated Workflow Name",
  "status": "Running",
  "project_id": 12,
  "user_id": 1,
  "phases": [
    {
      "name": "Phase 1: Strategic Analysis & Macro Architecture",
      "stages": [
        {
          "id": "1.1",
          "name": "Strategic Definition",
          "nodes": [
            {
              "id": 101,
              "definition_id": "1.1.1",
              "name": "Problem Deconstruction and Mathematical Formulation",
              "status": "Completed",
              "stage_id": "1.1",
              "stage_name": "Strategic Definition",
              "is_stale": false // [新增] 依赖未变
            },
            {
              "id": 102,
              "name": "Node B (depends on A)",
              "status": "Completed",
              "is_stale": true // [新增] Node A 版本更新后，Node B 变为过时
            }
          ]
        }
      ]
    },
    {
      "name": "Phase 2: Cyclic Sub-problem Execution",
      "stages": [
        {
          "id": "Task_A1.2.1",
          "name": "[Task_A1] Data & Model Generation",
          "nodes": [
            {
              "id": 201,
              "definition_id": "Task_A1.2.1.1",
              "name": "[Task_A1] Data Insights and Candidate Model Generation",
              "stage_id": "Task_A1.2.1",
              "stage_name": "[Task_A1] Data & Model Generation",
              "status": "Executing",
              "is_stale": false
            }
          ]
        }
      ]
    }
  ]
}
```

##### 错误响应
*   `401 Unauthorized`: 认证失败。
*   `403 Forbidden`: 用户无权访问该工作流。
*   `404 Not Found`: 指定的 `workflow_id` 不存在。

##### > 前端实现要点
> *   在进入工作流页面时首次调用此接口。
> *   当收到 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件时，必须调用此接口以获取全新的 `phases` 树并重新渲染。
> *   **[新增]** 在渲染节点时，检查 `node.is_stale` 标志。如果为 `true`，应在节点上显示一个明确的视觉指示器（如警告图标或虚线边框）。



--- (1145-1191 lines) ---
### 4. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了工作流管理模块中使用的核心数据对象。

#### 4.1. WorkflowInstanceRead

表示一个工作流实例的完整信息，包含完整的 `Phase -> Stage -> Node` 层级结构。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 工作流实例的唯一标识符。 |
| `name` | string | 工作流的名称。 |
| `status` | string (enum) | 工作流的当前状态。可选值: `"Running"`, `"Completed"`。 |
| `project_id` | integer | 所属项目的 ID。 |
| `user_id` | integer | 所属用户的 ID。 |
| `phases` | array (PhaseRead) | 工作流的阶段数组，每个 Phase 内含多个 Stage，Stage 再包含节点列表。 |

#### 4.2. PhaseRead

表示工作流中的一个 Phase。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `name` | string | Phase 的显示名称 (例如, "Phase 1: Strategic Analysis & Macro Architecture")。 |
| `stages` | array (StageRead) | 此 Phase 下的 Stage 列表，按节点 `order_index` 顺序排列。 |

#### 4.3. StageRead

表示 Phase 内部的一个 Stage（逻辑分组）。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | string | Stage 的唯一 ID (例如, "1.1" 或 "Task_A1.2.1")。 |
| `name` | string | Stage 的显示名称 (例如, "Strategic Definition" 或 "[Task_A1] Data & Model Generation")。 |
| `nodes` | array (NodeInstanceRead) | 属于该 Stage 的节点列表，保持其全局执行顺序。 |

#### 4.4. StalenessInfo

描述一个节点的上游依赖为何"过时"的详细信息。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `upstream_node_id` | integer | 已更新的上游依赖节点的 ID。 |
| `upstream_definition_id` | string | 上游节点的定义 ID (例如, "1.1.1")。 |
| `consumed_version_id` | integer | 当前节点上次执行时所消费的上游版本 ID。 |
| `current_active_version_id`| integer \| null | 上游节点当前最新的活动版本 ID。 |



--- (1235-1300 lines) ---
#### 1.1. 获取节点详细信息

此端点是渲染节点视图的主力，提供单个节点的完整状态、数据和上下文信息。

*   **Endpoint**: `GET /nodes/{node_id}`
*   **权限**: 必须是该节点所属工作流的所有者。
*   **描述**:
    *   查询并返回指定 `node_id` 的详细视图。
    *   **关键逻辑 (R5.2)**: 如果请求的节点处于 `NOT_STARTED` 状态，后端会校验其是否超前于工作流的“执行前沿”。若超前，将返回 `403 Forbidden`。
    *   **过时检查**: 响应中包含 `staleness_report` 字段，前端应检查此字段，若非空，则在 UI 上明确提示用户此节点的输入依赖已更新。

##### 路径参数
*   `node_id` (integer, **required**): 要查询的节点实例的唯一ID。

##### 成功响应 (`200 OK`)
返回一个 `NodeDetailView` 对象。

```jsonc
{
  "id": 101,
  "definition_id": "1.1.2",
  "name": "Architecture Design and Task Decomposition",
  "status": "Awaiting HITL Approval", // 节点当前的主状态，用于控制UI的主要交互
  "current_stage": "Awaiting Review", // 节点的详细执行阶段，用于更精细的UI展示（如进度条、状态文本）
  "node_type": "Generator",
  "hitl_mode": "SCA",
  "order_index": 1,
  "active_version_id": null, // 当节点未完成时，没有活动版本
  "phase_id": "Phase 1: Strategic Analysis & Macro Architecture",
  "stage_id": "1.1",
  "stage_name": "Strategic Definition",
  "task_group_id": null,
  "is_stale": false, // [新增] 指示节点是否过时
  "active_version": null, // 如果节点已完成，这里会包含其活动版本的数据
  "pending_result": { // 当节点在执行或等待审批时，临时结果会在这里。这是HITL界面的主要数据源
    "output_data": {
      "candidates": [
        { "id": "OptA", "name": "Optimization Approach", "...": "..." },
        { "id": "OptB", "name": "Simulation Approach", "...": "..." }
      ],
      "comparative_analysis": "Simulated LLM output comparing options..."
    },
    "accumulated_hitl_interactions": [],
    "error_log": null // 如果执行失败，这里会包含详细的错误日志
  },
  "staleness_report": null // 若非空，表示此节点的输入依赖已过时，UI应提示用户
}
```

##### `staleness_report` 示例 (如果存在):
```json
"staleness_report": [
  {
    "upstream_node_id": 100, // 上游节点的ID
    "upstream_definition_id": "1.1.1", // 上游节点的定义ID
    "consumed_version_id": 1, // 当前节点上次执行时所使用的上游版本号
    "current_active_version_id": 2 // 上游节点当前最新的活动版本号
  }
]
```

##### 错误响应
*   `401 Unauthorized`: 认证失败。
*   `403 Forbidden`: 用户无权访问该节点，或试图访问未解锁的节点。
*   `404 Not Found`: 指定的 `node_id` 不存在。



--- (1536-1581 lines) ---
### 5. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了节点与执行控制模块中使用的核心数据对象。

#### 5.1. NodeDetailView

`GET /nodes/{node_id}` 返回的节点详细视图对象，继承自 `NodeInstanceRead`。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| *(所有 NodeInstanceRead 字段)* | | 参见项目管理文档中的 `NodeInstanceRead` 定义。 |
| `active_version` | object (NodeVersionRead) \| null | 如果节点已完成，此字段包含其当前活动版本的完整数据。 |
| `pending_result` | object (TemporaryExecutionRead) \| null | 如果节点正在执行或等待审批，此字段包含其临时的、未固化的结果。 |
| `staleness_report` | array (StalenessInfo) \| null | 如果节点的上游依赖已更新，此列表将包含详细的过时信息。 |

#### 5.2. NodeVersionRead

表示一个已固化的节点版本。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 版本的唯一标识符。 |
| `version_number`| integer | 版本号，在单个节点内递增。 |
| `node_instance_id` | integer | 所属节点实例的 ID。 |
| `summary` | string | 对此版本创建原因的简短总结 (例如, "Manually edited...")。 |
| `source` | string (enum) | 版本的来源。可选值: `"AI_GENERATED"`, `"MANUALLY_EDITED"`。 |
| `based_on_version_id` | integer \| null | 此版本所基于的前一个版本的 ID。 |
| `output_data` | object \| null | 节点执行后，经过 HITL 处理的最终输出数据。 |
| `raw_generated_output`| object \| null | AI 或执行引擎生成的原始、未经处理的输出数据。 |
| **`execution_artifacts`** | **object \| null** | **[新增]** 包含了执行此版本时产生的关键产物，用于数据溯源。可能包含：`prompt` (发送给LLM的提示), `generated_code.py` (生成的代码), `execution.log` (代码执行日志)等。 |
| `input_dependencies` | object | 一个映射 `{[upstream_node_id]: [consumed_version_id]}`，记录了执行时使用的上游依赖版本。 |
| `hitl_history` | array (object) | 包含了从创建到批准此版本的所有人机交互记录。 |
| `llm_model_name`| string | 执行此版本时使用的 LLM 模型名称。 |
| `temperature` | number (float) | 执行此版本时使用的 LLM 温度参数。 |

#### 5.3. TemporaryExecutionRead

表示节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时结果。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `output_data` | object \| null | AI 或执行引擎生成的当前临时输出。 |
| **`execution_artifacts`** | **object \| null** | **[新增]** 在当前执行周期内产生的关键产物。结构与 `NodeVersionRead` 中的 `execution_artifacts` 类似。 |
| `accumulated_hitl_interactions` | array (object) | 在当前执行周期内累积的人机交互记录。 |
| `error_log` | string \| null | 如果执行失败，这里会包含详细的错误信息和堆栈跟踪。 |



--- (1592-1630 lines) ---
### 1. 核心原则与最佳实践

在深入细节之前，请理解以下核心设计原则：

1.  **WebSocket 是状态的“增量更新器”，而非唯一来源**:
    *   **初始状态通过 REST 获取**: 页面或组件加载时，**必须**首先通过 `GET /workflows/{id}` 或 `GET /projects/{id}` API 获取工作流的**完整快照**作为基础状态。
    *   **WebSocket 负责后续更新**: 建立 WebSocket 连接后，收到的事件用于**更新**这个基础状态。

2.  **事件是幂等的，携带全量数据**:
    *   `NODE_STATUS_UPDATED` 事件中的 `data` 负载是该节点的**完整最新状态**，而非“变更部分”的 diff。这意味着前端可以直接用新数据**替换**旧的节点数据，无需复杂的合并逻辑，这极大地降低了出错的概率。

3.  **连接是短暂的，状态是持久的**:
    *   不要假设 WebSocket 连接会永远存在。客户端必须实现**断线重连**机制。
    *   **重连后必须同步状态**: 每次成功重连后，应**立即**重新调用 REST API 获取一次全量快照，以同步断连期间可能错过的所有更新。这是保证数据一致性的关键。

#### 1.1. 推荐的数据流模型

```text
                             +-----------------------------+
                             |       前端状态管理器         |  <-- (Vuex, Redux, etc.)
                             | (e.g., currentWorkflow)     |
                             +-----------------------------+
                                     ^          ^
                                     |          | (5. 事件驱动更新)
(4. 用响应数据“灌溉”/覆盖初始状态)    |          |
                                     |          |
+------------------------------------+          +--------------------------------------+
| (1. 页面加载)                      |          | (3. 建立连接)                           |
| 前端发起 REST 请求                 |          | 前端建立 WebSocket 连接                  |
| GET /workflows/{id}                |          | ws://.../ws/{id}?token=...           |
+------------------------------------+          +--------------------------------------+
       |        |                                           |        ^
       |        | (2. 响应)                                 |        | (持续)
       v        v                                           v        |
+------------------------------------------------------------------------------------+
|                                    后端服务器                                        |
+------------------------------------------------------------------------------------+
```



--- (1658-1677 lines) ---
### 4. 消息格式 (`EventPayload`)

#### 4.1. EventPayload

所有从服务器推送到客户端的 WebSocket 消息都遵循此结构。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `event_type` | string (enum) | 事件的类型，决定了 `data` 负载的结构和前端应采取的行动。 |
| `workflow_id`| integer | 事件所属的工作流实例 ID。 |
| `node_id` | integer \| null | 如果是节点级事件，则为关联的节点 ID；否则为 `null`。 |
| `data` | object | 事件的负载。其具体结构取决于 `event_type`。 |

#### 4.2. 事件负载 (`data`) 结构

*   **当 `event_type` 为 `NODE_STATUS_UPDATED` 或 `NODE_ACTIVE_VERSION_CHANGED` 时**: **[标题更新]**
    *   `data` 的结构为 `NodeInstanceRead`。**[重要变化]** 此对象现在包含 `is_stale` 字段。详情请参见项目管理文档。
*   **当 `event_type` 为 `WORKFLOW_STRUCTURE_UPDATED` 或 `WORKFLOW_STATUS_UPDATED` 时**:
    *   `data` 的结构为 `WorkflowInstanceRead`。**[重要变化]** 其内部嵌套的每个节点对象 (`nodes` 数组中) 也都包含 `is_stale` 字段。



--- (1678-1722 lines) ---
### 5. 事件详解

#### 5.1. `NODE_STATUS_UPDATED` (高频)

*   **描述**: 工作流中单个节点的状态发生变化。这是构建动态 UI 的核心事件。
*   **`data` 负载**: `NodeInstanceRead` 对象 (节点的**完整**最新数据，**包含 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **状态变更**: 根据 `status` (现在包括 `Canceled`) 和 `current_stage` 更新节点的视觉表现。
    *   **交互锁定**: 当 `status` 变为 `Executing` 时，应禁用该节点上的所有操作按钮（如"执行"、"批准"），并显示加载指示器。
    *   **交互解锁**: 当 `status` 变为 `Awaiting HITL Approval`, `Failed`, 或 `Canceled` 时，应解锁对应的 HITL 操作按钮（如"批准/拒绝"或"重试"）。
    *   **数据刷新**: 如果用户正在查看该节点的详细视图，应使用事件 `data` 中的信息刷新视图内容。

#### 5.2. `NODE_ACTIVE_VERSION_CHANGED` (中频，高影响)

*   **描述**: 某个节点的"活动版本"(`active_version`) 发生了变更。这通常由以下操作触发：
    1.  用户手动切换到某个历史版本 (`POST /nodes/{id}/versions/{id}/activate`)。
    2.  用户提交了一次手动编辑 (`POST /nodes/{id}/manual-edit`)，创建了一个新的活动版本。
    3.  一个探索性的重新执行 (`re-execute`) 完成并被批准，创建了一个新的活动版本。
*   **`data` 负载**: `NodeInstanceRead` 对象 (变更后节点的**完整**最新数据，包含了新的 `active_version_id`)。
*   **UI 影响与操作**:
    *   **核心目的**: 此事件是**下游节点过时状态发生变化的权威信号**。
    *   **推荐操作流**:
        1.  收到此事件后，更新状态管理器中对应 `node_id` 的数据。
        2.  **立即**调用 `GET /workflows/{workflow_id}` 重新获取整个工作流的最新状态。这会刷新所有节点的 `is_stale` 标志。
        3.  使用新的工作流数据重新渲染画布，此时下游节点的视觉状态（警告图标等）会正确更新。
    *   **为何重要**: 如果不处理此事件，当上游节点版本变化时，UI 将无法及时向用户反馈下游节点的数据已"过时"，可能导致用户基于陈旧数据做出决策。

#### 5.3. `WORKFLOW_STRUCTURE_UPDATED` (低频，高影响)

*   **描述**: 工作流的节点集合发生了根本性变化（增加/重排序），通常由 `Generator` 节点完成时触发。
*   **`data` 负载**: `WorkflowInstanceRead` 对象 (包含**全新且完整**的 `Phase -> Stage -> Node` 树，**每个节点都带有最新的 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **全量替换**: **必须**将前端状态管理器中的 `phases` 树完全替换为此事件 `data.phases`。**严禁**尝试进行 diff 或 patch 操作。
    *   **用户体验考量**: 这是一个颠覆性的更新。建议在 UI 上显示一个短暂的、非阻塞的通知（例如 Toast "工作流已更新"），以告知用户发生了结构性变化。如果用户的焦点（例如，正在编辑的表单）位于受影响的节点上，需要谨慎处理，避免丢失用户输入。
    *   **渲染优化**: 在 Vue/React 中，确保你的节点列表渲染使用了 `key` 属性（例如 `v-for` 或 `.map`），以帮助框架高效地重新渲染 DOM。

#### 5.4. `WORKFLOW_STATUS_UPDATED` (低频)

*   **描述**: 整个工作流的顶级状态发生变化，主要是当工作流完成时。
*   **`data` 负载**: `WorkflowInstanceRead` 对象 (**其内部节点也包含最新的 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **全局状态更新**: 更新页面标题栏或面包屑导航中的工作流状态。
    *   **功能解锁**: 当 `data.status` 变为 `Completed` 时，应**启用**"导出项目"等最终操作按钮。
    *   **庆祝/总结**: 可以触发一个祝贺动画或自动导航到项目总结页面。



--- (1725-1734 lines) ---
#### 6.1. 状态同步与“灌溉”模式 (State Hydration)

这是保证数据一致性的核心模式：

1.  **加载 (Load)**: 组件挂载时，显示全局加载状态。
2.  **获取 (Fetch)**: 调用 `GET /workflows/{id}`。
3.  **灌溉 (Hydrate)**: 请求成功后，将完整的响应数据存入状态管理器。此时，隐藏全局加载状态，渲染页面。
4.  **连接 (Connect)**: 在“灌溉”完成后，建立 WebSocket 连接。
5.  **更新 (Update)**: 监听事件，并用事件数据更新状态管理器中的对应部分。



--- (264-275 lines) ---
#### 4.2. UserRead

表示用户的公开信息，用于注册成功后或查询用户信息时返回。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 用户的唯一标识符。 |
| `email` | string (Email) | 用户的注册电子邮件地址。 |
| `display_name` | string \| null | 用户的显示名称。 |
| `is_active` | boolean | 账户是否被激活。 |
| `is_verified` | boolean | 账户的电子邮件地址是否已验证。 |



--- (483-497 lines) ---
#### 3.2. UserSettingsRead

表示用户的个性化设置信息，用于 `GET /users/me/settings` 和 `PATCH /users/me/settings` 的成功响应。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `language` | string (enum) | 应用界面语言。可选值: `"en"`, `"zh"`。 |
| `theme` | string (enum) | 应用界面主题。可选值: `"light"`, `"dark"`。 |
| `hitl_profile` | string (enum) | AI 在人机交互环节的行为偏好。可选值: `"Novice"`, `"Experienced"`, `"Expert"`。 |
| `thinking_depth`| string (enum) | AI 生成内容的复杂度。可选值: `"Instant"`, `"Medium"`, `"Heavy"`。 |
| `llm_model_name`| string \| null | 用户自定义的 LLM 模型名称。若为 `null`，则使用系统默认模型。 |
| `llm_base_url` | string \| null | 用户自定义的 LLM API Base URL。若为 `null`，则使用系统默认 URL。 |
| `has_llm_api_key` | boolean | 指示用户是否已设置 LLM API 密钥。**绝不**返回密钥本身。 |
| `has_e2b_api_key` | boolean | 指示用户是否已设置 E2B (沙箱) API 密钥。**绝不**返回密钥本身。 |


</api>

<front_stack>
--- (18-25 lines) ---
### 二、 状态管理

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |



--- (148-148 lines) ---
| **`Link` (自定义)** | 位于 `components/deer-flow/link.tsx`，这是一个增强版的 `<a>` 标签。它会查询 Zustand store 中的工具调用历史，判断一个链接是否在之前的搜索结果中出现过。如果未出现，则会显示一个“链接不可靠”的警告图标。这是一个**将 UI 组件与业务状态深度结合**的创新实践。 |


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



--- (206-206 lines) ---
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |


--- (249-249 lines) ---
| **状态更新批处理** | `core/store/store.ts` 中的 `sendMessage` 函数在处理 SSE 流时，并没有在每次收到 `chunk` 时都立即调用 `setState`，而是将待更新的消息放入一个 `pendingUpdates` Map 中，并通过 `setTimeout` 进行批处理。这种“去抖”或“批处理”的模式，将一秒内可能发生的数十次状态更新合并为少数几次，极大地减少了 React 的渲染次数，是流式应用性能优化的关键。 |


--- (261-261 lines) ---
| **原子化且可组合的 Store Action** | `core/store/settings-store.ts` 中提供了一系列小巧、独立的 action 函数，如 `setReportStyle`, `setEnableDeepThinking`。它们封装了对 Zustand store 的特定修改，并自动调用 `saveSettings` 进行持久化。这使得在应用的任何地方修改设置都变得简单且一致。 |

</front_stack>

<deer_flow_frontend_code>
--- (584-1106 lines) ---
        ## models
         - user.model.ts
         - node.model.ts
         - auth.model.ts
         - project.model.ts
         - system.model.ts
         - workflow.model.ts
         - common.model.ts
         - settings.model.ts

### core/models/user.model.ts Content:

```ts
import { z } from "zod";

// API 4.2 (Auth) / 3.1 (User Management): UserRead
export const UserReadSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  is_active: z.boolean(),
  is_verified: z.boolean(),
});
export type UserRead = z.infer<typeof UserReadSchema>;

// API 1.2 (User Management): PasswordChange
export const PasswordChangeRequestSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  // API Spec 2.1.2 requirement: minimum 8 characters
  new_password: z.string().min(8, "New password must be at least 8 characters long"),
});
export type PasswordChangeRequest = z.infer<typeof PasswordChangeRequestSchema>;

```

### core/models/node.model.ts Content:

```ts
import { z } from "zod";

import {
  HITLActionEnum,
  HITLResponseActionEnum,
  VersionSourceEnum,
} from "~/constants/enums";

import { ExecutionArtifactsSchema, JsonObjectSchema } from "./common.model";
import {
  NodeInstanceReadSchema,
  StalenessInfoSchema,
} from "./workflow.model";

// --- Execution Results & Versions (The core data artifacts) ---

// API 5.5.2: NodeVersionRead (Immutable snapshot after approval - R5.6, V1.1)
export const NodeVersionReadSchema = z.object({
  id: z.number().int(),
  version_number: z.number().int(),
  node_instance_id: z.number().int(),
  summary: z.string().nullable(),
  source: VersionSourceEnum,
  based_on_version_id: z.number().int().nullable(),
  // The Snapshot Content (V1.2)
  output_data: JsonObjectSchema.nullable(),
  raw_generated_output: JsonObjectSchema.nullable(),
  execution_artifacts: ExecutionArtifactsSchema,
  // input_dependencies: { [upstream_node_id]: consumed_version_id }
  // Keys are node IDs (numbers), but JSON object keys are strings.
  input_dependencies: z.record(z.string(), z.number().int()),
  hitl_history: z.array(JsonObjectSchema),
  // Environment Parameters (V1.2)
  llm_model_name: z.string().nullable(),
  temperature: z.number().nullable(),
});
export type NodeVersionRead = z.infer<typeof NodeVersionReadSchema>;

// API 5.5.3: TemporaryExecutionRead (Pending results during Executing/Awaiting HITL)
export const TemporaryExecutionReadSchema = z.object({
  output_data: JsonObjectSchema.nullable(),
  execution_artifacts: ExecutionArtifactsSchema,
  accumulated_hitl_interactions: z.array(JsonObjectSchema),
  error_log: z.string().nullable(), // For Failed status
});
export type TemporaryExecutionRead = z.infer<
  typeof TemporaryExecutionReadSchema
>;

// API 5.5.1: NodeDetailView (The comprehensive view for rendering the workspace)
// Extends NodeInstanceRead with detailed results/versions.
export const NodeDetailViewSchema = NodeInstanceReadSchema.extend({
  active_version: NodeVersionReadSchema.nullable(),
  pending_result: TemporaryExecutionReadSchema.nullable(),
  // Detailed staleness info for the current node view (API 5.1.1)
  staleness_report: z.array(StalenessInfoSchema).nullable(),
});
export type NodeDetailView = z.infer<typeof NodeDetailViewSchema>;

// --- Execution Control Requests ---

// API 5.2.1, 5.2.2: ExecutionRequest (Used for Re-execute and Retry)
export const ExecutionRequestSchema = z.object({
  modification_comments: z.string().optional(),
  // Used only for re-execute to specify the base version
  base_version_id: z.number().int().optional(),
});
export type ExecutionRequest = z.infer<typeof ExecutionRequestSchema>;

// API 5.4.1: ManualEditSubmission (R4.1, R4.2)
export const ManualEditSubmissionSchema = z.object({
  base_version_id: z.number().int(),
  edited_output_data: JsonObjectSchema,
  summary: z.string().optional(),
});
export type ManualEditSubmission = z.infer<typeof ManualEditSubmissionSchema>;

// --- HITL (Human-in-the-Loop) Models ---

// API 5.3: HITLSubmission (Request payload for user decisions)
export const HITLSubmissionSchema = z.object({
  action: HITLActionEnum,
  // Required if action is RejectAndProvideModificationComments
  feedback_comment: z.string().nullable().optional(),
  // Required if action is Continue. Structure depends on HITLMode (SCA, AVL).
  interaction_data: JsonObjectSchema.nullable().optional(),
});
export type HITLSubmission = z.infer<typeof HITLSubmissionSchema>;

// API 5.3: HITLResponse (Response that guides frontend navigation)
export const HITLResponseSchema = z.object({
  message: z.string(),
  next_node_id: z.number().int().nullable().optional(),
  action: HITLResponseActionEnum,
});
export type HITLResponse = z.infer<typeof HITLResponseSchema>;

// API 5.2.x Response (Async execution accepted)
export const ExecutionAcceptedResponseSchema = z.object({
  message: z.string(),
  // node_id is optional as per API 5.2.3 example response
  node_id: z.number().int().optional(),
});
export type ExecutionAcceptedResponse = z.infer<
  typeof ExecutionAcceptedResponseSchema
>;

```

### core/models/auth.model.ts Content:

```ts
import { z } from "zod";

// --- Request Schemas ---

// API 1.1: Login (used for form validation)
// The actual request must be application/x-www-form-urlencoded with 'username' and 'password' fields.
export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// API 1.2: Register
export const RegisterRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  // API Spec 1.2.1 requirement: minimum 8 characters
  password: z.string().min(8, "Password must be at least 8 characters long"),
  display_name: z.string().optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// API 3.1: Request Password Reset (future development expectation)
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// --- Response Schemas ---

// API 4.1: Token Response
export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
});
export type TokenResponse = z.infer<typeof TokenResponseSchema>;

```

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

### core/models/system.model.ts Content:

```ts
import { z } from "zod";

// API 7.4.1: SystemInfo (Application metadata and configuration)
export const SystemInfoSchema = z.object({
  app_version: z.string(),
  llm_model_name: z.string(), // System default LLM
  // Include potential future fields for robustness (API 7.3 Future-Proofing)
  commit_hash: z.string().optional(),
  build_timestamp: z.string().optional(),
  documentation_url: z.string().optional(),
  feature_flags: z.record(z.string(), z.boolean()).optional(),
});
export type SystemInfo = z.infer<typeof SystemInfoSchema>;

// API 7.1: Liveness Probe Response
export const LivenessResponseSchema = z.object({
  message: z.string(),
});
export type LivenessResponse = z.infer<typeof LivenessResponseSchema>;

// API 7.2: Health Check (Readiness Probe) Response
export const HealthCheckResponseSchema = z.object({
  status: z.literal("ok"),
});
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

```

### core/models/workflow.model.ts Content:

```ts
import { z } from "zod";

import {
  ExecutionStageEnum,
  HITLModeEnum,
  NodeStatusEnum,
  NodeTypeEnum,
  WorkflowStatusEnum,
} from "~/constants/enums";

// --- Core Component Models (The building blocks) ---

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

// API 4.4.3: StageRead
export const StageReadSchema = z.object({
  id: z.string(),
  name: z.string(),
  nodes: z.array(NodeInstanceReadSchema),
});
export type StageRead = z.infer<typeof StageReadSchema>;

// API 4.4.2: PhaseRead
export const PhaseReadSchema = z.object({
  name: z.string(),
  stages: z.array(StageReadSchema),
});
export type PhaseRead = z.infer<typeof PhaseReadSchema>;

// --- Workflow Instance Models ---

// API 4.1.2: WorkflowSummaryRead (Lightweight version for lists)
export const WorkflowSummaryReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: WorkflowStatusEnum,
  project_id: z.number().int(),
  user_id: z.number().int(),
  // API 4.1.2 example includes created_at
  created_at: z.string().datetime().optional(),
});
export type WorkflowSummaryRead = z.infer<typeof WorkflowSummaryReadSchema>;

// API 4.4.1: WorkflowInstanceRead (The complete workflow structure and state)
export const WorkflowInstanceReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: WorkflowStatusEnum,
  project_id: z.number().int(),
  user_id: z.number().int(),
  phases: z.array(PhaseReadSchema),
});

export type WorkflowInstanceRead = z.infer<typeof WorkflowInstanceReadSchema>;

// --- Utility Models ---

// API 4.4.4: StalenessInfo (Details on why a node is stale)
export const StalenessInfoSchema = z.object({
  upstream_node_id: z.number().int(),
  upstream_definition_id: z.string(),
  consumed_version_id: z.number().int(),
  current_active_version_id: z.number().int().nullable(),
});
export type StalenessInfo = z.infer<typeof StalenessInfoSchema>;

// API 4.3.1: Workflow Staleness Report (Map<NodeId, StalenessInfo[]>)
export const WorkflowStalenessReportSchema = z.record(
  z.string(), // Node ID (as string key in JSON object)
  z.array(StalenessInfoSchema),
);
export type WorkflowStalenessReport = z.infer<
  typeof WorkflowStalenessReportSchema
>;

// --- Create/Update Models (Requests) ---

// API 4.1.1: WorkflowCreate
export const WorkflowCreateSchema = z.object({
  name: z.string().min(1, "Workflow name is required."),
  project_id: z.number().int(),
});
export type WorkflowCreate = z.infer<typeof WorkflowCreateSchema>;

// API 4.2.2: WorkflowUpdate (PATCH request)
export const WorkflowUpdateSchema = z.object({
  name: z.string().min(1, "Workflow name is required.").optional(),
});
export type WorkflowUpdate = z.infer<typeof WorkflowUpdateSchema>;

```

### core/models/common.model.ts Content:

```ts
import { z } from "zod";

/**
 * Generic schema factory for paginated responses (API 3.1.2, 4.1.2).
 * @param itemSchema The Zod schema for the items in the list.
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    total: z.number().int(),
    items: z.array(itemSchema),
  });

/**
 * Type helper for PaginatedResponse.
 * Aligns with the interface defined in core/api/types.ts.
 */
export type PaginatedResponse<T> = {
  total: number;
  items: T[];
};

// Generic schema for dynamic JSON structures (e.g., LLM outputs, HITL interactions)
export const JsonObjectSchema = z.record(z.string(), z.any());

// Define the structure for Execution Artifacts (API 5.5.2, 5.5.3, Design Doc 2.1.2.B)
// We use .passthrough() to allow keys beyond the documented ones, ensuring flexibility.
export const ExecutionArtifactsSchema = z
  .object({
    prompt: z.string().optional(),
    raw_llm_response: z.string().optional(),
    "generated_code.py": z.string().optional(),
    "execution.log": z.string().optional(),
    tool_call_log: z.any().optional(), // Tool logs can be complex objects or arrays
  })
  .passthrough()
  .nullable();
export type ExecutionArtifacts = z.infer<typeof ExecutionArtifactsSchema>;

```

### core/models/settings.model.ts Content:

```ts
import { z } from "zod";

// Enums based on FRS 7.2, 7.4, 7.5 and API 2.2
export const LanguageEnum = z.enum(["en", "zh"]);
export type Language = z.infer<typeof LanguageEnum>;

// We use "system" internally for next-themes UI, but the API expects only light/dark.
export const ThemeEnumUI = z.enum(["light", "dark", "system"]);
export type ThemeUI = z.infer<typeof ThemeEnumUI>;

export const ThemeEnumAPI = z.enum(["light", "dark"]);
export type ThemeAPI = z.infer<typeof ThemeEnumAPI>;

export const HitlProfileEnum = z.enum(["Novice", "Experienced", "Expert"]);
export type HitlProfile = z.infer<typeof HitlProfileEnum>;

export const ThinkingDepthEnum = z.enum(["Instant", "Medium", "Heavy"]);
export type ThinkingDepth = z.infer<typeof ThinkingDepthEnum>;

// API 3.2 (User Management): UserSettingsRead
// This model is used for GET responses. It NEVER includes secrets.
export const UserSettingsReadSchema = z.object({
  language: LanguageEnum,
  theme: ThemeEnumAPI, // Backend stores explicit light or dark
  hitl_profile: HitlProfileEnum,
  thinking_depth: ThinkingDepthEnum,
  llm_model_name: z.string().nullable(),
  // Allow empty string which might be parsed from inputs before validation
  llm_base_url: z.string().url().nullable().or(z.literal("")),
  // Security Indicators (Write-After-Forgotten - S3.3)
  has_llm_api_key: z.boolean(),
  has_e2b_api_key: z.boolean(),
});
export type UserSettingsRead = z.infer<typeof UserSettingsReadSchema>;

// API 2.2 (User Management): UserSettingsUpdate (PATCH Request)
// This model is used for PATCH requests. All fields are optional.
// It allows sending secrets (明文) for update, or null/"" for deletion.
export const UserSettingsUpdateSchema = z.object({
  language: LanguageEnum.optional(),
  theme: ThemeEnumAPI.optional(),
  hitl_profile: HitlProfileEnum.optional(),
  thinking_depth: ThinkingDepthEnum.optional(),
  llm_model_name: z.string().nullable().optional(),
  llm_base_url: z.string().url().nullable().optional().or(z.literal("")),
  // Writable secrets. Send null or "" to clear.
  llm_api_key: z.string().nullable().optional(),
  e2b_api_key: z.string().nullable().optional(),
});
export type UserSettingsUpdate = z.infer<typeof UserSettingsUpdateSchema>;

```


--- (1171-2250 lines) ---
        ## api
         - node.service.ts
         - system.service.ts
         - project.service.ts
         - auth.service.ts
         - resolve-service-url.ts
         - user.service.ts
         - types.ts
         - client.ts
         - workflow.service.ts
         - index.ts

### core/api/node.service.ts Content:

```ts
import { AxiosError } from "axios";

import type {
  ExecutionAcceptedResponse,
  ExecutionRequest,
  HITLResponse,
  HITLSubmission,
  ManualEditSubmission,
  NodeDetailView,
  NodeVersionRead,
} from "~/core/models/node.model";
import type { NodeInstanceRead } from "~/core/models/workflow.model";

import apiClient from "./client";

/**
 * API Service for Node & Execution Control (API 5).
 */
export const NodeService = {
  // --- 1. Node Query & Display (API 5.1) ---

  /**
   * Gets the detailed view of a specific node (API 5.1.1).
   */
  getNodeById: async (nodeId: number): Promise<NodeDetailView> => {
    try {
      const response = await apiClient.get<NodeDetailView>(`/nodes/${nodeId}`);
      return response.data;
    } catch (error) {
      // Handle 403 Forbidden (Accessing node beyond execution frontier - R5.2)
      if (error instanceof AxiosError && error.response?.status === 403) {
        throw new Error("NODE_BEYOND_FRONTIER");
      }
      throw error;
    }
  },

  /**
   * Gets the list of all versions for a specific node (API 5.1.2).
   */
  getNodeVersions: async (nodeId: number): Promise<NodeVersionRead[]> => {
    const response = await apiClient.get<NodeVersionRead[]>(
      `/nodes/${nodeId}/versions`,
    );
    return response.data;
  },

  /**
   * Gets the details of a specific version (API 5.1.3).
   */
  getNodeVersionById: async (
    nodeId: number,
    versionId: number,
  ): Promise<NodeVersionRead> => {
    const response = await apiClient.get<NodeVersionRead>(
      `/nodes/${nodeId}/versions/${versionId}`,
    );
    return response.data;
  },

  // --- 2. Execution Control (Start & Stop) (API 5.2) ---

  /**
   * Re-executes a completed node (Exploratory) (API 5.2.1).
   */
  reExecuteNode: async (
    nodeId: number,
    data: ExecutionRequest = {},
  ): Promise<ExecutionAcceptedResponse> => {
    try {
      // Expect 202 Accepted. Status updates via WebSocket.
      const response = await apiClient.post<ExecutionAcceptedResponse>(
        `/nodes/${nodeId}/re-execute`,
        data,
        {
          validateStatus: (status) => status === 202,
        },
      );
      return response.data;
    } catch (error) {
      handleExecutionError(error);
      // If handleExecutionError didn't throw a specific error, re-throw the original
      throw error;
    }
  },

  /**
   * Retries a failed or canceled node (Corrective) (API 5.2.2).
   */
  retryNode: async (
    nodeId: number,
    data: ExecutionRequest = {},
  ): Promise<ExecutionAcceptedResponse> => {
    try {
      // Expect 202 Accepted.
      const response = await apiClient.post<ExecutionAcceptedResponse>(
        `/nodes/${nodeId}/retry`,
        data,
        {
          validateStatus: (status) => status === 202,
        },
      );
      return response.data;
    } catch (error) {
      handleExecutionError(error);
      throw error;
    }
  },

  /**
   * Cancels an executing node (API 5.2.3).
   */
  cancelNode: async (nodeId: number): Promise<ExecutionAcceptedResponse> => {
    try {
      // Expect 202 Accepted.
      const response = await apiClient.post<ExecutionAcceptedResponse>(
        `/nodes/${nodeId}/cancel`,
        null,
        {
          validateStatus: (status) => status === 202,
        },
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (Node not executing)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("NODE_NOT_EXECUTING");
      }
      throw error;
    }
  },

  // --- 3. Human-in-the-Loop (HITL) (API 5.3) ---

  /**
   * Submits HITL decision for a node awaiting approval (API 5.3).
   */
  submitHITL: async (
    nodeId: number,
    data: HITLSubmission,
  ): Promise<HITLResponse> => {
    try {
      const response = await apiClient.post<HITLResponse>(
        `/nodes/${nodeId}/hitl`,
        data,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle 409 Conflict (Node not awaiting approval)
        if (error.response?.status === 409) {
          throw new Error("NODE_NOT_AWAITING_APPROVAL");
        }
        // Handle 400 Bad Request (Invalid interaction data)
        if (error.response?.status === 400) {
          throw new Error("INVALID_HITL_SUBMISSION");
        }
      }
      throw error;
    }
  },

  // --- 4. Version & Result Intervention (API 5.4) ---

  /**
   * Submits a manual edit (API 5.4.1).
   */
  manualEdit: async (
    nodeId: number,
    data: ManualEditSubmission,
  ): Promise<NodeInstanceRead> => {
    try {
      const response = await apiClient.post<NodeInstanceRead>(
        `/nodes/${nodeId}/manual-edit`,
        data,
      );
      return response.data;
    } catch (error) {
      handleInterventionError(error);
      throw error;
    }
  },

  /**
   * Activates a specific historical version (API 5.4.2).
   */
  activateVersion: async (
    nodeId: number,
    versionId: number,
  ): Promise<NodeInstanceRead> => {
    try {
      const response = await apiClient.post<NodeInstanceRead>(
        `/nodes/${nodeId}/versions/${versionId}/activate`,
        null, // No body required
      );
      return response.data;
    } catch (error) {
      handleInterventionError(error);
      throw error;
    }
  },
};

// --- Helper Functions for Error Handling ---

/**
 * Centralized handling for execution-related errors (409, 403).
 */
const handleExecutionError = (error: unknown) => {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    // 409 Conflict (Invalid state for execution)
    if (status === 409) {
      throw new Error("INVALID_STATE_FOR_EXECUTION");
    }
    // 403 Forbidden (e.g., trying to re-execute Generator node - W3.2)
    if (status === 403) {
      throw new Error("ACTION_FORBIDDEN_ON_NODE_TYPE");
    }
  }
  // If not handled specifically, the error propagates implicitly if not caught by the caller's catch block.
};

/**
 * Centralized handling for intervention-related errors (409, 403).
 */
const handleInterventionError = (error: unknown) => {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    // 409 Conflict (Invalid state or IDs, e.g., invalid base_version_id)
    if (status === 409) {
      throw new Error("INVALID_STATE_OR_VERSION_MISMATCH");
    }
    // 403 Forbidden (e.g., trying to edit/switch Generator node - W3.2)
    if (status === 403) {
      throw new Error("ACTION_FORBIDDEN_ON_NODE_TYPE");
    }
  }
};

```

### core/api/system.service.ts Content:

```ts
import { AxiosError } from "axios";

import type {
  HealthCheckResponse,
  LivenessResponse,
  SystemInfo,
} from "~/core/models/system.model";

import apiClient from "./client";

/**
 * API Service for System & Infrastructure (API 7).
 * These endpoints are public.
 */
export const SystemService = {
  /**
   * Liveness Probe (GET /) (API 7.1). Checks if the service process is running.
   */
  getLiveness: async (): Promise<LivenessResponse> => {
    // Ensure no caching (API 7 Global Conventions)
    const response = await apiClient.get<LivenessResponse>("/", {
      headers: { "Cache-Control": "no-cache" },
      timeout: 5000, // Short timeout
    });
    return response.data;
  },

  /**
   * Readiness Probe (GET /health) (API 7.2). Checks service and dependencies health.
   */
  getReadiness: async (): Promise<HealthCheckResponse> => {
    try {
      // We explicitly validate status 200. 503 will throw an AxiosError.
      const response = await apiClient.get<HealthCheckResponse>("/health", {
        headers: { "Cache-Control": "no-cache" },
        validateStatus: (status) => status === 200,
      });
      return response.data;
    } catch (error) {
      // Handle 503 Service Unavailable specifically
      if (error instanceof AxiosError && error.response?.status === 503) {
        throw new Error("SERVICE_UNHEALTHY");
      }
      throw error;
    }
  },

  /**
   * Gets system information and static configuration (GET /system/info) (API 7.3).
   */
  getSystemInfo: async (): Promise<SystemInfo> => {
    // This response can be cached by the client (handled in state management/hooks).
    const response = await apiClient.get<SystemInfo>("/system/info");
    return response.data;
  },
};

```

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

### core/api/auth.service.ts Content:

```ts
import { AxiosError } from "axios";

import type {
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
} from "~/core/models/auth.model";
import type { UserRead } from "~/core/models/user.model";

import apiClient from "./client";

export const AuthService = {
  /**
   * Logs in a user (API 1.1.1).
   * IMPORTANT: Uses application/x-www-form-urlencoded.
   */
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    // The API expects 'username' field for the email (OAuth2 standard)
    formData.append("username", data.email);
    formData.append("password", data.password);

    try {
      const response = await apiClient.post<TokenResponse>("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    } catch (error) {
      // Specific error handling based on API 1.1 Integration Guide
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        if (status === 401) {
          // Throw a specific error code for the UI to catch
          throw new Error("INVALID_CREDENTIALS");
        }
        if (status === 403) {
          const detail = (error.response.data as { detail?: string })?.detail;
          if (detail?.includes("not verified")) {
            throw new Error("ACCOUNT_NOT_VERIFIED");
          }
          throw new Error("ACCOUNT_DISABLED");
        }
      }
      throw error; // Re-throw other errors
    }
  },

  /**
   * Registers a new user account (API 1.2.1).
   */
  register: async (data: RegisterRequest): Promise<UserRead> => {
    try {
      // Expect 201 Created
      const response = await apiClient.post<UserRead>("/auth/register", data, {
        validateStatus: (status) => status === 201,
      });
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (User already exists) - API 1 Common Errors
      if (error instanceof AxiosError && error.response?.status === 409) {
        const errorCode = (error.response.data as { error_code?: string })?.error_code;
        if (errorCode === "USER_ALREADY_EXISTS") {
          throw new Error("USER_ALREADY_EXISTS");
        }
      }
      throw error;
    }
  },

  /**
   * Verifies the user's email address (API 1.3.2).
   */
  verifyEmail: async (token: string): Promise<UserRead> => {
    try {
      const response = await apiClient.post<UserRead>("/auth/verify-email", { token });
      return response.data;
    } catch (error) {
      // Handle 401 Unauthorized (Invalid or expired token)
      if (error instanceof AxiosError && error.response?.status === 401) {
        throw new Error("TOKEN_INVALID_OR_EXPIRED");
      }
      throw error;
    }
  },

  /**
   * Resends the verification email (API 1.3.3).
   */
  resendVerificationEmail: async (email: string): Promise<void> => {
    // Expect 202 Accepted. The API handles the "always return success" logic.
    await apiClient.post(
      "/auth/resend-verification-email",
      { email },
      {
        validateStatus: (status) => status === 202,
      },
    );
  },

  /**
   * Requests a password reset (stub implementation) (API 1.3.1).
   */
  requestPasswordReset: async (data: ResetPasswordRequest): Promise<void> => {
    // Expect 202 Accepted. The API handles the "always return success" logic.
    await apiClient.post("/auth/reset-password", data, {
      validateStatus: (status) => status === 202,
    });
  },
};

```

### core/api/resolve-service-url.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { env } from "~/env";

/**
 * Constructs a full URL to the backend service.
 * @param path The API endpoint path (e.g., "auth/login")
 * @returns The full URL string
 */
export function resolveServiceURL(path: string): string {
  let BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;

  if (!BASE_URL.endsWith("/")) {
    BASE_URL += "/";
  }

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;

  return new URL(cleanPath, BASE_URL).toString();
}

```

### core/api/user.service.ts Content:

```ts
import { AxiosError } from "axios";

import type {
  UserSettingsRead,
  UserSettingsUpdate,
} from "~/core/models/settings.model";
import type { PasswordChangeRequest, UserRead } from "~/core/models/user.model";

import apiClient from "./client";

export const UserService = {
  /**
   * Gets the profile information of the currently authenticated user (API 2.1.1).
   */
  getCurrentUser: async (): Promise<UserRead> => {
    const response = await apiClient.get<UserRead>("/users/me");
    return response.data;
  },

  /**
   * Changes the password of the currently authenticated user (API 2.1.2).
   */
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    try {
      // Expect 204 No Content on success
      await apiClient.patch("/users/me/password", data, {
        validateStatus: (status) => status === 204,
      });
    } catch (error) {
      // Handle 403 Forbidden (Incorrect current password)
      if (error instanceof AxiosError && error.response?.status === 403) {
        throw new Error("INCORRECT_CURRENT_PASSWORD");
      }
      throw error;
    }
  },

  /**
   * Gets the personalized settings of the currently authenticated user (API 2.2.1).
   */
  getCurrentUserSettings: async (): Promise<UserSettingsRead> => {
    const response = await apiClient.get<UserSettingsRead>("/users/me/settings");
    return response.data;
  },

  /**
   * Updates the personalized settings of the currently authenticated user (API 2.2.2).
   */
  updateCurrentUserSettings: async (
    data: UserSettingsUpdate,
  ): Promise<UserSettingsRead> => {
    const response = await apiClient.patch<UserSettingsRead>("/users/me/settings", data);
    return response.data;
  },
};

```

### core/api/types.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

interface Option {
  text: string;
  value: string;
}

// Shared API response shapes
export interface PaginatedResponse<T> {
  total: number;
  items: T[];
}

// Tool Calls

export interface ToolCall {
  type: "tool_call";
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolCallChunk {
  type: "tool_call_chunk";
  index: number;
  id: string;
  name: string;
  args: string;
}

// Events

interface GenericEvent<T extends string, D extends object> {
  type: T;
  data: {
    id: string;
    thread_id: string;
    agent: "coordinator" | "planner" | "researcher" | "coder" | "reporter";
    role: "user" | "assistant" | "tool";
    finish_reason?: "stop" | "tool_calls" | "interrupt";
  } & D;
}

export interface MessageChunkEvent
  extends GenericEvent<
    "message_chunk",
    {
      content?: string;
      reasoning_content?: string;
    }
  > {}

export interface ToolCallsEvent
  extends GenericEvent<
    "tool_calls",
    {
      tool_calls: ToolCall[];
      tool_call_chunks: ToolCallChunk[];
    }
  > {}

export interface ToolCallChunksEvent
  extends GenericEvent<
    "tool_call_chunks",
    {
      tool_call_chunks: ToolCallChunk[];
    }
  > {}

export interface ToolCallResultEvent
  extends GenericEvent<
    "tool_call_result",
    {
      tool_call_id: string;
      content?: string;
    }
  > {}

export interface InterruptEvent
  extends GenericEvent<
    "interrupt",
    {
      options: Option[];
    }
  > {}

export type ChatEvent =
  | MessageChunkEvent
  | ToolCallsEvent
  | ToolCallChunksEvent
  | ToolCallResultEvent
  | InterruptEvent;

```

### core/api/client.ts Content:

```ts
import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

import { useStore } from "~/core/store";

import { resolveServiceURL } from "./resolve-service-url";

/**
 * Global Axios instance configured for the O-Award API.
 * Implements Architecture 5.1.1 (Interceptors for Auth and Error Handling).
 */
const apiClient = axios.create({
  baseURL: resolveServiceURL(""),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// --- Request Interceptor: Inject Authorization Token ---
apiClient.interceptors.request.use(
  (config) => {
    // Skip token injection for auth endpoints (login, register, etc.)
    if (config.url?.startsWith("/auth/")) {
      return config;
    }

    // Access the token directly from the Zustand store state.
    const token = useStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    const rejection = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(rejection);
  },
);

// --- Response Interceptor: Global Error Handling ---
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response, config } = error;

    // 1. Handle 401 Unauthorized (Authentication Failure)
    if (response?.status === 401) {
      // Avoid triggering global logout if the failed request was the login attempt itself or email verification.
      if (!config?.url?.includes("/auth/login") && !config?.url?.includes("/auth/verify-email")) {
        // Only trigger logout if the store actually thinks we are authenticated
        if (useStore.getState().isAuthenticated) {
          console.warn("401 Unauthorized detected. Logging out.");
          // Trigger global logout action.
          useStore.getState().logout(true, "Session expired. Please log in again.");
        }
      }
      // Specific 401 failures are handled locally in services/components.
    }

    // 2. Handle 403 Forbidden
    else if (response?.status === 403) {
      // Specific 403 errors (like unverified account during login) are handled locally in AuthService.
      // This is a catch-all for other forbidden actions within the app.
      if (!config?.url?.includes("/auth/login")) {
        toast.error("Access Denied", {
          description: "You do not have permission to perform this action.",
        });
      }
    }

    // 3. Handle Server Errors (5xx)
    else if (response?.status && response.status >= 500) {
      toast.error("Server Error", {
        description: "An unexpected error occurred on the server. Please try again later.",
      });
    }

    // 4. Handle Network Errors
    else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      toast.error("Network Error", {
        description: "Could not connect to the server. Please check your internet connection and API configuration.",
      });
    }

    // Pass the error along for local handling (e.g., in service catch blocks)
    const rejection = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(rejection);
  },
);

export default apiClient;

```

### core/api/workflow.service.ts Content:

```ts
import { AxiosError } from "axios";

import type { PaginatedResponse } from "~/core/models/common.model";
import type {
  WorkflowCreate,
  WorkflowInstanceRead,
  WorkflowStalenessReport,
  WorkflowSummaryRead,
  WorkflowUpdate,
} from "~/core/models/workflow.model";

import apiClient from "./client";

/**
 * API Service for Workflow Management (API 4).
 */
export const WorkflowService = {
  // --- 1. Workflow Lifecycle Management (API 4.1) ---

  /**
   * Gets the list of workflows for the current user (API 4.1.2).
   */
  getWorkflows: async (
    skip = 0,
    limit = 20,
  ): Promise<PaginatedResponse<WorkflowSummaryRead>> => {
    const response = await apiClient.get<
      PaginatedResponse<WorkflowSummaryRead>
    >("/workflows/", {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Creates a new workflow instance (API 4.1.1).
   * Note: Primary flow uses ProjectService.startWorkflow (API 3.3.1).
   */
  createWorkflow: async (
    data: WorkflowCreate,
  ): Promise<WorkflowInstanceRead> => {
    try {
      // Expect 201 Created
      const response = await apiClient.post<WorkflowInstanceRead>(
        "/workflows/",
        data,
        {
          validateStatus: (status) => status === 201,
        },
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (WORKFLOW_ALREADY_EXISTS)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("WORKFLOW_ALREADY_EXISTS");
      }
      throw error;
    }
  },

  // --- 2. Single Workflow Operations & Query (API 4.2) ---

  /**
   * Gets the detailed information (full structure) of a specific workflow (API 4.2.1).
   * Core API for loading/refreshing the workflow canvas (Architecture 5.3.1).
   */
  getWorkflowById: async (workflowId: number): Promise<WorkflowInstanceRead> => {
    const response = await apiClient.get<WorkflowInstanceRead>(
      `/workflows/${workflowId}`,
    );
    return response.data;
  },

  /**
   * Updates a workflow's basic information (API 4.2.2).
   */
  updateWorkflow: async (
    workflowId: number,
    data: WorkflowUpdate,
  ): Promise<WorkflowInstanceRead> => {
    const response = await apiClient.patch<WorkflowInstanceRead>(
      `/workflows/${workflowId}`,
      data,
    );
    return response.data;
  },

  /**
   * Deletes a workflow instance (API 4.2.3).
   */
  deleteWorkflow: async (workflowId: number): Promise<void> => {
    try {
      // Expect 204 No Content
      await apiClient.delete(`/workflows/${workflowId}`, {
        validateStatus: (status) => status === 204,
      });
    } catch (error) {
      // Handle 409 Conflict (WORKFLOW_IS_ACTIVE)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("WORKFLOW_IS_ACTIVE");
      }
      throw error;
    }
  },

  // --- 3. Workflow State Insights (API 4.3) ---

  /**
   * Gets the detailed staleness report for all nodes (API 4.3.1).
   */
  getWorkflowStaleness: async (
    workflowId: number,
  ): Promise<WorkflowStalenessReport> => {
    const response = await apiClient.get<WorkflowStalenessReport>(
      `/workflows/${workflowId}/staleness`,
    );
    return response.data;
  },
};

```

### core/api/index.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export * from "./auth.service";
export { default as apiClient } from "./client";
export * from "./resolve-service-url";
export * from "./types";
export * from "./user.service";
export * from "./project.service";
export * from "./workflow.service";
export * from "./node.service";
export * from "./system.service";

```


--- (2252-2468 lines) ---
        ## store
         - index.ts

### core/store/index.ts Content:

```ts
import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

import { createAuthSlice, type AuthSlice } from "./slices/auth.slice";
import { createSettingsSlice, type SettingsSlice } from "./slices/settings.slice";

// Define the combined state interface
export type GlobalState = AuthSlice & SettingsSlice;

// Define the type for the slice creator function, ensuring compatibility with devtools
// and allowing slices to access the full global state. (Architecture 4.2)
export type SliceCreator<T> = StateCreator<
  GlobalState,
  [["zustand/devtools", never]], // Middleware type
  [],
  T
>;

// Create the combined store using devtools middleware
export const useStore = create<GlobalState>()(
  devtools(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
      ...createSettingsSlice(set, get, api),
    }),
    { name: "O-Award-Store" }, // Name for Redux DevTools
  ),
);

```

            ## slices
             - settings.slice.ts
             - auth.slice.ts

### core/store/slices/settings.slice.ts Content:

```ts
import { toast } from "sonner";

import { UserService } from "~/core/api/user.service";
import type {
  UserSettingsRead,
  UserSettingsUpdate,
} from "~/core/models/settings.model";
import { type SliceCreator } from "~/core/store";

export interface SettingsSlice {
  // State
  settings: UserSettingsRead | null;
  isLoadingSettings: boolean;
  isUpdatingSettings: boolean;

  // Actions
  fetchSettings: () => Promise<UserSettingsRead | null>;
  updateSettings: (data: UserSettingsUpdate) => Promise<boolean>;
}

// The SettingsSlice relies on the AuthSlice being initialized and authenticated.
export const createSettingsSlice: SliceCreator<SettingsSlice> = (set, get) => ({
  settings: null,
  isLoadingSettings: false,
  isUpdatingSettings: false,

  fetchSettings: async () => {
    // Ensure user is authenticated before fetching
    if (!get().isAuthenticated) {
      return null;
    }

    // Avoid re-fetching if already loading or loaded
    if (get().isLoadingSettings || get().settings) return get().settings;

    set({ isLoadingSettings: true });
    try {
      const settings = await UserService.getCurrentUserSettings();
      set({ settings });
      return settings;
    } catch (error) {
      console.error("Failed to fetch user settings:", error);
      toast.error("Failed to load settings. Please try refreshing the page.");
      return null;
    } finally {
      set({ isLoadingSettings: false });
    }
  },

  updateSettings: async (data) => {
    if (!get().isAuthenticated) {
      return false;
    }

    // Optimization: Don't send empty updates
    if (Object.keys(data).length === 0) {
      return true;
    }

    set({ isUpdatingSettings: true });
    try {
      // The API returns the full updated settings object (API 2.2.2)
      const updatedSettings = await UserService.updateCurrentUserSettings(data);
      set({ settings: updatedSettings });
      toast.success("Settings updated successfully.");
      return true;
    } catch (error) {
      console.error("Failed to update user settings:", error);
      // Specific error handling based on API response might be added here.
      toast.error("Failed to update settings. Please check the values and try again.");
      return false;
    } finally {
      set({ isUpdatingSettings: false });
    }
  },
});

```

### core/store/slices/auth.slice.ts Content:

```ts
import { toast } from "sonner";

import { UserService } from "~/core/api/user.service";
import type { UserRead } from "~/core/models/user.model";
import { type SliceCreator } from "~/core/store";

// Using localStorage as a common fallback if HttpOnly cookies are not used (API 1. Core Mechanism).
const TOKEN_STORAGE_KEY = "o-award-auth-token";

export interface AuthSlice {
  // State
  token: string | null;
  user: UserRead | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // True after the initial auth check is complete

  // Actions
  initializeAuth: () => Promise<void>;
  // Used by components after successful login/verification
  handleAuthenticationSuccess: (token: string, user: UserRead) => void;
  logout: (redirectToLogin?: boolean, message?: string) => void;
  updateUserProfile: (user: UserRead) => void;
}

export const createAuthSlice: SliceCreator<AuthSlice> = (set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  initializeAuth: async () => {
    // 1. Check for token in storage
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      set({ isInitialized: true, isAuthenticated: false, user: null });
      return;
    }

    // 2. Set the token tentatively so the API client interceptor can use it
    set({ token: storedToken });

    // 3. Validate the token by fetching the user profile
    try {
      const user = await UserService.getCurrentUser();
      set({ isAuthenticated: true, user, isInitialized: true });
    } catch (error) {
      console.error("Error during auth initialization (token validation failed):", error);
      // If validation fails (e.g., 401), the API interceptor might trigger logout.
      // We ensure the initialized flag is set regardless.
      // If the interceptor didn't clear the state, we do it here as a fallback.
      if (get().token === storedToken) {
        get().logout(false, "Session validation failed.");
      }
      set({ isInitialized: true });
    }
  },

  handleAuthenticationSuccess: (token, user) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    set({ token, user, isAuthenticated: true, isInitialized: true });
  },

  logout: (redirectToLogin = true, message) => {
    // Clear token and user state
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
    // Also clear settings state when logging out (as settings depend on auth)
    set({ settings: null });

    if (message) {
      toast.info(message);
    }

    // Redirect using window.location if needed, as router might not be accessible here (e.g., called from API interceptor)
    if (redirectToLogin && typeof window !== "undefined") {
      // Check if we are already on an auth page to avoid unnecessary redirects
      // We use startsWith('/auth') based on the routing structure.
      if (!window.location.pathname.startsWith("/auth")) {
        // Use window.location.href for a clean navigation upon logout
        window.location.href = "/auth/login";
      }
    }
  },

  updateUserProfile: (user) => {
    set({ user });
  },
});

```


--- (4289-4376 lines) ---
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


</deer_flow_frontend_code>

<architecture>
--- (20-23 lines) ---
1.  **集中式状态管理**: 使用 Zustand 作为全局状态管理的单一事实来源 (SSOT)。
2.  **明确的数据同步范式**: 严格遵守 API 6.1 原则——**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新**。在连接恢复和关键事件后执行全量同步。
3.  **关注点分离**: 采用分层架构（UI 层、状态管理层、API 服务层），实现业务逻辑与 UI 的解耦。
4.  **性能优先**: 采用代码分割、Memoization、虚拟化（必要时）和高效的状态更新策略。


--- (39-41 lines) ---
  * **Zustand**: 全局状态管理。采用切片模式 (Slice Pattern) 组织复杂状态。
  * **React Query (TanStack Query) (推荐引入)**: 用于管理服务器状态缓存、API 请求生命周期和后台同步，与 Zustand 互补。



--- (170-181 lines) ---
/src/core
├── /api/               # API 服务层
│   ├── client.ts       # Axios 实例配置 (拦截器)
│   ├── auth.service.ts
│   ├── project.service.ts
│   └── workflow.service.ts
├── /websocket/         # WebSocket 管理
│   ├── manager.ts      # 连接管理 (重连、认证)
│   └── dispatcher.ts   # 事件分发到 Zustand
├── /store/             # Zustand 状态管理 (详见第 4 节)
└── /models/            # 数据模型 (TS Interfaces, Zod Schemas)
```


--- (185-311 lines) ---
## 4\. 状态管理架构 (State Management Architecture - Zustand)

采用 Zustand 进行全局状态管理，使用切片模式 (Slice Pattern) 分离关注点。

### 4.1 状态划分原则 (State Partitioning)

1.  **Auth State**: 认证信息和用户画像。
2.  **Settings State**: 用户偏好设置和 BYOK 配置（持久化）。
3.  **Project State**: 项目列表和元数据。
4.  **Workflow State (核心)**: 当前工作流的结构、节点状态、版本信息（服务器状态缓存）。
5.  **UI Interaction State**: 纯粹的 UI 状态（当前选中的节点、展开/折叠状态等）。

### 4.2 Store 结构与实现 (`src/core/store/`)

```typescript
// src/core/store/index.ts
import { create } from 'zustand';
// ... imports for Slices

interface GlobalState extends AuthSlice, SettingsSlice, ProjectSlice, WorkflowSlice, UIInteractionSlice {}

export const useStore = create<GlobalState>()((...a) => ({
  ...createAuthSlice(...a),
  // ... other slices
}));
```

### 4.3 核心切片详解 (Core Slices Details)

#### 4.3.1 AuthSlice (`authSlice.ts`)

  * **State**: `token`, `userProfile`, `isAuthenticated`, `isInitialized`.
  * **Actions**: `login`, `logout`, `initialize` (从存储加载 Token 并验证)。
  * **Persistence**: Token 存储管理。

#### 4.3.2 SettingsSlice (`settingsSlice.ts`)

  * **State**: `settings: UserSettingsRead`, `isLoading`.
  * **Actions**: `fetchSettings` (GET /users/me/settings), `updateSettings` (PATCH /users/me/settings)。
  * **BYOK Handling**: 负责处理 API Key 的提交（遵循“写后即忘”模型）。

#### 4.3.3 ProjectSlice (`projectSlice.ts`)

  * **State**: `projects: ProjectSummaryRead[]`, `currentProject: ProjectDetailRead | null`, `isLoading`.
  * **Actions**: `fetchProjects`, `loadProjectDetail`, `createProject`, `updateProject`, `deleteProject`, `uploadFile`, `startWorkflow`.

#### 4.3.4 WorkflowSlice (`workflowSlice.ts`) - 核心复杂性

管理当前活动工作流的完整状态。

```typescript
// src/core/store/slices/workflowSlice.ts
interface WorkflowSlice {
  // --- 1. 工作流数据 (Server State Cache) ---
  workflowInstance: WorkflowInstanceRead | null; // 包含完整的 phases 树

  // 扁平化索引 (Normalized Index) - 关键优化
  nodesById: Map<number, NodeInstanceRead>;

  // 节点详情缓存
  nodeDetailsCache: Map<number, NodeDetailView>;

  isLoading: boolean;
  isSyncing: boolean; // 正在进行全量同步

  // --- Actions ---
  actions: {
    // A. 同步与初始化
    loadWorkflow: (workflowId: number) => Promise<void>; // 全量加载/同步
    _normalizeData: (workflow: WorkflowInstanceRead) => void; // 更新 nodesById

    // B. WebSocket 事件处理
    handleNodeStatusUpdated: (node: NodeInstanceRead) => void;
    handleNodeActiveVersionChanged: (node: NodeInstanceRead) => void;
    handleWorkflowStructureUpdated: (workflow: WorkflowInstanceRead) => void;

    // C. 节点详情管理
    fetchNodeDetails: (nodeId: number) => Promise<NodeDetailView>;

    // D. 执行控制与 HITL (调用 API Service)
    reExecuteNode: (/*...*/) => Promise<void>;
    submitHITL: (/*...*/) => Promise<HITLResponse>;
    activateVersion: (/*...*/) => Promise<void>;
    manualEdit: (/*...*/) => Promise<void>;
  }
}
```

**WorkflowSlice 关键实现策略:**

1.  **扁平化索引 (`nodesById`)**: 为了高效处理 WebSocket 的增量更新（如 `NODE_STATUS_UPDATED`），必须维护一个扁平化的节点 Map。`_normalizeData` 负责在每次全量加载后重建此索引。
2.  **增量更新 (`handleNodeStatusUpdated`)**:
      * 更新 `nodesById` 中的对应节点。
      * 必须以不可变的方式更新 `workflowInstance.phases` 树中对应的节点，以触发 UI 更新。
3.  **结构性更新 (`handleWorkflowStructureUpdated`)**:
      * **全量替换**: 使用事件负载完全替换 `workflowInstance`。
      * 调用 `_normalizeData` 重建索引。
4.  **Staleness 同步 (`handleNodeActiveVersionChanged`)**:
      * **[关键]** 此 Action 必须触发 `loadWorkflow()`，重新获取全量数据以更新所有节点的 `is_stale` 标志（遵循 API 6.5.2）。

#### 4.3.5 UIInteractionSlice (`uiInteractionSlice.ts`)

管理工作流界面的 UI 状态，与业务数据分离。

```typescript
// src/core/store/slices/uiInteractionSlice.ts
interface UIInteractionSlice {
  activeNodeId: number | null;
  viewingVersionId: number | null; // null 表示查看最新/Pending
  
  // Navigator 状态
  collapsedPhases: Set<string>;

  // Workspace 状态
  isEditing: boolean;
  expandedBlocks: Set<string>; // e.g., 'artifacts', 'inputs'

  actions: {
    selectNode: (nodeId: number) => void;
    viewHistoricalVersion: (versionId: number) => void;
    startEditing: () => void;
    // ...
  }
}
```

-----


--- (331-332 lines) ---
将 API 调用封装在类型安全的服务中（`src/core/api/*.service.ts`），供 Zustand Store 调用。



--- (344-370 lines) ---
#### 5.2.2 事件分发

`WebSocketManager` 监听 `onmessage` 事件，解析 `EventPayload`，并调用 `WorkflowSlice` 中对应的事件处理器 Action。

### 5.3 核心同步范式 (Core Synchronization Paradigm)

严格执行 API 6.1 定义的范式：**REST 为主，WS 为辅**。

#### 5.3.1 初始化流程 (Initialization)

1.  UI 加载。
2.  **Fetch Snapshot (REST)**: `GET /workflows/{id}`。
3.  **Hydrate Store**: 使用快照初始化 Zustand。
4.  **Connect (WS)**: 建立 WebSocket 连接。

#### 5.3.2 重连后同步 (Reconnection Synchronization) - 关键

1.  WebSocket 重连成功 (`onOpen`)。
2.  **立即触发全量同步**: 调用 `WorkflowSlice.loadWorkflow()` (REST)。
3.  **状态覆盖**: 使用新的快照覆盖 Store 状态，确保一致性。

#### 5.3.3 处理复杂事件 (Handling Complex Events)

1.  **`NODE_STATUS_UPDATED` (增量更新)**: 直接更新 `WorkflowSlice.nodesById`。
2.  **`NODE_ACTIVE_VERSION_CHANGED` (Staleness 更新)**: 必须触发全量同步 (`loadWorkflow`) 以刷新全局 `is_stale` 标志。
3.  **`WORKFLOW_STRUCTURE_UPDATED` (结构更新)**: 必须使用事件负载进行全量替换 `WorkflowSlice.workflowInstance`。



--- (415-415 lines) ---
4.  **动态可见性 (Panel C)**: `isHistoryVisible` 的逻辑由 `WorkflowSlice` 和 `UIInteractionSlice` 共同决定（仅当选中节点状态为 `Completed` 时显示）。


--- (486-489 lines) ---
  * **Review**: 点击卡片，更新 `UIInteractionSlice.viewingVersionId`，Workspace (B) 加载历史版本详情。
  * **Activate**: 点击 [Set as Active Version]。
      * **[关键实现]** 弹出确认对话框，明确告知后果（非级联更新，Staleness）（设计文档 3.1.1.C.2）。
      * 调用 API，然后等待 WebSocket 事件触发全局同步（详见 5.3.4）。


--- (562-565 lines) ---
3.  **Zustand 优化**: 使用 `useShallow` 选择器避免不必要的重渲染。
4.  **虚拟滚动**: 在 `LogViewer` (Monaco) 中实现虚拟滚动，处理超长日志。
5.  **状态更新批处理**: 在处理高频 WebSocket 事件时，考虑使用批处理技术（如 `setTimeout` 或 React 18 的 `startTransition`）合并状态更新，减少渲染次数。


</architecture>



---

<task>


### 任务 4：Zustand 核心状态管理实现（ProjectSlice, WorkflowSlice, UIInteractionSlice）

**目标：** 构建 Zustand Store 的核心业务切片，实现数据加载、规范化和状态管理的基础逻辑，遵循架构设计原则。

**核心关注点：** Zustand 切片模式、数据规范化（Normalization）、状态结构设计、Action 定义。

**实现策略（参考 `<architecture> 4.3`）：**

1.  **Store 结构整合：** 在 `src/core/store/index.ts` 中整合所有切片。
2.  **ProjectSlice 实现（`src/core/store/slices/projectSlice.ts` 新建）：**
    *   定义 State：`projects`, `currentProject`, `isLoading`。
    *   实现核心 Actions：`fetchProjects`, `loadProjectDetail`, `createProject`, `updateProject`, `deleteProject`, `uploadFile`, `startWorkflow`。调用任务 3 实现的 `project.service.ts`。
3.  **WorkflowSlice 实现（`src/core/store/slices/workflowSlice.ts` 新建，核心复杂性）：**
    *   定义 State：`workflowInstance`（树形结构）, `isLoading`, `isSyncing`, `nodeDetailsCache`。
    *   **关键实现（范式化）：** 定义 `nodesById: Map<number, NodeInstanceRead>`。实现 `_normalizeData` 辅助函数，用于遍历 `workflowInstance.phases` 树并构建 `nodesById` 索引（`<architecture> 4.3.4`）。
    *   实现 `loadWorkflow` Action：调用 `workflow.service.ts` 获取全量数据，然后调用 `_normalizeData`。
    *   定义事件处理 Action 骨架（后续任务填充）：`handleNodeStatusUpdated`, `handleNodeActiveVersionChanged`, `handleWorkflowStructureUpdated`。
    *   实现 `fetchNodeDetails` Action：管理节点详情的获取和缓存。
4.  **UIInteractionSlice 实现（`src/core/store/slices/uiInteractionSlice.ts` 新建）：**
    *   定义 UI 状态（与业务数据分离）：`activeNodeId`, `viewingVersionId`, `isEditing`, `collapsedPhases`, `expandedBlocks`（`<architecture> 4.3.5`）。
    *   实现 Actions：`selectNode`, `viewHistoricalVersion`, `startEditing` 等。

**输入：** 任务 3 的输出（数据模型、API 服务层）, `<architecture> 4.3`。
**输出：** 配置好的 Zustand Store，包含所有核心业务切片和 UI 交互状态管理逻辑。


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
