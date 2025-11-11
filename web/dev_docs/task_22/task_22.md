
#### 任务 7.2：版本切换与陈旧性管理实现

*   **目标：** 实现历史版本的激活功能，并确保陈旧性管理（静默状态管理）正确运行。
*   **输入：** `<design_doc> (3.1.2.3, 3.3.4)`, `<api> (5.4.2)`, 任务 5.4 (HistoryTab)。
*   **输出：** 更新 `HistoryTab.tsx`。
*   **核心关注点：** “Activate”操作；强制性确认对话框（警告下游陈旧性）；Generator 节点限制；WebSocket 联动刷新验证。
*   **实现策略:**
    1.  **`HistoryTab.tsx` (更新):** 实现“Activate”按钮逻辑。
    2.  **限制：** 禁用 Generator 节点的激活按钮。
    3.  **确认对话框：** 弹出 `AlertDialog`，文案严格遵循 Design Doc 3.3.4。
    4.  **激活逻辑：** 确认后，调用 `WorkflowStore.activateVersion`。
    5.  **验证陈旧性：** 确认操作后，WebSocket 事件（`NODE_ACTIVE_VERSION_CHANGED`）能正确触发 `refreshWorkflow`（已在任务 1.5 实现），并更新 UI 上的陈旧性标志（已在任务 4.3 实现）。
*   **边界：** 实现版本切换和陈旧性管理的完整闭环。
