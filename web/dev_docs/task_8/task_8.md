
#### 任务 2.1：认证页面实现 (Login, Register, Verify)

*   **目标：** 构建用户认证流程的 UI 页面。
*   **输入：** 任务 1.2 (AuthStore/Service), `<api> (Doc 1)`, React Hook Form, Zod, Shadcn/ui。
*   **输出：** `app/(auth)/login/page.tsx`, `register/page.tsx`, `verify-email/page.tsx`。
*   **核心关注点：** 表单实现；错误处理（区分 401 和 403 未验证）；流程引导。
*   **实现策略：**
    1.  创建 `app/(auth)/layout.tsx`。
    2.  实现登录页：连接 `AuthStore.login`。根据 API Doc 1.1.1 指南处理错误提示。成功后重定向到 `/projects`。
    3.  实现注册页：连接 `AuthStore.register`。成功后显示“请检查邮箱激活账户”提示。
    4.  实现邮箱验证页：从 URL 获取 `token`，自动调用 `AuthStore.verifyEmail(token)`。显示结果状态。
*   **边界：** 实现认证 UI 流程。
