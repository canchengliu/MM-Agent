
#### 任务 1.1：API 类型定义与通用 API 客户端实现

*   **目标：** 定义所有后端 API 的 TypeScript 类型，并实现一个健壮的、集中式的 REST API 客户端。
*   **输入：** `<api> (所有文档)`, `<architecture> 4.1`.
*   **输出：** `core/api/types/`（所有类型定义）, `core/api/ApiClient.ts`, `core/api/utils.ts`。
*   **核心关注点：** 类型定义的完整性；JWT 注入；全局错误处理（特别是 401）；支持 `FormData` 和 `x-www-form-urlencoded`。
*   **实现策略：**
    1.  **类型定义：** 系统地将所有 API 文档中的“核心响应模型定义”转换为 TypeScript 接口，存放在 `core/api/types/` 下（按模块划分文件）。
    2.  **`resolveServiceURL`：** 在 `core/api/utils.ts` 中实现（复用 Deer-Flow 逻辑）。
    3.  **`ApiClient.ts`：** 实现 `<architecture> 4.1` 定义的 `apiClient.request`。实现从 `AuthStore`（待创建）动态获取 Token 并注入 `Authorization` 头。实现全局 401 错误处理（调用 `AuthStore.logout()`）。实现对不同 `Content-Type` 的请求处理。
*   **边界：** 仅实现客户端基础架构和类型定义。
