
#### 任务 4.2：React Flow 集成与布局算法实现

*   **目标：** 集成 React Flow，实现工作流数据的可视化布局（Phase/Stage/Node 层级）。
*   **输入：** `<architecture> (5.2.1)`, `<design_doc> (2.1.1)`, 任务 1.4 (WorkflowStore)。
*   **输出：** `WorkflowCanvas.tsx`, `LayoutUtils.ts`。
*   **核心关注点：** 数据转换（`phases` 到 `nodes`/`edges`）；布局算法（分列网格布局）。
*   **实现策略:**
    1.  **`WorkflowCanvas.tsx`：** 初始化 `ReactFlow` 实例。配置背景（点状网格）、控件、小地图。订阅 `WorkflowStore.workflow.phases`。
    2.  **`LayoutUtils.ts`：** 实现 `calculateLayout(phases)`。
        *   实现确定性的网格布局算法：将 Phase 映射为列，Stage/Node 在列内垂直排列。
        *   使用 React Flow 的 "Group Nodes" 功能创建代表 Stage 的父节点，以可视化分组。
        *   计算精确的 (x, y) 坐标并生成连接线（`edges`）。
    3.  **集成：** 使用 `useMemo` 在 `phases` 变化时重新计算布局。
*   **边界：** 实现画布和布局逻辑。
