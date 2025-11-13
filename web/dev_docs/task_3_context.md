<design_doc>
--- (54-161 lines) ---
### 1.2 功能需求与优先级矩阵 (Functional Requirements and Priority Matrix)

本矩阵基于 FRS、SRS 和 API 文档，梳理了平台所需实现的功能。优先级定义基于平台的核心价值：支持高效、可控、可回溯的专业建模工作流。

**优先级定义:**
*   **P0 (Critical):** 平台核心价值所必需的基础功能，缺失将导致系统不可用或无法完成核心工作流闭环。
*   **P1 (High):** 显著提升用户体验、效率和控制力的关键增强功能，是实现专业级工具的关键特性。
*   **P2 (Medium):** 提供便利性、完善度或支持边缘场景的功能。

#### 1.2.1 领域：用户认证与账户管理 (Domain: User and Account Management)

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| U1.1 | 用户注册 | 使用邮箱和密码创建账户，需满足基本密码强度要求。 | FRS 1.1 | P0 |
| U1.2 | 邮箱验证 | 用户必须验证邮箱才能激活账户并登录。 | FRS 1.1 | P0 |
| U1.3 | 用户认证 (JWT) | 使用邮箱密码登录，获取 JWT Token 进行会话管理。 | FRS 1.2 | P0 |
| U1.4 | 访问控制 | 用户只能访问和操作自己的账户信息和项目数据。 | FRS 1.4 | P0 |
| U1.5 | 密码重置 | 用户能够通过邮箱重置忘记的密码。 | FRS 1.3 | P1 |
| U1.6 | 密码修改 | 登录状态下，用户能在设置面板修改密码（需验证当前密码）。 | FRS 1.3 | P1 |

#### 1.2.2 领域：用户设置与个性化 (Domain: User Settings & Configuration)

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| S1.1 | 账户设置 | 编辑显示名称、查看/更改电子邮件（需验证）。 | FRS 7.1 | P2 |
| S2.1 | 界面设置：语言 | 选择支持的界面语言（英语、简体中文）。 | FRS 7.2 | P1 |
| S2.2 | 界面设置：主题 | 选择界面主题（浅色模式、深色模式）。专家用户偏好深色。 | FRS 7.2 | P1 |
| S3.1 | LLM Provider 配置 (BYOK) | 配置自定义 LLM (Model Name, API Key, Base URL)。 | FRS 7.3.1 | P1 |
| S3.2 | 代码执行沙箱配置 (BYOK) | 配置 E2B API Key。 | FRS 7.3.2 | P1 |
| S3.3 | 安全的密钥管理 | 密钥遵循“写后即忘”模型。API 仅返回密钥是否存在，不返回明文。 | API Doc | P1 |
| S4.1 | HITL 行为配置 (Profile) | 选择预设等级（Novice, Experienced, Expert），影响 AI 默认行为。 | FRS 7.4 | P1 |
| S4.2 | 思考深度配置 (Depth) | 选择分析深度（Instant, Medium, Heavy），影响 SCA 候选数量。 | FRS 7.5 | P1 |

#### 1.2.3 领域：项目管理与初始化 (Domain: Project Management and Initialization)

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| P1.1 | 项目创建 | 创建新项目，提供名称和可选描述。 | FRS 2.2 | P0 |
| P1.2 | 项目仪表板 | 列出所有项目，显示关键元数据（名称、类型、日期、状态）。 | FRS 2.3 | P0 |
| P1.3 | 项目删除 | 删除项目及其所有关联数据（需二次确认）。 | FRS 2.4 | P1 |
| P2.1 | 自定义赛题配置：文件上传 | 支持多文件上传。 | FRS 3.2.1 | P0 |
| P2.2 | 自定义赛题配置：角色定义 | 对上传文件进行分类（赛题描述、数据集、参考资料）。 | FRS 3.2.2 | P0 |
| P2.3 | 历年赛题库初始化 | 从平台提供的历年赛题库中选择并初始化项目。 | FRS 3.3 | P2 |
| P2.4 | 赛题类型选择 | 用户必须选择建模赛题的类型 (A-F 或 '-'). | FRS 3.4 | P0 |

#### 1.2.4 领域：工作流管理与执行控制 (Domain: Workflow Management & Execution Control)

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| W1.1 | 工作流启动 | 创建 WorkflowInstance，捕获配置快照，并自动开始执行第一个节点。 | FRS 3.5 | P0 |
| W1.2 | 严格线性执行流程 | 工作流被定义为一个严格的、预定义的线性序列。 | SRS 2.2 | P0 |
| W2.1 | 节点状态机管理 | 实现完整的节点生命周期和状态转换规则 (Not Started -> ... -> Canceled)。 | SRS 4.1, 4.2 | P0 |
| W3.1 | 动态结构实例化 (Generator Node) | Generator 节点执行完毕后，动态插入子任务节点链。 | SRS 2.2 | P0 |
| W3.2 | Generator Node 执行限制 | Generator 节点不允许重新运行，以保证流程一致性。 | SRS 2.3 | P0 |
| W4.1 | 依赖解析规则 | 节点执行时自动拉取上游依赖节点的当前激活版本作为输入。 | SRS 3.4 | P0 |
| W5.1 | 重新执行 (Re-execute) | 对已完成节点发起全新执行，可提供新的修改意见。 | SRS 5.4, FRS 5.5.1 | P0 |
| W5.2 | 重试 (Retry) | 对失败或已取消的节点发起重试。 | SRS 5.5 | P1 |
| W5.3 | 取消执行 (Cancel) | 中断正在执行的节点。 | API 5.2.3 | P1 |

#### 1.2.5 领域：人机协同 (HITL) 与人工干预 (Domain: HITL & Intervention)

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| H1.1 | 强制性 HITL 环节 | 每个节点执行成功后，都必须进入 HITL 环节。 | SRS 2.4 | P0 |
| H2.1 | HITL Action: 批准并前进 (Continue) | 接受结果，固化版本，并导航/执行下一个节点。 | SRS 6.1 | P0 |
| H2.2 | HITL Action: 拒绝并提供修改意见 | 提交反馈意见，触发基于新反馈的重新生成。 | SRS 6.2 | P0 |
| H2.3 | HITL Action: 丢弃本次执行 (Discard) | 彻底删除本次执行的临时产物，状态回滚。 | SRS 6.3 | P1 |
| H3.1 | SCA 模式交互实现 | 支持战略选择架构（生成候选、比较分析、用户选择）。 | HITL Modes | P0 |
| H3.2 | AVL 模式交互实现 | 支持对抗性验证循环（AI批判、人工裁决、迭代）。 | HITL Modes | P1 |
| H3.3 | VARL 模式交互实现 | 支持审查式批准/拒绝循环。 | HITL Modes | P0 |
| H4.1 | 人工编辑中间结果 | 用户能够直接修改 AI 生成的工件（文本、代码、公式等）。 | FRS 4.1 | P0 |
| H4.2 | 人工编辑版本创建 | 保存编辑后创建新版本，标记为“人工编辑”，并自动激活。 | FRS 4.3 | P0 |

#### 1.2.6 领域：版本控制与回溯 (Domain: Version Control & Retrospection)

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| V1.1 | 原子化版本创建 | HITL 批准时，将临时结果固化为不可变的快照版本并激活。 | SRS 3.1 | P0 |
| V1.2 | 完整上下文快照 | 版本必须包含输出、精确输入依赖ID、HITL记录和环境参数。 | SRS 3.2 | P0 |
| V2.1 | 历史版本审查 | 用户可以查看任意节点的任意历史版本详情。 | SRS 5.6 | P0 |
| V3.1 | 版本切换与激活 | 用户手动切换任意节点的“激活”版本。 | SRS 3.3, FRS 5.5.2 | P0 |
| V3.2 | 静默状态管理（非级联） | 版本切换仅影响当前节点，不自动触发下游更新。 | SRS 1.4, 3.3 | P0 |
| V4.1 | 过时状态 (Staleness) 检测 | 系统检测并标记输入依赖已过时的节点（`is_stale`）。 | SRS 1.4, FRS 5.2 | P1 |

#### 1.2.7 领域：可视化导航与实时通信 (Domain: Visual Navigation & Real-time Comm)

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| N1.1 | 工作流可视化 | 以可视化格式（分阶段流程图）显示完整的工作流结构。 | FRS 5.1 | P0 |
| N1.2 | 动态结构可视化 | 可视化工具必须能够动态展示 Generator 节点生成的结构。 | FRS 5.1 | P0 |
| N2.1 | 实时状态显示 | 实时显示每个节点的状态和执行阶段。 | FRS 5.2 | P0 |
| N2.2 | 过时状态可视化 | 清晰标识“陈旧 (Stale)”的节点。 | FRS 5.2 | P1 |
| N3.1 | 节点回溯与审查 (Jumping) | 用户可以选择任何已执行的节点以查看其详细信息。 | FRS 5.3, SRS 5.2 | P0 |
| N3.2 | 执行前沿控制 | 不允许跳转到尚未执行的未来节点。 | SRS 5.2 | P0 |
| R1.1 | WebSocket 实时通信 | 建立安全的 WebSocket 连接，实现实时状态更新。 | API 6 | P1 |
| R1.2 | 实时事件处理 | 客户端处理 `NODE_STATUS_UPDATED`, `WORKFLOW_STRUCTURE_UPDATED`, `NODE_ACTIVE_VERSION_CHANGED` 等事件。 | API 6.5 | P1 |
| R1.3 | 断线重连与状态同步 | 客户端实现断线重连，并在重连后通过 REST API 同步全量状态。 | API 6.1 | P1 |

#### 1.2.8 领域：结果导出与基础设施 (Domain: Export & Infrastructure)

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| E1.1 | 一键按需导出 | 用户可在任意时刻导出项目结果（ZIP 包）。 | FRS 6.1 | P1 |
| E1.2 | 导出内容定义 | 编译所有已执行节点的当前活动版本。 | FRS 6.2 | P1 |
| I1.1 | 系统健康检查 | 提供存活探针和就绪探针端点。 | API 7.1, 7.2 | P2 |
| I1.2 | 系统信息获取 | 获取应用版本和静态配置信息。 | API 7.3 | P2 |

---


--- (232-332 lines) ---
### 2.1 内容模型与分类法 (Content Model and Taxonomy)

本节定义了平台中所有核心信息对象的属性、层级关系和组织逻辑。这些模型是系统数据结构在用户体验层面的抽象，是构建信息架构和交互界面的基础。

#### 2.1.1 核心对象模型 (Core Object Models)

以下定义了系统中的关键实体及其核心属性，主要基于 API 文档中的 `Read` 模型，并标注了对前端实现的关键影响点。

##### A. 用户与设置 (User and Settings)

  * **User (用户画像)**
      * `id`, `email`, `display_name`.
      * `is_active`, `is_verified` (boolean): **(前端关键：用于控制登录和功能访问权限)**。
  * **UserSettings (用户设置)**
      * *Interface:* `language` (enum), `theme` (enum).
      * *Engine Behavior:* `hitl_profile` (enum), `thinking_depth` (enum).
      * *BYOK Configuration:* `llm_model_name`, `llm_base_url`.
      * *Security Indicators:* `has_llm_api_key`, `has_e2b_api_key` (boolean). **(前端关键：遵循“写后即忘”，UI 仅显示存在性，不显示密钥)**。

##### B. 项目与文件 (Project and Files)

  * **Project (项目)**
      * *定义:* 封装一次建模任务的顶级容器。
      * `id`, `name`, `description`.
      * `status` (enum: Configuring, Running, Completed): 项目生命周期状态。**(前端关键：决定项目视图和可用操作)**。
      * `problem_type` (enum).
      * `workflow_instance_id` (integer | null): **(前端关键：判断工作流是否已启动)**。
  * **ProjectFile (项目文件)**
      * `id`, `filename`.
      * `role` (enum: Problem Description, Dataset, Reference Material): **(前端关键：启动工作流的前置条件检查)**。

##### C. 工作流结构 (Workflow Structure)

  * **WorkflowInstance (工作流实例)**
      * `id`, `name`.
      * `status` (enum: Running, Completed).
      * `phases` (array[Phase]): 结构化的节点组织层级 (Phase -\> Stage -\> NodeInstance)。**(前端关键：工作流导航器 Navigator 的核心数据源)**。
  * **Phase / Stage (阶段与步骤)**
      * *定义:* 用于在 UI 中对 NodeInstance 进行分组和导航的逻辑容器。

##### D. 节点实例与状态 (Node Instance and State)

  * **NodeInstance (节点实例)**
      * *定义:* 工作流中一个具体的执行步骤的实例。
      * `id`, `definition_id`, `name`.
      * *Execution State:*
          * `status` (enum: NodeStatus): 主状态。**(前端关键：驱动 UI 视觉状态和可用操作)**。
          * `current_stage` (enum: ExecutionStage): 详细执行阶段（用于进度展示）。
      * *Behavioral Configuration:*
          * `node_type` (enum: Standard, Generator). **(前端关键：用于控制“重新执行/编辑”的可用性)**。
          * `hitl_mode` (enum: VARL, SCA, AVL). **(前端关键：决定 HITL 界面的渲染逻辑)**。
      * *Versioning & Staleness:*
          * `active_version_id` (integer | null).
          * `is_stale` (boolean): 指示输入依赖是否已过时。**(前端关键：用于显示警告图标和横幅)**。

##### E. 执行结果与版本 (Execution Results and Versions)

  * **TemporaryExecutionResult (临时执行结果)**
      * *定义:* 节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时产物（存储于 `NodeDetailView.pending_result`）。
      * `output_data` (object): AI 生成的当前临时输出。
      * `execution_artifacts` (object): 当前执行周期内产生的产物（详见 2.1.2）。
      * `accumulated_hitl_interactions` (array): 当前周期内累积的 HITL 记录。
      * `error_log` (string | null).
  * **NodeVersion (节点版本快照)**
      * *定义:* 节点执行成功并被批准后的不可变、完整上下文快照 (SRS 3.2)。
      * `id`, `version_number`.
      * `source` (enum: AI\_GENERATED, MANUALLY\_EDITED).
      * `summary` (string).
      * *The Snapshot (核心内容):*
          * `output_data` (object): 最终输出数据。
          * `execution_artifacts` (object): 执行产物。
          * `input_dependencies` (object: `{upstream_node_id: version_id}`): **(前端关键：用于溯源和展示依赖详情)**。
          * `hitl_history` (array): 创建此版本的所有 HITL 交互记录。
      * *Environment Parameters:* `llm_model_name`, `temperature`.

#### 2.1.2 关键内容分类法 (Key Content Taxonomies)

##### A. 核心枚举 (Core Enumerations)

定义了系统中的关键状态和类型，是前端实现条件渲染和业务逻辑的核心依据。

  * **`NodeStatus` (生命周期主状态)**: `Not Started`, `Executing`, `Awaiting HITL Approval`, `Completed`, `Failed`, `Canceled`.
  * **`ExecutionStage` (执行详细阶段)**: `Initializing`, `Processing`, `Generating Outputs` 等。
  * **`NodeType`**: `Standard`, `Generator`.
  * **`HITLMode`**: `SCA`, `AVL`, `VARL`.
  * **`VersionSource`**: `AI_GENERATED`, `MANUALLY_EDITED`.

##### B. 执行产物分类 (Execution Artifacts Taxonomy)

这是实现“彻底的透明度”的关键内容分类。`ExecutionArtifacts` 对象包含以下几类内容：

1.  **AI 交互记录 (AI Interaction Logs):**
      * `prompt`: 发送给 LLM 的完整提示内容。
      * `raw_llm_response`: LLM 返回的原始响应文本。
2.  **代码生成与执行 (Code Generation and Execution):**
      * `generated_code.py`: AI 生成的可执行 Python 代码。
      * `execution.log`: 代码执行的标准输出 (stdout) 和标准错误 (stderr) 日志。
3.  **外部工具调用 (External Tool Calls):**
      * `tool_call_log`: 外部工具（如搜索引擎）的调用参数和返回结果记录。

-----


--- (436-539 lines) ---
### 2.3 核心任务流程（文本描述）(Core Task Flows - Textual Description)

本节详细描述了平台核心用户任务的操作流程，明确了用户动作序列、系统响应（API 调用、WebSocket 事件、UI 更新）和关键决策点。

#### 2.3.1 任务流 1：HITL 审批与迭代 (Task Flow: HITL Approval and Iteration)

**场景:** 一个节点（Node A）进入 `Awaiting HITL Approval` 状态。以 SCA 模式为例。

**流程:**

1.  **系统状态初始化:** Node A `status` = `Awaiting HITL Approval`。Center Workspace (B) 加载 `pending_result`。Left Navigator (A) 显示 ⏳。Right Sidebar (C) 隐藏。
2.  **UI 渲染 HITL 界面:**
      * `HITL Interaction Zone` (B2.4) 渲染 SCA 界面（候选方案列表和比较分析）。
      * `Action Footer` (B3) 出现。
3.  **用户审阅与决策:** 用户阅读分析。
      * **分支路径 A：批准 (Approve):**
        1.  用户选择满意的方案（Option X）。
        2.  用户点击 [Approve & Continue] (B3)。
        3.  **系统响应 (API):** `POST /nodes/{id}/hitl` (action: Continue, data: Option X)。
        4.  **系统处理 (后端):** 固化新版本 V1，设为 `active_version`。Node A 状态更新为 `Completed`。判断并启动下一个节点 (Node B)。
        5.  **系统响应 (API/WebSocket):** API 返回 `action: ExecuteNext`。WebSocket 推送 `NODE_STATUS_UPDATED` (A-\>Completed, B-\>Executing) 和 `NODE_ACTIVE_VERSION_CHANGED` (A)。
        6.  **UI 更新与导航:** UI 自动导航到 Node B。Left Navigator 更新状态图标。
      * **分支路径 B：拒绝并迭代 (Reject and Provide Feedback):**
        1.  用户点击 [Reject & Provide Feedback] (B3)。
        2.  UI 弹出模态框，用户输入修改意见。
        3.  用户提交反馈。
        4.  **系统响应 (API):** `POST /nodes/{id}/hitl` (action: RejectAndProvideModificationComments)。
        5.  **系统处理 (后端):** 记录反馈，触发 Node A 重新执行。Node A 状态更新为 `Executing`。
        6.  **系统响应 (WebSocket):** WebSocket 推送 `NODE_STATUS_UPDATED` (A-\>Executing)。
        7.  **UI 更新:** Center Workspace 切换到 `Executing` 视图。Action Footer (B3) 隐藏。流程返回等待状态。

#### 2.3.2 任务流 2：版本回溯、切换与下游重执行 (Task Flow: Version Switching and Downstream Re-execution)

**场景:** 用户回退到上游 Node A 的历史版本 V1（当前 V2 激活），并希望更新下游 Node B。

**流程:**

1.  **用户导航与审阅:**
      * 用户在 Left Navigator (A) 点击 Node A。
      * Center Workspace (B) 加载 V2（Review Mode）。Right Sidebar (C) 显示。
2.  **用户审查历史版本:**
      * 用户在 Right Sidebar (C) 点击 V1 卡片。Center Workspace (B) 加载 V1 详情。
3.  **用户执行版本切换:**
      * 用户在 V1 卡片上点击 [Set as Active Version]。
      * **系统响应 (API):** `POST /nodes/A/versions/V1/activate`。
      * **系统处理 (后端):** 更新 Node A 的 `active_version_id` 为 V1。
4.  **系统状态传播 (关键步骤 - Staleness Update):**
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node A)。
      * **前端响应 (关键):** 前端监听到此事件，立即调用 `GET /workflows/{id}` 重新获取全量工作流状态。
      * 新的状态中，Node B 的 `is_stale` 标志为 `true`。
5.  **UI 更新与过时感知:**
      * Right Sidebar (C): V1 标记为 Active。
      * Left Navigator (A) 刷新：Node B 旁边出现 ⚠️ Staleness Indicator。
      * *(遵循 SRS 1.4 静默状态管理，系统不自动执行)*。
6.  **用户处理下游依赖:**
      * 用户点击 Node B。
      * Center Workspace (B) 加载 Node B。Workspace Header (B1) 显示醒目的 `Staleness Banner`：“⚠️ Inputs have changed. Node A has a new active version (V1).”
7.  **用户触发下游重执行:**
      * 用户点击 Contextual Toolbar (B1) 的 [Re-execute]。
      * **系统响应 (API):** `POST /nodes/B/re-execute`。
      * **系统处理 (后端):** 后端拉取 Node A 的当前激活版本 (V1) 作为输入（SRS 3.4），启动 Node B 执行。
      * **系统响应 (WebSocket):** WebSocket 推送 `NODE_STATUS_UPDATED` (B-\>Executing)。
8.  **UI 更新:** Node B 进入执行状态，⚠️ 图标消失。

#### 2.3.3 任务流 3：中间结果的人工编辑 (Task Flow: Manual Editing of Intermediate Results)

**场景:** 用户决定直接修改 Node C 的输出，而不通过 AI 重新生成。

**流程:**

1.  **用户启动编辑模式:**
      * 用户查看 Node C（`Completed` 状态）。
      * 用户点击 Contextual Toolbar (B1) 的 [Manual Edit]。*(校验：Generator Node 禁用此操作)*。
2.  **UI 切换到编辑器:**
      * Center Workspace (B) 的 `Generated Output` 区块切换为编辑器（e.g., Novel/Tiptap 或 Code Editor），加载当前版本内容。
      * Toolbar 按钮更换为 [Cancel Edit] 和 [Save New Version]。
3.  **用户编辑与保存:**
      * 用户修改内容。
      * 用户点击 [Save New Version]，输入版本摘要并确认。
      * **系统响应 (API):** `POST /nodes/C/manual-edit`。
      * **系统处理 (后端):** 创建新的 `NodeVersion` (V2)，`source="MANUALLY_EDITED"`。将 V2 设为 `active_version`。
4.  **状态更新与传播:**
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node C)。
      * **前端响应:** UI 退出编辑模式。Right Sidebar 更新。前端触发工作流全量状态刷新（同 2.3.2 步骤 4），更新下游节点的 `is_stale` 标志。

#### 2.3.4 任务流 4：处理动态工作流结构更新 (Task Flow: Handling Dynamic Structure Updates)

**场景:** 一个 `Generator` 节点（例如 1.1.2）被批准，导致工作流结构动态变化。

**流程:**

1.  **Generator 节点批准:** 用户完成 Generator 节点的 HITL 审批（参见 2.3.1）。
2.  **系统处理结构变更 (后端):**
      * 后端根据 Generator 节点的输出，动态创建新的 NodeInstance 记录，并插入到工作流序列中。
3.  **系统广播结构更新 (WebSocket - 关键):**
      * 后端广播 `WORKFLOW_STRUCTURE_UPDATED` 事件。负载包含**全新且完整**的 `WorkflowInstanceRead` 对象。
4.  **前端响应与状态同步 (关键):**
      * 前端监听到此事件。
      * **全量替换:** 前端（Zustand Workflow Store）必须立即丢弃当前的 `phases` 结构，并用事件负载中的新数据进行**全量替换**。
5.  **UI 更新与重渲染:**
      * Left Navigator (A) 根据新结构完全重渲染，平滑展示新插入的节点。
      * UI 显示短暂通知（Toast: "Workflow structure updated."）。
6.  **导航:** 根据 HITL 审批的返回结果（`action: ExecuteNext`），前端自动导航到新插入序列的第一个节点，该节点通常会自动开始执行。


</design_doc>

<api>
--- (1-10 lines) ---
**http://localhost:8000/api/v1/api/v1**

## api
 - 1_认证与授权(Authentication_Authorization).md
 - 2_用户管理(UserManagement).md
 - 3_项目管理(ProjectManagement).md
 - 4_工作流管理(WorkflowManagement).md
 - 5_节点与执行控制(Node_ExecutionControl).md
 - 6_实时通信(Real-timeCommunication-WebSocket).md
 - 7_系统与基础设施(System_Infrastructure).md


--- (12-277 lines) ---
### 1_认证与授权(Authentication_Authorization).md Content:

```md
## API 文档: 认证与授权

本部分 API 负责处理用户身份的所有方面，包括注册、登录和凭证管理。它是访问系统所有其他受保护资源的基础。

### 核心机制：JWT Bearer Token

本系统采用 **JSON Web Tokens (JWT)** 作为身份验证机制。

#### 令牌生命周期 (Token Lifecycle)

1.  **获取 (Acquisition)**: 用户通过 `POST /auth/login` 成功登录后，获得一个 `access_token`。
    *   **令牌类型**: 系统内部使用不同类型的JWT来区分用途（如：访问令牌、邮件验证令牌）。`access_token` 是用于API访问的令牌。
    *   **有效期**: 根据系统配置 (`config.py`)，`access_token` 的有效期为 **7天**。其他类型的令牌（如邮件验证）有其独立的、通常更短的有效期。
2.  **使用 (Usage)**: 在令牌有效期内，前端向所有受保护的 API 端点发起请求时，必须在 HTTP `Authorization` 头中附加此令牌。
    *   **格式**: `Authorization: Bearer <your_access_token>`
3.  **存储 (Storage)**:
    *   **推荐方案 (最高安全性)**: 将令牌存储在 `HttpOnly`、`Secure`、`SameSite=Strict` 的 Cookie 中。这可以有效防止 XSS 攻击窃取令牌，但需要后端配合设置 Cookie。
    *   **备选方案**: 如果后端不便处理 Cookie，可将令牌存储在内存中（例如，JavaScript 变量或状态管理库如 Redux/Pinia）。页面刷新会导致令牌丢失，需要重新登录或从 `sessionStorage` 恢复。**不推荐**使用 `localStorage`，因为它容易受到 XSS 攻击。
4.  **失效与刷新 (Expiration & Refresh)**:
    *   当令牌过期后，API 将返回 `401 Unauthorized` 错误。
    *   **当前系统不包含令牌刷新 (Refresh Token) 机制**。这意味着一旦 `access_token` 过期，用户必须重新进行登录流程。
5.  **登出 (Logout)**:
    *   登出是一个纯粹的**客户端操作**。前端需要从存储中（无论是 Cookie、内存还是 `sessionStorage`）**丢弃/删除**该令牌，然后将用户重定向到登录页面。

#### 通用错误响应

| HTTP 状态码 | 错误类型 | 响应体格式 | 描述与前端处理建议 |
| :--- | :--- | :--- | :--- |
| `401 Unauthorized` | 认证失败 | `{"detail": "..."}` | 令牌无效、过期或未提供。应立即清除本地存储的无效令牌并重定向到登录页。 |
| `403 Forbidden` | 权限不足 | `{"detail": "..."}` | 用户已认证，但无权执行操作（如账户未验证）。应向用户显示具体错误信息。 |
| `409 Conflict` | 业务逻辑冲突 | 自定义JSON | 操作因当前状态无法执行（如邮箱已存在）。应解析`error_code`和`message`向用户展示。 |
| `422 Unprocessable Entity` | 请求数据验证失败 | FastAPI标准错误 | 请求体中的数据不符合模型要求（如邮箱格式错误）。应解析`detail`数组，在表单的对应字段下显示错误信息。 |

**自定义错误 (`409 Conflict`) 示例:**
```json
{
  "error_code": "USER_ALREADY_EXISTS",
  "message": "User with email 'test@example.com' already exists."
}
```
**验证错误 (`422 Unprocessable Entity`) 示例:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

### 1. 用户登录

#### 1.1. 登录并获取访问令牌

*   **Endpoint**: `POST /auth/login`
*   **描述**:
    *   使用用户的电子邮件和密码进行验证。
    *   成功后返回一个 JWT `access_token`，该令牌用于后续所有需要认证的 API 请求。
    *   **[重要变化]** 只有**已激活**且**已验证**的账户才能成功登录。如果账户未通过邮件验证，将返回 `403 Forbidden` 错误。

##### 请求格式
此端点遵循 OAuth2 规范，需要使用 `application/x-www-form-urlencoded` 格式提交数据。

*   `username` (string, **required**): 用户的注册**电子邮件地址**。
*   `password` (string, **required**): 用户的明文密码。

##### JavaScript `fetch` 请求示例
```javascript
const formData = new URLSearchParams();
formData.append('username', 'user@example.com');
formData.append('password', 'a_strong_password');

fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: formData,
})
.then(response => response.json())
.then(data => {
  if (data.access_token) {
    // 登录成功
    console.log('Access Token:', data.access_token);
    // 在此处存储 token 并重定向
  } else {
    // 处理登录失败
    console.error('Login failed:', data);
  }
});
```

##### 成功响应 (`200 OK`)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

> **前端集成指南**
> 1.  **成功后**: 安全地存储 `access_token`，然后将用户重定向到应用主仪表盘或他们之前尝试访问的页面。
> 2.  **处理 `401 Unauthorized`**: 在登录表单下方显示"电子邮件或密码不正确"的通用错误提示。
> 3.  **处理 `403 Forbidden`**: **[重要变化]** 显示一个更具体的消息。
>     *   如果错误信息包含 "not verified"，则提示："您的账户尚未激活，请检查您的注册邮箱以完成验证。需要重新发送验证邮件吗？"
>     *   如果错误信息是其他内容，则提示："您的账户已被禁用。"

---

### 2. 用户注册

#### 2.1. 创建新用户账户

*   **Endpoint**: `POST /auth/register`
*   **描述**: 注册一个新用户。成功后，用户的 `is_verified` 状态为 `false`，系统会**自动发送一封验证邮件**到注册邮箱。用户必须点击邮件中的链接（或使用其中的令牌）来激活账户。

##### 请求体 (`application/json`)
*   `email` (EmailStr, **required**): 用户的电子邮件地址。
*   `password` (string, **required**): 用户密码。**验证规则**: 仅检查长度**不小于8个字符**。建议前端在提交前进行客户端验证。
*   `display_name` (string, *optional*): 用户的显示名称。

##### 请求体示例
```json
{
  "email": "new.user@example.com",
  "password": "mySecurePassword123",
  "display_name": "New User"
}
```
##### 成功响应 (`201 Created`)
```json
{
  "id": 2,
  "email": "new.user@example.com",
  "display_name": "New User",
  "is_active": true,
  "is_verified": false
}
```

> **前端集成指南**
> 1.  **推荐流程**: 注册成功后，不应直接让用户进入应用主界面。
> 2.  **显示消息**: **[重要变化]** 向用户展示一条信息，如："注册成功！一封验证邮件已发送至您的邮箱 `new.user@example.com`，请点击邮件中的链接以激活您的账户。如果没有收到，请检查垃圾邮件文件夹。"
> 3.  **重定向**: 将用户重定向到登录页面，或一个专门的"请验证您的邮箱"页面。

---

### 3. 密码管理与邮件验证

#### 3.1. 请求密码重置

*   **Endpoint**: `POST /auth/reset-password`
*   **描述**:
    *   **（存根实现）** 此端点用于启动密码重置流程。在当前版本中，它是一个占位符，**不会实际发送邮件**。
    *   为了防止**用户枚举攻击**（即攻击者通过此功能判断哪些邮箱已注册），无论请求的邮箱是否存在，该接口总是返回成功的响应。

##### 请求体
此端点的当前实现**不**需要请求体。

> **未来展望 (Future Development)**
> 一个完整的实现将包含以下步骤，前端可为此提前规划：
> 1.  **请求 (当前)**: 前端将提交一个包含 `email` 的请求体。后端生成一个唯一的、有时效的重置令牌，并发送一封包含 `?token=...` 链接的邮件。
> 2.  **验证**: 用户点击邮件链接，前端应用从 URL 中捕获 `token`。
> 3.  **重置**: 前端显示一个新密码输入表单，并将 `new_password` 和 `token` 提交到一个新的端点（如 `POST /auth/perform-reset`）。

##### 成功响应 (`202 Accepted`)
```json
{
  "message": "If an account with this email exists, a password reset link has been sent."
}
```

#### 3.2. 验证电子邮件地址

*   **Endpoint**: `POST /auth/verify-email`
*   **描述**:
    *   使用从验证邮件中获取的令牌来完成用户的电子邮件验证流程。
    *   成功后，用户的 `is_verified` 状态将变为 `true`，账户即可正常登录和使用。
*   **应用场景**: 用户在注册后，点击邮件中的链接，前端应用从URL参数中捕获 `token`，并调用此API。

##### 请求体 (`application/json`)
*   `token` (string, **required**): 从验证邮件链接中获取的JWT验证令牌。

##### 请求体示例
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI..."
}
```

##### 成功响应 (`200 OK`)
返回已更新的 `UserRead` 对象，其中 `is_verified` 为 `true`。
```json
{
  "id": 2,
  "email": "new.user@example.com",
  "display_name": "New User",
  "is_active": true,
  "is_verified": true
}
```

##### 错误响应
*   `401 Unauthorized`: 令牌已过期、无效或类型不正确。前端应提示用户"验证链接已失效，请重新发送验证邮件"。

#### 3.3. 重新发送验证邮件

*   **Endpoint**: `POST /auth/resend-verification-email`
*   **描述**:
    *   为尚未验证的账户重新发送一封验证邮件。
    *   为防止用户枚举攻击，无论请求的邮箱是否存在或是否已验证，该接口总是返回成功的响应。

##### 请求体 (`application/json`)
*   `email` (EmailStr, **required**): 需要接收验证邮件的注册邮箱地址。

##### 请求体示例
```json
{
  "email": "new.user@example.com"
}
```

##### 成功响应 (`202 Accepted`)
```json
{
  "message": "If the account exists and is not verified, a verification email has been sent."
}
```

---

### 4. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了认证与授权模块中使用的核心数据对象。

#### 4.1. Token

`POST /auth/login` 成功后返回的 JWT 令牌对象。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `access_token` | string | JSON Web Token，用于后续 API 请求的身份验证。 |
| `token_type` | string | 令牌类型，固定为 `"bearer"`。 |

#### 4.2. UserRead

表示用户的公开信息，用于注册成功后或查询用户信息时返回。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 用户的唯一标识符。 |
| `email` | string (Email) | 用户的注册电子邮件地址。 |
| `display_name` | string \| null | 用户的显示名称。 |
| `is_active` | boolean | 账户是否被激活。 |
| `is_verified` | boolean | 账户的电子邮件地址是否已验证。 |

***
```


--- (279-499 lines) ---
### 2_用户管理(UserManagement).md Content:

```md
## API 文档: 用户管理 (User Management)

本部分 API 专注于管理当前已登录用户的个人资料和应用偏好设置。它允许用户查询自己的基本信息，并自定义与平台交互相关的各项参数，包括界面主题、语言、AI 行为模式以及个人 API 密钥（BYOK）。

### 核心概念与安全最佳实践

*   **用户画像 (User Profile)**: 指用户的核心身份信息，如邮箱、显示名称等。这些信息相对稳定。
*   **用户设置 (User Settings)**: 指用户对应用行为的个性化配置。
*   **BYOK (Bring-Your-Own-Key) 安全模型**:
    > **核心原则**: 为确保用户凭证的最高安全性，API 密钥（Secrets）遵循严格的“**写后即忘**”模式。服务器端绝不将密钥明文或密文传回给客户端。

    *   **前端职责**: 仅在更新时通过 `PATCH /users/me/settings` 以**明文**形式发送 API 密钥。输入框应为密码类型。
    *   **后端处理**: 接收到明文密钥后会立即**加密存储**。
    *   **状态表示**: `GET /users/me/settings` 接口**绝不会**返回密钥本身。它通过一个布尔值（如 `has_llm_api_key: true`）来告知前端密钥**是否存在**。这是为了防止密钥意外暴露在前端状态管理工具（Redux DevTools）、网络日志或浏览器缓存中。
    *   **清空密钥**: 若要删除已存储的密钥，前端需向 `PATCH` 端点发送 `null` 或空字符串 `""` 作为该密钥字段的值。

### 认证与通用约定

本模块下的所有 API 端点都需要通过 `Authorization` 头进行 Bearer Token 认证。

```http
Authorization: Bearer <your_jwt_token>
```

---

### 1. 用户画像 (User Profile)

#### 1.1. 获取当前用户信息

*   **Endpoint**: `GET /users/me`
*   **权限**: 任何已登录、激活且已验证的用户。
*   **描述**: 返回当前认证用户的核心身份信息。

> **前端实现指南:**
> *   **调用时机**: 建议在用户成功登录后立即调用此接口，用于“水合”(hydrate) 应用的全局状态管理库（如 Redux, Pinia, Zustand）中的用户对象。
> *   **用途**:
>     1.  在 UI 中展示用户信息（如导航栏的欢迎语 `Welcome, Ann!`）。
>     2.  客户端可以根据 `is_active` 和 `is_verified` 状态来决定是否允许用户访问应用的核心功能区。

##### 成功响应 (`200 OK`)
返回 `UserRead` 对象。

```jsonc
{
  "id": 1,
  "email": "ann@example.com",
  "display_name": "Ann",
  "is_active": true,
  "is_verified": true
}
```

##### 错误响应
*   `401 Unauthorized`: 认证失败。
*   `403 Forbidden`: 用户账户被禁用或未验证。

#### 1.2. 修改当前用户密码

*   **Endpoint**: `PATCH /users/me/password`
*   **权限**: 任何已登录、激活且已验证的用户。
*   **描述**: 允许当前登录的用户修改自己的密码。

##### 请求体 (`PasswordChange`)
*   `current_password` (string, **required**): 用户的当前密码。
*   `new_password` (string, **required**): 用户的新密码。**验证规则**: 长度不小于8个字符。

##### 请求体示例
```json
{
  "current_password": "myOldSecurePassword123",
  "new_password": "aNewEvenStrongerPassword456"
}
```

##### 成功响应 (`204 No Content`)
成功修改后，响应体为空。

> **前端集成指南**
> 1.  **成功后**: 显示成功提示（例如 Toast "密码已成功更新"），并清空表单字段。
> 2.  **处理 `403 Forbidden`**: 在表单下方显示"当前密码不正确"的错误提示。
> 3.  **处理 `422 Unprocessable Entity`**: 解析响应并在新密码字段下方显示具体的验证错误（如"密码长度不能少于8个字符"）。

---

### 2. 用户设置 (User Settings)

#### 2.1. 获取当前用户设置

*   **Endpoint**: `GET /users/me/settings`
*   **权限**: 任何已登录、激活且已验证的用户。
*   **描述**: 获取当前用户的全部个性化设置，用于渲染设置页面和应用全局配置。

> **前端实现指南:**
> *   **调用时机**: 当用户导航至“设置”页面时调用此接口，以获取最新数据填充表单。
> *   **UI 逻辑**:
>     *   使用 `theme` 字段来动态切换应用的 CSS 类（例如，在 `<html>` 标签上添加 `class="dark"`）。
>     *   对于 `llm_model_name` 和 `llm_base_url`，如果返回值为 `null`，UI 应显示一个占位符，如“使用系统默认配置”。
>     *   使用 `has_llm_api_key` 和 `has_e2b_api_key` 的布尔值来决定 API 密钥输入框的状态：
>         *   `true`: 显示提示信息“已设置 API 密钥”，输入框可留空表示不更改，或输入新值进行覆盖。
>         *   `false`: 显示常规的输入框，提示用户输入密钥。

##### 成功响应 (`200 OK`)
返回 `UserSettingsRead` 对象。

```jsonc
{
  "language": "en",
  "theme": "dark",
  "hitl_profile": "Experienced",
  "thinking_depth": "Medium",
  "llm_model_name": null, // 用户未自定义，将使用系统默认
  "llm_base_url": null,   // 用户未自定义，将使用系统默认
  "has_llm_api_key": true,
  "has_e2b_api_key": false
}
```

#### 2.2. 更新当前用户设置

*   **Endpoint**: `PATCH /users/me/settings`
*   **权限**: 任何已登录、激活且已验证的用户。
*   **描述**: 增量更新用户的个性化设置。请求体中只需包含需要修改的字段。

> **前端实现指南:**
> *   **表单处理**: 这是一个 `PATCH` 请求，最佳实践是只提交用户修改过的字段，以减少载荷大小。
> *   **API 密钥字段**: 这些字段是**只写的**。表单中的输入框不应由 `GET` 请求中的任何值预填充。它们应始终为空，等待用户输入新值。
> *   **状态同步**: 请求成功后，API 会返回更新后的**完整**设置对象。前端应使用此返回的数据来更新本地状态，无需再次手动发起 `GET` 请求。

##### 请求体 (`UserSettingsUpdate`)
所有字段均为可选。

```json
// 场景: 用户将主题切换为亮色，并设置了新的E2B密钥，同时清除了旧的LLM密钥。
{
  "theme": "light",
  "llm_api_key": "", // 发送空字符串或 null 来清除密钥
  "e2b_api_key": "e2b_sk_a_new_secret_key_from_user"
}
```

**可更新字段及业务含义:**

*   `language` (enum: `"en"`, `"zh"`): 应用界面语言。
*   `theme` (enum: `"light"`, `"dark"`): 应用界面主题。
*   `hitl_profile` (enum): AI 在人机交互（HITL）环节的行为偏好。
    *   `"Novice"`: AI 提供更多引导和解释。
    *   `"Experienced"`: 默认，平衡的交互。
    *   `"Expert"`: AI 交互更简洁，假设用户熟悉流程。
*   `thinking_depth` (enum): 影响 AI 生成内容的复杂度和耗时。
    *   `"Instant"`: 响应更快，可能牺牲一些深度。
    *   `"Medium"`: 性能和质量的平衡点。
    *   `"Heavy"`: 耗时更长，但生成的内容更全面、深入。
*   `llm_model_name` (string | null): 自定义 LLM 模型名称。
*   `llm_base_url` (string | null): 自定义 LLM API 的 Base URL。
*   `llm_api_key` (string | null): 明文 LLM API Key。**发送 `null` 或 `""` 以删除**。
*   `e2b_api_key` (string | null): 明文 E2B (沙箱) API Key。**发送 `null` 或 `""` 以删除**。

##### 成功响应 (`200 OK`)
返回更新后的完整 `UserSettingsRead` 对象。
```jsonc
{
  "language": "en",
  "theme": "light", // 已更新
  "hitl_profile": "Experienced",
  "thinking_depth": "Medium",
  "llm_model_name": null,
  "llm_base_url": null,
  "has_llm_api_key": false, // 已被清除
  "has_e2b_api_key": true   // 已设置
}
```

##### 错误响应
*   `422 Unprocessable Entity`: 请求体验证失败。

> **前端错误处理指南:**
> 响应体中的 `loc` 字段 (`["body", "theme"]`) 可以直接映射到表单中名为 `theme` 的输入控件，从而在其旁边显示具体的错误消息 `msg`。

```json
{
  "detail": [
    {
      "loc": [ "body", "theme" ],
      "msg": "unexpected value; permitted: 'light', 'dark'",
      "type": "enum"
    }
  ]
}
```

---

### 3. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了用户管理模块中使用的核心数据对象。

#### 3.1. UserRead

表示用户的公开信息。详细定义请参见 [认证与授权文档](#42-userread)。

#### 3.2. UserSettingsRead

表示用户的个性化设置信息，用于 `GET /users/me/settings` 和 `PATCH /users/me/settings` 的成功响应。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `language` | string (enum) | 应用界面语言。可选值: `"en"`, `"zh"`。 |
| `theme` | string (enum) | 应用界面主题。可选值: `"light"`, `"dark"`。 |
| `hitl_profile` | string (enum) | AI 在人机交互环节的行为偏好。可选值: `"Novice"`, `"Experienced"`, `"Expert"`。 |
| `thinking_depth`| string (enum) | AI 生成内容的复杂度。可选值: `"Instant"`, `"Medium"`, `"Heavy"`。 |
| `llm_model_name`| string \| null | 用户自定义的 LLM 模型名称。若为 `null`，则使用系统默认模型。 |
| `llm_base_url` | string \| null | 用户自定义的 LLM API Base URL。若为 `null`，则使用系统默认 URL。 |
| `has_llm_api_key` | boolean | 指示用户是否已设置 LLM API 密钥。**绝不**返回密钥本身。 |
| `has_e2b_api_key` | boolean | 指示用户是否已设置 E2B (沙箱) API 密钥。**绝不**返回密钥本身。 |

***
```


--- (501-868 lines) ---
### 3_项目管理(ProjectManagement).md Content:

```md
## API 文档: 项目管理 (Project Management)

本项目管理切面是整个系统的核心，负责处理从项目构思到最终成果导出的完整生命周期。用户的所有工作都围绕一个“项目”展开。

### 核心概念

*   **项目 (Project)**: 用户工作的基本单元。一个项目封装了特定的建模任务，包含了所有相关的输入文件、配置快照、以及一个（且仅一个）工作流实例。
*   **项目生命周期 (Project Lifecycle)**:
    1.  **`Configuring` (配置中)**: 项目的初始状态。在此阶段，用户可以上传文件、修改项目元数据、并从历史案例库中初始化数据。
    2.  **`Running` (运行中)**: 当用户启动工作流后，项目进入此状态。此状态下，项目的主要配置（如名称、描述）仍可修改，但工作流已激活并开始执行。
    3.  **`Completed` (已完成)**: 当项目内的工作流执行完毕后，项目进入此最终状态。
*   **文件角色 (File Role)**: 上传到项目的文件必须被赋予一个明确的角色（如 `Problem Description`, `Dataset`），以便工作流中的节点能够准确地消费它们。
*   **配置快照 (Configuration Snapshot)**: 在“启动工作流”的瞬间，系统会捕获用户当前的个人设置（如自定义的 LLM API Key）。这个快照被永久保存在项目中，确保了工作流执行的可复现性，即使之后用户更改了个人设置，也不会影响正在运行或已完成的项目。

### 认证与通用约定

所有项目相关的 API 端点都需要通过 `Authorization` 头进行 Bearer Token 认证。

```http
Authorization: Bearer <your_jwt_token>
```

**通用错误响应格式:**

```json
{
  "error_code": "STRING_ERROR_CODE",
  "message": "A human-readable error message.",
  "details": {
    "additional": "context"
  }
}
```

---

### 1. 项目生命周期管理 (CRUD)

#### 1.1. 创建新项目

*   **Endpoint**: `POST /projects/`
*   **权限**: 任何已认证的用户。
*   **描述**: 为当前登录的用户创建一个新的空项目，初始状态为 `Configuring`。项目名称在同一用户下必须是唯一的。

##### 请求体 (`ProjectCreate`)
```json
{
  "name": "2024 MCM Problem A Analysis",
  "description": "An initial attempt to model the dynamics of the specified ecosystem."
}
```
*   `name` (string, **required**): 项目名称。前后空格会被剔除，且不能为空。
*   `description` (string, *optional*): 项目的详细描述。

##### 成功响应 (`201 Created`)
返回新创建项目的完整详细信息 (`ProjectDetailRead`)。
```jsonc
{
  "id": 1,
  "name": "2024 MCM Problem A Analysis",
  "status": "Configuring", // UI应根据此状态决定启用/禁用“启动工作流”按钮
  "problem_type": "-", // 若为"-"，UI应提示用户设置此项
  "created_at": "2024-05-25T10:00:00Z",
  "updated_at": "2024-05-25T10:00:00Z",
  "workflow_instance_id": null, // 若非null，表示工作流已创建，UI应显示工作流相关信息
  "description": "An initial attempt to model the dynamics of the specified ecosystem.",
  "files": [], // 用于渲染项目文件列表
  "historical_problem_id": null // 若非null，UI可显示“基于xxx案例初始化”
}
```

##### 错误响应
*   `409 Conflict` (`PROJECT_NAME_EXISTS`): 用户已存在同名项目。

#### 1.2. 获取项目列表 (分页)

*   **Endpoint**: `GET /projects/`
*   **权限**: 任何已认证的用户。
*   **描述**: 获取当前用户的所有项目摘要信息，支持分页，默认按更新时间降序排列。

##### 查询参数
*   `skip` (integer, *optional*, default: `0`): 跳过的项目数量。
*   `limit` (integer, *optional*, default: `20`): 每页返回的项目数量。

##### 成功响应 (`200 OK`)
返回一个分页响应对象，其中 `items` 包含 `ProjectSummaryRead` 数组。
```json
{
  "total": 15,
  "items": [
    {
      "id": 12,
      "name": "Latest Project",
      "status": "Running",
      "problem_type": "A",
      "created_at": "2024-05-26T14:00:00Z",
      "updated_at": "2024-05-26T15:30:00Z",
      "workflow_instance_id": 10
    }
  ]
}
```

#### 1.3. 获取项目详细信息

*   **Endpoint**: `GET /projects/{project_id}`
*   **权限**: 项目所有者。
*   **描述**: 获取单个项目的完整信息，包括其关联的文件列表。

##### 路径参数
*   `project_id` (integer, **required**): 项目的唯一ID。

##### 成功响应 (`200 OK`)
返回 `ProjectDetailRead` 对象，结构参见 `1.1. 创建新项目`。

##### 错误响应
*   `404 Not Found`: 项目不存在。
*   `403 Forbidden`: 用户无权访问该项目。

#### 1.4. 更新项目信息

*   **Endpoint**: `PATCH /projects/{project_id}`
*   **权限**: 项目所有者。
*   **描述**: 更新项目的基本信息。部分字段的修改受项目当前状态限制。

##### 请求体 (`ProjectUpdate`)
```json
{
  "description": "Updated description with new findings.",
  "problem_type": "C"
}
```
*   `name` (string, *optional*)
*   `description` (string, *optional*)
*   `problem_type` (enum, *optional*): 问题类型。可选值: `"A"`, `"B"`, `"C"`, `"D"`, `"E"`, `"F"`, `"-"`。

##### 状态相关的可变性
*   在 `Configuring` 状态下，`name`, `description`, 和 `problem_type` 均可修改。
*   在 `Running` 或 `Completed` 状态下，只有 `name` 和 `description` 可以修改。尝试修改 `problem_type` 将导致 `409 Conflict` 错误。

##### 成功响应 (`200 OK`)
返回更新后的 `ProjectDetailRead` 对象。

#### 1.5. 删除项目

*   **Endpoint**: `DELETE /projects/{project_id}`
*   **权限**: 项目所有者。
*   **描述**: **永久删除**一个项目及其所有关联数据，包括工作流实例、所有节点版本以及在服务器上存储的所有上传文件。

##### **警告**
此操作将**立即终止**与该项目关联的任何正在运行的后台工作流任务。这是一个破坏性且不可恢复的操作。前端应在执行此操作前，通过一个醒目的模态框向用户进行二次确认。

##### 成功响应 (`204 No Content`)
成功删除后，响应体为空。

---

### 2. 项目配置与数据管理

#### 2.1. 上传项目文件

*   **Endpoint**: `POST /projects/{project_id}/files`
*   **权限**: 项目所有者。
*   **描述**: 以 `multipart/form-data` 格式上传一个文件，并将其与项目关联。

##### 请求格式: `multipart/form-data`
*   **`file`** (file, **required**): 要上传的文件内容。
*   **`role`** (string, **required**): 文件的角色。其值决定了文件在工作流中如何被使用。
    *   `Problem Description`: 核心问题描述文档，通常是启动工作流的必要条件。
    *   `Dataset`: 建模所需的数据文件，如 CSV, JSON, TXT 等。
    *   `Reference Material`: 辅助性的参考资料，如相关论文、背景介绍等。

##### **重要说明**
虽然系统允许您为一个项目上传多个相同角色的文件（例如，多个 `Dataset` 文件），但工作流的特定节点可能要求某个角色是唯一的。例如，`start_workflow` 操作要求项目中**有且仅有一个** `Problem Description` 文件。前端应在 UI 层面引导用户，对于需要唯一性的角色，后续上传应视为“替换”而非“新增”。

##### 成功响应 (`201 Created`)
返回新创建的 `ProjectFileRead` 对象。
```json
{
  "id": 25,
  "filename": "problem_data.csv",
  "role": "Dataset",
  "created_at": "2024-05-26T16:00:00Z"
}
```

#### 2.2. 从历史案例库初始化项目

*   **Endpoint**: `POST /projects/{project_id}/initialize-from-historical`
*   **权限**: 项目所有者。
*   **描述**: 使用一个预置的历史竞赛题目来快速配置项目。此操作会自动将历史题目的描述文件和数据集（如果存在）复制并关联到当前项目，同时设置项目的 `problem_type`。

##### 请求体 (`HistoricalInitializationRequest`)
```json
{
  "historical_problem_id": 5
}
```
*   `historical_problem_id` (integer, **required**): 历史题目的唯一ID。 (可通过 `GET /historical-problems` 获取)

##### 成功响应 (`200 OK`)
返回更新后的 `ProjectDetailRead` 对象，其 `files` 列表和 `problem_type` 字段已被填充。

##### 错误响应
*   `424 Dependency Failed` (`DEPENDENCY_FAILED`): 后端服务器上找不到历史题目对应的物理文件。

---

### 3. 工作流编排与导出

#### 3.1. 启动项目工作流

*   **Endpoint**: `POST /projects/{project_id}/start`
*   **权限**: 项目所有者。
*   **描述**: 这是项目从“配置”到“运行”的关键操作。执行此操作会：
    1.  **校验前置条件**: 检查项目状态、问题类型是否设置、以及是否已上传“问题描述”文件。
    2.  **创建配置快照**: 永久记录用户当前的个人设置。
    3.  **创建工作流实例**: 在数据库中生成完整的工作流结构。
    4.  **变更项目状态**: 将项目状态更新为 `Running`。
    5.  **启动执行**: 将工作流的第一个节点加入后台执行队列。

##### 执行影响
*   **异步处理**: 这是一个异步操作，API 会立即返回 `202 Accepted`，表示任务已接收。
*   **状态变更**: 项目的 `status` 将变为 `Running`。
*   **WebSocket 事件**: 后续的节点状态更新将通过 WebSocket 的 `NODE_STATUS_UPDATED` 事件推送。
*   **UI 交互**: 前端在收到 `202` 响应后，应立即禁用“启动”按钮并显示加载状态，然后根据 WebSocket 事件更新界面。

##### 成功响应 (`202 Accepted`)
请求被接受，后台任务已启动。响应体是新创建工作流的**第一个节点**的实例信息 (`NodeInstanceRead`)。前端可以利用这个信息直接导航到第一个节点的视图。
```jsonc
{
  "id": 100,
  "definition_id": "1.1.1",
  "name": "Problem Deconstruction and Mathematical Formulation",
  "status": "Executing", // 注意：状态已是Executing，表示任务已成功入队
  "current_stage": "Initializing",
  "node_type": "Standard",
  "hitl_mode": "AVL",
  "order_index": 0,
  "active_version_id": null,
  "phase_id": "Phase 1: Strategic Analysis & Macro Architecture",
  "task_group_id": null,
  "is_stale": false
}
```

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): 不满足启动的前置条件（如状态不正确、缺少文件等）。

#### 3.2. 导出项目成果 (R6)

*   **Endpoint**: `GET /projects/{project_id}/export`
*   **权限**: 项目所有者。
*   **描述**: 将项目的所有成果打包成一个 `.zip` 压缩文件供用户下载。压缩包内包含：
    *   `Project Manifest.json`: 项目元数据和配置快照。
    *   `Original Inputs/`: 用户上传的所有原始文件，按角色分类。
    *   `Intermediate Results/`: 各个中间节点的 JSON 输出。
    *   `Code Artifacts/`: 所有生成的代码文件。
    *   `Attachments and Visualizations/`: 图表、报告等附件。
    *   `Final Paper/`: 最终生成的论文（如果存在）。

##### 成功响应 (`200 OK`)
*   **`Content-Type`**: `application/zip`
*   **`Content-Disposition`**: `attachment; filename="<project_name>_export.zip"`
*   **响应体**: ZIP 文件的二进制内容。浏览器会自动触发下载。

##### 错误响应
*   `404 Not Found`: 项目的工作流尚未启动，没有可导出的内容。

---

### 4. 辅助数据查询

#### 4.1. 获取历史案例库列表

*   **Endpoint**: `GET /historical-problems`
*   **权限**: 任何已认证的用户。
*   **描述**: 获取所有可用于初始化项目的历史竞赛题目列表。此数据用于填充前端的“从模板创建”或“选择历史题目”下拉菜单/列表。

##### 成功响应 (`200 OK`)
返回一个历史问题对象的数组。
```jsonc
[
  {
    "id": 5, // 这个ID将用于 POST /projects/{id}/initialize-from-historical
    "year": 2023,
    "type": "C", // 用于预填充项目的 problem_type
    "name": "Wordle Problem Analysis",
    "has_dataset": true // UI可根据此标志决定是否显示“包含数据集”的标签
  },
  {
    "id": 6,
    "year": 2022,
    "type": "A",
    "name": "Bicycle Gearing Optimization",
    "has_dataset": false
  }
]
```

---

### 5. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了项目管理模块中使用的核心数据对象。

#### 5.1. ProjectSummaryRead

用于项目列表 (`GET /projects/`) 的轻量级项目信息对象。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 项目的唯一标识符。 |
| `name` | string | 项目名称。 |
| `status` | string (enum) | 项目的当前生命周期状态。可选值: `"Configuring"`, `"Running"`, `"Completed"`。 |
| `problem_type` | string (enum) | 项目关联的竞赛问题类型。可选值: `"A"`, `"B"`, `"C"`, `"D"`, `"E"`, `"F"`, `"-"`。 |
| `created_at` | string (datetime) | 项目创建时间 (ISO 8601 格式)。 |
| `updated_at` | string (datetime) | 项目最后更新时间 (ISO 8601 格式)。 |
| `workflow_instance_id` | integer \| null | 关联的工作流实例 ID，如果已创建。 |

#### 5.2. ProjectDetailRead

用于展示单个项目详情的完整信息对象，继承自 `ProjectSummaryRead`。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| *(所有 ProjectSummaryRead 字段)* | | ... |
| `description` | string \| null | 项目的详细描述。 |
| `files` | array (ProjectFileRead) | 与项目关联的文件列表。参见 `ProjectFileRead` 定义。 |
| `historical_problem_id` | integer \| null | 如果项目基于历史案例初始化，则为该案例的 ID。 |

#### 5.3. ProjectFileRead

表示与项目关联的单个文件的元数据。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 文件的唯一标识符。 |
| `filename` | string | 文件的原始名称。 |
| `role` | string (enum) | 文件在项目中的角色。可选值: `"Problem Description"`, `"Dataset"`, `"Reference Material"`。 |
| `created_at` | string (datetime) | 文件上传时间 (ISO 8601 格式)。 |

#### 5.4. NodeInstanceRead

表示工作流中单个节点的当前状态和基本信息。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 节点实例的唯一标识符。 |
| `definition_id` | string | 节点在工作流定义中的静态 ID (例如, "1.1.1")。 |
| `name` | string | 节点的显示名称。 |
| `status` | string (enum) | 节点的当前执行状态。可选值: `"Not Started"`, `"Executing"`, `"Awaiting HITL Approval"`, `"Completed"`, `"Failed"`, `"Canceled"`。**[新增]** `Canceled` 状态表示执行被用户取消。 |
| `current_stage` | string (enum) | 节点更详细的执行阶段。可选值: `"Not Started"`, `"Initializing"`, `"Processing"`, `"Generating Outputs"`, `"Awaiting Review"`, `"Completed"`, `"Failed"`。 |
| `node_type` | string (enum) | 节点的类型。可选值: `"Standard"`, `"Generator"`。 |
| `hitl_mode` | string (enum) | 节点的人机交互模式。可选值: `"VARL"`, `"SCA"`, `"AVL"`。 |
| `order_index` | integer | 节点在工作流中的顺序索引 (从 0 开始)。 |
| `active_version_id` | integer \| null | 当前活动的版本 ID。若节点未完成，则为 `null`。 |
| `phase_id` | string | 节点所属的阶段名称 (例如, "Phase 1: ...")。 |
| `stage_id` | string | 节点所属 Stage 的唯一 ID (例如, "1.1" 或 "Task_A1.2.1")。 |
| `stage_name` | string | Stage 的显示名称 (例如, "Strategic Definition")。 |
| `task_group_id` | string \| null | 如果节点是动态生成的，则为所属的任务组 ID。 |
| `is_stale` | boolean | **[新增]** 指示该节点的输入依赖相对于其上游节点的最新活动版本是否已过时。`true` 表示过时，前端应提供视觉提示（如警告图标），建议用户重新执行。 |

***
```


--- (870-1193 lines) ---
### 4_工作流管理(WorkflowManagement).md Content:

```md
## API 文档: 工作流管理

本部分 API 提供了对工作流实例的宏观管理功能。工作流是执行建模任务的容器，它由一系列相互依赖的节点组成。

### 核心概念

*   **项目与工作流**: 每个`项目 (Project)`在生命周期中最多拥有一个`工作流实例 (WorkflowInstance)`。工作流的创建和管理都与项目强绑定。
*   **工作流状态**:
    *   `Running`: 表示工作流已激活，可以或正在执行节点。**注意**: 一个新创建的工作流默认为此状态，但这仅表示“准备就绪”，并不意味着有节点正在执行。
    *   `Completed`: 工作流中所有节点均已成功执行完毕。
*   **阶段层级**: 所有工作流数据都以 `Phase -> Stage -> Node` 的树形结构通过 `WorkflowInstanceRead.phases` 返回。`stage_id` 与 `stage_name` 已成为节点的一等字段，前端无需再根据 `phase_id` 进行分组。
*   **动态结构**: 工作流的结构并非完全静态。当一个 `node_type` 为 `Generator` 的节点执行完成后，它会向当前工作流中**动态插入**一系列新的节点。
    *   **前端关键**: 必须监听 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件。收到此事件后，应立即废弃本地的工作流结构缓存，并调用 `GET /workflows/{workflow_id}` 重新获取完整的 `phases` 树来刷新视图。

### 认证与通用约定

所有端点都需要 `Authorization: Bearer <your_jwt_token>` 头。

**通用错误响应格式:**
```json
{
  "error_code": "UNIQUE_BUSINESS_ERROR_CODE",
  "message": "Human-readable error message.",
  "details": {}
}
```

---

### 1. 工作流生命周期管理

#### 1.1. 创建工作流

为指定项目创建一个新的工作流实例及其初始节点结构。

*   **Endpoint**: `POST /workflows/`
*   **权限**: 关联项目的所有者。

##### 请求体 (`WorkflowCreate`)
```json
{
  "name": "2024 Problem A - Initial Approach",
  "project_id": 12
}
```
*   `name` (string, **required**): 工作流的名称。
*   `project_id` (integer, **required**): 此工作流所属的项目的 ID。

##### 成功响应 (`201 Created`)
返回完整的 `WorkflowInstanceRead` 对象（包含层级化的 `phases`）。
```jsonc
{
  "id": 1,
  "name": "2024 Problem A - Initial Approach",
  "status": "Running", // 表示“准备就绪”
  "project_id": 12,
  "user_id": 1,
  "phases": [
    {
      "name": "Phase 1: Strategic Analysis & Macro Architecture",
      "stages": [
        {
          "id": "1.1",
          "name": "Strategic Definition",
          "nodes": [
            {
              "id": 101,
              "definition_id": "1.1.1",
              "name": "Problem Deconstruction and Mathematical Formulation",
              "phase_id": "Phase 1: Strategic Analysis & Macro Architecture",
              "stage_id": "1.1",
              "stage_name": "Strategic Definition",
              "status": "Not Started",
              "is_stale": false // [新增] 初始时总为 false
            }
          ]
        }
      ]
    }
  ]
}
```

##### 错误响应
*   `401 Unauthorized`: 认证失败。
*   `403 Forbidden`: 用户无权操作该项目。
*   `404 Not Found` (error_code: `NOT_FOUND`): `project_id` 不存在。
*   `409 Conflict` (error_code: `WORKFLOW_ALREADY_EXISTS`): 该项目已存在工作流。

##### > 前端实现要点
> *   此操作通常在项目配置阶段进行，成功后可将用户导航至工作流画布页面。
> *   请注意，启动工作流的操作并非此 API，而是属于项目管理的一部分 (`POST /projects/{project_id}/start`)。

#### 1.2. 获取工作流列表 (分页)

获取当前用户所有工作流的摘要列表，为仪表盘或项目列表页设计。

*   **Endpoint**: `GET /workflows/`
*   **权限**: 任何已认证的用户。

##### 查询参数
*   `skip` (integer, *optional*, default: `0`): 跳过的记录数。
*   `limit` (integer, *optional*, default: `20`): 每页返回的最大记录数。

##### 成功响应 (`200 OK`)
返回 `PaginatedResponse[WorkflowSummaryRead]` 对象。**注意**: 此响应不包含完整的 `phases`（节点层级）以优化性能。
```jsonc
{
  "total": 5,
  "items": [
    {
      "id": 1,
      "name": "2024 Problem A - Initial Approach",
      "status": "Running",
      "project_id": 12,
      "user_id": 1,
      "created_at": "2024-05-24T10:00:00Z",
      // 后端可能提供摘要信息
      // "node_count": 4, 
      // "completed_node_count": 1
    }
    // ... 其他工作流摘要
  ]
}
```
---
### 2. 单个工作流操作与查询

#### 2.1. 获取工作流详细信息

获取指定工作流的完整信息，是加载和刷新工作流画布页面的核心 API。

*   **Endpoint**: `GET /workflows/{workflow_id}`
*   **权限**: 工作流所有者。

##### 路径参数
*   `workflow_id` (integer, **required**): 要查询的工作流实例的唯一ID。

##### 成功响应 (`200 OK`)
返回 `WorkflowInstanceRead` 对象，包含最新的 `phases` 树（每个阶段下有若干 Stage 和节点列表）。**[重要变化]** 每个节点对象现在都包含一个 `is_stale` 布尔标志。
```jsonc
{
  "id": 1,
  "name": "Updated Workflow Name",
  "status": "Running",
  "project_id": 12,
  "user_id": 1,
  "phases": [
    {
      "name": "Phase 1: Strategic Analysis & Macro Architecture",
      "stages": [
        {
          "id": "1.1",
          "name": "Strategic Definition",
          "nodes": [
            {
              "id": 101,
              "definition_id": "1.1.1",
              "name": "Problem Deconstruction and Mathematical Formulation",
              "status": "Completed",
              "stage_id": "1.1",
              "stage_name": "Strategic Definition",
              "is_stale": false // [新增] 依赖未变
            },
            {
              "id": 102,
              "name": "Node B (depends on A)",
              "status": "Completed",
              "is_stale": true // [新增] Node A 版本更新后，Node B 变为过时
            }
          ]
        }
      ]
    },
    {
      "name": "Phase 2: Cyclic Sub-problem Execution",
      "stages": [
        {
          "id": "Task_A1.2.1",
          "name": "[Task_A1] Data & Model Generation",
          "nodes": [
            {
              "id": 201,
              "definition_id": "Task_A1.2.1.1",
              "name": "[Task_A1] Data Insights and Candidate Model Generation",
              "stage_id": "Task_A1.2.1",
              "stage_name": "[Task_A1] Data & Model Generation",
              "status": "Executing",
              "is_stale": false
            }
          ]
        }
      ]
    }
  ]
}
```

##### 错误响应
*   `401 Unauthorized`: 认证失败。
*   `403 Forbidden`: 用户无权访问该工作流。
*   `404 Not Found`: 指定的 `workflow_id` 不存在。

##### > 前端实现要点
> *   在进入工作流页面时首次调用此接口。
> *   当收到 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件时，必须调用此接口以获取全新的 `phases` 树并重新渲染。
> *   **[新增]** 在渲染节点时，检查 `node.is_stale` 标志。如果为 `true`，应在节点上显示一个明确的视觉指示器（如警告图标或虚线边框）。

#### 2.2. 更新工作流

*   **Endpoint**: `PATCH /workflows/{workflow_id}`
*   **权限**: 工作流所有者。
*   **描述**: 目前仅支持更新工作流名称。

##### 请求体 (`WorkflowUpdate`)
```json
{ "name": "Updated Workflow Name" }
```
*   `name` (string, *optional*): 新的工作流名称。

##### 成功响应 (`200 OK`)
返回更新后的 `WorkflowInstanceRead` 对象。

#### 2.3. 删除工作流

永久删除一个工作流及其所有关联数据。

*   **Endpoint**: `DELETE /workflows/{workflow_id}`
*   **权限**: 工作流所有者。
*   **警告**: 此操作不可逆，将删除所有节点、版本和结果。

##### 成功响应 (`204 No Content`)

##### 错误响应
*   `409 Conflict` (error_code: `WORKFLOW_IS_ACTIVE`): 无法删除一个正在执行节点的工作流。

##### > 前端实现要点
> *   在执行此操作前，务必向用户展示一个醒目的确认对话框。
> *   成功删除后，应将用户重定向至项目列表或仪表盘页面。

---
### 3. 工作流状态洞察

#### 3.1. 批量获取工作流节点过时信息

高效检查工作流中所有节点的输入依赖是否过时。

*   **Endpoint**: `GET /workflows/{workflow_id}/staleness`
*   **权限**: 工作流所有者。
*   **描述**: 返回一个映射，键为已过时的节点 ID，值为其过时原因的详细信息。

##### 成功响应 (`200 OK`)
```jsonc
{
  "105": [ // 节点 ID 105 已过时
    {
      "upstream_node_id": 101, // 上游依赖节点的 ID
      "upstream_definition_id": "1.1.1",
      "consumed_version_id": 1, // 它上次用的是版本 1
      "current_active_version_id": 2 // 但上游现在是版本 2
    }
  ]
}
```
##### > 前端实现要点
> *   **何时调用**:
>     1.  **[更新]** 当用户需要查看**为什么**一个节点是过时的（例如，鼠标悬浮在警告图标上时），可以调用此接口获取详细信息。 `is_stale` 标志提供了 "是否过时" 的信息，此接口提供了 "为何过时" 的答案。
>     2.  当任何节点的版本发生变更后（如：用户批准 HITL、手动编辑、切换历史版本）。
> *   **如何使用**: 遍历返回的字典的键（`"105"`），在画布上找到对应的节点，并为其添加一个视觉提示（如警告图标、虚线边框等），并在鼠标悬浮时展示过时详情。

---

### 4. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了工作流管理模块中使用的核心数据对象。

#### 4.1. WorkflowInstanceRead

表示一个工作流实例的完整信息，包含完整的 `Phase -> Stage -> Node` 层级结构。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 工作流实例的唯一标识符。 |
| `name` | string | 工作流的名称。 |
| `status` | string (enum) | 工作流的当前状态。可选值: `"Running"`, `"Completed"`。 |
| `project_id` | integer | 所属项目的 ID。 |
| `user_id` | integer | 所属用户的 ID。 |
| `phases` | array (PhaseRead) | 工作流的阶段数组，每个 Phase 内含多个 Stage，Stage 再包含节点列表。 |

#### 4.2. PhaseRead

表示工作流中的一个 Phase。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `name` | string | Phase 的显示名称 (例如, "Phase 1: Strategic Analysis & Macro Architecture")。 |
| `stages` | array (StageRead) | 此 Phase 下的 Stage 列表，按节点 `order_index` 顺序排列。 |

#### 4.3. StageRead

表示 Phase 内部的一个 Stage（逻辑分组）。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | string | Stage 的唯一 ID (例如, "1.1" 或 "Task_A1.2.1")。 |
| `name` | string | Stage 的显示名称 (例如, "Strategic Definition" 或 "[Task_A1] Data & Model Generation")。 |
| `nodes` | array (NodeInstanceRead) | 属于该 Stage 的节点列表，保持其全局执行顺序。 |

#### 4.4. StalenessInfo

描述一个节点的上游依赖为何"过时"的详细信息。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `upstream_node_id` | integer | 已更新的上游依赖节点的 ID。 |
| `upstream_definition_id` | string | 上游节点的定义 ID (例如, "1.1.1")。 |
| `consumed_version_id` | integer | 当前节点上次执行时所消费的上游版本 ID。 |
| `current_active_version_id`| integer \| null | 上游节点当前最新的活动版本 ID。 |

***
```


--- (1195-1583 lines) ---
### 5_节点与执行控制(Node_ExecutionControl).md Content:

```md
## API 文档: 节点与执行控制

本部分 API 专注于对工作流中的单个节点进行精细化操作，是实现人机协同（HITL）、版本控制和流程干预的核心。

### 核心概念

为更好地理解本模块 API，请先熟悉以下核心概念：

*   **节点生命周期 (Node Lifecycle)**: 一个节点通常会经历 `Not Started` -> `Executing` -> `Awaiting HITL Approval` -> `Completed` 的状态流。**[新增]** `Executing` 状态可以被中断，进入 `Canceled` 状态。`retry` 或 `re-execute` 等操作会使其重新进入 `Executing` 状态。`Failed` 是一个可能的终态，但可以通过 `retry` 恢复。
*   **版本 (Version)**: 每次节点成功执行并被用户批准后，其结果（输入、输出、交互历史）都会被固化为一个“版本”。`active_version` 代表该节点当前对外提供的“官方”结果。
*   **执行前沿 (Execution Frontier)**: 指工作流中已执行或正在执行的最后一个节点的序号。为保证流程的顺序性，用户不能“跳级”操作前沿之外的节点。
*   **过时状态 (Staleness)**: 当一个节点的上游依赖节点更新了其 `active_version` 后，该节点就处于“过时”状态。这是 **UI 提示** 的关键数据，应在界面上明确标记该节点，并建议用户“重新执行以同步最新上游数据”。

### 认证与通用约定

所有节点相关的 API 端点都需要通过 `Authorization` 头进行 Bearer Token 认证。

```http
Authorization: Bearer <your_jwt_token>
```

**通用错误响应格式:**

```json
{
  "error_code": "STRING_ERROR_CODE",
  "message": "A human-readable error message.",
  "details": {
    "additional": "context"
  }
}
```

---

### 1. 节点查询与展示

#### 1.1. 获取节点详细信息

此端点是渲染节点视图的主力，提供单个节点的完整状态、数据和上下文信息。

*   **Endpoint**: `GET /nodes/{node_id}`
*   **权限**: 必须是该节点所属工作流的所有者。
*   **描述**:
    *   查询并返回指定 `node_id` 的详细视图。
    *   **关键逻辑 (R5.2)**: 如果请求的节点处于 `NOT_STARTED` 状态，后端会校验其是否超前于工作流的“执行前沿”。若超前，将返回 `403 Forbidden`。
    *   **过时检查**: 响应中包含 `staleness_report` 字段，前端应检查此字段，若非空，则在 UI 上明确提示用户此节点的输入依赖已更新。

##### 路径参数
*   `node_id` (integer, **required**): 要查询的节点实例的唯一ID。

##### 成功响应 (`200 OK`)
返回一个 `NodeDetailView` 对象。

```jsonc
{
  "id": 101,
  "definition_id": "1.1.2",
  "name": "Architecture Design and Task Decomposition",
  "status": "Awaiting HITL Approval", // 节点当前的主状态，用于控制UI的主要交互
  "current_stage": "Awaiting Review", // 节点的详细执行阶段，用于更精细的UI展示（如进度条、状态文本）
  "node_type": "Generator",
  "hitl_mode": "SCA",
  "order_index": 1,
  "active_version_id": null, // 当节点未完成时，没有活动版本
  "phase_id": "Phase 1: Strategic Analysis & Macro Architecture",
  "stage_id": "1.1",
  "stage_name": "Strategic Definition",
  "task_group_id": null,
  "is_stale": false, // [新增] 指示节点是否过时
  "active_version": null, // 如果节点已完成，这里会包含其活动版本的数据
  "pending_result": { // 当节点在执行或等待审批时，临时结果会在这里。这是HITL界面的主要数据源
    "output_data": {
      "candidates": [
        { "id": "OptA", "name": "Optimization Approach", "...": "..." },
        { "id": "OptB", "name": "Simulation Approach", "...": "..." }
      ],
      "comparative_analysis": "Simulated LLM output comparing options..."
    },
    "accumulated_hitl_interactions": [],
    "error_log": null // 如果执行失败，这里会包含详细的错误日志
  },
  "staleness_report": null // 若非空，表示此节点的输入依赖已过时，UI应提示用户
}
```

##### `staleness_report` 示例 (如果存在):
```json
"staleness_report": [
  {
    "upstream_node_id": 100, // 上游节点的ID
    "upstream_definition_id": "1.1.1", // 上游节点的定义ID
    "consumed_version_id": 1, // 当前节点上次执行时所使用的上游版本号
    "current_active_version_id": 2 // 上游节点当前最新的活动版本号
  }
]
```

##### 错误响应
*   `401 Unauthorized`: 认证失败。
*   `403 Forbidden`: 用户无权访问该节点，或试图访问未解锁的节点。
*   `404 Not Found`: 指定的 `node_id` 不存在。

#### 1.2. 获取节点的所有版本

*   **Endpoint**: `GET /nodes/{node_id}/versions`
*   **权限**: 节点所有者。
*   **描述**: 按版本号降序返回指定节点的所有历史版本列表，用于版本回溯和比较。

##### 成功响应 (`200 OK`)
返回 `NodeVersionRead` 对象数组。
```json
[
  {
    "id": 2,
    "version_number": 2,
    "node_instance_id": 100,
    "summary": "Refined based on feedback...",
    "source": "MANUALLY_EDITED", // 版本来源：AI生成 或 手动编辑
    "based_on_version_id": 1,
    "...": "..."
  },
  {
    "id": 1,
    "version_number": 1,
    "node_instance_id": 100,
    "summary": "Initial version approved.",
    "source": "AI_GENERATED",
    "based_on_version_id": null,
    "...": "..."
  }
]
```

#### 1.3. 获取特定版本的详细信息

*   **Endpoint**: `GET /nodes/{node_id}/versions/{version_id}`
*   **权限**: 节点所有者。
*   **描述**: 获取单个版本的完整信息，包括其具体的 `output_data` 和 `hitl_history`。

---

### 2. 启动与推进执行

这类操作会触发节点的后台执行。API 会立即响应，前端应通过 WebSocket 监听后续状态更新。

#### 2.1. 重新执行已完成的节点 (探索性)

用于基于一个已有的版本，提供新的反馈，来重新执行一个已经 `COMPLETED` 的节点，旨在创造一个新的版本分支。

*   **Endpoint**: `POST /nodes/{node_id}/re-execute`
*   **权限**: 节点所有者。

##### 请求体 (`ExecutionRequest`)
```json
{
  "modification_comments": "Try to focus more on the simulation aspect.",
  "base_version_id": 2
}
```
*   `modification_comments` (string, *optional*): 提供给 LLM 的新的指令或反馈。
*   `base_version_id` (integer, *optional*): 指定基于哪个版本进行重新执行。如果省略，则默认使用当前 `active_version_id`。

##### 成功响应 (`202 Accepted`)
表示请求已被接受并进入后台处理队列。前端应立即更新 UI 为“执行中”状态，并禁用相关操作按钮。
```json
{
  "message": "Node re-execution has been accepted for processing.",
  "node_id": 101
}
```

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): 节点状态不是 `COMPLETED`，或正在执行中。
*   `403 Forbidden`: 尝试重新执行一个已完成的 `Generator` 节点。

#### 2.2. 重试失败的节点 (纠错性)

用于重新执行一个处于 `FAILED` 或 `CANCELED` 状态的节点，旨在完成当前失败或被取消的执行。

*   **Endpoint**: `POST /nodes/{node_id}/retry`
*   **权限**: 节点所有者。

##### 请求体 (`ExecutionRequest`)
```json
{
  "modification_comments": "I've updated the input file, please try again."
}
```
*   `modification_comments` (string, *optional*): 可选的反馈，用于指导重试。

##### 成功响应 (`202 Accepted`)
```json
{
  "message": "Node retry has been accepted for processing.",
  "node_id": 101
}
```

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): **[更新]** 节点状态不是 `FAILED` 或 `CANCELED`，或正在执行中。

#### 2.3. 取消节点执行 (Cancellation)

*   **Endpoint**: `POST /nodes/{node_id}/cancel`
*   **权限**: 节点所有者。
*   **描述**:
    *   向正在执行的节点 (`Executing` 状态) 发送一个取消请求。
    *   这是一个**异步操作**。API会立即返回，表示取消信号已发送。后台工作进程在接收到信号后会中断执行，并将节点状态更新为 `Canceled`。
    *   后续的状态变更将通过 `NODE_STATUS_UPDATED` WebSocket 事件推送。

##### 成功响应 (`202 Accepted`)
```json
{
  "message": "Cancellation request sent. The node will transition to 'Canceled' shortly."
}
```

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): 节点当前不处于 `Executing` 状态，无法取消。

---

### 3. 人机协同 (HITL)

此端点是人机交互的核心，用于提交用户对处于 `AWAITING_HITL_APPROVAL` 状态的节点的决策。

*   **Endpoint**: `POST /nodes/{node_id}/hitl`
*   **权限**: 节点所有者。

##### 请求体 (`HITLSubmission`)
```json
{
  "action": "Continue",
  "feedback_comment": null,
  "interaction_data": {
    "selected_ids": ["OptA"]
  }
}
```
*   `action` (string, **required**): 用户的操作类型。枚举值包括：
    *   `Continue`: 批准当前结果并继续工作流。需要提供 `interaction_data`。
    *   `RejectAndProvideModificationComments`: 拒绝当前结果，并提供反馈意见以触发新一轮执行。需要提供 `feedback_comment`。
    *   `Discard`: 丢弃本次执行尝试。状态将回滚到执行前的状态。
*   `feedback_comment` (string, *optional*): 当 `action` 为 `RejectAndProvideModificationComments` 时**必须**提供。
*   `interaction_data` (object, *optional*): 当 `action` 为 `Continue` 时**必须**提供，其结构取决于节点的 `hitl_mode`：
    *   **`hitl_mode: "SCA"` (Select Candidate/s)**: `{ "selected_ids": ["id_1", "id_2"] }`
    *   **`hitl_mode: "AVL"` (Adjudicate & Verify Loop)**: `{ "adjudication": [{ "critique_id": "c1", "decision": "Accepted", "comment": "..." }, ...] }`

##### 成功响应 (`200 OK`)
返回一个描述后续动作的对象，指导前端进行下一步操作。
```json
{
  "message": "Node approved. Starting next node 3.1.1.",
  "next_node_id": 102,
  "action": "ExecuteNext"
}
```
*   `action` 的可能值：
    *   `ExecuteNext`: 批准成功，并已自动触发下一节点执行。
    *   `NavigateNext`: 批准成功，但下一节点需要用户审阅。前端应导航至 `next_node_id`。
    *   `Completed`: 批准成功，且工作流已全部完成。
    *   `AVLLoop`: AVL 评审已提交，节点正在内部迭代。前端应等待 WebSocket 更新。
    *   `ReExecute`: 拒绝反馈已提交，节点将重新执行。前端应等待 WebSocket 更新。
    *   `Discarded`: 执行已丢弃，状态已回滚。前端应重新获取节点信息。

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): 节点不处于 `AWAITING_HITL_APPROVAL` 状态。
*   `400 Bad Request`: `interaction_data` 或 `feedback_comment` 不符合要求。

---

### 4. 版本与结果干预

#### 4.1. 提交手动编辑 (R4)

允许用户绕过 AI 执行，直接注入人工结果。这是一个高权限操作，会立即完成节点并创建新版本。

*   **Endpoint**: `POST /nodes/{node_id}/manual-edit`
*   **权限**: 节点所有者。
*   **重要影响**: 此操作会立即将节点设为 `Completed`，并用您提供的数据创建一个新版本。这会立即触发对所有下游节点的“过时”状态检查。

##### 请求体 (`ManualEditSubmission`)
```json
{
  "base_version_id": 2,
  "edited_output_data": {
    "Formal Problem Restatement": "This is my manually edited problem restatement."
  },
  "summary": "Manually corrected the problem statement for clarity."
}
```
*   `base_version_id` (integer, **required**): 必须指定一个基础版本。
*   `edited_output_data` (object, **required**): 用户编辑后的完整输出 JSON。
*   `summary` (string, *optional*): 对本次编辑的简短描述。

##### 成功响应 (`200 OK`)
返回更新后的节点实例信息 (`NodeInstanceRead`)。

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): 指定的 `base_version_id` 无效。
*   `403 Forbidden`: 试图编辑一个已完成的 `Generator` 节点。

#### 4.2. 激活指定版本

将指定的历史版本设置为当前节点的“官方”活动版本。

*   **Endpoint**: `POST /nodes/{node_id}/versions/{version_id}/activate`
*   **权限**: 节点所有者。
*   **重要影响**:
    *   此操作仅改变节点的 `active_version`，但**不会**自动重新执行任何下游节点。用户需自行决定是否基于此旧版本的结果去手动重新执行下游节点。
    *   **[新增]** 操作成功后，会广播一个 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。前端应监听此事件，并重新获取工作流的过时信息 (`is_stale` 标志) 以更新UI。

##### 路径参数
*   `node_id` (integer, **required**)
*   `version_id` (integer, **required**)

##### 成功响应 (`200 OK`)
返回更新后的 `NodeInstanceRead` 对象，其 `active_version_id` 已变为指定的 `version_id`。

##### 错误响应
*   `403 Forbidden`: 试图在 `Generator` 节点上切换版本。
*   `409 Conflict` (`INVALID_STATE`): 指定的 `version_id` 不属于该节点。

---

### 典型交互序列示例：成功执行一个节点

1.  **用户操作**: 在 UI 上点击“执行”。
2.  **前端**: 调用 `POST /nodes/{node_id}/re-execute` (或相关执行API)。
3.  **API 响应**: 立即返回 `202 Accepted`。
4.  **前端**: **立即**禁用执行按钮，UI 显示“执行中...”。
5.  **WebSocket**: 前端监听到 `NODE_STATUS_UPDATED` 事件，`status` 变为 `Executing`。UI 可根据 `current_stage` 更新进度。
6.  **WebSocket**: 执行完成，前端收到 `NODE_STATUS_UPDATED` 事件，`status` 变为 `Awaiting HITL Approval`。
7.  **前端**: 调用 `GET /nodes/{node_id}` 获取 `pending_result`，并使用其数据渲染 HITL 审批界面。

---

### 5. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了节点与执行控制模块中使用的核心数据对象。

#### 5.1. NodeDetailView

`GET /nodes/{node_id}` 返回的节点详细视图对象，继承自 `NodeInstanceRead`。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| *(所有 NodeInstanceRead 字段)* | | 参见项目管理文档中的 `NodeInstanceRead` 定义。 |
| `active_version` | object (NodeVersionRead) \| null | 如果节点已完成，此字段包含其当前活动版本的完整数据。 |
| `pending_result` | object (TemporaryExecutionRead) \| null | 如果节点正在执行或等待审批，此字段包含其临时的、未固化的结果。 |
| `staleness_report` | array (StalenessInfo) \| null | 如果节点的上游依赖已更新，此列表将包含详细的过时信息。 |

#### 5.2. NodeVersionRead

表示一个已固化的节点版本。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 版本的唯一标识符。 |
| `version_number`| integer | 版本号，在单个节点内递增。 |
| `node_instance_id` | integer | 所属节点实例的 ID。 |
| `summary` | string | 对此版本创建原因的简短总结 (例如, "Manually edited...")。 |
| `source` | string (enum) | 版本的来源。可选值: `"AI_GENERATED"`, `"MANUALLY_EDITED"`。 |
| `based_on_version_id` | integer \| null | 此版本所基于的前一个版本的 ID。 |
| `output_data` | object \| null | 节点执行后，经过 HITL 处理的最终输出数据。 |
| `raw_generated_output`| object \| null | AI 或执行引擎生成的原始、未经处理的输出数据。 |
| **`execution_artifacts`** | **object \| null** | **[新增]** 包含了执行此版本时产生的关键产物，用于数据溯源。可能包含：`prompt` (发送给LLM的提示), `generated_code.py` (生成的代码), `execution.log` (代码执行日志)等。 |
| `input_dependencies` | object | 一个映射 `{[upstream_node_id]: [consumed_version_id]}`，记录了执行时使用的上游依赖版本。 |
| `hitl_history` | array (object) | 包含了从创建到批准此版本的所有人机交互记录。 |
| `llm_model_name`| string | 执行此版本时使用的 LLM 模型名称。 |
| `temperature` | number (float) | 执行此版本时使用的 LLM 温度参数。 |

#### 5.3. TemporaryExecutionRead

表示节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时结果。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `output_data` | object \| null | AI 或执行引擎生成的当前临时输出。 |
| **`execution_artifacts`** | **object \| null** | **[新增]** 在当前执行周期内产生的关键产物。结构与 `NodeVersionRead` 中的 `execution_artifacts` 类似。 |
| `accumulated_hitl_interactions` | array (object) | 在当前执行周期内累积的人机交互记录。 |
| `error_log` | string \| null | 如果执行失败，这里会包含详细的错误信息和堆栈跟踪。 |

***
```


--- (1585-1749 lines) ---
### 6_实时通信(Real-timeCommunication-WebSocket).md Content:

```md
## API 文档: 实时通信 (WebSocket)

本篇文档旨在为前端开发者提供一份清晰、健壮且具有高度实践指导意义的 WebSocket API 指南，用于实现工作流状态的实时、可靠更新。

### 1. 核心原则与最佳实践

在深入细节之前，请理解以下核心设计原则：

1.  **WebSocket 是状态的“增量更新器”，而非唯一来源**:
    *   **初始状态通过 REST 获取**: 页面或组件加载时，**必须**首先通过 `GET /workflows/{id}` 或 `GET /projects/{id}` API 获取工作流的**完整快照**作为基础状态。
    *   **WebSocket 负责后续更新**: 建立 WebSocket 连接后，收到的事件用于**更新**这个基础状态。

2.  **事件是幂等的，携带全量数据**:
    *   `NODE_STATUS_UPDATED` 事件中的 `data` 负载是该节点的**完整最新状态**，而非“变更部分”的 diff。这意味着前端可以直接用新数据**替换**旧的节点数据，无需复杂的合并逻辑，这极大地降低了出错的概率。

3.  **连接是短暂的，状态是持久的**:
    *   不要假设 WebSocket 连接会永远存在。客户端必须实现**断线重连**机制。
    *   **重连后必须同步状态**: 每次成功重连后，应**立即**重新调用 REST API 获取一次全量快照，以同步断连期间可能错过的所有更新。这是保证数据一致性的关键。

#### 1.1. 推荐的数据流模型

```text
                             +-----------------------------+
                             |       前端状态管理器         |  <-- (Vuex, Redux, etc.)
                             | (e.g., currentWorkflow)     |
                             +-----------------------------+
                                     ^          ^
                                     |          | (5. 事件驱动更新)
(4. 用响应数据“灌溉”/覆盖初始状态)    |          |
                                     |          |
+------------------------------------+          +--------------------------------------+
| (1. 页面加载)                      |          | (3. 建立连接)                           |
| 前端发起 REST 请求                 |          | 前端建立 WebSocket 连接                  |
| GET /workflows/{id}                |          | ws://.../ws/{id}?token=...           |
+------------------------------------+          +--------------------------------------+
       |        |                                           |        ^
       |        | (2. 响应)                                 |        | (持续)
       v        v                                           v        |
+------------------------------------------------------------------------------------+
|                                    后端服务器                                        |
+------------------------------------------------------------------------------------+
```

### 2. 连接端点

*   **URL**: `ws://<your_server_address>/ws/{workflow_id}?token=<your_jwt_token>`
*   **协议**: `ws` (本地开发) 或 `wss` (生产环境)

#### 2.1. 路径与查询参数
*   `workflow_id` (integer, **required**): 要订阅的工作流实例 ID。
*   `token` (string, **required**): 有效的 JWT Access Token。

### 3. 认证与生命周期

#### 3.1. Token 生命周期与连接持久性

*   **一次性验证**: Token 仅在**连接建立的瞬间**被验证。一旦连接成功，即使 Token 在几分钟后过期，已建立的连接**不会**被中断。
*   **前端主动刷新**: 为了处理需要长时间保持连接的场景（例如用户在一个页面停留超过 token 有效期），前端应实现以下策略：
    1.  在 JWT Token 即将过期前（例如，过期前1分钟），主动调用 REST API 刷新 Token。
    2.  获取新 Token 后，**主动关闭**当前的 WebSocket 连接。
    3.  使用**新 Token** 立即重新建立连接。

这种主动管理模式可以确保无缝的实时体验，避免因 token 过期导致的意外断连。

#### 3.2. 连接关闭代码

*   **`1000 Normal Closure`**: 正常关闭（例如，用户离开页面，前端主动关闭）。
*   **`4001` (Custom)**: **认证失败**。Token 无效、格式错误或已过期。**UI 应提示用户重新登录**。
*   **`4003` (Custom)**: **授权失败**。用户无权访问该 `workflow_id`。**UI 应显示权限错误，并可能需要导航回列表页**。

### 4. 消息格式 (`EventPayload`)

#### 4.1. EventPayload

所有从服务器推送到客户端的 WebSocket 消息都遵循此结构。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `event_type` | string (enum) | 事件的类型，决定了 `data` 负载的结构和前端应采取的行动。 |
| `workflow_id`| integer | 事件所属的工作流实例 ID。 |
| `node_id` | integer \| null | 如果是节点级事件，则为关联的节点 ID；否则为 `null`。 |
| `data` | object | 事件的负载。其具体结构取决于 `event_type`。 |

#### 4.2. 事件负载 (`data`) 结构

*   **当 `event_type` 为 `NODE_STATUS_UPDATED` 或 `NODE_ACTIVE_VERSION_CHANGED` 时**: **[标题更新]**
    *   `data` 的结构为 `NodeInstanceRead`。**[重要变化]** 此对象现在包含 `is_stale` 字段。详情请参见项目管理文档。
*   **当 `event_type` 为 `WORKFLOW_STRUCTURE_UPDATED` 或 `WORKFLOW_STATUS_UPDATED` 时**:
    *   `data` 的结构为 `WorkflowInstanceRead`。**[重要变化]** 其内部嵌套的每个节点对象 (`nodes` 数组中) 也都包含 `is_stale` 字段。

### 5. 事件详解

#### 5.1. `NODE_STATUS_UPDATED` (高频)

*   **描述**: 工作流中单个节点的状态发生变化。这是构建动态 UI 的核心事件。
*   **`data` 负载**: `NodeInstanceRead` 对象 (节点的**完整**最新数据，**包含 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **状态变更**: 根据 `status` (现在包括 `Canceled`) 和 `current_stage` 更新节点的视觉表现。
    *   **交互锁定**: 当 `status` 变为 `Executing` 时，应禁用该节点上的所有操作按钮（如"执行"、"批准"），并显示加载指示器。
    *   **交互解锁**: 当 `status` 变为 `Awaiting HITL Approval`, `Failed`, 或 `Canceled` 时，应解锁对应的 HITL 操作按钮（如"批准/拒绝"或"重试"）。
    *   **数据刷新**: 如果用户正在查看该节点的详细视图，应使用事件 `data` 中的信息刷新视图内容。

#### 5.2. `NODE_ACTIVE_VERSION_CHANGED` (中频，高影响)

*   **描述**: 某个节点的"活动版本"(`active_version`) 发生了变更。这通常由以下操作触发：
    1.  用户手动切换到某个历史版本 (`POST /nodes/{id}/versions/{id}/activate`)。
    2.  用户提交了一次手动编辑 (`POST /nodes/{id}/manual-edit`)，创建了一个新的活动版本。
    3.  一个探索性的重新执行 (`re-execute`) 完成并被批准，创建了一个新的活动版本。
*   **`data` 负载**: `NodeInstanceRead` 对象 (变更后节点的**完整**最新数据，包含了新的 `active_version_id`)。
*   **UI 影响与操作**:
    *   **核心目的**: 此事件是**下游节点过时状态发生变化的权威信号**。
    *   **推荐操作流**:
        1.  收到此事件后，更新状态管理器中对应 `node_id` 的数据。
        2.  **立即**调用 `GET /workflows/{workflow_id}` 重新获取整个工作流的最新状态。这会刷新所有节点的 `is_stale` 标志。
        3.  使用新的工作流数据重新渲染画布，此时下游节点的视觉状态（警告图标等）会正确更新。
    *   **为何重要**: 如果不处理此事件，当上游节点版本变化时，UI 将无法及时向用户反馈下游节点的数据已"过时"，可能导致用户基于陈旧数据做出决策。

#### 5.3. `WORKFLOW_STRUCTURE_UPDATED` (低频，高影响)

*   **描述**: 工作流的节点集合发生了根本性变化（增加/重排序），通常由 `Generator` 节点完成时触发。
*   **`data` 负载**: `WorkflowInstanceRead` 对象 (包含**全新且完整**的 `Phase -> Stage -> Node` 树，**每个节点都带有最新的 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **全量替换**: **必须**将前端状态管理器中的 `phases` 树完全替换为此事件 `data.phases`。**严禁**尝试进行 diff 或 patch 操作。
    *   **用户体验考量**: 这是一个颠覆性的更新。建议在 UI 上显示一个短暂的、非阻塞的通知（例如 Toast "工作流已更新"），以告知用户发生了结构性变化。如果用户的焦点（例如，正在编辑的表单）位于受影响的节点上，需要谨慎处理，避免丢失用户输入。
    *   **渲染优化**: 在 Vue/React 中，确保你的节点列表渲染使用了 `key` 属性（例如 `v-for` 或 `.map`），以帮助框架高效地重新渲染 DOM。

#### 5.4. `WORKFLOW_STATUS_UPDATED` (低频)

*   **描述**: 整个工作流的顶级状态发生变化，主要是当工作流完成时。
*   **`data` 负载**: `WorkflowInstanceRead` 对象 (**其内部节点也包含最新的 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **全局状态更新**: 更新页面标题栏或面包屑导航中的工作流状态。
    *   **功能解锁**: 当 `data.status` 变为 `Completed` 时，应**启用**"导出项目"等最终操作按钮。
    *   **庆祝/总结**: 可以触发一个祝贺动画或自动导航到项目总结页面。

### 6. 客户端实现策略与模式

#### 6.1. 状态同步与“灌溉”模式 (State Hydration)

这是保证数据一致性的核心模式：

1.  **加载 (Load)**: 组件挂载时，显示全局加载状态。
2.  **获取 (Fetch)**: 调用 `GET /workflows/{id}`。
3.  **灌溉 (Hydrate)**: 请求成功后，将完整的响应数据存入状态管理器。此时，隐藏全局加载状态，渲染页面。
4.  **连接 (Connect)**: 在“灌溉”完成后，建立 WebSocket 连接。
5.  **更新 (Update)**: 监听事件，并用事件数据更新状态管理器中的对应部分。

#### 6.2. 处理竞态条件 (Race Conditions)

一个典型的竞态场景：当 WS 重连后，你发起了 `GET /workflows/{id}`（请求 A），在它的响应返回**之前**，一个 WebSocket 事件（事件 B）先到达了。

**解决方案**:

*   **以 REST 为基准**: 在“灌溉”模式下，可以简单地规定：当 REST 请求（请求 A）的响应到达时，它的数据**总是**覆盖当前状态。即使事件 B 先更新了状态，也会被更完整的快照 A 覆盖，后续的 WebSocket 事件会从这个新基准开始更新。
*   **(可选) 时间戳/版本号**: 更复杂的系统可能会在事件和 REST 响应中加入时间戳或版本号，客户端可以依此丢弃过时的数据。但在此 API 设计下，遵循上述“以 REST 为基准”的原则已足够健壮。

#### 6.3. 错误处理与健壮性

*   **连接错误**: 监听 WebSocket 的 `onerror` 和 `onclose` 事件。
*   **UI 反馈**: 在无法连接或连接中断时，在 UI 顶部显示一个持久的、非阻塞的横幅（Banner），提示“实时更新已中断，正在尝试重连...”。
*   **指数退避重连**: 实现一个带有指数退避（Exponential Backoff）和抖动（Jitter）的自动重连逻辑，避免在服务器故障时发起大量无效请求。例如，尝试间隔为 1s, 2s, 4s, 8s... 直到上限。
```


--- (1751-1921 lines) ---
### 7_系统与基础设施(System_Infrastructure).md Content:

```md
## API 文档: 系统与基础设施

本部分 API 提供了对后端服务自身状态的洞察，主要用于健康检查、服务监控和获取应用元数据。它们是前端应用进行初始连接测试、实现优雅的错误处理和展示系统信息的关键。

### 核心概念：服务探针 (Service Probes)

理解两种不同类型的检查至关重要：

*   **存活探针 (Liveness Probe - `GET /`)**: 这是一个非常轻量级的检查，仅用于回答“应用进程是否正在运行并响应HTTP请求？”。它不检查数据库或Redis等外部依赖。
*   **就绪探针 (Readiness Probe - `GET /health`)**: 这是一个更深入的检查，用于回答“应用是否已完全准备好处理真实的用户流量？”。它会验证所有关键外部依赖是否正常工作。**一个服务可以是存活的（Liveness=OK），但尚未就绪（Readiness=Failed）**。

### 全局约定

*   **认证**: 本模块所有端点均为**公开访问**，无需认证。
*   **缓存**:
    *   `GET /` 和 `GET /health` 端点的响应 **不应被缓存**，因为它们的价值在于提供实时的服务状态。
    *   `GET /system/info` 的响应 **强烈建议在客户端缓存**，因为它在应用生命周期内是静态的。

---

### 1. 根端点 (存活探针)

#### **`GET /`**

检查服务进程是否正在运行并可达。

*   **描述**:
    *   确认后端 FastAPI 应用进程已启动并能响应 HTTP 请求。这是最基础的网络连通性检查。

*   **最佳实践与使用场景**:
    *   **前端**: 在应用启动的最初阶段调用，用于确认与后端的基本网络连接。如果此请求失败，可以立即向用户显示“无法连接到服务器”的消息，而无需尝试后续更复杂的操作（如登录）。
    *   **CI/CD**: 在部署流程中，可作为“冒烟测试”，快速验证新部署的容器是否已成功启动。
    *   **基础设施**: 可用作容器编排系统（如 Kubernetes）的 `livenessProbe`，用于在进程崩溃时自动重启容器。

##### 成功响应 (`200 OK`)
```json
{
  "message": "Workflow Engine Backend (Optimized Version) is running."
}
```

##### 错误响应
*   此端点本身逻辑简单，几乎不会产生应用层错误。任何非 `200` 的响应（如 `502 Bad Gateway`, `Connection Refused`）都表明存在网络或基础设施层面的问题。

---

### 2. 健康检查 (就绪探针)

#### **`GET /health`**

检查服务及其所有关键依赖的健康状况。

*   **描述**:
    *   执行一次实时的、深入的健康检查，验证后端所有关键依赖项（当前为数据库和Redis）是否正常工作。只有当所有依赖项都健康时，服务才被认为是“就绪”的。

*   **最佳实践与使用场景**:
    *   **前端**:
        *   **初始加载**: 在应用加载时，可以在显示主界面前调用此接口。如果失败，可以展示一个全局的、非侵入式的横幅或状态指示器，告知用户“部分系统功能可能受限”。
        *   **心跳检测**: 对于需要高可用性的仪表盘应用，可以设置一个较低频率的轮询（例如每60秒）来调用此端点。当状态从 `OK` 变为 `Failed` 时，可以主动禁用所有与后端交互的UI元素，并向用户显示系统正在维护或遇到问题的友好提示。
    *   **基础设施**: 这是 Kubernetes `readinessProbe` 的理想目标。当此检查失败时，流量将不会被路由到该服务实例，从而实现优雅的服务降级和故障隔离。

##### 成功响应 (`200 OK`)
表示后端服务及其所有依赖都处于健康状态，已准备好处理全部业务请求。
```json
{
  "status": "ok"
}
```

##### 错误响应 (`503 Service Unavailable`)
表示一个或多个关键依赖（数据库或Redis）无响应。

*   **前端应如何处理**:
    1.  **向用户提供清晰的反馈**: 显示一个全局消息，如“系统当前不可用，请稍后重试。”
    2.  **禁用写操作**: 禁用所有会向后端发送数据的按钮和表单，防止用户操作失败和数据丢失。
    3.  **实现智能重试**: 可以实现一个带**指数退避**策略的重试机制，在后台尝试重新连接，一旦 `/health` 恢复 `200`，则自动移除提示并恢复UI功能。

*   **响应体**:
    ```json
    {
      "detail": "Service is unhealthy."
    }
    ```

---

### 3. 系统信息 (应用元数据)

#### **`GET /system/info`**

获取应用版本和静态配置信息。

*   **描述**:
    *   返回关于当前部署的后端应用的静态元数据。这些信息在应用启动时确定，运行时不会改变。

*   **最佳实践与使用场景**:
    *   **一次调用，长期缓存**: 前端应用应在**首次加载时调用此接口一次**，然后将结果保存在内存或本地存储中，供整个会话期间使用。这可以减少不必要的网络请求。
    *   **UI展示**:
        *   在应用的“关于”页面或页脚显示 `app_version`。
        *   在用户提交支持请求或反馈时，可以自动附上 `app_version`，便于问题定位。
    *   **配置驱动的UI**: `llm_model_name` 可以在用户设置界面作为默认模型的提示信息。

##### 响应体字段

| 字段名         | 类型   | 描述                                             |
| -------------- | ------ | ------------------------------------------------ |
| `app_version`    | string | FastAPI 应用的版本号，硬编码于 `main.py`。       |
| `llm_model_name` | string | 系统配置中指定的默认 LLM 模型名称。              |

##### 成功响应 (`200 OK`)
```json
{
  "app_version": "2.1.0",
  "llm_model_name": "O-Award-Model-Optimized-v2.1"
}
```

##### 错误响应
*   此端点逻辑非常简单，通常不会失败。任何错误都可能表示服务器存在严重的基础配置问题。

---

### 前瞻性与潜在增强 (Future-Proofing & Potential Enhancements)

为了使前端架构更具弹性，可以预见 `/system/info` 端点未来可能会包含更多信息。建议前端在解析此响应时，**优雅地处理未知字段**。

**未来可能增加的字段示例**:

*   `commit_hash` (string): 用于精准定位代码版本的 Git commit SHA。
*   `build_timestamp` (string): 应用的构建时间戳 (ISO 8601格式)。
*   `documentation_url` (string): 指向当前版本对应API文档的链接。
*   `feature_flags` (object): 一个键值对，用于后端控制前端功能的开启或关闭，实现功能灰度发布。

```jsonc
// 未来可能的响应格式
{
  "app_version": "2.2.0-beta",
  "llm_model_name": "O-Award-Model-Optimized-v2.2",
  // DevOps & Tracing Info
  "commit_hash": "a1b2c3d4e5f6",
  "build_timestamp": "2024-10-26T10:00:00Z",
  // Discoverability
  "documentation_url": "https://docs.example.com/v/2.2.0",
  // Feature Toggles
  "feature_flags": {
    "enableNewDashboard": true,
    "enableAdvancedExport": false
  }
}
```

---

### 4. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了系统与基础设施模块中使用的核心数据对象。

#### 4.1. SystemInfo

`GET /system/info` 返回的应用元数据对象。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `app_version`| string | 后端应用的版本号。 |
| `llm_model_name` | string | 系统配置中指定的默认 LLM 模型名称。 |

***
```


--- (1925-1959 lines) ---
## 附录: 系统需求规格 (SRS) 与功能需求规格 (FRS)

### 系统需求规格 (SRS) - 节点生命周期与状态机

#### **4. 节点生命周期与状态机**

*   **4.1. 节点状态:**
    *   `未开始 (Not Started)`
    *   `执行中 (Executing)`
    *   `等待HITL批准 (Awaiting HITL Approval)`
    *   `已完成 (Completed)`
    *   `执行失败 (Failed)`
    *   `已取消 (Canceled)`: 节点的执行被人为请求中止。

*   **4.2. 状态转换规则:**
    *   `执行中` -> `已取消`: 当用户请求取消任务，且后台工作进程成功中止执行时。此过程不产生任何新版本。
    *   `等待HITL批准` / `执行失败` / `已取消` -> `已完成` (或 `未开始`): 当用户点击"丢弃本次执行"。
    *   `执行失败` / `已取消` -> `执行中`: 当用户点击"重试"并提交。

---

### 功能需求规格 (FRS) - 用户设置面板

#### **7. 用户设置面板 (User Settings Panel)**

*   **7.4 人机交互行为 (HITL Behavior)**
    *   **用户等级 (User Level / HITL Profile)**: 用户选择一个预设等级（例如："新手 Novice"、"熟练 Experienced"、"专家 Expert"）。
    *   **配置映射 (Configuration Mapping)**: 该等级决定了新工作流的默认 HITL 配置。不同的等级对应不同的 HITL 模式（AVL、SCA、VARL）干预策略。
    *   **[实施细则与澄清]:** 依据 SRS 中"严格线性执行流程 (2.2)"和"强制性人机交互 (2.4)"的定义，HITL Profile **不会**改变工作流的结构或跳过 HITL 环节。相反，它影响的是 HITL 环节内部的 AI 行为。例如，在对抗性验证循环 (AVL) 中，专家等级会导致 AI 生成更少或更低严重性的批判（体现出更高的自动化信任度），而新手等级则会导致 AI 生成更严格、更多样化的批判以提供更多指导。

*   **7.5 思考深度 (Thinking Depth)**
    *   影响 AI 生成内容的复杂度和耗时。
    *   可选值包括："即时 (Instant)"、"中等 (Medium)"、"深度 (Heavy)"。

---

</api>

<front_stack>
--- (12-12 lines) ---
| | ↳ **React Server Components (RSC)** | 在服务端直接执行组件逻辑，如 `app/chat/components/site-header.tsx` 中的 `StarCounter` 组件，它在服务端 `fetch` 数据并渲染，提升了性能和安全性。 |


--- (15-15 lines) ---
| | ↳ **`next/headers`** | 用于在服务器端组件中访问请求头，如 `src/i18n.ts` 中使用 `cookies()` 函数读取 Cookie 以实现服务端国际化。 |


--- (22-25 lines) ---
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |



--- (28-31 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **自定义 SSE 客户端** | 项目在 `core/sse/fetch-stream.ts` 中实现了一个健壮的 `fetchStream` 函数。它使用 `fetch` API 和 `TextDecoderStream` 来处理流式响应，并能正确解析 Server-Sent Events (SSE) 协议，是实现聊天流式响应的核心底层工具。 |



--- (70-79 lines) ---
| **tiptap-markdown** | Tiptap 的扩展，用于在 Markdown 和 Tiptap 的 JSON 格式之间进行双向转换。 |
| **Tiptap 扩展集** | 使用了一系列扩展来增强编辑器功能，包括 `StarterKit`, `Placeholder`, `Link`, `Image`, `TaskList`, `Table`, `CodeBlockLowlight`, `TextStyle`, `Color`, `Highlight`, `Mathematics` 等。 |
| **`MathematicsWithMarkdown`** | 在 `components/editor/math-serializer.ts` 中自定义的 Tiptap 扩展，增强了对 KaTeX 数学公式的 Markdown 序列化支持。 |
| **React Markdown** | 用于在非编辑区域（如聊天消息）安全地渲染 Markdown 内容。 |
| **Remark / Rehype** | Markdown AST (抽象语法树) 生态系统，用于处理和转换 Markdown。 |
| | ↳ `remark-gfm` | 支持 GitHub Flavored Markdown (表格、删除线等)。 |
| | ↳ `remark-math` | 支持 Markdown 中的数学公式语法。 |
| | ↳ `rehype-katex` | 将数学公式 AST 渲染为 HTML。 |
| | ↳ **`unist-util-visit`** | 用于遍历和操作 AST 的核心工具，是编写自定义 Rehype 插件的基础。 |
| **KaTeX** | 用于在 Web 上高性能地排版和渲染数学公式。 |


--- (85-89 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **React Hook Form** | 用于管理设置页面 (`settings`) 的表单状态、校验和提交。 |
| **Zod** | 一个 TypeScript-first 的 schema 声明和校验库，用于定义表单数据结构和验证规则。 |
| **`@hookform/resolvers`** | 用于将 Zod schema 与 React Hook Form 集成，实现无缝的表单验证。 |


--- (119-122 lines) ---
| **@t3-oss/env-nextjs** | 用于在 `src/env.js` 中校验和强制类型化 Next.js 项目的环境变量，确保应用的健壮性。 |
| **nanoid** | 用于生成小巧、安全的唯一字符串 ID，例如为聊天线程和消息分配 ID。 |
| **best-effort-json-parser** | 一个容错能力较强的 JSON 解析器，用于处理可能不完全规范的流式 JSON 数据。 |
| **lru-cache** | 实现 LRU (Least Recently Used) 缓存策略，用于缓存网页标题等数据，减少重复请求。 |


--- (128-128 lines) ---
| **Markdown Loader** | 项目的构建配置支持直接 `import` `.md` 文件。`app/settings/tabs/about-tab.tsx` 的实现证明了这一点，`typings/md.d.ts` 为其提供了 TypeScript 类型支持。 |


--- (148-148 lines) ---
| **`Link` (自定义)** | 位于 `components/deer-flow/link.tsx`，这是一个增强版的 `<a>` 标签。它会查询 Zustand store 中的工具调用历史，判断一个链接是否在之前的搜索结果中出现过。如果未出现，则会显示一个“链接不可靠”的警告图标。这是一个**将 UI 组件与业务状态深度结合**的创新实践。 |


--- (153-161 lines) ---
项目基于 Zustand 构建了清晰、高效的状态管理架构，核心代码位于 `core/store/`。

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **状态与设置分离** | `store.ts` 负责管理**会话相关的动态状态**（如消息、响应状态），而 `settings-store.ts` 负责管理**用户配置**。这种分离使得状态管理更加清晰，易于维护。 |
| **`sendMessage` 异步流程编排** | 这个核心函数是整个聊天功能的驱动器。它展示了：<br>1. **乐观更新**: 立即将用户消息追加到状态中。<br>2. **流式处理**: 调用 `chatStream` 并通过 `for await...of` 循环处理 SSE 事件。<br>3. **批量更新**: 使用 `setTimeout` 和 `Map` 对来自流的多个消息更新事件进行批处理，减少 React 的重渲染次数，提升性能。<br>4. **错误处理**: 使用 `try...finally` 确保无论成功与否，`responding` 状态都能被正确重置。 |
| **`mergeMessage` 纯函数** | 位于 `core/messages/merge-message.ts`，这是一个独立的、无副作用的函数，负责根据收到的 SSE 事件更新单个消息对象的状态。这种模式将状态变更的复杂逻辑从主流程中剥离，使其易于测试和维护，是 Reducer 模式的体现。 |
| **派生状态选择器 (Selectors)** | 项目定义了多个自定义 Hook (`useMessage`, `useRenderableMessageIds`, `useLastInterruptMessage`) 来从 store 中派生和选择数据。它们结合 `useShallow` 进行性能优化，封装了获取特定状态的逻辑，避免了组件内的重复计算。`useRenderableMessageIds` 尤其巧妙，它预先过滤出需要在 UI 中渲染的消息，从根源上解决了 React 列表渲染时的 `key` 值警告问题。 |
| **LocalStorage 持久化** | `settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数提供了一个简洁明了的模式，用于将 Zustand store 的状态与 `localStorage` 同步，实现了用户设置的持久化。 |


--- (163-171 lines) ---
#### 3. API 通信与数据处理模式

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **模拟流式响应 (`chatReplayStream`)** | `core/api/chat.ts` 中的 `chatReplayStream` 函数是一个极具价值的工具。它能够读取静态文本文件，并**模拟**一个实时的 SSE 流，甚至可以控制快进。这对于开发、调试、演示和编写测试用例都非常有用。 |
| **健壮的 JSON 解析 (`parseJSON`)** | 位于 `core/utils/json.ts`，这个工具函数使用 `best-effort-json-parser` 并结合自定义逻辑来处理来自 LLM 的、可能不完全合规的 JSON 字符串（例如，后面跟着多余的文本）。这对于与大语言模型交互的应用来说至关重要。 |
| **Markdown 预处理** | `core/utils/markdown.ts` 提供了一系列用于清理和规范化 Markdown 文本的函数，特别是 `normalizeMathForEditor` 和 `unescapeLatexInMath`，它们解决了在富文本编辑器中正确处理 LaTeX 数学公式的痛点。 |
| **统一的 API URL 解析** | `core/api/resolve-service-url.ts` 中的 `resolveServiceURL` 函数确保了所有对后端服务的请求都通过一个统一的函数来构建 URL，便于管理和切换 API 基地址。 |



--- (176-176 lines) ---
| **服务端 Cookie 读取** | `src/i18n.ts` 中使用 `next/headers` 的 `cookies()` 函数，在**服务端**直接读取 `NEXT_LOCALE` Cookie。这使得在 RSC 或服务器端渲染时就能确定用户的语言偏好，无需等待客户端加载。 |


--- (181-184 lines) ---
| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **类型安全的环境变量** | `src/env.js` 使用 `@t3-oss/env-nextjs` 将环境变量分为 `server` 和 `client` 两部分，并使用 Zod 进行校验和类型定义。`runtimeEnv` 则负责将 `process.env` 的值安全地映射到这些定义上，同时处理了布尔值等类型的转换。这是一个确保应用配置正确、避免运行时错误的最佳实践。 |
| **运行时配置获取** | `core/api/hooks.ts` 中的 `useConfig` Hook 展示了如何从后端异步获取应用配置（如可用的 LLM 模型）。它包含了**重试逻辑**和**超时机制**，并在失败后回退到默认配置，增强了应用的鲁棒性。 |


--- (206-206 lines) ---
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |


--- (231-238 lines) ---
项目在代码中体现了防御性编程的思想，确保在各种异常情况下应用依然能稳定运行。

| 策略/模式 | 描述与复用价值 |
| :--- | :--- |
| **API 请求重试与超时** | `core/api/hooks.ts` 中的 `useConfig` Hook 在 `fetch` 配置时，不仅设置了超时 (`AbortSignal.timeout`)，还实现了带有指数退避 (exponential backoff) 的重试逻辑。这显著提高了应用在网络不佳情况下的稳定性。 |
| **组件级错误回退** | `components/deer-flow/fav-icon.tsx` 组件的 `img` 标签上使用了 `onError` 事件处理器。当网站图标加载失败时，它会自动切换到一个通用的备用图标，避免了在 UI 上显示破碎的图片。 |
| **环境驱动的逻辑切换** | `env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY` 环境变量在多个地方被用作开关，以改变应用的行为。例如，`chatStream` 会根据此变量决定是调用真实的 API 还是模拟的 `chatReplayStream`。这使得同一套代码库可以轻松地部署为功能完整的动态应用或纯静态的演示网站。 |
| **容错数据解析** | `core/utils/json.ts` 中的 `parseJSON` 函数在解析失败时不会直接抛出错误，而是会返回一个预设的 `fallback` 值。这使得即使 LLM 返回的 JSON 格式稍有瑕疵，UI 也不会因此崩溃。 |


--- (249-249 lines) ---
| **状态更新批处理** | `core/store/store.ts` 中的 `sendMessage` 函数在处理 SSE 流时，并没有在每次收到 `chunk` 时都立即调用 `setState`，而是将待更新的消息放入一个 `pendingUpdates` Map 中，并通过 `setTimeout` 进行批处理。这种“去抖”或“批处理”的模式，将一秒内可能发生的数十次状态更新合并为少数几次，极大地减少了 React 的渲染次数，是流式应用性能优化的关键。 |


--- (259-260 lines) ---
| **强大的调试与演示工具** | `core/api/chat.ts` 中的 `chatReplayStream` 是一个强大的开发和演示工具。它允许开发者将一次真实的 API 交互录制为文本文件，然后在本地通过 URL 参数（`?replay=...`）完美复现整个流式交互过程。这对于调试复杂的后端逻辑、制作产品演示以及编写端到端测试都非常有价值。 |
| **直接导入 Markdown 内容** | 项目配置了 Webpack (或 Turbopack) 加载器，允许直接 `import` `.md` 文件作为字符串。如 `app/settings/tabs/about-tab.tsx` 中 `import aboutEn from "./about-en.md";`。配合 `typings/md.d.ts` 中的类型声明，这为处理静态文本内容（如“关于”页面、文档）提供了极为便捷和类型安全的方式。 |


--- (279-279 lines) ---
| **Zod 作为多场景验证器** | Zod schema 不仅用于 React Hook Form 的表单验证 (`app/settings/tabs/general-tab.tsx`)，还在 `app/settings/dialogs/add-mcp-server-dialog.tsx` 中用于**实时验证用户输入的 JSON 配置**，为用户提供即时的、具体的错误反馈。这展示了 Zod 作为“单一事实来源”在多种场景下统一数据校验逻辑的强大能力。 |

</front_stack>

<deer_flow_frontend_code>
--- (584-709 lines) ---
        ## models
         - user.model.ts
         - auth.model.ts
         - settings.model.ts

### core/models/user.model.ts Content:

```ts
import { z } from "zod";

// API 4.2 (Auth) / 3.1 (User Management): UserRead
export const UserReadSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  is_active: z.boolean(),
  is_verified: z.boolean(),
});
export type UserRead = z.infer<typeof UserReadSchema>;

// API 1.2 (User Management): PasswordChange
export const PasswordChangeRequestSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  // API Spec 2.1.2 requirement: minimum 8 characters
  new_password: z.string().min(8, "New password must be at least 8 characters long"),
});
export type PasswordChangeRequest = z.infer<typeof PasswordChangeRequestSchema>;

```

### core/models/auth.model.ts Content:

```ts
import { z } from "zod";

// --- Request Schemas ---

// API 1.1: Login (used for form validation)
// The actual request must be application/x-www-form-urlencoded with 'username' and 'password' fields.
export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// API 1.2: Register
export const RegisterRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  // API Spec 1.2.1 requirement: minimum 8 characters
  password: z.string().min(8, "Password must be at least 8 characters long"),
  display_name: z.string().optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// API 3.1: Request Password Reset (future development expectation)
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// --- Response Schemas ---

// API 4.1: Token Response
export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
});
export type TokenResponse = z.infer<typeof TokenResponseSchema>;

```

### core/models/settings.model.ts Content:

```ts
import { z } from "zod";

// Enums based on FRS 7.2, 7.4, 7.5 and API 2.2
export const LanguageEnum = z.enum(["en", "zh"]);
export type Language = z.infer<typeof LanguageEnum>;

// We use "system" internally for next-themes UI, but the API expects only light/dark.
export const ThemeEnumUI = z.enum(["light", "dark", "system"]);
export type ThemeUI = z.infer<typeof ThemeEnumUI>;

export const ThemeEnumAPI = z.enum(["light", "dark"]);
export type ThemeAPI = z.infer<typeof ThemeEnumAPI>;

export const HitlProfileEnum = z.enum(["Novice", "Experienced", "Expert"]);
export type HitlProfile = z.infer<typeof HitlProfileEnum>;

export const ThinkingDepthEnum = z.enum(["Instant", "Medium", "Heavy"]);
export type ThinkingDepth = z.infer<typeof ThinkingDepthEnum>;

// API 3.2 (User Management): UserSettingsRead
// This model is used for GET responses. It NEVER includes secrets.
export const UserSettingsReadSchema = z.object({
  language: LanguageEnum,
  theme: ThemeEnumAPI, // Backend stores explicit light or dark
  hitl_profile: HitlProfileEnum,
  thinking_depth: ThinkingDepthEnum,
  llm_model_name: z.string().nullable(),
  // Allow empty string which might be parsed from inputs before validation
  llm_base_url: z.string().url().nullable().or(z.literal("")),
  // Security Indicators (Write-After-Forgotten - S3.3)
  has_llm_api_key: z.boolean(),
  has_e2b_api_key: z.boolean(),
});
export type UserSettingsRead = z.infer<typeof UserSettingsReadSchema>;

// API 2.2 (User Management): UserSettingsUpdate (PATCH Request)
// This model is used for PATCH requests. All fields are optional.
// It allows sending secrets (明文) for update, or null/"" for deletion.
export const UserSettingsUpdateSchema = z.object({
  language: LanguageEnum.optional(),
  theme: ThemeEnumAPI.optional(),
  hitl_profile: HitlProfileEnum.optional(),
  thinking_depth: ThinkingDepthEnum.optional(),
  llm_model_name: z.string().nullable().optional(),
  llm_base_url: z.string().url().nullable().optional().or(z.literal("")),
  // Writable secrets. Send null or "" to clear.
  llm_api_key: z.string().nullable().optional(),
  e2b_api_key: z.string().nullable().optional(),
});
export type UserSettingsUpdate = z.infer<typeof UserSettingsUpdateSchema>;

```


--- (774-1192 lines) ---
        ## api
         - auth.service.ts
         - resolve-service-url.ts
         - user.service.ts
         - types.ts
         - client.ts
         - index.ts

### core/api/auth.service.ts Content:

```ts
import { AxiosError } from "axios";

import type {
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
} from "~/core/models/auth.model";
import type { UserRead } from "~/core/models/user.model";

import apiClient from "./client";

export const AuthService = {
  /**
   * Logs in a user (API 1.1.1).
   * IMPORTANT: Uses application/x-www-form-urlencoded.
   */
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    // The API expects 'username' field for the email (OAuth2 standard)
    formData.append("username", data.email);
    formData.append("password", data.password);

    try {
      const response = await apiClient.post<TokenResponse>("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    } catch (error) {
      // Specific error handling based on API 1.1 Integration Guide
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        if (status === 401) {
          // Throw a specific error code for the UI to catch
          throw new Error("INVALID_CREDENTIALS");
        }
        if (status === 403) {
          const detail = (error.response.data as { detail?: string })?.detail;
          if (detail?.includes("not verified")) {
            throw new Error("ACCOUNT_NOT_VERIFIED");
          }
          throw new Error("ACCOUNT_DISABLED");
        }
      }
      throw error; // Re-throw other errors
    }
  },

  /**
   * Registers a new user account (API 1.2.1).
   */
  register: async (data: RegisterRequest): Promise<UserRead> => {
    try {
      // Expect 201 Created
      const response = await apiClient.post<UserRead>("/auth/register", data, {
        validateStatus: (status) => status === 201,
      });
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (User already exists) - API 1 Common Errors
      if (error instanceof AxiosError && error.response?.status === 409) {
        const errorCode = (error.response.data as { error_code?: string })?.error_code;
        if (errorCode === "USER_ALREADY_EXISTS") {
          throw new Error("USER_ALREADY_EXISTS");
        }
      }
      throw error;
    }
  },

  /**
   * Verifies the user's email address (API 1.3.2).
   */
  verifyEmail: async (token: string): Promise<UserRead> => {
    try {
      const response = await apiClient.post<UserRead>("/auth/verify-email", { token });
      return response.data;
    } catch (error) {
      // Handle 401 Unauthorized (Invalid or expired token)
      if (error instanceof AxiosError && error.response?.status === 401) {
        throw new Error("TOKEN_INVALID_OR_EXPIRED");
      }
      throw error;
    }
  },

  /**
   * Resends the verification email (API 1.3.3).
   */
  resendVerificationEmail: async (email: string): Promise<void> => {
    // Expect 202 Accepted. The API handles the "always return success" logic.
    await apiClient.post(
      "/auth/resend-verification-email",
      { email },
      {
        validateStatus: (status) => status === 202,
      },
    );
  },

  /**
   * Requests a password reset (stub implementation) (API 1.3.1).
   */
  requestPasswordReset: async (data: ResetPasswordRequest): Promise<void> => {
    // Expect 202 Accepted. The API handles the "always return success" logic.
    await apiClient.post("/auth/reset-password", data, {
      validateStatus: (status) => status === 202,
    });
  },
};

```

### core/api/resolve-service-url.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { env } from "~/env";

/**
 * Constructs a full URL to the backend service.
 * @param path The API endpoint path (e.g., "auth/login")
 * @returns The full URL string
 */
export function resolveServiceURL(path: string): string {
  let BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;

  if (!BASE_URL.endsWith("/")) {
    BASE_URL += "/";
  }

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;

  return new URL(cleanPath, BASE_URL).toString();
}

```

### core/api/user.service.ts Content:

```ts
import { AxiosError } from "axios";

import type {
  UserSettingsRead,
  UserSettingsUpdate,
} from "~/core/models/settings.model";
import type { PasswordChangeRequest, UserRead } from "~/core/models/user.model";

import apiClient from "./client";

export const UserService = {
  /**
   * Gets the profile information of the currently authenticated user (API 2.1.1).
   */
  getCurrentUser: async (): Promise<UserRead> => {
    const response = await apiClient.get<UserRead>("/users/me");
    return response.data;
  },

  /**
   * Changes the password of the currently authenticated user (API 2.1.2).
   */
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    try {
      // Expect 204 No Content on success
      await apiClient.patch("/users/me/password", data, {
        validateStatus: (status) => status === 204,
      });
    } catch (error) {
      // Handle 403 Forbidden (Incorrect current password)
      if (error instanceof AxiosError && error.response?.status === 403) {
        throw new Error("INCORRECT_CURRENT_PASSWORD");
      }
      throw error;
    }
  },

  /**
   * Gets the personalized settings of the currently authenticated user (API 2.2.1).
   */
  getCurrentUserSettings: async (): Promise<UserSettingsRead> => {
    const response = await apiClient.get<UserSettingsRead>("/users/me/settings");
    return response.data;
  },

  /**
   * Updates the personalized settings of the currently authenticated user (API 2.2.2).
   */
  updateCurrentUserSettings: async (
    data: UserSettingsUpdate,
  ): Promise<UserSettingsRead> => {
    const response = await apiClient.patch<UserSettingsRead>("/users/me/settings", data);
    return response.data;
  },
};

```

### core/api/types.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

interface Option {
  text: string;
  value: string;
}

// Tool Calls

export interface ToolCall {
  type: "tool_call";
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolCallChunk {
  type: "tool_call_chunk";
  index: number;
  id: string;
  name: string;
  args: string;
}

// Events

interface GenericEvent<T extends string, D extends object> {
  type: T;
  data: {
    id: string;
    thread_id: string;
    agent: "coordinator" | "planner" | "researcher" | "coder" | "reporter";
    role: "user" | "assistant" | "tool";
    finish_reason?: "stop" | "tool_calls" | "interrupt";
  } & D;
}

export interface MessageChunkEvent
  extends GenericEvent<
    "message_chunk",
    {
      content?: string;
      reasoning_content?: string;
    }
  > {}

export interface ToolCallsEvent
  extends GenericEvent<
    "tool_calls",
    {
      tool_calls: ToolCall[];
      tool_call_chunks: ToolCallChunk[];
    }
  > {}

export interface ToolCallChunksEvent
  extends GenericEvent<
    "tool_call_chunks",
    {
      tool_call_chunks: ToolCallChunk[];
    }
  > {}

export interface ToolCallResultEvent
  extends GenericEvent<
    "tool_call_result",
    {
      tool_call_id: string;
      content?: string;
    }
  > {}

export interface InterruptEvent
  extends GenericEvent<
    "interrupt",
    {
      options: Option[];
    }
  > {}

export type ChatEvent =
  | MessageChunkEvent
  | ToolCallsEvent
  | ToolCallChunksEvent
  | ToolCallResultEvent
  | InterruptEvent;

```

### core/api/client.ts Content:

```ts
import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

import { useStore } from "~/core/store";

import { resolveServiceURL } from "./resolve-service-url";

/**
 * Global Axios instance configured for the O-Award API.
 * Implements Architecture 5.1.1 (Interceptors for Auth and Error Handling).
 */
const apiClient = axios.create({
  baseURL: resolveServiceURL(""),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// --- Request Interceptor: Inject Authorization Token ---
apiClient.interceptors.request.use(
  (config) => {
    // Skip token injection for auth endpoints (login, register, etc.)
    if (config.url?.startsWith("/auth/")) {
      return config;
    }

    // Access the token directly from the Zustand store state.
    const token = useStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    const rejection = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(rejection);
  },
);

// --- Response Interceptor: Global Error Handling ---
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response, config } = error;

    // 1. Handle 401 Unauthorized (Authentication Failure)
    if (response?.status === 401) {
      // Avoid triggering global logout if the failed request was the login attempt itself or email verification.
      if (!config?.url?.includes("/auth/login") && !config?.url?.includes("/auth/verify-email")) {
        // Only trigger logout if the store actually thinks we are authenticated
        if (useStore.getState().isAuthenticated) {
          console.warn("401 Unauthorized detected. Logging out.");
          // Trigger global logout action.
          useStore.getState().logout(true, "Session expired. Please log in again.");
        }
      }
      // Specific 401 failures are handled locally in services/components.
    }

    // 2. Handle 403 Forbidden
    else if (response?.status === 403) {
      // Specific 403 errors (like unverified account during login) are handled locally in AuthService.
      // This is a catch-all for other forbidden actions within the app.
      if (!config?.url?.includes("/auth/login")) {
        toast.error("Access Denied", {
          description: "You do not have permission to perform this action.",
        });
      }
    }

    // 3. Handle Server Errors (5xx)
    else if (response?.status && response.status >= 500) {
      toast.error("Server Error", {
        description: "An unexpected error occurred on the server. Please try again later.",
      });
    }

    // 4. Handle Network Errors
    else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      toast.error("Network Error", {
        description: "Could not connect to the server. Please check your internet connection and API configuration.",
      });
    }

    // Pass the error along for local handling (e.g., in service catch blocks)
    const rejection = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(rejection);
  },
);

export default apiClient;

```

### core/api/index.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export * from "./auth.service";
export { default as apiClient } from "./client";
export * from "./resolve-service-url";
export * from "./types";
export * from "./user.service";

```


--- (1194-1410 lines) ---
        ## store
         - index.ts

### core/store/index.ts Content:

```ts
import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

import { createAuthSlice, type AuthSlice } from "./slices/auth.slice";
import { createSettingsSlice, type SettingsSlice } from "./slices/settings.slice";

// Define the combined state interface
export type GlobalState = AuthSlice & SettingsSlice;

// Define the type for the slice creator function, ensuring compatibility with devtools
// and allowing slices to access the full global state. (Architecture 4.2)
export type SliceCreator<T> = StateCreator<
  GlobalState,
  [["zustand/devtools", never]], // Middleware type
  [],
  T
>;

// Create the combined store using devtools middleware
export const useStore = create<GlobalState>()(
  devtools(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
      ...createSettingsSlice(set, get, api),
    }),
    { name: "O-Award-Store" }, // Name for Redux DevTools
  ),
);

```

            ## slices
             - settings.slice.ts
             - auth.slice.ts

### core/store/slices/settings.slice.ts Content:

```ts
import { toast } from "sonner";

import { UserService } from "~/core/api/user.service";
import type {
  UserSettingsRead,
  UserSettingsUpdate,
} from "~/core/models/settings.model";
import { type SliceCreator } from "~/core/store";

export interface SettingsSlice {
  // State
  settings: UserSettingsRead | null;
  isLoadingSettings: boolean;
  isUpdatingSettings: boolean;

  // Actions
  fetchSettings: () => Promise<UserSettingsRead | null>;
  updateSettings: (data: UserSettingsUpdate) => Promise<boolean>;
}

// The SettingsSlice relies on the AuthSlice being initialized and authenticated.
export const createSettingsSlice: SliceCreator<SettingsSlice> = (set, get) => ({
  settings: null,
  isLoadingSettings: false,
  isUpdatingSettings: false,

  fetchSettings: async () => {
    // Ensure user is authenticated before fetching
    if (!get().isAuthenticated) {
      return null;
    }

    // Avoid re-fetching if already loading or loaded
    if (get().isLoadingSettings || get().settings) return get().settings;

    set({ isLoadingSettings: true });
    try {
      const settings = await UserService.getCurrentUserSettings();
      set({ settings });
      return settings;
    } catch (error) {
      console.error("Failed to fetch user settings:", error);
      toast.error("Failed to load settings. Please try refreshing the page.");
      return null;
    } finally {
      set({ isLoadingSettings: false });
    }
  },

  updateSettings: async (data) => {
    if (!get().isAuthenticated) {
      return false;
    }

    // Optimization: Don't send empty updates
    if (Object.keys(data).length === 0) {
      return true;
    }

    set({ isUpdatingSettings: true });
    try {
      // The API returns the full updated settings object (API 2.2.2)
      const updatedSettings = await UserService.updateCurrentUserSettings(data);
      set({ settings: updatedSettings });
      toast.success("Settings updated successfully.");
      return true;
    } catch (error) {
      console.error("Failed to update user settings:", error);
      // Specific error handling based on API response might be added here.
      toast.error("Failed to update settings. Please check the values and try again.");
      return false;
    } finally {
      set({ isUpdatingSettings: false });
    }
  },
});

```

### core/store/slices/auth.slice.ts Content:

```ts
import { toast } from "sonner";

import { UserService } from "~/core/api/user.service";
import type { UserRead } from "~/core/models/user.model";
import { type SliceCreator } from "~/core/store";

// Using localStorage as a common fallback if HttpOnly cookies are not used (API 1. Core Mechanism).
const TOKEN_STORAGE_KEY = "o-award-auth-token";

export interface AuthSlice {
  // State
  token: string | null;
  user: UserRead | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // True after the initial auth check is complete

  // Actions
  initializeAuth: () => Promise<void>;
  // Used by components after successful login/verification
  handleAuthenticationSuccess: (token: string, user: UserRead) => void;
  logout: (redirectToLogin?: boolean, message?: string) => void;
  updateUserProfile: (user: UserRead) => void;
}

export const createAuthSlice: SliceCreator<AuthSlice> = (set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  initializeAuth: async () => {
    // 1. Check for token in storage
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      set({ isInitialized: true, isAuthenticated: false, user: null });
      return;
    }

    // 2. Set the token tentatively so the API client interceptor can use it
    set({ token: storedToken });

    // 3. Validate the token by fetching the user profile
    try {
      const user = await UserService.getCurrentUser();
      set({ isAuthenticated: true, user, isInitialized: true });
    } catch (error) {
      console.error("Error during auth initialization (token validation failed):", error);
      // If validation fails (e.g., 401), the API interceptor might trigger logout.
      // We ensure the initialized flag is set regardless.
      // If the interceptor didn't clear the state, we do it here as a fallback.
      if (get().token === storedToken) {
        get().logout(false, "Session validation failed.");
      }
      set({ isInitialized: true });
    }
  },

  handleAuthenticationSuccess: (token, user) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    set({ token, user, isAuthenticated: true, isInitialized: true });
  },

  logout: (redirectToLogin = true, message) => {
    // Clear token and user state
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
    // Also clear settings state when logging out (as settings depend on auth)
    set({ settings: null });

    if (message) {
      toast.info(message);
    }

    // Redirect using window.location if needed, as router might not be accessible here (e.g., called from API interceptor)
    if (redirectToLogin && typeof window !== "undefined") {
      // Check if we are already on an auth page to avoid unnecessary redirects
      // We use startsWith('/auth') based on the routing structure.
      if (!window.location.pathname.startsWith("/auth")) {
        // Use window.location.href for a clean navigation upon logout
        window.location.href = "/auth/login";
      }
    }
  },

  updateUserProfile: (user) => {
    set({ user });
  },
});

```

</deer_flow_frontend_code>

<architecture>
--- (20-23 lines) ---
1.  **集中式状态管理**: 使用 Zustand 作为全局状态管理的单一事实来源 (SSOT)。
2.  **明确的数据同步范式**: 严格遵守 API 6.1 原则——**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新**。在连接恢复和关键事件后执行全量同步。
3.  **关注点分离**: 采用分层架构（UI 层、状态管理层、API 服务层），实现业务逻辑与 UI 的解耦。
4.  **性能优先**: 采用代码分割、Memoization、虚拟化（必要时）和高效的状态更新策略。


--- (31-33 lines) ---
### 2.1 核心框架与语言

  * **TypeScript**: 主要开发语言，强制类型安全。


--- (61-67 lines) ---
### 2.6 通信与工具链

  * **Axios**: HTTP 客户端，用于 REST API 通信，提供拦截器和错误处理能力。
  * **WebSocket API (或 socket.io-client)**: 用于实时通信。
  * **Zod**: 数据结构定义和校验。
  * **React Hook Form**: 表单管理。



--- (70-87 lines) ---
## 3\. 项目结构与模块划分 (Project Structure and Modularity)

采用模块化、职责分离的目录结构。

### 3.1 顶层目录结构 (Top-Level Structure)

```
/src
├── /app/               # Next.js App Router (页面、布局)
├── /components/        # 可复用 UI 组件
├── /constants/         # 全局常量 (Design Tokens, Motion Params, Enums)
├── /core/              # 核心业务逻辑与基础设施 (非 UI)
├── /hooks/             # 通用自定义 Hooks
├── /lib/               # 库集成与工具函数 (e.g., utils.ts, fonts.ts)
├── /styles/            # 全局样式与 CSS 变量
├── /types/             # 全局类型定义
└── env.js              # 环境变量配置 (@t3-oss/env-nextjs)
```


--- (167-181 lines) ---
### 3.4 `src/core` 结构 (Core Logic)

```
/src/core
├── /api/               # API 服务层
│   ├── client.ts       # Axios 实例配置 (拦截器)
│   ├── auth.service.ts
│   ├── project.service.ts
│   └── workflow.service.ts
├── /websocket/         # WebSocket 管理
│   ├── manager.ts      # 连接管理 (重连、认证)
│   └── dispatcher.ts   # 事件分发到 Zustand
├── /store/             # Zustand 状态管理 (详见第 4 节)
└── /models/            # 数据模型 (TS Interfaces, Zod Schemas)
```


--- (214-219 lines) ---
#### 4.3.1 AuthSlice (`authSlice.ts`)

  * **State**: `token`, `userProfile`, `isAuthenticated`, `isInitialized`.
  * **Actions**: `login`, `logout`, `initialize` (从存储加载 Token 并验证)。
  * **Persistence**: Token 存储管理。



--- (220-225 lines) ---
#### 4.3.2 SettingsSlice (`settingsSlice.ts`)

  * **State**: `settings: UserSettingsRead`, `isLoading`.
  * **Actions**: `fetchSettings` (GET /users/me/settings), `updateSettings` (PATCH /users/me/settings)。
  * **BYOK Handling**: 负责处理 API Key 的提交（遵循“写后即忘”模型）。



--- (226-230 lines) ---
#### 4.3.3 ProjectSlice (`projectSlice.ts`)

  * **State**: `projects: ProjectSummaryRead[]`, `currentProject: ProjectDetailRead | null`, `isLoading`.
  * **Actions**: `fetchProjects`, `loadProjectDetail`, `createProject`, `updateProject`, `deleteProject`, `uploadFile`, `startWorkflow`.



--- (231-284 lines) ---
#### 4.3.4 WorkflowSlice (`workflowSlice.ts`) - 核心复杂性

管理当前活动工作流的完整状态。

```typescript
// src/core/store/slices/workflowSlice.ts
interface WorkflowSlice {
  // --- 1. 工作流数据 (Server State Cache) ---
  workflowInstance: WorkflowInstanceRead | null; // 包含完整的 phases 树

  // 扁平化索引 (Normalized Index) - 关键优化
  nodesById: Map<number, NodeInstanceRead>;

  // 节点详情缓存
  nodeDetailsCache: Map<number, NodeDetailView>;

  isLoading: boolean;
  isSyncing: boolean; // 正在进行全量同步

  // --- Actions ---
  actions: {
    // A. 同步与初始化
    loadWorkflow: (workflowId: number) => Promise<void>; // 全量加载/同步
    _normalizeData: (workflow: WorkflowInstanceRead) => void; // 更新 nodesById

    // B. WebSocket 事件处理
    handleNodeStatusUpdated: (node: NodeInstanceRead) => void;
    handleNodeActiveVersionChanged: (node: NodeInstanceRead) => void;
    handleWorkflowStructureUpdated: (workflow: WorkflowInstanceRead) => void;

    // C. 节点详情管理
    fetchNodeDetails: (nodeId: number) => Promise<NodeDetailView>;

    // D. 执行控制与 HITL (调用 API Service)
    reExecuteNode: (/*...*/) => Promise<void>;
    submitHITL: (/*...*/) => Promise<HITLResponse>;
    activateVersion: (/*...*/) => Promise<void>;
    manualEdit: (/*...*/) => Promise<void>;
  }
}
```

**WorkflowSlice 关键实现策略:**

1.  **扁平化索引 (`nodesById`)**: 为了高效处理 WebSocket 的增量更新（如 `NODE_STATUS_UPDATED`），必须维护一个扁平化的节点 Map。`_normalizeData` 负责在每次全量加载后重建此索引。
2.  **增量更新 (`handleNodeStatusUpdated`)**:
      * 更新 `nodesById` 中的对应节点。
      * 必须以不可变的方式更新 `workflowInstance.phases` 树中对应的节点，以触发 UI 更新。
3.  **结构性更新 (`handleWorkflowStructureUpdated`)**:
      * **全量替换**: 使用事件负载完全替换 `workflowInstance`。
      * 调用 `_normalizeData` 重建索引。
4.  **Staleness 同步 (`handleNodeActiveVersionChanged`)**:
      * **[关键]** 此 Action 必须触发 `loadWorkflow()`，重新获取全量数据以更新所有节点的 `is_stale` 标志（遵循 API 6.5.2）。



--- (313-332 lines) ---
## 5\. 通信层与同步策略 (Communication Layer and Synchronization Strategy)

实现健壮的 REST API 调用和 WebSocket 实时同步。

### 5.1 REST API 客户端 (REST API Client)

#### 5.1.1 Axios 实例配置 (`src/core/api/client.ts`)

配置 Axios 实例，实现全局的认证和错误处理。

1.  **Base URL**: 从环境变量配置。
2.  **请求拦截器**: 自动注入 `Authorization: Bearer <token>`（从 `AuthStore` 获取）。
3.  **响应拦截器**:
      * 全局处理 `401 Unauthorized`（触发登出和重定向）。
      * 处理通用错误码（`403`, `500`），显示全局 Toast。

#### 5.1.2 服务层抽象 (Service Layer)

将 API 调用封装在类型安全的服务中（`src/core/api/*.service.ts`），供 Zustand Store 调用。



--- (333-347 lines) ---
### 5.2 WebSocket 实时通信 (WebSocket Service)

实现 `src/core/websocket/manager.ts`，负责连接生命周期管理。

#### 5.2.1 连接管理

1.  **连接时机**: 当用户进入工作流页面时建立连接。
2.  **认证**: 通过 URL 参数传递 Token (`ws://.../ws/{workflow_id}?token=...`)（API 6.2.1）。
3.  **健壮性**: 实现心跳检测和指数退避的自动重连机制。
4.  **Token 刷新**: 监听 `AuthStore` 的 Token 变化，如果 Token 更新，主动断开并使用新 Token 重连（API 6.3.1）。

#### 5.2.2 事件分发

`WebSocketManager` 监听 `onmessage` 事件，解析 `EventPayload`，并调用 `WorkflowSlice` 中对应的事件处理器 Action。



--- (348-370 lines) ---
### 5.3 核心同步范式 (Core Synchronization Paradigm)

严格执行 API 6.1 定义的范式：**REST 为主，WS 为辅**。

#### 5.3.1 初始化流程 (Initialization)

1.  UI 加载。
2.  **Fetch Snapshot (REST)**: `GET /workflows/{id}`。
3.  **Hydrate Store**: 使用快照初始化 Zustand。
4.  **Connect (WS)**: 建立 WebSocket 连接。

#### 5.3.2 重连后同步 (Reconnection Synchronization) - 关键

1.  WebSocket 重连成功 (`onOpen`)。
2.  **立即触发全量同步**: 调用 `WorkflowSlice.loadWorkflow()` (REST)。
3.  **状态覆盖**: 使用新的快照覆盖 Store 状态，确保一致性。

#### 5.3.3 处理复杂事件 (Handling Complex Events)

1.  **`NODE_STATUS_UPDATED` (增量更新)**: 直接更新 `WorkflowSlice.nodesById`。
2.  **`NODE_ACTIVE_VERSION_CHANGED` (Staleness 更新)**: 必须触发全量同步 (`loadWorkflow`) 以刷新全局 `is_stale` 标志。
3.  **`WORKFLOW_STRUCTURE_UPDATED` (结构更新)**: 必须使用事件负载进行全量替换 `WorkflowSlice.workflowInstance`。



--- (475-478 lines) ---
#### 7.3.1 数据获取

  * 通过 `GET /nodes/{node_id}/versions` 获取版本列表。建议使用 React Query 进行缓存管理。



--- (501-504 lines) ---
  * 在 `styles/globals.css` 中实现设计文档 4.1.1.B 的 CSS 变量定义（HSL 格式）。
  * 在 `tailwind.config.ts` 中配置 Tailwind 使用这些变量。
  * 扩展 Tailwind 配置，实现语义化状态色彩（`status-completed`, `status-executing` 等）（设计文档 4.1.1.D）。



--- (538-543 lines) ---
### 9.1 认证与授权 (Authentication and Authorization)

  * **流程**: 实现基于 JWT 的登录、注册、验证流程（API 1）。
  * **Token 管理**: 安全存储 Token（优先 `HttpOnly` Cookie，其次 `localStorage`）。
  * **注入**: API Client 拦截器自动注入 Token。WebSocket 连接时传递 Token。
  * **路由守卫**: 使用 Next.js Middleware 保护主应用路由。


--- (545-551 lines) ---
### 9.2 错误处理与反馈 (Error Handling and Feedback)

  * **反馈机制**: 统一使用 Toast (Sonner), Banner (Alert), AlertDialog 进行反馈（设计文档 3.1.2）。
  * **API 错误**: 在 API Client 拦截器中全局处理通用错误（401, 403, 5xx）。在业务逻辑中处理特定错误（409, 422）。
  * **WebSocket 错误**: 实现连接状态反馈（横幅）和重连逻辑。
  * **Error Boundaries**: 使用 React Error Boundaries 包裹关键组件，防止局部崩溃。


</architecture>



---

<task>


### 任务 3：核心数据模型定义与 API 服务层实现

**目标：** 根据 API 文档定义平台的核心数据模型（TypeScript Interfaces），并实现所有模块的 API 服务层封装，为后续的状态管理和 UI 开发提供类型安全的数据基础。

**核心关注点：** 类型安全、API 封装完整性、Axios 客户端利用（认证与错误处理）。

**实现策略：**

1.  **数据模型定义（`src/core/models/` 新建）：**
    *   参考 `<api> 1.4, 2.3, 3.5, 4.4, 5.5` 和 `<design_doc> 2.1.1`，为所有核心实体定义 TypeScript Interfaces。
    *   **关键模型：** `UserRead`, `UserSettingsRead`, `ProjectSummaryRead`, `ProjectDetailRead`, `ProjectFileRead`, `WorkflowInstanceRead`, `PhaseRead`, `StageRead`, `NodeInstanceRead`, `NodeDetailView`, `NodeVersionRead`, `TemporaryExecutionRead`, `StalenessInfo`, `HITLSubmission`。
    *   在 `src/constants/enums.ts`（新建）定义关键枚举类型：`NodeStatus`, `ExecutionStage`, `HITLMode`, `NodeType`, `ProjectStatus`, `FileRole`等。
2.  **API 服务层实现（`src/core/api/`）：**
    *   利用任务 2 配置好的 Axios 客户端（`client.ts`），确保所有请求都自动包含认证 Token 并经过全局错误处理。
    *   实现 `auth.service.ts`（完善任务 2）：封装所有认证 API（`<api> 1`）。
    *   实现 `user.service.ts`（完善任务 2）：封装用户管理和设置 API（`<api> 2`）。
    *   实现 `project.service.ts`（新建）：封装所有项目管理 API（`<api> 3`）。**关键实现：** `uploadFile` 函数需正确处理 `multipart/form-data`。
    *   实现 `workflow.service.ts`（新建）：封装工作流管理 API（`<api> 4`）。
    *   实现 `node.service.ts`（新建）：封装节点控制和执行 API（`<api> 5`）。
    *   实现 `system.service.ts`（新建）：封装系统基础设施 API（`<api> 7`）。

**输入：** 任务 2 的输出（API 客户端）, `<api> (All)`, `<design_doc> 2.1`。
**输出：** 完整定义的核心数据模型和功能完整的 API 服务层。


</task>


---

你的任务是完成 <task> 中的开发任务，要求：

1. 在开发前务必深入理解 需求背景和项目代码，确保全面把握任务目标与上下文；
2. 尽可能复用及参考现有的组件、框架、库（UI样式、动画等），以提高开发效率和降低出错的概率，这是最重要的原则；
3. 如果现有的技术栈不满足需求，引入其他合适的组件、框架、库，进一步提高开发效率和降低出错的概率；
4. 使用成熟的组件、框架、库、UI样式、动画等；
5. 避免过度设计，过度封装，过度抽象，追求实用性和可维护性；
6. 在确保实现成熟可靠的基础上，**进一步提升UI美观性和优化用户交互体验**；
7. 务必先深入思考，反复推敲，反复权衡，反复反思，然后进行架构设计；
8. 架构设计确定后再进行完整的细节代码实现，确保实现代码的完整性和正确性；
9. 保证与其他任务的逻辑连贯、衔接紧密；
10. 必须确保完成该任务范围内的所有功能点，无遗漏，不涉及其他任务；
11. 必须包含对现有代码必要的修改（如果需要）以及完整新增代码的实现，使用英文注释。

**高标准完成本任务，严格对齐要求，不要遗漏任何功能点，代码简洁健壮无误。深入分析项目架构及依赖，预判风险并持续优化，仅在方案完善后开始开发，确保每一行代码皆有充分理解与把控。对实现的代码进行充分的检查、测试、验证，确保没有bug。**
