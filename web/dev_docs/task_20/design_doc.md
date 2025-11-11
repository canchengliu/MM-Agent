--- (144-146 lines) ---
| HITL-6.4 | HITL 模式实现：VARL (审查式批准/拒绝)。 | P1 | 基础 HITL 模式。 | HITL_MODES |
| HITL-6.5 | HITL 模式实现：SCA (战略选择架构)。 | P1 | 核心 HITL 模式。 | HITL_MODES |
| HITL-6.6 | HITL 模式实现：AVL (对抗性验证循环)。 | P2 | 高级 HITL 模式。 | HITL_MODES |


--- (209-209 lines) ---
    *   **微妙的光影与质感。** 运用微妙的阴影、渐变和动态光效（参考 `Magic UI` 组件，如 `BorderBeam`, `ShineBorder`）来构建空间感和未来感，但必须保持克制，服务于功能。


--- (304-304 lines) ---
  * `hitl_mode` (Enum: "VARL", "SCA", "AVL"): 人机交互模式。


--- (417-424 lines) ---
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


--- (543-563 lines) ---
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


--- (682-698 lines) ---
**模式 A: SCA (战略选择架构)**

*   **交互:** 比较与选择。
*   **布局:**
    1.  **比较分析区:** 展示 AI 生成的综合比较分析报告。
    2.  **候选方案列表:** 使用 `Card` 或 `Accordion` 展示每个方案摘要。
    3.  **选择机制:** 使用 `RadioGroup`（单选）或 `Checkbox`（多选）。选中方案后，“批准”按钮激活。

**模式 B: AVL (对抗性验证循环)**

*   **交互:** 评审与裁决。
*   **布局:**
    1.  **待评审内容区:** 展示核心输出。
    2.  **批判与裁决列表:** 展示 AI Critic 的批判意见列表。
    3.  **裁决机制:** 针对每条批判，提供“采纳 (Accept)”和“拒绝 (Reject)”按钮。用户必须完成所有裁决后才能提交。
*   **迭代:** 提交后可能触发内部循环 (`AVLLoop`)，界面显示加载状态。



--- (897-926 lines) ---
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

**界面 B: AVL (对抗性验证循环) 模式**

**[A] 待验证内容区:**
*   显示核心输出内容（只读）。

**[B] 对抗性批判列表:**
*   列表形式展示每条批判意见。
*   每项包含：批判内容、建议修改、裁决控件（"Accept"/"Reject" 按钮组）。

**[C] HITL 操作栏:**
*   固定在面板底部。
*   按钮："Submit Adjudication" (完成所有裁决后激活)。



--- (1298-1300 lines) ---
  * **`ShineBorder` / 闪亮边框:**
      * **应用场景:** 用于关键容器（如选中的 HITL 候选方案卡片）的悬停或激活状态，提供精致的反馈。



--- (1490-1501 lines) ---
##### 3\. HITL 交互组件 (HITL Interaction Components)

**A. SCA 方案选择器 (SCA Candidate Selector)**

  * **结构:** `RadioGroup` 或带复选框的列表。
  * **方案卡片:** 使用定制的 `Card`。选中时卡片边框加粗并变为 `--primary`。可应用 `Magic UI ShineBorder` 增强选中状态的视觉效果。

**B. AVL 裁决列表 (AVL Adjudication List)**

  * **结构:** 列表项包含批判内容和裁决控件（按钮组 "Accept"/"Reject"）。
  * **状态:** 已裁决的项应在视觉上明确标记（例如，左侧边框显示裁决颜色：Success 或 Destructive）。未裁决项应有视觉提示。



--- (1665-1716 lines) ---
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

##### 5.1.3.2 界面 B: AVL (对抗性验证循环) 模式

**[A] HITL 内容区 (Scrollable)**

```
*   **[A.1] 待验证内容区:** 只读模式渲染核心输出。
*   **[A.2] 对抗性批判列表:**
    *   **批判项 (Critique Item):**
        *   布局：`border-b py-4`.
        *   内容：批判意见和建议修改。
        *   **裁决控件:** 按钮组 "Accept" / "Reject"。裁决后显示结果颜色。
```

**[B] HITL 操作栏 (Fixed Footer)**

  * 主按钮："Submit Adjudication" (完成所有裁决后激活)。

