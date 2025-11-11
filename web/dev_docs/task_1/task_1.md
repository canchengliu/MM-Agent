#### 任务 0.1：代码库清理与项目结构初始化

*   **目标：** 将 Deer-Flow 代码库重构为 O-Award 平台的初始结构，移除无关代码，集成必要的新依赖。
*   **输入：** `<deer_flow_frontend_code>`, `<architecture> (Section 2)`, `<front_stack>`.
*   **输出：** 清理后的、符合 O-Award 架构的项目骨架。
*   **核心关注点：** 目录结构调整，依赖项管理，代码清理。
*   **实现策略：**
    1.  **清理 `app/` 目录：** 删除 `app/chat/` 和 `app/landing/`。根据 `<architecture> 2` 创建新的路由分组和占位文件：`app/(auth)/`（`login/`, `register/`, `verify-email/`）和 `app/(dashboard)/`（`projects/`, `settings/`, `projects/[projectId]/`）。修改 `app/page.tsx` 重定向到 `/projects`。
    2.  **清理 `core/` 目录：** 移除 Deer-Flow 特定的 API（如 `chat.ts`）。清空或删除旧的 `store/` 内容。保留 `core/utils/`。
    3.  **重组 `components/` 目录：** 保留 `ui/` 和 `magicui/`。将 `components/deer-flow/` 重命名为 `components/platform/`，迁移可复用的通用组件（如 `ThemeProviderWrapper`, `Tooltip`, `Markdown`）。保留 `components/editor/` 备用。
    4.  **配置与依赖：** 更新 `src/env.js`。安装新依赖：`immer`（用于 Zustand 不可变更新），`@monaco-editor/react`（代码编辑），`react-resizable-panels` (Shadcn Resizable)。
*   **边界：** 仅关注结构、依赖和清理。
