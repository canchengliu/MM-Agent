<design_doc>
--- (35-51 lines) ---

用户对本平台的期望并非“自动解题器”，而是一个**高度专业化、透明且完全受控的“智能增强 (Intelligence Amplification) 环境”**。

1.  **用户主权 (User Sovereignty):**
    *   **心理模型:** “我是决策者，AI 是执行者和建议者。”
    *   用户要求对流程拥有绝对控制权。系统必须忠实执行指令，绝不能在未经许可的情况下自动推进流程或修改结果（遵循 SRS 1.1）。用户需要能够随时中断、回溯、修改和重新启动任何步骤。
2.  **系统透明度与可解释性 (Transparency):**
    *   **心理模型:** “我需要知道 AI 做了什么，以及为什么这么做。”
    *   用户需要清晰地看到 AI 执行的具体过程（Prompt、生成的代码、执行日志），以便进行验证和调试。系统必须提供清晰的溯源记录（遵循 SRS 3.2）。
3.  **精细化控制粒度 (Granular Control):**
    *   **心理模型:** “我需要能够精确地‘手术刀式’干预。”
    *   用户不满足于简单的“接受/拒绝”，需要能够直接编辑 AI 生成的中间产物（公式、代码、文本）（遵循 FRS 4）。
    *   HITL 必须提供结构化的选择（SCA）和批判机制（AVL），将 AI 的广度探索能力与人类的深度判断能力相结合。
4.  **非侵入式协助 (Non-intrusive Assistance):**
    *   **心理模型:** “告诉我状态，但不要打扰我或替我做决定。”
    *   系统应提供智能建议和状态提示（如“依赖过时 Staleness”），但绝不强制用户采取行动，保持“静默状态管理”（遵循 SRS 1.4）。



--- (113-126 lines) ---
#### 1.2.5 领域：人机协同 (HITL) 与人工干预 (Domain: HITL & Intervention)

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| H1.1 | 强制性 HITL 环节 | 每个节点执行成功后，都必须进入 HITL 环节。 | SRS 2.4 | P0 |
| H2.1 | HITL Action: 批准并前进 (Continue) | 接受结果，固化版本，并导航/执行下一个节点。 | SRS 6.1 | P0 |
| H2.2 | HITL Action: 拒绝并提供修改意见 | 提交反馈意见，触发基于新反馈的重新生成。 | SRS 6.2 | P0 |
| H2.3 | HITL Action: 丢弃本次执行 (Discard) | 彻底删除本次执行的临时产物，状态回滚。 | SRS 6.3 | P1 |
| H3.1 | SCA 模式交互实现 | 支持战略选择架构（生成候选、比较分析、用户选择）。 | HITL Modes | P0 |
| H3.2 | AVL 模式交互实现 | 支持对抗性验证循环（AI批判、人工裁决、迭代）。 | HITL Modes | P1 |
| H3.3 | VARL 模式交互实现 | 支持审查式批准/拒绝循环。 | HITL Modes | P0 |
| H4.1 | 人工编辑中间结果 | 用户能够直接修改 AI 生成的工件（文本、代码、公式等）。 | FRS 4.1 | P0 |
| H4.2 | 人工编辑版本创建 | 保存编辑后创建新版本，标记为“人工编辑”，并自动激活。 | FRS 4.3 | P0 |



--- (131-132 lines) ---
| V1.1 | 原子化版本创建 | HITL 批准时，将临时结果固化为不可变的快照版本并激活。 | SRS 3.1 | P0 |
| V1.2 | 完整上下文快照 | 版本必须包含输出、精确输入依赖ID、HITL记录和环境参数。 | SRS 3.2 | P0 |


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



--- (289-294 lines) ---
  * **TemporaryExecutionResult (临时执行结果)**
      * *定义:* 节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时产物（存储于 `NodeDetailView.pending_result`）。
      * `output_data` (object): AI 生成的当前临时输出。
      * `execution_artifacts` (object): 当前执行周期内产生的产物（详见 2.1.2）。
      * `accumulated_hitl_interactions` (array): 当前周期内累积的 HITL 记录。
      * `error_log` (string | null).


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



--- (309-318 lines) ---
##### A. 核心枚举 (Core Enumerations)

定义了系统中的关键状态和类型，是前端实现条件渲染和业务逻辑的核心依据。

  * **`NodeStatus` (生命周期主状态)**: `Not Started`, `Executing`, `Awaiting HITL Approval`, `Completed`, `Failed`, `Canceled`.
  * **`ExecutionStage` (执行详细阶段)**: `Initializing`, `Processing`, `Generating Outputs` 等。
  * **`NodeType`**: `Standard`, `Generator`.
  * **`HITLMode`**: `SCA`, `AVL`, `VARL`.
  * **`VersionSource`**: `AI_GENERATED`, `MANUALLY_EDITED`.



--- (410-418 lines) ---
      * **Block 4: HITL Interaction Zone:**
          * `Awaiting HITL Approval` 时: 激活特定的 HITL 界面（SCA/AVL/VARL）。
          * `Completed` 时: 显示该版本的 HITL 历史记录。

  * **B3. Action Footer (固定底部，条件显示):**

      * 仅在 `Awaiting HITL Approval` 状态下显示。
      * 提供主要的 HITL 操作：[Discard Execution], [Reject & Provide Feedback], [Approve & Continue]。



--- (440-467 lines) ---
#### 2.3.1 任务流 1：HITL 审批与迭代 (Task Flow: HITL Approval and Iteration)

**场景:** 一个节点（Node A）进入 `Awaiting HITL Approval` 状态。以 SCA 模式为例。

**流程:**

1.  **系统状态初始化:** Node A `status` = `Awaiting HITL Approval`。Center Workspace (B) 加载 `pending_result`。Left Navigator (A) 显示 ⏳。Right Sidebar (C) 隐藏。
2.  **UI 渲染 HITL 界面:**
      * `HITL Interaction Zone` (B2.4) 渲染 SCA 界面（候选方案列表和比较分析）。
      * `Action Footer` (B3) 出现。
3.  **用户审阅与决策:** 用户阅读分析。
      * **分支路径 A：批准 (Approve):**
        1.  用户选择满意的方案（Option X）。
        2.  用户点击 [Approve & Continue] (B3)。
        3.  **系统响应 (API):** `POST /nodes/{id}/hitl` (action: Continue, data: Option X)。
        4.  **系统处理 (后端):** 固化新版本 V1，设为 `active_version`。Node A 状态更新为 `Completed`。判断并启动下一个节点 (Node B)。
        5.  **系统响应 (API/WebSocket):** API 返回 `action: ExecuteNext`。WebSocket 推送 `NODE_STATUS_UPDATED` (A-\>Completed, B-\>Executing) 和 `NODE_ACTIVE_VERSION_CHANGED` (A)。
        6.  **UI 更新与导航:** UI 自动导航到 Node B。Left Navigator 更新状态图标。
      * **分支路径 B：拒绝并迭代 (Reject and Provide Feedback):**
        1.  用户点击 [Reject & Provide Feedback] (B3)。
        2.  UI 弹出模态框，用户输入修改意见。
        3.  用户提交反馈。
        4.  **系统响应 (API):** `POST /nodes/{id}/hitl` (action: RejectAndProvideModificationComments)。
        5.  **系统处理 (后端):** 记录反馈，触发 Node A 重新执行。Node A 状态更新为 `Executing`。
        6.  **系统响应 (WebSocket):** WebSocket 推送 `NODE_STATUS_UPDATED` (A-\>Executing)。
        7.  **UI 更新:** Center Workspace 切换到 `Executing` 视图。Action Footer (B3) 隐藏。流程返回等待状态。

#### 2.3.2 任务流 2：版本回溯、切换与下游重执行 (Task Flow: Version Switching and Downstream Re-execution)


--- (607-620 lines) ---
#### E. 人机协同 (HITL) 交互框架 (HITL Interaction Framework)

所有 HITL 模式共享统一框架。

  * **布局结构：**
    1.  **HITL Interaction Zone (B2.4):** 内嵌在 Transcript 中，根据 `hitl_mode` 渲染特定界面。
    2.  **Sticky Action Footer (B3):** 停靠在 Workspace 底部，提供全局 HITL 操作：[Discard Execution], [Reject & Provide Feedback], [Approve & Continue]。
  * **SCA (Strategic Choice) 模式：**
      * **Interaction Zone：** 使用标签页 (Tabs) 或卡片列表展示候选方案和比较分析。
      * **交互：** 用户通过 `Radio Group` 或 `Checkbox` 选择方案。[Approve] 按钮在选择后激活。
  * **AVL (Adversarial Validation) 模式：**
      * **Interaction Zone：** 以列表形式展示批判意见。
      * **交互：** 每个批判旁有 [Accept] 和 [Reject] 按钮及评论框。用户需逐项裁决后才能提交。



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



--- (860-861 lines) ---
| 丢弃当前执行尝试 | Discard Execution | Cancel attempt, Delete result |



--- (864-868 lines) ---
##### 1\. HITL 交互指令

  * **SCA:** "Review the comparative analysis of the generated candidates. Select the preferred approach to proceed."
  * **AVL:** "AI Critic has identified potential issues. Adjudicate each critique (Accept/Reject) to complete the validation."



--- (1008-1012 lines) ---
  // Awaiting HITL / Stale (Amber) - 需要注意和行动
  awaiting: {
    DEFAULT: 'hsl(45.9 95.2% 50.3%)', // Amber-500
    foreground: 'hsl(45.9 95.2% 10%)', // Dark foreground for contrast
  },


--- (1414-1422 lines) ---
##### 5\. HITL 交互面板 (HITL Interaction Panels)

  * **SCA Panel (Strategic Choice):**
      * 使用 `Tabs` 组件组织“Comparative Analysis”和“Candidates”。
      * 使用 `RadioGroup` 配合 `Card` 组件实现清晰、易于点击的方案选择器。
  * **AVL Panel (Adversarial Validation):**
      * 使用 `Accordion` 或结构化列表展示批判意见。
      * 每个项目包含裁决控件（[Accept]/[Reject] 按钮组）。界面必须清晰指示未裁决的项目状态。



--- (1508-1509 lines) ---
  * `Awaiting HITL`: `Hourglass`, `text-status-awaiting` (Amber 500)。



--- (1551-1557 lines) ---
**B3. 操作底部栏 (Action Footer - Fixed Bottom):**

  * 仅在 `Awaiting HITL Approval` 时显示。
  * 高度 `h-16` (64px)。`border-t`。背景 `bg-card`。
  * 布局：`flex justify-end space-x-4`。
  * 按钮配置：[Discard] (`ghost`), [Reject] (`secondary`), [Approve] (`primary`)。



--- (1588-1595 lines) ---
##### State: `Awaiting HITL Approval` (SCA 模式为例)

  * **Navigator (A):** 图标为 `Hourglass` (Amber)。
  * **Workspace (B):**
      * B2 Block 4 (HITL Zone): 激活 SCA 界面（`Tabs` for Analysis/Candidates, `RadioGroup`+`Card` for selection）。
      * B3 Footer: 显示。
  * **History (C):** 隐藏。



--- (1668-1682 lines) ---

**场景:** 节点从 `Executing` 转变为 `Awaiting HITL Approval`。

1.  **Workspace Content Transition (B2):**

      * 当 `pending_result` 加载完成时，Output (Block 3) 和 HITL Zone (Block 4) 应平滑出现。
      * **实现:** 使用 `Variants.fadeInUp`（参见 4.2.2.C）。
      * **参数:** `Duration.MEDIUM`.

2.  **Action Footer Transition (B3):**

      * Footer 从底部滑入。
      * **实现:** 使用 `AnimatePresence`。
      * **参数:** `initial: { opacity: 0, y: 20 }`, `animate: { opacity: 1, y: 0 }`。`Duration.FAST`, `Easing.ENTER`。


</design_doc>

<api>
--- (384-398 lines) ---
##### 成功响应 (`200 OK`)
返回 `UserSettingsRead` 对象。

```jsonc
{
  "language": "en",
  "theme": "dark",
  "hitl_profile": "Experienced",
  "thinking_depth": "Medium",
  "llm_model_name": null, // 用户未自定义，将使用系统默认
  "llm_base_url": null,   // 用户未自定义，将使用系统默认
  "has_llm_api_key": true,
  "has_e2b_api_key": false
}
```


--- (423-434 lines) ---
**可更新字段及业务含义:**

*   `language` (enum: `"en"`, `"zh"`): 应用界面语言。
*   `theme` (enum: `"light"`, `"dark"`): 应用界面主题。
*   `hitl_profile` (enum): AI 在人机交互（HITL）环节的行为偏好。
    *   `"Novice"`: AI 提供更多引导和解释。
    *   `"Experienced"`: 默认，平衡的交互。
    *   `"Expert"`: AI 交互更简洁，假设用户熟悉流程。
*   `thinking_depth` (enum): 影响 AI 生成内容的复杂度和耗时。
    *   `"Instant"`: 响应更快，可能牺牲一些深度。
    *   `"Medium"`: 性能和质量的平衡点。
    *   `"Heavy"`: 耗时更长，但生成的内容更全面、深入。


--- (485-492 lines) ---
表示用户的个性化设置信息，用于 `GET /users/me/settings` 和 `PATCH /users/me/settings` 的成功响应。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `language` | string (enum) | 应用界面语言。可选值: `"en"`, `"zh"`。 |
| `theme` | string (enum) | 应用界面主题。可选值: `"light"`, `"dark"`。 |
| `hitl_profile` | string (enum) | AI 在人机交互环节的行为偏好。可选值: `"Novice"`, `"Experienced"`, `"Expert"`。 |
| `thinking_depth`| string (enum) | AI 生成内容的复杂度。可选值: `"Instant"`, `"Medium"`, `"Heavy"`。 |


--- (847-866 lines) ---

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



--- (1201-1206 lines) ---

### 核心概念

为更好地理解本模块 API，请先熟悉以下核心概念：

*   **节点生命周期 (Node Lifecycle)**: 一个节点通常会经历 `Not Started` -> `Executing` -> `Awaiting HITL Approval` -> `Completed` 的状态流。**[新增]** `Executing` 状态可以被中断，进入 `Canceled` 状态。`retry` 或 `re-execute` 等操作会使其重新进入 `Executing` 状态。`Failed` 是一个可能的终态，但可以通过 `retry` 恢复。


--- (1235-1283 lines) ---
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



--- (1421-1467 lines) ---
### 3. 人机协同 (HITL)

此端点是人机交互的核心，用于提交用户对处于 `AWAITING_HITL_APPROVAL` 状态的节点的决策。

*   **Endpoint**: `POST /nodes/{node_id}/hitl`
*   **权限**: 节点所有者。

##### 请求体 (`HITLSubmission`)
```json
{
  "action": "Continue",
  "feedback_comment": null,
  "interaction_data": {
    "selected_ids": ["OptA"]
  }
}
```
*   `action` (string, **required**): 用户的操作类型。枚举值包括：
    *   `Continue`: 批准当前结果并继续工作流。需要提供 `interaction_data`。
    *   `RejectAndProvideModificationComments`: 拒绝当前结果，并提供反馈意见以触发新一轮执行。需要提供 `feedback_comment`。
    *   `Discard`: 丢弃本次执行尝试。状态将回滚到执行前的状态。
*   `feedback_comment` (string, *optional*): 当 `action` 为 `RejectAndProvideModificationComments` 时**必须**提供。
*   `interaction_data` (object, *optional*): 当 `action` 为 `Continue` 时**必须**提供，其结构取决于节点的 `hitl_mode`：
    *   **`hitl_mode: "SCA"` (Select Candidate/s)**: `{ "selected_ids": ["id_1", "id_2"] }`
    *   **`hitl_mode: "AVL"` (Adjudicate & Verify Loop)**: `{ "adjudication": [{ "critique_id": "c1", "decision": "Accepted", "comment": "..." }, ...] }`

##### 成功响应 (`200 OK`)
返回一个描述后续动作的对象，指导前端进行下一步操作。
```json
{
  "message": "Node approved. Starting next node 3.1.1.",
  "next_node_id": 102,
  "action": "ExecuteNext"
}
```
*   `action` 的可能值：
    *   `ExecuteNext`: 批准成功，并已自动触发下一节点执行。
    *   `NavigateNext`: 批准成功，但下一节点需要用户审阅。前端应导航至 `next_node_id`。
    *   `Completed`: 批准成功，且工作流已全部完成。
    *   `AVLLoop`: AVL 评审已提交，节点正在内部迭代。前端应等待 WebSocket 更新。
    *   `ReExecute`: 拒绝反馈已提交，节点将重新执行。前端应等待 WebSocket 更新。
    *   `Discarded`: 执行已丢弃，状态已回滚。前端应重新获取节点信息。

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): 节点不处于 `AWAITING_HITL_APPROVAL` 状态。
*   `400 Bad Request`: `interaction_data` 或 `feedback_comment` 不符合要求。



--- (1524-1533 lines) ---
### 典型交互序列示例：成功执行一个节点

1.  **用户操作**: 在 UI 上点击“执行”。
2.  **前端**: 调用 `POST /nodes/{node_id}/re-execute` (或相关执行API)。
3.  **API 响应**: 立即返回 `202 Accepted`。
4.  **前端**: **立即**禁用执行按钮，UI 显示“执行中...”。
5.  **WebSocket**: 前端监听到 `NODE_STATUS_UPDATED` 事件，`status` 变为 `Executing`。UI 可根据 `current_stage` 更新进度。
6.  **WebSocket**: 执行完成，前端收到 `NODE_STATUS_UPDATED` 事件，`status` 变为 `Awaiting HITL Approval`。
7.  **前端**: 调用 `GET /nodes/{node_id}` 获取 `pending_result`，并使用其数据渲染 HITL 审批界面。



--- (1571-1581 lines) ---
#### 5.3. TemporaryExecutionRead

表示节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时结果。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `output_data` | object \| null | AI 或执行引擎生成的当前临时输出。 |
| **`execution_artifacts`** | **object \| null** | **[新增]** 在当前执行周期内产生的关键产物。结构与 `NodeVersionRead` 中的 `execution_artifacts` 类似。 |
| `accumulated_hitl_interactions` | array (object) | 在当前执行周期内累积的人机交互记录。 |
| `error_log` | string \| null | 如果执行失败，这里会包含详细的错误信息和堆栈跟踪。 |



--- (1680-1689 lines) ---
#### 5.1. `NODE_STATUS_UPDATED` (高频)

*   **描述**: 工作流中单个节点的状态发生变化。这是构建动态 UI 的核心事件。
*   **`data` 负载**: `NodeInstanceRead` 对象 (节点的**完整**最新数据，**包含 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **状态变更**: 根据 `status` (现在包括 `Canceled`) 和 `current_stage` 更新节点的视觉表现。
    *   **交互锁定**: 当 `status` 变为 `Executing` 时，应禁用该节点上的所有操作按钮（如"执行"、"批准"），并显示加载指示器。
    *   **交互解锁**: 当 `status` 变为 `Awaiting HITL Approval`, `Failed`, 或 `Canceled` 时，应解锁对应的 HITL 操作按钮（如"批准/拒绝"或"重试"）。
    *   **数据刷新**: 如果用户正在查看该节点的详细视图，应使用事件 `data` 中的信息刷新视图内容。



--- (1929-1943 lines) ---
#### **4. 节点生命周期与状态机**

*   **4.1. 节点状态:**
    *   `未开始 (Not Started)`
    *   `执行中 (Executing)`
    *   `等待HITL批准 (Awaiting HITL Approval)`
    *   `已完成 (Completed)`
    *   `执行失败 (Failed)`
    *   `已取消 (Canceled)`: 节点的执行被人为请求中止。

*   **4.2. 状态转换规则:**
    *   `执行中` -> `已取消`: 当用户请求取消任务，且后台工作进程成功中止执行时。此过程不产生任何新版本。
    *   `等待HITL批准` / `执行失败` / `已取消` -> `已完成` (或 `未开始`): 当用户点击"丢弃本次执行"。
    *   `执行失败` / `已取消` -> `执行中`: 当用户点击"重试"并提交。



--- (1946-1959 lines) ---
### 功能需求规格 (FRS) - 用户设置面板

#### **7. 用户设置面板 (User Settings Panel)**

*   **7.4 人机交互行为 (HITL Behavior)**
    *   **用户等级 (User Level / HITL Profile)**: 用户选择一个预设等级（例如："新手 Novice"、"熟练 Experienced"、"专家 Expert"）。
    *   **配置映射 (Configuration Mapping)**: 该等级决定了新工作流的默认 HITL 配置。不同的等级对应不同的 HITL 模式（AVL、SCA、VARL）干预策略。
    *   **[实施细则与澄清]:** 依据 SRS 中"严格线性执行流程 (2.2)"和"强制性人机交互 (2.4)"的定义，HITL Profile **不会**改变工作流的结构或跳过 HITL 环节。相反，它影响的是 HITL 环节内部的 AI 行为。例如，在对抗性验证循环 (AVL) 中，专家等级会导致 AI 生成更少或更低严重性的批判（体现出更高的自动化信任度），而新手等级则会导致 AI 生成更严格、更多样化的批判以提供更多指导。

*   **7.5 思考深度 (Thinking Depth)**
    *   影响 AI 生成内容的复杂度和耗时。
    *   可选值包括："即时 (Instant)"、"中等 (Medium)"、"深度 (Heavy)"。

---

</api>

<front_stack>
--- (18-25 lines) ---
### 二、 状态管理

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |



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



--- (83-90 lines) ---
### 七、 表单处理与数据校验

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **React Hook Form** | 用于管理设置页面 (`settings`) 的表单状态、校验和提交。 |
| **Zod** | 一个 TypeScript-first 的 schema 声明和校验库，用于定义表单数据结构和验证规则。 |
| **`@hookform/resolvers`** | 用于将 Zod schema 与 React Hook Form 集成，实现无缝的表单验证。 |



--- (104-110 lines) ---

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Lucide React** | 一套简洁、一致的开源图标库，是项目图标的主要来源。 |
| **Ant Design Icons** | 来自 Ant Design 的图标库，补充了部分特定图标。 |
| **Radix UI Icons** | 来自 Radix UI 的图标库，补充了部分特定图标。 |



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



--- (263-271 lines) ---
### 二十一、 安全性与可访问性

项目遵循了前端安全和可访问性的基本原则。

| 领域 | 实践与价值 |
| :--- | :--- |
| **安全性** | **防范 XSS 攻击**: 渲染用户生成或来自 API 的内容时，项目始终使用 `react-markdown` (`Markdown` 组件) 或通过 Tiptap 的安全机制进行渲染，而不是直接使用 `dangerouslySetInnerHTML`。<br>**安全处理用户输入**: `components/editor/index.tsx` 中的富文本编辑器在处理粘贴内容时，通过 `handleImagePaste` 和 `transformPastedHTML` 等逻辑对输入进行过滤和转换，防止粘贴恶意的 HTML 代码。<br>**安全的外部链接**: 在所有 `target="_blank"` 的链接中，都添加了 `rel="noopener noreferrer"`，防止了潜在的 "tabnabbing" 漏洞。 |
| **可访问性 (a11y)** | **语义化 HTML**: 项目结构良好，使用了恰当的 HTML5 标签（`header`, `main`, `footer`, `section` 等）。<br>**Radix UI 基础**: 由于 UI 组件库基于 Radix UI，所有组件（如 `Dialog`, `DropdownMenu`, `Tooltip`）都内置了完善的键盘导航支持、焦点管理和 ARIA 属性，提供了坚实的可访问性基础。例如，弹窗打开时焦点会自动移入，关闭后会返回原处。 |



--- (272-281 lines) ---
### 二十二、 精巧的实现细节与模式

一些小而美的代码片段和模式，体现了项目在细节上的考究。

| 细节/模式 | 描述与复用价值 |
| :--- | :--- |
| **Pragmatic Bug Fix** | `app/layout.tsx` 中注入的全局 `window.isSpace` 函数是一个非常务实的解决方案。注释明确指出这是为了修复 `markdown-it` 在 Next.js + Turbopack 环境下的一个特定 bug。这展示了在面对第三方库兼容性问题时，如何通过最小的侵入性“打补丁”来解决问题，而不是等待上游修复。 |
| **Zod 作为多场景验证器** | Zod schema 不仅用于 React Hook Form 的表单验证 (`app/settings/tabs/general-tab.tsx`)，还在 `app/settings/dialogs/add-mcp-server-dialog.tsx` 中用于**实时验证用户输入的 JSON 配置**，为用户提供即时的、具体的错误反馈。这展示了 Zod 作为“单一事实来源”在多种场景下统一数据校验逻辑的强大能力。 |
| **可扩展的数据-视图映射** | 在落地页的多个部分（如 `CaseStudySection` 和 `CoreFeatureSection`），UI 的生成是通过**将数据数组映射到 UI 组件**来完成的。例如，`caseStudyIcons` 数组将案例的 ID 与其对应的 Lucide 图标关联起来。这种模式使得添加、删除或修改一个案例或功能特性，只需修改数据数组，而无需触碰渲染逻辑，符合“开放-封闭原则”。 |
| **类型定义文件** | `typings/md.d.ts` 的存在，虽然简单，但它代表了一个良好的工程实践：为项目中非标准的导入（如 `.md` 文件）提供明确的 TypeScript 类型定义，从而在整个项目中享受类型检查带来的好处。 |

</front_stack>

<deer_flow_frontend_code>
--- (10219-10307 lines) ---
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


--- (1137-1247 lines) ---
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


--- (1408-1446 lines) ---
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



--- (1885-1914 lines) ---
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



--- (2979-3514 lines) ---
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
```


--- (3516-3673 lines) ---
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



--- (8069-8181 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/action-footer.tsx Content:

```tsx
"use client";

import { useShallow } from "zustand/react/shallow";
import { Save, X, Check, MessageSquare, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { useStore } from "~/core/store";

interface ActionFooterProps {
  // We can use NodeInstanceRead as status and ID are sufficient for the footer logic.
  node: NodeInstanceRead;
}

/**
 * B3. Action Footer (Fixed Bottom, Conditional Visibility)
 * Provides primary actions for HITL Approval or Manual Editing mode.
 * (Design Doc 5.1.3.B3)
 */
export function ActionFooter({ node }: ActionFooterProps) {
  const { isEditing, stopEditing, isExecutingAction } = useStore(
    useShallow((state) => ({
      // Check if we are editing THIS specific node
      isEditing: state.isEditing && state.activeNodeId === node.id,
      stopEditing: state.stopEditing,
      isExecutingAction: state.isExecutingAction,
    })),
  );

  const isAwaitingHITL = node.status === "Awaiting HITL Approval";

  // Design Doc 3.1.1.B (Dynamic Behavior): Footer visible in HITL or Editing Mode.
  if (!isAwaitingHITL && !isEditing) {
    return null;
  }

  // Styling: h-16 (64px), border-t, bg-card. (Design Doc 5.1.3.B3)
  return (
    <footer className="flex h-16 shrink-0 items-center justify-between border-t bg-card px-6">
      {/* State: Manual Editing Mode (Design Doc 3.1.1.B) */}
      {isEditing ? (
        <>
          <div className="text-sm font-medium text-muted-foreground">
            Editing Mode
          </div>
          {/* Layout: flex justify-end space-x-4. */}
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              onClick={stopEditing}
              disabled={isExecutingAction}
            >
              <X className="h-4 w-4" />
              Cancel Edit
            </Button>
            {/* Placeholder for Save action (Implementation in later task) */}
            <Button
              variant="default"
              disabled={isExecutingAction}
              onClick={() => console.log("Save New Version clicked (Placeholder)")}
            >
              <Save className="h-4 w-4" />
              Save New Version
            </Button>
          </div>
        </>
      ) : (
        /* State: Awaiting HITL Approval */
        <>
          <div>
            {/* Secondary Actions: [Discard] (ghost) */}
            {/* Placeholder for Discard action (Implementation in later task) */}
            <Button
              variant="ghost"
              disabled={isExecutingAction}
              onClick={() => console.log("Discard clicked (Placeholder)")}
            >
                <Trash2 className="h-4 w-4" />
              Discard Execution
            </Button>
          </div>
          <div className="flex space-x-4">
            {/* Primary Actions: [Reject] (secondary), [Approve] (primary) */}
            {/* Placeholder for Reject action (Implementation in later task) */}
            <Button
              variant="secondary"
              disabled={isExecutingAction}
              onClick={() => console.log("Reject clicked (Placeholder)")}
            >
                <MessageSquare className="h-4 w-4" />
              Reject & Provide Feedback
            </Button>
            {/* Placeholder for Approve action (Implementation in later task) */}
            <Button
              variant="default"
              disabled={isExecutingAction}
              onClick={() => console.log("Approve clicked (Placeholder)")}
            >
                <Check className="h-4 w-4" />
              Approve & Continue
            </Button>
          </div>
        </>
      )}
    </footer>
  );
}


```


--- (8652-8711 lines) ---
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


--- (9206-9322 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/blocks/hitl-zone-block.tsx Content:

```tsx
"use client";

import { Handshake, HistoryIcon } from "lucide-react";

import type { NodeDetailView, NodeVersionRead } from "~/core/models/node.model";
import type { TranscriptData } from "../useTranscriptData";
import { TranscriptBlock } from "./transcript-block";
import { NodeStatus } from "~/constants/enums";
import { CodeViewer } from "~/components/editors/CodeViewer";

interface HITLZoneBlockProps {
  node: NodeDetailView;
  dataSource: TranscriptData;
}

/**
 * Block 4: HITL Interaction Zone.
 * Displays the active HITL interface (SCA/AVL/VARL) or the HITL history.
 * (Design Doc 3.1.3.B2 Block 4)
 */
export function HITLZoneBlock({ node, dataSource }: HITLZoneBlockProps) {

  // Determine the mode of the HITL Zone
  // Active Interaction: Status is Awaiting HITL AND we are viewing the latest state (not historical)
  const isAwaitingHITL = node.status === NodeStatus.AwaitingHITLApproval && !dataSource.isHistorical;

  // History Review: We are viewing a finalized version (not pending).
  const isHistoryReview = !dataSource.isPending;

  // Extract HITL history (only available in NodeVersionRead)
  const hitlHistory = (isHistoryReview && dataSource.data)
    ? (dataSource.data as NodeVersionRead).hitl_history
    : null;

  const hasHistory = hitlHistory && hitlHistory.length > 0;

  // Extract accumulated interactions (only available in TemporaryExecutionRead during HITL cycles)
  const accumulatedInteractions = (dataSource.isPending && dataSource.data)
    ? dataSource.data.accumulated_hitl_interactions
    : null;

  const hasAccumulated = accumulatedInteractions && accumulatedInteractions.length > 0;

  return (
    // Design Doc 2.4.B: HITL Zone default expanded (managed by UIInteractionSlice defaults)
    <TranscriptBlock blockKey="hitl_zone" title="Human-in-the-Loop (HITL) Zone">

      {isAwaitingHITL ? (
        // --- Active Interaction Placeholder ---
        <div className="space-y-6">
            <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                    <Handshake className="h-6 w-6 text-primary" />
                    <div>
                        <p className="font-semibold">B4: Active HITL Interaction Placeholder</p>
                        <p>Mode: {node.hitl_mode}. The specialized interface will load here (Task 18).</p>
                        <p>Use the Action Footer (B3) below to submit your decision.</p>
                    </div>
                </div>
            </div>
            {hasAccumulated && (
                <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                        <HistoryIcon className="h-4 w-4"/>
                        Accumulated Interactions (This Session)
                    </h4>
                    {/* Display accumulated interactions using CodeViewer for structure */}
                     <div className="h-48">
                        <CodeViewer
                            code={JSON.stringify(accumulatedInteractions, null, 2)}
                            language="json"
                            fileName="accumulated_interactions.json"
                        />
                    </div>
                </div>
            )}
        </div>

      ) : isHistoryReview ? (
        // --- History Review ---
        <div>
             <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                <HistoryIcon className="h-4 w-4"/>
                Interaction History
            </h4>
            {hasHistory ? (
                // Display history using CodeViewer for structure
                <div className="h-64">
                    <CodeViewer
                        code={JSON.stringify(hitlHistory, null, 2)}
                        language="json"
                        fileName="hitl_history.json"
                    />
                </div>
            ) : (
                <div className="text-sm text-muted-foreground italic p-4 border rounded-lg bg-muted/50">
                    No human interactions were recorded for this version.
                </div>
            )}
        </div>

      ) : (
        // --- Pending/Executing State ---
        <div className="text-sm text-muted-foreground italic p-4 border rounded-lg bg-muted/50">
             HITL interactions are not available while the node is executing.
        </div>
      )}

    </TranscriptBlock>
  );
}


```


--- (8495-8650 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/node-workspace.tsx Content:

```tsx
"use client";

import { useEffect } from "react";
import { Loader2, Workflow } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { ScrollArea } from "~/components/ui/scroll-area";
import { useStore } from "~/core/store";
import { WorkspaceHeader } from "./workspace-header";
import { type WorkflowStatus } from "~/constants/enums";
import { InteractionTranscript } from "./interaction-transcript";
import { ActionFooter } from "./action-footer";
import { useTranscriptData } from "./useTranscriptData";

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


--- (8183-8287 lines) ---
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


--- (11986-12125 lines) ---
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

```


--- (10763-10898 lines) ---
### components/ui/alert-dialog.tsx Content:

```tsx
"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 sm:gap-0",
      className,
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};



--- (12208-12274 lines) ---
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


--- (12807-12829 lines) ---
### components/ui/textarea.tsx Content:

```tsx
import * as React from "react"

import { cn } from "~/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

```


--- (12883-13054 lines) ---
### components/ui/form.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "~/lib/utils"
import { Label } from "~/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}

```

</deer_flow_frontend_code>

<architecture>
--- (13-16 lines) ---
1.  **复杂状态同步与实时性**: 精确管理工作流结构、节点状态、版本信息和实时执行进度，确保数据一致性。
2.  **高信息密度与清晰度**: 实现灵活的三栏式“驾驶舱”布局，清晰展示大量复杂信息（代码、日志、公式）。
3.  **精细化控制与复杂交互**: 支持多种人机协同 (HITL) 模式和精细的用户干预（版本切换、人工编辑）。
4.  **动态性与流畅性**: 平滑处理工作流结构的动态变化，提供即时的交互反馈和高性能的动效。


--- (136-138 lines) ---
└── /hitl/              # HITL 交互模式组件
    ├── SCAPanel.tsx
    └── AVLPanel.tsx


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



--- (525-533 lines) ---
1.  **布局动画 (Layout Animations)**:
      * **应用场景**: Workflow Navigator (A) 处理动态结构更新。
      * **实现**: 使用 `motion.li`, `layout` 属性和 `AnimatePresence` 实现节点的平滑插入和移动（设计文档 5.2.1）。
2.  **微交互**: 按钮点击反馈 (`whileTap={{ scale: 0.98 }}`)。
3.  **转场动画**: 模态框（`modalPop` variant）、HITL 内容加载（`fadeInUp` variant）。
4.  **状态指示**:
      * `Executing`: `animate-spin` 和可选的 `BorderBeam` 动画。
      * `Staleness`: ⚠️ 图标出现时的微妙脉冲动画。



--- (545-551 lines) ---
### 9.2 错误处理与反馈 (Error Handling and Feedback)

  * **反馈机制**: 统一使用 Toast (Sonner), Banner (Alert), AlertDialog 进行反馈（设计文档 3.1.2）。
  * **API 错误**: 在 API Client 拦截器中全局处理通用错误（401, 403, 5xx）。在业务逻辑中处理特定错误（409, 422）。
  * **WebSocket 错误**: 实现连接状态反馈（横幅）和重连逻辑。
  * **Error Boundaries**: 使用 React Error Boundaries 包裹关键组件，防止局部崩溃。



--- (581-584 lines) ---

  * **工具**: Playwright / Cypress。
  * **重点**: 核心用户旅程：项目创建 -\> 工作流启动 -\> HITL 审批 -\> 版本切换 -\> Staleness 处理 -\> 重新执行。测试实时同步的正确性。


</architecture>



---

<task>


### 任务 18：HITL 框架与基础流程实现（VARL & Action Footer）

**目标：** 搭建人机协同 (HITL) 交互框架，实现 Action Footer (B3)，并完成基础的 VARL 模式流程（批准/拒绝/丢弃）。

**核心关注点：** HITL 交互流程、API 集成（submitHITL）、动态 UI 渲染、工作流推进逻辑。

**实现策略（参考 `<design_doc> 3.1.1.E, 5.1.3.B3`, `<api> 5.3`）：**

1.  **WorkflowSlice 扩展：** 实现 `submitHITL` Action。
2.  **Action Footer (B3) 实现（`ActionFooter.tsx`）：**
    *   实现固定底部的操作栏。实现 [Discard Execution], [Reject & Provide Feedback], [Approve & Continue] 按钮。
    *   确保仅在 `Awaiting HITL Approval` 状态下显示。
3.  **HITL Interaction Zone (B2.4) 实现：**
    *   在 `InteractionTranscript.tsx` 中实现动态渲染逻辑，根据 `hitl_mode` 选择对应的 Panel。
    *   实现 `VARLPanel.tsx`（基础模式，内容通常简单或为空）。
4.  **交互逻辑实现：**
    *   **Approve (Continue)：** 调用 `submitHITL` (action: Continue)。
    *   **Reject：** 弹出模态框收集反馈意见，调用 `submitHITL` (action: RejectAndProvideModificationComments)。
    *   **Discard：** 调用 `submitHITL` (action: Discard)。
5.  **响应处理与导航（关键实现）：**
    *   处理 `submitHITL` 的响应（`<api> 5.3 成功响应`）。
    *   根据返回的 `action`（如 `ExecuteNext`, `ReExecute`, `Completed`）指导前端导航到下一节点或更新当前节点状态。

**输入：** 任务 17 的输出, `<api> 5.3`, `<design_doc> 3.1.1.E, 5.1.3.B3`。
**输出：** 实现了 HITL 通用交互框架和基础的批准/拒绝/丢弃流程。


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

