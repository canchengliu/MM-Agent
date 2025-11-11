
#### 任务 3.2：项目配置视图实现与启动流程

*   **目标：** 实现项目工作区入口点、配置视图 (L2.2.A)，并完成启动工作流流程。
*   **输入：** 任务 1.3, `<design_doc> (2.2.2 L2.2.A, 2.3.1)`, `<api> (Doc 3)`.
*   **输出：** `app/(dashboard)/projects/[projectId]/page.tsx`, `ConfigurationView.tsx`, `FileUploader.tsx`。
*   **核心关注点：** 状态驱动的视图切换；文件上传与角色管理；启动前置条件校验；历史案例初始化。
*   **实现策略:**
    1.  **`[projectId]/page.tsx`：** 实现入口点。调用 `loadActiveProject`。根据 `status` 条件渲染 `ConfigurationView` 或 `ExecutionView`（占位符）。
    2.  **`ConfigurationView.tsx`：**
        *   实现元数据编辑表单（名称、描述、赛题类型）。
        *   实现 `FileUploader.tsx` 和 `FileList.tsx`：处理文件上传（`FormData`）和角色分配。
        *   实现历史案例初始化 UI：获取历史案例列表并实现选择初始化。
        *   实现“启动工作流”按钮：实现客户端激活条件逻辑（已设类型，已上传问题描述）。
    3.  **启动流程：** 点击按钮调用 `ProjectsStore.startWorkflow`。确认状态更新后 UI 自动切换到 `ExecutionView`。
*   **边界：** 实现项目配置和启动工作流的完整流程。
