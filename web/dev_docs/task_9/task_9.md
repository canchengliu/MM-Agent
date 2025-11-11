
#### 任务 2.2：全局应用外壳和导航实现

*   **目标：** 实现受保护路由的全局布局外壳和导航栏。
*   **输入：** `<design_doc> (2.2.1, 3.2.1)`, 任务 1.2 (AuthStore), 任务 1.5 (ConnectionStore)。
*   **输出：** `app/(dashboard)/layout.tsx`, `components/platform/GlobalNavbar.tsx`, `hooks/useAuth.ts`。
*   **核心关注点：** 路由保护；全局导航链接；用户信息显示；WebSocket 状态指示器。
*   **实现策略：**
    1.  **`useAuth.ts`：** 实现路由保护 Hook，检查 `AuthStore` 状态并重定向。
    2.  **`(dashboard)/layout.tsx`：** 实现应用外壳布局，应用路由保护。在加载时调用 `AuthStore.initialize()`。
    3.  **`GlobalNavbar.tsx`：** 实现导航栏。显示用户 `display_name`，提供 `logout`。集成 `ThemeToggle`。
    4.  **连接状态指示器：** 创建 `ConnectionStatusIndicator.tsx`，订阅 `ConnectionStore`，在 `GlobalNavbar` 中集成。断开连接时显示全局横幅警告（Design Doc 3.1.2.2）。
*   **边界：** 实现全局导航和布局框架。
