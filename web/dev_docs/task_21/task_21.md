
#### 任务 7.1：人工编辑实现 (Manual Editing - R4)

*   **目标：** 集成富文本 (Tiptap/Novel) 和代码编辑器 (Monaco)，实现人工编辑和版本创建流程。
*   **输入：** `<design_doc> (5.1.4)`, `<architecture> (5.5)`, `<api> (5.4.1)`, Deer-Flow Editor 代码。
*   **输出：** `PlatformEditor.tsx` (封装 Novel/Monaco), 更新 `CompletedView.tsx`, `InspectorStore.ts`。
*   **核心关注点：** 编辑模式切换；编辑器集成；保存逻辑与版本摘要输入。
*   **实现策略:**
    1.  **编辑器封装：** 迁移并适配 Deer-Flow 的 Tiptap/Novel 实现。集成 Monaco Editor。创建 `PlatformEditor.tsx` 根据工件类型选择渲染。
    2.  **`InspectorStore` 更新：** 实现 `isEditing` 状态管理。
    3.  **`CompletedView.tsx` (更新):** 实现“Manual Edit”按钮。根据 `isEditing` 状态切换视图。
    4.  **保存流程：** 实现“Save & Activate”按钮。弹出 `Dialog` 输入 `summary`。调用 `WorkflowStore.submitManualEdit`。成功后退出编辑模式。
*   **边界：** 实现完整的人工编辑流程。
