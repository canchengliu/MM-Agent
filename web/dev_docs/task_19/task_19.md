
#### 任务 6.1：HITL 容器与提交流程实现

*   **目标：** 实现 HITL 交互的通用容器和数据提交流程。
*   **输入：** `<api> (5.3 HITL)`, `<design_doc> (5.1.3)`, `<architecture> (5.4)`.
*   **输出：** `HITLContainer.tsx`, 更新 `WorkflowStore.ts` (HITL actions)。
*   **核心关注点：** 布局（内容区 + 固定操作栏）；`submitHITL` 调用与响应处理（根据 `action` 字段决定下一步操作）。
*   **实现策略:**
    1.  **`HITLContainer.tsx`：** 实现容器框架和布局。根据 `node.hitl_mode` 分发到专业接口组件。
    2.  **通用操作栏：** 实现“Discard”、“Reject & Modify”（需输入反馈）、“Approve”的基础逻辑。
    3.  **`WorkflowStore.submitHITL` (完善)：** 处理 API 响应，根据返回的 `action`（如 `ExecuteNext`, `NavigateNext`）执行后续操作（如导航到下一节点）。
*   **边界：** 实现 HITL 通用框架和提交流程。
