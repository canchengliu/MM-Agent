
#### 任务 2.3：用户设置中心实现

*   **目标：** 实现用户设置中心页面 (L2.3)。
*   **输入：** 任务 1.2 (SettingsStore/Service), `<api> (Doc 2)`, `<design_doc> (2.2.2 L2.3)`.
*   **输出：** `app/(dashboard)/settings/page.tsx` 及其 Tab 组件。
*   **核心关注点：** BYOK 字段的 UI 处理（密码类型，`has_key` 状态）；表单实现。
*   **实现策略:**
    1.  实现 `settings/page.tsx` 布局（侧边栏+内容区）。确保 `SettingsStore.fetchSettings()` 已调用。
    2.  实现各个 Tab 组件（Interface, Engine/BYOK, AI Behavior）。使用 React Hook Form + Zod。
    3.  **BYOK UI 实现：** 严格实现 API Doc 2 的要求。根据 `has_api_key` 显示占位符（“已设置，输入以覆盖”）。确保输入框类型为 `password`。支持发送空字符串以清除密钥。
    4.  连接表单提交到 `SettingsStore.updateSettings`。
*   **边界：** 实现设置页面的 UI 和逻辑。
