--- (101-150 lines) ---
##### 模块三：工作流引擎核心逻辑 (WFE)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| WFE-3.1 | 工作流实例化与启动。 | P0 | 核心操作。依赖 PMG-2.3, PMG-2.4。 | R3.5 |
| WFE-3.2 | 严格线性执行模型与节点粒度定义。 | P0 | 核心设计哲学。 | S2.1, S2.2 |
| WFE-3.3 | 节点生命周期状态机管理（未开始、执行中、等待HITL、已完成、失败）。 | P0 | | S4.1, S4.2 |
| WFE-3.4 | 强制性人机交互 (HITL)。每个节点执行成功后必须进入 HITL。 | P0 | | S2.4 |
| WFE-3.5 | 依赖解析规则。执行时拉取上游“当前激活版本”作为输入。 | P1 | 依赖 VER-4.3。 | S3.4 |
| WFE-3.6 | 配置快照创建。启动工作流时捕获用户设置。 | P1 | 确保可复现性。 | R3.5 |
| WFE-3.7 | 动态工作流结构：生成器节点支持与实例化。 | P2 | 实现阶段二循环。 | S2.2, S2.3 |
| WFE-3.8 | 动态工作流结构：生成器节点执行限制（禁止重跑）。 | P2 | 简化设计决策。 | S2.3 |

##### 模块四：版本控制与状态管理 (VER)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| VER-4.1 | 原子化版本创建。在 HITL 批准时创建不可变快照。 | P0 | 核心设计哲学。 | S1.3, S3.1 |
| VER-4.2 | 版本快照内容定义（输出、输入ID、HITL记录、环境参数）。 | P0 | 确保可追溯性。 | S3.2 |
| VER-4.3 | 版本激活管理（默认激活最新版本，且唯一激活）。 | P0 | | S3.3 |
| VER-4.4 | 历史版本审查（只读模式查看完整快照）。 | P1 | 支持回溯和比较。 | S5.6 |
| VER-4.5 | 版本切换（手动）。用户手动切换激活版本（不级联）。 | P1 | 用户主权体现。 | S3.3, R5.5.2 |
| VER-4.6 | 静默状态管理与“陈旧性”(Staleness)检测与提示。 | P1 | 核心设计哲学。系统提示但不干预。 | S1.4, R5.2 |

##### 模块五：工作流控制与导航 (WFC)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| WFC-5.1 | 工作流可视化（层级流程图，实时状态显示）。 | P1 | 核心 UI。依赖 WFE-3.3。 | R5.1, R5.2 |
| WFC-5.2 | 节点审查模式（只读）。展示节点当前激活版本详情。 | P1 | | S5.2, R5.4 |
| WFC-5.3 | 继续执行 (Proceed to Next)。批准当前节点并导航/执行下一节点。 | P1 | 核心导航逻辑。 | S5.3 |
| WFC-5.4 | 跳转 (Jumping)。用户可以跳转到任意已执行完的节点。 | P1 | 支持线性探索。 | S5.2, R5.3 |
| WFC-5.5 | 重新执行 (Re-execution)。对已完成节点提供新意见，触发全新执行。 | P1 | 支持迭代探索。 | S5.4, R5.5.1 |
| WFC-5.6 | 重试 (Retry)。针对失败节点进行重试。 | P1 | 错误恢复机制。 | S5.5 |
| WFC-5.7 | 实时通信（WebSocket）集成。实时推送状态和结构更新。 | P1 | 支持 WFC-5.1 实时性。 | API Doc 6 |

##### 模块六：人机协同 (HITL) 与人工编辑 (EDT)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| HITL-6.1 | HITL 基础操作：批准 (Continue)。 | P0 | 推进工作流的核心动作。 | S6.1 |
| HITL-6.2 | HITL 基础操作：拒绝并提供修改意见 (Reject)。 | P1 | 支持迭代修正。 | S6.2 |
| HITL-6.3 | HITL 基础操作：丢弃本次执行 (Discard)。 | P1 | 用户反悔机制。 | S6.3 |
| HITL-6.4 | HITL 模式实现：VARL (审查式批准/拒绝)。 | P1 | 基础 HITL 模式。 | HITL_MODES |
| HITL-6.5 | HITL 模式实现：SCA (战略选择架构)。 | P1 | 核心 HITL 模式。 | HITL_MODES |
| HITL-6.6 | HITL 模式实现：AVL (对抗性验证循环)。 | P2 | 高级 HITL 模式。 | HITL_MODES |
| EDT-6.7 | 人工编辑：支持对 AI 生成的文本工件进行编辑。 | P1 | 用户主权体现。 | R4.1 |
| EDT-6.8 | 人工编辑：平台内编辑器（富文本/LaTeX、代码）。 | P1 | | R4.2 |
| EDT-6.9 | 人工编辑：版本控制逻辑。保存编辑必须创建新版本并自动激活。 | P1 | 依赖 VER-4.1。 | R4.3 |



--- (284-336 lines) ---
##### 5\. 工作流实例 (WorkflowInstance)

代表一次具体的工作流执行过程。

  * `id` (Integer), `project_id` (Integer), `name` (String).
  * `status` (Enum: "Running", "Completed"): 工作流执行状态。
  * `configuration_snapshot` (JSON): 启动时捕获的用户设置快照（确保可复现性）。
  * `nodes` (Array\<`NodeInstance`\>): **（持久化）** 工作流中所有节点的当前状态集合。此列表会因 Generator 节点执行而动态扩展。
  * `phases` (Array\<`PhaseStageGrouping`\>): **（API 响应）** 序列化层将节点聚合为 `Phase -> Stage -> Node` 的层级结构，直接供 React Flow 渲染。每个 Phase 包含 `name` 与 `stages`，每个 Stage 提供 `id`, `name`, `nodes`（节点条目包含 `is_stale`、`active_version` 摘要等状态扩展字段）。

##### 6\. 节点实例 (NodeInstance)

工作流中的一个具体执行步骤。

  * `id` (Integer), `workflow_instance_id` (Integer).
  * `definition_id` (String): 节点定义 ID (e.g., "1.1.1").
  * `name` (String), `order_index` (Integer).
  * `stage_id` (String): Phase 内 Stage 的唯一标识。静态节点继承 `definition_id` 前缀（如 "1.1"、"3.1"），动态 Phase 2 节点使用任务 ID + 模板段位（如 "Task_A1.2.2"）。
  * `stage_name` (String): Stage 的可读名称。Phase 1/3 由 `workflow_definition.py` 中的 `KEY_STAGE_NAME` 定义，Phase 2 通过 `[Task_X] + stage_name_prefix` 动态生成（示例："[Task_A1] Code & Execution"）。
  * `node_type` (Enum: "Standard", "Generator"): 节点类型。
  * `hitl_mode` (Enum: "VARL", "SCA", "AVL"): 人机交互模式。
  * **状态管理:**
      * `status` (Enum: "Not Started", "Executing", "Awaiting HITL Approval", "Completed", "Failed").
      * `current_stage` (String): 执行中的详细阶段描述。
  * **版本管理:**
      * `active_version_id` (Integer | Null): 当前激活的版本 ID。
  * **临时状态 (用于执行和 HITL):**
      * `pending_result` (JSON | Null): 临时存储的执行结果或 HITL 候选数据。
      * `error_log` (Text | Null): 如果执行失败，存储错误日志。

###### 阶段层 (Stage Layer Representation)

* **Stage 概念:** Stage 是 Phase 内部更细粒度的逻辑分组，承载一组具有共同上下文的节点（例如 Phase 1 中的 "Strategic Definition"，或 Phase 2 中的 "[Task_A1] Code & Execution"）。
* **定义方式:** `workflow_definition.py` 为静态节点提供 `KEY_STAGE_ID` / `KEY_STAGE_NAME`；`PHASE_2_TEMPLATE` 通过 `stage_name_prefix` 生成动态 Stage 名称。
* **持久化:** `NodeInstance` 持久化 `stage_id` 与 `stage_name`，确保动态节点在数据库中保留 Stage 归属，便于历史回放与陈旧性检测。
* **API 序列化:** `WorkflowService._build_hierarchical_phases` 基于节点的 Phase 与 Stage 元数据返回 `phases[].stages[].nodes`。前端无需再以 `phase_id` 手动聚合扁平列表，直接消费层级化结构以构建列 (Phase) / 分组 (Stage) / 卡片 (Node)。

##### 7\. 节点版本 (NodeVersion)

节点的一次已批准执行结果的不可变快照 (Atomic Versioning)。

  * `id` (Integer), `node_instance_id` (Integer).
  * `version_number` (Integer): 节点内的版本序号 (e.g., v1, v2)。
  * `source` (Enum: "AI\_GENERATED", "MANUALLY\_EDITED"): 版本的来源。
  * `summary` (String): 对该版本的简短描述或变更日志。
  * `based_on_version_id` (Integer | Null): 此版本所基于的前一个版本 ID。
  * **快照内容 (Context Snapshot):**
      * `output_data` (JSON): 该版本最终的输出工件 (Artifacts)。
      * `input_dependencies` (JSON Array): **（关键）** 记录生成此版本时所依赖的上游节点及其版本 ID。用于计算陈旧性。
          * `[{ "upstream_node_id": 101, "consumed_version_id": 5 }]`
      * `hitl_history` (JSON Array): 生成此版本过程中的完整 HITL 交互记录。
      * `environment_parameters` (JSON): 执行环境参数。



--- (386-425 lines) ---
**工作流核心概念 (Workflow Concepts)**

| 术语 | 定义 |
| :--- | :--- |
| **工作流实例 (WorkflowInstance)** | 一次从头到尾的完整建模过程的执行实例。 |
| **节点实例 (NodeInstance)** | 工作流中的一个具体步骤。它是执行的载体和版本的容器。 |
| **Stage（Phase 内逻辑分组）** | Phase 内的中间层，用 `stage_id`/`stage_name` 表示，用于聚合语义一致的节点集合，并在 API 中以 `phases[].stages[].nodes` 的形式暴露给前端。 |
| **严格线性执行 (Strictly Linear Execution)** | 工作流必须按照预定义的顺序逐一执行节点。 |
| **生成器节点 (Generator Node)** | 一种特殊类型的节点，执行完成后会动态生成并插入一系列新的子任务节点到工作流中（如步骤 1.1.2）。为保证一致性，禁止重新执行。 |
| **执行前沿 (Execution Frontier)** | 工作流中已执行或正在执行的最后一个节点的序号。用户不能操作前沿之外的未来节点。 |

**版本控制与状态 (Versioning and State)**

| 术语 | 定义 |
| :--- | :--- |
| **节点版本 (NodeVersion)** | 节点某次成功执行并被批准后的不可变快照，包含输入、输出和完整上下文。 |
| **激活版本 (Active Version)** | 在任意时刻，每个节点有且仅有一个被标记为“激活”的版本。它是该节点当前对外提供的“官方”结果，也是下游节点默认使用的输入来源。 |
| **原子化版本控制 (Atomic Versioning)** | 只有在 HITL 环节被用户最终批准后，才会产生一个不可变的 `NodeVersion`。 |
| **陈旧性 (Staleness)** | 当一个节点的上游依赖节点的 `Active Version` 更新后，该节点的状态。表示其结果是基于过时的输入生成的。 |
| **静默状态管理 (Silent State Management)** | 当上游变更导致下游“陈旧”时，系统仅作非侵入式提示，而不会自动触发任何级联更新。由用户决定何时以及如何处理不一致性。 |

**节点生命周期状态 (Node Lifecycle Status - `NodeStatus`)**

| 状态 | 定义 |
| :--- | :--- |
| **未开始 (Not Started)** | 节点从未被执行过。 |
| **执行中 (Executing)** | 节点的计算/LLM 推理正在进行。 |
| **等待 HITL 批准 (Awaiting HITL Approval)** | 计算成功完成，等待用户在 HITL 界面进行交互。此状态下的结果是临时的 (`pending_result`)。 |
| **已完成 (Completed)** | 节点拥有一个或多个已批准的版本，且存在一个 `Active Version`。 |
| **执行失败 (Failed)** | 节点的计算执行失败。 |

**人机协同 (Human-in-the-Loop - HITL)**

| 术语 | 定义 |
| :--- | :--- |
| **HITL** | 工作流中强制性的人工干预环节。 |
| **VARL (Vetted Approval/Rejection Loop)** | 审查式批准/拒绝循环。对输出进行快速的“批准”或“拒绝”的二元选择。 |
| **SCA (Strategic Choice Architecture)** | 战略选择架构。AI 生成 N 个候选方案并进行比较分析，由人类选择一个或多个接受。 |
| **AVL (Adversarial Validation Loop)** | 对抗性验证循环。AI 扮演“红队”进行批判性评审，由人类逐项裁决争议。 |



--- (482-492 lines) ---
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



--- (543-579 lines) ---
#### 2.3.2 场景二：执行一个节点并完成 HITL 交互 (以 SCA 模式为例)

**目标:** 用户对处于 `Awaiting HITL Approval` 状态的节点进行决策。
**入口点:** L2.2.B: 工作流执行视图。节点 N 状态为 `Awaiting HITL Approval` (SCA 模式)。

**流程描述:**

1.  **[系统反馈 (UI)]** 节点检查器面板 (B.3) 渲染 SCA 交互界面，显示 `pending_result` 中的候选方案列表和比较分析。
2.  **[用户动作]** 用户审查方案和分析。

**分支 A: 批准并继续 (Continue)**

3A. **[用户动作]** 选择一个或多个满意的方案（如 Option B）。点击“批准并继续”。
4A. **[系统响应 (API)]** 调用 `POST /nodes/{id}/hitl`。`action: "Continue"`, `interaction_data: { "selected_ids": ["Option B"] }`。
5A. **[系统响应 (后端逻辑)]**
\*   固化 `pending_result` 为新的 `NodeVersion`，并设为 `active_version`。
\*   更新节点 N 状态为 `Completed`。
\*   **决策下一步 (Proceed to Next 逻辑 SRS 5.3):** 检查下一个节点 N+1。
\*   如果 N+1 为 `Not Started`: 自动触发 N+1 执行。API 响应 `action: "ExecuteNext"`.
\*   如果 N+1 为 `Completed`: 不自动执行。API 响应 `action: "NavigateNext"`.
6A. **[系统反馈 (UI)]** 焦点自动转移到节点 N+1。通过 WebSocket 确认 N 已完成。根据 API 响应，N+1 可能开始执行或进入审查模式（并显示陈旧性提示）。

**分支 B: 拒绝并提供修改意见 (RejectAndProvideModificationComments)**

3B. **[用户动作]** 点击“拒绝并修改”。输入修改意见并提交。
4B. **[系统响应 (API)]** 调用 `POST /nodes/{id}/hitl`。`action: "RejectAndProvideModificationComments"`.
5B. **[系统响应 (后端逻辑)]** 将节点 N 重新加入执行队列（基于新反馈）。
6B. **[系统反馈 (UI)]** 节点 N 状态变回 `Executing`。流程循环等待新的结果。

**分支 C: 丢弃本次执行 (Discard)**

3C. **[用户动作]** 点击“丢弃本次执行”并确认。
4C. **[系统响应 (API)]** 调用 `POST /nodes/{id}/hitl`。`action: "Discard"`.
5C. **[系统响应 (后端逻辑)]** 删除 `pending_result`。节点状态回滚到执行前的状态。
6C. **[系统反馈 (UI)]** 详情面板刷新，显示回滚后的状态。

**出口点:** 节点 N 的 HITL 环节结束，工作流进入下一个状态。


--- (583-607 lines) ---
#### 2.3.3 场景三：回溯、版本切换与手动下游更新

**目标:** 用户修改上游历史决策，并手动更新下游节点。体现“静默状态管理”。
**入口点:** L2.2.B: 工作流执行视图。假设 Node A -\> Node B 已完成。A 当前激活 V2。B 基于 A(V2) 生成。

**流程描述:**

1.  **[用户动作 (回溯)]** 用户在画布上点击 Node A。
2.  **[系统反馈 (UI)]** 节点检查器加载 Node A，显示 V2。
3.  **[用户动作]** 切换到“版本历史”标签页。审查历史版本 V1。
4.  **[用户动作 (版本切换)]** 点击 V1 的“激活此版本”按钮。
5.  **[系统响应 (API)]** 调用 `POST /nodes/{A_id}/versions/{V1_id}/activate`。
6.  **[系统响应 (关键 - 静默状态管理)]**
      * **(后端逻辑):** Node A 的 `active_version_id` 更新为 V1。**系统不自动执行下游 Node B。**
7.  **[系统响应 (UI - 陈旧性检测)]** 前端调用 `GET /workflows/{id}/staleness`。
8.  **[系统反馈 (UI)]** API 返回 Node B 已陈旧。工作流画布上，Node B 显示“陈旧 (Stale)”警告图标。
9.  **[用户动作]** 用户点击 Node B。
10. **[系统反馈 (UI)]** 节点检查器加载 Node B，并显示醒目提示：“输入已变更（Node A 已切换为 V1）。建议重新执行。”
11. **[用户动作 (手动重新执行)]** 用户点击 Node B 的“重新执行”按钮并确认。
12. **[系统响应 (API)]** 调用 `POST /nodes/{B_id}/re-execute`。
13. **[系统响应 (后端逻辑 - 依赖解析)]** 系统执行 Node B，自动拉取 Node A 的**当前激活版本 (V1)** 作为输入。
14. **[系统反馈 (UI)]** Node B 状态变为 `Executing`。陈旧性提示消失。

**出口点:** Node A 版本已切换，Node B 正在基于新的上游输入重新执行。



--- (610-629 lines) ---
#### 2.3.4 场景四：对 AI 生成的工件进行人工编辑并创建新版本

**目标:** 用户直接修改 AI 生成的中间结果，并保存为新的激活版本。
**入口点:** L2.2.B: 工作流执行视图。Node N 已完成 (V1)。

**流程描述:**

1.  **[用户动作]** 用户在 Node N 的详情面板审查 V1 工件。点击“人工编辑 (Manual Edit)”按钮。
2.  **[系统反馈 (UI)]** 详情面板切换为编辑模式，加载平台内编辑器（如 Tiptap/Novel），并载入 V1 内容。
3.  **[用户动作]** 用户在编辑器中修改内容。（可选：使用 Ask AI 辅助功能）。
4.  **[用户动作]** 点击“保存并激活”按钮。输入版本摘要并确认。
5.  **[系统响应 (API)]** 调用 `POST /nodes/{id}/manual-edit`。
      * `base_version_id: V1`, `edited_output_data: {...}`, `summary: "..."`。
6.  **[系统响应 (后端逻辑)]**
      * 创建新版本 V2 (`source: MANUALLY_EDITED`)。
      * 将 V2 设为 `active_version`。
7.  **[系统反馈 (UI)]** 退出编辑模式，详情面板显示 V2 内容。
8.  **[系统响应 (UI)]** 前端重新计算陈旧性。所有依赖 Node N 的下游节点被标记为“陈旧”。

**出口点:** 节点 N 的激活版本已更新为人工编辑后的 V2，下游节点显示陈旧提示。


--- (664-671 lines) ---
##### 1\. 工作流可视化导航与操作

*   **技术基础:** `React Flow (@xyflow/react)`.
*   **画布导航:** 支持平移（Pan）和缩放（Zoom）。提供 Minimap 和 Controls 工具栏。
*   **节点选择与回溯 (Backtracking):**
    *   用户可以点击任何已开始或已完成的节点来选中它，触发检查器面板加载其详情。
    *   **执行前沿限制:** 超前于“执行前沿”的 `Not Started` 节点应在视觉上显示为“未解锁”，并且不可点击。
*   **动态结构更新:** 当 Generator 节点完成时，使用布局动画（`Framer Motion` 或 `React Flow` 内置动画）平滑地呈现新节点的出现和重新排列。


--- (699-716 lines) ---
##### 3\. 版本浏览与切换

*   **入口:** 节点检查器面板的“版本历史”标签页。
*   **交互规则:**
    *   **历史列表:** 显示所有版本，标记当前激活版本。
    *   **审查 (Review):** 点击历史版本，在只读模态框 (`Dialog`) 中加载该版本的完整快照。
    *   **激活 (Activate):** 提供“激活此版本”按钮。
        *   **强制确认:** 点击后必须弹出确认对话框，明确警告用户下游节点将变为“陈旧 (Stale)”且不会自动更新（遵循“静默状态管理”）。
        *   **限制:** Generator 节点禁止切换版本。

##### 4\. 结构化内容编辑 (人工编辑 R4)

*   **技术基础:** `Tiptap/Novel` (富文本/LaTeX), Code Editor。
*   **交互规则:**
    *   **进入编辑模式:** 在已完成节点的检查器面板中，点击“人工编辑”。内容区切换为编辑器实例。
    *   **AI 辅助 (Ask AI):** 集成 Deer-Flow 的 Ask AI 功能。用户可通过斜杠命令 (`/ai`) 或选中文本后的浮动工具栏调用 AI 辅助编辑。
    *   **保存与版本创建:** 点击“保存并激活”按钮。弹出对话框要求用户输入“版本摘要 (Summary)”。提交后，创建一个新的 `MANUALLY_EDITED` 版本并自动激活。



--- (719-763 lines) ---
### 3.1.2 系统反馈与状态管理逻辑 (System Feedback and State Management Logic)

本文档定义了系统如何沟通状态变化、处理异步操作和管理异常情况的全局规范。

#### 3.1.2.1 实时状态可视化 (Real-time Status Visualization)

系统必须清晰、实时地可视化工作流和节点的各类状态。

**节点生命周期状态 (`NodeStatus`) 可视化规范:**

建立一套一致的视觉语言（图标 + 色彩 + 动画）应用于工作流画布和检查器面板。

| 状态 | 图标 (Lucide Icon) | 颜色 (Semantic Color) | 动画与效果 |
| :--- | :--- | :--- | :--- |
| **Not Started** | `Circle` (虚线) | 中性灰 (Gray) | 无。若未解锁，显示为置灰状态。 |
| **Executing** | `Loader` (旋转) | 主色 (Blue/Primary) | 旋转动画。节点边缘可应用微妙的动态光效（`Magic UI BorderBeam`）。 |
| **Awaiting HITL Approval** | `UserCheck` 或 `Hand` | 警告色 (Yellow/Amber) | 微妙的脉动效果或闪烁，以吸引用户注意。 |
| **Completed** | `CheckCircle` (实心) | 成功色 (Green) | 状态变化时有平滑的转场动画。 |
| **Failed** | `XCircle` (实心) | 错误色 (Red) | 醒目，静态。 |

#### 3.1.2.2 异步与实时通信反馈机制

**1\. 长时间运行任务 (节点执行)**

*   **即时反馈:** 用户触发执行后，UI 必须立即响应（按钮禁用，显示加载状态）。
*   **进度详情:** 当节点处于 `Executing` 状态时，检查器面板应实时显示 `current_stage` 的文本信息（例如：“Step 2/5: Running simulation...”）。

**2\. WebSocket 实时通信管理**

*   **连接状态指示器:** 在全局导航栏中显示 WebSocket 连接状态。
*   **断线与重连:**
    *   连接中断时，在屏幕顶部显示全局横幅 (Global Banner)：“实时更新已中断，正在尝试重连...”。
    *   重连成功后，横幅消失，并立即触发一次全局状态同步。

#### 3.1.2.3 “静默状态管理”与“陈旧性”提示

遵循“静默状态管理”原则 (SRS 1.4)，当上游变更导致下游节点“陈旧 (Stale)”时，提供非侵入式提示。

**陈旧性 (Staleness) 可视化规范:**

*   **检测触发:** 任何节点的 `active_version` 变更后，前端立即调用 `GET /workflows/{id}/staleness` 更新状态。
*   **L1: 画布提示:** 在陈旧的节点卡片上添加一个醒目的警告图标（例如 `AlertTriangle` 或 `RefreshCw`），颜色为警告色。
*   **L2: 检查器面板提示:** 当用户选择陈旧节点时，在“执行与结果”标签页顶部显示一个突出的警告框 (`Shadcn Alert`)。文案必须清晰说明原因和建议操作。
*   **L3: 依赖详情:** 在“依赖关系”标签页中，清晰高亮显示版本号不一致的上游依赖。



--- (822-827 lines) ---
**2\. 上下文状态导航 (Contextual State Navigation - State Driven)**

*   **机制:** 基于客户端状态管理（`Zustand`）而非 URL 路由。
*   **用途:** 在工作流执行视图中切换焦点节点（回溯和审查）。
*   **行为:** 用户点击画布节点，更新 `selectedNodeId` 状态，检查器面板局部更新内容。URL 保持不变（或仅更新查询参数 `?node={id}`）。这使得导航极为快速和流畅。



--- (1744-1782 lines) ---
#### 5.2.1 场景一：工作流执行过程的可视化

**目标:** 清晰、动态地可视化节点状态的变化。

**1. 节点状态转换动画 (Node State Transition)**

  * **实现方式:** 使用 `Framer Motion` 的 `animate` 属性进行属性过渡。

  * **具体动效:**

      * **`Executing` 开始:**
          * 图标平滑过渡到旋转的 `Loader`。
          * `<Magic UI BorderBeam>` 动态光环效果淡入激活。参数：淡入使用 `duration.medium`。
      * **`Executing` 结束:**
          * `BorderBeam` 效果淡出。
          * 图标平滑过渡到新状态图标。
      * **`Awaiting HITL Approval` 开始:**
          * 图标过渡到 `--warning` 色。
          * 图标激活微妙的脉动效果（使用 `Framer Motion` 控制透明度循环变化）。参数：持续时间 `1.5s`, 缓动 `easing.standard`, 循环播放。

-----

#### 5.2.2 场景二：工作流结构的动态更新（Generator 节点）

**目标:** 当工作流结构变化时，提供平滑、可理解的视觉过渡。

**编排逻辑:**

1.  **[系统] 计算新布局:** 使用布局算法（如 Dagre）计算新坐标。
2.  **[动效] 布局调整动画 (Layout Animation):**
      * **目标:** 现有节点平滑移动到新位置。
      * **实现:** 在自定义节点组件中使用 `Framer Motion` 的 `layout` 属性。
      * **参数:** 使用 `Transitions.layout` (`type: "tween", duration: 0.3s, ease: MotionEasings.sharp`)。
3.  **[动效] 新节点进入动画 (Enter Animation):**
      * **目标:** 新生成的节点链有序地出现。
      * **实现:** 使用 `Framer Motion` 的 `variants` 和 `staggerChildren`。
      * **效果:** 淡入结合轻微的自下而上移动 (`opacity: 0, y: 20px -> opacity: 1, y: 0`)。
      * **参数:** 交错间隔 `staggerChildren: 0.05s`。单个节点动画使用 `Transitions.enter`。



--- (1807-1813 lines) ---

**1. 切换焦点节点 (Switching Focused Node)**

  * **触发条件:** 用户点击画布上的另一个节点。
  * **效果:** 检查器面板内容快速切换。
      * **实现:** 使用 `<AnimatePresence mode="wait">` 包裹检查器面板的内容区，以 `selectedNodeId` 作为 `key`。
      * **参数:** 使用 `duration.fast` (0.2s)。`Transitions.standard`.
