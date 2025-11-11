
#### 任务 5.1：检查器面板框架与导航实现

*   **目标：** 实现检查器面板的整体结构和标签页导航。
*   **输入：** `<design_doc> (5.1.2 C)`, `<architecture> (5.3)`, 任务 1.4 (InspectorStore)。
*   **输出：** `InspectorPanel.tsx`。
*   **核心关注点：** 数据订阅；面板头部；Shadcn Tabs 导航。
*   **实现策略:**
    1.  **`InspectorPanel.tsx`：** 实现面板框架。订阅 `InspectorStore` 获取 `details` 和加载状态。
    2.  **面板头部：** 显示选中节点信息和 `StatusBadge`。
    3.  **标签页导航：** 使用 Shadcn Tabs 实现（Results, History, Dependencies），并与 `InspectorStore.activeTab` 同步。
    4.  **状态处理：** 处理加载中和未选择节点的空状态。
*   **边界：** 实现面板框架和导航。
