
#### 任务 5.2：结果与操作标签页 (ResultsTab) - 动态视图与执行控制

*   **目标：** 实现 ResultsTab，根据节点状态动态显示内容（不含 HITL），并集成执行控制操作。
*   **输入：** `<design_doc> (5.1.2 Tab 1)`, `<api> 5.2`, 任务 1.4 (WorkflowStore)。
*   **输出：** `ResultsTab.tsx`, `ExecutingView.tsx`, `FailedView.tsx`, `CompletedView.tsx`。
*   **核心关注点：** 状态驱动的视图切换；工件渲染；执行控制按钮集成（Re-execute, Retry, Cancel）；陈旧性警告显示。
*   **实现策略:**
    1.  **`ResultsTab.tsx`：** 实现状态路由逻辑。如果 `is_stale` 为 true，在顶部显示 `Alert`（Design Doc 3.1.2.3）。
    2.  **`ExecutingView`：** 显示 `current_stage`。实现“Cancel”按钮，连接 `WorkflowStore.cancelNode`。
    3.  **`FailedView`/`CanceledView`：** 显示错误日志。实现“Retry”按钮，连接 `WorkflowStore.retryNode`。
    4.  **`CompletedView`：** 渲染输出工件（使用 `Markdown` 组件）。实现“Re-execute”按钮（弹出对话框输入修改意见），连接 `WorkflowStore.reExecuteNode`。
    5.  **异步反馈：** 确保按钮点击后（API 202）有即时反馈（禁用按钮），并依赖 WebSocket 更新 UI。
*   **边界：** 实现除 HITL 和编辑模式外的所有状态视图和执行控制。
