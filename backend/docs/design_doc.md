### 1.2 功能需求与优先级矩阵 (Functional Requirements and Priority Matrix)

本矩阵基于 FRS、SRS 和 API 文档，梳理了平台所需实现的功能。优先级定义基于平台的核心价值：支持高效、可控、可回溯的专业建模工作流。

**优先级定义:**
*   **P0 (Critical):** 平台核心价值所必需的基础功能，缺失将导致系统不可用或无法完成核心工作流闭环。
*   **P1 (High):** 显著提升用户体验、效率和控制力的关键增强功能，是实现专业级工具的关键特性。
*   **P2 (Medium):** 提供便利性、完善度或支持边缘场景的功能。

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

### 1.3 体验愿景与美学原则 (Experience Vision and Aesthetic Principles)

本节确立 O-Award 建模平台的设计哲学、体验愿景和美学原则，作为衡量所有设计质量的最高标准。

#### 1.3.1 设计哲学：精密赋能 (Empowerment through Precision)

我们的核心哲学是“精密赋能”。我们相信，对于专家用户而言，真正的效率提升并非来自于功能的简化或抽象，而是来自于提供**更精确的控制、更透明的信息和更迅捷的反馈**。平台应作为用户思维的延伸，而非思维的替代。我们致力于将复杂的工作流管理和人机协同过程，转化为一种清晰、可控、且令人信赖的体验。

#### 1.3.2 体验愿景：专家的思维驾驶舱 (The Expert's Cognitive Cockpit)

我们的愿景是打造一个使专家用户能够完全掌控复杂建模工作流的“思维驾驶舱”。它将 AI 的探索能力与人类的战略智慧无缝融合，提供无与伦比的透明度、控制力和迭代效率。用户应感受到自己正在操作一台强大、可靠且高度响应的专业精密仪器。

#### 1.3.3 核心设计原则 (Core Design Principles)

1.  **用户主权与绝对控制 (User Sovereignty and Absolute Control):**
    *   系统是用户的延伸。严格遵守 SRS 1.1，所有关键操作必须由用户显式触发。系统绝不进行任何未经授权的自动化级联操作。
    *   提供最精细的控制粒度（版本切换、人工编辑、执行控制），确保用户始终掌握主导权。

2.  **彻底的透明度与可追溯性 (Radical Transparency and Traceability):**
    *   消除“黑盒”。用户必须能够轻松审查工作流中任意节点的完整上下文——输入依赖、输出结果、执行过程（代码/日志）和 HITL 交互历史（遵循 SRS 3.2）。
    *   系统状态（进度、依赖关系、Staleness）必须时刻清晰可见且准确无误。

3.  **高信息密度下的极致清晰度 (Clarity within High Information Density):**
    *   拥抱复杂性，而非隐藏它。支持高信息密度的界面展示，满足专家用户同时处理大量信息的需求。
    *   通过卓越的信息架构、精密的排版和清晰的视觉层级，在高密度下建立完美的秩序感，降低认知负荷。

4.  **迭代的流动性与专注 (Fluidity in Iteration and Focus):**
    *   支持快速的“假设-验证-调整”循环。版本切换、回溯和重新执行等操作必须如同呼吸般自然流畅。
    *   界面应帮助用户进入并维持心流状态。设计元素应克制、专业，避免干扰。交互响应必须是即时的。

#### 1.3.4 交互哲学 (Interaction Philosophy)

*   **非侵入式引导 (Non-intrusive Guidance):** 采用“静默状态管理”（SRS 1.4）。系统通过非阻塞、非强制的方式提供信息和建议（如 Staleness 提示），绝不打断用户的当前任务流。
*   **直接操作与即时反馈 (Direct Manipulation and Immediate Feedback):** 优先采用直接操作，并对所有操作提供即时、清晰的视觉反馈。
*   **一致性与可预测性 (Consistency and Predictability):** 交互模式和组件行为全局一致，使用户能够形成稳定的心智模型。
*   **为专家优化 (Optimized for Experts):** 优先考虑长期易用性和效率，支持高阶操作和快捷方式。

#### 1.3.5 美学原则与视觉方向 (Aesthetic Principles and Visual Direction)

平台的美学风格定义为：**精密未来主义 (Precision Futurism)**。它融合了专业工具的严谨性与前沿科技的未来感。

**整体调性:** 专业、精密、克制、专注、深邃、前沿。

1.  **精密与秩序 (Precision and Order):**
    *   通过锐利的线条、清晰的对齐、精密的网格系统和完美的排版来实现。界面元素应传达出一种经过精心计算的秩序感。

2.  **克制且功能性的色彩 (Restrained and Functional Color):**
    *   优先采用深色模式 (Dark Mode)，营造沉浸感并减少视觉疲劳。
    *   主色调应是深邃的中性色。色彩运用应克制，主要用于传达语义信息（状态、层级、高亮）。引入具有科技感的强调色用于关键引导。

3.  **数据可视化与清晰度 (Data Visualization and Clarity):**
    *   字体选择必须保证在复杂数据、图表和代码展示中的极致清晰度和易读性。采用现代、简洁的字体（如 Geist 或 Inter）和高质量的等宽字体（如 Geist Mono 或 Fira Code）。
    *   复杂数据和公式 (LaTeX) 的渲染必须清晰、美观。

4.  **质感与深度 (Texture and Depth):**
    *   通过微妙的阴影、材质感（如背景噪点、微光效果）和精细的图标设计，构建界面的空间深度和精密仪器的质感，同时保持界面的轻盈感。

5.  **极致流畅性与动效 (Extreme Fluidity and Motion):**
    *   动效不是装饰，而是传达信息和提升体验的关键工具。动效应是高性能、精确且富有物理感的（利用 Framer Motion）。
    *   动效必须快速、干脆，体现出系统的响应速度和专业品质。用于增强交互的流畅感、传达状态变化，而非装饰。

---

## 阶段 2：信息架构与流程逻辑 (Phase 2: Information Architecture & Flow Logic)

本文档详细定义了 O-Award 建模平台的信息架构、内容模型和核心任务流程。它作为连接用户体验愿景（阶段 1）与具体界面设计（阶段 3）的桥梁，确保系统的结构逻辑清晰、导航高效，并能稳健地支持复杂的工作流管理和人机协同任务。

-----

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

1.  **AI 交互记录 (AI Interaction Logs):**
      * `prompt`: 发送给 LLM 的完整提示内容。
      * `raw_llm_response`: LLM 返回的原始响应文本。
2.  **代码生成与执行 (Code Generation and Execution):**
      * `generated_code.py`: AI 生成的可执行 Python 代码。
      * `execution.log`: 代码执行的标准输出 (stdout) 和标准错误 (stderr) 日志。
3.  **外部工具调用 (External Tool Calls):**
      * `tool_call_log`: 外部工具（如搜索引擎）的调用参数和返回结果记录。

-----

### 2.2 信息架构图（文本描述）(Information Architecture Diagram - Textual Description)

本节描述 O-Award 平台的全局信息架构、核心导航路径以及关键界面的结构逻辑。该架构旨在支持高信息密度下的清晰度和快速上下文切换。

#### 2.2.1 全局应用结构与路由 (Global Application Structure and Routing)

应用采用基于 Next.js App Router 的结构化路由。

  * **[Root Layout]** (全局容器，包含全局页眉和认证检查)
      * **/auth** (认证模块): /login, /register, /verify-email, /reset-password.
      * **/(app)** (主应用模块，需要认证)
          * **/projects** (项目管理，应用主入口/仪表板)
              * / (项目列表仪表板)
              * **/{project\_id}** (项目详情)
                  * /config (配置页面：上传文件、设置类型)
                  * **/workflow** (工作流执行界面 - 核心交互区)
          * **/settings** (用户设置中心): /profile, /preferences, /engine.

#### 2.2.2 全局导航模型 (Global Navigation Model)

全局导航位于应用的**顶部页眉 (Global Header)**，提供对核心模块的快速访问。

  * **Global Header Structure:**
      * [Logo/Home Link]
      * [Main Navigation Links]: (Projects, Settings)
      * 
      * [Global Actions]: (e.g., New Project)
      * [User Menu]: (Avatar, Settings, Logout)

#### 2.2.3 核心界面：工作流执行界面 (Core Interface: Workflow Execution View)

这是平台的核心操作区域，采用**持久化的三栏式布局**，遵循“思维驾驶舱”的设计愿景。

**布局哲学:** 分离关注点——导航 (The Map)、交互 (The Action)、历史 (The Memory)。A 和 C 栏可折叠/展开，并支持用户拖拽调整宽度。

```
[Global Header]
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [A. Workflow Navigator]  |  [B. Node Interaction Workspace]  | [C. Version History] |
|         (Left Sidebar)    |           (Center Panel)          |    (Right Sidebar)   |
|                           |                                   |                      |
+---------------------------------------------------------------------------------+
```

##### A. 左侧栏：工作流导航器 (Workflow Navigator - The Map)

  * **目标:** 提供全局工作流结构概览、实时状态监控和快速导航。
  * **结构:** 采用高密度的**层级树状视图 (Hierarchical Tree View)**，映射 `Phase -> Stage -> Node` 层级。
  * **节点展示关键信息:**
    1.  **Status Icon:** 实时状态图标（✅, ⚙️ (Animated), ⏳, ❌, 🛑, ◯）。
    2.  **Node Identifier and Name.**
    3.  **Staleness Indicator (⚠️):** 如果 `is_stale: true`，则显示清晰的警告图标。
  * **交互逻辑:**
      * 点击可访问节点加载到 Workspace (B)。
      * **Execution Frontier:** 尚未执行的未来节点视觉上禁用且不可点击 (SRS 5.2)。
      * **Dynamic Updates:** 当收到 `WORKFLOW_STRUCTURE_UPDATED` 事件时，此树结构会动态刷新。

##### B. 中心面板：节点交互工作区 (Node Interaction Workspace - The Action)

  * **目标:** 提供当前选中节点的专注交互环境。

  * **结构:** 采用“交互记录 (Interaction Transcript)”的视觉隐喻，按时间顺序展示节点的活动记录。

  * **B1. Workspace Header (固定顶部):**

      * [Node Title] 和 [Current Status]。
      * [Contextual Toolbar]: 根据节点状态动态显示操作按钮（Re-execute, Manual Edit, Cancel, Retry）。
      * [Staleness Banner]: 如果 `is_stale: true`，显示醒目的横幅提示。

  * **B2. Interaction Transcript (主内容区，可滚动):**

      * 展示当前查看的版本（`active_version` 或 `pending_result`）的完整上下文。
      * **Block 1: Inputs & Dependencies:** (默认折叠) 显示消费的上游节点版本信息。
      * **Block 2: Execution Artifacts:** 展示 `prompt`, `generated_code.py`, `execution.log`。使用专用的查看器组件。
      * **Block 3: Generated Output:** 核心内容展示区（Markdown, LaTeX, 图表）。
      * **Block 4: HITL Interaction Zone:**
          * `Awaiting HITL Approval` 时: 激活特定的 HITL 界面（SCA/AVL/VARL）。
          * `Completed` 时: 显示该版本的 HITL 历史记录。

  * **B3. Action Footer (固定底部，条件显示):**

      * 仅在 `Awaiting HITL Approval` 状态下显示。
      * 提供主要的 HITL 操作：[Discard Execution], [Reject & Provide Feedback], [Approve & Continue]。

  * **动态行为 (Dynamic Behavior):**

      * `Executing`: B2 突出显示实时日志/进度。B1 显示 [Cancel]。
      * `Manual Editing Mode`: B2.Block 3 切换为编辑器。B3 变为 [Cancel Edit], [Save New Version]。

##### C. 右侧栏：版本历史面板 (Version History Panel - The Memory)

  * **目标:** 管理当前选中节点的历史版本，支持快速审阅、对比和回溯。
  * **可见性规则:** 仅当 Center Workspace 处于 `Completed` (Review Mode) 状态时显示。在 `Executing` 或 `Awaiting HITL Approval` 时自动隐藏。
  * **结构:** 垂直的“版本卡片列表 (Version Card List)”，按时间倒序排列。
  * **卡片信息:** 版本号 (V1, V2...), **[Active Tag]**, 时间戳, 来源图标 (🤖/✏️), 版本摘要。
  * **交互逻辑:**
      * **Review:** 点击卡片在 Center Workspace 加载该版本的详情。
      * **Activate:** 在非激活版本上提供 [Set as Active Version] 按钮。点击后触发全局 Staleness 刷新。

-----

### 2.3 核心任务流程（文本描述）(Core Task Flows - Textual Description)

本节详细描述了平台核心用户任务的操作流程，明确了用户动作序列、系统响应（API 调用、WebSocket 事件、UI 更新）和关键决策点。

#### 2.3.1 任务流 1：HITL 审批与迭代 (Task Flow: HITL Approval and Iteration)

**场景:** 一个节点（Node A）进入 `Awaiting HITL Approval` 状态。以 SCA 模式为例。

**流程:**

1.  **系统状态初始化:** Node A `status` = `Awaiting HITL Approval`。Center Workspace (B) 加载 `pending_result`。Left Navigator (A) 显示 ⏳。Right Sidebar (C) 隐藏。
2.  **UI 渲染 HITL 界面:**
      * `HITL Interaction Zone` (B2.4) 渲染 SCA 界面（候选方案列表和比较分析）。
      * `Action Footer` (B3) 出现。
3.  **用户审阅与决策:** 用户阅读分析。
      * **分支路径 A：批准 (Approve):**
        1.  用户选择满意的方案（Option X）。
        2.  用户点击 [Approve & Continue] (B3)。
        3.  **系统响应 (API):** `POST /nodes/{id}/hitl` (action: Continue, data: Option X)。
        4.  **系统处理 (后端):** 固化新版本 V1，设为 `active_version`。Node A 状态更新为 `Completed`。判断并启动下一个节点 (Node B)。
        5.  **系统响应 (API/WebSocket):** API 返回 `action: ExecuteNext`。WebSocket 推送 `NODE_STATUS_UPDATED` (A-\>Completed, B-\>Executing) 和 `NODE_ACTIVE_VERSION_CHANGED` (A)。
        6.  **UI 更新与导航:** UI 自动导航到 Node B。Left Navigator 更新状态图标。
      * **分支路径 B：拒绝并迭代 (Reject and Provide Feedback):**
        1.  用户点击 [Reject & Provide Feedback] (B3)。
        2.  UI 弹出模态框，用户输入修改意见。
        3.  用户提交反馈。
        4.  **系统响应 (API):** `POST /nodes/{id}/hitl` (action: RejectAndProvideModificationComments)。
        5.  **系统处理 (后端):** 记录反馈，触发 Node A 重新执行。Node A 状态更新为 `Executing`。
        6.  **系统响应 (WebSocket):** WebSocket 推送 `NODE_STATUS_UPDATED` (A-\>Executing)。
        7.  **UI 更新:** Center Workspace 切换到 `Executing` 视图。Action Footer (B3) 隐藏。流程返回等待状态。

#### 2.3.2 任务流 2：版本回溯、切换与下游重执行 (Task Flow: Version Switching and Downstream Re-execution)

**场景:** 用户回退到上游 Node A 的历史版本 V1（当前 V2 激活），并希望更新下游 Node B。

**流程:**

1.  **用户导航与审阅:**
      * 用户在 Left Navigator (A) 点击 Node A。
      * Center Workspace (B) 加载 V2（Review Mode）。Right Sidebar (C) 显示。
2.  **用户审查历史版本:**
      * 用户在 Right Sidebar (C) 点击 V1 卡片。Center Workspace (B) 加载 V1 详情。
3.  **用户执行版本切换:**
      * 用户在 V1 卡片上点击 [Set as Active Version]。
      * **系统响应 (API):** `POST /nodes/A/versions/V1/activate`。
      * **系统处理 (后端):** 更新 Node A 的 `active_version_id` 为 V1。
4.  **系统状态传播 (关键步骤 - Staleness Update):**
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node A)。
      * **前端响应 (关键):** 前端监听到此事件，立即调用 `GET /workflows/{id}` 重新获取全量工作流状态。
      * 新的状态中，Node B 的 `is_stale` 标志为 `true`。
5.  **UI 更新与过时感知:**
      * Right Sidebar (C): V1 标记为 Active。
      * Left Navigator (A) 刷新：Node B 旁边出现 ⚠️ Staleness Indicator。
      * *(遵循 SRS 1.4 静默状态管理，系统不自动执行)*。
6.  **用户处理下游依赖:**
      * 用户点击 Node B。
      * Center Workspace (B) 加载 Node B。Workspace Header (B1) 显示醒目的 `Staleness Banner`：“⚠️ Inputs have changed. Node A has a new active version (V1).”
7.  **用户触发下游重执行:**
      * 用户点击 Contextual Toolbar (B1) 的 [Re-execute]。
      * **系统响应 (API):** `POST /nodes/B/re-execute`。
      * **系统处理 (后端):** 后端拉取 Node A 的当前激活版本 (V1) 作为输入（SRS 3.4），启动 Node B 执行。
      * **系统响应 (WebSocket):** WebSocket 推送 `NODE_STATUS_UPDATED` (B-\>Executing)。
8.  **UI 更新:** Node B 进入执行状态，⚠️ 图标消失。

#### 2.3.3 任务流 3：中间结果的人工编辑 (Task Flow: Manual Editing of Intermediate Results)

**场景:** 用户决定直接修改 Node C 的输出，而不通过 AI 重新生成。

**流程:**

1.  **用户启动编辑模式:**
      * 用户查看 Node C（`Completed` 状态）。
      * 用户点击 Contextual Toolbar (B1) 的 [Manual Edit]。*(校验：Generator Node 禁用此操作)*。
2.  **UI 切换到编辑器:**
      * Center Workspace (B) 的 `Generated Output` 区块切换为编辑器（e.g., Novel/Tiptap 或 Code Editor），加载当前版本内容。
      * Toolbar 按钮更换为 [Cancel Edit] 和 [Save New Version]。
3.  **用户编辑与保存:**
      * 用户修改内容。
      * 用户点击 [Save New Version]，输入版本摘要并确认。
      * **系统响应 (API):** `POST /nodes/C/manual-edit`。
      * **系统处理 (后端):** 创建新的 `NodeVersion` (V2)，`source="MANUALLY_EDITED"`。将 V2 设为 `active_version`。
4.  **状态更新与传播:**
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node C)。
      * **前端响应:** UI 退出编辑模式。Right Sidebar 更新。前端触发工作流全量状态刷新（同 2.3.2 步骤 4），更新下游节点的 `is_stale` 标志。

#### 2.3.4 任务流 4：处理动态工作流结构更新 (Task Flow: Handling Dynamic Structure Updates)

**场景:** 一个 `Generator` 节点（例如 1.1.2）被批准，导致工作流结构动态变化。

**流程:**

1.  **Generator 节点批准:** 用户完成 Generator 节点的 HITL 审批（参见 2.3.1）。
2.  **系统处理结构变更 (后端):**
      * 后端根据 Generator 节点的输出，动态创建新的 NodeInstance 记录，并插入到工作流序列中。
3.  **系统广播结构更新 (WebSocket - 关键):**
      * 后端广播 `WORKFLOW_STRUCTURE_UPDATED` 事件。负载包含**全新且完整**的 `WorkflowInstanceRead` 对象。
4.  **前端响应与状态同步 (关键):**
      * 前端监听到此事件。
      * **全量替换:** 前端（Zustand Workflow Store）必须立即丢弃当前的 `phases` 结构，并用事件负载中的新数据进行**全量替换**。
5.  **UI 更新与重渲染:**
      * Left Navigator (A) 根据新结构完全重渲染，平滑展示新插入的节点。
      * UI 显示短暂通知（Toast: "Workflow structure updated."）。
6.  **导航:** 根据 HITL 审批的返回结果（`action: ExecuteNext`），前端自动导航到新插入序列的第一个节点，该节点通常会自动开始执行。

---

## 阶段 3：交互框架与结构定义 (Phase 3: Interaction Framework & Structural Definition)

本文档详细定义了 O-Award 建模平台的全局交互模式、系统反馈逻辑、布局模板、关键屏幕结构（线框图文本描述）和 UX 文案指南。它旨在为前端实现提供精确、可操作的设计指导，确保平台能够支持专家用户进行高效、精确且可控的复杂工作流操作，实现“思维驾驶舱”的体验愿景。

-----

### 3.1.1 全局交互模式库 (Global Interaction Pattern Library)

本节定义了平台中全局可复用的交互模式，确保操作一致性并满足专家用户对高信息密度和效率的需求。

#### A. 高密度内容展示 (High-Density Content Display)

1.  **专业文档与公式渲染 (Professional Markdown/LaTeX Renderer):**

      * **应用场景：** `Generated Output` 的展示（非编辑状态）。
      * **实现：** 基于 `react-markdown`，集成 `remark-gfm`, `remark-math`, `rehype-katex`。
      * **要求：** 使用 `@tailwindcss/typography` (`prose` class) 进行专业排版，但需定制样式以支持高密度显示（例如，减小行高和边距）。确保 KaTeX 公式渲染清晰、准确。

2.  **代码与结构化数据查看器 (Code and Data Viewer):**

      * **应用场景：** 展示 `Execution Artifacts`（Prompt, generated\_code.py, JSON 数据）。
      * **实现：** 推荐使用 `Monaco Editor` 的只读模式，以提供最佳的性能、语法高亮、代码折叠和搜索功能。备选方案为 `react-syntax-highlighter`。
      * **要求：** 使用高质量等宽字体（如 Geist Mono）。提供“复制到剪贴板”和“下载”快捷操作。

3.  **实时日志查看器 (Live Log Viewer):**

      * **应用场景：** 展示 `execution.log`，特别是在 `Executing` 状态下。
      * **实现：** 基于 Code Viewer 扩展。
      * **要求：**
          * **实时流式传输：** 支持实时追加内容。
          * **自动滚动：** 默认自动滚动到底部（使用 `use-stick-to-bottom` Hook）。用户手动滚动时应暂停自动滚动，并提供“返回底部”按钮。
          * **性能：** 对于超长日志，应采用虚拟滚动（可引入 `tanstack-virtual`）以保证性能。

#### B. 交互记录（Interaction Transcript）

这是“节点交互工作区 (Workspace)”的核心组织模式，用于实现“彻底的透明度与可追溯性”。

  * **结构模型：** 将节点的完整上下文（输入、过程、输出、交互）组织成一个线性的记录流。
  * **区块实现：** 记录流由多个区块组成（Inputs, Artifacts, Output, HITL Zone）。使用 Shadcn/ui `Accordion` 或 `Collapsible` 实现区块的展开/折叠。
  * **默认状态：** 关键区块（Output, HITL Zone）默认展开；辅助信息区块（Inputs, Artifacts）默认折叠。

#### C. 版本控制交互 (Versioning Interactions)

1.  **版本审阅 (Version Review):**

      * **流程：** 用户点击 `Version History Panel` (C) 中的任意版本卡片。
      * **响应：** Center Workspace (B) 立即加载该版本的详细信息（Review Mode）。Workspace 必须清晰标明当前查看的是否为活动版本（例如，显示“Historical Version V1”标签）。

2.  **版本切换 (Version Switching):**

      * **流程：** 用户点击非活动版本上的 [Set as Active Version] 按钮。
      * **确认对话框（关键）：** 弹出确认模态框（Shadcn `AlertDialog`），明确告知用户后果：“Activating this version will change the node's output. Downstream nodes will NOT be automatically updated; they will be marked as 'Stale'. Proceed?”（遵循 SRS 1.4, 3.3）。
      * **响应：** 用户确认后执行 API 调用。UI 更新 `Active` 标签，并等待 WebSocket 事件触发全局 Staleness 更新。
      * **限制：** `Generator` 节点的版本切换按钮必须禁用（遵循 SRS 2.3）。

#### D. 人工编辑与模式切换 (Manual Editing and Mode Switching)

支持用户直接干预结果（FRS 4）。

  * **模式：View-to-Edit Transition**
      * **触发：** 用户在 `Completed` 节点点击 [Manual Edit]。
      * **切换：** Center Workspace 的 `Generated Output` 区块原位切换为编辑器。根据内容类型选择 `Novel/Tiptap`（富文本/Markdown）或 `Monaco Editor`（代码）。
      * **控制：** Workspace 工具栏按钮变更为 [Cancel Edit] 和 [Save New Version]。
      * **保存：** 点击 [Save New Version] 后，弹出模态框要求输入“版本摘要 (Summary)”。保存成功后，UI 切换回 Review Mode，显示新版本。

#### E. 人机协同 (HITL) 交互框架 (HITL Interaction Framework)

所有 HITL 模式共享统一框架。

  * **布局结构：**
    1.  **HITL Interaction Zone (B2.4):** 内嵌在 Transcript 中，根据 `hitl_mode` 渲染特定界面。
    2.  **Sticky Action Footer (B3):** 停靠在 Workspace 底部，提供全局 HITL 操作：[Discard Execution], [Reject & Provide Feedback], [Approve & Continue]。
  * **SCA (Strategic Choice) 模式：**
      * **Interaction Zone：** 使用标签页 (Tabs) 或卡片列表展示候选方案和比较分析。
      * **交互：** 用户通过 `Radio Group` 或 `Checkbox` 选择方案。[Approve] 按钮在选择后激活。
  * **AVL (Adversarial Validation) 模式：**
      * **Interaction Zone：** 以列表形式展示批判意见。
      * **交互：** 每个批判旁有 [Accept] 和 [Reject] 按钮及评论框。用户需逐项裁决后才能提交。

-----

### 3.1.2 系统反馈与状态管理逻辑 (System Feedback and State Management Logic)

本节定义系统如何向用户传达信息和状态变化。遵循“非侵入式引导”和“即时性”原则。

#### A. 反馈机制分类与组件规范 (Feedback Mechanisms Classification)

| 类型 | 描述与时机 | 组件 (Shadcn/ui Stack) | 侵入性 |
| :--- | :--- | :--- | :--- |
| **Toast (轻提示)** | 非关键操作确认（保存成功、版本激活）。系统事件通知（结构更新）。 | **Sonner** | 低 |
| **Banner (横幅)** | 持久的、重要的上下文相关提示。需要用户关注但无需立即行动。 | **Alert (定制化)** | 中 |
| **Inline Indicator (内联指示器)** | 图标或标签，表示对象状态。实时显示。 | **Badge, Lucide Icons, Tooltip** | 低 |
| **AlertDialog (警示对话框)** | 破坏性或不可逆操作的二次确认。阻塞流程。 | **AlertDialog** | 高 |

#### B. 加载与进度反馈 (Loading and Progress Feedback)

1.  **区域加载 (Regional Loading):** 在加载数据时（如切换节点），使用 `Skeleton` 骨架屏在内容区域占位，减少视觉跳变。
2.  **操作反馈 (Interaction Feedback):** 按钮点击后立即显示加载状态（Spinner）并禁用。
3.  **工作流执行进度 (Workflow Execution Progress):**
      * **Navigator (A):** 使用动画 Spinner 图标 (⚙️)。
      * **Workspace Header (B1):** 显示详细的 `current_stage` 文本（如：“Executing: Processing Data...”）。

#### C. 复杂工作流状态通信逻辑 (Complex Workflow State Communication)

实现依赖于前端状态管理（Zustand）与后端实时通信（WebSocket, REST API）的精确协同。

##### 1\. 状态同步范式 (State Synchronization Paradigm)

  * 严格遵循 API 6.1 原则：**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新。**
  * **关键规则:** WebSocket 断线重连后，必须立即重新调用 REST API 获取全量快照，以保证数据一致性。

##### 2\. 依赖过时状态 (Staleness)

实现“静默状态管理”（SRS 1.4）。

  * **检测与传播逻辑:**
    1.  **触发:** 前端监听到 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。
    2.  **同步:** 前端必须立即调用 `GET /workflows/{id}` 重新获取全量工作流状态，以更新所有节点的 `is_stale` 标志。
  * **视觉传达:**
      * **全局 (Navigator A):** 在 `is_stale: true` 的节点旁显示清晰的 ⚠️ 图标。Hover 显示 Tooltip 解释原因。
      * **局部 (Workspace B1):** 如果当前节点过时，显示醒目的、不可关闭的 `Staleness Banner`。

##### 3\. 工作流结构动态更新 (Dynamic Structure Updates)

处理 `Generator` 节点导致的结构变化。

  * **触发:** 监听到 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件。
  * **处理逻辑 (关键):** 前端状态管理器必须执行**全量替换**操作，使用事件负载数据覆盖本地缓存。
  * **视觉传达:**
      * **通知:** 显示短暂 Toast：“Workflow structure updated.”。
      * **平滑过渡:** Navigator (A) 重新渲染。使用 `Framer Motion` (Layout Animations) 实现新节点的平滑插入动画，帮助用户理解结构变化。

##### 4\. 执行取消 (Execution Cancellation)

处理异步取消过程。

  * **流程:**
    1.  用户点击 [Cancel]。按钮立即变为“Cancelling...”并禁用。
    2.  发送 API 请求 `POST /nodes/{id}/cancel`。
    3.  等待 WebSocket `NODE_STATUS_UPDATED` 事件（`status: Canceled`）。
    4.  收到确认后，UI 更新为最终 `Canceled` 状态，激活 [Retry] 按钮。

-----

### 3.2.1 布局模板与导航模型 (Layout Templates and Navigation Models)

本节定义核心页面布局模板和导航模型，重点支持高信息密度和灵活性。

#### A. 全局导航模型 (Global Navigation Model)

采用位于顶部的\*\*全局页眉 (Global Header)\*\*作为主导航。

  * **结构:** `[Logo/Home] [Breadcrumbs (Contextual)] ... (Spacer) ... [Global Actions] [User Menu]`。
  * **Breadcrumbs:** 提供当前位置的层级路径和快速返回能力。例如：`Projects / 2024 Problem A / Workflow Execution`。

#### B. 布局模板 1：通用仪表板/列表布局 (Template 1: Standard Layout)

  * **应用场景：** 项目列表 (`/projects`)，设置中心 (`/settings`)。
  * **结构：** 标准的侧边栏导航 + 主内容区布局。

#### C. 布局模板 2：三栏式工作流执行布局 (Template 2: The Cockpit Layout)

  * **应用场景：** 工作流执行界面 (`/projects/{id}/workflow`)。

  * **结构：** 高度灵活的三栏式布局。实现需使用 CSS Flexbox/Grid，并集成面板管理功能。

    ```
    [Global Header]
    +---------------------------------------------------------------------------------+
    | [A. Navigator] |<-R->|    [B. Node Interaction Workspace]    |<-R->| [C. History] |
    | (Left Sidebar) |     |           (Center Panel)             |     | (Right Sidebar)|
    +---------------------------------------------------------------------------------+
    (R = Resizable Separator)
    ```

  * **布局行为与规则：**

    1.  **全屏高度利用：** 布局占满 `Global Header` 以下的所有垂直空间。A、B、C 内部独立滚动。
    2.  **面板管理 (Panel Management):**
          * **实现技术:** 使用 `react-resizable-panels` 库。
          * **可调整大小 (Resizable):** 用户可拖拽 R1 和 R2 手柄调整宽度。设置应被记忆（`localStorage`）。
          * **可折叠 (Collapsible):** A 和 C 栏必须提供快速折叠/展开按钮。
    3.  **动态可见性:** C 栏（Version History）仅在 Workspace (B) 处于 `Completed` (Review Mode) 时显示。

-----

### 3.2.2 关键屏幕线框图（文本描述）(Key Screen Wireframes - Textual Description)

本节详细描述工作流执行界面中三个核心面板的线框结构。

#### A. 工作流导航器 (Workflow Navigator - Left Sidebar)

```
[A. Workflow Navigator] (Scrollable, Resizable Panel)
|
+-- [Header]: Workflow Navigator [Collapse Button <<]
|
+-- [Workflow Tree View] (Hierarchical List)
    |
    +-- v Phase 1: Strategic Analysis (Collapsible Group)
        |
        +-- v Stage 1.1: Strategic Definition
            |
            +-- [Node Item 1.1.1]
            |   |-- [✅ Completed] [Name]
            |
            +-- [Node Item 1.1.2] (Selected/Active)
                |-- [⏳ Awaiting HITL] [Name]
    |
    +-- v Phase 2: Cyclic Execution
        |
        +-- [Node Item 2.1.1]
            |-- [⚙️ Executing] [Name] (Animated Spinner)
        +-- [Node Item 2.1.2]
            |-- [✅ Completed] [Name] [⚠️ Stale Indicator]
        +-- [Node Item 2.1.3] (Disabled - Execution Frontier)
            |-- [◯ Not Started] [Name]
```

#### B. 节点交互工作区 (Node Interaction Workspace - Center Panel)

**通用结构:** 分为固定头部 (B1)、可滚动内容区 (B2) 和固定底部 (B3)。

```
[B. Node Interaction Workspace]
|
+-- [B1. Workspace Header] (Fixed Top)
|   |-- [Title]: [ID] | [Name]
|   |-- [Status Badge]: (e.g., Awaiting HITL)
|   |-- [Contextual Toolbar]: (Dynamic Buttons)
|   +-- [Staleness Banner] (Conditional Alert Banner if is_stale=true)
|
+-- [B2. Interaction Transcript] (Scrollable Content)
|   |
|   +-- [Block 1: Inputs & Dependencies] (Collapsible, Default Collapsed)
|   +-- [Block 2: Execution Artifacts] (Collapsible, Default Collapsed)
|   |   |-- [Tabs: Prompt | Code | Logs]
|   |   |-- [Code/Log Viewer]
|   +-- [Block 3: Generated Output] (Main Content, Default Expanded)
|   |   |-- [Markdown/LaTeX Renderer OR Editor]
|   +-- [Block 4: HITL Interaction Zone] (Dynamic Content, Default Expanded)
|
+-- [B3. Action Footer] (Fixed Bottom, Conditional Visibility)
    |-- [Secondary Actions] (e.g., Discard)
    |-- [Primary Actions] (e.g., Reject, Approve)
```

**状态变化详解:**

  * **`Awaiting HITL Approval`:**
      * B1 Toolbar: 隐藏。
      * B2 Block 4: 激活 HITL 交互界面（如 SCA 选择器）。
      * B3 Footer: 显示。
  * **`Completed` (Review Mode):**
      * B1 Toolbar: 显示 [Re-execute], [Manual Edit]。
      * B2 Block 4: 显示只读的 HITL 历史记录。
      * B3 Footer: 隐藏。
      * **Right Sidebar (C): 显示。**
  * **`Executing`:**
      * B1 Toolbar: 显示 [Cancel Execution]。
      * B2 Block 2: 展开并激活实时日志查看器。
      * B2 Block 3 & 4: 加载状态或为空。
      * B3 Footer: 隐藏。

#### C. 版本历史面板 (Version History Panel - Right Sidebar)

**结构:**

```
[C. Version History] (Scrollable, Resizable Panel, Conditional Visibility)
|
+-- [Header]: Version History [Collapse Button >>]
|
+-- [Version Card List] (Reverse Chronological)
    |
    +-- [Version Card V2] (Active State)
    |   |-- [V2] [Timestamp] [Source Icon: 🤖]
    |   |-- **[ACTIVE Tag]** (Prominent visual indicator)
    |   |-- [Summary: "Refined based on feedback..."]
    |
    +-- [Version Card V1] (Inactive State)
        |-- [V1] [Timestamp] [Source Icon: ✏️]
        |-- [Summary: "Manually corrected assumptions."]
        |-- [Button: Set as Active Version] (Requires Confirmation Dialog)
```