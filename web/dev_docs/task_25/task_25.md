
#### 任务 8.3：国际化 (i18n) 与响应式设计

*   **目标：** 集成国际化支持，审查文案，并确保响应式设计（Desktop-First）。
*   **输入：** `<design_doc> (3.3, 4.1.3.3)`.
*   **输出：** 更新所有 UI 组件，`messages/en.json`，更新布局文件。
*   **核心关注点：** 文案规范化；工作区布局适应（`< lg` 断点）。
*   **实现策略:**
    1.  **i18n 集成：** 复用 Deer-Flow 的 `next-intl` 配置。系统地将所有 UI 硬编码文本提取到 `messages/en.json`，并使用 `useTranslations()`。根据 Design Doc 3.3 审查关键文案。
    2.  **响应式设计：** 在 `[projectId]/layout.tsx` 中，使用媒体查询或 Hook 检测屏幕尺寸。当尺寸小于 `lg` (1024px) 时，将 `ResizablePanel` 布局切换为 `Shadcn Drawer`（抽屉）模式来显示 `InspectorPanel`。
*   **边界：** 完成国际化、文案标准化和主要的响应式布局调整。