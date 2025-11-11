
#### 任务 1.5：实时通信基础设施 (WebSocket Manager) 实现

*   **目标：** 实现 WebSocket 连接管理、认证和事件分发机制。
*   **输入：** `<api> (Doc 6)`, `<architecture> 4.3`, 任务 1.2 (AuthStore), 任务 1.4 (WorkflowStore)。
*   **输出：** `core/websocket/WebSocketManager.ts`, `core/websocket/EventHandler.ts`, `core/store/ConnectionStore.ts`。
*   **核心关注点：** 连接生命周期管理；JWT 认证；断线重连（指数退避）；重连后的状态同步 (API Doc 6.1.3)。
*   **实现策略：**
    1.  **`ConnectionStore.ts`：** 创建新的 Store 管理全局连接状态（`isConnected`, `isReconnecting`）。
    2.  **`WebSocketManager.ts` (单例):** 实现 `<architecture> 4.3.1`。
        *   `connect(workflowId)`：从 `AuthStore` 获取 Token 构建 WS URL。
        *   `onopen`：更新 `ConnectionStore`，调用 `WorkflowStore.refreshWorkflow()` 进行状态同步。
        *   `onclose`/`onerror`：更新 `ConnectionStore`，实现指数退避重连逻辑。
    3.  **`EventHandler.ts`:** 实现 `<architecture> 4.3.2`。解析事件并调用 `WorkflowStore` 的处理程序。对 `NODE_ACTIVE_VERSION_CHANGED` 事件，调用 `refreshWorkflow()`。
*   **边界：** 实现通信基础设施和事件分发逻辑。
