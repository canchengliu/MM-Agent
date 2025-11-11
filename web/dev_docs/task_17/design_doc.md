--- (123-123 lines) ---
| VER-4.6 | 静默状态管理与“陈旧性”(Staleness)检测与提示。 | P1 | 核心设计哲学。系统提示但不干预。 | S1.4, R5.2 |


--- (133-134 lines) ---
| WFC-5.5 | 重新执行 (Re-execution)。对已完成节点提供新意见，触发全新执行。 | P1 | 支持迭代探索。 | S5.4, R5.5.1 |
| WFC-5.6 | 重试 (Retry)。针对失败节点进行重试。 | P1 | 错误恢复机制。 | S5.5 |


--- (295-313 lines) ---

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



--- (407-416 lines) ---
**节点生命周期状态 (Node Lifecycle Status - `NodeStatus`)**

| 状态 | 定义 |
| :--- | :--- |
| **未开始 (Not Started)** | 节点从未被执行过。 |
| **执行中 (Executing)** | 节点的计算/LLM 推理正在进行。 |
| **等待 HITL 批准 (Awaiting HITL Approval)** | 计算成功完成，等待用户在 HITL 界面进行交互。此状态下的结果是临时的 (`pending_result`)。 |
| **已完成 (Completed)** | 节点拥有一个或多个已批准的版本，且存在一个 `Active Version`。 |
| **执行失败 (Failed)** | 节点的计算执行失败。 |



--- (485-491 lines) ---
                  * **Tab 1: 执行与结果 (Execution & Results):** 根据节点状态动态变化。
                      * `Awaiting HITL`: 显示 HITL 交互界面 (SCA/AVL/VARL) 和 `pending_result`。提供批准/拒绝/丢弃操作。
                      * `Completed`: 显示 `active_version` 的输出工件。提供“编辑”和“重新执行”操作。如果陈旧，显示警告。
                      * `Executing`: 显示执行进度 (`current_stage`)。
                      * `Failed`: 显示错误日志。提供“重试”操作。
                  * **Tab 2: 版本历史 (Version History):** 列出所有历史版本。提供“审查”和“激活此版本”操作。
                  * **Tab 3: 依赖关系 (Dependencies):** 显示上游输入依赖。清晰展示“陈旧性”报告详情。


--- (600-604 lines) ---
10. **[系统反馈 (UI)]** 节点检查器加载 Node B，并显示醒目提示：“输入已变更（Node A 已切换为 V1）。建议重新执行。”
11. **[用户动作 (手动重新执行)]** 用户点击 Node B 的“重新执行”按钮并确认。
12. **[系统响应 (API)]** 调用 `POST /nodes/{B_id}/re-execute`。
13. **[系统响应 (后端逻辑 - 依赖解析)]** 系统执行 Node B，自动拉取 Node A 的**当前激活版本 (V1)** 作为输入。
14. **[系统反馈 (UI)]** Node B 状态变为 `Executing`。陈旧性提示消失。


--- (723-763 lines) ---
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



--- (883-890 lines) ---
    *   **Tab 1: Results & Actions (根据状态变化):**
        *   **If Stale:** 顶部显示陈旧性警告 `Alert`。
        *   **If `Completed`:**
            *   操作工具栏："Manual Edit", "Re-execute"。
            *   输出工件展示区（Markdown, Code, etc.）。
        *   **If `Awaiting HITL`:** (详见屏幕三)。
        *   **If `Executing`:** 加载指示器和 `current_stage` 文本。
        *   **If `Failed`:** 错误日志展示区。按钮 "Retry"。


--- (990-991 lines) ---
| 对已完成节点发起新执行 | Re-execute | 用于探索性执行。 |
| 对失败节点再次尝试 | Retry | 用于错误恢复。 |


--- (1006-1015 lines) ---
**2\. 陈旧性提示 (Staleness Alerts)**

*   **范式:** 状态 + 原因 + 建议操作。
*   **示例:** `Warning: Input Outdated (Stale). Upstream node [Node A] has updated from V1 to V2. It is recommended to Re-execute this node to sync the latest data.`

**3\. 错误信息 (Error Messages)**

*   **范式:** 发生了什么 + 为什么发生 + 如何解决。
*   **示例:** `Execution Failed. The Python script encountered an error at line 42. Please review the execution log for details and Retry.`



--- (1197-1202 lines) ---
**2. 生成的报告内容 (Markdown/LaTeX Rendering)**

  * **技术基础:** `Tiptap/Novel`, `react-markdown`, `@tailwindcss/typography` (prose)。
  * **基础字体:** `Body M` (16px)，行高 1.7。
  * **定制化:** 必须定制 `prose` 样式以适应全局字体和色彩主题（特别是深色模式 `prose-invert`）。
  * **数学公式 (KaTeX):** 确保 KaTeX 渲染的字体大小与周围文本协调一致。


--- (1617-1624 lines) ---
      * 布局：`p-4`.
      * **Tab 1: Results & Actions (动态内容):**
          * **陈旧性警告 (If Stale):** 如果节点陈旧，顶部显示 `<Alert variant="warning">`。文案遵循 3.3.4。
          * **`Completed` 状态:** 显示操作工具栏（Edit, Re-execute）和输出工件（Markdown 渲染）。
          * **`Awaiting HITL` 状态:** （详见 5.1.3）。布局切换为支持底部固定操作栏。
          * **`Executing` 状态:** 居中显示旋转 `Loader` 图标和 `current_stage` 文本。
          * **`Failed` 状态:** 显示错误摘要 `<Alert variant="destructive">` 和详细错误日志（Code block）。底部显示 "Retry" 按钮。



--- (1791-1799 lines) ---
  * **触发条件:** 用户点击“Reject & Modify”并提交。
  * **编排:**
    1.  **[即时反馈]** 提交按钮显示加载状态。
    2.  **[转场] 内容区域切换:** HITL 界面平滑过渡到“执行中”状态视图。
    <!-- end list -->
      * **实现:** 使用 `<AnimatePresence mode="wait">` 包裹内容区域。
      * **效果:** HITL 界面淡出，执行中视图淡入。
      * **参数:** `Transitions.standard`.

