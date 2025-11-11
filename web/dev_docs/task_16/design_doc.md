--- (482-491 lines) ---
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


--- (643-644 lines) ---
*   **画布+检查器模式 (Canvas + Inspector):** 这是平台的核心交互模型。用户在主区域（画布或列表）中选择一个对象，其详细信息和相关操作会在侧边的“检查器面板 (Inspector Panel)”中加载和显示。
*   **单一焦点原则:** 在任意时刻，工作流画布中只有一个节点处于选中（Focused）状态。点击节点会立即选中它，并取消之前的选择。选中的节点应有清晰的视觉高亮。


--- (727-738 lines) ---
**节点生命周期状态 (`NodeStatus`) 可视化规范:**

建立一套一致的视觉语言（图标 + 色彩 + 动画）应用于工作流画布和检查器面板。

| 状态 | 图标 (Lucide Icon) | 颜色 (Semantic Color) | 动画与效果 |
| :--- | :--- | :--- | :--- |
| **Not Started** | `Circle` (虚线) | 中性灰 (Gray) | 无。若未解锁，显示为置灰状态。 |
| **Executing** | `Loader` (旋转) | 主色 (Blue/Primary) | 旋转动画。节点边缘可应用微妙的动态光效（`Magic UI BorderBeam`）。 |
| **Awaiting HITL Approval** | `UserCheck` 或 `Hand` | 警告色 (Yellow/Amber) | 微妙的脉动效果或闪烁，以吸引用户注意。 |
| **Completed** | `CheckCircle` (实心) | 成功色 (Green) | 状态变化时有平滑的转场动画。 |
| **Failed** | `XCircle` (实心) | 错误色 (Red) | 醒目，静态。 |



--- (803-812 lines) ---
**模板二：沉浸式工作区布局 (Immersive Workspace Layout - Canvas + Inspector)**

*   **适用场景:** L2.2.B 工作流执行视图。
*   **结构:** 全屏、全高布局。
    *   **[A] 项目控制栏:** 位于顶部。提供项目级上下文和操作。
    *   **[B] 工作区容器:** 占据剩余所有高度。采用水平 Flex 布局。
        *   **[B.1] 工作流画布区 (Canvas):** 占据主要空间 (`flex-1`)。承载 React Flow 可视化。
        *   **[B.2] 节点检查器面板 (Inspector):** 固定在右侧。固定宽度（例如 `w-96` 或 `w-1/3`）。支持独立滚动。
*   **动态调整:** B.1 和 B.2 之间应提供一个可拖拽的分隔条（Resizable Splitter），并支持折叠/展开 B.2。



--- (822-832 lines) ---
**2\. 上下文状态导航 (Contextual State Navigation - State Driven)**

*   **机制:** 基于客户端状态管理（`Zustand`）而非 URL 路由。
*   **用途:** 在工作流执行视图中切换焦点节点（回溯和审查）。
*   **行为:** 用户点击画布节点，更新 `selectedNodeId` 状态，检查器面板局部更新内容。URL 保持不变（或仅更新查询参数 `?node={id}`）。这使得导航极为快速和流畅。

**3\. 标签页导航 (Tabbed Navigation)**

*   **机制:** 使用 `Shadcn Tabs`。
*   **用途:** 在节点检查器面板内部组织信息（结果、历史、依赖）。



--- (876-894 lines) ---
**[C] 节点检查器面板 (Node Inspector Panel):**
*   右侧固定面板。

    **[C.1] 面板头部:** 选中节点的名称、状态。折叠按钮。
    **[C.2] 标签页导航:** Tabs: "Results & Actions", "History", "Dependencies".
    **[C.3] 标签页内容 (动态):**

    *   **Tab 1: Results & Actions (根据状态变化):**
        *   **If Stale:** 顶部显示陈旧性警告 `Alert`。
        *   **If `Completed`:**
            *   操作工具栏："Manual Edit", "Re-execute"。
            *   输出工件展示区（Markdown, Code, etc.）。
        *   **If `Awaiting HITL`:** (详见屏幕三)。
        *   **If `Executing`:** 加载指示器和 `current_stage` 文本。
        *   **If `Failed`:** 错误日志展示区。按钮 "Retry"。

    *   **Tab 2: History:** 版本历史列表（详见屏幕四）。
    *   **Tab 3: Dependencies:** 上游依赖列表和版本一致性检查报告。



--- (1597-1624 lines) ---
**[B.2] 节点检查器面板 (Node Inspector Panel)**

  * 布局：`w-96 lg:w-[480px] flex flex-col border-l border-border overflow-y-auto`. 固定在右侧。

  * 背景：`bg-card`.

  * **(注):** B.1 和 B.2 之间应实现可拖拽分隔器。

    **[B.2.1] 面板头部 (Panel Header):**

      * 布局：`p-4 border-b`.
      * 内容：选中节点的名称 (H4: `text-xl font-semibold`) 和当前状态 `<Badge>`.

    **[B.2.2] 标签页导航 (Tabs Navigation):**

      * 组件：`<Tabs>`.
      * Tabs: "Results & Actions", "History", "Dependencies".

    **[B.2.3] 标签页内容 (Tabs Content):**

      * 布局：`p-4`.
      * **Tab 1: Results & Actions (动态内容):**
          * **陈旧性警告 (If Stale):** 如果节点陈旧，顶部显示 `<Alert variant="warning">`。文案遵循 3.3.4。
          * **`Completed` 状态:** 显示操作工具栏（Edit, Re-execute）和输出工件（Markdown 渲染）。
          * **`Awaiting HITL` 状态:** （详见 5.1.3）。布局切换为支持底部固定操作栏。
          * **`Executing` 状态:** 居中显示旋转 `Loader` 图标和 `current_stage` 文本。
          * **`Failed` 状态:** 显示错误摘要 `<Alert variant="destructive">` 和详细错误日志（Code block）。底部显示 "Retry" 按钮。



--- (1808-1814 lines) ---
**1. 切换焦点节点 (Switching Focused Node)**

  * **触发条件:** 用户点击画布上的另一个节点。
  * **效果:** 检查器面板内容快速切换。
      * **实现:** 使用 `<AnimatePresence mode="wait">` 包裹检查器面板的内容区，以 `selectedNodeId` 作为 `key`。
      * **参数:** 使用 `duration.fast` (0.2s)。`Transitions.standard`.

