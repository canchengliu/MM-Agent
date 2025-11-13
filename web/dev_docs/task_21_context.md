<design_doc>
--- (133-133 lines) ---
| V2.1 | 历史版本审查 | 用户可以查看任意节点的任意历史版本详情。 | SRS 5.6 | P0 |


--- (295-306 lines) ---
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



--- (317-317 lines) ---
  * **`VersionSource`**: `AI_GENERATED`, `MANUALLY_EDITED`.


--- (373-376 lines) ---
|  [A. Workflow Navigator]  |  [B. Node Interaction Workspace]  | [C. Version History] |
|         (Left Sidebar)    |           (Center Panel)          |    (Right Sidebar)   |
|                           |                                   |                      |
+---------------------------------------------------------------------------------+


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



--- (468-478 lines) ---

**场景:** 用户回退到上游 Node A 的历史版本 V1（当前 V2 激活），并希望更新下游 Node B。

**流程:**

1.  **用户导航与审阅:**
      * 用户在 Left Navigator (A) 点击 Node A。
      * Center Workspace (B) 加载 V2（Review Mode）。Right Sidebar (C) 显示。
2.  **用户审查历史版本:**
      * 用户在 Right Sidebar (C) 点击 V1 卡片。Center Workspace (B) 加载 V1 详情。
3.  **用户执行版本切换:**


--- (585-589 lines) ---
1.  **版本审阅 (Version Review):**

      * **流程：** 用户点击 `Version History Panel` (C) 中的任意版本卡片。
      * **响应：** Center Workspace (B) 立即加载该版本的详细信息（Review Mode）。Workspace 必须清晰标明当前查看的是否为活动版本（例如，显示“Historical Version V1”标签）。



--- (724-725 lines) ---
    3.  **动态可见性:** C 栏（Version History）仅在 Workspace (B) 处于 `Completed` (Review Mode) 时显示。



--- (795-799 lines) ---
  * **`Completed` (Review Mode):**
      * B1 Toolbar: 显示 [Re-execute], [Manual Edit]。
      * B2 Block 4: 显示只读的 HITL 历史记录。
      * B3 Footer: 隐藏。
      * **Right Sidebar (C): 显示。**


--- (806-826 lines) ---
#### C. 版本历史面板 (Version History Panel - Right Sidebar)

**结构:**

```
[C. Version History] (Scrollable, Resizable Panel, Conditional Visibility)
|
+-- [Header]: Version History [Collapse Button >>]
|
+-- [Version Card List] (Reverse Chronological)
    |
    +-- [Version Card V2] (Active State)
    |   |-- [V2] [Timestamp] [Source Icon: 🤖]
    |   |-- **[ACTIVE Tag]** (Prominent visual indicator)
    |   |-- [Summary: "Refined based on feedback..."]
    |
    +-- [Version Card V1] (Inactive State)
        |-- [V1] [Timestamp] [Source Icon: ✏️]
        |-- [Summary: "Manually corrected assumptions."]
        |-- [Button: Set as Active Version] (Requires Confirmation Dialog)
```


--- (879-883 lines) ---

  * **版本切换确认:**
      * **Title:** Activate Version V1?
      * **Body:** "Activating this version will change the node's output. Downstream nodes will be marked as 'Stale' and will NOT be automatically updated. Do you wish to proceed?"
      * **Actions:** [Cancel], [Activate V1]


--- (1394-1399 lines) ---
##### 2\. 版本卡片 (Version Card)

  * **应用场景：** Version History Panel (C)。
  * **结构:** 紧凑布局，包含版本号、时间戳、来源图标 (🤖/✏️)、摘要。
  * **Active State:** 使用 `border-primary` 高亮边框，并显示醒目的 **[ACTIVE]** `Badge`。



--- (1470-1478 lines) ---
  {/* C. History Panel (Conditional Rendering) */}
  {isHistoryVisible && ( // 仅在 Completed/Review Mode 时显示
    <>
      <PanelResizeHandle className="w-1 bg-border transition-colors duration-200 hover:bg-primary/70" />
      <Panel id="history" collapsible={true} minSize={15} defaultSize={20} className="bg-card">
        {/* Content C */}
      </Panel>
    </>
  )}


--- (1515-1530 lines) ---
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



--- (1558-1576 lines) ---
#### 5.1.4 C. 版本历史面板 (Version History Panel - Right Sidebar)

**可见性逻辑:** 仅当 Workspace (B) 处于 `Completed` (Review Mode) 时显示。

**C1. 结构与头部:**

  * 背景 `bg-card`。Header 同 Navigator (A)。

**C2. 版本卡片 (Version Card):**

  * 使用紧凑型 `Card`。`p-3 rounded-md`。
  * 内容：[V\#], [Timestamp], [Source Icon 🤖/✏️], [Summary]。
  * **Active State:**
      * 边框 `border-primary`。
      * 显示 **[ACTIVE]** `Badge` (`variant="default"`)。
  * **Inactive State:**
      * 显示 [Set as Active Version] 按钮。
      * 点击必须触发 `AlertDialog` 确认，文案遵循 3.3.D.4（强调非级联更新和 Staleness 后果）。



--- (1586-1586 lines) ---
  * **History (C):** 隐藏。


--- (1594-1594 lines) ---
  * **History (C):** 隐藏。


--- (1603-1603 lines) ---
  * **History (C):** 显示。


--- (1687-1690 lines) ---
1.  **版本激活反馈 (C):**

      * API 成功后，`[ACTIVE]` Badge 平滑过渡到新版本卡片。使用 Framer Motion `layoutId` 实现 Badge 的移动动画。



--- (1781-1781 lines) ---
      * **Version Card:** 实现规范见 5.1.4.C2-C3。


--- (1792-1792 lines) ---
      * C. Version History Panel：详见 5.1.4。


--- (1804-1804 lines) ---
      * 版本切换与 Staleness 传播动画（Badge movement, Pulse indicator）：详见 5.2.4。

</design_doc>

<api>
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



--- (1206-1209 lines) ---
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



--- (1301-1331 lines) ---
#### 1.2. 获取节点的所有版本

*   **Endpoint**: `GET /nodes/{node_id}/versions`
*   **权限**: 节点所有者。
*   **描述**: 按版本号降序返回指定节点的所有历史版本列表，用于版本回溯和比较。

##### 成功响应 (`200 OK`)
返回 `NodeVersionRead` 对象数组。
```json
[
  {
    "id": 2,
    "version_number": 2,
    "node_instance_id": 100,
    "summary": "Refined based on feedback...",
    "source": "MANUALLY_EDITED", // 版本来源：AI生成 或 手动编辑
    "based_on_version_id": 1,
    "...": "..."
  },
  {
    "id": 1,
    "version_number": 1,
    "node_instance_id": 100,
    "summary": "Initial version approved.",
    "source": "AI_GENERATED",
    "based_on_version_id": null,
    "...": "..."
  }
]
```



--- (1332-1338 lines) ---
#### 1.3. 获取特定版本的详细信息

*   **Endpoint**: `GET /nodes/{node_id}/versions/{version_id}`
*   **权限**: 节点所有者。
*   **描述**: 获取单个版本的完整信息，包括其具体的 `output_data` 和 `hitl_history`。

---


--- (1470-1500 lines) ---
### 4. 版本与结果干预

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



--- (1501-1521 lines) ---
#### 4.2. 激活指定版本

将指定的历史版本设置为当前节点的“官方”活动版本。

*   **Endpoint**: `POST /nodes/{node_id}/versions/{version_id}/activate`
*   **权限**: 节点所有者。
*   **重要影响**:
    *   此操作仅改变节点的 `active_version`，但**不会**自动重新执行任何下游节点。用户需自行决定是否基于此旧版本的结果去手动重新执行下游节点。
    *   **[新增]** 操作成功后，会广播一个 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。前端应监听此事件，并重新获取工作流的过时信息 (`is_stale` 标志) 以更新UI。

##### 路径参数
*   `node_id` (integer, **required**)
*   `version_id` (integer, **required**)

##### 成功响应 (`200 OK`)
返回更新后的 `NodeInstanceRead` 对象，其 `active_version_id` 已变为指定的 `version_id`。

##### 错误响应
*   `403 Forbidden`: 试图在 `Generator` 节点上切换版本。
*   `409 Conflict` (`INVALID_STATE`): 指定的 `version_id` 不属于该节点。



--- (1540-1550 lines) ---
#### 5.1. NodeDetailView

`GET /nodes/{node_id}` 返回的节点详细视图对象，继承自 `NodeInstanceRead`。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| *(所有 NodeInstanceRead 字段)* | | 参见项目管理文档中的 `NodeInstanceRead` 定义。 |
| `active_version` | object (NodeVersionRead) \| null | 如果节点已完成，此字段包含其当前活动版本的完整数据。 |
| `pending_result` | object (TemporaryExecutionRead) \| null | 如果节点正在执行或等待审批，此字段包含其临时的、未固化的结果。 |
| `staleness_report` | array (StalenessInfo) \| null | 如果节点的上游依赖已更新，此列表将包含详细的过时信息。 |



--- (1551-1570 lines) ---
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



--- (1690-1704 lines) ---
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


</api>

<front_stack>
--- (13-13 lines) ---
| | ↳ **`next/dynamic`** | 用于动态导入（懒加载）组件，如 `app/chat/page.tsx` 中对 `Main` 组件的使用，配合 `React.Suspense` 优化了初始页面加载速度。 |


--- (22-23 lines) ---
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |


--- (36-44 lines) ---
| **Tailwind CSS** | 原子化的 CSS 框架，用于构建整个项目的用户界面样式。 |
| **`@tailwindcss/typography`** | Tailwind CSS 的官方插件 (`prose` 类)，用于美化由 Markdown 或富文本编辑器生成的文本块样式。 |
| **`tailwindcss-animate`** | 为 Tailwind CSS 提供了便捷的动画类库。 |
| **next-themes** | 用于实现浅色/深色模式的主题切换功能。 |
| **class-variance-authority (cva)** | 用于创建可组合的、带变体的 UI 组件样式，广泛应用于 `components/ui` 目录。 |
| **tailwind-merge** | 用于智能合并 Tailwind CSS 类名，优雅地解决样式冲突问题。 |
| **clsx** | 一个小巧的工具库，用于根据条件动态地组合 CSS 类名。 |
| **Next.js Font (`next/font`)** | 用于本地化和优化 Web 字体，项目中使用了 `Geist` 字体。 |



--- (49-51 lines) ---
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |


--- (107-110 lines) ---
| **Lucide React** | 一套简洁、一致的开源图标库，是项目图标的主要来源。 |
| **Ant Design Icons** | 来自 Ant Design 的图标库，补充了部分特定图标。 |
| **Radix UI Icons** | 来自 Radix UI 的图标库，补充了部分特定图标。 |



--- (122-123 lines) ---
| **lru-cache** | 实现 LRU (Least Recently Used) 缓存策略，用于缓存网页标题等数据，减少重复请求。 |



--- (143-143 lines) ---
| **`MessageListView` & `MessageListItem`** | 实现了经典的聊天消息列表渲染模式。<br>- **关注点分离**: `MessageListView` 负责列表滚动和布局，`MessageListItem` 则根据消息类型 (`user`, `planner`, `researcher` 等) 委托给不同的子组件 (`MessageBubble`, `PlanCard`, `ResearchCard`) 渲染，代码结构清晰。<br>- **进入动画**: 使用 `framer-motion` 的 `motion.li` 为每条新消息添加入场动画，提升用户体验。 |


--- (157-157 lines) ---
| **状态与设置分离** | `store.ts` 负责管理**会话相关的动态状态**（如消息、响应状态），而 `settings-store.ts` 负责管理**用户配置**。这种分离使得状态管理更加清晰，易于维护。 |


--- (160-160 lines) ---
| **派生状态选择器 (Selectors)** | 项目定义了多个自定义 Hook (`useMessage`, `useRenderableMessageIds`, `useLastInterruptMessage`) 来从 store 中派生和选择数据。它们结合 `useShallow` 进行性能优化，封装了获取特定状态的逻辑，避免了组件内的重复计算。`useRenderableMessageIds` 尤其巧妙，它预先过滤出需要在 UI 中渲染的消息，从根源上解决了 React 列表渲染时的 `key` 值警告问题。 |


--- (205-206 lines) ---
| **组件分层** | 项目中的 `components/` 目录被清晰地划分为三层：<br>1. **`ui/`**: 基础 UI 组件，源自 Shadcn/ui，是应用的视觉基石。<br>2. **`deer-flow/`**: 应用级的共享组件，如 `Logo`, `Markdown`, `Tooltip` 等。它们封装了通用逻辑，在多个功能模块中复用。<br>3. **`magicui/`**: 高度定制化的视觉特效组件，与业务逻辑解耦，可轻松移植到任何项目中。 |
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |


--- (217-217 lines) ---
| **`cn` 工具函数** | `lib/utils.ts` 中的 `cn` 函数是整个项目的标准实践。它结合了 `clsx` 和 `tailwind-merge`，解决了在 React 组件中动态、条件性地组合 Tailwind 类名时的所有痛点（如条件判断、样式覆盖冲突），是现代 Tailwind 项目的必备工具。 |


--- (235-235 lines) ---
| **API 请求重试与超时** | `core/api/hooks.ts` 中的 `useConfig` Hook 在 `fetch` 配置时，不仅设置了超时 (`AbortSignal.timeout`)，还实现了带有指数退避 (exponential backoff) 的重试逻辑。这显著提高了应用在网络不佳情况下的稳定性。 |


--- (246-248 lines) ---
| **代码分割 (Code Splitting)** | 使用 `next/dynamic` 对大型或非首屏必要的组件进行懒加载。在 `app/chat/page.tsx` 中，核心的 `Main` 组件就是动态导入的，并提供了一个 `loading` 状态。这显著减小了初始页面的 JavaScript 包体积，加快了页面的可交互时间。 |
| **组件级 Memoization** | **`React.memo`**: 对于 props 不经常变化的纯展示组件，项目使用了 `React.memo` 进行包裹。例如，在 `app/chat/components/research-activities-block.tsx` 中，`ActivityMessage` 和 `ActivityListItem` 都被 `React.memo` 优化，防止在父组件重渲染时不必要地重新渲染整个活动列表。 <br>**`useMemo` / `useCallback`**: 在整个代码库中广泛使用 `useMemo` 来缓存计算结果（如 `app/chat/main.tsx` 中的 `doubleColumnMode`），以及使用 `useCallback` 来缓存事件处理器（如 `app/chat/components/input-box.tsx` 中的 `handleSendMessage`），避免了子组件因函数引用变化而导致的无效渲染。 |
| **有限动画策略** | 在渲染长列表时，并非所有项都需要动画。`app/chat/components/research-activities-block.tsx` 中实现了一个聪明的策略：定义一个 `MAX_ANIMATED_ITEMS` 常量，只对前 N 个新加载的列表项应用 `framer-motion` 动画，而后续项则直接渲染。这在保证视觉效果的同时，极大地降低了大量 DOM 元素同时动画带来的性能开销。 |


--- (270-270 lines) ---
| **可访问性 (a11y)** | **语义化 HTML**: 项目结构良好，使用了恰当的 HTML5 标签（`header`, `main`, `footer`, `section` 等）。<br>**Radix UI 基础**: 由于 UI 组件库基于 Radix UI，所有组件（如 `Dialog`, `DropdownMenu`, `Tooltip`）都内置了完善的键盘导航支持、焦点管理和 ARIA 属性，提供了坚实的可访问性基础。例如，弹窗打开时焦点会自动移入，关闭后会返回原处。 |

</front_stack>

<deer_flow_frontend_code>
--- (1138-1249 lines) ---
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



--- (11817-11940 lines) ---
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

// (Task 18): Define explicit constants for easier usage in components
export const NodeStatus = {
  NotStarted: "Not Started" as const,
  Executing: "Executing" as const,
  AwaitingHITLApproval: "Awaiting HITL Approval" as const,
  Completed: "Completed" as const,
  Failed: "Failed" as const,
  Canceled: "Canceled" as const,
};

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

// (Task 18): Define explicit constants
export const HITLMode = {
  VARL: "VARL" as const,
  SCA: "SCA" as const,
  AVL: "AVL" as const,
};

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

// (Task 18): Define explicit constants
export const HITLAction = {
  Continue: "Continue" as const,
  RejectAndProvideModificationComments: "RejectAndProvideModificationComments" as const,
  Discard: "Discard" as const,
};

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

// (Task 18): Define explicit constants
export const HITLResponseAction = {
  ExecuteNext: "ExecuteNext" as const,
  NavigateNext: "NavigateNext" as const,
  Completed: "Completed" as const,
  AVLLoop: "AVLLoop" as const,
  ReExecute: "ReExecute" as const,
  Discarded: "Discarded" as const,
};

```



--- (1883-2127 lines) ---
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



--- (2963-3020 lines) ---
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

```


--- (3112-3662 lines) ---
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
  NodeVersionRead,
} from "~/core/models/node.model";
import type {
  NodeInstanceRead,
  WorkflowInstanceRead,
} from "~/core/models/workflow.model";
import { type SliceCreator } from "~/core/store";
import { HITLResponseAction } from "~/constants/enums";

export interface WorkflowSlice {
  // --- State ---
  workflowInstance: WorkflowInstanceRead | null;
  // Normalized index for fast lookups (Architecture 4.3.4)
  nodesById: Map<number, NodeInstanceRead>;
  // Cache for node details
  nodeDetailsCache: Map<number, NodeDetailView>;
  // Cache for specific historical versions
  nodeVersionsCache: Map<number, NodeVersionRead>;

  isLoading: boolean; // Initial load
  isSyncing: boolean; // Background refresh/sync (e.g., after WS event or staleness update)
  isExecutingAction: boolean; // Covers re-execute, HITL submit, versioning actions (API request duration)

  // Tracks nodes where cancellation has been requested but not yet confirmed by WS. (Design Doc 3.1.2.C.4, Task 17.5)
  pendingCancellationNodeIds: Set<number>;

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
  // Action to fetch a specific historical version
  fetchNodeVersion: (
    nodeId: number,
    versionId: number,
  ) => Promise<NodeVersionRead | null>;

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
  nodeVersionsCache: new Map(),
  isLoading: false,
  isSyncing: false,
  isExecutingAction: false,
  pendingCancellationNodeIds: new Set(),

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
        nodeVersionsCache: new Map(),
        pendingCancellationNodeIds: new Set(), // Reset pending cancellations
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
      nodeVersionsCache: new Map(),
      pendingCancellationNodeIds: new Set(), // Clear pending cancellations
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

        // 4. Handle Cancellation Confirmation (Design Doc 3.1.2.C.4 Step 3 & 4)
        if (state.pendingCancellationNodeIds.has(updatedNode.id)) {
          // If the status is now Canceled, the cancellation is confirmed.
          if (updatedNode.status === "Canceled") {
            state.pendingCancellationNodeIds.delete(updatedNode.id);
          }
          // Robustness check: If the status changed away from Executing for any other reason (e.g., Failed, Completed naturally before cancellation processed), also clear the pending state.
          else if (updatedNode.status !== "Executing") {
            console.warn(`WorkflowSlice: Node ${updatedNode.id} left Executing state (${updatedNode.status}) while cancellation was pending.`);
            state.pendingCancellationNodeIds.delete(updatedNode.id);
          }
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
          // Optimization: If details include an active version, cache it in the version cache too.
          if (details.active_version) {
            state.nodeVersionsCache.set(details.active_version.id, details.active_version);
          }
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

  /**
   * Fetches a specific historical version of a node and caches it centrally. (API 5.1.3)
   */
  fetchNodeVersion: async (nodeId, versionId) => {
    // Check cache first
    if (get().nodeVersionsCache.has(versionId)) {
      return get().nodeVersionsCache.get(versionId) ?? null;
    }

    try {
      // Fetch from API
      const version = await NodeService.getNodeVersionById(nodeId, versionId);
      // Update cache
      set(
        produce((state: WorkflowSlice) => {
          state.nodeVersionsCache.set(versionId, version);
        }),
      );
      return version;
    } catch (error) {
      console.error(`Failed to fetch version ${versionId} for node ${nodeId}:`, error);
      // Provide user feedback and a recovery option if fetching fails.
      toast.error(`Failed to load historical version (ID: ${versionId}).`, {
        description: "Please try again or return to the latest version.",
        action: {
          label: "View Latest",
          // Cross-slice communication to revert UI state
          onClick: () => get().viewLatestVersion(),
        },
      });
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

  /**
   * Handles the asynchronous cancellation process (Design Doc 3.1.2.C.4, API 5.2.3, Task 17.5).
   */
  cancelNode: async (nodeId) => {
    // 1. Optimistically set pending cancellation state and start API request tracking (Design Doc 3.1.2.C.4 Step 1 & 2).
    set(
      produce((state: WorkflowSlice) => {
        // We track the API request duration (isExecutingAction) separately from the persistent pending state (pendingCancellationNodeIds).
        state.isExecutingAction = true;
        state.pendingCancellationNodeIds.add(nodeId);
      }),
    );

    try {
      // 2. Send API request
      await NodeService.cancelNode(nodeId);
      toast.success("Cancellation requested. Waiting for confirmation.");
      // We remain in pending state until WebSocket confirms 'Canceled' via handleNodeStatusUpdated.
      return true;
    } catch (error) {
      // 3. Handle API errors and revert pending state if request failed.
      set(
        produce((state: WorkflowSlice) => {
          state.pendingCancellationNodeIds.delete(nodeId);
        }),
      );

      if (error instanceof Error && error.message === "NODE_NOT_EXECUTING") {
        toast.error("Cannot cancel", {
          description: "The node is not currently executing.",
        });
      } else {
        // Use standardized error structure (Design Doc 3.1.2.B.3)
        toast.error("Cancellation Request Failed.", {
          description: "Could not send the request to the server. Please try again.",
        });
      }
      return false;
    } finally {
      // 4. Stop API request tracking, but maintain pendingCancellationNodeIds if successful.
      set({ isExecutingAction: false });
    }
  },

  submitHITL: async (nodeId, data) => {
    set({ isExecutingAction: true });
    try {
      const response = await NodeService.submitHITL(nodeId, data);
      toast.success(response.message || "Decision submitted.");

      // (Task 18): Handle specific actions requiring immediate frontend state updates
      if (response.action === HITLResponseAction.Discarded) {
        // If discarded, the pending_result is gone and the state might have reverted.
        // We must force a refetch of the node details to clear the cache and update the UI immediately. (API 5.3)
        console.log(
          `Execution discarded for node ${nodeId}. Forcing details refetch to synchronize UI.`,
        );
        // Await this to ensure cache is clean before returning response to caller.
        await get().fetchNodeDetails(nodeId, true);
      }

      // State updates via WebSocket. Response guides UI navigation (handled by HITLInteractionManager).
      return response;
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "NODE_NOT_AWAITING_APPROVAL":
            toast.error("Submission Failed", {
              description: "The node is not currently awaiting approval.",
            });
            // Force a refresh in case the local state is out of sync
            void get().fetchNodeDetails(nodeId, true);
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
```


--- (3664-3821 lines) ---
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
  // Temporary storage for content being edited locally before submission (Design Doc 2.3.3)
  localEditContent: string | null;

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
  // Action to update the local draft content
  updateLocalEditContent: (content: string) => void;
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
  localEditContent: null,
  collapsedPhases: new Set(),
  collapsedStages: new Set(),
  expandedBlocks: DEFAULT_EXPANDED_BLOCKS,

  selectNode: (nodeId) => {
    // When selecting a new node, reset the view state (view latest, not editing)
    // and reset expanded blocks to default for the new context. (Design Doc 2.4.B)
    // Also clear any local drafts from the previously selected node.
    set({
      activeNodeId: nodeId,
      viewingVersionId: null,
      isEditing: false,
      localEditContent: null,
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
    // We do not initialize localEditContent here; the editor component initializes based on existing content.
    set({ isEditing: true, viewingVersionId: null });
  },

  stopEditing: () => {
    // When stopping editing (Cancel or Save), clear the local draft.
    set({ isEditing: false, localEditContent: null });
  },

  // Update handler for the editor component
  updateLocalEditContent: (content: string) => {
    // Only update if currently in editing mode
    if (get().isEditing) {
      set({ localEditContent: content });
    }
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
      localEditContent: null,
      collapsedPhases: new Set(),
      collapsedStages: new Set(),
      expandedBlocks: DEFAULT_EXPANDED_BLOCKS,
    });
  },
});



--- (7935-8096 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/cockpit-layout.tsx Content:

```tsx
"use client";

import { useMemo, useRef, type RefObject } from "react";
// Removed Loader2, NodeStatusIcon, Badge imports as they are now handled within NodeWorkspace
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { useShallow } from "zustand/react/shallow";

import { WorkflowTree } from "./workflow-tree";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import type { WorkflowInstanceRead } from "~/core/models/workflow.model";
import { useStore } from "~/core/store";
import { NodeWorkspace } from "./workspace/node-workspace"; // Import NodeWorkspace

interface CockpitLayoutProps {
  workflow: WorkflowInstanceRead;
  isSyncing: boolean;
}

export function CockpitLayout({ workflow, isSyncing }: CockpitLayoutProps) {
  const { activeNodeId, nodesById, isEditing } = useStore(
    useShallow((state) => ({
      activeNodeId: state.activeNodeId,
      nodesById: state.nodesById,
      // We need to track the editing state for the Panel C visibility logic.
      isEditing: state.isEditing,
    })),
  );

  const activeNode = useMemo(() => {
    if (!activeNodeId) return null;
    return nodesById.get(activeNodeId) ?? null;
  }, [activeNodeId, nodesById]);

  // Design Doc 2.2.3.C / 3.1.1.C: Panel C (History) visibility logic.
  // Visible only when the Center Workspace is in "Review Mode" (Completed status AND not currently editing).
  const isHistoryVisible = activeNode?.status === "Completed" && !isEditing;

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
      {/* B. Workspace Panel */}
      <ResizablePanel
        id="workflow-workspace"
        // Dynamically adjust sizes based on Panel C visibility
        minSize={isHistoryVisible ? 45 : 60}
        defaultSize={isHistoryVisible ? 56 : 78}
        className="bg-background"
      >
        {/* Architecture 6.2: Host the NodeWorkspace component. */}
        <NodeWorkspace workflowStatus={workflow.status} isSyncing={isSyncing} />
      </ResizablePanel>

      {/* C. History Panel (Conditional) */}
      {isHistoryVisible ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            ref={historyPanelRef}
            id="workflow-history"
            collapsible
            defaultSize={22} // Slightly increased default size
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
                {/* Placeholder content */}
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Panel C: Version History Placeholder.
                  </p>
                  <div className="rounded-xl border border-dashed border-border/60 p-3">
                    Version cards (V1, V2...) will be listed here when implemented.
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

```


--- (8402-8506 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/useTranscriptData.ts Content:

```ts
"use client";

import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { NodeDetailView, NodeVersionRead, TemporaryExecutionRead } from '~/core/models/node.model';
import { useStore } from '~/core/store';

/**
 * Defines the structure of the data consumed by the Interaction Transcript.
 */
export interface TranscriptData {
  // The actual data payload (either a finalized version or a temporary result)
  data: NodeVersionRead | TemporaryExecutionRead | null;
  // Metadata about the source
  isHistorical: boolean; // True if viewing a specific historical version (even if it's the active one)
  isPending: boolean;    // True if data comes from pending_result
  versionId: number | null; // The ID of the version, null if pending
  isLoading: boolean;    // True if the required data (e.g., historical fetch) is currently loading
}

/**
 * Hook to determine and manage the data source for the Interaction Transcript.
 * Leverages the centralized store cache for fetching and accessing data.
 * (Architecture 7.2.2)
 */
export const useTranscriptData = (node: NodeDetailView | null): TranscriptData => {
  const { viewingVersionId, fetchNodeVersion, nodeVersionsCache } = useStore(useShallow((state) => ({
    viewingVersionId: state.viewingVersionId,
    fetchNodeVersion: state.fetchNodeVersion,
    // Access the centralized cache for historical versions
    nodeVersionsCache: state.nodeVersionsCache,
  })));

  const nodeId = node?.id;

  // Trigger fetch for historical data if required.
  useEffect(() => {
    if (nodeId && viewingVersionId !== null) {
      // The store action handles the fetch logic, caching, and error handling (toasts).
      // We derive loading state from the cache presence.
      void fetchNodeVersion(nodeId, viewingVersionId);
    }
  }, [nodeId, viewingVersionId, fetchNodeVersion]);

  // Determine the data source based on the current state.
  return useMemo((): TranscriptData => {
    // If node details (NodeDetailView) are not yet available, we are still loading the context.
    if (!node) {
      return { data: null, isHistorical: false, isPending: false, versionId: null, isLoading: true };
    }

    // 1. Historical View (viewingVersionId is set)
    if (viewingVersionId !== null) {
      // Check the centralized cache first
      let data = nodeVersionsCache.get(viewingVersionId) ?? null;

      // Optimization: If the requested version is the active version and not yet in the specific version cache (e.g. fetched via fetchNodeDetails), use it directly.
      if (!data && node.active_version && node.active_version.id === viewingVersionId) {
        data = node.active_version;
      }

      return {
        data,
        isHistorical: true,
        isPending: false,
        versionId: viewingVersionId,
        // Loading if the requested historical data is not yet available
        isLoading: data === null,
      };
    }

    // 2. Latest View (viewingVersionId is null)
    // Prioritize pending_result (Executing, Awaiting HITL, Failed)
    if (node.pending_result) {
      return {
        data: node.pending_result,
        isHistorical: false,
        isPending: true,
        versionId: null,
        isLoading: false,
      };
    }

    // Otherwise, show the active version (Completed)
    if (node.active_version) {
      return {
        data: node.active_version,
        isHistorical: false,
        isPending: false,
        versionId: node.active_version.id,
        isLoading: false,
      };
    }

    // Fallback (e.g., Not Started, or Completed without data)
    return { data: null, isHistorical: false, isPending: false, versionId: null, isLoading: false };

  }, [node, viewingVersionId, nodeVersionsCache]);
};


```


--- (8714-8901 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/node-workspace.tsx Content:

```tsx
"use client";

import { useEffect } from "react";
import { Loader2, Workflow } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { ScrollArea } from "~/components/ui/scroll-area";
import { useStore } from "~/core/store";
import { WorkspaceHeader } from "./workspace-header";
import { NodeStatus, type WorkflowStatus } from "~/constants/enums";
import { InteractionTranscript } from "./interaction-transcript";
import { ActionFooter } from "./action-footer";
import { useTranscriptData } from "./useTranscriptData";
import { HITLInteractionManager } from "../hitl/hitl-interaction-manager";
import type { TemporaryExecutionRead } from "~/core/models/node.model";

interface NodeWorkspaceProps {
  workflowStatus: WorkflowStatus;
  isSyncing: boolean;
}

/**
 * B. Node Interaction Workspace (Center Panel).
 * Manages data fetching optimization for the active node and implements the B1/B2/B3 layout.
 * (Architecture 7.2, Design Doc 3.1.3.B)
 */
export function NodeWorkspace({
  workflowStatus,
  isSyncing,
}: NodeWorkspaceProps) {
  const { activeNodeId, fetchNodeDetails, nodeDetailsCache, nodesById } =
    useStore(
      useShallow((state) => ({
        activeNodeId: state.activeNodeId,
        fetchNodeDetails: state.fetchNodeDetails,
        nodeDetailsCache: state.nodeDetailsCache,
        nodesById: state.nodesById,
      })),
    );

  // 1. Basic info (NodeInstanceRead) - available instantly from normalized store
  const activeNodeBasic = activeNodeId ? nodesById.get(activeNodeId) : null;

  // 2. Detailed info (NodeDetailView) - fetched on demand and cached
  const activeNodeDetails = activeNodeId
    ? nodeDetailsCache.get(activeNodeId)
    : null;

  // 3. Fetch latest details when activeNodeId changes
  useEffect(() => {
    if (activeNodeId) {
      // Trigger fetch (non-blocking). The slice handles caching and errors (toasts).
      void fetchNodeDetails(activeNodeId);
    }
  }, [activeNodeId, fetchNodeDetails]);

  // 4. Determine the data source for the transcript (Handles historical vs latest)
  // This hook manages fetching historical data via the store if needed.
  const transcriptData = useTranscriptData(activeNodeDetails);

  // 5. Determine loading state and display data
  // We are loading initial details if we have an ID but not the details object yet.
  const isLoadingDetails = !!activeNodeId && !activeNodeDetails;

  // The transcript content is loading if initial details are loading OR if the hook reports loading (e.g., historical fetch).
  const isTranscriptLoading = isLoadingDetails || transcriptData.isLoading;

  // Use details if available, otherwise fallback to basic info if available.
  // This ensures responsiveness: basic info renders immediately while details load.
  const displayNode = activeNodeDetails ?? activeNodeBasic;

  // Handle Empty State (No node selected)
  if (!displayNode) {
    // If activeNodeId is null, it's empty. If activeNodeId is set but basic info is missing (e.g. data sync issue), also treat as empty/loading.
    return activeNodeId ? <LoadingWorkspace /> : <EmptyWorkspace />;
  }

  // (Task 18): Determine if HITL Manager is needed
  const isAwaitingHITL = displayNode.status === NodeStatus.AwaitingHITLApproval;

  // Define the main content (B2 and B3)
  const workspaceContent = (
    <>
      {/* B2: Content (Scrollable) - InteractionTranscript */}
      <ScrollArea className="flex-1">
        {isTranscriptLoading ? (
          // Loading State for Details within B2
          <div className="p-6">
            <LoadingWorkspaceDetails />
          </div>
        ) : (
          // Loaded State
          // We know activeNodeDetails must exist here if isTranscriptLoading is false (due to the hook implementation).
          // We pass the selected dataSource to the transcript.
          <InteractionTranscript
            node={activeNodeDetails!}
            dataSource={transcriptData}
          />
        )}
      </ScrollArea>

      {/* B3: Footer (Fixed Bottom, Conditional Visibility) */}
      {/* Visibility logic (HITL or Editing) is handled inside ActionFooter. */}
      <ActionFooter node={displayNode} />
    </>
  );

  // Render the workspace structure (Design Doc 3.1.3.B)
  // B1/B2/B3 Layout implementation using flex column.
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* B1: Header (Fixed Top) - Includes B1.1 Staleness Banner internally */}
      <WorkspaceHeader
        node={displayNode}
        isSyncing={isSyncing}
        workflowStatus={workflowStatus}
        isLoadingDetails={isTranscriptLoading}
        // Pass the staleness report from the details (only available when details are loaded)
        stalenessReport={activeNodeDetails?.staleness_report ?? null}
      />

      {/* Conditionally wrap B2 and B3 with HITLInteractionManager (Design Doc 3.1.1.E) */}
      {isAwaitingHITL ? (
        // When Awaiting HITL, provide the manager with the necessary context.
        // We use a key based on the node ID and its status to ensure the manager state resets
        // when the underlying state changes (e.g., navigating or after ReExecute which changes status).
        <HITLInteractionManager
          key={`${displayNode.id}-${displayNode.status}`}
          node={displayNode}
          // Determine the pending result source reliably for the manager.
          // Prioritize the transcriptData if it's pending, otherwise fallback to details.
          pendingResult={
            (transcriptData.isPending ? (transcriptData.data as TemporaryExecutionRead) : null) ??
            activeNodeDetails?.pending_result ??
            null
          }
        >
          {workspaceContent}
        </HITLInteractionManager>
      ) : (
        workspaceContent
      )}
    </div>
  );
}

// --- Helper Components for States ---

function EmptyWorkspace() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-12 text-center text-muted-foreground">
      <Workflow className="h-16 w-16 text-border" />
      <h3 className="mt-4 text-lg font-semibold">Select a Node</h3>
      <p className="text-sm mt-2 max-w-md">
        Choose a node from the Workflow Navigator (Panel A) to view its details,
        outputs, and interact with the execution.
      </p>
    </div>
  );
}

// Used when the entire workspace is loading (e.g. initial selection before basic info is available, though unlikely with current architecture)
function LoadingWorkspace() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="mt-4 text-sm">Loading workspace...</p>
    </div>
  );
}

// Used when basic info is available but details (B2 content) are loading
function LoadingWorkspaceDetails() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="ml-3 text-sm text-muted-foreground">
        Loading detailed execution data...
      </p>
    </div>
  );
}


```


--- (8903-8962 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/interaction-transcript.tsx Content:

```tsx
"use client";

import type { NodeDetailView } from "~/core/models/node.model";
import { type TranscriptData } from "./useTranscriptData";
import { InputsBlock } from "./blocks/inputs-block";
import { ArtifactsBlock } from "./blocks/artifacts-block";
import { OutputBlock } from "./blocks/output-block";
import { HITLZoneBlock } from "./blocks/hitl-zone-block";

interface InteractionTranscriptProps {
  // B2 requires the full details (NodeDetailView) for context (e.g., status).
  node: NodeDetailView;
  // The specific data source (version or pending result) determined by useTranscriptData.
  dataSource: TranscriptData;
}

/**
 * B2. Interaction Transcript (Scrollable Content)
 * Displays the complete context of the currently viewed version.
 * (Design Doc 5.1.3.B2)
 */
export function InteractionTranscript({ node, dataSource }: InteractionTranscriptProps) {
  // If dataSource.data is null, it means there is nothing to show (e.g., Not Started, or Completed without data)
  if (!dataSource.data) {
    return <EmptyTranscript />;
  }

  // Design Doc 5.1.3.B2: Layout: space-y-6 p-6.
  return (
    <div className="space-y-6 p-6">
      {/* Block 1: Inputs & Dependencies */}
      <InputsBlock node={node} dataSource={dataSource} />

      {/* Block 2: Execution Artifacts */}
      <ArtifactsBlock node={node} dataSource={dataSource} />

      {/* Block 3: Generated Output */}
      <OutputBlock node={node} dataSource={dataSource} />

      {/* Block 4: HITL Interaction Zone */}
      <HITLZoneBlock node={node} dataSource={dataSource} />
    </div>
  );
}

function EmptyTranscript() {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
        This node has not generated any outputs or artifacts for the selected view.
      </div>
    </div>
  );
}


```


--- (8964-9096 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/workspace-header.tsx Content:

```tsx
"use client";

import { Loader2 } from "lucide-react";

import { NodeStatusIcon } from "~/components/platform/workflow/node-status-icon";
import { Badge } from "~/components/ui/badge";
import { type WorkflowStatus } from "~/constants/enums";
import type {
  NodeInstanceRead,
  StalenessInfo,
} from "~/core/models/workflow.model";
import { StalenessBanner } from "./staleness-banner";
import { ContextualToolbar } from "./contextual-toolbar";
import { BorderBeam } from "~/components/magicui/border-beam";

interface WorkspaceHeaderProps {
  // NodeInstanceRead (or derived NodeDetailView) allows rendering basic info while details load.
  node: NodeInstanceRead;
  isSyncing: boolean;
  workflowStatus: WorkflowStatus;
  isLoadingDetails: boolean;
  // Staleness report provides the details if node.is_stale is true (only available when details are loaded).
  stalenessReport: StalenessInfo[] | null;
}

/**
 * Renders the header section (B1) of the Node Workspace.
 * Includes Title, Status, Contextual Toolbar, and Staleness Banner (B1.1).
 * (Design Doc 5.1.3.B1)
 */
export function WorkspaceHeader({
  node,
  isSyncing,
  workflowStatus,
  isLoadingDetails,
  stalenessReport,
}: WorkspaceHeaderProps) {
  // Determine if the Staleness Banner (B1.1) should be shown.
  // Requires node to be marked stale AND we must have the details (report) loaded.
  const showStalenessBanner =
    node.is_stale && stalenessReport && stalenessReport.length > 0;

  // Design Doc 5.1.5: Activate BorderBeam animation (Cyan) when Executing.
  const isExecuting = node.status === "Executing";

  return (
    // B1: Fixed Top Header Container. Uses flex-col to stack main header and banner.
    // Relative positioning required for BorderBeam.
    <div className="relative z-10 flex shrink-0 flex-col border-b border-border/50 bg-background">
       {/* Visual Enhancement: BorderBeam during execution */}
       {isExecuting && (
        <BorderBeam
          // Use the semantic status color for executing (Cyan)
          // status.executing.DEFAULT: hsl(186.2 95.2% 40.3%)
          colorFrom="hsl(186.2 95.2% 40.3%)"
          colorTo="hsl(186.2 95.2% 60%)"
          duration={5}
        />
      )}
      
      {/* Main Header Content (B1) */}
      {/* We use padding (py-3) instead of fixed height (h-12) to accommodate content flexibly. */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3">
        {/* Left side: Title, Status, Metadata */}
        <div className="flex items-center gap-4">
          <NodeStatusIcon status={node.status} size={24} className="hidden sm:block" />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Design Doc 5.1.3.B1: [ID] | [Name] */}
              <h1 className="text-lg font-semibold">
                <span className="font-mono text-sm text-muted-foreground">
                  {node.definition_id}
                </span>{" "}
                | {node.name}
              </h1>
              {/* Status Badge */}
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 text-xs font-medium"
              >
                {/* Show detailed stage if executing (Design Doc 3.3.C) */}
                {node.status === "Executing"
                  ? node.current_stage
                  : node.status}
              </Badge>
              {isLoadingDetails && (
                <Loader2
                  className="h-4 w-4 animate-spin text-muted-foreground"
                  title="Loading details"
                />
              )}
            </div>
            {/* Metadata (Stage and Type) */}
            <p className="text-sm text-muted-foreground mt-0.5">
              {node.stage_name} • Type: {node.node_type} • HITL:{" "}
              {node.hitl_mode}
            </p>
          </div>
        </div>

        {/* Right side: Contextual Toolbar and Workflow Status */}
        <div className="flex items-center gap-6">
          {/* Contextual Toolbar (Dynamic Buttons) */}
          <ContextualToolbar node={node} />

          {/* Workflow Status Indicator */}
          <div className="flex items-center gap-3 border-l pl-6">
            {isSyncing && (
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing
              </span>
            )}
            <Badge
              variant="outline"
              className="text-xs uppercase tracking-wide"
            >
              Workflow {workflowStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* B1.1: Staleness Banner (Conditional) */}
      {showStalenessBanner && <StalenessBanner report={stalenessReport!} />}
    </div>
  );
}




--- (12611-12709 lines) ---
### components/ui/card.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import * as React from "react"

import { cn } from "~/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}



--- (12980-13032 lines) ---
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

```


--- (13889-13928 lines) ---
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
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-xs",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-xs",
        outline: "text-foreground shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
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


--- (231-271 lines) ---
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



--- (471-490 lines) ---
### 7.3 C. 版本历史面板 (Version History Panel)

**文件**: `VersionHistoryPanel.tsx`, `VersionCard.tsx`。

#### 7.3.1 数据获取

  * 通过 `GET /nodes/{node_id}/versions` 获取版本列表。建议使用 React Query 进行缓存管理。

#### 7.3.2 版本卡片 (`VersionCard`)

  * 显示版本元数据（V\#, 时间戳, 来源图标 🤖/✏️, Summary）。
  * 清晰标记 `[ACTIVE]` 状态。

#### 7.3.3 交互逻辑

  * **Review**: 点击卡片，更新 `UIInteractionSlice.viewingVersionId`，Workspace (B) 加载历史版本详情。
  * **Activate**: 点击 [Set as Active Version]。
      * **[关键实现]** 弹出确认对话框，明确告知后果（非级联更新，Staleness）（设计文档 3.1.1.C.2）。
      * 调用 API，然后等待 WebSocket 事件触发全局同步（详见 5.3.4）。


</architecture>



---

<task>


### 任务 21：版本历史面板 (C)：实现与历史回顾

**目标：** 实现右侧栏的版本历史面板 (C)，支持查看历史版本列表和审阅特定版本详情。

**核心关注点：** 版本数据获取、VersionCard UI 设计、历史版本审阅交互、UI 联动。

**实现策略（参考 `<design_doc> 5.1.4`, `<architecture> 7.3`）：**

1.  **组件结构（`History/`）：** 实现 `VersionHistoryPanel.tsx` 和 `VersionCard.tsx`。
2.  **数据获取（`<api> 5.1.2`）：**
    *   当面板显示时（由任务 13 控制的可见性逻辑），调用 API 获取版本列表（`GET /nodes/{node_id}/versions`）。（推荐使用 React Query 管理此数据缓存）。
3.  **VersionCard 实现（`<design_doc> 5.1.4.C2`）：**
    *   实现紧凑布局（V\#, 时间戳, 来源图标 🤖/✏️, Summary）。
    *   清晰标记 `[ACTIVE]` 状态（`Badge` 和 `border-primary`）。
4.  **历史回顾交互（`<design_doc> 3.1.1.C.1`）：**
    *   点击非活动版本卡片时，调用 `UIInteractionSlice.viewHistoricalVersion(versionId)`。
    *   **关键实现：** `NodeWorkspace` (B) 需响应此变化，加载（`<api> 5.1.3`）并展示该历史版本的详情（更新 `InteractionTranscript` 的数据源）。Workspace Header 需明确提示正在查看历史版本。

**输入：** 任务 16, 20 的输出（Workspace, UIInteractionSlice）, `<api> 5.1.2, 5.1.3`, `<design_doc> 3.1.1.C, 5.1.4`, `<architecture> 7.3`。
**输出：** 实现了版本历史面板，支持历史版本的查看和审阅。


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


---

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

