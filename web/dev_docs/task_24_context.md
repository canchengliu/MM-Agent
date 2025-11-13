<design_doc>
--- (50-50 lines) ---
    *   系统应提供智能建议和状态提示（如“依赖过时 Staleness”），但绝不强制用户采取行动，保持“静默状态管理”（遵循 SRS 1.4）。


--- (136-136 lines) ---
| V4.1 | 过时状态 (Staleness) 检测 | 系统检测并标记输入依赖已过时的节点（`is_stale`）。 | SRS 1.4, FRS 5.2 | P1 |


--- (145-145 lines) ---
| N2.2 | 过时状态可视化 | 清晰标识“陈旧 (Stale)”的节点。 | FRS 5.2 | P1 |


--- (183-183 lines) ---
    *   系统状态（进度、依赖关系、Staleness）必须时刻清晰可见且准确无误。


--- (195-195 lines) ---
*   **非侵入式引导 (Non-intrusive Guidance):** 采用“静默状态管理”（SRS 1.4）。系统通过非阻塞、非强制的方式提供信息和建议（如 Staleness 提示），绝不打断用户的当前任务流。


--- (285-285 lines) ---
          * `is_stale` (boolean): 指示输入依赖是否已过时。**(前端关键：用于显示警告图标和横幅)**。


--- (386-386 lines) ---
    3.  **Staleness Indicator (⚠️):** 如果 `is_stale: true`，则显示清晰的警告图标。


--- (402-402 lines) ---
      * [Staleness Banner]: 如果 `is_stale: true`，显示醒目的横幅提示。


--- (432-432 lines) ---
      * **Activate:** 在非激活版本上提供 [Set as Active Version] 按钮。点击后触发全局 Staleness 刷新。


--- (467-499 lines) ---
#### 2.3.2 任务流 2：版本回溯、切换与下游重执行 (Task Flow: Version Switching and Downstream Re-execution)

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



--- (519-519 lines) ---
      * **前端响应:** UI 退出编辑模式。Right Sidebar 更新。前端触发工作流全量状态刷新（同 2.3.2 步骤 4），更新下游节点的 `is_stale` 标志。


--- (590-596 lines) ---
2.  **版本切换 (Version Switching):**

      * **流程：** 用户点击非活动版本上的 [Set as Active Version] 按钮。
      * **确认对话框（关键）：** 弹出确认模态框（Shadcn `AlertDialog`），明确告知用户后果：“Activating this version will change the node's output. Downstream nodes will NOT be automatically updated; they will be marked as 'Stale'. Proceed?”（遵循 SRS 1.4, 3.3）。
      * **响应：** 用户确认后执行 API 调用。UI 更新 `Active` 标签，并等待 WebSocket 事件触发全局 Staleness 更新。
      * **限制：** `Generator` 节点的版本切换按钮必须禁用（遵循 SRS 2.3）。



--- (653-663 lines) ---
##### 2\. 依赖过时状态 (Staleness)

实现“静默状态管理”（SRS 1.4）。

  * **检测与传播逻辑:**
    1.  **触发:** 前端监听到 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。
    2.  **同步:** 前端必须立即调用 `GET /workflows/{id}` 重新获取全量工作流状态，以更新所有节点的 `is_stale` 标志。
  * **视觉传达:**
      * **全局 (Navigator A):** 在 `is_stale: true` 的节点旁显示清晰的 ⚠️ 图标。Hover 显示 Tooltip 解释原因。
      * **局部 (Workspace B1):** 如果当前节点过时，显示醒目的、不可关闭的 `Staleness Banner`。



--- (756-756 lines) ---
            |-- [✅ Completed] [Name] [⚠️ Stale Indicator]


--- (772-772 lines) ---
|   +-- [Staleness Banner] (Conditional Alert Banner if is_stale=true)


--- (858-858 lines) ---
| 输入依赖已过时 | Stale / Inputs Changed | Outdated, Old, Unsynced |


--- (869-872 lines) ---
##### 2\. 复杂状态解释：Staleness

  * **Banner:** "⚠️ **Inputs Changed.** Upstream node [Node Name] has a new active version (V\#). Consider re-executing this node to synchronize."



--- (880-883 lines) ---
  * **版本切换确认:**
      * **Title:** Activate Version V1?
      * **Body:** "Activating this version will change the node's output. Downstream nodes will be marked as 'Stale' and will NOT be automatically updated. Do you wish to proceed?"
      * **Actions:** [Cancel], [Activate V1]


--- (1008-1012 lines) ---
  // Awaiting HITL / Stale (Amber) - 需要注意和行动
  awaiting: {
    DEFAULT: 'hsl(45.9 95.2% 50.3%)', // Amber-500
    foreground: 'hsl(45.9 95.2% 10%)', // Dark foreground for contrast
  },


--- (1391-1391 lines) ---
  * **Staleness Indicator (⚠️):** 使用 `AlertTriangle` 图标。Hover 时必须显示 Tooltip 解释原因。


--- (1510-1514 lines) ---
**A4. 过时状态指示器 (Staleness Indicator ⚠️):**

  * 图标: `AlertTriangle`, `text-status-awaiting` (Amber 500)。
  * **交互:** 必须使用 `Shadcn/ui Tooltip` 包裹。Hover 时显示：“Stale: Upstream dependency [Node Name] has changed.”



--- (1526-1530 lines) ---
**B1.1 过时状态横幅 (Staleness Banner - Conditional):**

  * 如果 `is_stale: true`，在 Header 下方显示。
  * 使用 `Shadcn/ui Alert` (定制 Amber variant)。文案遵循 3.3.D.2。



--- (1575-1575 lines) ---
      * 点击必须触发 `AlertDialog` 确认，文案遵循 3.3.D.4（强调非级联更新和 Staleness 后果）。


--- (1596-1604 lines) ---
##### State: `Completed` (Review Mode, Stale)

  * **Navigator (A):** 图标为 `CheckCircle` (Green)，并在右侧显示 ⚠️ `AlertTriangle` (Amber)。
  * **Workspace (B):**
      * B1: Toolbar 显示 [Re-execute], [Manual Edit]。
      * B1.1: 显示 `Staleness Banner` (Amber Alert)。
      * B2: 显示只读 Transcript。
  * **History (C):** 显示。



--- (1683-1712 lines) ---
#### 5.2.4 场景 4：版本切换与 Staleness 传播反馈 (Version Switching & Staleness Feedback)

**目标:** 清晰传达版本变更及其对下游的影响。

1.  **版本激活反馈 (C):**

      * API 成功后，`[ACTIVE]` Badge 平滑过渡到新版本卡片。使用 Framer Motion `layoutId` 实现 Badge 的移动动画。

2.  **Staleness 传播反馈 (A):**

      * **触发:** 工作流状态刷新后（检测到 `is_stale: true`）。
      * **效果:** ⚠️ Staleness Indicator 出现时，使用一个微妙的动画吸引注意。
      * **实现:** 使用 Framer Motion 实现快速的“脉冲 (Pulse)”效果。

<!-- end list -->

```tsx
// Implementation Guidance (Staleness Indicator)
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{
    type: "spring",
    stiffness: 500,
    damping: 20,
  }}
>
  <AlertTriangle className="text-status-awaiting" />
</motion.div>
```


--- (1741-1741 lines) ---
3.  **Staleness 处理逻辑:** 监听到 `NODE_ACTIVE_VERSION_CHANGED` 事件后，必须立即重新获取全量工作流状态以更新 `is_stale` 标志。


--- (1751-1751 lines) ---
  * **语义化状态色彩 (Tailwind `status-*`):** Completed (Emerald), Executing (Cyan), Awaiting/Stale (Amber), Failed (Red), Canceled (Orange)。


--- (1804-1804 lines) ---
      * 版本切换与 Staleness 传播动画（Badge movement, Pulse indicator）：详见 5.2.4。

</design_doc>

<api>
--- (847-867 lines) ---

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



--- (1114-1142 lines) ---
### 3. 工作流状态洞察

#### 3.1. 批量获取工作流节点过时信息

高效检查工作流中所有节点的输入依赖是否过时。

*   **Endpoint**: `GET /workflows/{workflow_id}/staleness`
*   **权限**: 工作流所有者。
*   **描述**: 返回一个映射，键为已过时的节点 ID，值为其过时原因的详细信息。

##### 成功响应 (`200 OK`)
```jsonc
{
  "105": [ // 节点 ID 105 已过时
    {
      "upstream_node_id": 101, // 上游依赖节点的 ID
      "upstream_definition_id": "1.1.1",
      "consumed_version_id": 1, // 它上次用的是版本 1
      "current_active_version_id": 2 // 但上游现在是版本 2
    }
  ]
}
```
##### > 前端实现要点
> *   **何时调用**:
>     1.  **[更新]** 当用户需要查看**为什么**一个节点是过时的（例如，鼠标悬浮在警告图标上时），可以调用此接口获取详细信息。 `is_stale` 标志提供了 "是否过时" 的信息，此接口提供了 "为何过时" 的答案。
>     2.  当任何节点的版本发生变更后（如：用户批准 HITL、手动编辑、切换历史版本）。
> *   **如何使用**: 遍历返回的字典的键（`"105"`），在画布上找到对应的节点，并为其添加一个视觉提示（如警告图标、虚线边框等），并在鼠标悬浮时展示过时详情。



--- (1181-1191 lines) ---
#### 4.4. StalenessInfo

描述一个节点的上游依赖为何"过时"的详细信息。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `upstream_node_id` | integer | 已更新的上游依赖节点的 ID。 |
| `upstream_definition_id` | string | 上游节点的定义 ID (例如, "1.1.1")。 |
| `consumed_version_id` | integer | 当前节点上次执行时所消费的上游版本 ID。 |
| `current_active_version_id`| integer \| null | 上游节点当前最新的活动版本 ID。 |



--- (1202-1210 lines) ---
### 核心概念

为更好地理解本模块 API，请先熟悉以下核心概念：

*   **节点生命周期 (Node Lifecycle)**: 一个节点通常会经历 `Not Started` -> `Executing` -> `Awaiting HITL Approval` -> `Completed` 的状态流。**[新增]** `Executing` 状态可以被中断，进入 `Canceled` 状态。`retry` 或 `re-execute` 等操作会使其重新进入 `Executing` 状态。`Failed` 是一个可能的终态，但可以通过 `retry` 恢复。
*   **版本 (Version)**: 每次节点成功执行并被用户批准后，其结果（输入、输出、交互历史）都会被固化为一个“版本”。`active_version` 代表该节点当前对外提供的“官方”结果。
*   **执行前沿 (Execution Frontier)**: 指工作流中已执行或正在执行的最后一个节点的序号。为保证流程的顺序性，用户不能“跳级”操作前沿之外的节点。
*   **过时状态 (Staleness)**: 当一个节点的上游依赖节点更新了其 `active_version` 后，该节点就处于“过时”状态。这是 **UI 提示** 的关键数据，应在界面上明确标记该节点，并建议用户“重新执行以同步最新上游数据”。



--- (1233-1300 lines) ---
### 1. 节点查询与展示

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



--- (1672-1677 lines) ---

*   **当 `event_type` 为 `NODE_STATUS_UPDATED` 或 `NODE_ACTIVE_VERSION_CHANGED` 时**: **[标题更新]**
    *   `data` 的结构为 `NodeInstanceRead`。**[重要变化]** 此对象现在包含 `is_stale` 字段。详情请参见项目管理文档。
*   **当 `event_type` 为 `WORKFLOW_STRUCTURE_UPDATED` 或 `WORKFLOW_STATUS_UPDATED` 时**:
    *   `data` 的结构为 `WorkflowInstanceRead`。**[重要变化]** 其内部嵌套的每个节点对象 (`nodes` 数组中) 也都包含 `is_stale` 字段。



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
--- (49-52 lines) ---
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |
| **Sonner** | 用于显示轻量级的 Toast 通知（消息提示）。 |


--- (61-61 lines) ---
| **Tippy.js** | 用于在富文本编辑器中创建 `@mention` 功能的浮动提示框 (Tooltip/Popover)。 |


--- (107-107 lines) ---
| **Lucide React** | 一套简洁、一致的开源图标库，是项目图标的主要来源。 |


--- (148-148 lines) ---
| **`Link` (自定义)** | 位于 `components/deer-flow/link.tsx`，这是一个增强版的 `<a>` 标签。它会查询 Zustand store 中的工具调用历史，判断一个链接是否在之前的搜索结果中出现过。如果未出现，则会显示一个“链接不可靠”的警告图标。这是一个**将 UI 组件与业务状态深度结合**的创新实践。 |


--- (153-162 lines) ---
项目基于 Zustand 构建了清晰、高效的状态管理架构，核心代码位于 `core/store/`。

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **状态与设置分离** | `store.ts` 负责管理**会话相关的动态状态**（如消息、响应状态），而 `settings-store.ts` 负责管理**用户配置**。这种分离使得状态管理更加清晰，易于维护。 |
| **`sendMessage` 异步流程编排** | 这个核心函数是整个聊天功能的驱动器。它展示了：<br>1. **乐观更新**: 立即将用户消息追加到状态中。<br>2. **流式处理**: 调用 `chatStream` 并通过 `for await...of` 循环处理 SSE 事件。<br>3. **批量更新**: 使用 `setTimeout` 和 `Map` 对来自流的多个消息更新事件进行批处理，减少 React 的重渲染次数，提升性能。<br>4. **错误处理**: 使用 `try...finally` 确保无论成功与否，`responding` 状态都能被正确重置。 |
| **`mergeMessage` 纯函数** | 位于 `core/messages/merge-message.ts`，这是一个独立的、无副作用的函数，负责根据收到的 SSE 事件更新单个消息对象的状态。这种模式将状态变更的复杂逻辑从主流程中剥离，使其易于测试和维护，是 Reducer 模式的体现。 |
| **派生状态选择器 (Selectors)** | 项目定义了多个自定义 Hook (`useMessage`, `useRenderableMessageIds`, `useLastInterruptMessage`) 来从 store 中派生和选择数据。它们结合 `useShallow` 进行性能优化，封装了获取特定状态的逻辑，避免了组件内的重复计算。`useRenderableMessageIds` 尤其巧妙，它预先过滤出需要在 UI 中渲染的消息，从根源上解决了 React 列表渲染时的 `key` 值警告问题。 |
| **LocalStorage 持久化** | `settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数提供了一个简洁明了的模式，用于将 Zustand store 的状态与 `localStorage` 同步，实现了用户设置的持久化。 |



--- (191-196 lines) ---
| 模式/技术 | 描述与复用价值 |
| :--- | :--- |
| **`Framer Motion` 列表与状态动画** | **列表交错动画**: 在 `conversation-starter.tsx` 和 `message-list-view.tsx` 中，通过在 `motion.li` 的 `transition` prop 中设置 `delay: index * 0.1`，实现了新项目依次入场的精美效果。这是一个可直接应用于任何动态列表的模式。<br>**条件渲染动画**: `input-box.tsx` 使用 `<AnimatePresence>` 组件来包裹根据条件渲染的元素（如用户反馈提示）。这使得元素的出现和消失都带有平滑的动画效果，而不是生硬地切换。 |
| **`Magic UI` 特效组件的集成** | 项目将 `Magic UI` 组件作为独立的、可配置的视觉增强层。例如，`input-box.tsx` 在 "Enhance Prompt" 功能激活时，会动态渲染 `<BorderBeam>` 组件，为组件添加一个临时的、代表"处理中"状态的视觉光环。这展示了如何将视觉特效与组件的内部状态变化相结合。 |
| **纯 CSS 动画与组件** | 项目在 `styles/globals.css` 中定义了复杂的 `@keyframes` 动画，如 `aurora` 和 `spotlight`。这些动画通过独立的组件（如 `aurora-text.tsx`, `ray.tsx`）应用，将动画逻辑与组件结构分离。这种方法性能优异，适用于背景、光效等装饰性动画。 |
| **CSS Modules** | 对于需要特定、隔离样式的组件，如 `loading-animation.tsx`，项目采用了 CSS Modules (`.module.css`)。这确保了动画类名（如 `.bouncing-animation`）的局部作用域，避免了与全局 Tailwind 样式或其它组件样式的冲突。 |


--- (206-206 lines) ---
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |


--- (269-270 lines) ---
| **安全性** | **防范 XSS 攻击**: 渲染用户生成或来自 API 的内容时，项目始终使用 `react-markdown` (`Markdown` 组件) 或通过 Tiptap 的安全机制进行渲染，而不是直接使用 `dangerouslySetInnerHTML`。<br>**安全处理用户输入**: `components/editor/index.tsx` 中的富文本编辑器在处理粘贴内容时，通过 `handleImagePaste` 和 `transformPastedHTML` 等逻辑对输入进行过滤和转换，防止粘贴恶意的 HTML 代码。<br>**安全的外部链接**: 在所有 `target="_blank"` 的链接中，都添加了 `rel="noopener noreferrer"`，防止了潜在的 "tabnabbing" 漏洞。 |
| **可访问性 (a11y)** | **语义化 HTML**: 项目结构良好，使用了恰当的 HTML5 标签（`header`, `main`, `footer`, `section` 等）。<br>**Radix UI 基础**: 由于 UI 组件库基于 Radix UI，所有组件（如 `Dialog`, `DropdownMenu`, `Tooltip`）都内置了完善的键盘导航支持、焦点管理和 ARIA 属性，提供了坚实的可访问性基础。例如，弹窗打开时焦点会自动移入，关闭后会返回原处。 |


--- (279-279 lines) ---
| **Zod 作为多场景验证器** | Zod schema 不仅用于 React Hook Form 的表单验证 (`app/settings/tabs/general-tab.tsx`)，还在 `app/settings/dialogs/add-mcp-server-dialog.tsx` 中用于**实时验证用户输入的 JSON 配置**，为用户提供即时的、具体的错误反馈。这展示了 Zod 作为“单一事实来源”在多种场景下统一数据校验逻辑的强大能力。 |

</front_stack>

<deer_flow_frontend_code>
--- (577-581 lines) ---
    case EventType.NodeActiveVersionChanged:
      // Triggers full sync for staleness (API 6.5.2)
      // The action is async, we use void to explicitly acknowledge we are not waiting for it here.
      void store.handleNodeActiveVersionChanged(payload.data);
      break;


--- (1195-1197 lines) ---
  // Detailed staleness info for the current node view (API 5.1.1)
  staleness_report: z.array(StalenessInfoSchema).nullable(),
});


--- (1575-1577 lines) ---
  // Staleness Indicator (R5.2, V4.1)
  is_stale: z.boolean(),
});


--- (1623-1639 lines) ---
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


--- (1907-1921 lines) ---
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


--- (2927-2937 lines) ---
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


--- (3216-3255 lines) ---
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
        nodeVersionListCache: new Map(), // (Task 21)
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


--- (3354-3378 lines) ---
  /**
   * Handles version changes, triggering a full sync for staleness updates.
   * (API 6.5.2, Architecture 4.3.4 Strategy 4, Design Doc 3.1.2.C.2)
   */
  handleNodeActiveVersionChanged: async (updatedNode) => {
    // (Task 21): Invalidate the version list cache for this node, as the active status indicator in the list must be updated.
    set(
      produce((state: WorkflowSlice) => {
        state.nodeVersionListCache.delete(updatedNode.id);
      }),
    );

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


--- (3637-3661 lines) ---
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


--- (8367-8474 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/node-tree-item.tsx Content:

```tsx
"use client";

import { AlertTriangle } from "lucide-react";
// Import AnimatePresence for entry/exit animations (Design Doc 5.2.4)
import { AnimatePresence, motion } from "framer-motion";

import { NodeStatusIcon } from "~/components/platform/workflow/node-status-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { Duration, Easing } from "~/constants/motion";
import { cn } from "~/lib/utils";

interface NodeTreeItemProps {
  node: NodeInstanceRead;
  isActive: boolean;
  /**
   * Indicates if the node is beyond the execution frontier (SRS 5.2, Design Doc N3.2).
   */
  isDisabled: boolean;
  onSelect: (nodeId: number) => void;
}

/**
 * Represents a single node in the Workflow Navigator Tree.
 * Handles visualization of status, staleness, selection state, and execution frontier constraints.
 * (Design Doc 5.1.2.A)
 */
export function NodeTreeItem({
  node,
  isActive,
  isDisabled,
  onSelect,
}: NodeTreeItemProps) {
  return (
    // motion.li with layout enables smooth transitions when the structure changes (Arch Doc 7.1.2)
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: Duration.FAST, ease: Easing.STANDARD }}
    >
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) {
            onSelect(node.id);
          }
        }}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "group relative flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "h-8", // Explicit height h-8 (32px) (Design Doc 5.1.2.A2)
          "border-l-4 border-transparent",
          "hover:bg-accent/40",
          // Active State (Design Doc 5.1.2.A2): bg-accent, border-l-4 border-primary
          isActive && "border-primary bg-accent/60 text-foreground shadow-sm",
          // Disabled State (Execution Frontier) (Design Doc 5.1.2.A2): opacity-50, cursor-not-allowed
          isDisabled &&
            "cursor-not-allowed opacity-50 hover:bg-transparent focus-visible:ring-0",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {/* Status Icon (Design Doc 5.1.2.A3) */}
          <NodeStatusIcon status={node.status} />
          <span className="truncate font-medium">{node.name}</span>
        </span>

        {/* Staleness Indicator (Design Doc 5.1.2.A4, V4.1) */}
        {/* Use AnimatePresence to enable the subtle entry/exit animation */}
        <AnimatePresence>
          {node.is_stale && (
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Apply spring animation as specified in Design Doc (Lines 1691-1712) */}
                <motion.span
                  key="stale-indicator"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 20,
                  }}
                  // Use semantic color for awaiting/warning (Amber) (Design Doc 5.1.2.A4)
                  className="inline-flex items-center text-status-awaiting"
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Node output is stale.</span>
                </motion.span>
              </TooltipTrigger>
              <TooltipContent align="end">
                {/* Required tooltip content (Design Doc 5.1.2.A4) */}
                Stale: Upstream dependency has changed.
              </TooltipContent>
            </Tooltip>
          )}
        </AnimatePresence>
      </button>
    </motion.li>
  );
}
```


--- (9521-9707 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/workspace-header.tsx Content:

```tsx
"use client";

import { History, Loader2, Undo2 } from "lucide-react"; // (Task 21): Import History and Undo2 icons
import { useShallow } from "zustand/react/shallow"; // (Task 21): Import useShallow

import { NodeStatusIcon } from "~/components/platform/workflow/node-status-icon";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button"; // (Task 21): Import Button
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"; // (Task 21): Import Tooltip
import { type WorkflowStatus } from "~/constants/enums";
import type {
  NodeInstanceRead,
  StalenessInfo,
} from "~/core/models/workflow.model";
import { useStore } from "~/core/store"; // (Task 21): Import useStore
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
  // (Task 21): Access UI Interaction state (Design Doc 3.1.1.C.1)
  const { viewingVersionId, viewLatestVersion } = useStore(
    useShallow((state) => ({
      viewingVersionId: state.viewingVersionId,
      viewLatestVersion: state.viewLatestVersion,
    })),
  );

  // We are viewing history if viewingVersionId is set (regardless of whether it's the active version or not).
  const isViewingHistory = viewingVersionId !== null;

  // Determine if the Staleness Banner (B1.1) should be shown.
  // Requires node to be marked stale AND we must have the details (report) loaded.
  // (Task 21): Hide staleness banner when viewing history, as staleness relates to the latest state.
  const showStalenessBanner =
    node.is_stale && stalenessReport && stalenessReport.length > 0 && !isViewingHistory;

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
                {/* (Task 21): Hide status badge when viewing history, as the status reflects the current live state, not the historical snapshot. */}
                {!isViewingHistory && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5 text-xs font-medium"
                  >
                    {/* Show detailed stage if executing (Design Doc 3.3.C) */}
                    {node.status === "Executing"
                      ? node.current_stage
                      : node.status}
                  </Badge>
                )}

                {/* (Task 21): Historical View Indicator (Design Doc 3.1.1.C.1) */}
                {isViewingHistory && (
                  <Badge
                    variant="outline"
                    // Use Amber color scheme for prominent visual indication
                    className="flex items-center gap-1.5 text-xs font-medium border-amber-500 text-amber-700 bg-amber-50/50 dark:text-amber-500 dark:bg-amber-950/30 shadow-sm"
                  >
                    <History className="h-3.5 w-3.5" />
                    Reviewing History
                  </Badge>
                )}

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
            {/* (Task 21): Disable toolbar actions (Re-execute, Edit) when viewing history. */}
          <ContextualToolbar node={node} disabled={isViewingHistory} />

            {/* (Task 21): Action: Return to Latest Version (Improves UX) */}
            {isViewingHistory && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={viewLatestVersion}
                      className="flex items-center gap-2"
                    >
                      <Undo2 className="h-4 w-4" />
                      Return to Latest
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop reviewing history and view the latest active version.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

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


--- (9904-9961 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/staleness-banner.tsx Content:

```tsx
"use client";

import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import type { StalenessInfo } from "~/core/models/workflow.model";

interface StalenessBannerProps {
  report: StalenessInfo[];
}

/**
 * B1.1 Staleness Banner (Conditional).
 * Displayed below the main header content within B1 if the node is stale.
 * (Design Doc 5.1.3.B1.1)
 */
export function StalenessBanner({ report }: StalenessBannerProps) {
  if (!report || report.length === 0) return null;

  // Use 'warning' variant (Amber). (Design Doc 5.1.3.B1.1)
  // Full width, no rounding, border-x-0 to sit flush.
  return (
    <Alert
      variant="warning"
      className="shrink-0 rounded-none border-x-0 shadow-sm"
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-semibold">
        Warning: Upstream Data Updated (Stale Inputs)
      </AlertTitle>
      <AlertDescription className="text-sm">
        {/* Provides clear explanation of why the node is stale (Design Doc 3.3.D.2) */}
        <p>
          This node was executed using older data from upstream dependencies.
          It is highly recommended to <strong>Re-execute</strong> this node to
          incorporate the latest changes.
        </p>
        <div className="mt-2 text-xs font-medium">
          <strong>Details of Changes:</strong>
          <ul className="list-disc pl-4">
            {/* Iterate over the report to show exactly what changed (API 5.1.1 example) */}
            {report.map((item) => (
              <li key={item.upstream_node_id}>
                Node <strong>{item.upstream_definition_id}</strong> updated from V{item.consumed_version_id} to V{item.current_active_version_id ?? 'N/A'}.
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}


```


--- (12144-12163 lines) ---
  // Handle Activation interaction (Design Doc 3.1.1.C.2, Task 23.3)
  const handleActivateRequest = (version: NodeVersionRead) => {
    // Double-check restrictions before opening dialog
    if (isExecutingAction || isActivationForbidden) return;

    // Open confirmation dialog by setting the pending activation state
    setPendingActivation(version);
  };

  // Handler for confirming activation in the dialog (Task 23.4)
  const confirmActivation = async () => {
    if (pendingActivation) {
      // Call the store action (API 5.4.2). State updates rely on WebSocket (NODE_ACTIVE_VERSION_CHANGED).
      const success = await activateVersion(nodeId, pendingActivation.id);
      if (success) {
        setPendingActivation(null);
      }
      // If failed, keep dialog open so user can see potential toast error (handled in slice) and retry/cancel.
    }
  };


--- (12280-12334 lines) ---
// --- Activation Confirmation Dialog ---

interface ActivationConfirmationDialogProps {
  version: NodeVersionRead | null;
  onConfirm: () => void;
  onCancel: () => void;
  isActivating: boolean;
}

/**
 * Confirmation dialog for version activation. (Task 23.3)
 * Implements the mandatory confirmation mechanism and wording.
 * (Design Doc 3.3.D.4 / 5.1.4.C2)
 */
function ActivationConfirmationDialog({
  version,
  onConfirm,
  onCancel,
  isActivating,
}: ActivationConfirmationDialogProps) {
  if (!version) return null;

  return (
    // Control open state based on whether a version is pending activation.
    // Prevent closing dialog while activation API call is in progress.
    <AlertDialog open={!!version} onOpenChange={(open) => !open && !isActivating && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Design Doc 3.3.D.4 Title */}
          <AlertDialogTitle>
            Activate Version V{version.version_number}?
          </AlertDialogTitle>
          {/* Required text from Design Doc 3.3.D.4 Body (Emphasizing non-cascading updates and Staleness) */}
          <AlertDialogDescription>
            Activating this version will change the node&apos;s output.
            Downstream nodes will be marked as &apos;Stale&apos; and will{" "}
            <strong>NOT</strong> be automatically updated. Do you wish to
            proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Disable buttons during the API call */}
          <AlertDialogCancel disabled={isActivating}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isActivating}>
            {isActivating && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {/* Design Doc 3.3.D.4 Action Button */}
            Activate V{version.version_number}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


--- (12834-12891 lines) ---
### constants/motion.ts Content:

```ts
/**
 * Standardized animation durations (seconds) — Design Doc 4.2.1.A.
 */
export const Duration = {
  INSTANT: 0,
  X_FAST: 0.1,
  FAST: 0.2,
  MEDIUM: 0.3,
  SLOW: 0.5,
  X_SLOW: 0.8,
} as const;

/**
 * Standard easing curves (cubic-bezier arrays) — Design Doc 4.2.1.B.
 */
export const Easing = {
  STANDARD: [0.4, 0, 0.2, 1],
  ENTER: [0, 0, 0.2, 1],
  EXIT: [0.4, 0, 1, 1],
  EXPRESSIVE: [0.215, 0.61, 0.355, 1],
} as const;

/**
 * 4.2.2.C Framer Motion Variants Configuration
 */
export const Variants = {
  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: Duration.MEDIUM, ease: Easing.ENTER },
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: { duration: Duration.FAST, ease: Easing.EXIT },
    },
  },
  modalPop: {
    initial: { opacity: 0, scale: 0.96 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: Duration.MEDIUM, ease: Easing.ENTER },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: { duration: Duration.FAST, ease: Easing.EXIT },
    },
  },
} as const;

```

</deer_flow_frontend_code>

<architecture>
--- (21-22 lines) ---
2.  **明确的数据同步范式**: 严格遵守 API 6.1 原则——**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新**。在连接恢复和关键事件后执行全量同步。
3.  **关注点分离**: 采用分层架构（UI 层、状态管理层、API 服务层），实现业务逻辑与 UI 的解耦。


--- (127-127 lines) ---
│   ├── data-display/   # StatusBadge, StalenessIndicator, Timestamp


--- (282-284 lines) ---
4.  **Staleness 同步 (`handleNodeActiveVersionChanged`)**:
      * **[关键]** 此 Action 必须触发 `loadWorkflow()`，重新获取全量数据以更新所有节点的 `is_stale` 标志（遵循 API 6.5.2）。



--- (368-369 lines) ---
2.  **`NODE_ACTIVE_VERSION_CHANGED` (Staleness 更新)**: 必须触发全量同步 (`loadWorkflow`) 以刷新全局 `is_stale` 标志。
3.  **`WORKFLOW_STRUCTURE_UPDATED` (结构更新)**: 必须使用事件负载进行全量替换 `WorkflowSlice.workflowInstance`。


--- (433-435 lines) ---
  * **状态可视化**:
      * 使用 `NodeStatusIcon` 显示实时状态（颜色遵循 4.1.1.D，`Executing` 需动画）。
      * 显示 `StalenessIndicator` (⚠️) 如果 `is_stale: true`。


--- (449-449 lines) ---
  * **B1. Header (`WorkspaceHeader.tsx`)**: 固定顶部。显示标题、状态、上下文工具栏（Re-execute, Edit, Cancel）和 `StalenessBanner`。


--- (486-489 lines) ---
  * **Review**: 点击卡片，更新 `UIInteractionSlice.viewingVersionId`，Workspace (B) 加载历史版本详情。
  * **Activate**: 点击 [Set as Active Version]。
      * **[关键实现]** 弹出确认对话框，明确告知后果（非级联更新，Staleness）（设计文档 3.1.1.C.2）。
      * 调用 API，然后等待 WebSocket 事件触发全局同步（详见 5.3.4）。


--- (532-532 lines) ---
      * `Staleness`: ⚠️ 图标出现时的微妙脉冲动画。


--- (583-583 lines) ---
  * **重点**: 核心用户旅程：项目创建 -\> 工作流启动 -\> HITL 审批 -\> 版本切换 -\> Staleness 处理 -\> 重新执行。测试实时同步的正确性。

</architecture>



---

<task>


### 任务 24：过时状态（Staleness）管理与可视化

**目标：** 实现对节点过时状态（Staleness）的全面可视化和处理流程引导。

**核心关注点：** `is_stale` 标志处理、清晰的视觉传达（全局与局部）、用户引导。

**实现策略（参考 `<design_doc> 3.1.2.C.2`）：**

1.  **Staleness 同步确认：** 验证任务 9 和 23 的实现能正确在版本变更后通过全量同步刷新全局 `is_stale` 标志。
2.  **全局可视化（Navigator A）：**
    *   在 `NodeTreeItem.tsx`（任务 12）中，确保 ⚠️ `StalenessIndicator` 正确显示（Amber 色图标），并包含解释性 Tooltip。
    *   **动效增强（可选）：** 使用 Framer Motion 实现微妙的脉冲动画吸引注意（`<design_doc> 5.2.4`）。
3.  **局部可视化（Workspace B1）：**
    *   在 `WorkspaceHeader.tsx`（任务 13）中，确保 `StalenessBanner` 正确显示。文案遵循 `<design_doc> 3.3.D.2`。
4.  **详细报告展示（`<api> 5.1.1 staleness_report`）：**
    *   在 `StalenessBanner` 或 Inputs Block 中，展示 `staleness_report` 的详细信息（哪个上游节点、哪个版本发生了变化）。
5.  **用户引导：**
    *   在 `StalenessBanner` 中提供清晰的引导，建议用户点击 [Re-execute]（连接到任务 17 的 Action）。

**输入：** 任务 12, 13, 23 的输出, `<design_doc> 3.1.2.C.2, 3.3.D.2, 5.2.4`, `<api> 5.1.1`。
**输出：** 实现了全面的 Staleness 可视化和处理流程引导。


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

