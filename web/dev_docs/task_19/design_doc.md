--- (139-143 lines) ---
| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| HITL-6.1 | HITL 基础操作：批准 (Continue)。 | P0 | 推进工作流的核心动作。 | S6.1 |
| HITL-6.2 | HITL 基础操作：拒绝并提供修改意见 (Reject)。 | P1 | 支持迭代修正。 | S6.2 |
| HITL-6.3 | HITL 基础操作：丢弃本次执行 (Discard)。 | P1 | 用户反悔机制。 | S6.3 |


--- (304-304 lines) ---
  * `hitl_mode` (Enum: "VARL", "SCA", "AVL"): 人机交互模式。


--- (310-312 lines) ---
  * **临时状态 (用于执行和 HITL):**
      * `pending_result` (JSON | Null): 临时存储的执行结果或 HITL 候选数据。
      * `error_log` (Text | Null): 如果执行失败，存储错误日志。


--- (413-413 lines) ---
| **等待 HITL 批准 (Awaiting HITL Approval)** | 计算成功完成，等待用户在 HITL 界面进行交互。此状态下的结果是临时的 (`pending_result`)。 |


--- (417-425 lines) ---
**人机协同 (Human-in-the-Loop - HITL)**

| 术语 | 定义 |
| :--- | :--- |
| **HITL** | 工作流中强制性的人工干预环节。 |
| **VARL (Vetted Approval/Rejection Loop)** | 审查式批准/拒绝循环。对输出进行快速的“批准”或“拒绝”的二元选择。 |
| **SCA (Strategic Choice Architecture)** | 战略选择架构。AI 生成 N 个候选方案并进行比较分析，由人类选择一个或多个接受。 |
| **AVL (Adversarial Validation Loop)** | 对抗性验证循环。AI 扮演“红队”进行批判性评审，由人类逐项裁决争议。 |



--- (486-487 lines) ---
                      * `Awaiting HITL`: 显示 HITL 交互界面 (SCA/AVL/VARL) 和 `pending_result`。提供批准/拒绝/丢弃操作。
                      * `Completed`: 显示 `active_version` 的输出工件。提供“编辑”和“重新执行”操作。如果陈旧，显示警告。


--- (543-581 lines) ---
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

-----


--- (673-681 lines) ---
##### 2\. 多步骤 HITL 审批流程

HITL 交互统一发生在节点检查器面板中。

**通用 HITL 框架:**

*   **结构:** 分为“结果展示区”和底部的固定“操作栏”。
*   **操作栏:** 包含标准操作：“批准并继续”、“拒绝并修改”、“丢弃执行”。



--- (888-888 lines) ---
        *   **If `Awaiting HITL`:** (详见屏幕三)。


--- (897-913 lines) ---
#### 3.2.2.3 屏幕三：HITL 交互界面 (HITL Interaction Interface)

*   **位置:** 嵌入在屏幕二的节点检查器面板 [C.3, Tab 1] 中。

**界面 A: SCA (战略选择架构) 模式**

**[A] AI 比较分析区:**
*   `Card` 组件，显示 AI 生成的对比分析报告。

**[B] 候选方案列表:**
*   使用 `RadioGroup`（单选）或带复选框的列表（多选）。
*   每个方案用 `Accordion` 或 `Card` 展示，包含摘要和详情。

**[C] HITL 操作栏:**
*   固定在面板底部。
*   按钮："Discard", "Reject & Modify", "Approve & Continue" (选择方案后激活)。



--- (1621-1621 lines) ---
          * **`Awaiting HITL` 状态:** （详见 5.1.3）。布局切换为支持底部固定操作栏。


--- (1665-1699 lines) ---
#### 5.1.3 屏幕三：HITL 交互界面 (HITL Interaction Interface)

  * **位置:** 嵌入在节点检查器面板 [B.2.3] 中。

##### 5.1.3.1 界面 A: SCA (战略选择架构) 模式

**[布局容器]**

  * 布局：`flex flex-col h-full`.

**[A] HITL 内容区 (Scrollable)**

  * 布局：`flex-1 overflow-y-auto p-4`.

      * **[A.1] AI 比较分析区:**

          * 组件：`<Card>` (背景 `bg-muted`). `mb-6`.
          * 标题："Comparative Analysis".
          * 内容：使用 `prose prose-invert` 渲染分析报告。

      * **[A.2] 候选方案列表:**

          * 组件：`<RadioGroup>` 或带复选框的列表。
          * **方案卡片 (Candidate Card):**
              * 交互：点击卡片即选中。
              * **选中状态 (Selected):**
                  * 边框：`border-2 border-primary`.
                  * 视觉增强：应用 `<Magic UI ShineBorder>`，提供光泽流动效果。

**[B] HITL 操作栏 (Fixed Footer)**

  * 布局：`p-4 border-t border-border mt-auto flex justify-end gap-4`. 固定在底部。
  * 背景：`bg-card`.
  * 按钮："Discard" (`Destructive Outline`), "Reject & Modify" (`Secondary`), "Approve & Continue" (`Primary`, 选中后激活)。



--- (1785-1799 lines) ---
#### 5.2.3 场景三：HITL 交互反馈循环

**目标:** 提供流畅的反馈，清晰地传达 HITL 循环的状态。

**1. 提交反馈并等待重新执行**

  * **触发条件:** 用户点击“Reject & Modify”并提交。
  * **编排:**
    1.  **[即时反馈]** 提交按钮显示加载状态。
    2.  **[转场] 内容区域切换:** HITL 界面平滑过渡到“执行中”状态视图。
    <!-- end list -->
      * **实现:** 使用 `<AnimatePresence mode="wait">` 包裹内容区域。
      * **效果:** HITL 界面淡出，执行中视图淡入。
      * **参数:** `Transitions.standard`.



--- (1880-1880 lines) ---
  * **HITL 交互组件:** SCA 方案选择器和 AVL 裁决列表。


--- (1900-1900 lines) ---
  * 定义了工作流导航（回溯）、HITL 流程、版本切换和人工编辑的标准交互流程。


--- (1913-1913 lines) ---
  * **场景三：HITL 反馈循环:** 内容区域平滑转场。
