
#### 任务 4.3：自定义节点卡片（CustomNode）实现与交互

*   **目标：** 实现高保真的工作流节点卡片 UI、状态显示、动态效果和交互。
*   **输入：** `<design_doc> (5.1.2.1, 3.1.2.1)`, `<architecture> (5.2.2)`, Magic UI (BorderBeam)。
*   **输出：** `CustomNode.tsx`, `StatusBadge.tsx` (更新), `StalenessIndicator.tsx`。
*   **核心关注点：** 状态可视化；`Executing` 状态的 `BorderBeam` 效果；`is_stale` 指示器；节点选择交互。
*   **实现策略:**
    1.  **`StatusBadge.tsx` (更新):** 扩展以支持所有 `NodeStatus` 和颜色（Design Doc 3.1.2.1）。
    2.  **`StalenessIndicator.tsx`：** 创建陈旧性警告图标组件。
    3.  **`CustomNode.tsx`：** 创建自定义节点组件（参考 `<architecture> 5.2.2`）。
    4.  **动态效果：** 当 `status === 'Executing'` 时，集成并显示 `BorderBeam`。当 `status === 'Awaiting HITL'` 时，添加微妙脉动效果（Framer Motion）。
    5.  **交互：** 实现 `selected` 状态样式。在 `WorkflowCanvas.tsx` 中实现 `onNodeClick`，调用 `InspectorStore.selectNode(nodeId)`。
*   **边界：** 实现节点 UI、视觉效果和选择交互。
