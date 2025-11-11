
#### 任务 0.2：设计系统实现（色彩、字体、主题、动效）

*   **目标：** 实现 Design Doc Phase 4.1 和 4.2 定义的“精密未来主义”设计系统和动效令牌。
*   **输入：** `<design_doc> 4.1, 4.2`.
*   **输出：** 更新后的 `styles/globals.css`, `components/platform/ThemeProviderWrapper.tsx`, 新建 `src/styles/motion-tokens.ts`。
*   **核心关注点：** CSS 变量精确定义 (4.1.1.3)；深色模式优先；Geist 字体配置；全局圆角基准 (4.1.4.2)；动效令牌定义 (4.2.2.3)。
*   **实现策略：**
    1.  **`styles/globals.css`：** 严格按照 Design Doc 4.1.1.3 的规范，在 `:root` 和 `.dark` 中定义所有 CSS 变量（HSL 格式）。设置 `--radius: 0.375rem`。
    2.  **字体配置：** 确保 `app/layout.tsx` 正确加载 Geist 字体（复用 Deer-Flow）。
    3.  **`ThemeProviderWrapper.tsx`：** 配置 `next-themes`，设置 `defaultTheme="dark"`, `enableSystem={true}`。
    4.  **`src/styles/motion-tokens.ts`：** 创建文件并严格按照 Design Doc 4.2.2.3 实现 `MotionDurations`, `MotionEasings`, `Transitions` 常量。
*   **边界：** 仅关注全局视觉基础配置和动效令牌定义。
