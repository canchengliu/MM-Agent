
#### 任务 5.3：历史与依赖标签页实现

*   **目标：** 实现“History”和“Dependencies”标签页的内容展示。
*   **输入：** `<design_doc> (5.1.2 Tab 2 & 3)`, 任务 1.4 (InspectorStore)。
*   **输出：** `HistoryTab.tsx`, `DependenciesTab.tsx`, `VersionReviewDialog.tsx`。
*   **核心关注点：** 版本列表展示；版本审查（模态框）；依赖关系和陈旧性详情展示。
*   **实现策略:**
    1.  **`HistoryTab.tsx`：** 渲染 `InspectorStore.versionHistory`。实现“Review”按钮，打开 `VersionReviewDialog` 显示历史版本快照。
    2.  **`DependenciesTab.tsx`：** 显示上游依赖。如果存在 `staleness_report`，清晰高亮显示版本不一致详情。
*   **边界：** 实现信息展示功能。
