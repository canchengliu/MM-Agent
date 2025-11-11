--- (83-83 lines) ---
| UAM-1.2 | 安全用户认证（登录/登出，JWT Token 管理）。 | P0 | 所有受保护功能的前置条件。 | R1.2 |


--- (94-94 lines) ---
| PMG-2.3 | 项目配置：文件上传与角色定义。 | P0 | 工作流输入的基础。 | R3.2 |


--- (243-336 lines) ---
本文档定义了 O-Award 建模平台的核心内容实体模型、属性、相互关系及其分类体系。这是构建数据库结构、API 接口和前端状态管理的基础。

#### 2.1.1 核心实体定义与属性

以下定义了平台中的关键业务对象及其核心属性。

##### 1\. 用户 (User)

代表一个认证的系统使用者。

  * `id` (Integer), `email` (EmailStr), `display_name` (String), `is_active` (Boolean), `is_verified` (Boolean).

##### 2\. 用户设置 (UserSettings)

存储用户的个性化配置和外部服务凭证 (BYOK) 状态。与用户一对一关联。

  * `user_id` (Integer).
  * **界面配置:** `language` (Enum: "en", "zh"), `theme` (Enum: "light", "dark").
  * **AI 行为配置:** `hitl_profile` (Enum: "Novice", "Experienced", "Expert"), `thinking_depth` (Enum: "Instant", "Medium", "Heavy").
  * **BYOK 配置 (前端视图):**
      * `llm_model_name` (String | Null), `llm_base_url` (String | Null).
      * `has_llm_api_key` (Boolean): 指示服务器端是否已存储密钥。
      * `has_e2b_api_key` (Boolean): 指示服务器端是否已存储密钥。

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

##### 5\. 工作流实例 (WorkflowInstance)

代表一次具体的工作流执行过程。

  * `id` (Integer), `project_id` (Integer), `name` (String).
  * `status` (Enum: "Running", "Completed"): 工作流执行状态。
  * `configuration_snapshot` (JSON): 启动时捕获的用户设置快照（确保可复现性）。
  * `nodes` (Array\<`NodeInstance`\>): **（持久化）** 工作流中所有节点的当前状态集合。此列表会因 Generator 节点执行而动态扩展。
  * `phases` (Array\<`PhaseStageGrouping`\>): **（API 响应）** 序列化层将节点聚合为 `Phase -> Stage -> Node` 的层级结构，直接供 React Flow 渲染。每个 Phase 包含 `name` 与 `stages`，每个 Stage 提供 `id`, `name`, `nodes`（节点条目包含 `is_stale`、`active_version` 摘要等状态扩展字段）。

##### 6\. 节点实例 (NodeInstance)

工作流中的一个具体执行步骤。

  * `id` (Integer), `workflow_instance_id` (Integer).
  * `definition_id` (String): 节点定义 ID (e.g., "1.1.1").
  * `name` (String), `order_index` (Integer).
  * `stage_id` (String): Phase 内 Stage 的唯一标识。静态节点继承 `definition_id` 前缀（如 "1.1"、"3.1"），动态 Phase 2 节点使用任务 ID + 模板段位（如 "Task_A1.2.2"）。
  * `stage_name` (String): Stage 的可读名称。Phase 1/3 由 `workflow_definition.py` 中的 `KEY_STAGE_NAME` 定义，Phase 2 通过 `[Task_X] + stage_name_prefix` 动态生成（示例："[Task_A1] Code & Execution"）。
  * `node_type` (Enum: "Standard", "Generator"): 节点类型。
  * `hitl_mode` (Enum: "VARL", "SCA", "AVL"): 人机交互模式。
  * **状态管理:**
      * `status` (Enum: "Not Started", "Executing", "Awaiting HITL Approval", "Completed", "Failed").
      * `current_stage` (String): 执行中的详细阶段描述。
  * **版本管理:**
      * `active_version_id` (Integer | Null): 当前激活的版本 ID。
  * **临时状态 (用于执行和 HITL):**
      * `pending_result` (JSON | Null): 临时存储的执行结果或 HITL 候选数据。
      * `error_log` (Text | Null): 如果执行失败，存储错误日志。

###### 阶段层 (Stage Layer Representation)

* **Stage 概念:** Stage 是 Phase 内部更细粒度的逻辑分组，承载一组具有共同上下文的节点（例如 Phase 1 中的 "Strategic Definition"，或 Phase 2 中的 "[Task_A1] Code & Execution"）。
* **定义方式:** `workflow_definition.py` 为静态节点提供 `KEY_STAGE_ID` / `KEY_STAGE_NAME`；`PHASE_2_TEMPLATE` 通过 `stage_name_prefix` 生成动态 Stage 名称。
* **持久化:** `NodeInstance` 持久化 `stage_id` 与 `stage_name`，确保动态节点在数据库中保留 Stage 归属，便于历史回放与陈旧性检测。
* **API 序列化:** `WorkflowService._build_hierarchical_phases` 基于节点的 Phase 与 Stage 元数据返回 `phases[].stages[].nodes`。前端无需再以 `phase_id` 手动聚合扁平列表，直接消费层级化结构以构建列 (Phase) / 分组 (Stage) / 卡片 (Node)。

##### 7\. 节点版本 (NodeVersion)

节点的一次已批准执行结果的不可变快照 (Atomic Versioning)。

  * `id` (Integer), `node_instance_id` (Integer).
  * `version_number` (Integer): 节点内的版本序号 (e.g., v1, v2)。
  * `source` (Enum: "AI\_GENERATED", "MANUALLY\_EDITED"): 版本的来源。
  * `summary` (String): 对该版本的简短描述或变更日志。
  * `based_on_version_id` (Integer | Null): 此版本所基于的前一个版本 ID。
  * **快照内容 (Context Snapshot):**
      * `output_data` (JSON): 该版本最终的输出工件 (Artifacts)。
      * `input_dependencies` (JSON Array): **（关键）** 记录生成此版本时所依赖的上游节点及其版本 ID。用于计算陈旧性。
          * `[{ "upstream_node_id": 101, "consumed_version_id": 5 }]`
      * `hitl_history` (JSON Array): 生成此版本过程中的完整 HITL 交互记录。
      * `environment_parameters` (JSON): 执行环境参数。



--- (407-416 lines) ---
**节点生命周期状态 (Node Lifecycle Status - `NodeStatus`)**

| 状态 | 定义 |
| :--- | :--- |
| **未开始 (Not Started)** | 节点从未被执行过。 |
| **执行中 (Executing)** | 节点的计算/LLM 推理正在进行。 |
| **等待 HITL 批准 (Awaiting HITL Approval)** | 计算成功完成，等待用户在 HITL 界面进行交互。此状态下的结果是临时的 (`pending_result`)。 |
| **已完成 (Completed)** | 节点拥有一个或多个已批准的版本，且存在一个 `Active Version`。 |
| **执行失败 (Failed)** | 节点的计算执行失败。 |



--- (524-524 lines) ---
2.  **[系统响应 (API)]** `POST /projects/`。成功后导航至 L2.2.A: 项目配置视图。


--- (527-527 lines) ---
5.  **[系统响应 (API)]** `POST /projects/{id}/files`。


--- (532-535 lines) ---
10. **[系统响应 (关键操作)]**
      * **(API):** 调用 `POST /projects/{id}/start`。
      * **(后端逻辑):** 创建配置快照；创建 `WorkflowInstance`；更新项目状态为 `Running`；启动第一个节点执行。
      * **(API 响应):** 返回 `202 Accepted`。


--- (556-556 lines) ---
4A. **[系统响应 (API)]** 调用 `POST /nodes/{id}/hitl`。`action: "Continue"`, `interaction_data: { "selected_ids": ["Option B"] }`。


--- (594-594 lines) ---
5.  **[系统响应 (API)]** 调用 `POST /nodes/{A_id}/versions/{V1_id}/activate`。


--- (597-597 lines) ---
7.  **[系统响应 (UI - 陈旧性检测)]** 前端调用 `GET /workflows/{id}/staleness`。


--- (621-623 lines) ---
5.  **[系统响应 (API)]** 调用 `POST /nodes/{id}/manual-edit`。
      * `base_version_id: V1`, `edited_output_data: {...}`, `summary: "..."`。
6.  **[系统响应 (后端逻辑)]**


--- (660-661 lines) ---
*   **BYOK 密钥输入:** 遵循“写后即忘”原则。使用 `type="password"`。根据 `has_api_key` 状态显示占位符（如“已设置，输入以覆盖”），绝不回显密钥。



--- (759-759 lines) ---
*   **检测触发:** 任何节点的 `active_version` 变更后，前端立即调用 `GET /workflows/{id}/staleness` 更新状态。
