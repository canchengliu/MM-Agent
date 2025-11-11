
#### 任务 1.2：状态管理 - 认证与用户设置 (AuthStore & SettingsStore) 实现

*   **目标：** 实现用户会话和用户设置的状态管理逻辑及对应的 API 服务。
*   **输入：** `<architecture> 3.1.1, 3.1.2`, `<api> (Docs 1 & 2)`, 任务 1.1。
*   **输出：** `core/store/AuthStore.ts`, `core/store/SettingsStore.ts`, `core/api/services/AuthService.ts`, `core/api/services/UserService.ts`。
*   **核心关注点：** Token 持久化（`sessionStorage`）；BYOK“写后即忘”模型（`has_api_key` 标志同步）。
*   **实现策略：**
    1.  **`AuthService.ts` & `UserService.ts`：** 实现所有相关 API 调用。
    2.  **`AuthStore.ts`：** 实现 `<architecture> 3.1.1`。使用 `zustand/persist` 中间件。实现 `login`, `logout`, `register`, `initialize` 动作。`login` 成功后需获取用户 Profile 和 Settings。
    3.  **`SettingsStore.ts`：** 实现 `<architecture> 3.1.2`。实现 `fetchSettings`, `updateSettings`。`updateSettings` 需实现乐观更新，并在 API 成功后同步后端响应（确保 BYOK 标志正确）。
*   **边界：** 实现认证和用户设置的完整数据流逻辑。
