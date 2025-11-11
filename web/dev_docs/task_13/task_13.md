
#### 任务 4.1：工作区执行视图布局实现 (Canvas + Inspector)

*   **目标：** 实现沉浸式工作区的核心布局（模板二）。
*   **输入：** `<design_doc> (5.1.2)`, `<architecture> (5.1.1)`, Shadcn Resizable。
*   **输出：** `app/(dashboard)/projects/[projectId]/layout.tsx`, `ExecutionView.tsx`, `ProjectControlBar.tsx`。
*   **核心关注点：** 全屏布局；可调整大小的面板集成；WebSocket 连接生命周期。
*   **实现策略:**
    1.  **`[projectId]/layout.tsx`：** 实现 `<architecture> 5.1.1` 布局。使用 `ResizablePanelGroup` 实现画布和检查器面板的可调分割。
    2.  **`ProjectControlBar.tsx`：** 实现顶部控制栏（项目信息、导出按钮占位）。
    3.  **`ExecutionView.tsx`：** 作为画布容器。在 `useEffect` 中，确保 `WorkflowStore.loadWorkflow` 被调用，并调用 `WebSocketManager.connect()`。在卸载时调用 `disconnect()`。
*   **边界：** 实现布局框架和 WebSocket 连接管理。
