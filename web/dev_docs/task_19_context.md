<design_doc>
--- (45-47 lines) ---
    *   **心理模型:** “我需要能够精确地‘手术刀式’干预。”
    *   用户不满足于简单的“接受/拒绝”，需要能够直接编辑 AI 生成的中间产物（公式、代码、文本）（遵循 FRS 4）。
    *   HITL 必须提供结构化的选择（SCA）和批判机制（AVL），将 AI 的广度探索能力与人类的深度判断能力相结合。


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



--- (281-282 lines) ---
          * `node_type` (enum: Standard, Generator). **(前端关键：用于控制“重新执行/编辑”的可用性)**。
          * `hitl_mode` (enum: VARL, SCA, AVL). **(前端关键：决定 HITL 界面的渲染逻辑)**。


--- (289-294 lines) ---
  * **TemporaryExecutionResult (临时执行结果)**
      * *定义:* 节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时产物（存储于 `NodeDetailView.pending_result`）。
      * `output_data` (object): AI 生成的当前临时输出。
      * `execution_artifacts` (object): 当前执行周期内产生的产物（详见 2.1.2）。
      * `accumulated_hitl_interactions` (array): 当前周期内累积的 HITL 记录。
      * `error_log` (string | null).


--- (316-316 lines) ---
  * **`HITLMode`**: `SCA`, `AVL`, `VARL`.


--- (410-418 lines) ---
      * **Block 4: HITL Interaction Zone:**
          * `Awaiting HITL Approval` 时: 激活特定的 HITL 界面（SCA/AVL/VARL）。
          * `Completed` 时: 显示该版本的 HITL 历史记录。

  * **B3. Action Footer (固定底部，条件显示):**

      * 仅在 `Awaiting HITL Approval` 状态下显示。
      * 提供主要的 HITL 操作：[Discard Execution], [Reject & Provide Feedback], [Approve & Continue]。



--- (440-466 lines) ---
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



--- (782-782 lines) ---
|   +-- [Block 4: HITL Interaction Zone] (Dynamic Content, Default Expanded)


--- (784-787 lines) ---
+-- [B3. Action Footer] (Fixed Bottom, Conditional Visibility)
    |-- [Secondary Actions] (e.g., Discard)
    |-- [Primary Actions] (e.g., Reject, Approve)
```


--- (791-794 lines) ---
  * **`Awaiting HITL Approval`:**
      * B1 Toolbar: 隐藏。
      * B2 Block 4: 激活 HITL 交互界面（如 SCA 选择器）。
      * B3 Footer: 显示。


--- (864-868 lines) ---
##### 1\. HITL 交互指令

  * **SCA:** "Review the comparative analysis of the generated candidates. Select the preferred approach to proceed."
  * **AVL:** "AI Critic has identified potential issues. Adjudicate each critique (Accept/Reject) to complete the validation."



--- (1414-1422 lines) ---
##### 5\. HITL 交互面板 (HITL Interaction Panels)

  * **SCA Panel (Strategic Choice):**
      * 使用 `Tabs` 组件组织“Comparative Analysis”和“Candidates”。
      * 使用 `RadioGroup` 配合 `Card` 组件实现清晰、易于点击的方案选择器。
  * **AVL Panel (Adversarial Validation):**
      * 使用 `Accordion` 或结构化列表展示批判意见。
      * 每个项目包含裁决控件（[Accept]/[Reject] 按钮组）。界面必须清晰指示未裁决的项目状态。



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



--- (1784-1784 lines) ---
      * **HITL Panels (SCA/AVL):** 实现规范见 4.3.B.5。

</design_doc>

<api>
--- (427-431 lines) ---
*   `hitl_profile` (enum): AI 在人机交互（HITL）环节的行为偏好。
    *   `"Novice"`: AI 提供更多引导和解释。
    *   `"Experienced"`: 默认，平衡的交互。
    *   `"Expert"`: AI 交互更简洁，假设用户熟悉流程。
*   `thinking_depth` (enum): 影响 AI 生成内容的复杂度和耗时。


--- (491-491 lines) ---
| `hitl_profile` | string (enum) | AI 在人机交互环节的行为偏好。可选值: `"Novice"`, `"Experienced"`, `"Expert"`。 |


--- (855-858 lines) ---
| `status` | string (enum) | 节点的当前执行状态。可选值: `"Not Started"`, `"Executing"`, `"Awaiting HITL Approval"`, `"Completed"`, `"Failed"`, `"Canceled"`。**[新增]** `Canceled` 状态表示执行被用户取消。 |
| `current_stage` | string (enum) | 节点更详细的执行阶段。可选值: `"Not Started"`, `"Initializing"`, `"Processing"`, `"Generating Outputs"`, `"Awaiting Review"`, `"Completed"`, `"Failed"`。 |
| `node_type` | string (enum) | 节点的类型。可选值: `"Standard"`, `"Generator"`。 |
| `hitl_mode` | string (enum) | 节点的人机交互模式。可选值: `"VARL"`, `"SCA"`, `"AVL"`。 |


--- (1202-1210 lines) ---
### 核心概念

为更好地理解本模块 API，请先熟悉以下核心概念：

*   **节点生命周期 (Node Lifecycle)**: 一个节点通常会经历 `Not Started` -> `Executing` -> `Awaiting HITL Approval` -> `Completed` 的状态流。**[新增]** `Executing` 状态可以被中断，进入 `Canceled` 状态。`retry` 或 `re-execute` 等操作会使其重新进入 `Executing` 状态。`Failed` 是一个可能的终态，但可以通过 `retry` 恢复。
*   **版本 (Version)**: 每次节点成功执行并被用户批准后，其结果（输入、输出、交互历史）都会被固化为一个“版本”。`active_version` 代表该节点当前对外提供的“官方”结果。
*   **执行前沿 (Execution Frontier)**: 指工作流中已执行或正在执行的最后一个节点的序号。为保证流程的顺序性，用户不能“跳级”操作前沿之外的节点。
*   **过时状态 (Staleness)**: 当一个节点的上游依赖节点更新了其 `active_version` 后，该节点就处于“过时”状态。这是 **UI 提示** 的关键数据，应在界面上明确标记该节点，并建议用户“重新执行以同步最新上游数据”。



--- (1235-1282 lines) ---
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



--- (1571-1577 lines) ---
#### 5.3. TemporaryExecutionRead

表示节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时结果。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `output_data` | object \| null | AI 或执行引擎生成的当前临时输出。 |


--- (1687-1687 lines) ---
    *   **交互解锁**: 当 `status` 变为 `Awaiting HITL Approval`, `Failed`, 或 `Canceled` 时，应解锁对应的 HITL 操作按钮（如"批准/拒绝"或"重试"）。


--- (1931-1937 lines) ---
*   **4.1. 节点状态:**
    *   `未开始 (Not Started)`
    *   `执行中 (Executing)`
    *   `等待HITL批准 (Awaiting HITL Approval)`
    *   `已完成 (Completed)`
    *   `执行失败 (Failed)`
    *   `已取消 (Canceled)`: 节点的执行被人为请求中止。


--- (1950-1953 lines) ---
*   **7.4 人机交互行为 (HITL Behavior)**
    *   **用户等级 (User Level / HITL Profile)**: 用户选择一个预设等级（例如："新手 Novice"、"熟练 Experienced"、"专家 Expert"）。
    *   **配置映射 (Configuration Mapping)**: 该等级决定了新工作流的默认 HITL 配置。不同的等级对应不同的 HITL 模式（AVL、SCA、VARL）干预策略。
    *   **[实施细则与澄清]:** 依据 SRS 中"严格线性执行流程 (2.2)"和"强制性人机交互 (2.4)"的定义，HITL Profile **不会**改变工作流的结构或跳过 HITL 环节。相反，它影响的是 HITL 环节内部的 AI 行为。例如，在对抗性验证循环 (AVL) 中，专家等级会导致 AI 生成更少或更低严重性的批判（体现出更高的自动化信任度），而新手等级则会导致 AI 生成更严格、更多样化的批判以提供更多指导。

</api>

<front_stack>
--- (47-50 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |


--- (73-79 lines) ---
| **React Markdown** | 用于在非编辑区域（如聊天消息）安全地渲染 Markdown 内容。 |
| **Remark / Rehype** | Markdown AST (抽象语法树) 生态系统，用于处理和转换 Markdown。 |
| | ↳ `remark-gfm` | 支持 GitHub Flavored Markdown (表格、删除线等)。 |
| | ↳ `remark-math` | 支持 Markdown 中的数学公式语法。 |
| | ↳ `rehype-katex` | 将数学公式 AST 渲染为 HTML。 |
| | ↳ **`unist-util-visit`** | 用于遍历和操作 AST 的核心工具，是编写自定义 Rehype 插件的基础。 |
| **KaTeX** | 用于在 Web 上高性能地排版和渲染数学公式。 |


--- (83-89 lines) ---
### 七、 表单处理与数据校验

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **React Hook Form** | 用于管理设置页面 (`settings`) 的表单状态、校验和提交。 |
| **Zod** | 一个 TypeScript-first 的 schema 声明和校验库，用于定义表单数据结构和验证规则。 |
| **`@hookform/resolvers`** | 用于将 Zod schema 与 React Hook Form 集成，实现无缝的表单验证。 |


--- (146-146 lines) ---
| **`ResearchBlock`** | 一个集成了标签页 (`Tabs`) 的复合视图组件。它允许用户在“研究报告”和“活动流”之间切换，同时在组件顶部提供了上下文相关的操作按钮（如编辑、复制、下载），是构建复杂信息面板的优秀参考。 |


--- (217-217 lines) ---
| **`cn` 工具函数** | `lib/utils.ts` 中的 `cn` 函数是整个项目的标准实践。它结合了 `clsx` 和 `tailwind-merge`，解决了在 React 组件中动态、条件性地组合 Tailwind 类名时的所有痛点（如条件判断、样式覆盖冲突），是现代 Tailwind 项目的必备工具。 |


--- (279-279 lines) ---
| **Zod 作为多场景验证器** | Zod schema 不仅用于 React Hook Form 的表单验证 (`app/settings/tabs/general-tab.tsx`)，还在 `app/settings/dialogs/add-mcp-server-dialog.tsx` 中用于**实时验证用户输入的 JSON 配置**，为用户提供即时的、具体的错误反馈。这展示了 Zod 作为“单一事实来源”在多种场景下统一数据校验逻辑的强大能力。 |


--- (280-280 lines) ---
| **可扩展的数据-视图映射** | 在落地页的多个部分（如 `CaseStudySection` 和 `CoreFeatureSection`），UI 的生成是通过**将数据数组映射到 UI 组件**来完成的。例如，`caseStudyIcons` 数组将案例的 ID 与其对应的 Lucide 图标关联起来。这种模式使得添加、删除或修改一个案例或功能特性，只需修改数据数组，而无需触碰渲染逻辑，符合“开放-封闭原则”。 |

</front_stack>

<deer_flow_frontend_code>
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


--- (1525-1567 lines) ---
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



--- (1750-1993 lines) ---
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


--- (2979-3529 lines) ---
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


--- (8084-8267 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/action-footer.tsx Content:

```tsx
"use client";

import React from "react";
import { useShallow } from "zustand/react/shallow";
import { Save, X, Check, MessageSquare, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "~/components/ui/button";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { useStore } from "~/core/store";
import { HITLInteractionContext, type HITLInteractionContextType } from "../../hitl/hitl-interaction-manager";
import { NodeStatus } from "~/constants/enums";

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
  const { isEditing, stopEditing, isExecutingAction, viewingVersionId } = useStore(
    useShallow((state) => ({
      // Check if we are editing THIS specific node
      isEditing: state.isEditing && state.activeNodeId === node.id,
      stopEditing: state.stopEditing,
      // isExecutingAction tracks API requests from the store (e.g. Manual Edit save)
      isExecutingAction: state.isExecutingAction,
      viewingVersionId: state.viewingVersionId,
    })),
  );

  const isAwaitingHITL = node.status === NodeStatus.AwaitingHITLApproval;
  // HITL interactions are only allowed when viewing the latest state (not historical).
  const isViewingHistory = viewingVersionId !== null;

  // Footer visible in HITL (latest view only) or Editing Mode. (Design Doc 3.1.1.B)
  const showFooter = (isAwaitingHITL && !isViewingHistory) || isEditing;

  // Use HITLInteractionContext if available (provided by HITLInteractionManager when Awaiting HITL)
  // This context manages the state and actions for the HITL process.
  const hitlContext = React.useContext(HITLInteractionContext);

  // Design Doc 5.2.3.2: Action Footer Transition (B3)
  return (
    <AnimatePresence>
      {showFooter && (
        <motion.footer
          // Animation parameters: initial, animate, exit. Duration.FAST (0.2s), Easing.ENTER
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }} // "easeOut" often corresponds to Easing.ENTER
          // Styling: h-16 (64px), border-t, bg-card. (Design Doc 5.1.3.B3)
          className="flex h-16 shrink-0 items-center justify-between border-t bg-card px-6"
        >
          {isEditing ? (
            <EditingFooterActions
              stopEditing={stopEditing}
              isExecutingAction={isExecutingAction}
            />
          ) : (
            <HITLFooterActions
              hitlContext={hitlContext}
              // For HITL actions, we rely primarily on the context's isSubmitting state,
              // but also respect the global isExecutingAction as a fallback/safety measure.
              isGloballyExecuting={isExecutingAction}
            />
          )}
        </motion.footer>
      )}
    </AnimatePresence>
  );
}

// --- Helper Components for Actions ---

interface EditingFooterActionsProps {
  stopEditing: () => void;
  isExecutingAction: boolean;
}

// State: Manual Editing Mode (Design Doc 3.1.1.B)
function EditingFooterActions({ stopEditing, isExecutingAction }: EditingFooterActionsProps) {
  return (
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
        {/* Placeholder for Save action (Implementation in future task) */}
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
  );
}

interface HITLFooterActionsProps {
  hitlContext: HITLInteractionContextType | null;
  isGloballyExecuting: boolean;
}

// State: Awaiting HITL Approval
function HITLFooterActions({ hitlContext, isGloballyExecuting }: HITLFooterActionsProps) {
  // Defensive check: If context is missing, the manager hasn't initialized (e.g., data still loading).
  if (!hitlContext) {
    return (
      <div className="w-full text-center text-sm text-muted-foreground italic">
        Loading HITL Controls...
      </div>
    );
  }

  const {
    handleApprove,
    handleReject,
    handleDiscard,
    isSubmitting,
    isInteractionValid,
  } = hitlContext;

  const isDisabled = isSubmitting || isGloballyExecuting;

  return (
    <>
      <div>
        {/* Secondary Actions: [Discard] (ghost) (H2.3) */}
        <Button
          variant="ghost"
          disabled={isDisabled}
          onClick={handleDiscard}
        >
          <Trash2 className="h-4 w-4" />
          Discard Execution
        </Button>
      </div>
      <div className="flex space-x-4">
        {/* Primary Actions: [Reject] (secondary) (H2.2) */}
        <Button
          variant="secondary"
          disabled={isDisabled}
          onClick={handleReject}
        >
          <MessageSquare className="h-4 w-4" />
          Reject & Provide Feedback
        </Button>
        {/* [Approve] (primary) (H2.1) */}
        <Button
          variant="default"
          // Approve is disabled if overall disabled OR if specific interaction data is invalid (e.g. SCA selection missing)
          disabled={isDisabled || !isInteractionValid}
          onClick={handleApprove}
        >
          <Check className="h-4 w-4" />
          Approve & Continue
        </Button>
      </div>
    </>
  );
}

```


--- (9324-9486 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/blocks/hitl-zone-block.tsx Content:

```tsx
"use client";

import { HistoryIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { NodeDetailView, NodeVersionRead } from "~/core/models/node.model";
import type { TranscriptData } from "../useTranscriptData";
import { TranscriptBlock } from "./transcript-block";
import { NodeStatus } from "~/constants/enums";
import { CodeViewer } from "~/components/editors/CodeViewer";
import { HITLPanelRenderer } from "../../hitl/hitl-interaction-manager";

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

  // Define animation variants (Design Doc 5.2.3.1: Workspace Content Transition - fadeInUp)
  const transition = { duration: 0.3 }; // Duration.MEDIUM
  const variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    // Use a slight negative y on exit for a smoother transition when switching between modes
    exit: { opacity: 0, y: -10 },
  };

  return (
    // Design Doc 2.4.B: HITL Zone default expanded (managed by UIInteractionSlice defaults)
    <TranscriptBlock blockKey="hitl_zone" title="Human-in-the-Loop (HITL) Zone">
      {/* AnimatePresence for smooth transition between states (Awaiting HITL, History Review, Executing) */}
      <AnimatePresence mode="wait">
        {isAwaitingHITL ? (
          // --- Active Interaction (Design Doc 3.1.1.E) ---
          <motion.div
            key="active-hitl"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="space-y-6"
          >
            {/* Render the specialized HITL Panel (VARL, SCA, AVL) */}
            {/* HITLPanelRenderer uses the HITLInteractionContext provided by HITLInteractionManager */}
            <HITLPanelRenderer />

            {hasAccumulated && (
              <AccumulatedInteractions interactions={accumulatedInteractions} />
            )}
          </motion.div>

        ) : isHistoryReview ? (
          // --- History Review ---
          <motion.div
            key="history-review"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            <HistoryReview history={hitlHistory} hasHistory={hasHistory} />
          </motion.div>

        ) : (
          // --- Pending/Executing State ---
          <motion.div
            key="pending-executing"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="text-sm text-muted-foreground italic p-4 border rounded-lg bg-muted/50"
          >
            HITL interactions are not available while the node is executing or pending results.
          </motion.div>
        )}
      </AnimatePresence>
    </TranscriptBlock>
  );
}

// --- Helper Components (Extracted for clarity) ---

function AccumulatedInteractions({ interactions }: { interactions: any[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
        <HistoryIcon className="h-4 w-4" />
        Accumulated Interactions (This Session)
      </h4>
      {/* Display accumulated interactions using CodeViewer for structure */}
      {/* Limit height for readability */}
      <div className="max-h-64">
        <CodeViewer
          code={JSON.stringify(interactions, null, 2)}
          language="json"
          fileName="accumulated_interactions.json"
        />
      </div>
    </div>
  );
}

function HistoryReview({ history, hasHistory }: { history: any[] | null, hasHistory: boolean }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
        <HistoryIcon className="h-4 w-4" />
        Interaction History
      </h4>
      {hasHistory ? (
        // Display history using CodeViewer for structure
        <div className="max-h-64">
          <CodeViewer
            code={JSON.stringify(history, null, 2)}
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
  );
}

```



--- (9913-10161 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/hitl/hitl-interaction-manager.tsx Content:

```tsx
"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

import { useStore } from "~/core/store";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import type { HITLSubmission, TemporaryExecutionRead } from "~/core/models/node.model";
import { HITLAction, HITLMode, HITLResponseAction } from "~/constants/enums";

import { VARLPanel } from "./panels/varl-panel";
import { SCAPanel } from "./panels/sca-panel";
import { AVLPanel } from "./panels/avl-panel";
import { RejectFeedbackDialog } from "./reject-feedback-dialog";
import { DiscardConfirmationDialog } from "./discard-confirmation-dialog";

// Context for communication between HITL Zone (B2.4) and Action Footer (B3)
interface HITLInteractionContextType {
  node: NodeInstanceRead;
  pendingResult: TemporaryExecutionRead | null;
  // State managed by the panels (SCA, AVL)
  interactionData: Record<string, any> | null;
  setInteractionData: (data: Record<string, any> | null) => void;
  isInteractionValid: boolean; // Derived state for Continue button activation
  // Actions triggered by the footer
  handleApprove: () => Promise<void>;
  handleReject: () => void; // Opens dialog
  handleDiscard: () => void; // Opens dialog
  isSubmitting: boolean;
}

export const HITLInteractionContext = React.createContext<HITLInteractionContextType | null>(null);

export const useHITLInteraction = () => {
  const context = React.useContext(HITLInteractionContext);
  if (!context) {
    // This error is critical as it indicates a setup issue in NodeWorkspace
    throw new Error("useHITLInteraction must be used within a HITLInteractionManager");
  }
  return context;
};

interface HITLInteractionManagerProps {
  node: NodeInstanceRead;
  pendingResult: TemporaryExecutionRead | null;
  children: React.ReactNode; // Wraps Workspace content (B2 and B3)
}

/**
 * Manages the state and logic for HITL interactions.
 * Provides context for the HITL Zone (B2.4) and Action Footer (B3).
 * (Design Doc 3.1.1.E)
 */
export function HITLInteractionManager({ node, pendingResult, children }: HITLInteractionManagerProps) {
  const { submitHITL, selectNode } = useStore(
    useShallow((state) => ({
      submitHITL: state.submitHITL,
      selectNode: state.selectNode,
    }))
  );

  // State managed by the specific HITL panels (e.g. SCA selections)
  const [interactionData, setInteractionData] = useState<Record<string, any> | null>(null);
  // Local submission state tracker (distinct from global isExecutingAction)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog visibility states
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

  // Determine if the interaction data is valid for submission (Continue action)
  const isInteractionValid = useMemo(() => {
    switch (node.hitl_mode) {
      case HITLMode.SCA:
        // (Task 19): SCA requires at least one selection (API 5.3)
        // return !!interactionData?.selected_ids && interactionData.selected_ids.length > 0;
        return true; // Placeholder: Allow continue for SCA placeholder in this task.
      case HITLMode.AVL:
        // (Task 20): AVL requires all critiques adjudicated
        // return !!interactionData?.adjudication && interactionData.adjudication.length > 0;
        return true; // Placeholder: Allow continue for AVL placeholder in this task.
      case HITLMode.VARL:
      default:
        // VARL (basic approval) doesn't require specific interaction data.
        return true;
    }
  }, [node.hitl_mode, interactionData]);

  // --- Core Submission Handler (Design Doc 2.3.1) ---

  const handleSubmit = useCallback(async (submission: HITLSubmission) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // submitHITL handles the API call and error toasts.
      const response = await submitHITL(node.id, submission);

      if (response) {
        // Close dialogs upon successful submission
        setIsRejectDialogOpen(false);
        setIsDiscardDialogOpen(false);

        // Handle navigation based on the response action (API 5.3)
        switch (response.action) {
          case HITLResponseAction.ExecuteNext:
          case HITLResponseAction.NavigateNext:
            if (response.next_node_id) {
              // Navigate to the next node (Design Doc 2.3.1 Step A.6)
              selectNode(response.next_node_id);
            } else {
                console.warn("HITL Response indicated next node, but next_node_id was null.");
            }
            break;
          case HITLResponseAction.Completed:
            // Feedback handled by global WS listener, but immediate feedback is good UX.
            toast.success("Workflow Completed!");
            break;
          case HITLResponseAction.ReExecute:
          case HITLResponseAction.AVLLoop:
            // Design Doc 2.3.1 Step B.7
            // Stay on current node, wait for WebSocket updates (Status -> Executing).
            break;
          case HITLResponseAction.Discarded:
            // Stay on current node. State refresh handled by the store action (submitHITL).
            break;
          default:
            console.warn(`Unknown HITL response action: ${response.action}`);
        }
      }
    } catch (error) {
      // Errors are already handled within the submitHITL slice action.
      console.error("HITL Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [node.id, submitHITL, selectNode, isSubmitting]);

  // --- Action Handlers (Triggered by Footer) ---

  const handleApprove = useCallback(async () => {
    if (!isInteractionValid) {
      toast.error("Invalid Selection", {
        description: "Please complete the required interactions before approving.",
      });
      return;
    }

    const submission: HITLSubmission = {
      action: HITLAction.Continue,
      // API 5.3 specifies interaction_data is optional for Continue, but structure depends on mode.
      interaction_data: interactionData,
    };
    await handleSubmit(submission);
  }, [isInteractionValid, interactionData, handleSubmit]);

  const handleReject = useCallback(() => {
    setIsRejectDialogOpen(true);
  }, []);

  const handleDiscard = useCallback(() => {
    setIsDiscardDialogOpen(true);
  }, []);

  // --- Dialog Submission Handlers ---

  const submitRejection = useCallback(async (data: { feedback_comment: string }) => {
    const submission: HITLSubmission = {
      action: HITLAction.RejectAndProvideModificationComments,
      feedback_comment: data.feedback_comment,
    };
    await handleSubmit(submission);
  }, [handleSubmit]);

  const confirmDiscard = useCallback(async () => {
    const submission: HITLSubmission = {
      action: HITLAction.Discard,
    };
    await handleSubmit(submission);
  }, [handleSubmit]);

  // Context Value
  const contextValue: HITLInteractionContextType = {
    node,
    pendingResult,
    interactionData,
    setInteractionData,
    isInteractionValid,
    handleApprove,
    handleReject,
    handleDiscard,
    isSubmitting,
  };

  return (
    <HITLInteractionContext.Provider value={contextValue}>
      {children}
      {/* Render dialogs controlled by this manager */}
      <RejectFeedbackDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onSubmit={submitRejection}
        isSubmitting={isSubmitting}
      />
      <DiscardConfirmationDialog
        isOpen={isDiscardDialogOpen}
        onClose={() => setIsDiscardDialogOpen(false)}
        onConfirm={confirmDiscard}
        isDiscarding={isSubmitting}
      />
    </HITLInteractionContext.Provider>
  );
}

/**
 * Dynamic renderer for the HITL Zone (B2.4).
 * Renders the appropriate panel based on the node's hitl_mode.
 * (Architecture 7.2.3)
 */
export function HITLPanelRenderer() {
  const { node, pendingResult } = useHITLInteraction();

  // Safeguard: Ensure pendingResult is available. output_data might be null if the node produced no output.
  if (!pendingResult) {
    return <div className="p-4 text-muted-foreground">Loading HITL interface or data missing...</div>;
  }

  // output_data can be null if the execution didn't produce any structured output.
  const outputData = pendingResult.output_data;

  switch (node.hitl_mode) {
    case HITLMode.SCA:
      // Implementation in Task 19
      return <SCAPanel outputData={outputData} />;
    case HITLMode.AVL:
      // Implementation in Task 20
      return <AVLPanel outputData={outputData} />;
    case HITLMode.VARL:
    default:
      return <VARLPanel outputData={outputData} />;
  }
}


```


--- (10339-10371 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/hitl/panels/sca-panel.tsx Content:

```tsx
import { AlertTriangle } from "lucide-react";

interface SCAPanelProps {
  outputData: Record<string, any> | null;
}

/**
 * Placeholder for Strategic Choice Architecture (SCA) Panel (Task 19).
 * (Design Doc H3.1)
 */
export function SCAPanel({ outputData }: SCAPanelProps) {
  // Temporary visualization of expected data structure (if available)
  const candidatesCount = Array.isArray(outputData?.candidates) ? outputData.candidates.length : 0;

  return (
    <div className="p-6 border border-dashed border-yellow-500 bg-yellow-500/10 rounded-lg">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
        <AlertTriangle className="w-5 h-5"/> SCA Panel (Placeholder)
      </h3>
      <p className="text-sm text-muted-foreground mt-2">
        Strategic Choice Architecture (SCA) interface will be implemented here (Task 19).
        It will display candidates for selection. (Design Doc 4.2.5)
      </p>
      <p className="text-sm mt-1">Candidates expected: {candidatesCount}</p>
    </div>
  );
}


```


--- (10975-11096 lines) ---
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



--- (11691-11764 lines) ---
### components/ui/tabs.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "~/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

```


--- (11766-11865 lines) ---
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

```


--- (13066-13101 lines) ---
### components/ui/checkbox.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }



--- (13673-13844 lines) ---
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


--- (13888-14012 lines) ---
         - MarkdownRenderer.tsx

### components/renderers/MarkdownRenderer.tsx Content:

```tsx
"use client";

/**
 * Professional Markdown and LaTeX Renderer Component.
 * Implements Design Doc requirement 3.2.1 (Professional Markdown/LaTeX Renderer).
 * Utilizes react-markdown with GFM, Math (KaTeX) support, and customized high-density typography.
 */

import React, { useMemo } from "react";
import ReactMarkdown, { type Options as ReactMarkdownOptions } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Import KaTeX CSS for formula rendering
import "katex/dist/katex.min.css";

import { katexOptions } from "~/core/markdown/katex";
import { autoFixMarkdown, normalizeMathForDisplay, dropMarkdownWrapper } from "~/core/utils/markdown";
import { rehypeSplitWordsIntoSpans } from "~/core/rehype";
import { cn } from "~/lib/utils";

export interface MarkdownRendererProps extends Omit<ReactMarkdownOptions, 'children'> {
  /** The Markdown content string to render. */
  content: string;
  /** Optional CSS class name for the container div. */
  className?: string;
  /**
   * Enable animated rendering (e.g., for streaming content).
   * Splits words into spans for fade-in effects (requires corresponding CSS).
   */
  animated?: boolean;
  /**
   * Controls whether to automatically clean up LLM wrappers (e.g., ```markdown ... ```).
   * @default true
   */
  cleanWrapper?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  className,
  content,
  animated = false,
  cleanWrapper = true,
  ...props
}) => {

  // Define custom components for specific elements
  const components: ReactMarkdownOptions["components"] = useMemo(() => {
    return {
      // Ensure all links open in a new tab securely
      a: ({ href, children }) => {
        const rel = "noopener noreferrer";
        const link = (href as string | undefined) ?? "#";
        return (
          <a href={link} target="_blank" rel={rel}>
            {children}
          </a>
        );
      },
      // Basic image rendering
      img: ({ src, alt }) => (
        <img className="rounded-md border" src={src as string} alt={alt ?? ""} />
      ),
      // Ensure code blocks use Geist Mono (Design Doc 4.1.2.B)
      pre: ({ children }) => (
          <pre className="font-mono">{children}</pre>
      ),
      code: ({ children }) => (
          <code className="font-mono">{children}</code>
      )
    };
  }, []);

  // Configure Rehype plugins
  const rehypePlugins = useMemo<NonNullable<ReactMarkdownOptions["rehypePlugins"]>>(() => {
    const plugins: NonNullable<ReactMarkdownOptions["rehypePlugins"]> = [
        // Add KaTeX rendering plugin
        [rehypeKatex, katexOptions]
    ];
    // Add animation plugin if enabled
    if (animated) {
      plugins.push(rehypeSplitWordsIntoSpans);
    }
    return plugins;
  }, [animated]);

  // Preprocess the markdown content
  const processedContent = useMemo(() => {
    if (!content) return "";
    let markdown = content;
    if (cleanWrapper) {
        markdown = dropMarkdownWrapper(markdown);
    }
    // Normalize LaTeX delimiters and apply automatic fixes
    return autoFixMarkdown(normalizeMathForDisplay(markdown));
  }, [content, cleanWrapper]);


  return (
    <div
      // Apply Tailwind Typography classes ('prose') for professional styling (Design Doc 4.1.2.D).
      // 'max-w-none' ensures it fills the container.
      className={cn("prose dark:prose-invert max-w-none", className)}
    >
      <ReactMarkdown
        // Configure Remark plugins for GFM and Math syntax
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={rehypePlugins}
        components={components}
        {...props}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};


```

</deer_flow_frontend_code>

<architecture>
--- (15-15 lines) ---
3.  **精细化控制与复杂交互**: 支持多种人机协同 (HITL) 模式和精细的用户干预（版本切换、人工编辑）。


--- (42-45 lines) ---
### 2.3 样式与 UI 组件

  * **Tailwind CSS**: 原子化 CSS 框架，实现设计系统 Token。
  * **Shadcn/ui (基于 Radix UI)**: 基础 UI 组件库，提供可访问性和定制能力。


--- (57-59 lines) ---
  * **Monaco Editor**: **[关键选型]** 用于代码查看、编辑和实时日志展示。提供专业级体验。
  * **Novel (Tiptap/ProseMirror)**: 富文本/Markdown 编辑器，用于人工编辑环节。
  * **`react-markdown` + Remark/Rehype + KaTeX**: 用于渲染 Markdown 和 LaTeX 公式。


--- (65-66 lines) ---
  * **Zod**: 数据结构定义和校验。
  * **React Hook Form**: 表单管理。


--- (136-138 lines) ---
└── /hitl/              # HITL 交互模式组件
    ├── SCAPanel.tsx
    └── AVLPanel.tsx


--- (152-161 lines) ---
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


--- (264-266 lines) ---
    // D. 执行控制与 HITL (调用 API Service)
    reExecuteNode: (/*...*/) => Promise<void>;
    submitHITL: (/*...*/) => Promise<HITLResponse>;


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


</architecture>



---

<task>


### 任务 19：HITL 实现 - SCA（战略选择架构）

**目标：** 实现 SCA 模式的 HITL 交互界面，支持候选方案的展示、比较和选择。

**核心关注点：** SCA 数据结构解析、复杂 UI 渲染（Tabs, RadioGroup）、交互数据收集。

**实现策略（参考 `<design_doc> 4.3.B.5`）：**

1.  **SCAPanel 实现（`src/components/hitl/SCAPanel.tsx` 新建）：**
    *   解析 `pending_result.output_data` 中的 SCA 数据结构（通常包含 `candidates` 和 `comparative_analysis`）。
2.  **UI 实现：**
    *   使用 Shadcn/ui `Tabs` 组织界面：一个 Tab 展示“Comparative Analysis”，其他 Tabs 或列表展示“Candidates”。
    *   在 Analysis Tab 使用 `MarkdownRenderer` 展示比较分析。
3.  **选择器实现：**
    *   使用 `RadioGroup`（单选）或 `Checkbox`（多选）结合 `Card` 组件，实现清晰易用的方案选择器。
    *   使用 React Hook Form 管理选择状态。
4.  **集成与提交：**
    *   将 `SCAPanel` 集成到 HITL Zone。
    *   `ActionFooter` 的 [Approve] 按钮在用户做出有效选择后激活。
    *   提交时，构建 `interaction_data: { "selected_ids": [...] }`（`<api> 5.3`）。

**输入：** 任务 18 的输出, `<api> 5.3`, `<design_doc> 4.3.B.5`。
**输出：** 功能完整的 SCA 模式交互流程。


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

