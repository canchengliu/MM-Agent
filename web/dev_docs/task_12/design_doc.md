--- (94-96 lines) ---
| PMG-2.3 | 项目配置：文件上传与角色定义。 | P0 | 工作流输入的基础。 | R3.2 |
| PMG-2.4 | 项目配置：赛题类型选择 (A-F, -)。 | P0 | | R3.4 |
| PMG-2.5 | 项目状态管理（Configuring, Running, Completed）。 | P0 | 控制项目生命周期。 | R2.1 |


--- (99-99 lines) ---
| PMG-2.8 | 从历年赛题库初始化项目。 | P3 | 便利性功能。 | R3.3 |


--- (105-105 lines) ---
| WFE-3.1 | 工作流实例化与启动。 | P0 | 核心操作。依赖 PMG-2.3, PMG-2.4。 | R3.5 |


--- (110-110 lines) ---
| WFE-3.6 | 配置快照创建。启动工作流时捕获用户设置。 | P1 | 确保可复现性。 | R3.5 |


--- (267-283 lines) ---
##### 3\. 项目 (Project)

用户工作的基本单元，封装一次完整的建模尝试。

  * `id` (Integer), `user_id` (Integer), `name` (String), `description` (String).
  * `status` (Enum: "Configuring", "Running", "Completed"): 项目生命周期状态。
  * `problem_type` (Enum: "A"-"F", "-"): 建模赛题类型。
  * `workflow_instance_id` (Integer | Null): 关联的工作流实例 ID。
  * `created_at`, `updated_at` (DateTime).

##### 4\. 项目文件 (ProjectFile)

用户上传的、与项目关联的输入文件。

  * `id` (Integer), `project_id` (Integer), `filename` (String).
  * `role` (Enum: "Problem Description", "Dataset", "Reference Material"): 文件角色。



--- (461-471 lines) ---
  * **布局结构:** 此视图的布局会根据项目的当前状态 (`Configuring` 或 `Running`/`Completed`) 动态切换。

    **L2.2.A: 项目配置视图 (Project Configuration View) (当 `Configuring`)**

      * **描述:** 用户上传文件、定义角色、选择赛题类型的界面。
      * **主要内容:**
          * 项目元数据编辑区（名称、描述、赛题类型）。
          * 文件管理区（上传、角色定义）。
          * 初始化选项（自定义 vs. 历年赛题）。
          * 核心操作：“启动工作流 (Start Workflow)” 按钮（满足前置条件后激活）。



--- (472-474 lines) ---
    **L2.2.B: 工作流执行视图 (Workflow Execution View) (当 `Running`/`Completed`)**

      * **描述:** 平台的核心操作区，采用“画布+检查器”布局模型。


--- (506-508 lines) ---
3.  **状态驱动的视图切换:** 在 L2.2 中，系统根据项目状态自动选择显示配置视图 (L2.2.A) 或执行视图 (L2.2.B)。
4.  **上下文导航 (Contextual Navigation - 支持回溯):** 在工作流执行视图 (L2.2.B) 中，用户通过点击画布 (B.2) 中的不同节点来切换焦点。这不会改变 URL 路由，而是更新节点检查器面板 (B.3) 的内容。这使得用户可以在保持全局上下文的同时进行回溯和审查。
5.  **流程推进 (Proceeding):** 在 HITL 环节点击“继续”后，系统会自动将焦点推进到下一个节点。


--- (516-541 lines) ---
#### 2.3.1 场景一：项目初始化并启动工作流

**目标:** 用户创建一个新项目，配置必要的输入，并成功启动建模工作流。
**入口点:** L2.1: 项目仪表板。

**流程描述:**

1.  **[用户动作]** 点击“新建项目”，输入信息并创建。
2.  **[系统响应 (API)]** `POST /projects/`。成功后导航至 L2.2.A: 项目配置视图。
3.  **[系统状态]** 项目状态 `Configuring`。“启动工作流”按钮禁用。
4.  **[用户动作]** 上传赛题描述文件，并设置角色为 "Problem Description"。
5.  **[系统响应 (API)]** `POST /projects/{id}/files`。
6.  **[用户动作]** 选择赛题类型（如 "A"）。
7.  **[系统响应 (API)]** `PATCH /projects/{id}`。
8.  **[系统反馈 (UI)]** 所有前置条件满足，“启动工作流”按钮激活。
9.  **[用户动作]** 点击“启动工作流”。
10. **[系统响应 (关键操作)]**
      * **(API):** 调用 `POST /projects/{id}/start`。
      * **(后端逻辑):** 创建配置快照；创建 `WorkflowInstance`；更新项目状态为 `Running`；启动第一个节点执行。
      * **(API 响应):** 返回 `202 Accepted`。
11. **[系统反馈 (UI):** 自动导航至 L2.2.B: 工作流执行视图。画布加载初始结构。
12. **[系统反馈 (WebSocket):** 建立连接。收到第一个节点的 `NODE_STATUS_UPDATED` (Executing) 事件。UI 显示第一个节点正在运行。

**出口点:** 工作流已启动，用户位于工作流执行视图。

-----
