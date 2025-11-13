<design_doc>
--- (274-286 lines) ---
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



--- (363-377 lines) ---
#### 2.2.3 核心界面：工作流执行界面 (Core Interface: Workflow Execution View)

这是平台的核心操作区域，采用**持久化的三栏式布局**，遵循“思维驾驶舱”的设计愿景。

**布局哲学:** 分离关注点——导航 (The Map)、交互 (The Action)、历史 (The Memory)。A 和 C 栏可折叠/展开，并支持用户拖拽调整宽度。

```
[Global Header]
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [A. Workflow Navigator]  |  [B. Node Interaction Workspace]  | [C. Version History] |
|         (Left Sidebar)    |           (Center Panel)          |    (Right Sidebar)   |
|                           |                                   |                      |
+---------------------------------------------------------------------------------+
```


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



--- (424-433 lines) ---
##### C. 右侧栏：版本历史面板 (Version History Panel - The Memory)

  * **目标:** 管理当前选中节点的历史版本，支持快速审阅、对比和回溯。
  * **可见性规则:** 仅当 Center Workspace 处于 `Completed` (Review Mode) 状态时显示。在 `Executing` 或 `Awaiting HITL Approval` 时自动隐藏。
  * **结构:** 垂直的“版本卡片列表 (Version Card List)”，按时间倒序排列。
  * **卡片信息:** 版本号 (V1, V2...), **[Active Tag]**, 时间戳, 来源图标 (🤖/✏️), 版本摘要。
  * **交互逻辑:**
      * **Review:** 点击卡片在 Center Workspace 加载该版本的详情。
      * **Activate:** 在非激活版本上提供 [Set as Active Version] 按钮。点击后触发全局 Staleness 刷新。



--- (640-643 lines) ---
3.  **工作流执行进度 (Workflow Execution Progress):**
      * **Navigator (A):** 使用动画 Spinner 图标 (⚙️)。
      * **Workspace Header (B1):** 显示详细的 `current_stage` 文本（如：“Executing: Processing Data...”）。



--- (653-663 lines) ---
##### 2\. 依赖过时状态 (Staleness)

实现“静默状态管理”（SRS 1.4）。

  * **检测与传播逻辑:**
    1.  **触发:** 前端监听到 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。
    2.  **同步:** 前端必须立即调用 `GET /workflows/{id}` 重新获取全量工作流状态，以更新所有节点的 `is_stale` 标志。
  * **视觉传达:**
      * **全局 (Navigator A):** 在 `is_stale: true` 的节点旁显示清晰的 ⚠️ 图标。Hover 显示 Tooltip 解释原因。
      * **局部 (Workspace B1):** 如果当前节点过时，显示醒目的、不可关闭的 `Staleness Banner`。



--- (702-725 lines) ---
#### C. 布局模板 2：三栏式工作流执行布局 (Template 2: The Cockpit Layout)

  * **应用场景：** 工作流执行界面 (`/projects/{id}/workflow`)。

  * **结构：** 高度灵活的三栏式布局。实现需使用 CSS Flexbox/Grid，并集成面板管理功能。

    ```
    [Global Header]
    +---------------------------------------------------------------------------------+
    | [A. Navigator] |<-R->|    [B. Node Interaction Workspace]    |<-R->| [C. History] |
    | (Left Sidebar) |     |           (Center Panel)             |     | (Right Sidebar)|
    +---------------------------------------------------------------------------------+
    (R = Resizable Separator)
    ```

  * **布局行为与规则：**

    1.  **全屏高度利用：** 布局占满 `Global Header` 以下的所有垂直空间。A、B、C 内部独立滚动。
    2.  **面板管理 (Panel Management):**
          * **实现技术:** 使用 `react-resizable-panels` 库。
          * **可调整大小 (Resizable):** 用户可拖拽 R1 和 R2 手柄调整宽度。设置应被记忆（`localStorage`）。
          * **可折叠 (Collapsible):** A 和 C 栏必须提供快速折叠/展开按钮。
    3.  **动态可见性:** C 栏（Version History）仅在 Workspace (B) 处于 `Completed` (Review Mode) 时显示。



--- (761-805 lines) ---
#### B. 节点交互工作区 (Node Interaction Workspace - Center Panel)

**通用结构:** 分为固定头部 (B1)、可滚动内容区 (B2) 和固定底部 (B3)。

```
[B. Node Interaction Workspace]
|
+-- [B1. Workspace Header] (Fixed Top)
|   |-- [Title]: [ID] | [Name]
|   |-- [Status Badge]: (e.g., Awaiting HITL)
|   |-- [Contextual Toolbar]: (Dynamic Buttons)
|   +-- [Staleness Banner] (Conditional Alert Banner if is_stale=true)
|
+-- [B2. Interaction Transcript] (Scrollable Content)
|   |
|   +-- [Block 1: Inputs & Dependencies] (Collapsible, Default Collapsed)
|   +-- [Block 2: Execution Artifacts] (Collapsible, Default Collapsed)
|   |   |-- [Tabs: Prompt | Code | Logs]
|   |   |-- [Code/Log Viewer]
|   +-- [Block 3: Generated Output] (Main Content, Default Expanded)
|   |   |-- [Markdown/LaTeX Renderer OR Editor]
|   +-- [Block 4: HITL Interaction Zone] (Dynamic Content, Default Expanded)
|
+-- [B3. Action Footer] (Fixed Bottom, Conditional Visibility)
    |-- [Secondary Actions] (e.g., Discard)
    |-- [Primary Actions] (e.g., Reject, Approve)
```

**状态变化详解:**

  * **`Awaiting HITL Approval`:**
      * B1 Toolbar: 隐藏。
      * B2 Block 4: 激活 HITL 交互界面（如 SCA 选择器）。
      * B3 Footer: 显示。
  * **`Completed` (Review Mode):**
      * B1 Toolbar: 显示 [Re-execute], [Manual Edit]。
      * B2 Block 4: 显示只读的 HITL 历史记录。
      * B3 Footer: 隐藏。
      * **Right Sidebar (C): 显示。**
  * **`Executing`:**
      * B1 Toolbar: 显示 [Cancel Execution]。
      * B2 Block 2: 展开并激活实时日志查看器。
      * B2 Block 3 & 4: 加载状态或为空。
      * B3 Footer: 隐藏。



--- (1515-1557 lines) ---
#### 5.1.3 B. 节点交互工作区 (Node Interaction Workspace - Center Panel)

采用“交互记录 (Interaction Transcript)”模型。

**B1. 工作区头部 (Workspace Header - Fixed Top):**

  * 高度 `h-12` (48px)。`border-b`。
  * **Title:** `text-lg font-semibold`。
  * **Status Badge:** 使用 `Shadcn/ui Badge`，动态应用状态色彩。
  * **Contextual Toolbar:** 动态按钮组（`size="sm"`）。

**B1.1 过时状态横幅 (Staleness Banner - Conditional):**

  * 如果 `is_stale: true`，在 Header 下方显示。
  * 使用 `Shadcn/ui Alert` (定制 Amber variant)。文案遵循 3.3.D.2。

**B2. 交互记录内容区 (Interaction Transcript - Scrollable):**

  * **布局:** `space-y-6 p-6`。

  * **区块实现:** 使用 `Shadcn/ui Card` 作为容器，并结合 `Collapsible` 实现展开/折叠。

  * **Block 2: Execution Artifacts:**

      * 使用 `Shadcn/ui Tabs` 组织：[Prompt], [Code], [Logs]。
      * **内容查看器:** 必须使用 `Monaco Editor` 只读模式。
          * 主题：匹配 Dark Mode。
          * 字体：`font-mono` (Geist Mono), `text-sm`。
          * 背景：`bg-background` (比 Card 背景更深)。
          * 功能：提供 [Copy] / [Download] 按钮。Logs 模式必须支持自动滚动。

  * **Block 3: Generated Output:**

      * **View Mode:** 使用 `react-markdown`。应用 `prose dark:prose-invert` 类（遵循 4.1.2.D 定制样式）。
      * **Edit Mode:** 切换为 `Novel/Tiptap`（富文本）或 `Monaco Editor`（代码）。

**B3. 操作底部栏 (Action Footer - Fixed Bottom):**

  * 仅在 `Awaiting HITL Approval` 时显示。
  * 高度 `h-16` (64px)。`border-t`。背景 `bg-card`。
  * 布局：`flex justify-end space-x-4`。
  * 按钮配置：[Discard] (`ghost`), [Reject] (`secondary`), [Approve] (`primary`)。



--- (1577-1604 lines) ---
#### 5.1.5 状态变化高保真描述 (High-Fidelity State Variations)

##### State: `Executing`

  * **Navigator (A):** 图标为 `Loader2` (Cyan, `animate-spin`)。
  * **Workspace (B):**
      * B1: Toolbar 显示 [Cancel Execution]。
      * B2: Block 2 (Artifacts) 自动展开，焦点在 `Logs` Tab，实时显示日志流。
      * **视觉增强:** 在 Workspace (B) 容器边缘激活 `Magic UI BorderBeam` 动画（Cyan 色调），表示计算活动。
  * **History (C):** 隐藏。

##### State: `Awaiting HITL Approval` (SCA 模式为例)

  * **Navigator (A):** 图标为 `Hourglass` (Amber)。
  * **Workspace (B):**
      * B2 Block 4 (HITL Zone): 激活 SCA 界面（`Tabs` for Analysis/Candidates, `RadioGroup`+`Card` for selection）。
      * B3 Footer: 显示。
  * **History (C):** 隐藏。

##### State: `Completed` (Review Mode, Stale)

  * **Navigator (A):** 图标为 `CheckCircle` (Green)，并在右侧显示 ⚠️ `AlertTriangle` (Amber)。
  * **Workspace (B):**
      * B1: Toolbar 显示 [Re-execute], [Manual Edit]。
      * B1.1: 显示 `Staleness Banner` (Amber Alert)。
      * B2: 显示只读 Transcript。
  * **History (C):** 显示。



--- (1788-1794 lines) ---
  * **工作流执行界面 (Cockpit Layout):**
      * 整体布局与面板管理：详见 5.1.1。
      * A. Workflow Navigator：详见 5.1.2。
      * B. Node Interaction Workspace (Transcript Model)：详见 5.1.3。
      * C. Version History Panel：详见 5.1.4。
      * Workspace 状态变化详解 (`Executing`, `Awaiting HITL`, `Completed`, `Stale`, `Editing`): 详见 5.1.5（阶段 5.1 的另一份候选文档中）。


</design_doc>

<api>
--- (846-867 lines) ---
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

***


--- (1079-1079 lines) ---
> *   **[新增]** 在渲染节点时，检查 `node.is_stale` 标志。如果为 `true`，应在节点上显示一个明确的视觉指示器（如警告图标或虚线边框）。


--- (1181-1192 lines) ---
#### 4.4. StalenessInfo

描述一个节点的上游依赖为何"过时"的详细信息。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `upstream_node_id` | integer | 已更新的上游依赖节点的 ID。 |
| `upstream_definition_id` | string | 上游节点的定义 ID (例如, "1.1.1")。 |
| `consumed_version_id` | integer | 当前节点上次执行时所消费的上游版本 ID。 |
| `current_active_version_id`| integer \| null | 上游节点当前最新的活动版本 ID。 |

***


--- (1202-1210 lines) ---
### 核心概念

为更好地理解本模块 API，请先熟悉以下核心概念：

*   **节点生命周期 (Node Lifecycle)**: 一个节点通常会经历 `Not Started` -> `Executing` -> `Awaiting HITL Approval` -> `Completed` 的状态流。**[新增]** `Executing` 状态可以被中断，进入 `Canceled` 状态。`retry` 或 `re-execute` 等操作会使其重新进入 `Executing` 状态。`Failed` 是一个可能的终态，但可以通过 `retry` 恢复。
*   **版本 (Version)**: 每次节点成功执行并被用户批准后，其结果（输入、输出、交互历史）都会被固化为一个“版本”。`active_version` 代表该节点当前对外提供的“官方”结果。
*   **执行前沿 (Execution Frontier)**: 指工作流中已执行或正在执行的最后一个节点的序号。为保证流程的顺序性，用户不能“跳级”操作前沿之外的节点。
*   **过时状态 (Staleness)**: 当一个节点的上游依赖节点更新了其 `active_version` 后，该节点就处于“过时”状态。这是 **UI 提示** 的关键数据，应在界面上明确标记该节点，并建议用户“重新执行以同步最新上游数据”。



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



--- (1344-1373 lines) ---
#### 2.1. 重新执行已完成的节点 (探索性)

用于基于一个已有的版本，提供新的反馈，来重新执行一个已经 `COMPLETED` 的节点，旨在创造一个新的版本分支。

*   **Endpoint**: `POST /nodes/{node_id}/re-execute`
*   **权限**: 节点所有者。

##### 请求体 (`ExecutionRequest`)
```json
{
  "modification_comments": "Try to focus more on the simulation aspect.",
  "base_version_id": 2
}
```
*   `modification_comments` (string, *optional*): 提供给 LLM 的新的指令或反馈。
*   `base_version_id` (integer, *optional*): 指定基于哪个版本进行重新执行。如果省略，则默认使用当前 `active_version_id`。

##### 成功响应 (`202 Accepted`)
表示请求已被接受并进入后台处理队列。前端应立即更新 UI 为“执行中”状态，并禁用相关操作按钮。
```json
{
  "message": "Node re-execution has been accepted for processing.",
  "node_id": 101
}
```

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): 节点状态不是 `COMPLETED`，或正在执行中。
*   `403 Forbidden`: 尝试重新执行一个已完成的 `Generator` 节点。



--- (1374-1399 lines) ---
#### 2.2. 重试失败的节点 (纠错性)

用于重新执行一个处于 `FAILED` 或 `CANCELED` 状态的节点，旨在完成当前失败或被取消的执行。

*   **Endpoint**: `POST /nodes/{node_id}/retry`
*   **权限**: 节点所有者。

##### 请求体 (`ExecutionRequest`)
```json
{
  "modification_comments": "I've updated the input file, please try again."
}
```
*   `modification_comments` (string, *optional*): 可选的反馈，用于指导重试。

##### 成功响应 (`202 Accepted`)
```json
{
  "message": "Node retry has been accepted for processing.",
  "node_id": 101
}
```

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): **[更新]** 节点状态不是 `FAILED` 或 `CANCELED`，或正在执行中。



--- (1400-1418 lines) ---
#### 2.3. 取消节点执行 (Cancellation)

*   **Endpoint**: `POST /nodes/{node_id}/cancel`
*   **权限**: 节点所有者。
*   **描述**:
    *   向正在执行的节点 (`Executing` 状态) 发送一个取消请求。
    *   这是一个**异步操作**。API会立即返回，表示取消信号已发送。后台工作进程在接收到信号后会中断执行，并将节点状态更新为 `Canceled`。
    *   后续的状态变更将通过 `NODE_STATUS_UPDATED` WebSocket 事件推送。

##### 成功响应 (`202 Accepted`)
```json
{
  "message": "Cancellation request sent. The node will transition to 'Canceled' shortly."
}
```

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): 节点当前不处于 `Executing` 状态，无法取消。



--- (1472-1500 lines) ---
#### 4.1. 提交手动编辑 (R4)

允许用户绕过 AI 执行，直接注入人工结果。这是一个高权限操作，会立即完成节点并创建新版本。

*   **Endpoint**: `POST /nodes/{node_id}/manual-edit`
*   **权限**: 节点所有者。
*   **重要影响**: 此操作会立即将节点设为 `Completed`，并用您提供的数据创建一个新版本。这会立即触发对所有下游节点的“过时”状态检查。

##### 请求体 (`ManualEditSubmission`)
```json
{
  "base_version_id": 2,
  "edited_output_data": {
    "Formal Problem Restatement": "This is my manually edited problem restatement."
  },
  "summary": "Manually corrected the problem statement for clarity."
}
```
*   `base_version_id` (integer, **required**): 必须指定一个基础版本。
*   `edited_output_data` (object, **required**): 用户编辑后的完整输出 JSON。
*   `summary` (string, *optional*): 对本次编辑的简短描述。

##### 成功响应 (`200 OK`)
返回更新后的节点实例信息 (`NodeInstanceRead`)。

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): 指定的 `base_version_id` 无效。
*   `403 Forbidden`: 试图编辑一个已完成的 `Generator` 节点。



--- (1540-1550 lines) ---
#### 5.1. NodeDetailView

`GET /nodes/{node_id}` 返回的节点详细视图对象，继承自 `NodeInstanceRead`。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| *(所有 NodeInstanceRead 字段)* | | 参见项目管理文档中的 `NodeInstanceRead` 定义。 |
| `active_version` | object (NodeVersionRead) \| null | 如果节点已完成，此字段包含其当前活动版本的完整数据。 |
| `pending_result` | object (TemporaryExecutionRead) \| null | 如果节点正在执行或等待审批，此字段包含其临时的、未固化的结果。 |
| `staleness_report` | array (StalenessInfo) \| null | 如果节点的上游依赖已更新，此列表将包含详细的过时信息。 |



--- (1571-1581 lines) ---
#### 5.3. TemporaryExecutionRead

表示节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时结果。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `output_data` | object \| null | AI 或执行引擎生成的当前临时输出。 |
| **`execution_artifacts`** | **object \| null** | **[新增]** 在当前执行周期内产生的关键产物。结构与 `NodeVersionRead` 中的 `execution_artifacts` 类似。 |
| `accumulated_hitl_interactions` | array (object) | 在当前执行周期内累积的人机交互记录。 |
| `error_log` | string \| null | 如果执行失败，这里会包含详细的错误信息和堆栈跟踪。 |


</api>

<front_stack>
--- (5-17 lines) ---
### 一、 核心框架与构建

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **React** | 项目的核心 UI 库，所有组件都基于 React 构建。 |
| **Next.js** | 应用框架，提供了服务器端渲染 (SSR)、静态站点生成 (SSG)、基于 `app` 目录的文件系统路由、API 路由以及其他现代化 Web 开发功能。 |
| | ↳ **App Router** | 项目采用最新的 App Router 架构，支持 React Server Components (RSC) 和客户端组件。 |
| | ↳ **React Server Components (RSC)** | 在服务端直接执行组件逻辑，如 `app/chat/components/site-header.tsx` 中的 `StarCounter` 组件，它在服务端 `fetch` 数据并渲染，提升了性能和安全性。 |
| | ↳ **`next/dynamic`** | 用于动态导入（懒加载）组件，如 `app/chat/page.tsx` 中对 `Main` 组件的使用，配合 `React.Suspense` 优化了初始页面加载速度。 |
| | ↳ **`next/script`** | 用于控制第三方脚本的加载策略，如在 `app/layout.tsx` 中通过 `strategy="beforeInteractive"` 注入修复 `markdown-it` 问题的脚本。 |
| | ↳ **`next/headers`** | 用于在服务器端组件中访问请求头，如 `src/i18n.ts` 中使用 `cookies()` 函数读取 Cookie 以实现服务端国际化。 |
| **Turbopack** | 在 `app/layout.tsx` 的注释中被提及，表明项目可能使用 Turbopack 作为其高性能的开发服务器和构建工具，以加速开发流程。 |



--- (18-25 lines) ---
### 二、 状态管理

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |



--- (26-31 lines) ---
### 三、 客户端-服务器通信

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **自定义 SSE 客户端** | 项目在 `core/sse/fetch-stream.ts` 中实现了一个健壮的 `fetchStream` 函数。它使用 `fetch` API 和 `TextDecoderStream` 来处理流式响应，并能正确解析 Server-Sent Events (SSE) 协议，是实现聊天流式响应的核心底层工具。 |



--- (32-44 lines) ---
### 四、 样式与主题

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Tailwind CSS** | 原子化的 CSS 框架，用于构建整个项目的用户界面样式。 |
| **`@tailwindcss/typography`** | Tailwind CSS 的官方插件 (`prose` 类)，用于美化由 Markdown 或富文本编辑器生成的文本块样式。 |
| **`tailwindcss-animate`** | 为 Tailwind CSS 提供了便捷的动画类库。 |
| **next-themes** | 用于实现浅色/深色模式的主题切换功能。 |
| **class-variance-authority (cva)** | 用于创建可组合的、带变体的 UI 组件样式，广泛应用于 `components/ui` 目录。 |
| **tailwind-merge** | 用于智能合并 Tailwind CSS 类名，优雅地解决样式冲突问题。 |
| **clsx** | 一个小巧的工具库，用于根据条件动态地组合 CSS 类名。 |
| **Next.js Font (`next/font`)** | 用于本地化和优化 Web 字体，项目中使用了 `Geist` 字体。 |



--- (45-62 lines) ---
### 五、 UI 组件库与视觉效果

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |
| **Sonner** | 用于显示轻量级的 Toast 通知（消息提示）。 |
| **Magic UI (自定义组件集)** | 项目中 `components/magicui` 目录下的一系列高度定制化的视觉特效组件。 |
| | ↳ `AuroraText` | 极光渐变色文本效果。 |
| | ↳ `BentoGrid` | Bento 风格的网格布局组件。 |
| | ↳ `BorderBeam` | 环绕容器边缘的动态光束动画。 |
| | ↳ `FlickeringGrid` | 随机闪烁的背景网格效果。 |
| | ↳ `NumberTicker` | 数字滚动动画效果。 |
| | ↳ `ShineBorder` | 环绕容器边缘的闪亮边框动画。 |
| **cmdk** | 用于构建命令面板（Command Palette）的组件，在富文本编辑器中用于实现斜杠命令。 |
| **Tippy.js** | 用于在富文本编辑器中创建 `@mention` 功能的浮动提示框 (Tooltip/Popover)。 |



--- (103-109 lines) ---
### 十、 图标库

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Lucide React** | 一套简洁、一致的开源图标库，是项目图标的主要来源。 |
| **Ant Design Icons** | 来自 Ant Design 的图标库，补充了部分特定图标。 |
| **Radix UI Icons** | 来自 Radix UI 的图标库，补充了部分特定图标。 |


--- (110-123 lines) ---

### 十一、 自定义 Hooks 与工具

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **`use-debounce`** | 提供了 `useDebouncedCallback` Hook，用于对输入事件（如编辑器内容变化）进行防抖处理，提升性能。 |
| **`use-stick-to-bottom`** | 用于在聊天消息流等场景中，当内容更新时自动将滚动条保持在底部。 |
| **`useIntersectionObserver`** | 自定义 Hook，用于检测元素是否进入视口，如在落地页用于触发多智能体动画的自动播放。 |
| **`useIsMobile`** | 自定义 Hook，用于检测当前设备是否为移动端，以实现响应式布局。 |
| **@t3-oss/env-nextjs** | 用于在 `src/env.js` 中校验和强制类型化 Next.js 项目的环境变量，确保应用的健壮性。 |
| **nanoid** | 用于生成小巧、安全的唯一字符串 ID，例如为聊天线程和消息分配 ID。 |
| **best-effort-json-parser** | 一个容错能力较强的 JSON 解析器，用于处理可能不完全规范的流式 JSON 数据。 |
| **lru-cache** | 实现 LRU (Least Recently Used) 缓存策略，用于缓存网页标题等数据，减少重复请求。 |



--- (136-150 lines) ---
#### 1. UI 组件模式与实践

项目在 Shadcn/ui 的基础上构建了丰富且高度可复用的应用层组件，集中体现于 `app/chat/components/` 目录。

| 组件/模式 | 描述与复用价值 |
| :--- | :--- |
| **`InputBox`** | 一个功能完备的聊天输入框组件。它封装了：<br>- **富文本输入**: 基于 Tiptap/Novel，支持 `@mention` 等功能。<br>- **异步操作**: 内置“增强提示” (`Enhance Prompt`) 功能，包含加载和动画状态。<br>- **状态同步**: 通过 `useRef` 和 `useImperativeHandle` 暴露 `submit`, `setContent` 等方法，供父组件调用。<br>- **动态 UI**: 使用 `AnimatePresence` 展示用户反馈提示，并带有精美的动画效果。 |
| **`MessageListView` & `MessageListItem`** | 实现了经典的聊天消息列表渲染模式。<br>- **关注点分离**: `MessageListView` 负责列表滚动和布局，`MessageListItem` 则根据消息类型 (`user`, `planner`, `researcher` 等) 委托给不同的子组件 (`MessageBubble`, `PlanCard`, `ResearchCard`) 渲染，代码结构清晰。<br>- **进入动画**: 使用 `framer-motion` 的 `motion.li` 为每条新消息添加入场动画，提升用户体验。 |
| **`ThoughtBlock`** (内嵌于 `MessageListView`) | 一个可折叠的“深度思考”区块。其设计亮点在于：<br>- **流式内容处理**: 能够区分并分别渲染**已完成的静态内容**和**正在流式传输的新内容**，为流式文本提供了更丰富的视觉表现力。<br>- **自动行为**: 当主要内容出现后，会自动折叠，减少信息干扰。 |
| **`ResearchActivitiesBlock`** | 研究活动流的展示组件。它展示了如何渲染一个包含多种异构项（如网页搜索、代码执行、文件读取）的动态列表。每种活动类型都由一个专门的子组件处理（`WebSearchToolCall`, `PythonToolCall` 等），是处理复杂动态内容的绝佳范例。同时，它还包含了**性能优化**实践，如仅对前 N 个列表项应用动画。 |
| **`ResearchBlock`** | 一个集成了标签页 (`Tabs`) 的复合视图组件。它允许用户在“研究报告”和“活动流”之间切换，同时在组件顶部提供了上下文相关的操作按钮（如编辑、复制、下载），是构建复杂信息面板的优秀参考。 |
| **`ConversationStarter`** | 在聊天窗口为空时展示的欢迎界面和问题建议。它通过绝对定位和 `z-index` 叠加在 `InputBox` 上方，展示了如何构建非侵入式的引导用户界面。 |
| **`Link` (自定义)** | 位于 `components/deer-flow/link.tsx`，这是一个增强版的 `<a>` 标签。它会查询 Zustand store 中的工具调用历史，判断一个链接是否在之前的搜索结果中出现过。如果未出现，则会显示一个“链接不可靠”的警告图标。这是一个**将 UI 组件与业务状态深度结合**的创新实践。 |
| **`ScrollContainer`** | 对 Shadcn `ScrollArea` 的封装，集成了 `use-stick-to-bottom` Hook，并添加了上下边缘的渐变阴影效果，简化了创建需自动触底的滚动区域的开发工作。 |



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



--- (187-197 lines) ---
### 十四、 高级动画与视觉效果模式

项目巧妙地结合了多种动画技术，以创造流畅且引人入胜的用户体验。这些模式具有高度的可移植性。

| 模式/技术 | 描述与复用价值 |
| :--- | :--- |
| **`Framer Motion` 列表与状态动画** | **列表交错动画**: 在 `conversation-starter.tsx` 和 `message-list-view.tsx` 中，通过在 `motion.li` 的 `transition` prop 中设置 `delay: index * 0.1`，实现了新项目依次入场的精美效果。这是一个可直接应用于任何动态列表的模式。<br>**条件渲染动画**: `input-box.tsx` 使用 `<AnimatePresence>` 组件来包裹根据条件渲染的元素（如用户反馈提示）。这使得元素的出现和消失都带有平滑的动画效果，而不是生硬地切换。 |
| **`Magic UI` 特效组件的集成** | 项目将 `Magic UI` 组件作为独立的、可配置的视觉增强层。例如，`input-box.tsx` 在 "Enhance Prompt" 功能激活时，会动态渲染 `<BorderBeam>` 组件，为组件添加一个临时的、代表"处理中"状态的视觉光环。这展示了如何将视觉特效与组件的内部状态变化相结合。 |
| **纯 CSS 动画与组件** | 项目在 `styles/globals.css` 中定义了复杂的 `@keyframes` 动画，如 `aurora` 和 `spotlight`。这些动画通过独立的组件（如 `aurora-text.tsx`, `ray.tsx`）应用，将动画逻辑与组件结构分离。这种方法性能优异，适用于背景、光效等装饰性动画。 |
| **CSS Modules** | 对于需要特定、隔离样式的组件，如 `loading-animation.tsx`，项目采用了 CSS Modules (`.module.css`)。这确保了动画类名（如 `.bouncing-animation`）的局部作用域，避免了与全局 Tailwind 样式或其它组件样式的冲突。 |



--- (198-208 lines) ---
### 十五、 架构模式与项目组织

项目的目录结构和代码组织方式遵循了现代大型前端应用的**最佳实践**，非常值得借鉴。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **功能切片 (Feature-Sliced) 路由** | `app/` 目录下的结构（如 `app/chat/`, `app/landing/`, `app/settings/`）体现了按功能组织代码的原则。每个功能模块都是一个独立的单元，包含了自身的页面、组件和逻辑，使得项目结构清晰，易于扩展和维护。 |
| **组件分层** | 项目中的 `components/` 目录被清晰地划分为三层：<br>1. **`ui/`**: 基础 UI 组件，源自 Shadcn/ui，是应用的视觉基石。<br>2. **`deer-flow/`**: 应用级的共享组件，如 `Logo`, `Markdown`, `Tooltip` 等。它们封装了通用逻辑，在多个功能模块中复用。<br>3. **`magicui/`**: 高度定制化的视觉特效组件，与业务逻辑解耦，可轻松移植到任何项目中。 |
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |
| **自定义 Hooks 封装** | `hooks/` 目录提供了可复用的 React Hooks，如 `useIntersectionObserver` 和 `useIsMobile`。它们将复杂的浏览器 API 或重复的逻辑封装成简单易用的钩子，简化了组件代码。 |



--- (209-218 lines) ---
### 十六、 样式与主题架构

项目建立了一套强大且灵活的样式与主题系统。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **基于 CSS 变量的主题系统** | `styles/globals.css` 中，通过在 `:root` 和 `.dark` 选择器下定义大量的 CSS 自定义属性 (custom properties)，构建了整个应用的主题系统。所有颜色、半径等设计令牌 (design tokens) 都被变量化，使得主题切换（通过 `next-themes`）仅需切换一个顶层 class，浏览器即可高效地重绘。 |
| **Tailwind `@theme` 指令** | 通过 `@theme` 指令，项目将 CSS 变量（如 `--app-background`）与 Tailwind 的配置相结合，创建了语义化的工具类（如 `bg-app`）。这使得在组件中可以直观地使用主题颜色，而无需关心具体的色值。 |
| **`cn` 工具函数** | `lib/utils.ts` 中的 `cn` 函数是整个项目的标准实践。它结合了 `clsx` 和 `tailwind-merge`，解决了在 React 组件中动态、条件性地组合 Tailwind 类名时的所有痛点（如条件判断、样式覆盖冲突），是现代 Tailwind 项目的必备工具。 |



--- (229-239 lines) ---
### 十viii、 鲁棒性与回退策略

项目在代码中体现了防御性编程的思想，确保在各种异常情况下应用依然能稳定运行。

| 策略/模式 | 描述与复用价值 |
| :--- | :--- |
| **API 请求重试与超时** | `core/api/hooks.ts` 中的 `useConfig` Hook 在 `fetch` 配置时，不仅设置了超时 (`AbortSignal.timeout`)，还实现了带有指数退避 (exponential backoff) 的重试逻辑。这显著提高了应用在网络不佳情况下的稳定性。 |
| **组件级错误回退** | `components/deer-flow/fav-icon.tsx` 组件的 `img` 标签上使用了 `onError` 事件处理器。当网站图标加载失败时，它会自动切换到一个通用的备用图标，避免了在 UI 上显示破碎的图片。 |
| **环境驱动的逻辑切换** | `env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY` 环境变量在多个地方被用作开关，以改变应用的行为。例如，`chatStream` 会根据此变量决定是调用真实的 API 还是模拟的 `chatReplayStream`。这使得同一套代码库可以轻松地部署为功能完整的动态应用或纯静态的演示网站。 |
| **容错数据解析** | `core/utils/json.ts` 中的 `parseJSON` 函数在解析失败时不会直接抛出错误，而是会返回一个预设的 `fallback` 值。这使得即使 LLM 返回的 JSON 格式稍有瑕疵，UI 也不会因此崩溃。 |



--- (240-251 lines) ---
### 十九、 性能优化实践

项目在多个层面都考虑了性能，确保了应用的响应速度和流畅性。

| 实践/技术 | 描述与复用价值 |
| :--- | :--- |
| **代码分割 (Code Splitting)** | 使用 `next/dynamic` 对大型或非首屏必要的组件进行懒加载。在 `app/chat/page.tsx` 中，核心的 `Main` 组件就是动态导入的，并提供了一个 `loading` 状态。这显著减小了初始页面的 JavaScript 包体积，加快了页面的可交互时间。 |
| **组件级 Memoization** | **`React.memo`**: 对于 props 不经常变化的纯展示组件，项目使用了 `React.memo` 进行包裹。例如，在 `app/chat/components/research-activities-block.tsx` 中，`ActivityMessage` 和 `ActivityListItem` 都被 `React.memo` 优化，防止在父组件重渲染时不必要地重新渲染整个活动列表。 <br>**`useMemo` / `useCallback`**: 在整个代码库中广泛使用 `useMemo` 来缓存计算结果（如 `app/chat/main.tsx` 中的 `doubleColumnMode`），以及使用 `useCallback` 来缓存事件处理器（如 `app/chat/components/input-box.tsx` 中的 `handleSendMessage`），避免了子组件因函数引用变化而导致的无效渲染。 |
| **有限动画策略** | 在渲染长列表时，并非所有项都需要动画。`app/chat/components/research-activities-block.tsx` 中实现了一个聪明的策略：定义一个 `MAX_ANIMATED_ITEMS` 常量，只对前 N 个新加载的列表项应用 `framer-motion` 动画，而后续项则直接渲染。这在保证视觉效果的同时，极大地降低了大量 DOM 元素同时动画带来的性能开销。 |
| **状态更新批处理** | `core/store/store.ts` 中的 `sendMessage` 函数在处理 SSE 流时，并没有在每次收到 `chunk` 时都立即调用 `setState`，而是将待更新的消息放入一个 `pendingUpdates` Map 中，并通过 `setTimeout` 进行批处理。这种“去抖”或“批处理”的模式，将一秒内可能发生的数十次状态更新合并为少数几次，极大地减少了 React 的渲染次数，是流式应用性能优化的关键。 |
| **虚拟滚动** (潜在) | 虽然当前代码中没有明确实现虚拟滚动，但项目的组件化结构（如 `MessageListView`）非常适合集成 `react-window` 或 `tanstack-virtual` 等库。对于需要处理成千上万条消息的场景，这是下一步性能优化的明确方向。 |



--- (269-271 lines) ---
| **安全性** | **防范 XSS 攻击**: 渲染用户生成或来自 API 的内容时，项目始终使用 `react-markdown` (`Markdown` 组件) 或通过 Tiptap 的安全机制进行渲染，而不是直接使用 `dangerouslySetInnerHTML`。<br>**安全处理用户输入**: `components/editor/index.tsx` 中的富文本编辑器在处理粘贴内容时，通过 `handleImagePaste` 和 `transformPastedHTML` 等逻辑对输入进行过滤和转换，防止粘贴恶意的 HTML 代码。<br>**安全的外部链接**: 在所有 `target="_blank"` 的链接中，都添加了 `rel="noopener noreferrer"`，防止了潜在的 "tabnabbing" 漏洞。 |
| **可访问性 (a11y)** | **语义化 HTML**: 项目结构良好，使用了恰当的 HTML5 标签（`header`, `main`, `footer`, `section` 等）。<br>**Radix UI 基础**: 由于 UI 组件库基于 Radix UI，所有组件（如 `Dialog`, `DropdownMenu`, `Tooltip`）都内置了完善的键盘导航支持、焦点管理和 ARIA 属性，提供了坚实的可访问性基础。例如，弹窗打开时焦点会自动移入，关闭后会返回原处。 |


</front_stack>

<deer_flow_frontend_code>
--- (1173-1283 lines) ---
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


--- (1444-1558 lines) ---
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



--- (1774-2017 lines) ---
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


--- (2846-2902 lines) ---
### core/store/index.ts Content:

```ts
import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

import { createAuthSlice, type AuthSlice } from "./slices/auth.slice";
import {
  createConnectionStatusSlice,
  type ConnectionStatusSlice,
} from "./slices/connection-status.slice";
import {
  createProjectSlice,
  type ProjectSlice,
} from "./slices/project.slice";
import { createSettingsSlice, type SettingsSlice } from "./slices/settings.slice";
import {
  createUIInteractionSlice,
  type UIInteractionSlice,
} from "./slices/ui-interaction.slice";
import {
  createWorkflowSlice,
  type WorkflowSlice,
} from "./slices/workflow.slice";

// Define the combined state interface (Architecture 4.1)
export type GlobalState = AuthSlice &
  SettingsSlice &
  ProjectSlice &
  WorkflowSlice &
  UIInteractionSlice &
  ConnectionStatusSlice;

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
      ...createProjectSlice(set, get, api),
      ...createWorkflowSlice(set, get, api),
      ...createUIInteractionSlice(set, get, api),
      ...createConnectionStatusSlice(set, get, api),
    }),
    { name: "O-Award-Store" }, // Name for Redux DevTools
  ),
);



--- (2995-3438 lines) ---
### core/store/slices/workflow.slice.ts Content:

```ts
import { produce } from "immer";
import { toast } from "sonner";

import { NodeService } from "~/core/api/node.service";
import { WorkflowService } from "~/core/api/workflow.service";
import type {
  ExecutionRequest,
  HITLResponse,
  HITLSubmission,
  ManualEditSubmission,
  NodeDetailView,
} from "~/core/models/node.model";
import type {
  NodeInstanceRead,
  WorkflowInstanceRead,
} from "~/core/models/workflow.model";
import { type SliceCreator } from "~/core/store";

export interface WorkflowSlice {
  // --- State ---
  workflowInstance: WorkflowInstanceRead | null;
  // Normalized index for fast lookups (Architecture 4.3.4)
  nodesById: Map<number, NodeInstanceRead>;
  // Cache for node details
  nodeDetailsCache: Map<number, NodeDetailView>;

  isLoading: boolean; // Initial load
  isSyncing: boolean; // Background refresh/sync (e.g., after WS event or staleness update)
  isExecutingAction: boolean; // Covers re-execute, HITL submit, versioning actions

  // --- Actions ---

  // A. Synchronization & Initialization
  loadWorkflow: (workflowId: number) => Promise<WorkflowInstanceRead | null>;
  _normalizeAndSetData: (workflow: WorkflowInstanceRead) => void;
  clearWorkflowData: () => void;

  // B. WebSocket Event Handlers (Defined here, called by WebSocket manager)
  handleNodeStatusUpdated: (node: NodeInstanceRead) => void;
  handleNodeActiveVersionChanged: (
    node: NodeInstanceRead,
  ) => Promise<void>;
  handleWorkflowStructureUpdated: (workflow: WorkflowInstanceRead) => void;
  handleWorkflowStatusUpdated: (workflow: WorkflowInstanceRead) => void;

  // C. Node Detail Management
  fetchNodeDetails: (
    nodeId: number,
    force?: boolean,
  ) => Promise<NodeDetailView | null>;

  // D. Execution Control & HITL
  reExecuteNode: (
    nodeId: number,
    data?: ExecutionRequest,
  ) => Promise<boolean>;
  retryNode: (nodeId: number, data?: ExecutionRequest) => Promise<boolean>;
  cancelNode: (nodeId: number) => Promise<boolean>;
  submitHITL: (
    nodeId: number,
    data: HITLSubmission,
  ) => Promise<HITLResponse | null>;
  activateVersion: (nodeId: number, versionId: number) => Promise<boolean>;
  manualEdit: (
    nodeId: number,
    data: ManualEditSubmission,
  ) => Promise<boolean>;
}

export const createWorkflowSlice: SliceCreator<WorkflowSlice> = (set, get) => ({
  workflowInstance: null,
  nodesById: new Map(),
  nodeDetailsCache: new Map(),
  isLoading: false,
  isSyncing: false,
  isExecutingAction: false,

  // A. Synchronization & Initialization

  /**
   * Loads or synchronizes the workflow state. Handles both initial load and background syncs.
   * (Architecture 5.3.1, 5.3.2)
   */
  loadWorkflow: async (workflowId) => {
    const isInitialLoad =
      get().workflowInstance === null ||
      get().workflowInstance?.id !== workflowId;

    if (isInitialLoad) {
      // Reset state for a new workflow load
      set({
        isLoading: true,
        workflowInstance: null,
        nodesById: new Map(),
        nodeDetailsCache: new Map(),
      });
      // Clear associated UI state
      get().resetWorkflowUIState();
    } else {
      // Indicate background synchronization. This prevents WS events from processing (checked in WebSocketManager).
      set({ isSyncing: true });
    }

    try {
      // Fetch the full snapshot (REST as Source of Truth - API 6.1)
      const workflow = await WorkflowService.getWorkflowById(workflowId);
      get()._normalizeAndSetData(workflow);
      return workflow;
    } catch (error) {
      console.error("Failed to load workflow:", error);
      toast.error("Failed to load or synchronize workflow data.");
      return null;
    } finally {
      set({ isLoading: false, isSyncing: false });
    }
  },

  /**
   * Normalizes the workflow data (builds the nodesById map) and updates the state.
   * (Architecture 4.3.4 Strategy 1)
   */
  _normalizeAndSetData: (workflow) => {
    const nodesById = new Map<number, NodeInstanceRead>();
    workflow.phases.forEach((phase) => {
      phase.stages.forEach((stage) => {
        stage.nodes.forEach((node) => {
          nodesById.set(node.id, node);
        });
      });
    });
    // Hydrate the store (Architecture 5.3.1 Step 3)
    set({ workflowInstance: workflow, nodesById });
  },

  clearWorkflowData: () => {
    // (Implementation remains as provided in context)
    set({
      workflowInstance: null,
      nodesById: new Map(),
      nodeDetailsCache: new Map(),
    });
    // Also clear associated UI interaction state
    get().resetWorkflowUIState();
  },

  // B. WebSocket Event Handlers

  /**
   * Handles incremental updates (API 6.5.1, Architecture 4.3.4 Strategy 2).
   * Uses Immer for efficient immutable updates of the nested structure.
   */
  handleNodeStatusUpdated: (updatedNode) => {
    // Use produce from immer for immutable updates
    set(
      produce((state: WorkflowSlice) => {
        if (!state.nodesById.has(updatedNode.id)) {
          console.warn(`WorkflowSlice: Received update for unknown node ${updatedNode.id}. Ignoring.`);
          return;
        }

        // 1. Update normalized map
        state.nodesById.set(updatedNode.id, updatedNode);

        // 2. Update nested structure immutably (required for React reactivity)
        if (state.workflowInstance) {
          // Locate the node in the tree structure
          const phase = state.workflowInstance.phases.find(
            (p) => p.name === updatedNode.phase_id,
          );
          if (phase) {
            const stage = phase.stages.find(
              (s) => s.id === updatedNode.stage_id,
            );
            if (stage) {
              const nodeIndex = stage.nodes.findIndex(
                (n) => n.id === updatedNode.id,
              );
              if (nodeIndex !== -1) {
                // Replace the node object (immer handles the immutability)
                stage.nodes[nodeIndex] = updatedNode;
              }
            }
          }
        }

        // 3. Update details cache if the node is currently cached
        const cachedDetails = state.nodeDetailsCache.get(updatedNode.id);
        if (cachedDetails) {
          // Optimistically merge the updated basic info (NodeInstanceRead fields) into the NodeDetailView
          state.nodeDetailsCache.set(updatedNode.id, {
            ...cachedDetails,
            ...updatedNode,
          });
        }
      }),
    );
  },

  /**
   * Handles version changes, triggering a full sync for staleness updates.
   * (API 6.5.2, Architecture 4.3.4 Strategy 4, Design Doc 3.1.2.C.2)
   */
  handleNodeActiveVersionChanged: async (updatedNode) => {
    // 1. Optimistically update the specific node first
    get().handleNodeStatusUpdated(updatedNode);

    // 2. Trigger full synchronization (Crucial for updating global is_stale flags)
    const workflowId = get().workflowInstance?.id;
    if (workflowId) {
      console.log(
        `NODE_ACTIVE_VERSION_CHANGED detected for node ${updatedNode.id}. Triggering full workflow sync (Staleness Update).`,
      );
      // We trigger the loadWorkflow in sync mode (isInitialLoad=false)
      await get().loadWorkflow(workflowId);
    }
  },

  /**
   * Handles dynamic structure changes (API 6.5.3, Architecture 4.3.4 Strategy 3).
   */
  handleWorkflowStructureUpdated: (workflow) => {
    // Full replacement is mandatory (Design Doc 3.1.2.C.3).
    get()._normalizeAndSetData(workflow);
    // Notify the user (Design Doc 3.1.2.C.3)
    toast.info("Workflow structure updated.");
  },

  handleWorkflowStatusUpdated: (workflow) => {
    // Update the workflow instance data.
    get()._normalizeAndSetData(workflow);
    if (workflow.status === "Completed") {
      toast.success("Workflow execution completed!");
    }
  },

  // C. Node Detail Management
  fetchNodeDetails: async (nodeId, force = false) => {
    // (Implementation remains as provided in context)
    if (!force && get().nodeDetailsCache.has(nodeId)) {
      return get().nodeDetailsCache.get(nodeId) ?? null;
    }

    try {
      const details = await NodeService.getNodeById(nodeId);
      set(
        produce((state: WorkflowSlice) => {
          state.nodeDetailsCache.set(nodeId, details);
        }),
      );
      return details;
    } catch (error) {
      console.error(`Failed to fetch details for node ${nodeId}:`, error);
      if (error instanceof Error && error.message === "NODE_BEYOND_FRONTIER") {
        // Design Doc N3.2
        toast.error("Access Denied", {
          description: "You cannot view nodes that have not yet been executed.",
        });
      } else {
        toast.error(`Failed to load details for node ${nodeId}.`);
      }
      return null;
    }
  },

  // D. Execution Control & HITL
  // (Implementations remain as provided in context - they initiate actions via API and rely on WS events above for state updates)
  reExecuteNode: async (nodeId, data = {}) => {
    set({ isExecutingAction: true });
    try {
      await NodeService.reExecuteNode(nodeId, data);
      toast.success("Re-execution started.");
      // State will be updated via WebSocket (NODE_STATUS_UPDATED -> Executing)
      return true;
    } catch (error) {
      handleExecutionError(error, "Re-execute");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  retryNode: async (nodeId, data = {}) => {
    set({ isExecutingAction: true });
    try {
      await NodeService.retryNode(nodeId, data);
      toast.success("Retry started.");
      return true;
    } catch (error) {
      handleExecutionError(error, "Retry");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  cancelNode: async (nodeId) => {
    set({ isExecutingAction: true });
    try {
      await NodeService.cancelNode(nodeId);
      toast.success("Cancellation requested.");
      // State update (Canceled) via WebSocket
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === "NODE_NOT_EXECUTING") {
        toast.error("Cannot cancel", {
          description: "The node is not currently executing.",
        });
      } else {
        toast.error("Failed to cancel execution.");
      }
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  submitHITL: async (nodeId, data) => {
    set({ isExecutingAction: true });
    try {
      const response = await NodeService.submitHITL(nodeId, data);
      toast.success(response.message || "Decision submitted.");
      // State updates via WebSocket. Response guides UI navigation.
      return response;
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "NODE_NOT_AWAITING_APPROVAL":
            toast.error("Submission Failed", {
              description: "The node is not awaiting approval.",
            });
            break;
          case "INVALID_HITL_SUBMISSION":
            toast.error("Invalid Submission", {
              description: "The provided data was invalid. Please check your inputs.",
            });
            break;
          default:
            toast.error("Failed to submit decision.");
        }
      }
      return null;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  // Design Doc 2.3.2 Task Flow: Version Switching
  activateVersion: async (nodeId, versionId) => {
    set({ isExecutingAction: true });
    try {
      // API 5.4.2 returns the updated NodeInstanceRead
      const updatedNode = await NodeService.activateVersion(nodeId, versionId);
      toast.success(`Version activated.`);

      // We rely on the WebSocket handler (NODE_ACTIVE_VERSION_CHANGED) to trigger the necessary syncs for staleness.
      // We optimistically update the local node state immediately.
      get().handleNodeStatusUpdated(updatedNode);

      // Ensure the UI interaction state is updated if we were viewing a historical version
      if (get().viewingVersionId !== null) {
        get().viewLatestVersion();
      }

      return true;
    } catch (error) {
      handleInterventionError(error, "Activate Version");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  // Design Doc 2.3.3 Task Flow: Manual Editing
  manualEdit: async (nodeId, data) => {
    set({ isExecutingAction: true });
    try {
      // API 5.4.1 returns the updated NodeInstanceRead
      const updatedNode = await NodeService.manualEdit(nodeId, data);
      toast.success("Manual edit saved as new version.");

      // Rely on WebSocket (NODE_ACTIVE_VERSION_CHANGED) for global sync.
      // Optimistically update local state.
      get().handleNodeStatusUpdated(updatedNode);

      // Exit editing mode in UI interaction slice (Cross-slice communication)
      get().stopEditing();

      return true;
    } catch (error) {
      handleInterventionError(error, "Manual Edit");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },
});

// Helper functions for error handling (Implementation remains as provided in context)
const handleExecutionError = (error: unknown, actionName: string) => {
  if (error instanceof Error) {
    switch (error.message) {
      case "INVALID_STATE_FOR_EXECUTION":
        toast.error(`${actionName} Failed`, {
          description: "The node is not in a valid state for execution.",
        });
        break;
      case "ACTION_FORBIDDEN_ON_NODE_TYPE":
        toast.error(`${actionName} Forbidden`, {
          description:
            "This action is not allowed for this node type (e.g., Generator nodes).",
        });
        break;
      default:
        toast.error(`Failed to ${actionName.toLowerCase()} node.`);
    }
  } else {
    toast.error(`Failed to ${actionName.toLowerCase()} node.`);
  }
};

const handleInterventionError = (error: unknown, actionName: string) => {
  if (error instanceof Error) {
    switch (error.message) {
      case "INVALID_STATE_OR_VERSION_MISMATCH":
        toast.error(`${actionName} Failed`, {
          description:
            "Invalid state or version mismatch. Please refresh and try again.",
        });
        break;
      case "ACTION_FORBIDDEN_ON_NODE_TYPE":
        toast.error(`${actionName} Forbidden`, {
          description: "This action is not allowed for this node type.",
        });
        break;
      default:
        toast.error(`Failed to ${actionName.toLowerCase()}.`);
    }
  } else {
    toast.error(`Failed to ${actionName.toLowerCase()}.`);
  }
};


--- (3441-3579 lines) ---
### core/store/slices/ui-interaction.slice.ts Content:

```ts
import { type SliceCreator } from "~/core/store";

// Manages the UI state of the Workflow page, decoupled from the business data.
export interface UIInteractionSlice {
  // --- State ---

  // 1. Navigation & Selection
  activeNodeId: number | null;

  // 2. Workspace View State
  // If null, we are viewing the latest (active_version or pending_result).
  viewingVersionId: number | null;
  isEditing: boolean;

  // 3. Layout State (Collapsible elements)
  // IDs of phases that are collapsed in the navigator (A)
  collapsedPhases: Set<string>;
  // IDs of stages that are collapsed in the navigator (A)
  collapsedStages: Set<string>;
  // Keys of blocks (e.g., 'inputs', 'artifacts') that are expanded in the workspace (B2)
  expandedBlocks: Set<string>;

  // --- Actions ---
  selectNode: (nodeId: number) => void;
  viewHistoricalVersion: (versionId: number) => void;
  viewLatestVersion: () => void;
  startEditing: () => void;
  stopEditing: () => void;
  togglePhaseCollapse: (phaseId: string) => void;
  toggleStageCollapse: (stageId: string) => void;
  toggleBlockExpansion: (blockKey: string, isExpanded?: boolean) => void;
  resetWorkflowUIState: () => void;
}

// Define default expanded blocks (Design Doc 3.1.3.B, 2.4.B)
// Key blocks (Output, HITL Zone) default expanded; auxiliary (Inputs, Artifacts) default collapsed.
const DEFAULT_EXPANDED_BLOCKS = new Set(["output", "hitl_zone"]);

export const createUIInteractionSlice: SliceCreator<UIInteractionSlice> = (
  set,
  get,
) => ({
  activeNodeId: null,
  viewingVersionId: null,
  isEditing: false,
  collapsedPhases: new Set(),
  collapsedStages: new Set(),
  expandedBlocks: DEFAULT_EXPANDED_BLOCKS,

  selectNode: (nodeId) => {
    // When selecting a new node, reset the view state (view latest, not editing)
    // and reset expanded blocks to default for the new context. (Design Doc 2.4.B)
    set({
      activeNodeId: nodeId,
      viewingVersionId: null,
      isEditing: false,
      expandedBlocks: DEFAULT_EXPANDED_BLOCKS,
    });
  },

  viewHistoricalVersion: (versionId) => {
    // Cannot view history while editing
    if (get().isEditing) return;
    set({ viewingVersionId: versionId, isEditing: false });
  },

  viewLatestVersion: () => {
    // Allow switching back to latest even if editing (e.g., viewing base version during edit)
    set({ viewingVersionId: null });
  },

  startEditing: () => {
    // Must have an active node to start editing
    if (get().activeNodeId === null) return;
    // When starting editing, we must be viewing the latest version (the base for the edit) (Design Doc 3.1.1.D)
    set({ isEditing: true, viewingVersionId: null });
  },

  stopEditing: () => {
    set({ isEditing: false });
  },

  togglePhaseCollapse: (phaseId) => {
    set((state) => {
      // Use Set for efficient management of collapsed state (immutable update)
      const newCollapsedPhases = new Set(state.collapsedPhases);
      if (newCollapsedPhases.has(phaseId)) {
        newCollapsedPhases.delete(phaseId);
      } else {
        newCollapsedPhases.add(phaseId);
      }
      return { collapsedPhases: newCollapsedPhases };
    });
  },

  toggleStageCollapse: (stageId) => {
    set((state) => {
      const newCollapsedStages = new Set(state.collapsedStages);
      if (newCollapsedStages.has(stageId)) {
        newCollapsedStages.delete(stageId);
      } else {
        newCollapsedStages.add(stageId);
      }
      return { collapsedStages: newCollapsedStages };
    });
  },

  toggleBlockExpansion: (blockKey, isExpanded) => {
    set((state) => {
      const newExpandedBlocks = new Set(state.expandedBlocks);
      const currentlyExpanded = newExpandedBlocks.has(blockKey);

      // Determine the desired state (toggle if undefined, otherwise use provided value)
      const shouldExpand = isExpanded ?? !currentlyExpanded;

      if (shouldExpand) {
        newExpandedBlocks.add(blockKey);
      } else {
        newExpandedBlocks.delete(blockKey);
      }
      return { expandedBlocks: newExpandedBlocks };
    });
  },

  // Called when navigating away from the workflow page or clearing workflow data (cross-slice communication)
  resetWorkflowUIState: () => {
    set({
      activeNodeId: null,
      viewingVersionId: null,
      isEditing: false,
      collapsedPhases: new Set(),
      collapsedStages: new Set(),
      expandedBlocks: DEFAULT_EXPANDED_BLOCKS,
    });
  },
});


--- (7262-7469 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/cockpit-layout.tsx Content:

```tsx
"use client";

import { useMemo, useRef, type RefObject } from "react";
import { ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { useShallow } from "zustand/react/shallow";

import { WorkflowTree } from "./workflow-tree";
import { NodeStatusIcon } from "~/components/platform/workflow/node-status-icon";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import type { WorkflowInstanceRead } from "~/core/models/workflow.model";
import { useStore } from "~/core/store";

interface CockpitLayoutProps {
  workflow: WorkflowInstanceRead;
  isSyncing: boolean;
}

export function CockpitLayout({ workflow, isSyncing }: CockpitLayoutProps) {
  const { activeNodeId, nodesById } = useStore(
    useShallow((state) => ({
      activeNodeId: state.activeNodeId,
      nodesById: state.nodesById,
    })),
  );

  const activeNode = useMemo(() => {
    if (!activeNodeId) return null;
    return nodesById.get(activeNodeId) ?? null;
  }, [activeNodeId, nodesById]);

  const isHistoryVisible = activeNode?.status === "Completed";

  const navigatorPanelRef = useRef<ImperativePanelHandle>(null);
  const historyPanelRef = useRef<ImperativePanelHandle>(null);

  const togglePanel = (panelRef: RefObject<ImperativePanelHandle | null>) => {
    const panel = panelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="workflow-cockpit-layout"
      className="flex h-full overflow-hidden rounded-2xl border border-border/60 bg-background/60 shadow-inner"
    >
      <ResizablePanel
        ref={navigatorPanelRef}
        id="workflow-navigator"
        collapsible
        defaultSize={22}
        minSize={18}
        className="bg-card/80"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Workflow Navigator
              </p>
              <p className="text-sm font-medium text-foreground">{workflow.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => togglePanel(navigatorPanelRef)}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">Toggle navigator</span>
            </Button>
          </div>
          <ScrollArea className="flex-1 px-3 py-4">
            <WorkflowTree workflow={workflow} />
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        id="workflow-workspace"
        minSize={isHistoryVisible ? 45 : 60}
        defaultSize={isHistoryVisible ? 56 : 70}
        className="bg-background"
      >
        <div className="flex h-full flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Active Node
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold">
                  {activeNode ? activeNode.name : "Select a node"}
                </h2>
                {activeNode ? (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 text-xs font-semibold"
                  >
                    <NodeStatusIcon status={activeNode.status} size={14} />
                    {activeNode.status}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {activeNode
                  ? `${activeNode.stage_name} • ${activeNode.node_type}`
                  : "Pick a node from the navigator to open its workspace."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                Workflow {workflow.status}
              </Badge>
              {isSyncing ? (
                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing
                </span>
              ) : null}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="flex min-h-full flex-col gap-4 px-6 py-6">
              {activeNode ? (
                <div className="rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-6 text-sm text-muted-foreground">
                  Workspace modules (outputs, artifacts, HITL actions) will render here.
                  Node #{activeNode.definition_id} remains interactive while execution
                  continues.
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                  Select any accessible node from the navigator to begin reviewing its
                  execution context.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>

      {isHistoryVisible ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            ref={historyPanelRef}
            id="workflow-history"
            collapsible
            defaultSize={18}
            minSize={16}
            className="bg-card/80"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Version History
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {activeNode?.name ?? "History"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => togglePanel(historyPanelRef)}
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Toggle history</span>
                </Button>
              </div>
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Completed nodes expose their revision timeline here. Future tasks will
                    hydrate this panel with actual version diffs and replays.
                  </p>
                  <div className="rounded-xl border border-dashed border-border/60 p-3">
                    Select a different completed node to preview its lineage.
                  </div>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </>
      ) : null}
    </ResizablePanelGroup>
  );
}



--- (8567-8654 lines) ---
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



--- (9749-9800 lines) ---
### components/ui/scroll-area.tsx Content:

```tsx
"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "~/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };



--- (10043-10112 lines) ---
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

```


--- (10531-10577 lines) ---
### components/ui/badge.tsx Content:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Added custom variants for status indication in project configuration
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };



--- (10612-10677 lines) ---
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



--- (14093-14185 lines) ---
### components/platform/workflow/node-status-icon.tsx Content:

```tsx
import {
  Ban,
  CheckCircle,
  Circle,
  Hourglass,
  Loader2,
  XCircle,
} from "lucide-react";

import { type NodeStatus } from "~/constants/enums";
import { cn } from "~/lib/utils";

interface NodeStatusIconProps {
  status: NodeStatus;
  className?: string;
  size?: number;
}

/**
 * Maps `NodeStatus` values to the correct Lucide icon and semantic color.
 * (Design Doc 5.1.2.A3, 4.1.1.D)
 * Uses the semantic status colors defined in the design system configuration.
 */
export function NodeStatusIcon({
  status,
  className,
  size = 16,
}: NodeStatusIconProps) {
  const baseClasses = "shrink-0";
  // We combine classes inside the switch to apply the correct semantic tokens.
  const iconProps = { size };

  switch (status) {
    case "Executing":
      // Requirement: Loader2 icon, Cyan (text-status-executing), animate-spin. (Design Doc 5.1.2.A3)
      return (
        <Loader2
          {...iconProps}
          className={cn(
            baseClasses,
            "animate-spin text-status-executing",
            className,
          )}
        />
      );
    case "Completed":
      // Requirement: CheckCircle, Emerald (text-status-completed).
      return (
        <CheckCircle
          {...iconProps}
          className={cn(baseClasses, "text-status-completed", className)}
        />
      );
    case "Awaiting HITL Approval":
      // Requirement: Hourglass, Amber (text-status-awaiting).
      return (
        <Hourglass
          {...iconProps}
          className={cn(baseClasses, "text-status-awaiting", className)}
        />
      );
    case "Failed":
      // Requirement: XCircle, Red (text-status-failed).
      return (
        <XCircle
          {...iconProps}
          // We use text-status-failed (which maps to --destructive)
          className={cn(baseClasses, "text-status-failed", className)}
        />
      );
    case "Canceled":
      // Requirement: Ban, Orange (text-status-canceled). (Design Doc 4.1.1.D)
      return (
        <Ban
          {...iconProps}
          className={cn(baseClasses, "text-status-canceled", className)}
        />
      );
    case "Not Started":
    default:
      // Requirement: Circle, muted color.
      return (
        <Circle
          {...iconProps}
          className={cn(baseClasses, "text-muted-foreground/70", className)}
        />
      );
  }
}
```

</deer_flow_frontend_code>

<architecture>
--- (141-165 lines) ---
#### 3.3.3 Cockpit 核心组件结构 (位于 `src/app/projects/[projectId]/workflow/components/`)

```
/workflow/components/
├── CockpitLayout.tsx          # 核心三栏布局实现 (react-resizable-panels)
│
├── Navigator/                 # A. 左侧栏：工作流导航器
│   ├── WorkflowNavigator.tsx
│   ├── WorkflowTree.tsx
│   └── NodeTreeItem.tsx
│
├── Workspace/                 # B. 中心面板：节点交互工作区
│   ├── NodeWorkspace.tsx
│   ├── WorkspaceHeader.tsx (B1)
│   ├── InteractionTranscript.tsx (B2)
│   ├── ActionFooter.tsx (B3)
│   └── blocks/
│       ├── InputsBlock.tsx
│       ├── ArtifactsBlock.tsx
│       └── OutputBlock.tsx
│
└── History/                   # C. 右侧栏：版本历史面板
    ├── VersionHistoryPanel.tsx
    └── VersionCard.tsx
```


--- (245-245 lines) ---
  nodeDetailsCache: Map<number, NodeDetailView>;


--- (262-262 lines) ---
    fetchNodeDetails: (nodeId: number) => Promise<NodeDetailView>;


--- (285-309 lines) ---
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


--- (373-417 lines) ---
## 6\. 核心布局架构：思维驾驶舱 (Core Layout Architecture: The Cockpit)

实现设计文档 3.2.1.C 和 5.1.1 定义的三栏式布局。

### 6.1 布局引擎选型与实现

  * **技术选型**: `react-resizable-panels`。
  * **实现位置**: `src/app/projects/[projectId]/workflow/components/CockpitLayout.tsx`。

### 6.2 布局结构 (Layout Structure)

```tsx
// CockpitLayout.tsx (Conceptual)
<PanelGroup direction="horizontal" autoSaveId="o-award-cockpit-v1">
  {/* A. Navigator */}
  <Panel id="navigator" collapsible={true} minSize={15} className="bg-card">
    <WorkflowNavigator />
  </Panel>
  <CustomResizeHandle />

  {/* B. Workspace */}
  <Panel id="workspace" minSize={50} className="bg-background">
    <NodeWorkspace />
  </Panel>

  {/* C. History (Conditional) */}
  {isHistoryVisible && (
    <>
      <CustomResizeHandle />
      <Panel id="history" collapsible={true} minSize={15} className="bg-card">
        <VersionHistoryPanel />
      </Panel>
    </>
  )}
</PanelGroup>
```

### 6.3 关键实现要求

1.  **全屏高度**: `PanelGroup` 需占满视口高度（减去 Global Header）。
2.  **持久化**: 必须启用 `autoSaveId`，将用户布局偏好存储在 `localStorage`。
3.  **可折叠性**: A 和 C 栏必须支持快速折叠/展开。
4.  **动态可见性 (Panel C)**: `isHistoryVisible` 的逻辑由 `WorkflowSlice` 和 `UIInteractionSlice` 共同决定（仅当选中节点状态为 `Completed` 时显示）。
5.  **视觉层级**: 使用不同的背景色（`bg-card` vs `bg-background`）区分侧边栏和工作区。



--- (441-470 lines) ---
### 7.2 B. 节点交互工作区 (Node Interaction Workspace)

**文件**: `NodeWorkspace.tsx`。

采用“交互记录 (Interaction Transcript)”模型（设计文档 3.1.1.B）。

#### 7.2.1 结构与布局

  * **B1. Header (`WorkspaceHeader.tsx`)**: 固定顶部。显示标题、状态、上下文工具栏（Re-execute, Edit, Cancel）和 `StalenessBanner`。
  * **B2. Transcript (`InteractionTranscript.tsx`)**: 可滚动内容区。
      * 使用 `Collapsible` 实现区块管理（Inputs, Artifacts, Output, HITL Zone）。
  * **B3. Footer (`ActionFooter.tsx`)**: 固定底部。仅在 `HITL` 模式下显示。

#### 7.2.2 专业内容展示与编辑

  * **Artifacts Block**:
      * 使用 `Tabs` 组织 Prompt, Code, Logs。
      * 使用 `CodeViewer` (Monaco) 展示内容。
      * `LogViewer` 模式需支持实时更新和自动滚动（`use-stick-to-bottom`）。
  * **Output Block**:
      * 实现 View-to-Edit 模式切换（设计文档 3.1.1.D）。
      * View Mode: 使用 `MarkdownRenderer`。
      * Edit Mode: 动态切换为 `RichTextEditor` (Novel/Tiptap) 或 `CodeEditor` (Monaco)。

#### 7.2.3 HITL 交互区 (HITL Interaction Zone)

  * **动态渲染**: 根据 `node.hitl_mode` 动态渲染 `SCAPanel`, `AVLPanel` 或 `VARLPanel`。
  * **`SCAPanel`**: 使用 `Tabs` 和 `RadioGroup`/`Checkbox` 实现方案选择。
  * **`AVLPanel`**: 使用列表展示批判意见，使用 React Hook Form 管理裁决状态（Accept/Reject）。



--- (501-504 lines) ---
  * 在 `styles/globals.css` 中实现设计文档 4.1.1.B 的 CSS 变量定义（HSL 格式）。
  * 在 `tailwind.config.ts` 中配置 Tailwind 使用这些变量。
  * 扩展 Tailwind 配置，实现语义化状态色彩（`status-completed`, `status-executing` 等）（设计文档 4.1.1.D）。


</architecture>



---

<task>


### 任务 13：节点交互工作区 (B)：结构与头部实现

**目标：** 实现中心面板（Node Interaction Workspace）的整体结构和头部区域 (B1)，提供当前节点的上下文和操作入口。

**核心关注点：** 布局实现（固定头尾）、数据加载（Node Details）、上下文工具栏、Staleness Banner、动态面板控制。

**实现策略（参考 `<design_doc> 5.1.3`, `<architecture> 7.2.1`）：**

1.  **组件结构（`Workspace/`）：** 实现 `NodeWorkspace.tsx` 和 `WorkspaceHeader.tsx`。
2.  **布局实现：** 在 `NodeWorkspace.tsx` 中实现 B1（固定头部）、B2（可滚动内容区）、B3（固定底部，占位）的布局。
3.  **数据加载与连接：**
    *   连接到 `UIInteractionSlice.activeNodeId`。
    *   当 `activeNodeId` 变化时，调用 `WorkflowSlice.fetchNodeDetails(nodeId)` 获取 `NodeDetailView`（利用缓存）。
4.  **WorkspaceHeader (B1) 实现（`<design_doc> 5.1.3.B1`）：**
    *   显示节点标题和 `StatusBadge`。
    *   **Contextual Toolbar：** 实现工具栏骨架。根据节点状态动态显示按钮（[Re-execute], [Manual Edit], [Cancel], [Retry]）。（按钮功能暂不实现）。
    *   **Generator Node 限制：** 根据 `node_type` 禁用特定操作（如 Generator 禁用 Edit/Re-execute）。
    *   **Staleness Banner：** 如果当前节点 `is_stale: true`，显示醒目的 `Alert` 横幅（`<design_doc> 3.3.D.2`）。
5.  **动态面板控制（Panel C 可见性）：**
    *   在 `CockpitLayout.tsx`（任务 10）中完善 Panel C 的可见性逻辑：仅当选中节点状态为 `Completed` 时显示（`<architecture> 6.3`）。

**输入：** 任务 10, 12 的输出（Cockpit Layout, WorkflowSlice, UIInteractionSlice）, `<design_doc> 5.1.3, 3.3.D.2`, `<architecture> 6.3, 7.2.1`。
**输出：** 实现了工作区的基本结构和动态头部，能够响应节点选择和状态变化。


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

严格按照以下格式输出格式：

... (answer to the task) ...

**`relative_path/filename.tsx`**

```tsx
... (code) ...
```

**`relative_path/filename.ts`**

```ts
... (code) ...
```

...(more files)...

... (conclusion) ...