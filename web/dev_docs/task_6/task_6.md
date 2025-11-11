
#### 任务 1.4：状态管理 - 工作流核心 (WorkflowStore & InspectorStore) 实现

*   **目标：** 实现复杂的工作流状态管理和检查器 UI 状态管理及对应的 API 服务。
*   **输入：** `<architecture> 3.1.4, 3.1.5`, `<api> (Docs 4 & 5)`, 任务 1.1。
*   **输出：** `core/store/WorkflowStore.ts`, `core/store/InspectorStore.ts`, `core/api/services/WorkflowService.ts`, `core/api/services/NodeService.ts`。
*   **核心关注点：** 数据规范化（Normalization）；使用 Immer 进行不可变更新；实现所有执行控制和版本控制动作。
*   **实现策略：**
    1.  **`WorkflowService.ts` & `NodeService.ts`：** 实现所有相关 API 调用（查询、执行控制、HITL、版本控制）。
    2.  **`WorkflowStore.ts`：** 实现 `<architecture> 3.1.4`。
        *   实现 `normalizeWorkflow` 辅助函数（将 `phases` 展平为 `nodes` 映射）。
        *   实现 `loadWorkflow`, `refreshWorkflow`。
        *   实现所有执行控制、HITL 和版本控制动作（`reExecuteNode`, `submitHITL`, `manualEdit`, `activateVersion` 等）。
        *   实现 WebSocket 处理程序骨架（`_processNodeUpdate`, `_processStructureUpdate`），使用 `immer` 的 `produce` 函数确保数据一致性（同时更新 `nodes` 映射和 `phases` 树）。
    3.  **`InspectorStore.ts`：** 实现 `<architecture> 3.1.5`。
        *   管理 UI 状态（`selectedNodeId`, `activeTab`, `isEditing`）。
        *   实现 `selectNode` 动作：并行获取节点详情和版本历史并缓存。处理加载状态和错误（如 403 超出执行前沿）。
*   **边界：** 实现工作流和检查器的核心状态管理逻辑。
