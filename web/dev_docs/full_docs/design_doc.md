## 阶段 1：需求解析与体验愿景 (Phase 1: Requirement Analysis & Experience Vision)

### 1.1 核心用户画像定义 (Core User Persona Definition)

本文档基于输入的需求背景文档，构建 O-Award 建模平台的核心用户画像。该画像聚焦于用户在数学建模全生命周期中的行为模式、技术熟练度、应对复杂性的思维习惯以及对系统控制权的具体需求。

#### 1.1.1 核心用户画像：Dr. Evelyn Reed (The Strategic Modeler)

**角色定位:**
Evelyn 是一位资深的应用数学研究者、数据科学家，或是高水平数学建模竞赛（如 MCM/ICM）的资深参与者/指导者。她代表了平台的核心用户：具备深厚理论基础、强大分析能力，并追求在复杂问题求解中实现创新和极致优化的专业人士。

**核心目标与动机:**
*   **追求卓越成果:** 目标是构建具有创新性、鲁棒性且论证严密的模型，以解决复杂、开放性的问题（达到 O-Award 水平）。
*   **效率与深度并重:** 寻求在有限时间内最大化探索解决方案空间的广度和深度。
*   **掌控感与可复现性:** 高度重视工作的可追溯性，渴望在与 AI 协作的过程中保持绝对的主导地位和控制权。

**技术熟练度:**
*   **数学与统计:** 精通高级数学方法（优化理论、仿真模拟、复杂系统动力学）。
*   **编程能力:** 高度熟练使用 Python 及其数据科学生态（Pandas, NumPy, Scikit-learn）。能够阅读、理解并修改 AI 生成的复杂代码。
*   **工具使用:** 熟悉专业级工具（IDEs, Git, LaTeX），对工具的性能、稳定性和灵活性有极高要求。
*   **AI 协作经验:** 了解大语言模型（LLM）的能力边界和局限性，擅长通过精确的迭代反馈来引导 AI 输出高质量结果。

#### 1.1.2 数学建模全生命周期行为模式分析

Evelyn 的行为模式体现了专业建模者在不同阶段的特征：

**阶段一：战略分析与宏观架构 (Phase 1)**
*   **思维模式:** 高度结构化、批判性、发散与收敛交替。
*   **行为特征:** 投入大量时间进行问题解构和假设构建。倾向于在早期探索多种可能的宏观架构（对应 SCA 模式），并对基础假设的论证极为严格，会主动寻找逻辑漏洞（对应 AVL 模式）。
*   **平台诉求:** 需要 AI 快速提供多种分析视角和架构草案，并支持高效的筛选和验证。

**阶段二：循环子问题建模与执行 (Phase 2)**
*   **思维模式:** 迭代式、实验性、注重细节和验证。
*   **行为特征:** 专注于模型设计、数学推导和计算实现。高度关注模型的鲁棒性和灵敏度分析。当发现上游假设有误时，会立即回溯到上游节点进行调整（对应“回溯”功能需求）。
*   **平台诉求:** 清晰的流程视图、精细化的 HITL 干预能力（SCA/AVL），以及无缝编辑 AI 生成工件（公式、代码）的能力（R4）。

**阶段三：全局综合与论文锻造 (Phase 3)**
*   **思维模式:** 整合性、叙事性、注重逻辑连贯性。
*   **行为特征:** 将分散的结果整合成一个有力的核心论点。精心挑选可视化图表，反复打磨论文结构。
*   **平台诉求:** 强大的富文本/LaTeX 编辑器，能够无缝集成中间结果和图表。

#### 1.1.3 复杂性应对与认知负荷管理

Evelyn 面对的是高认知负荷的任务，其思维习惯如下：

*   **结构化分解 (Divide and Conquer):** 倾向于将复杂问题分解为可管理的模块。平台必须清晰地可视化这种分解结构及其依赖关系。
*   **迭代与回溯是常态:** 建模过程是高度非线性的。平台必须通过清晰的可视化工作流和原子化的版本控制，将“流程管理”的认知负荷降至最低。
*   **思维外部化:** 需要将复杂的思维过程（版本历史、依赖关系）“外部化”到平台上进行可视化管理，以释放大脑的工作记忆。
*   **信息密度偏好:** 偏好高信息密度的界面，能够快速浏览和处理大量结构化信息，反感冗余的视觉元素和低效的交互流程。

#### 1.1.4 “用户主权”与控制灵活性需求

Evelyn 对“用户主权 (User Sovereignty)”有着极高的期望，这源于其专业性和对结果负责的态度：

*   **反感自动化干预与“黑盒”:** 强烈抵触系统在未经明确许可的情况下自动执行关键操作（如自动级联更新下游节点）。Evelyn 需要的是一个**可预测、响应指令**的工具。
*   **显式触发原则:** 所有关键操作（重新执行、版本切换）必须由用户显式触发。Evelyn 愿意承担保持工作流一致性的责任，以换取完全的控制权（对应“静默状态管理”原则 SRS 1.4）。
*   **版本控制的精细度与灵活性:** 需要对每一个节点的每一次执行结果进行精确的版本控制。能够自由切换任意节点的激活版本是进行并行探索和回溯实验的基础（SRS 3.3）。
*   **HITL 中的主导权:** 在 HITL 环节，Evelyn 是最终的决策者（SCA）和裁决者（AVL）。她需要界面支持复杂的决策过程，提供足够的信息密度和比较视图。
*   **随时干预与编辑的权力:** 如果 AI 生成的结果不符合预期，Evelyn 需要能够直接上手修改（R4），无论是代码、公式还是文本报告。

---

### 1.2 功能需求与优先级矩阵 (Functional Requirements and Priority Matrix)

本文档解析了输入的需求文档（`<requirements>` 和 `<user_requirements>`），生成结构化的功能需求清单及其优先级矩阵。所有描述严格聚焦于“做什么”(What)，排除实现细节。

#### 1.2.1 优先级定义标准

| 优先级 | 标签 | 描述 |
| :--- | :--- | :--- |
| **P0** | **Critical (MVP)** | **核心闭环与基础架构。** 实现从项目创建到工作流完成的最短路径所必需的功能。系统设计哲学的基石（如原子化版本控制、严格线性执行）。 |
| **P1** | **High Value** | **灵活性与控制力。** 支持用户进行回溯、版本切换、高级 HITL 交互和人工编辑的关键功能。实现“用户主权”的核心机制。 |
| **P2** | **Important** | **完整性与体验增强。** 提升平台完整性和用户体验的关键功能（如动态工作流结构、BYOK 配置、结果导出）。 |
| **P3** | **Nice to have** | **辅助性的增强功能。**（如历年赛题库初始化、高级 HITL Profile 配置）。 |

#### 1.2.2 功能需求与优先级矩阵

##### 模块一：用户认证与账户管理 (UAM)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| UAM-1.1 | 用户注册（邮箱、密码、显示名）。 | P0 | 基础功能。 | R1.1 |
| UAM-1.2 | 安全用户认证（登录/登出，JWT Token 管理）。 | P0 | 所有受保护功能的前置条件。 | R1.2 |
| UAM-1.3 | 访问控制与数据隔离。 | P0 | 安全基石。 | R1.4 |
| UAM-1.4 | 邮箱验证机制（账户激活）。 | P2 | | R1.1 |
| UAM-1.5 | 密码管理（忘记密码重置、登录后修改密码）。 | P2 | | R1.3 |

##### 模块二：项目管理与配置 (PMG)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| PMG-2.1 | 项目创建（名称、描述）。 | P0 | 工作流的容器。 | R2.2 |
| PMG-2.2 | 项目仪表板（列表、元数据显示）。 | P0 | 用户入口。 | R2.3 |
| PMG-2.3 | 项目配置：文件上传与角色定义。 | P0 | 工作流输入的基础。 | R3.2 |
| PMG-2.4 | 项目配置：赛题类型选择 (A-F, -)。 | P0 | | R3.4 |
| PMG-2.5 | 项目状态管理（Configuring, Running, Completed）。 | P0 | 控制项目生命周期。 | R2.1 |
| PMG-2.6 | 项目元数据更新（名称、描述）。 | P1 | | R2.1 |
| PMG-2.7 | 项目删除（级联删除所有数据，需二次确认）。 | P1 | | R2.4 |
| PMG-2.8 | 从历年赛题库初始化项目。 | P3 | 便利性功能。 | R3.3 |

##### 模块三：工作流引擎核心逻辑 (WFE)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| WFE-3.1 | 工作流实例化与启动。 | P0 | 核心操作。依赖 PMG-2.3, PMG-2.4。 | R3.5 |
| WFE-3.2 | 严格线性执行模型与节点粒度定义。 | P0 | 核心设计哲学。 | S2.1, S2.2 |
| WFE-3.3 | 节点生命周期状态机管理（未开始、执行中、等待HITL、已完成、失败）。 | P0 | | S4.1, S4.2 |
| WFE-3.4 | 强制性人机交互 (HITL)。每个节点执行成功后必须进入 HITL。 | P0 | | S2.4 |
| WFE-3.5 | 依赖解析规则。执行时拉取上游“当前激活版本”作为输入。 | P1 | 依赖 VER-4.3。 | S3.4 |
| WFE-3.6 | 配置快照创建。启动工作流时捕获用户设置。 | P1 | 确保可复现性。 | R3.5 |
| WFE-3.7 | 动态工作流结构：生成器节点支持与实例化。 | P2 | 实现阶段二循环。 | S2.2, S2.3 |
| WFE-3.8 | 动态工作流结构：生成器节点执行限制（禁止重跑）。 | P2 | 简化设计决策。 | S2.3 |

##### 模块四：版本控制与状态管理 (VER)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| VER-4.1 | 原子化版本创建。在 HITL 批准时创建不可变快照。 | P0 | 核心设计哲学。 | S1.3, S3.1 |
| VER-4.2 | 版本快照内容定义（输出、输入ID、HITL记录、环境参数）。 | P0 | 确保可追溯性。 | S3.2 |
| VER-4.3 | 版本激活管理（默认激活最新版本，且唯一激活）。 | P0 | | S3.3 |
| VER-4.4 | 历史版本审查（只读模式查看完整快照）。 | P1 | 支持回溯和比较。 | S5.6 |
| VER-4.5 | 版本切换（手动）。用户手动切换激活版本（不级联）。 | P1 | 用户主权体现。 | S3.3, R5.5.2 |
| VER-4.6 | 静默状态管理与“陈旧性”(Staleness)检测与提示。 | P1 | 核心设计哲学。系统提示但不干预。 | S1.4, R5.2 |

##### 模块五：工作流控制与导航 (WFC)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| WFC-5.1 | 工作流可视化（层级流程图，实时状态显示）。 | P1 | 核心 UI。依赖 WFE-3.3。 | R5.1, R5.2 |
| WFC-5.2 | 节点审查模式（只读）。展示节点当前激活版本详情。 | P1 | | S5.2, R5.4 |
| WFC-5.3 | 继续执行 (Proceed to Next)。批准当前节点并导航/执行下一节点。 | P1 | 核心导航逻辑。 | S5.3 |
| WFC-5.4 | 跳转 (Jumping)。用户可以跳转到任意已执行完的节点。 | P1 | 支持线性探索。 | S5.2, R5.3 |
| WFC-5.5 | 重新执行 (Re-execution)。对已完成节点提供新意见，触发全新执行。 | P1 | 支持迭代探索。 | S5.4, R5.5.1 |
| WFC-5.6 | 重试 (Retry)。针对失败节点进行重试。 | P1 | 错误恢复机制。 | S5.5 |
| WFC-5.7 | 实时通信（WebSocket）集成。实时推送状态和结构更新。 | P1 | 支持 WFC-5.1 实时性。 | API Doc 6 |

##### 模块六：人机协同 (HITL) 与人工编辑 (EDT)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| HITL-6.1 | HITL 基础操作：批准 (Continue)。 | P0 | 推进工作流的核心动作。 | S6.1 |
| HITL-6.2 | HITL 基础操作：拒绝并提供修改意见 (Reject)。 | P1 | 支持迭代修正。 | S6.2 |
| HITL-6.3 | HITL 基础操作：丢弃本次执行 (Discard)。 | P1 | 用户反悔机制。 | S6.3 |
| HITL-6.4 | HITL 模式实现：VARL (审查式批准/拒绝)。 | P1 | 基础 HITL 模式。 | HITL_MODES |
| HITL-6.5 | HITL 模式实现：SCA (战略选择架构)。 | P1 | 核心 HITL 模式。 | HITL_MODES |
| HITL-6.6 | HITL 模式实现：AVL (对抗性验证循环)。 | P2 | 高级 HITL 模式。 | HITL_MODES |
| EDT-6.7 | 人工编辑：支持对 AI 生成的文本工件进行编辑。 | P1 | 用户主权体现。 | R4.1 |
| EDT-6.8 | 人工编辑：平台内编辑器（富文本/LaTeX、代码）。 | P1 | | R4.2 |
| EDT-6.9 | 人工编辑：版本控制逻辑。保存编辑必须创建新版本并自动激活。 | P1 | 依赖 VER-4.1。 | R4.3 |

##### 模块七：用户设置与导出 (SET/EXP)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| EXP-7.1 | 一键按需导出项目成果（ZIP包，包含所有激活版本）。 | P2 | 最终交付功能。 | R6 |
| SET-7.2 | 界面设置（语言、主题选择）。 | P2 | 提升用户体验。 | R7.2 |
| SET-7.3 | 工作流引擎配置 (BYOK)（LLM Provider, E2B API Key）。 | P2 | 支持用户自定义引擎。 | R7.3 |
| SET-7.4 | HITL 行为配置（用户等级/Profile）与思考深度配置。 | P3 | 高级配置。 | R7.4, R7.5 |

---

### 1.3 体验愿景与美学原则 (Experience Vision and Aesthetic Principles)

本文档确立了指导 O-Award 建模平台所有设计决策的核心体验愿景、交互哲学和前沿美学原则。

#### 1.3.1 核心体验愿景 (Core Experience Vision)

> **愿景陈述：赋能思想的精确执行 (Empowering Precision Execution of Thought).**

O-Award 建模平台旨在为专家级用户提供一个**沉浸式、零摩擦、具备绝对掌控力**的数字实验室环境。我们致力于将复杂系统的管理可视化、直观化，让用户能够将全部认知资源投入到解决最具挑战性的数学建模问题上。平台是用户思维的延伸，确保每一次战略决策、每一次迭代实验都能被精确执行、完整记录并优雅呈现。

**核心体验支柱：**

1.  **绝对掌控感 (Absolute Mastery):** 体验的核心是“用户主权”。用户始终处于主导地位，系统行为必须高度可预测。用户能够精确控制工作流的每一步执行、每一个版本和每一次干预。
2.  **专业与精确 (Professional Precision):** 平台必须传达出科学研究的严谨性和数学的精确之美。信息展示清晰、准确，交互反馈即时、明确。拒绝任何模糊性。
3.  **沉浸与专注 (Immersive Focus):** 平台提供一个无干扰的环境，旨在支持长时间的深度思考（心流 Flow State）。通过最小化干扰、优化信息密度和提供流畅的交互，支持深度工作。
4.  **复杂性的优雅管理 (Elegant Complexity Management):** 平台必须能够优雅地处理高度复杂的、动态变化的工作流和版本依赖。通过直观的可视化和强大的工具，将复杂性转化为清晰的洞察力。

#### 1.3.2 交互哲学 (Interaction Philosophy)

全局性的交互指导原则，旨在解决复杂工作流控制与高密度信息展示的挑战。

1.  **用户主权与显式意图 (User Sovereignty and Explicit Intent):**
    *   **系统永不自作主张。** 绝不进行自动化的级联更新（遵循“静默状态管理”原则）。所有关键操作必须由用户显式触发。
    *   **可预测性高于便利性。** 系统的响应必须始终符合用户的预期和系统的既定规则。宁可让用户多点击一次，也不要让用户感到意外。

2.  **复杂性可视化与抽象 (Visualize and Abstract Complexity):**
    *   **将抽象概念具象化。** 工作流结构、节点状态、版本历史、依赖关系和“陈旧性”等抽象概念，必须通过清晰、一致的视觉语言进行表达。
    *   **渐进式披露 (Progressive Disclosure)。** 默认展示最关键的信息，将次要信息和高级操作隐藏在合理的层级之下（如侧边栏、详情面板），保持主界面的清晰。

3.  **迭代的流畅性与低成本 (Fluidity and Low Cost of Iteration):**
    *   **回溯是常态，而非例外。** 平台必须使回溯、版本切换和重新执行的操作极致流畅、响应迅速。
    *   **无惧失败的实验环境。** 通过强大的版本控制和“丢弃执行”机制，鼓励用户大胆探索，降低实验失败的成本。

4.  **即时反馈与系统透明度 (Immediate Feedback and System Transparency):**
    *   **操作必须有即时反馈。** 用户的每一个操作都应立即得到视觉上的确认。
    *   **透明化后台进程。** 对于长时间运行的任务，必须提供清晰的进度指示和实时的状态更新（利用 WebSocket），让用户始终了解系统状态。

#### 1.3.3 前沿美学基调 (Aesthetic Principles)

平台的美学风格定义为 **“精密未来主义 (Precision Futurism)”**。它融合了数学的精确逻辑、AI 的尖端科技感和专业工具的实用主义。

1.  **数学的精确之美 (Mathematical Precision):**
    *   **秩序与网格。** 布局基于严谨的网格系统，强调对齐、平衡和秩序感。线条清晰锐利，拒绝冗余装饰。
    *   **清晰的层级。** 通过字体排版（Typography）、对比度和空间关系建立清晰的信息层级。

2.  **未来感与科技感 (Futuristic and Technological):**
    *   **深色优先 (Dark Mode First)。** 默认采用深色主题（利用 `next-themes`），营造沉浸、专注的实验室氛围，同时减少视觉疲劳。色彩方案应体现科技感（如深空灰、科技蓝）。
    *   **微妙的光影与质感。** 运用微妙的阴影、渐变和动态光效（参考 `Magic UI` 组件，如 `BorderBeam`, `ShineBorder`）来构建空间感和未来感，但必须保持克制，服务于功能。

3.  **高密度与可读性 (High Density and Readability):**
    *   **字体选择至关重要。** 选择在屏幕上显示清晰的现代无衬线字体（如 `Geist`）。
    *   **语义化色彩。** 色彩的使用应高度克制且富有目的性。主色用于强调关键操作，语义色彩用于传达状态。

#### 1.3.4 动态视觉语言定位 (Motion Design Strategy)

动效（Motion）在平台中扮演战略性角色，它不仅仅是美学上的修饰，更是传达信息、提升理解力和增强体验的关键工具（主要基于 `Framer Motion` 实现）。

**动效的核心目标：功能性、流畅性、空间感。**

1.  **可视化复杂流程与状态变迁 (Visualize Complex Processes):**
    *   动效应被用于清晰地可视化工作流的执行过程。例如，节点状态的转换应通过流畅的动画来表示，使用户能够直观感知流程的动态。
    *   当工作流结构动态更新时（Generator 节点完成），使用布局动画来平滑地呈现新节点的出现和重新排列，减少突兀感。

2.  **引导注意力与增强空间感 (Guide Attention and Spatial Orientation):**
    *   使用动效来引导用户的视觉焦点到关键事件上（例如，一个节点等待 HITL 批准时）。
    *   通过转场动画来建立不同视图之间的空间关系（例如，从工作流画布“深入”到节点详情视图），帮助用户构建清晰的空间心智模型。

3.  **提供即时反馈与提升响应感 (Provide Immediate Feedback and Enhance Responsiveness):**
    *   微交互（Micro-interactions）应为用户的操作提供即时、细腻的反馈，使界面感觉更加灵敏和生动。

**动效原则:**
*   **功能性优先:** 动效必须服务于明确的功能目标。
*   **快速且精确:** 动效应迅速、干脆，符合平台高效、专业的调性。持续时间应尽可能短，但保证流畅性。
*   **性能与可访问性:** 动效必须高性能，并尊重用户的系统设置（如 `prefers-reduced-motion`）。

---

## 阶段 2：信息架构与流程逻辑 (Phase 2: Information Architecture & Flow Logic)

### 2.1 内容模型与分类法 (Content Model and Taxonomy)

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

#### 2.1.2 实体关系映射 (Entity Relationship Map)

```mermaid
graph TD
    subgraph 用户层 (User Layer)
        U(User)
        US(UserSettings)
    end

    subgraph 项目层 (Project Layer)
        P(Project)
        PF(ProjectFile)
    end

    subgraph 工作流层 (Workflow Layer)
        WF(WorkflowInstance)
        NI(NodeInstance)
    end

    subgraph 版本层 (Version Layer)
        NV(NodeVersion)
    end

    %% 关系定义
    U -- "1:1 (Has)" --> US
    U -- "1:N (Owns)" --> P

    P -- "1:N (Contains)" --> PF
    P -- "1:0..1 (Executes)" --> WF

    WF -- "1:N (Comprises)" --> NI

    %% 核心复杂性：节点与版本
    NI -- "1:N (Has history)" --> NV
    NI -- "0..1 (Activates, via active_version_id)" --> NV_Active[NodeVersion]

    %% 依赖关系（通过版本追踪）
    NV -.->|0..* (Consumed Input from, via input_dependencies)| NV_Upstream[NodeVersion]
    NV -- "0..1:1 (Based on)" --> NV_Previous[NodeVersion]

```

**关键关系解读：**

1.  **节点与版本 (NI \<-\> NV):** 一个节点实例（NI）拥有多个版本历史（NV），但只有一个激活版本（NV\_Active）。
2.  **版本间的依赖 (NV -\> NV\_Upstream):** 这是实现“陈旧性检测”的关键。一个版本（NV）精确记录了它生成时所消费的上游版本 ID（NV\_Upstream）。当上游节点的激活版本变更时，下游依赖旧版本的节点将被标记为“陈旧”。

#### 2.1.3 分类法与术语表 (Taxonomy and Glossary)

**工作流核心概念 (Workflow Concepts)**

| 术语 | 定义 |
| :--- | :--- |
| **工作流实例 (WorkflowInstance)** | 一次从头到尾的完整建模过程的执行实例。 |
| **节点实例 (NodeInstance)** | 工作流中的一个具体步骤。它是执行的载体和版本的容器。 |
| **Stage（Phase 内逻辑分组）** | Phase 内的中间层，用 `stage_id`/`stage_name` 表示，用于聚合语义一致的节点集合，并在 API 中以 `phases[].stages[].nodes` 的形式暴露给前端。 |
| **严格线性执行 (Strictly Linear Execution)** | 工作流必须按照预定义的顺序逐一执行节点。 |
| **生成器节点 (Generator Node)** | 一种特殊类型的节点，执行完成后会动态生成并插入一系列新的子任务节点到工作流中（如步骤 1.1.2）。为保证一致性，禁止重新执行。 |
| **执行前沿 (Execution Frontier)** | 工作流中已执行或正在执行的最后一个节点的序号。用户不能操作前沿之外的未来节点。 |

**版本控制与状态 (Versioning and State)**

| 术语 | 定义 |
| :--- | :--- |
| **节点版本 (NodeVersion)** | 节点某次成功执行并被批准后的不可变快照，包含输入、输出和完整上下文。 |
| **激活版本 (Active Version)** | 在任意时刻，每个节点有且仅有一个被标记为“激活”的版本。它是该节点当前对外提供的“官方”结果，也是下游节点默认使用的输入来源。 |
| **原子化版本控制 (Atomic Versioning)** | 只有在 HITL 环节被用户最终批准后，才会产生一个不可变的 `NodeVersion`。 |
| **陈旧性 (Staleness)** | 当一个节点的上游依赖节点的 `Active Version` 更新后，该节点的状态。表示其结果是基于过时的输入生成的。 |
| **静默状态管理 (Silent State Management)** | 当上游变更导致下游“陈旧”时，系统仅作非侵入式提示，而不会自动触发任何级联更新。由用户决定何时以及如何处理不一致性。 |

**节点生命周期状态 (Node Lifecycle Status - `NodeStatus`)**

| 状态 | 定义 |
| :--- | :--- |
| **未开始 (Not Started)** | 节点从未被执行过。 |
| **执行中 (Executing)** | 节点的计算/LLM 推理正在进行。 |
| **等待 HITL 批准 (Awaiting HITL Approval)** | 计算成功完成，等待用户在 HITL 界面进行交互。此状态下的结果是临时的 (`pending_result`)。 |
| **已完成 (Completed)** | 节点拥有一个或多个已批准的版本，且存在一个 `Active Version`。 |
| **执行失败 (Failed)** | 节点的计算执行失败。 |

**人机协同 (Human-in-the-Loop - HITL)**

| 术语 | 定义 |
| :--- | :--- |
| **HITL** | 工作流中强制性的人工干预环节。 |
| **VARL (Vetted Approval/Rejection Loop)** | 审查式批准/拒绝循环。对输出进行快速的“批准”或“拒绝”的二元选择。 |
| **SCA (Strategic Choice Architecture)** | 战略选择架构。AI 生成 N 个候选方案并进行比较分析，由人类选择一个或多个接受。 |
| **AVL (Adversarial Validation Loop)** | 对抗性验证循环。AI 扮演“红队”进行批判性评审，由人类逐项裁决争议。 |

-----

### 2.2 信息架构图（文本描述）(Information Architecture Diagram - Textual Description)

本文档提供了 O-Award 建模平台全局信息架构的详尽文本描述。该架构旨在支持“线性探索与回溯”的设计哲学，并适应动态变化的工作流结构。

#### 2.2.1 全局结构与应用外壳 (Global Structure and Application Shell)

应用采用标准的 Web 应用结构，分为全局应用外壳和主要内容区域。

**L1: 应用外壳 (Application Shell)**
用户认证成功后加载的全局容器，提供统一的导航和上下文信息。

  * **全局导航栏 (Global Navigation Bar):** 位于屏幕顶部或左侧，提供对应用主要功能区域的快速访问。
      * Logo/主页链接（返回 L2.1 项目仪表板）。
      * 主导航链接：项目 (Projects)。
      * 用户控制区：用户头像、设置 (Settings) 链接（指向 L2.3）、登出。
      * 实时连接状态指示器（WebSocket 状态）。
  * **主内容区 (Main Content Area):** 动态加载 L2 层的具体视图。

#### 2.2.2 主要视图区域 (L2 Views)

应用包含三个主要的顶层视图区域。

**L2.1: 项目仪表板 (Project Dashboard)**
用户的默认入口点，用于管理所有项目。

  * **路由:** `/projects`
  * **核心组件:** 项目列表/网格视图，新建项目按钮，搜索/筛选功能。

**L2.2: 项目工作区 (Project Workspace)**
核心工作区域，用户在此进行建模、执行工作流和分析结果。这是一个沉浸式的视图。

  * **路由:** `/projects/{project_id}`

  * **布局结构:** 此视图的布局会根据项目的当前状态 (`Configuring` 或 `Running`/`Completed`) 动态切换。

    **L2.2.A: 项目配置视图 (Project Configuration View) (当 `Configuring`)**

      * **描述:** 用户上传文件、定义角色、选择赛题类型的界面。
      * **主要内容:**
          * 项目元数据编辑区（名称、描述、赛题类型）。
          * 文件管理区（上传、角色定义）。
          * 初始化选项（自定义 vs. 历年赛题）。
          * 核心操作：“启动工作流 (Start Workflow)” 按钮（满足前置条件后激活）。

    **L2.2.B: 工作流执行视图 (Workflow Execution View) (当 `Running`/`Completed`)**

      * **描述:** 平台的核心操作区，采用“画布+检查器”布局模型。
      * **结构:**
          * **B.1: 项目控制栏 (Project Control Bar):** 位于顶部。显示项目名称、状态、全局操作（如“导出项目”）。
          * **B.2: 工作流可视化画布 (Workflow Visualization Canvas):** 位于中央/左侧。
              * 使用 React Flow 渲染工作流结构（分阶段流程图或 DAG）。
              * **实时状态与陈旧性:** 清晰展示每个节点的状态和“陈旧性”标记。
              * **交互性 (回溯支持):** 用户可以点击任何已执行的节点以选中它。
              * **动态适应性:** 必须能够动态渲染由 Generator 节点生成的结构变化。
          * **B.3: 节点检查器面板 (Node Inspector Panel):** 位于右侧。根据选中的节点动态显示内容。
              * **面板头部:** 显示选中节点的名称、状态。
              * **标签页结构:**
                  * **Tab 1: 执行与结果 (Execution & Results):** 根据节点状态动态变化。
                      * `Awaiting HITL`: 显示 HITL 交互界面 (SCA/AVL/VARL) 和 `pending_result`。提供批准/拒绝/丢弃操作。
                      * `Completed`: 显示 `active_version` 的输出工件。提供“编辑”和“重新执行”操作。如果陈旧，显示警告。
                      * `Executing`: 显示执行进度 (`current_stage`)。
                      * `Failed`: 显示错误日志。提供“重试”操作。
                  * **Tab 2: 版本历史 (Version History):** 列出所有历史版本。提供“审查”和“激活此版本”操作。
                  * **Tab 3: 依赖关系 (Dependencies):** 显示上游输入依赖。清晰展示“陈旧性”报告详情。

**L2.3: 用户设置中心 (User Settings Center)**
用户配置个人偏好和工作流引擎参数的区域。

  * **路由:** `/settings`
  * **布局结构:** 采用标准的设置面板布局（侧边栏导航+内容区）。
  * **核心模块:** 账户设置、界面设置（主题/语言）、工作流引擎（BYOK）、AI 行为（HITL Profile/Depth）。

#### 2.2.3 导航模型与路径定义

**导航模型：混合模型（全局导航 + 上下文导航）**

1.  **全局导航 (Global Navigation):** 通过 L1 导航栏在 L2 主要视图区域之间切换。
2.  **列表到详情 (List to Detail):** 从项目仪表板 (L2.1) 点击项目，导航到项目工作区 (L2.2)。
3.  **状态驱动的视图切换:** 在 L2.2 中，系统根据项目状态自动选择显示配置视图 (L2.2.A) 或执行视图 (L2.2.B)。
4.  **上下文导航 (Contextual Navigation - 支持回溯):** 在工作流执行视图 (L2.2.B) 中，用户通过点击画布 (B.2) 中的不同节点来切换焦点。这不会改变 URL 路由，而是更新节点检查器面板 (B.3) 的内容。这使得用户可以在保持全局上下文的同时进行回溯和审查。
5.  **流程推进 (Proceeding):** 在 HITL 环节点击“继续”后，系统会自动将焦点推进到下一个节点。

-----

### 2.3 核心任务流程（文本描述）(Core Task Flows - Textual Description)

本文档详细描述了用户完成关键任务所需的路径，包括用户动作序列、系统反馈、决策节点和分支逻辑。

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

#### 2.3.2 场景二：执行一个节点并完成 HITL 交互 (以 SCA 模式为例)

**目标:** 用户对处于 `Awaiting HITL Approval` 状态的节点进行决策。
**入口点:** L2.2.B: 工作流执行视图。节点 N 状态为 `Awaiting HITL Approval` (SCA 模式)。

**流程描述:**

1.  **[系统反馈 (UI)]** 节点检查器面板 (B.3) 渲染 SCA 交互界面，显示 `pending_result` 中的候选方案列表和比较分析。
2.  **[用户动作]** 用户审查方案和分析。

**分支 A: 批准并继续 (Continue)**

3A. **[用户动作]** 选择一个或多个满意的方案（如 Option B）。点击“批准并继续”。
4A. **[系统响应 (API)]** 调用 `POST /nodes/{id}/hitl`。`action: "Continue"`, `interaction_data: { "selected_ids": ["Option B"] }`。
5A. **[系统响应 (后端逻辑)]**
\*   固化 `pending_result` 为新的 `NodeVersion`，并设为 `active_version`。
\*   更新节点 N 状态为 `Completed`。
\*   **决策下一步 (Proceed to Next 逻辑 SRS 5.3):** 检查下一个节点 N+1。
\*   如果 N+1 为 `Not Started`: 自动触发 N+1 执行。API 响应 `action: "ExecuteNext"`.
\*   如果 N+1 为 `Completed`: 不自动执行。API 响应 `action: "NavigateNext"`.
6A. **[系统反馈 (UI)]** 焦点自动转移到节点 N+1。通过 WebSocket 确认 N 已完成。根据 API 响应，N+1 可能开始执行或进入审查模式（并显示陈旧性提示）。

**分支 B: 拒绝并提供修改意见 (RejectAndProvideModificationComments)**

3B. **[用户动作]** 点击“拒绝并修改”。输入修改意见并提交。
4B. **[系统响应 (API)]** 调用 `POST /nodes/{id}/hitl`。`action: "RejectAndProvideModificationComments"`.
5B. **[系统响应 (后端逻辑)]** 将节点 N 重新加入执行队列（基于新反馈）。
6B. **[系统反馈 (UI)]** 节点 N 状态变回 `Executing`。流程循环等待新的结果。

**分支 C: 丢弃本次执行 (Discard)**

3C. **[用户动作]** 点击“丢弃本次执行”并确认。
4C. **[系统响应 (API)]** 调用 `POST /nodes/{id}/hitl`。`action: "Discard"`.
5C. **[系统响应 (后端逻辑)]** 删除 `pending_result`。节点状态回滚到执行前的状态。
6C. **[系统反馈 (UI)]** 详情面板刷新，显示回滚后的状态。

**出口点:** 节点 N 的 HITL 环节结束，工作流进入下一个状态。

-----

#### 2.3.3 场景三：回溯、版本切换与手动下游更新

**目标:** 用户修改上游历史决策，并手动更新下游节点。体现“静默状态管理”。
**入口点:** L2.2.B: 工作流执行视图。假设 Node A -\> Node B 已完成。A 当前激活 V2。B 基于 A(V2) 生成。

**流程描述:**

1.  **[用户动作 (回溯)]** 用户在画布上点击 Node A。
2.  **[系统反馈 (UI)]** 节点检查器加载 Node A，显示 V2。
3.  **[用户动作]** 切换到“版本历史”标签页。审查历史版本 V1。
4.  **[用户动作 (版本切换)]** 点击 V1 的“激活此版本”按钮。
5.  **[系统响应 (API)]** 调用 `POST /nodes/{A_id}/versions/{V1_id}/activate`。
6.  **[系统响应 (关键 - 静默状态管理)]**
      * **(后端逻辑):** Node A 的 `active_version_id` 更新为 V1。**系统不自动执行下游 Node B。**
7.  **[系统响应 (UI - 陈旧性检测)]** 前端调用 `GET /workflows/{id}/staleness`。
8.  **[系统反馈 (UI)]** API 返回 Node B 已陈旧。工作流画布上，Node B 显示“陈旧 (Stale)”警告图标。
9.  **[用户动作]** 用户点击 Node B。
10. **[系统反馈 (UI)]** 节点检查器加载 Node B，并显示醒目提示：“输入已变更（Node A 已切换为 V1）。建议重新执行。”
11. **[用户动作 (手动重新执行)]** 用户点击 Node B 的“重新执行”按钮并确认。
12. **[系统响应 (API)]** 调用 `POST /nodes/{B_id}/re-execute`。
13. **[系统响应 (后端逻辑 - 依赖解析)]** 系统执行 Node B，自动拉取 Node A 的**当前激活版本 (V1)** 作为输入。
14. **[系统反馈 (UI)]** Node B 状态变为 `Executing`。陈旧性提示消失。

**出口点:** Node A 版本已切换，Node B 正在基于新的上游输入重新执行。

-----

#### 2.3.4 场景四：对 AI 生成的工件进行人工编辑并创建新版本

**目标:** 用户直接修改 AI 生成的中间结果，并保存为新的激活版本。
**入口点:** L2.2.B: 工作流执行视图。Node N 已完成 (V1)。

**流程描述:**

1.  **[用户动作]** 用户在 Node N 的详情面板审查 V1 工件。点击“人工编辑 (Manual Edit)”按钮。
2.  **[系统反馈 (UI)]** 详情面板切换为编辑模式，加载平台内编辑器（如 Tiptap/Novel），并载入 V1 内容。
3.  **[用户动作]** 用户在编辑器中修改内容。（可选：使用 Ask AI 辅助功能）。
4.  **[用户动作]** 点击“保存并激活”按钮。输入版本摘要并确认。
5.  **[系统响应 (API)]** 调用 `POST /nodes/{id}/manual-edit`。
      * `base_version_id: V1`, `edited_output_data: {...}`, `summary: "..."`。
6.  **[系统响应 (后端逻辑)]**
      * 创建新版本 V2 (`source: MANUALLY_EDITED`)。
      * 将 V2 设为 `active_version`。
7.  **[系统反馈 (UI)]** 退出编辑模式，详情面板显示 V2 内容。
8.  **[系统响应 (UI)]** 前端重新计算陈旧性。所有依赖 Node N 的下游节点被标记为“陈旧”。

**出口点:** 节点 N 的激活版本已更新为人工编辑后的 V2，下游节点显示陈旧提示。

---

## 阶段 3：交互框架与结构定义 (Phase 3: Interaction Framework & Structural Definition)

### 3.1.1 全局交互模式库 (Global Interaction Pattern Library)

本文档建立了一套可复用的全局交互模式库，旨在为 O-Award 建模平台提供高效、一致且支持专家级操作的交互体验。这些模式基于 `Shadcn/ui`, `Radix UI`, `React Flow`, 和 `Tiptap/Novel` 等技术栈构建。

#### 3.1.1.1 核心操作范式 (Core Interaction Paradigms)

**1\. 选择与焦点管理 (Selection and Focus Management)**

*   **画布+检查器模式 (Canvas + Inspector):** 这是平台的核心交互模型。用户在主区域（画布或列表）中选择一个对象，其详细信息和相关操作会在侧边的“检查器面板 (Inspector Panel)”中加载和显示。
*   **单一焦点原则:** 在任意时刻，工作流画布中只有一个节点处于选中（Focused）状态。点击节点会立即选中它，并取消之前的选择。选中的节点应有清晰的视觉高亮。
*   **可访问性:** 利用 Radix UI 的底层能力，确保所有交互元素支持键盘导航。模态框和下拉菜单必须实现正确的焦点捕获 (Focus Trapping)。

**2\. 命令调用与操作 (Command Invocation)**

*   **操作层级:**
    *   **主要操作 (Primary):** 推进流程的关键操作（如“批准并继续”、“保存”）。使用高对比度的主按钮 (`Shadcn Button` default variant)。
    *   **次要操作 (Secondary):** 辅助性或替代性操作（如“编辑”、“取消”）。使用次要按钮 (`Shadcn Button` secondary/outline variant)。
    *   **危险操作 (Destructive):** 不可逆的操作（如“删除”、“丢弃执行”）。使用危险色按钮 (`Shadcn Button` destructive variant)。
*   **确认机制:** 所有危险操作必须通过 `Shadcn AlertDialog` 进行二次确认。确认信息必须清晰说明操作的后果。
*   **溢出菜单:** 对于低频操作，使用“更多操作”(...)菜单（`DropdownMenu` 组件）收纳。

**3\. 数据输入与表单 (Data Input and Forms)**

*   **管理与验证:** 使用 `React Hook Form` 结合 `Zod` 进行管理。
*   **布局与反馈:** 标签位于输入框上方。采用即时内联验证 (Inline Validation)，错误信息直接显示在输入控件下方。
*   **BYOK 密钥输入:** 遵循“写后即忘”原则。使用 `type="password"`。根据 `has_api_key` 状态显示占位符（如“已设置，输入以覆盖”），绝不回显密钥。

#### 3.1.1.2 复杂交互模式 (Complex Interaction Patterns)

##### 1\. 工作流可视化导航与操作

*   **技术基础:** `React Flow (@xyflow/react)`.
*   **画布导航:** 支持平移（Pan）和缩放（Zoom）。提供 Minimap 和 Controls 工具栏。
*   **节点选择与回溯 (Backtracking):**
    *   用户可以点击任何已开始或已完成的节点来选中它，触发检查器面板加载其详情。
    *   **执行前沿限制:** 超前于“执行前沿”的 `Not Started` 节点应在视觉上显示为“未解锁”，并且不可点击。
*   **动态结构更新:** 当 Generator 节点完成时，使用布局动画（`Framer Motion` 或 `React Flow` 内置动画）平滑地呈现新节点的出现和重新排列。

##### 2\. 多步骤 HITL 审批流程

HITL 交互统一发生在节点检查器面板中。

**通用 HITL 框架:**

*   **结构:** 分为“结果展示区”和底部的固定“操作栏”。
*   **操作栏:** 包含标准操作：“批准并继续”、“拒绝并修改”、“丢弃执行”。

**模式 A: SCA (战略选择架构)**

*   **交互:** 比较与选择。
*   **布局:**
    1.  **比较分析区:** 展示 AI 生成的综合比较分析报告。
    2.  **候选方案列表:** 使用 `Card` 或 `Accordion` 展示每个方案摘要。
    3.  **选择机制:** 使用 `RadioGroup`（单选）或 `Checkbox`（多选）。选中方案后，“批准”按钮激活。

**模式 B: AVL (对抗性验证循环)**

*   **交互:** 评审与裁决。
*   **布局:**
    1.  **待评审内容区:** 展示核心输出。
    2.  **批判与裁决列表:** 展示 AI Critic 的批判意见列表。
    3.  **裁决机制:** 针对每条批判，提供“采纳 (Accept)”和“拒绝 (Reject)”按钮。用户必须完成所有裁决后才能提交。
*   **迭代:** 提交后可能触发内部循环 (`AVLLoop`)，界面显示加载状态。

##### 3\. 版本浏览与切换

*   **入口:** 节点检查器面板的“版本历史”标签页。
*   **交互规则:**
    *   **历史列表:** 显示所有版本，标记当前激活版本。
    *   **审查 (Review):** 点击历史版本，在只读模态框 (`Dialog`) 中加载该版本的完整快照。
    *   **激活 (Activate):** 提供“激活此版本”按钮。
        *   **强制确认:** 点击后必须弹出确认对话框，明确警告用户下游节点将变为“陈旧 (Stale)”且不会自动更新（遵循“静默状态管理”）。
        *   **限制:** Generator 节点禁止切换版本。

##### 4\. 结构化内容编辑 (人工编辑 R4)

*   **技术基础:** `Tiptap/Novel` (富文本/LaTeX), Code Editor。
*   **交互规则:**
    *   **进入编辑模式:** 在已完成节点的检查器面板中，点击“人工编辑”。内容区切换为编辑器实例。
    *   **AI 辅助 (Ask AI):** 集成 Deer-Flow 的 Ask AI 功能。用户可通过斜杠命令 (`/ai`) 或选中文本后的浮动工具栏调用 AI 辅助编辑。
    *   **保存与版本创建:** 点击“保存并激活”按钮。弹出对话框要求用户输入“版本摘要 (Summary)”。提交后，创建一个新的 `MANUALLY_EDITED` 版本并自动激活。

---

### 3.1.2 系统反馈与状态管理逻辑 (System Feedback and State Management Logic)

本文档定义了系统如何沟通状态变化、处理异步操作和管理异常情况的全局规范。

#### 3.1.2.1 实时状态可视化 (Real-time Status Visualization)

系统必须清晰、实时地可视化工作流和节点的各类状态。

**节点生命周期状态 (`NodeStatus`) 可视化规范:**

建立一套一致的视觉语言（图标 + 色彩 + 动画）应用于工作流画布和检查器面板。

| 状态 | 图标 (Lucide Icon) | 颜色 (Semantic Color) | 动画与效果 |
| :--- | :--- | :--- | :--- |
| **Not Started** | `Circle` (虚线) | 中性灰 (Gray) | 无。若未解锁，显示为置灰状态。 |
| **Executing** | `Loader` (旋转) | 主色 (Blue/Primary) | 旋转动画。节点边缘可应用微妙的动态光效（`Magic UI BorderBeam`）。 |
| **Awaiting HITL Approval** | `UserCheck` 或 `Hand` | 警告色 (Yellow/Amber) | 微妙的脉动效果或闪烁，以吸引用户注意。 |
| **Completed** | `CheckCircle` (实心) | 成功色 (Green) | 状态变化时有平滑的转场动画。 |
| **Failed** | `XCircle` (实心) | 错误色 (Red) | 醒目，静态。 |

#### 3.1.2.2 异步与实时通信反馈机制

**1\. 长时间运行任务 (节点执行)**

*   **即时反馈:** 用户触发执行后，UI 必须立即响应（按钮禁用，显示加载状态）。
*   **进度详情:** 当节点处于 `Executing` 状态时，检查器面板应实时显示 `current_stage` 的文本信息（例如：“Step 2/5: Running simulation...”）。

**2\. WebSocket 实时通信管理**

*   **连接状态指示器:** 在全局导航栏中显示 WebSocket 连接状态。
*   **断线与重连:**
    *   连接中断时，在屏幕顶部显示全局横幅 (Global Banner)：“实时更新已中断，正在尝试重连...”。
    *   重连成功后，横幅消失，并立即触发一次全局状态同步。

#### 3.1.2.3 “静默状态管理”与“陈旧性”提示

遵循“静默状态管理”原则 (SRS 1.4)，当上游变更导致下游节点“陈旧 (Stale)”时，提供非侵入式提示。

**陈旧性 (Staleness) 可视化规范:**

*   **检测触发:** 任何节点的 `active_version` 变更后，前端立即调用 `GET /workflows/{id}/staleness` 更新状态。
*   **L1: 画布提示:** 在陈旧的节点卡片上添加一个醒目的警告图标（例如 `AlertTriangle` 或 `RefreshCw`），颜色为警告色。
*   **L2: 检查器面板提示:** 当用户选择陈旧节点时，在“执行与结果”标签页顶部显示一个突出的警告框 (`Shadcn Alert`)。文案必须清晰说明原因和建议操作。
*   **L3: 依赖详情:** 在“依赖关系”标签页中，清晰高亮显示版本号不一致的上游依赖。

#### 3.1.2.4 反馈层级与模态 (Feedback Hierarchy and Modality)

定义不同类型反馈的呈现方式和视觉层级。

| 层级 | 类型 | 呈现方式 | 模态性 | 组件示例 | 用途场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L1** | 内联反馈 (Inline) | 文本、图标、输入框样式 | 非阻塞 | `FormHelperText`, Icon | 表单验证错误、字段级状态。 |
| **L2** | 轻量通知 (Toast) | 短暂出现的通知框 | 非阻塞，自动消失 | `Sonner` Toast | 操作成功确认（“保存成功”）；非关键错误。 |
| **L3** | 上下文警示 (Contextual Alert) | 嵌入式警报框、横幅 | 非阻塞，持久显示 | `Shadcn Alert`, Global Banner | 陈旧性警告（Alert）；WebSocket 断连（Banner）。 |
| **L4** | 模态确认与输入 (Modal Interaction) | 对话框 | 阻塞 | `Shadcn AlertDialog`, `Dialog` | 破坏性操作二次确认；输入必要信息（如版本摘要）。 |
| **L5** | 错误页面 (Error Page) | 全屏视图 | 阻塞 | Custom Error Page | 系统崩溃、严重权限错误。 |

---

### 3.2.1 布局模板与导航模型 (Layout Templates and Navigation Models)

本文档定义了应用的基础结构框架、核心布局模板和全局导航模型。

#### 3.2.1.1 基础布局框架 (Base Layout Framework)

**1\. 栅格系统与响应式策略 (Grid System and Responsiveness)**

*   **技术基础:** `Tailwind CSS` Flexbox 和 Grid 布局。
*   **设计策略:** **Desktop-First**。优先保证在大屏幕上的高信息密度和操作效率。`lg` (1024px) 是支持完整功能体验的最小推荐尺寸。
*   **栅格系统:** 标准 12 列栅格系统。

**2\. 应用外壳 (Application Shell)**

全局容器，提供持久化的导航。采用全屏高度布局 (`h-screen flex`)。

*   **全局导航栏 (Global Navbar):** 固定在顶部或左侧。包含 Logo、主导航链接（项目）、用户控制区（设置、账户、WebSocket 状态）。

#### 3.2.1.2 核心布局模板定义

**模板一：标准列表/仪表板布局 (Standard List/Dashboard Layout)**

*   **适用场景:** L2.1 项目仪表板、L2.3 用户设置中心。
*   **结构:** 经典的 Web 应用布局。内容区域通常有最大宽度限制并居中。包含页面头部和主内容区（列表、表格或表单）。

**模板二：沉浸式工作区布局 (Immersive Workspace Layout - Canvas + Inspector)**

*   **适用场景:** L2.2.B 工作流执行视图。
*   **结构:** 全屏、全高布局。
    *   **[A] 项目控制栏:** 位于顶部。提供项目级上下文和操作。
    *   **[B] 工作区容器:** 占据剩余所有高度。采用水平 Flex 布局。
        *   **[B.1] 工作流画布区 (Canvas):** 占据主要空间 (`flex-1`)。承载 React Flow 可视化。
        *   **[B.2] 节点检查器面板 (Inspector):** 固定在右侧。固定宽度（例如 `w-96` 或 `w-1/3`）。支持独立滚动。
*   **动态调整:** B.1 和 B.2 之间应提供一个可拖拽的分隔条（Resizable Splitter），并支持折叠/展开 B.2。

#### 3.2.1.3 导航模型 (Navigation Models)

采用混合导航模型。

**1\. 全局路由导航 (Global Routing Navigation - URL Driven)**

*   **机制:** 基于 URL 路由 (`Next.js App Router`)。
*   **用途:** 在 L2 主要视图区域之间切换（项目列表 \<-\> 工作区 \<-\> 设置）。

**2\. 上下文状态导航 (Contextual State Navigation - State Driven)**

*   **机制:** 基于客户端状态管理（`Zustand`）而非 URL 路由。
*   **用途:** 在工作流执行视图中切换焦点节点（回溯和审查）。
*   **行为:** 用户点击画布节点，更新 `selectedNodeId` 状态，检查器面板局部更新内容。URL 保持不变（或仅更新查询参数 `?node={id}`）。这使得导航极为快速和流畅。

**3\. 标签页导航 (Tabbed Navigation)**

*   **机制:** 使用 `Shadcn Tabs`。
*   **用途:** 在节点检查器面板内部组织信息（结果、历史、依赖）。

---

### 3.2.2 关键屏幕线框图（文本描述）(Key Screen Wireframes - Textual Description)

本文档提供了关键页面的布局结构、信息层级和组件配置的详细文本描述。

#### 3.2.2.1 屏幕一：项目管理仪表板 (Project Management Dashboard)

*   **路由:** `/projects`
*   **布局模板:** 模板一 (标准列表/仪表板布局)。

**结构描述:**

**[A] 页面头部:**
*   左侧：标题 "Projects"。
*   右侧：按钮 "+ New Project" (Primary)。

**[B] 筛选与搜索栏:**
*   左侧：搜索框 (`Input`) "Search projects..."。
*   右侧：筛选器 (`Select`) "Status", "Type"。

**[C] 项目列表:**
*   使用 `Shadcn Table` 以支持高密度信息。
*   **列:** Name (可点击导航), Status (`Badge`), Type, Last Updated, Actions ("..." `DropdownMenu` 包含 Edit, Delete)。

---

#### 3.2.2.2 屏幕二：工作流执行画布 (Workflow Execution View)

*   **路由:** `/projects/{project_id}`
*   **布局模板:** 模板二 (沉浸式工作区布局)。

**结构描述:**

**[A] 项目控制栏 (Project Control Bar):**
*   左侧：面包屑导航 (Projects / {Project Name})，项目状态 `Badge`。
*   右侧：按钮 "Export Project"。

**[B] 工作流画布区 (Workflow Canvas Area):**
*   `React Flow` 容器。背景为网格图案。
*   **节点渲染:** 自定义节点卡片，显示名称、ID、状态图标、陈旧性图标。按照 `Phase -> Stage -> Node` 的层级布置：Phase 作为列，Stage 作为列内分组，直接消费 API 返回的 `phases[].stages[].nodes` 数据。
*   **控件:** 右下角 Minimap 和 Zoom Controls。

**[C] 节点检查器面板 (Node Inspector Panel):**
*   右侧固定面板。

    **[C.1] 面板头部:** 选中节点的名称、状态。折叠按钮。
    **[C.2] 标签页导航:** Tabs: "Results & Actions", "History", "Dependencies".
    **[C.3] 标签页内容 (动态):**

    *   **Tab 1: Results & Actions (根据状态变化):**
        *   **If Stale:** 顶部显示陈旧性警告 `Alert`。
        *   **If `Completed`:**
            *   操作工具栏："Manual Edit", "Re-execute"。
            *   输出工件展示区（Markdown, Code, etc.）。
        *   **If `Awaiting HITL`:** (详见屏幕三)。
        *   **If `Executing`:** 加载指示器和 `current_stage` 文本。
        *   **If `Failed`:** 错误日志展示区。按钮 "Retry"。

    *   **Tab 2: History:** 版本历史列表（详见屏幕四）。
    *   **Tab 3: Dependencies:** 上游依赖列表和版本一致性检查报告。

---

#### 3.2.2.3 屏幕三：HITL 交互界面 (HITL Interaction Interface)

*   **位置:** 嵌入在屏幕二的节点检查器面板 [C.3, Tab 1] 中。

**界面 A: SCA (战略选择架构) 模式**

**[A] AI 比较分析区:**
*   `Card` 组件，显示 AI 生成的对比分析报告。

**[B] 候选方案列表:**
*   使用 `RadioGroup`（单选）或带复选框的列表（多选）。
*   每个方案用 `Accordion` 或 `Card` 展示，包含摘要和详情。

**[C] HITL 操作栏:**
*   固定在面板底部。
*   按钮："Discard", "Reject & Modify", "Approve & Continue" (选择方案后激活)。

**界面 B: AVL (对抗性验证循环) 模式**

**[A] 待验证内容区:**
*   显示核心输出内容（只读）。

**[B] 对抗性批判列表:**
*   列表形式展示每条批判意见。
*   每项包含：批判内容、建议修改、裁决控件（"Accept"/"Reject" 按钮组）。

**[C] HITL 操作栏:**
*   固定在面板底部。
*   按钮："Submit Adjudication" (完成所有裁决后激活)。

---

#### 3.2.2.4 屏幕四：工件编辑与版本管理视图 (Artifact Editing and Version Management)

**视图 A: 人工编辑模式 (Manual Editing Mode)**

*   **位置:** 嵌入在屏幕二的节点检查器面板 [C.3, Tab 1] 中（激活编辑模式时）。

**[A] 编辑器主体:**
*   `Tiptap/Novel` 编辑器实例（或 Code Editor）。
*   包含完整的工具栏和 Ask AI 辅助功能。

**[B] 编辑操作栏:**
*   固定在面板底部。
*   按钮："Cancel", "Save & Activate" (点击后弹出版本摘要输入对话框)。

**视图 B: 版本历史管理 (Version History Tab)**

*   **位置:** 屏幕二的节点检查器面板 [C.3, Tab 2]。

**[A] 版本历史列表:**
*   列表形式。每项显示版本号、时间、来源、摘要、激活状态。
*   操作按钮："Review" (打开模态框查看详情), "Activate" (弹出确认对话框)。

---

### 3.3 UX 文案指南 (UX Writing Guidelines)

本文档确立了 O-Award 建模平台内部所有文案的语调、风格和用词规范。

#### 3.3.1 品牌声音与语调 (Brand Voice and Tone)

**品牌声音：精密、专业、赋能 (Precise, Professional, Empowering).**

平台的声音是专家与专家之间的对话，保持客观、精确，同时提供清晰的指引和支持。

**语调指南:**

1.  **精确与客观 (Precise and Objective):** 使用准确术语，避免口语化和情绪化表达。
    *   *Do:* "Node 1.1.2 execution failed."
    *   *Don't:* "Oops! Something went wrong."
2.  **清晰与直接 (Clear and Direct):** 直截了当地说明事实和所需操作。优先使用主动语态和祈使句。
    *   *Do:* "Select a preferred architecture to continue."
    *   *Don't:* "An architecture must be selected before proceeding."
3.  **支持性与赋能 (Supportive and Empowering):** 强调用户的控制权，并在出现问题时提供解决方案。
    *   *Do:* "Input dependency changed. Re-execution is recommended to sync updates."
    *   *Don't:* "You must re-execute this node."

#### 3.3.2 沟通原则 (Communication Principles)

1.  **一致性 (Consistency):** 严格遵守术语表，确保在所有界面中使用统一的术语。
2.  **简洁性 (Conciseness):** 言简意赅，删除不必要的词语。
3.  **清晰性优先 (Clarity First):** 当简洁性与清晰性冲突时，优先保证清晰性。

#### 3.3.3 术语标准化 (Terminology Standardization)

| 概念 | 标准术语 (英文) | 备注/解释 |
| :--- | :--- | :--- |
| 工作流中的步骤 | Node | |
| 节点的执行结果快照 | Version (V1, V2...) | |
| 当前生效的版本 | Active Version | 下游节点使用的输入来源。 |
| 上游更新导致下游过时 | Stale (Status: Stale) | 表示结果基于过时的输入生成。 |
| 人机协同环节 | HITL Approval / Review | 优先使用 Review 或 Approval。 |
| 对已完成节点发起新执行 | Re-execute | 用于探索性执行。 |
| 对失败节点再次尝试 | Retry | 用于错误恢复。 |
| 丢弃本次临时执行结果 | Discard Execution | 强调会丢失本次执行的临时结果。 |
| 用户直接修改工件 | Manual Edit | |
| 切换激活版本 | Activate Version | 避免使用 Rollback。 |

#### 3.3.4 特定场景文案范式 (Specific Scenario Paradigms)

**1\. 确认对话框 (Confirmation Dialogs - 强调后果)**

*   **范式:** 标题应明确操作。正文必须清晰说明后果。按钮应使用明确动词。
*   **示例（版本切换）:**
    *   标题：`Activate Version V1?`
    *   正文：`Activating this historical version will change the output of this node. Downstream nodes will be marked as Stale and will not be automatically updated. Do you want to proceed?`
    *   按钮：`Cancel` / `Activate`

**2\. 陈旧性提示 (Staleness Alerts)**

*   **范式:** 状态 + 原因 + 建议操作。
*   **示例:** `Warning: Input Outdated (Stale). Upstream node [Node A] has updated from V1 to V2. It is recommended to Re-execute this node to sync the latest data.`

**3\. 错误信息 (Error Messages)**

*   **范式:** 发生了什么 + 为什么发生 + 如何解决。
*   **示例:** `Execution Failed. The Python script encountered an error at line 42. Please review the execution log for details and Retry.`

---

## 阶段 4：视觉语言、美学与动效系统 (Phase 4: Visual Language, Aesthetics & Motion System)

本文档定义了 O-Award 建模平台的设计系统基础，包括视觉语言、美学规范和动效系统。该系统基于“精密未来主义 (Precision Futurism)”的美学基调（1.3.3），旨在提供专业、高效且富有科技感的体验。所有规范都以 Design Tokens 的形式结构化，确保与 `Tailwind CSS`, `Shadcn/ui` 和 `Framer Motion` 的无缝集成。

### 4.1.1 色彩系统与主题策略 (Color System and Theming Strategy)

#### 4.1.1.1 主题策略 (Theming Strategy)

1.  **深色优先 (Dark Mode First):** 平台默认采用深色模式，以营造沉浸式的专业环境，减少视觉疲劳，并强化科技感。浅色模式作为备选提供。
2.  **实现机制:** 利用 `next-themes` 进行主题切换。所有颜色必须定义为 CSS 变量，并遵循 `Shadcn/ui` 的 HSL 格式约定。主题切换通过在 `<html>` 标签上切换 `class="dark"` 来实现。
3.  **无障碍性 (Accessibility):** 所有前景文本与背景色的组合必须满足 WCAG AA 级的对比度要求。

#### 4.1.1.2 色板定义 (Color Palette)

色板设计强调克制、科技感和清晰的语义。

  * **主色 (Primary): 精密蓝 (Precision Blue).** 冷静、精确，用于关键操作和激活状态。
  * **中性色 (Neutrals): 冷灰 (Cool Gray).** 带有轻微蓝色倾向的灰色阶，用于构建界面结构和背景。
  * **语义色彩 (Semantic Colors):** 用于传达系统状态（成功 Green、警告 Amber、错误 Red）。

#### 4.1.1.3 Design Tokens 与 CSS 变量定义

以下定义了语义化的 Design Tokens 及其对应的 CSS 变量（HSL 值）。这些变量将直接应用于 `globals.css` 中。

```css
/* globals.css */
@layer base {
  :root { /* Light Mode Definitions */
    /* 基础层 (Foundation) */
    --background: 0 0% 100%;          /* White */
    --foreground: 220 10% 10%;        /* Near Black */

    /* 容器与浮层 (Containers & Overlays) */
    --card: 0 0% 100%;
    --card-foreground: 220 10% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 220 10% 10%;

    /* 主色 (Primary - Precision Blue) */
    --primary: 215 90% 50%;           /* Bright Blue */
    --primary-foreground: 0 0% 100%;

    /* 次要色 (Secondary) */
    --secondary: 220 5% 90%;          /* Light Gray */
    --secondary-foreground: 220 10% 15%;

    /* 辅助与强调 (Muted & Accent) */
    --muted: 220 5% 96%;              /* Very Light Gray */
    --muted-foreground: 220 5% 45%;   /* Medium Gray Text */
    --accent: 220 5% 96%;
    --accent-foreground: 220 10% 15%;

    /* 危险色 (Destructive) */
    --destructive: 0 85% 60%;         /* Red */
    --destructive-foreground: 0 0% 100%;

    /* 实用工具 (Utilities) */
    --border: 220 5% 85%;             /* Border color */
    --input: 220 5% 85%;              /* Input border color */
    --ring: 215 90% 50%;              /* Focus ring color (Primary) */

    /* 基础圆角 (Base Radius - See 4.1.4.2) */
    --radius: 0.375rem; /* 6px (Radius-MD) */

    /* 扩展语义色 (Extended Semantic Colors) */
    --warning: 40 100% 50%;
    --warning-foreground: 0 0% 10%;
    --success: 140 70% 45%;
    --success-foreground: 0 0% 100%;
  }

  .dark { /* Dark Mode Definitions (Default) */
    /* 基础层 (Foundation) */
    --background: 220 10% 7%;         /* Deep Blue-Black */
    --foreground: 0 0% 98%;           /* Off White */

    /* 容器与浮层 (Containers & Overlays) */
    /* 卡片比背景稍亮，构建层级感 */
    --card: 220 10% 10%;              /* Charcoal */
    --card-foreground: 0 0% 98%;
    --popover: 220 10% 10%;
    --popover-foreground: 0 0% 98%;

    /* 主色 (Primary - Precision Blue) */
    /* 深色模式下稍微提亮以保持活力 */
    --primary: 210 90% 60%;           /* Lighter Blue */
    --primary-foreground: 220 10% 5%; /* Dark text for contrast */

    /* 次要色 (Secondary) */
    --secondary: 220 10% 20%;         /* Medium Gray */
    --secondary-foreground: 0 0% 98%;

    /* 辅助与强调 (Muted & Accent) */
    --muted: 220 10% 12%;
    --muted-foreground: 220 5% 65%;   /* Light Gray Text */
    --accent: 220 10% 15%;
    --accent-foreground: 0 0% 98%;

    /* 危险色 (Destructive) */
    --destructive: 0 65% 50%;         /* Darker Red */
    --destructive-foreground: 0 0% 98%;

    /* 实用工具 (Utilities) */
    --border: 220 10% 20%;
    --input: 220 10% 25%;
    --ring: 210 90% 60%;

    /* 扩展语义色 (Extended Semantic Colors) */
    --warning: 45 100% 60%;
    --warning-foreground: 0 0% 5%;
    --success: 150 70% 50%;
    --success-foreground: 0 0% 5%;
  }
}
```

-----

### 4.1.2 字体系统与排版规则 (Typography System and Rules)

#### 4.1.2.1 字体选择与加载 (Font Selection and Loading)

选择现代、高可读性的字体家族，支持“精密未来主义”美学。

**1. 主字体 (Primary Typeface): Geist Sans**

  * **选择理由:** 专为现代界面设计，风格简洁、几何感强，具有出色的屏幕可读性。
  * **实现:** 使用 `next/font` 加载 Vercel Geist Font。

**2. 等宽字体 (Monospaced Typeface): Geist Mono**

  * **选择理由:** 与 Geist Sans 完美协调，用于代码块和数据对齐。

**3. 数学公式字体 (Math Typeface): KaTeX Default (Computer Modern)**

  * **选择理由:** LaTeX 排版的标准字体，提供最佳的数学符号支持。

**Token 化结构 (Tailwind CSS 配置):**

```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // Token: font-sans
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
        // Token: font-mono
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
      },
    },
  },
}
```

#### 4.1.2.2 排版等级 (Type Scale)

定义一套清晰的字阶系统。基于 16px (1rem) 的基准字体大小。

| Role | Size (px/rem) | Weight | Line Height | Letter Spacing | Tailwind Utility (Example) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 (Page Title)** | 36px / 2.25rem | Bold (700) | 1.2 | -0.02em | `text-4xl font-bold tracking-tighter` |
| **H2 (Section Title)** | 30px / 1.875rem| SemiBold (600) | 1.3 | -0.01em | `text-3xl font-semibold tracking-tight` |
| **H3 (Panel Title)** | 24px / 1.5rem | SemiBold (600) | 1.4 | 0em | `text-2xl font-semibold` |
| **H4 (Sub-section)** | 20px / 1.25rem | SemiBold (600) | 1.5 | 0em | `text-xl font-semibold` |
| **Body L** | 18px / 1.125rem| Regular (400) | 1.6 | 0em | `text-lg leading-relaxed` |
| **Body M (Base)** | 16px / 1rem | Regular (400) | 1.5 | 0em | `text-base` |
| **Body S (UI)** | 14px / 0.875rem| Regular (400) | 1.5 | 0em | `text-sm` |
| **Detail/Caption** | 12px / 0.75rem | Regular (400) | 1.4 | 0.01em | `text-xs tracking-wide` |
| **Code M** | 14px / 0.875rem| Regular (400) | 1.5 | 0em | `text-sm font-mono` |

#### 4.1.2.3 特定内容排版规则

**1. UI 控件 (UI Controls)**

  * 按钮、输入框、下拉菜单主要使用 `Body S` (14px)，以保持界面的紧凑性。

**2. 生成的报告内容 (Markdown/LaTeX Rendering)**

  * **技术基础:** `Tiptap/Novel`, `react-markdown`, `@tailwindcss/typography` (prose)。
  * **基础字体:** `Body M` (16px)，行高 1.7。
  * **定制化:** 必须定制 `prose` 样式以适应全局字体和色彩主题（特别是深色模式 `prose-invert`）。
  * **数学公式 (KaTeX):** 确保 KaTeX 渲染的字体大小与周围文本协调一致。

**3. 代码块 (Code Blocks)**

  * **字体:** Geist Mono, `Code M` (14px)。
  * **主题:** 使用与全局主题匹配的代码高亮主题（例如，Dracula 或 Monokai Pro）。

-----

### 4.1.3 空间系统（网格、间距与响应式）(Spatial System - Grid, Spacing, and Responsiveness)

#### 4.1.3.1 网格系统 (Grid System)

  * **基线单位 (Baseline Unit): 4px.** 所有间距、尺寸和排版都应是 4px 的倍数，以确保视觉上的秩序和一致性。
  * **布局网格 (Layout Grid):** 采用标准的 12 列网格系统进行宏观布局划分。

#### 4.1.3.2 间距规范 (Spacing Scale)

使用 Tailwind CSS 的默认间距刻度，并明确其应用规范。

| Tailwind Utility | Size (px/rem) | 应用场景示例 |
| :--- | :--- | :--- |
| `space-1` | 4px / 0.25rem | 微调，图标与文本之间。 |
| `space-2` | 8px / 0.5rem | 组件内部填充，紧凑列表项间距。 |
| `space-3` | 12px / 0.75rem | 表单元素间距，相关元素组之间。 |
| `space-4` (Base) | 16px / 1rem | 标准间距。组件之间，内容块之间。 |
| `space-6` | 24px / 1.5rem | 区域划分，页面边缘填充。 |
| `space-8` | 32px / 2rem | 主要内容区域之间的分隔。 |
| `space-12` | 48px / 3rem | 大型布局分隔。 |

#### 4.1.3.3 响应式设计 (Responsiveness)

  * **设计策略:** **Desktop-First (桌面优先)**。平台的核心体验是为桌面环境优化的。
  * **断点定义 (Breakpoints):** 使用 Tailwind CSS 默认断点。

| 断点 | 尺寸 | 设计考量 |
| :--- | :--- | :--- |
| `sm`, `md` | \< 1024px | 移动/平板设备。支持基本浏览和管理功能。布局堆叠为单列。复杂操作（如工作流编辑）可能受限。 |
| **`lg`** | **≥ 1024px** | **最小推荐尺寸。** 支持完整功能体验。“画布+检查器”布局开始可用。 |
| `xl` | ≥ 1280px | 理想桌面尺寸。信息密度和空间感达到平衡。 |
| `2xl`| ≥ 1536px | 超宽屏。提供更宽阔的画布视野。 |

  * **布局适应规则:** 在 `< lg` 断点下，工作流执行视图的检查器面板应从右侧固定布局变为覆盖在画布上方的模态抽屉 (`Shadcn Drawer`)。

-----

### 4.1.4 视觉质感定义 (Visual Texture Definition - Shadow, Radius, Effects)

#### 4.1.4.1 空间与层级 (Shadow and Elevation)

定义阴影系统以构建界面的深度和层级关系。

**高程策略:**

  * **Light Mode (阴影主导):** 使用柔和、清晰的阴影来表示层级。
  * **Dark Mode (亮度与边框主导):** 避免使用强烈的阴影。层级主要通过背景亮度的细微差异（参考 4.1.1）和微妙的边框 (`--border`) 来体现。

**阴影 Tokens (Tailwind Shadows):**

| Token/Utility | 用途 | 描述 |
| :--- | :--- | :--- |
| `shadow-sm` | 悬停状态，低层级元素（如按钮）。 | 非常微妙的短距离阴影。 |
| `shadow-md` | 中层级元素（卡片默认状态）。 | 清晰但柔和的阴影。 |
| `shadow-lg` | 高层级元素（下拉菜单、Tooltip）。 | 较高的高程，表示元素浮动在界面之上。 |
| `shadow-xl` | 最高层级（模态框 `Dialog`）。 | 显著的高程，表示焦点所在的核心交互层。 |

#### 4.1.4.2 形状与边界 (Radius)

倾向于使用更小、更锐利的圆角，以体现精确感和秩序感，避免过度圆润。

**圆角 Tokens (Tailwind Border Radius):**

| Token/Utility | Size (px/rem) | 应用场景 |
| :--- | :--- | :--- |
| `rounded-sm` | 2px / 0.125rem | 极小元素（如 `Badge`, Checkbox）。 |
| `rounded` | 4px / 0.25rem | 按钮、输入框。 |
| `rounded-md` | 6px / 0.375rem | **（基准）** 卡片、工具提示、下拉菜单。 |
| `rounded-lg` | 8px / 0.5rem | 模态框、大型容器。 |

*注：全局 CSS 变量 `--radius` 应设置为 `0.375rem` (6px) 以应用此基准。*

#### 4.1.4.3 视觉效果 (Visual Effects)

运用高级视觉效果来增强现代感和科技感，但必须保持克制和高性能。

**1. 透明度与模糊 (Opacity and Blur)**

  * **毛玻璃效果 (Backdrop Blur):** 用于模态框的背景遮罩 (`backdrop-blur-sm`)，以及导航栏或工具栏的背景，营造空间感。

**2. 动态光效 (Dynamic Effects - Magic UI Integration)**

利用 `Magic UI` 组件库提供精致的动态效果，服务于功能。

  * **`BorderBeam` / 动态光环:**
      * **应用场景:** 用于工作流画布中处于 `Executing` 状态的节点边缘，可视化正在进行的活动。
      * **参数:** 速度适中，颜色使用主色 (`--primary`)。
  * **`ShineBorder` / 闪亮边框:**
      * **应用场景:** 用于关键容器（如选中的 HITL 候选方案卡片）的悬停或激活状态，提供精致的反馈。

-----

### 4.2.1 动效原则与编排 (Motion Principles and Choreography)

动效系统旨在将复杂的工作流管理转化为直观、流畅的交互过程，提升用户对系统的理解力和掌控感。

#### 4.2.1.1 动效哲学与目标 (Motion Philosophy and Goals)

**哲学：动效服务于功能 (Motion Serves Function).**

动效绝非装饰，而是传达信息和增强交互的工具。

**核心目标:**

1.  **可视化复杂性:** 清晰地展现状态变迁、数据流动和工作流结构的动态变化。
2.  **引导注意力:** 在关键时刻将用户的焦点引导到需要操作的区域。
3.  **建立空间模型:** 通过转场动画帮助用户在复杂的界面中保持方向感。
4.  **提升响应感:** 提供即时、流畅的反馈，使界面感觉更加灵敏和高效。

#### 4.2.1.2 物理模型与调性 (Physical Model and Tone)

**调性：快速、精确、受控 (Fast, Precise, Controlled).**

  * **速度 (Speed):** 动效应迅速完成，以匹配专家用户的操作速度。界面不应让用户等待动画。
  * **精确性 (Precision):** 运动轨迹清晰、直接。**避免**使用弹跳 (Bounce) 或过度拉伸 (Overshoot) 效果。
  * **受控性 (Control):** 运动应精确地开始和停止，体现出工程化的质感。

#### 4.2.1.3 编排原则 (Choreography Principles)

  * **技术基础:** `Framer Motion`。

**1. 布局动画 (Layout Animations)**

  * 当元素的位置或尺寸发生变化时（例如，展开/折叠面板，工作流结构更新），使用 `Framer Motion` 的 `layout` 属性实现平滑的过渡，保持上下文的连贯性。

**2. 进入与退出 (Enter and Exit)**

  * 使用 `<AnimatePresence>` 管理。
  * 元素出现时，使用淡入 (Fade In) 结合轻微的缩放 (Scale) 或位移 (Translate)。进入动画通常比退出动画稍慢。

**3. 时序与交错 (Timing and Staggering)**

  * 当多个元素同时出现时（如列表加载、新节点生成），使用交错动画 (Staggering) 来引导视线，使加载过程更自然有序。

**4. 状态可视化 (State Visualization)**

  * 节点状态的变化应通过颜色、图标和动态效果的组合动画来平滑过渡。

#### 4.2.1.4 性能与可访问性 (Performance and Accessibility)

  * **性能优先:** 优先使用 GPU 加速的 CSS 属性（Transform, Opacity）。
  * **尊重用户偏好:** 必须检测并响应 `prefers-reduced-motion` 设置。当开启时，复杂的动效应被替换为简单的淡入淡出或无动画。

-----

### 4.2.2 动效参数定义 (Motion Parameters - Easing and Duration Tokens)

#### 4.2.2.1 持续时间 (Duration)

定义一套标准化的持续时间等级。

| Token Name | Duration (s) | 应用场景描述 |
| :--- | :--- | :--- |
| `duration.micro` | 0.1s (100ms) | 极快的微交互（按钮点击反馈、开关切换）。 |
| `duration.fast` | 0.2s (200ms) | **（标准）** 默认交互时间。元素淡入淡出、下拉菜单展开。 |
| `duration.medium` | 0.3s (300ms) | 复杂转场：侧边栏滑入、模态框出现。 |
| `duration.slow` | 0.5s (500ms) | 复杂的编排动画或布局变化（如工作流布局重排）。 |

#### 4.2.2.2 缓动曲线 (Easing Curves)

定义一套标准化的缓动曲线（cubic-bezier 参数）。

| Token Name | Cubic Bezier | 描述与应用场景 |
| :--- | :--- | :--- |
| `easing.standard` | `[0.4, 0, 0.2, 1]` | **（标准曲线 Ease-in-out）** 平衡、响应迅速。适用于大多数通用场景。 |
| `easing.decelerate`| `[0, 0, 0.2, 1]` | **（减速曲线 Ease-out）** 快速启动，平滑停止。用于元素进入屏幕。 |
| `easing.accelerate`| `[0.4, 0, 1, 1]` | **（加速曲线 Ease-in）** 缓慢启动，快速结束。用于元素离开屏幕。 |
| `easing.sharp` | `[0.6, 0.05, 0.1, 0.95]`| **（锐利曲线）** 强调动效的开始和结束，用于需要高度精确感的场景。 |

#### 4.2.2.3 Token 化结构 (Tokenization)

动效参数定义为 TypeScript 常量，供 `Framer Motion` 直接消费。

```typescript
// src/styles/motion-tokens.ts

export const MotionDurations = {
  micro: 0.1,
  fast: 0.2,
  medium: 0.3,
  slow: 0.5,
};

export const MotionEasings = {
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  sharp: [0.6, 0.05, 0.1, 0.95],
};

// 预设的 Framer Motion Transition 对象
export const Transitions = {
  standard: {
    duration: MotionDurations.fast,
    ease: MotionEasings.standard,
  },
  enter: {
    duration: MotionDurations.medium,
    ease: MotionEasings.decelerate,
  },
  exit: {
    duration: MotionDurations.fast,
    ease: MotionEasings.accelerate,
  },
  layout: {
    // 使用 tween 处理布局动画，更精确
    type: "tween",
    duration: MotionDurations.medium,
    ease: MotionEasings.sharp,
  }
};
```

-----

### 4.3 核心 UI 组件库规范 (Core UI Component Library Specification)

本文档生成了可复用 UI 组件的详细设计规范说明。规范基于 `Shadcn/ui` 和 `Radix UI`，并集成了 `React Flow`, `Tiptap/Novel`, 和 `Magic UI` 等复杂组件。

#### 4.3.1 基础 UI 组件规范 (Base UI Components - Shadcn/ui)

##### 1\. 按钮 (Button)

  * **视觉属性:** 圆角 `rounded-md` (6px)。字体 `text-sm`, SemiBold。
  * **变体 (Variants):** 严格遵循 4.1.1 的色彩 Token (`Primary`, `Secondary`, `Destructive`, `Outline`, `Ghost`, `Link`)。
  * **交互状态与微交互:**
      * `Hover`: 背景色轻微变化。
      * `Focus`: 必须显示清晰的焦点环 (`--ring`)。
      * `Active` (Pressed): 使用 `Framer Motion` 实现轻微下压效果（`scale: 0.98`），动画使用 `duration.micro`。
      * `Disabled`: 透明度 50%。

##### 2\. 输入控件 (Input, Textarea, Select)

  * **视觉属性:** 圆角 `rounded-md` (6px)。边框 `--input`。
  * **交互状态:**
      * `Focus`: 边框颜色变为 `--primary`（可选），并显示焦点环 (`--ring`)。
      * `Error`: 边框颜色变为 `--destructive`。

##### 3\. 卡片 (Card)

  * **视觉属性:** 背景 `--card`。圆角 `rounded-lg` (8px)。阴影 `shadow-md`。边框 `--border`。

##### 4\. 模态框与对话框 (Dialog, AlertDialog)

  * **视觉属性:** 圆角 `rounded-lg` (8px)。阴影 `shadow-xl`。
  * **背景遮罩:** `bg-background/80`, `backdrop-blur-sm`。
  * **动效:** 进入时从中心淡入并轻微放大。使用 `Transitions.enter`。

##### 5\. 徽章 (Badge)

  * **用途:** 显示状态标签。
  * **视觉属性:** 圆角 `rounded-sm` (2px)。字体 `text-xs`, SemiBold。
  * **变体:** 定制以支持所有语义色彩（Success, Warning, Error）。

#### 4.3.2 平台特定复杂组件规范 (Platform-Specific Complex Components)

##### 1\. 工作流节点卡片 (Workflow Node Card - React Flow Custom Node)

  * **技术基础:** `React Flow` Custom Node, 基于 `Card`。
  * **视觉属性:** 圆角 `rounded-md` (6px)。
  * **结构:** 包含状态图标、节点名称、ID 和陈旧性指示器。
  * **状态可视化 (关键):** 必须严格遵循 3.1.2.1 的规范。
      * **`Executing`:**
          * 状态图标动画化（旋转 `Loader`）。
          * **（核心效果）** 应用 `Magic UI BorderBeam` 动态光环效果于卡片边缘。颜色使用 `--primary`，速度适中（例如 `duration={5}`）。
      * **`Awaiting HITL`:** 使用 Warning 色彩，图标可能有微妙脉动效果。
      * **`Stale`:** 显示醒目的警告图标。
  * **交互状态:**
      * **Hover:** 阴影提升至 `shadow-lg`。
      * **Selected (Focused):** 边框高亮为 `--primary`，并显示焦点环。

##### 2\. 富文本/LaTeX 编辑器 (Tiptap/Novel Editor)

  * **视觉定制:** Novel 的默认样式需要定制以符合设计系统。
      * **字体与排版:** 继承全局字体 (Geist) 和排版规则 (4.1.2)。
      * **工具栏:** 使用 `Shadcn/ui` 的 `ToggleGroup` 和 `Button` (Ghost variant)。背景为 `--popover`。
  * **Ask AI 集成:**
      * 斜杠命令 (`/`) 和 `@mention` 菜单使用 `cmdk` 和 `Tippy.js` 实现，视觉风格与 `DropdownMenu` 保持一致。

##### 3\. HITL 交互组件 (HITL Interaction Components)

**A. SCA 方案选择器 (SCA Candidate Selector)**

  * **结构:** `RadioGroup` 或带复选框的列表。
  * **方案卡片:** 使用定制的 `Card`。选中时卡片边框加粗并变为 `--primary`。可应用 `Magic UI ShineBorder` 增强选中状态的视觉效果。

**B. AVL 裁决列表 (AVL Adjudication List)**

  * **结构:** 列表项包含批判内容和裁决控件（按钮组 "Accept"/"Reject"）。
  * **状态:** 已裁决的项应在视觉上明确标记（例如，左侧边框显示裁决颜色：Success 或 Destructive）。未裁决项应有视觉提示。

---

## 阶段 5：详尽规范与交付整合 (Phase 5: Detailed Specification & Handoff Consolidation)

本文档是 O-Award 建模平台设计规范的最终阶段，提供了关键屏幕的高保真文本描述和复杂动效的精确规范。它整合了前序阶段的设计决策，作为前端实现的“单一事实来源 (Single Source of Truth)”。

### 5.1 高保真页面描述（文本描述）(High-Fidelity Page Descriptions - Textual Description)

本节将线框图结构（3.2.2）与设计系统（4.1-4.3）相结合，生成关键屏幕的详细文本描述。所有描述均基于默认的深色模式（Dark Mode），并使用 `Tailwind CSS` 工具类、`Shadcn/ui` 组件和已定义的设计 Tokens。

#### 5.1.1 屏幕一：项目管理仪表板 (Project Management Dashboard)

  * **路由:** `/projects`
  * **布局模板:** 模板一 (标准列表/仪表板布局)。
  * **美学基调:** 简洁、高效、信息清晰。

**结构与样式描述:**

**[容器 (Container)]**

  * 背景色：`bg-background` (Deep Blue-Black)。
  * 布局：标准内容容器，`max-w-7xl mx-auto p-8`。

**[A] 页面头部 (Page Header)**

  * 布局：`flex justify-between items-center mb-8`.
  * **[A.1] 标题:**
      * 文本："Projects".
      * 排版：H2 (`text-3xl font-semibold tracking-tight`).
      * 颜色：`text-foreground` (Off White).
  * **[A.2] 新建项目按钮:**
      * 组件：`<Button variant="primary">`.
      * 内容：`+ New Project`.
      * 样式：`rounded-md` (6px). 主色背景 (`bg-primary`).

**[B] 筛选与搜索栏 (Filter and Search Bar)**

  * 布局：`flex justify-between items-center mb-6`.
  * **[B.1] 搜索框:**
      * 组件：`<Input placeholder="Search projects...">`.
      * 样式：`w-full md:w-1/3`. `bg-card`, `border-input`.
  * **[B.2] 筛选器:**
      * 组件：`<Select>` (Status, Type).
      * 布局：`flex gap-4`.

**[C] 项目列表 (Project List)**

  * 组件：`<Table>` 包装在 `<Card>` 中。
  * 卡片样式：`bg-card`, `rounded-lg` (8px), `shadow-md`, `border-border`.
  * **[C.1] 表头 (Table Head):**
      * 样式：`text-sm font-medium text-muted-foreground`. 边框底部 `border-b border-border`.
  * **[C.2] 表格行 (Table Row):**
      * 交互：整行可点击导航至项目工作区。悬停时高亮 `hover:bg-accent/50`.
      * **列 1: Name:**
          * 排版：`text-base font-medium text-foreground`.
      * **列 2: Status:**
          * 组件：`<Badge>`.
          * 样式：根据状态应用语义色彩。`Running` 使用 `--primary`，`Completed` 使用 `--success`。
      * **列 3: Type & Last Updated:**
          * 排版：`text-sm text-muted-foreground`.
      * **列 5: Actions:**
          * 组件：`<DropdownMenu>` 触发器为 `<Button variant="ghost" size="icon">` 包含 `MoreHorizontal` 图标。

-----

#### 5.1.2 屏幕二：工作流执行视图 (Workflow Execution View)

  * **路由:** `/projects/{project_id}`
  * **布局模板:** 模板二 (沉浸式工作区布局)。
  * **美学基调:** 高度沉浸、精密、动态。体现“数字实验室”的氛围。

**结构与样式描述:**

**[全局容器 (Global Container)]**

  * 布局：`flex flex-col h-screen bg-background`. 确保占据整个视口高度。

**[A] 项目控制栏 (Project Control Bar)**

  * 布局：`flex justify-between items-center p-4 border-b border-border`. 高度固定。
  * 背景：`bg-card` (比全局背景稍亮，构建层级)。
  * **[A.1] 左侧：上下文信息:** 面包屑和项目状态 `<Badge>`.
  * **[A.2] 右侧：全局操作:** 按钮 "Export Project".

**[B] 工作区容器 (Workspace Container)**

  * 布局：`flex flex-1 overflow-hidden`. 占据剩余所有高度。

**[B.1] 工作流画布区 (Workflow Canvas Area - React Flow)**

  * 布局：`flex-1 relative`.
  * **背景:** `bg-background`. 使用 `React Flow Background` 组件实现点状网格 (`BackgroundVariant.Dots`, color 调整为 `text-muted/20`)。
  * **控件:** `React Flow Controls` 和 `MiniMap` 位于右下角。
  * **节点渲染 (关键 - 详见 5.1.2.1):** 使用自定义节点组件。

**[B.2] 节点检查器面板 (Node Inspector Panel)**

  * 布局：`w-96 lg:w-[480px] flex flex-col border-l border-border overflow-y-auto`. 固定在右侧。

  * 背景：`bg-card`.

  * **(注):** B.1 和 B.2 之间应实现可拖拽分隔器。

    **[B.2.1] 面板头部 (Panel Header):**

      * 布局：`p-4 border-b`.
      * 内容：选中节点的名称 (H4: `text-xl font-semibold`) 和当前状态 `<Badge>`.

    **[B.2.2] 标签页导航 (Tabs Navigation):**

      * 组件：`<Tabs>`.
      * Tabs: "Results & Actions", "History", "Dependencies".

    **[B.2.3] 标签页内容 (Tabs Content):**

      * 布局：`p-4`.
      * **Tab 1: Results & Actions (动态内容):**
          * **陈旧性警告 (If Stale):** 如果节点陈旧，顶部显示 `<Alert variant="warning">`。文案遵循 3.3.4。
          * **`Completed` 状态:** 显示操作工具栏（Edit, Re-execute）和输出工件（Markdown 渲染）。
          * **`Awaiting HITL` 状态:** （详见 5.1.3）。布局切换为支持底部固定操作栏。
          * **`Executing` 状态:** 居中显示旋转 `Loader` 图标和 `current_stage` 文本。
          * **`Failed` 状态:** 显示错误摘要 `<Alert variant="destructive">` 和详细错误日志（Code block）。底部显示 "Retry" 按钮。

##### 5.1.2.1 详述：工作流节点卡片高保真设计 (Workflow Node Card High-Fidelity)

  * **基础结构 (Base Structure):**

      * 样式：`rounded-md` (6px), `shadow-md`, `border`. 宽度固定（例如 `w-64`）。
      * 背景：`bg-card`.

  * **内容布局:** `p-3 flex items-center gap-3`.

      * **[1] 状态图标:** 尺寸 `w-6 h-6`.
      * **[2] 节点信息:** 名称（`text-sm font-medium`）和 ID（`text-xs font-mono`）。

  * **交互状态样式 (Interaction States):**

      * **Hover:** 阴影提升 `shadow-lg`. 边框 `border-accent`.
      * **Selected (Focused):** 边框加粗 `border-2 border-primary`. 显示焦点环 `ring-2 ring-ring`.

  * **节点状态样式 (Node Status Styling):**

      * **`Executing` (核心动态效果):**

          * 图标：蓝色旋转 Loader。
          * **动态光环:** 应用 `<Magic UI BorderBeam>`.
          * 参数：`colorFrom="#1e40af"`, `colorTo="#3b82f6"`, `duration={5}`。
          * 确保 `BorderBeam` 覆盖在默认边框之上。

      * **`Awaiting HITL Approval` (吸引注意):**

          * 图标：黄色 UserCheck。
          * 边框：使用警告色 `border-warning`.
          * 动画：图标可应用微妙的脉动效果（使用 `Framer Motion`）。

      * **`Stale` (陈旧性指示):**

          * 位置：在节点卡片的右上角叠加一个小的警告图标。
          * 图标：`AlertTriangle`. 颜色：`text-warning`.
          * **(注):** 陈旧性是叠加状态。

-----

#### 5.1.3 屏幕三：HITL 交互界面 (HITL Interaction Interface)

  * **位置:** 嵌入在节点检查器面板 [B.2.3] 中。

##### 5.1.3.1 界面 A: SCA (战略选择架构) 模式

**[布局容器]**

  * 布局：`flex flex-col h-full`.

**[A] HITL 内容区 (Scrollable)**

  * 布局：`flex-1 overflow-y-auto p-4`.

      * **[A.1] AI 比较分析区:**

          * 组件：`<Card>` (背景 `bg-muted`). `mb-6`.
          * 标题："Comparative Analysis".
          * 内容：使用 `prose prose-invert` 渲染分析报告。

      * **[A.2] 候选方案列表:**

          * 组件：`<RadioGroup>` 或带复选框的列表。
          * **方案卡片 (Candidate Card):**
              * 交互：点击卡片即选中。
              * **选中状态 (Selected):**
                  * 边框：`border-2 border-primary`.
                  * 视觉增强：应用 `<Magic UI ShineBorder>`，提供光泽流动效果。

**[B] HITL 操作栏 (Fixed Footer)**

  * 布局：`p-4 border-t border-border mt-auto flex justify-end gap-4`. 固定在底部。
  * 背景：`bg-card`.
  * 按钮："Discard" (`Destructive Outline`), "Reject & Modify" (`Secondary`), "Approve & Continue" (`Primary`, 选中后激活)。

##### 5.1.3.2 界面 B: AVL (对抗性验证循环) 模式

**[A] HITL 内容区 (Scrollable)**

```
*   **[A.1] 待验证内容区:** 只读模式渲染核心输出。
*   **[A.2] 对抗性批判列表:**
    *   **批判项 (Critique Item):**
        *   布局：`border-b py-4`.
        *   内容：批判意见和建议修改。
        *   **裁决控件:** 按钮组 "Accept" / "Reject"。裁决后显示结果颜色。
```

**[B] HITL 操作栏 (Fixed Footer)**

  * 主按钮："Submit Adjudication" (完成所有裁决后激活)。

-----

#### 5.1.4 屏幕四：工件编辑视图 (Artifact Editing View)

  * **位置:** 嵌入在节点检查器面板 [B.2.3] 中（当激活编辑模式时）。

**[A] 编辑器主体 (Editor Body)**

  * 布局：`flex-1 overflow-y-auto`.
  * 组件：`Tiptap/Novel` 编辑器实例。
  * **样式定制:**
      * 工具栏背景 `--popover`, `shadow-lg`, `rounded-md`.
      * 排版遵循 4.1.2.3。字体 Geist Sans。
      * Ask AI 菜单 (`cmdk`) 视觉风格与 `Shadcn Command` 一致。

**[B] 编辑操作栏 (Fixed Footer)**

  * 布局：`p-4 border-t border-border mt-auto flex justify-end gap-4`.
  * 按钮："Cancel" (`Secondary`), "Save & Activate" (`Primary`).
  * **保存对话框:** 点击保存后弹出 `Dialog`，要求输入“版本摘要 (Summary)” (`Textarea`)。

-----

### 5.2 复杂动效与转场规范详述 (Complex Motion and Transition Specifications)

本节提供了关键场景中复杂动画和转场效果的精确定义和参数化逻辑。所有实现均基于 `Framer Motion`，并引用 4.2.2 中定义的动效 Tokens。

#### 5.2.1 场景一：工作流执行过程的可视化

**目标:** 清晰、动态地可视化节点状态的变化。

**1. 节点状态转换动画 (Node State Transition)**

  * **实现方式:** 使用 `Framer Motion` 的 `animate` 属性进行属性过渡。

  * **具体动效:**

      * **`Executing` 开始:**
          * 图标平滑过渡到旋转的 `Loader`。
          * `<Magic UI BorderBeam>` 动态光环效果淡入激活。参数：淡入使用 `duration.medium`。
      * **`Executing` 结束:**
          * `BorderBeam` 效果淡出。
          * 图标平滑过渡到新状态图标。
      * **`Awaiting HITL Approval` 开始:**
          * 图标过渡到 `--warning` 色。
          * 图标激活微妙的脉动效果（使用 `Framer Motion` 控制透明度循环变化）。参数：持续时间 `1.5s`, 缓动 `easing.standard`, 循环播放。

-----

#### 5.2.2 场景二：工作流结构的动态更新（Generator 节点）

**目标:** 当工作流结构变化时，提供平滑、可理解的视觉过渡。

**编排逻辑:**

1.  **[系统] 计算新布局:** 使用布局算法（如 Dagre）计算新坐标。
2.  **[动效] 布局调整动画 (Layout Animation):**
      * **目标:** 现有节点平滑移动到新位置。
      * **实现:** 在自定义节点组件中使用 `Framer Motion` 的 `layout` 属性。
      * **参数:** 使用 `Transitions.layout` (`type: "tween", duration: 0.3s, ease: MotionEasings.sharp`)。
3.  **[动效] 新节点进入动画 (Enter Animation):**
      * **目标:** 新生成的节点链有序地出现。
      * **实现:** 使用 `Framer Motion` 的 `variants` 和 `staggerChildren`。
      * **效果:** 淡入结合轻微的自下而上移动 (`opacity: 0, y: 20px -> opacity: 1, y: 0`)。
      * **参数:** 交错间隔 `staggerChildren: 0.05s`。单个节点动画使用 `Transitions.enter`。

-----

#### 5.2.3 场景三：HITL 交互反馈循环

**目标:** 提供流畅的反馈，清晰地传达 HITL 循环的状态。

**1. 提交反馈并等待重新执行**

  * **触发条件:** 用户点击“Reject & Modify”并提交。
  * **编排:**
    1.  **[即时反馈]** 提交按钮显示加载状态。
    2.  **[转场] 内容区域切换:** HITL 界面平滑过渡到“执行中”状态视图。
    <!-- end list -->
      * **实现:** 使用 `<AnimatePresence mode="wait">` 包裹内容区域。
      * **效果:** HITL 界面淡出，执行中视图淡入。
      * **参数:** `Transitions.standard`.

**2. 新结果呈现**

  * **编排:** 与上述过程相反。“执行中”视图淡出，新的 HITL 界面淡入。

-----

#### 5.2.4 场景四：工作区内的上下文切换

**1. 切换焦点节点 (Switching Focused Node)**

  * **触发条件:** 用户点击画布上的另一个节点。
  * **效果:** 检查器面板内容快速切换。
      * **实现:** 使用 `<AnimatePresence mode="wait">` 包裹检查器面板的内容区，以 `selectedNodeId` 作为 `key`。
      * **参数:** 使用 `duration.fast` (0.2s)。`Transitions.standard`.

**2. 展开/折叠检查器面板**

  * **实现:** 使用 `Framer Motion` 的 `layout` 动画处理宽度变化。
  * **效果:** 面板平滑地滑入或滑出屏幕右侧。画布区域同时平滑地调整宽度。
  * **参数:** `Transitions.layout`.

-----

### 5.3 设计规范整合文档 (Consolidated Design Handoff Document)

本文档是 O-Award 建模平台前端实现的**单一事实来源 (Single Source of Truth)**。它整合了从需求分析到详细设计的所有关键规范。

#### 5.3.1 引言与设计哲学 (Introduction and Design Philosophy)

**1. 体验愿景 (1.3.1): 赋能思想的精确执行 (Empowering Precision Execution of Thought).**

**2. 交互哲学 (1.3.2):**

  * **用户主权与显式意图:** 系统永不自作主张（静默状态管理）。
  * **复杂性可视化:** 将抽象概念（版本、依赖、陈旧性）具象化。

**3. 美学基调 (1.3.3): 精密未来主义 (Precision Futurism).**

  * 深色优先、秩序感、科技感。

#### 5.3.2 设计系统 (Design System - Phase 4)

所有实现必须严格使用定义的 Design Tokens。

##### 1\. 色彩系统 (4.1.1)

  * **主题策略:** 深色模式优先。使用 CSS 变量实现。（详见 4.1.1.3 的 CSS 定义）。

##### 2\. 字体与排版 (4.1.2)

  * **字体:** Geist Sans (主字体), Geist Mono (等宽)。
  * **排版等级:** H1-H4, Body M (16px Base), Body S (14px UI)。（详见 4.1.2.2）。

##### 3\. 空间系统 (4.1.3)

  * **基线单位:** 4px。
  * **响应式:** Desktop-First。`lg` (1024px) 为最小推荐尺寸。

##### 4\. 视觉质感 (4.1.4)

  * **圆角:** 基准 `--radius: 0.375rem` (6px, `rounded-md`)。
  * **效果:** `Magic UI` (BorderBeam, ShineBorder) 用于动态光效。

##### 5\. 动效系统 (4.2)

  * **原则 (4.2.1):** 快速、精确、受控。
  * **参数 (4.2.2):** 定义了持续时间和缓动曲线 Tokens（TypeScript 实现）。

#### 5.3.3 组件库规范 (Component Library Specifications - 4.3)

基于 `Shadcn/ui` 和 `Radix UI`。

##### 1\. 基础 UI 组件 (4.3.1)

  * 规范了 Button, Input, Card, Dialog, Badge 等组件的视觉属性和交互状态。

##### 2\. 平台特定复杂组件 (4.3.2)

  * **工作流节点卡片 (React Flow Custom Node):** 核心组件，精确实现不同状态（特别是 `Executing` 状态的 `BorderBeam`）。
  * **富文本/LaTeX 编辑器 (Tiptap/Novel):** 定制样式，集成 Ask AI 功能。
  * **HITL 交互组件:** SCA 方案选择器和 AVL 裁决列表。

#### 5.3.4 信息架构与布局模板 (Information Architecture and Layouts)

##### 1\. 信息架构 (2.2)

  * 主要视图：项目仪表板、项目工作区（配置视图 vs. 执行视图）、用户设置中心。

##### 2\. 布局模板 (3.2.1)

  * **模板二：沉浸式工作区布局 (Canvas + Inspector).** 核心工作区布局。

#### 5.3.5 高保真屏幕实现指南 (High-Fidelity Implementation Guide - 5.1)

提供了关键页面的实现级详细描述。（详见 5.1.1 - 5.1.4）。

#### 5.3.6 交互与动效设计 (Interaction and Motion Design)

##### 1\. 全局交互模式 (3.1.1)

  * 定义了工作流导航（回溯）、HITL 流程、版本切换和人工编辑的标准交互流程。

##### 2\. 系统反馈与状态管理逻辑 (3.1.2)

  * **节点状态可视化规范。**
  * **陈旧性 (Staleness) 提示规范:** 非侵入式提示（画布图标+检查器 Alert）。

##### 3\. 复杂动效与转场规范 (5.2)

定义了关键场景的动画编排和参数（基于 `Framer Motion`）。

  * **场景一：工作流执行可视化:** 节点状态转换动画。
  * **场景二：动态结构更新:** 布局动画 + 新节点交错进入动画。
  * **场景三：HITL 反馈循环:** 内容区域平滑转场。
  * **场景四：上下文切换:** 检查器面板内容快速切换动画。

#### 5.3.7 UX 文案指南 (UX Writing Guidelines - 3.3)

  * **品牌声音:** 精密、专业、赋能。
  * **术语标准化:** 定义了核心概念（Node, Version, Stale, Re-execute, Retry）的标准用词。
  * **特定场景范式:** 确认对话框（强调后果）、陈旧性提示和错误信息的文案编写范式。
