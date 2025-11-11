
#### 任务 1.3：状态管理 - 项目管理 (ProjectsStore) 实现

*   **目标：** 实现项目管理的状态管理逻辑及对应的 API 服务。
*   **输入：** `<architecture> 3.1.3`, `<api> (Doc 3)`, 任务 1.1。
*   **输出：** `core/store/ProjectsStore.ts`, `core/api/services/ProjectService.ts`。
*   **核心关注点：** 管理 `projects` 列表和 `activeProject` 详情；CRUD 操作；文件上传；`startWorkflow` 的状态转换逻辑。
*   **实现策略：**
    1.  **`ProjectService.ts`：** 实现所有项目管理 API 调用（CRUD, `uploadFile`, `initializeFromHistorical`, `startWorkflow`, `getHistoricalProblems`, `exportProject`）。
    2.  **`ProjectsStore.ts`：** 实现 `<architecture> 3.1.3`。实现所有定义的动作。重点关注 `startWorkflow` 动作：处理 202 响应，并立即更新本地 `activeProject` 的 `status` 为 `Running` 和 `workflow_instance_id`。
*   **边界：** 实现项目管理的完整数据流逻辑。
