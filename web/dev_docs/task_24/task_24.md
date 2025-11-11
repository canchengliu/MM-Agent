
#### 任务 8.2：复杂动效和转场实现

*   **目标：** 实现 Design Doc 5.2 中定义的复杂动画效果，提升用户体验。
*   **输入：** `<design_doc> (5.2)`, 任务 0.2 (Motion Tokens), Framer Motion。
*   **输出：** 更新 `WorkflowCanvas.tsx`, `CustomNode.tsx`, `InspectorPanel.tsx`。
*   **核心关注点：** 布局动画（Layout Animation）；交错进入动画（Staggering）；内容切换动画（AnimatePresence）。
*   **实现策略:**
    1.  **动态结构更新 (5.2.2)：** 在 `WorkflowCanvas.tsx` 和 `CustomNode.tsx` 中，集成 Framer Motion。使用 `layout` 属性实现节点位置变化的平滑过渡。为新生成的节点实现交错进入动画（使用 `staggerChildren`）。
    2.  **节点状态转换 (5.2.1)：** 优化 `CustomNode.tsx` 中的状态过渡动画（如图标旋转、BorderBeam 淡入）。
    3.  **上下文切换 (5.2.4)：** 在 `InspectorPanel.tsx` 中，使用 `<AnimatePresence mode="wait">` 包裹内容区域（以 `selectedNodeId` 为 key），实现切换节点时的平滑转场。
*   **边界：** 实现指定的动画效果。
