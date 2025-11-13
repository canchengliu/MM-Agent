## 需求背景
<background>

<Workflow>

## 阶段一：战略分析与宏观架构 (Strategic Analysis & Macro Architecture)

### 步骤 1.1：战略性问题分析与解决方案架构 (Strategic Problem Analysis and Solution Architecture)

#### 推理节点 (Reasoning Nodes)

**1.1.1 问题解构与数学化表述 (Problem Deconstruction and Mathematical Formulation)**

*   **核心目标:** 深度分析问题，将其转化为精确的、可量化的数学目标、指标、变量和约束。
*   **输入 (Input):**
    *   `原始赛题文本 (Problem Statement)`
    *   `所有提供的数据集 (All Provided Datasets)`
*   **输出 (Output):**
    *   `正式问题重述与全局假设框架 (Formal Problem Restatement and Global Assumption Framework)`: 定义了精确的建模目标、核心变量、成功指标，以及带论证的全局假设列表。

**1.1.2 架构设计与任务分解 (Architecture Design and Task Decomposition)**

*   **核心目标:** 基于数学化的问题表述，设计宏观解决方案架构，并将其分解为一系列逻辑上独立的子任务。
*   **输入 (Input):**
    *   `正式问题重述与全局假设框架 (from 1.1.1)`
*   **输出 (Output):**
    *   `结构化建模任务书 (Structured Modeling Taskbook)`: 包含一个有序的子任务列表（Task 1, Task 2, ...），每个任务都定义了具体目标、建议方法论类别和预期的 I/O 接口。

-----

## 阶段二：循环子问题建模与执行（Cyclic Sub-problem Execution）

**(注：步骤 2.1 和 2.2 针对 `结构化建模任务书` 中的每一个子任务 Task $i$ 循环执行)**

### 步骤 2.1：模型设计、论证与数学构建 (Model Design, Justification, and Mathematical Formulation)

#### 推理节点 (Reasoning Nodes)

**2.1.1 (Task $i$) 数据洞察与候选模型生成 (Data Insights and Candidate Model Generation)**

*   **核心目标:** 针对 Task $i$，通过数据分析生成多个可行的建模方案，并进行批判性评估。
*   **输入 (Input):**
    *   `正式问题重述与全局假设框架 (from 1.1.1)`
    *   `结构化建模任务书 (Task i 定义) (from 1.1.2)`
    *   `前序任务关键输出 (Key Outputs from Tasks 1 to i-1)`
    *   `相关数据集 (Relevant Datasets)`
*   **输出 (Output):**
    *   `候选模型比较与论证报告 (Candidate Model Comparison and Justification Report)`: 包含多个备选方案及其优劣分析，**等待人类选择一个偏好的方案**。

**2.1.2 (Task $i$) 数学表述与计算设计 (Mathematical Formulation and Computational Design)**

*   **核心目标:** 将人类选定的模型方案转化为精确的数学语言和可执行的计算蓝图。
*   **输入 (Input):**
    *   `候选模型比较与论证报告 (from 2.1.1)`
    *   `人类选择的偏好模型方案 (Human-selected Preferred Model)`
*   **输出 (Output):**
    *   `Task i 结构化数学模型表述 (Structured Mathematical Formulation for Task i)`: 包含精确的数学公式、符号定义及其现实意义解释。
    *   `Task i 计算执行蓝图 (Computational Execution Blueprint for Task i)`: 包含具体的算法、参数校准协议和验证（V&V）计划。

-----

### 步骤 2.2：计算执行、深度分析与可视化 (Computational Execution, Analysis, and Visualization)

#### 推理节点 (Reasoning Nodes)

**2.2.1 (Task $i$) 代码生成与自动执行 (Code Generation and Automatic Execution)**

*   **核心目标:** 执行计算蓝图，生成原始模型结果。
*   **输入 (Input):**
    *   `Task i 结构化数学模型表述 (from 2.1.2)`
    *   `Task i 计算执行蓝图 (from 2.1.2)`
*   **输出 (Output):**
    *   `原始计算结果、V&V测试与灵敏度分析数据 (Raw Computational Results, V&V Test Data, and Sensitivity Analysis Data)`

**2.2.2 (Task $i$) 鲁棒性分析与战略性可视化 (Robustness Analysis and Strategic Visualization)**

*   **核心目标:** 解读原始结果，评估模型鲁棒性，并通过可视化提炼核心洞察。
*   **输入 (Input):**
    *   `原始计算结果、V&V测试与灵敏度分析数据 (from 2.2.1)`
*   **输出 (Output):**
    *   `Task i 模型验证与灵敏度分析报告 (Model V&V and Sensitivity Analysis Report for Task i)`: 包含对模型鲁棒性的深度解读和置信声明。
    *   `Task i 候选可视化图表库 (Candidate Visualization Gallery for Task i)`: **等待人类选择多个偏好的图表**。
    *   `Task i 关键输出接口文档 (Key Output Interface Document for Task i)`: 精确定义的、供后续任务（如 Task $i+1$）使用的结构化输出。

-----

## 阶段三：全局综合与O奖级论文锻造（Global Synthesis & O-Award Paper Forging）

### 步骤 3.1：全局逻辑整合与专业文档撰写 (Global Logic Integration and Professional Documentation)

#### 推理节点 (Reasoning Nodes)

**3.1.1 全局逻辑整合与战略性叙事构建 (Global Logic Integration and Strategic Narrative Construction)**

*   **核心目标:** 将所有子任务的成果整合成一个连贯、有力的核心论点和叙事大纲。
*   **输入 (Input):**
    *   `正式问题重述与全局假设框架 (from 1.1.1)`
    *   `结构化建模任务书 (from 1.1.2)`
    *   `所有Task的模型验证与灵敏度分析报告 (All V&V and Sensitivity Analysis Reports from all 2.2.2 nodes)`
    *   `所有Task的关键输出接口文档 (All Key Output Interface Documents from all 2.2.2 nodes)`
    *   `人类从所有图表库中选择的偏好图表 (Human-selected Preferred Visualizations from all 2.2.2 nodes)`
*   **输出 (Output):**
    *   `论文核心论点与叙事大纲 (Paper's Thesis Statement and Narrative Outline)`
    *   `全局优缺点评估报告 (Global Strengths and Weaknesses Assessment Report)`

**3.1.2 论文锻造与专业优化 (Paper Forging and Professional Optimization)**

*   **核心目标:** 依据叙事大纲，撰写并润色成最终的出版级论文和相关文档。
*   **输入 (Input):**
    *   `论文核心论点与叙事大纲 (from 3.1.1)`
    *   `全局优缺点评估报告 (from 3.1.1)`
    *   **(以及 3.1.1 的所有输入，作为撰写的素材库)**
*   **输出 (Output):**
    *   `提交版论文 (Submission-Ready Paper)`
    *   `非技术性文档定稿 (Non-Technical Document Finalized)`

</Workflow>


<HITL_MODES>

### 人机协同交互模式 (HITL Interaction Patterns)

以下三种模式具备高度通用性和可组合性，按认知负荷和任务复杂性从低到高排列，可根据工作流不同环节的性质灵活嵌入。

#### 模式一：审查式批准/拒绝循环 (Vetted Approval/Rejection Loop - VARL)

*   **核心概念**: 对LLM生成的内容进行快速、低成本的初步筛选，由人类专家作为第一道“质量门”，拦截明显的逻辑或事实错误。
*   **交互机制（包含循环）**:
    1.  **LLM (Generator)**: 生成一个初步输出（如列表、概念草图、文本初稿）。
    2.  **Human (Vetter)**: 审查输出，并进行“批准”或“拒绝”的二元选择。
    3.  **LLM (Critic/Refiner)**: 若被拒绝，系统会提示人类输入修改意见。LLM 基于此反馈对输出进行修正。（VARL 循环中的迭代**必须**包含所有先前的 VARL 交互历史。）
    4.  **循环机制**: 经修正后重新提交给人类专家审核。如仍被拒绝，则重复 2-3 步骤，直到输出被批准为止。
*   **认知负荷管理**: **低**。将人类的精力集中在快速的判断和验证上。
*   **应用场景**:
    *   对信息抽取、初步分类或内容生成结果进行快速的“是否可用”判断。
    *   确认初步形成的假设或核心变量是否符合领域常识。
    *   对报告或简报的初稿进行全局性方向和逻辑的快速确认。

#### 模式二：战略选择架构 (Strategic Choice Architecture - SCA)

*   **核心概念**: 极好地利用LLM的广度探索可能性，利用人类的深度进行知情的战略选择，将复杂的开放式问题转化为结构化的决策问题。
*   **交互机制**:
    1.  **LLM (Generator)**: 针对特定任务，生成 N 个候选结果。
    2.  **LLM (Critic/Analyst)**: 对每个结果进行多维度比较分析。
    3.  **Human (Selector)**: 审阅结果和比较，点击选择一个或多个接受。
*   **认知负荷管理**: **低**。将人类负担从方案生成和分析转移到更高阶的判断和选择上。
*   **应用场景**:
    *   在多种候选方法论或技术框架之间进行最终选择。
    *   界定复杂问题的范围、边界和排除标准。
    *   选择最终输出的核心叙事结构或论证策略。
    *   确定总体研究范式或宏观架构设计。
    *   选择多个最优的可视化图表。

#### 模式三：对抗性验证循环 (Adversarial Validation Loop - AVL)

*   **核心概念**: 引入制度化的“红队”(Red Team)机制，对关键产出（如假设、结论）进行压力测试，主动寻找其逻辑漏洞和脆弱性，确保其鲁棒性。
*   **交互机制**:
    1.  **LLM (Generator)**: 生成高风险或高影响力的输出（如基础性假设框架、核心结论）。
    2.  **LLM (Adversarial Critic)**: 以系统化、专业化的身份对输出进行多维度批判性评审，明确列出具体风险、漏洞或潜在误区，并针对每一条提出建设性补充建议。
    3.  **Human (Adjudicator)**: 针对每条争议或批判逐项裁决（点击采纳或拒绝），可追加个人专业意见。
    5.  **LLM (Generator)**: 基于裁决结果，修订原始输出。
    6.  **迭代循环**: 若裁决后仍有新批判通过，则自动重返第2步，直至所有关键争议闭环解决。
*   **认知负荷管理**: **较高**。
*   **应用场景**:
    *   严格测试核心假设的论证强度和必要性。
    *   在最终确定前对核心结论进行深度批判性审查。
    *   评估提出解决方案的鲁棒性，并识别其在逻辑上的脆弱性。
    *   评估具有重大伦理或政策影响的输出。

</HITL_MODES>

**以下是回溯功能的设计，功能设计遵循简化原则，避免过度复杂的功能（不涉及任何节点拼接、分支管理、工作流级快照），以确保核心路径的健壮性和可预测性。**

<requirements>

### **系统需求规格说明书**

#### **1. 核心设计哲学与指导原则**

本系统被设计为一个 **专家导向的、高度灵活的、由用户完全主导的** 工作流执行与实验平台。其核心哲学是“信任用户”，系统负责精确地记录状态、管理版本和执行指令，但不主动干预或对用户行为的逻辑一致性做出假设或警告。

*   **1.1. 用户主权 (User Sovereignty):** 系统的所有关键操作（如重新执行、版本切换、处理依赖变更）均由用户显式触发。系统不会进行自动化的级联更新或状态作废。
*   **1.2. 线性探索与回溯 (Linear Exploration & Backtracking):** 用户可以在工作流中**已经执行过的节点**之间自由跳转，支持在线性路径上的迭代式回溯和重新探索。
*   **1.3. 原子化版本控制 (Atomic Versioning):** 每次节点执行，只有在通过人机交互环节（HITL）并被用户最终批准后，才会产生一个不可变的、包含完整上下文的快照版本。
*   **1.4. 静默状态管理 (Silent State Management):** 当用户操作导致工作流状态不一致时（例如，上游节点的输出版本更新，而下游节点未更新），系统保持**静默**。在不违反“不自动干预”原则的前提下，引入非侵入式的视觉提示。当用户审查一个节点时，如果其依赖的上游版本 ID 与上游节点的当前激活版本 ID 不一致，可以在 UI 上显示一个“输入已变更”的提示图标。这仅需前端进行简单的 ID 比对。
    *   **明确场景:** 如果用户在节点 C 处于 `等待HITL批准` 状态时跳转离开，随后修改了其上游节点 A 的激活版本。当用户返回节点 C 时，其显示的临时结果（基于旧版本的 A 生成）保持不变。系统仅作提示。用户可以直接批准这个基于旧输入生成的结果，并创建一个新的版本。
*   **1.5. 简化设计 (Simplified Design):** 功能设计遵循简化原则，避免过度复杂的功能（如分支管理、工作流级快照），以确保核心路径的健壮性和可预测性。

#### **2. 工作流结构与执行模型**

*   **2.1. 节点粒度 (Node Granularity):** 工作流被分解为最细粒度的“推理路径”中的“细分动作”作为执行节点。
    *   **澄清:** 系统的基本执行单元（Node）的确切粒度是“细分动作”。例如，`步骤 1.1` 被分解为 `步骤 1.1.1：问题解构与数学化表述` 和 `步骤 1.1.2：架构设计与任务分解` 这两个**完全独立、拥有各自版本历史、且需要独立进行 HITL 批准**的节点。
*   **2.2. 严格线性执行流程 (Strictly Linear Execution Flow):**
    *   工作流被定义为一个严格的、预定义的线性序列。节点按顺序逐一执行。
    *   **阶段二循环结构:** 由 `步骤 1.1.2` 的输出 `结构化建模任务书` 定义的所有子任务（如 `Task A`, `Task B`）将被动态构造成一个**线性任务链**。其精细化结构如下：`... -> 步骤 1.1.1 -> 步骤 1.1.2 -> [Task A]步骤 2.1.1 -> [Task A]步骤 2.1.2 -> [Task A]步骤 2.2.1 -> [Task A]步骤 2.2.2 -> [Task B]步骤 2.1.1 -> ... -> 步骤 3.1.1 -> ...`。
    *   **节点唯一性:** 在此结构中，`[Task A]步骤 2.1.1` 和 `[Task B]步骤 2.1.1` 是两个**完全独立、拥有各自版本历史**的节点。
    *   **动态实例化:** 当生成器节点（`步骤 1.1.2`）执行完毕并被用户在 HITL 环节批准后，系统会**立即**将所有生成的子任务所对应的节点链（如 `[Task A]步骤 2.1.1 ... [Task N]步骤 2.2.2`）实例化并插入到工作流的线性结构中。这些新插入的节点初始状态均为 `未开始 (Not Started)`。
*   **2.3. 特殊节点类型：生成器节点 (Generator Node):**
    *   **定义:** 会生成数量不定子任务的节点，从而动态改变工作流结构的节点。
    *   **识别机制:** 将节点类型（如 `GeneratorNode`）作为节点定义配置的一部分。
    *   **当前实例:** `步骤 1.1.2` 是当前工作流中**唯一**的生成器节点。
    *   **执行限制:** 为保证流程一致性和控制系统复杂度，生成器节点**不允许重新运行**。当用户在UI中点击已执行的生成器节点的“重新执行”按钮时，系统将弹出一个明确的提示，解释此操作被禁止。
    *   **用户应对策略:** 如果用户在工作流中期发现初始的任务分解存在重大缺陷，唯一的选择是**彻底放弃当前工作流实例并从头开始一个新的工作流**。此限制是为优先保证系统简单性而做出的明确设计决策，高于在单个工作流实例内提供无限结构灵活性。
*   **2.4. 强制性人机交互 (Mandatory HITL Integration):**
    *   工作流中的**每一个**“细分动作”节点在计算执行成功后，都**必须**进入一个预定义的 HITL 环节。此规则没有例外，不允许“自动批准”或“跳过 HITL”的机制。

#### **3. 状态、版本与依赖管理**

*   **3.1. 版本创建的精确时机:** 一个新版本被**正式创建并设为激活**的精确时刻，是在用户在该节点的 HITL 环节中做出最终“批准”动作（例如，点击“继续”或在VARL循环中接受结果）的那一刻。在此之前，所有生成的结果均为临时状态。
*   **3.2. 版本快照的完整范围 (Scope of Version Snapshot):**
    *   每个版本都是一个“完整上下文快照”，其记录内容**必须**包含以下所有信息：
        a.  **最终输出产物** (例如文本、图表代码、结构化数据)。
        b.  生成该版本时所使用的**精确输入** (指向上游依赖节点激活版本的唯一标识符 ID)。此选择优先考虑较低的存储成本，而非在外部数据源变化时的绝对自包含可复现性。
        c.  用户在 HITL 环节中的**所有交互记录** (例如，SCA 模式下的选项，VARL 模式下的修改意见)。
        d.  **执行环境参数 (Environment Parameters):** 必须至少包含执行时所用的 LLM 模型名称，temperature 参数。
    *   **排除项:** 系统内置的、用户不可修改的 LLM 推理过程/Prompt 链**不**对外展示。
*   **3.3. 版本激活与切换 (Version Activation & Switching):**
    *   在任意时刻，每个节点都有且仅有一个“激活”的版本。用户可以手动切换任意节点的“激活”版本。此操作是即时的、且仅影响当前节点，不会级联触发任何下游操作。
*   **3.4. 依赖解析规则 (Dependency Resolution Rule):** 当用户**主动触发**一个下游节点的重新执行时，该节点会自动（且仅在此时）拉取其所有上游依赖节点的**当前激活版本**作为本次执行的输入。
*   **3.5. 初始数据处理:**
    *   工作流的初始输入（如 `原始赛题文本`、`数据集`）采用**外部引用**方式处理。系统在创建工作流实例时，仅记录并存储这些文件的路径。
    *   **风险接受:** 这种方式降低了数据管理成本，但也意味着如果外部文件被修改，工作流的可复现性将由用户负责保证，而非系统强制。
*   **3.6. 工作流级版本管理:** 系统**不**支持工作流级别的版本快照或分支功能。恢复到某个历史全局状态需要用户手动逐个切换节点的激活版本。

#### **4. 节点生命周期与状态机**

*   **4.1. 节点状态:**
    *   `未开始 (Not Started)`: 节点从未被执行过。
    *   `执行中 (Executing)`: 节点的计算/LLM推理正在进行。
    *   `等待HITL批准 (Awaiting HITL Approval)`: 计算成功完成，系统等待用户在HITL界面进行交互。此状态下的结果是临时的。
    *   `已完成 (Completed)`: 节点拥有一个或多个已批准的、固化的版本。每个节点有且仅有一个版本是“激活”的。
    *   `执行失败 (Failed)`: 节点的计算执行失败。

*   **4.2. 状态转换规则:**
    *   `未开始` -> `执行中`: 当用户启动工作流或从前一个节点点击“继续”时。
    *   `执行中` -> `等待HITL批准`: 当节点计算成功完成。
    *   `执行中` -> `执行失败`: 当节点计算失败。**此过程不产生任何新版本**，节点的激活版本保持不变。
    *   `等待HITL批准` -> `已完成`: 当用户在HITL环节点击“批准”或“继续”。**此刻，临时结果被固化为新的激活版本**。
    *   `等待HITL批准` -> `执行中`: 当用户在HITL环节选择“拒绝并提供修改意见”并提交反馈时。
    *   `等待HITL批准` -> `已完成`: 当用户点击“丢弃本次执行”。临时结果被删除，节点状态恢复，激活版本仍是之前的版本。
        *   **特殊情况:** 如果该节点在本次执行前处于 `未开始` 状态，在“丢弃本次执行”后，其状态将**回退到 `未开始`**。
    *   `已完成` -> `执行中`: 当用户对一个已完成的节点选择“重新执行”并提交。
    *   `执行失败` -> `执行中`: 当用户点击“重试”并提交。

#### **5. 导航与控制流**

*   **5.1. 工作流生命周期:**
    *   **启动:** 一个全新的工作流实例启动时，所有节点均为 `未开始` 状态。用户必须在第一个节点上**显式点击“开始执行”**来启动整个流程。
    *   **完成:** 当用户在最后一个节点的 HITL 环节点击“继续”后，该节点状态变为 `已完成`，工作流进入事实上的完成状态。系统会显示一个“工作流已完成”的消息，但工作流**永远是“活”的**，所有节点仍可供用户随时跳转、审查和重新执行。
*   **5.2. 跳转 (Jumping):**
    *   用户可以从任何HITL环节跳转到**任意一个已经执行完的节点**。不允许跳转到尚未执行的未来节点。
    *   **着陆行为:** 当用户跳转到一个节点时，系统默认展示该节点**当前激活版本**的完整结果和交互记录的**只读审查模式**。用户可以先审查，再决定下一步操作。
*   **5.3. 继续 (Proceed to Next):**
    *   在HITL界面，点击“继续”按钮会触发一个**双重原子操作**: 1) **批准当前**：将当前节点的临时结果固化为新的激活版本，状态更新为`已完成`。 2) **导航至下一个**：根据线性序列中下一个节点的状态决定行为。
    *   **行为细则:**
        *   **如果下一个节点是 `未开始` 状态:** 自动跳转并启动该节点的执行。
        *   **如果下一个节点是 `已完成` 状态:** 仅批准当前节点，然后自动跳转到下一个节点的**只读审查界面**。系统**不会**自动触发下游已完成节点的重新执行。
*   **5.4. 重新执行 (Re-execution):**
    *   **触发:** 用户在已完成节点的只读审查界面点击“重新执行”。
    *   **流程:**
        1.  UI展示该节点当前激活版本的最终输出，并提供一个输入框。
        2.  用户输入**新的、独立的修改意见**（自由文本）。用户不能编辑旧的交互记录。
        3.  用户提交后，系统发起一次全新执行。
    *   **输入上下文:** 该次全新执行的输入为：所有上游依赖的**最新激活版本**、该节点的**系统内置Prompt**，被重新执行的那个版本的交互记录，以及用户**本次新输入的修改意见**。
    *   **通用性与模式兼容:** 此流程**适用于所有HITL模式 (VARL, SCA, AVL)**。对于 SCA/AVL 等结构化选择模式，重新执行意味着用新的文本指令指导一次**全新的候选选项生成**，而不是允许用户在旧的选项列表中修改选择。此设计旨在避免系统交互逻辑的复杂化。
*   **5.5. 重试 (Retry):**
    *   **触发:** 用户在 `执行失败` 的节点上点击“重试”。
    *   **流程:** 后台技术实现与“重新执行”完全相同。UI上命名为“重试”是为了更好地反映“从失败中恢复”的上下文。用户可以修改或不修改意见后再次提交执行。
*   **5.6. 历史版本审查:**
    *   用户可以查看任意节点的任意非激活历史版本。
    *   审查界面必须以**只读模式**展示该版本的**完整上下文快照**（详见 3.2），以确保完全的可追溯性。
*   **5.7. 用户会话焦点管理:**
    *   系统不维护一个全局的“当前步骤”指针。用户的“位置”就是他们当前正在查看或交互的节点。
    *   在任何节点的HITL环节点击“继续”，将总是导航到该节点在线性序列中的**物理下一节点**，并根据 5.3 中的规则行动。

#### **6. 人机交互环节 (HITL) 的详细操作**

在任何节点的 `等待HITL批准` 界面，用户拥有以下明确的操作选项：

*   **6.1. 批准并前进 (Continue):** 接受当前结果，固化版本，并根据规则 5.3 导航并执行下一个节点。
*   **6.2. 拒绝并提供修改意见 (Reject and Provide Modification Comments):**
    *   **统一拒绝机制:** 此操作是**所有HITL模式 (VARL, SCA, AVL) 中统一的**、当用户不满意当前生成结果时的标准路径。
    *   **交互流程:** 当用户选择此项时，系统会提供一个文本输入框，允许用户输入具体的修改意见或新的指令（例如，“这些选项都不好，请生成更关注XX方面的方案”）。
    *   **后续动作:** 提交修改意见后，系统将触发一次基于新反馈的重新生成，节点状态转为 `执行中`。其输入上下文规则同 5.4。这种统一的设计简化了用户界面，并为所有拒绝操作提供了单一、可预测的心智模型。
*   **6.3. 丢弃本次执行 (Discard this execution):**
    *   用户可以彻底“反悔”本次执行。系统将删除所有与本次执行相关的临时产物（包括LLM输出、代码运行结果等），这些产物**将被永久销毁，不可恢复**。
    *   操作完成后，节点的状态恢复到本次执行前的状态（详见 4.2 特殊情况）。
*   **6.4. 跳转 (Jump):** 导航到其他已执行的节点，当前节点的临时结果保持 `等待HITL批准` 状态。

#### **7. 数据接口与执行环境**

*   **7.1. 数据接口规范:**
    *   所有在节点间传递的 `关键输出接口文档` 所描述的数据，都**必须**是遵循预定义 Schema 的结构化数据（如 JSON）。
    *   **依赖声明:** 每个节点的定义中必须包含一个“依赖清单”，明确声明它需要读取哪些上游节点的哪些字段。
    *   **健壮性:** 系统在执行节点前，会验证其声明的依赖字段是否存在于上游激活版本的输出中。如果不存在（如因Schema变更），该次执行将被视为`执行失败`。
*   **7.2. 当前范围之外 (Out of Scope):**
    *   **代码执行边界:** 对于代码长时间运行任务（异步执行）的处理机制，在当前版本的设计中暂不考虑。
    *   **用户界面 (UI):** 本文档聚焦于系统的后端逻辑、状态管理和核心行为。所有关于前端 UI 的具体设计，在当前阶段暂不涉及。
    *   **失败执行日志:** 为 `执行失败` 状态的节点存储其标准错误 (stderr) 和堆栈跟踪。仅需在捕获异常时将日志写入数据库字段。

</requirements>

<user_requirements>
# O-Award 建模平台功能需求说明书 (Functional Requirements Specification)

## 1. 用户认证与账户管理 (User Authentication and Account Management)

平台必须提供一个安全的多用户管理系统，以确保数据隔离和访问控制。

*   **1.1 用户注册 (User Registration)**
    *   新用户必须能够使用唯一的电子邮件地址和安全密码创建账户。
    *   密码应满足基本的安全强度要求（例如，最小长度、字符组合）。
    *   注册流程必须包含邮箱验证步骤（例如，发送验证链接或验证码）。用户必须完成验证才能激活账户并登录。
*   **1.2 用户认证 (User Authentication)**
    *   注册用户使用其邮箱和密码登录。
    *   系统应采用安全的认证机制（例如，令牌 Token）管理用户会话。
    *   应提供“记住我”选项以延长会话有效期。
*   **1.3 密码管理 (Password Management)**
    *   用户必须能够通过向其注册邮箱发送安全的重置链接来重置忘记的密码。
    *   登录状态下，用户应能在设置面板修改密码（需要验证当前密码）。
*   **1.4 访问控制 (Access Control)**
    *   用户只能访问和操作自己创建的账户信息和项目数据。

## 2. 项目管理 (Project Management)

引入“项目 (Project)”概念，作为用户组织和管理独立建模任务的容器。

*   **2.1 项目定义 (Project Definition)**
    *   一个项目代表一次完整的建模尝试，包含该赛题相关的所有上传文件、配置、工作流实例 (`WorkflowInstance`) 和执行结果。
*   **2.2 项目创建 (Project Creation)**
    *   认证用户可以创建新项目。创建时需要提供一个项目名称和可选的项目描述。
*   **2.3 项目仪表板 (Project Dashboard)**
    *   用户应有一个中心化的仪表板，列出他们创建的所有项目。
    *   列表应显示关键元数据：项目名称、赛题类型、创建日期、最后修改日期和当前工作流状态（例如：配置中、进行中、已完成）。
*   **2.4 项目删除 (Project Deletion)**
    *   用户可以删除自己的项目。
    *   此操作需要明确的二次确认。
    *   删除操作将永久移除所有相关数据，包括上传的文件、工作流实例、所有节点数据 (`NodeInstance`)、历史版本 (`NodeVersion`) 和中间结果。

## 3. 项目初始化与工作流启动 (Project Initialization and Workflow Start)

创建项目后，用户需要配置赛题信息以启动工作流。

*   **3.1 初始化方法 (Initialization Methods)**
    *   用户必须通过以下两种方法之一初始化项目：
        1.  **自定义赛题上传**: 手动上传赛题所需文件。
        2.  **历年赛题选择**: 从平台提供的历年赛题库中选择。
*   **3.2 自定义赛题配置 (Custom Problem Configuration)**
    *   **3.2.1 文件上传**: 系统必须支持多文件上传。
    *   **3.2.2 文件角色定义**: 用户应对上传的文件进行分类（例如：“赛题描述”、“数据集”、“参考资料”）。
    *   **3.2.3 文件存储**: 上传的文件应安全存储并与项目关联。
*   **3.3 历年赛题库 (Historical Problem Library)**
    *   平台应维护一个历年竞赛赛题的存储库。
    *   用户可以按年份和赛题类型浏览和筛选。
    *   选择历年赛题后，系统应自动将相关的赛题描述和官方数据集加载到新项目中。
*   **3.4 赛题类型选择 (Problem Type Classification)**
    *   无论使用哪种初始化方法，用户都必须选择建模赛题的类型（选项：A、B、C、D、E、F 或 默认/未知 '-'）。
*   **3.5 工作流启动 (Workflow Instantiation)**
    *   当文件就绪且赛题类型已选择后，用户可以点击“开始建模”启动流程。
    *   此操作将创建一个新的 `WorkflowInstance`，该实例链接到当前项目。
    *   加载的文件引用将作为工作流的外部数据引用 (`external_data_refs`)。
    *   工作流将自动开始执行第一个节点。

## 4. 中间结果的人工编辑 (User Editing of Intermediate Results)

用户必须能够直接修改 AI 生成的中间结果，以实现精细控制。

*   **4.1 可编辑工件 (Editable Artifacts)**
    *   工作流节点生成的任何基于文本的关键工件（例如：问题重述、假设框架、数学模型公式、分析报告、论文草稿、代码片段）都必须支持用户编辑。
*   **4.2 平台内编辑器 (In-Platform Editor)**
    *   平台必须提供适当的编辑器来修改这些工件（例如，富文本或 Markdown/LaTeX 编辑器用于文档，代码编辑器用于代码）。
*   **4.3 保存与版本控制 (Saving Edits and Versioning)**
    *   用户保存编辑后的工件时，系统必须按以下规则处理：
        *   **4.3.1 创建新版本**: 保存编辑绝不能覆盖 AI 生成的原始版本。它必须为该节点创建一个新的 `NodeVersion`。
        *   **4.3.2 版本来源追溯**: 新版本必须清晰标记为“人工编辑 (Manually Edited)”，并记录其所基于的版本 ID。
        *   **4.3.3 自动激活与完成**: 新创建的人工编辑版本必须自动成为该节点的活动版本 (`active_version`)。如果节点原先处于 `AWAITING_HITL_APPROVAL` 状态，此操作将视作人工干预完成，节点状态应更新为 `COMPLETED`。
*   **4.4 对下游节点的影响 (Impact on Downstream Nodes)**
    *   由于编辑导致活动版本变更，系统必须立即重新计算工作流的“陈旧性”(Staleness)。
    *   系统应通知用户，下游节点现在可能基于过时的输入，需要重新执行以保持一致性。

## 5. 可视化导航与工作流控制 (Visual Navigation and Workflow Control)

平台需要提供直观的界面来监控、回溯和控制工作流的执行。

*   **5.1 工作流可视化 (Workflow Visualization)**
    *   平台必须以可视化格式（例如：有向无环图 DAG 或分阶段流程图）显示完整的工作流结构。
    *   可视化工具必须能够动态展示由 Generator 节点生成的 Phase 2 节点结构。
*   **5.2 实时状态显示 (Real-time Status Display)**
    *   可视化工具必须实时显示每个节点的当前状态（`NodeStatus`：未开始、执行中、等待 HITL、已完成、失败）和执行阶段（`ExecutionStage`）。
    *   当节点因上游变更而变得“陈旧 (Stale)”时，也应清晰标识。
*   **5.3 节点回溯与审查 (Node Retrospection and Inspection)**
    *   用户必须能够选择（回溯）任何已开始或已完成执行的节点以查看其详细信息。
*   **5.4 详细视图 (Detail View)**
    *   节点详细视图应包括：消耗的输入（及其版本 ID）、当前的活动输出工件、待审批的临时结果（如果存在）、执行日志、完整的 HITL 交互历史记录以及陈旧性状态报告。
*   **5.5 工作流控制操作 (Workflow Control Actions)**
    *   用户必须能够执行以下操作（受限于工作流规则，例如 Generator 节点限制）：
        *   **5.5.1 重新执行 (Re-execution)**: 触发节点的重新执行。用户可以选择提供修改意见 (Modification Comments)，或选择基于特定的历史版本进行重试。
        *   **5.5.2 版本切换 (Version Switching)**: 浏览特定节点的 `NodeVersion` 历史记录，并选择一个不同的历史版本作为 `active_version`。
        *   **5.5.3 HITL 交互 (HITL Interaction)**: 如果节点处于 `AWAITING_HITL_APPROVAL` 状态，界面应提供相应的交互入口（SCA 选择、AVL 裁决、VARL 批准/拒绝）。

## 6. 结果导出 (Results Export)

用户需要能够方便地导出项目的所有成果。

*   **6.1 一键按需导出 (One-Click On-Demand Export)**
    *   用户必须能够在工作流执行期间的任意时刻，通过“一键导出”功能导出项目结果。
*   **6.2 导出内容定义 (Export Content Definition)**
    *   导出功能必须编译所有已执行节点的**当前活动版本** (`active_version`)。
*   **6.3 导出包结构 (Package Structure)**
    *   导出的结果包应是一个单一的归档文件（例如 ZIP），具有标准化的目录结构，包含：
        *   **最终论文 (Final Paper)**: 最终节点（例如 3.1.2）的输出。
        *   **代码工件 (Code Artifacts)**: 工作流执行期间生成的所有相关代码。
        *   **附件与可视化 (Attachments and Visualizations)**: 生成的关键可视化图表或数据输出附件。
        *   **中间结果 (Intermediate Results)**: 所有关键中间工件（例如：问题分析、架构设计、分析报告）的结构化导出，按节点组织。
        *   **原始输入 (Original Inputs)**: 项目初始化时使用的赛题描述和数据集。
        *   **项目清单 (Project Manifest)**: 一个元数据文件，详细说明项目配置和执行摘要。

## 7. 用户设置面板 (User Settings Panel)

用户必须能够配置其账户偏好和工作流引擎的行为参数。

*   **7.1 账户设置 (Account Settings)**
    *   **用户名**: 可编辑的显示名称。
    *   **电子邮件**: 可查看；更改需要进行新邮件验证。
    *   **密码**: 更改密码选项（详见 1.3）。
*   **7.2 界面设置 (Interface Settings)**
    *   **语言 (Language)**: 选择支持的界面语言（例如：英语、简体中文）。
    *   **主题 (Theme)**: 选择界面主题（例如：浅色模式、深色模式）。
*   **7.3 工作流引擎配置 (Workflow Engine Configuration)**
    *   允许用户配置底层的执行环境和 AI 模型（支持 Bring Your Own Key - BYOK）。
    *   **7.3.1 LLM Provider 配置**:
        *   **Model Name**: 输入模型标识符（例如："gpt-4o", "claude-3-opus"）。
        *   **API Key**: 安全输入框（遮蔽显示）用于输入 Provider 的 API 密钥。
        *   **Base URL**: 输入 API 端点 URL（允许使用代理或不同的 Provider）。
    *   **7.3.2 代码执行沙箱 (E2B)**:
        *   **E2B API Key**: 安全输入框，用于提供代码安全沙箱执行所需的 API 密钥。
*   **7.4 人机交互行为 (HITL Behavior)**
    *   **用户等级 (User Level / HITL Profile)**: 用户选择一个预设等级（例如：“新手 Novice”、“熟练 Experienced”、“专家 Expert”）。
    *   **配置映射**: 该等级决定了新工作流的默认 HITL 配置。不同的等级对应不同的 HITL 模式（AVL、SCA、VARL）干预策略。例如，新手等级可能需要更频繁的强制性人工审核，而专家等级可能允许更高的自动化程度。
*   **7.5 思考深度 (Thinking Depth)**
    *   **深度等级 (Depth Level)**: 用户选择期望的分析深度（Instant 快速、Medium 中等、Heavy 深度）。
    *   **对 SCA 的影响**: 此设置直接控制在战略候选分析 (SCA) 节点中生成的候选方案数量。
        *   *Instant*: 生成少量候选，执行速度快。
        *   *Medium*: 生成中等数量候选，平衡速度和质量。
        *   *Heavy*: 生成大量候选，提供更广泛的选择空间，但执行时间更长。
</user_requirements>

</background>

<api>
# Folder Structure of /Users/ann/Documents/projects/MMAgent/final/backend/api

## api
 - 1_认证与授权(Authentication_Authorization).md
 - 2_用户管理(UserManagement).md
 - 3_项目管理(ProjectManagement).md
 - 4_工作流管理(WorkflowManagement).md
 - 5_节点与执行控制(Node_ExecutionControl).md
 - 6_实时通信(Real-timeCommunication-WebSocket).md
 - 7_系统与基础设施(System_Infrastructure).md

### 1_认证与授权(Authentication_Authorization).md Content:

```md
## API 文档: 认证与授权

本部分 API 负责处理用户身份的所有方面，包括注册、登录和凭证管理。它是访问系统所有其他受保护资源的基础。

### 核心机制：JWT Bearer Token

本系统采用 **JSON Web Tokens (JWT)** 作为身份验证机制。

#### 令牌生命周期 (Token Lifecycle)

1.  **获取 (Acquisition)**: 用户通过 `POST /auth/login` 成功登录后，获得一个 `access_token`。
    *   **有效期**: 根据系统配置 (`config.py`)，此令牌的有效期为 **7天**。
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
    *   只有已激活且已验证的账户才能成功登录。

##### 请求格式
此端点遵循 OAuth2 规范，需要使用 `application/x-www-form-urlencoded` 格式提交数据。

*   `username` (string, **required**): 用户的注册**电子邮件地址**。
*   `password` (string, **required**): 用户的明文密码。

##### JavaScript `fetch` 请求示例
```javascript
const formData = new URLSearchParams();
formData.append('username', 'user@example.com');
formData.append('password', 'a_strong_password');

fetch('http://localhost:8000/auth/login', {
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
> 2.  **处理 `401 Unauthorized`**: 在登录表单下方显示“电子邮件或密码不正确”的通用错误提示。
> 3.  **处理 `403 Forbidden`**: 显示一个更具体的消息，例如：“您的账户尚未激活，请检查您的注册邮箱以完成验证。”

---

### 2. 用户注册

#### 2.1. 创建新用户账户

*   **Endpoint**: `POST /auth/register`
*   **描述**: 注册一个新用户。成功后，用户的 `is_verified` 状态为 `false`，需要通过（未来实现的）邮件验证流程来激活。

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
> 2.  **显示消息**: 向用户展示一条信息，如：“注册成功！一封验证邮件已发送至您的邮箱，请点击邮件中的链接以激活您的账户。”
> 3.  **重定向**: 将用户重定向到登录页面，或停留在当前页面等待用户操作。

---

### 3. 密码管理

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
```

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
```

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
  "task_group_id": null
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
```

### 4_工作流管理(WorkflowManagement).md Content:

```md
## API 文档: 工作流管理

本部分 API 提供了对工作流实例的宏观管理功能。工作流是执行建模任务的容器，它由一系列相互依赖的节点组成。

### 核心概念

*   **项目与工作流**: 每个`项目 (Project)`在生命周期中最多拥有一个`工作流实例 (WorkflowInstance)`。工作流的创建和管理都与项目强绑定。
*   **工作流状态**:
    *   `Running`: 表示工作流已激活，可以或正在执行节点。**注意**: 一个新创建的工作流默认为此状态，但这仅表示“准备就绪”，并不意味着有节点正在执行。
    *   `Completed`: 工作流中所有节点均已成功执行完毕。
*   **动态结构**: 工作流的结构并非完全静态。当一个 `node_type` 为 `Generator` 的节点执行完成后，它会向当前工作流中**动态插入**一系列新的节点。
    *   **前端关键**: 必须监听 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件。收到此事件后，应立即废弃本地的工作流结构缓存，并调用 `GET /workflows/{workflow_id}` 重新获取完整的、最新的节点列表来刷新视图。

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
返回完整的 `WorkflowInstanceRead` 对象。
```jsonc
{
  "id": 1,
  "name": "2024 Problem A - Initial Approach",
  "status": "Running", // 表示“准备就绪”
  "project_id": 12,
  "user_id": 1,
  // 响应中可能包含后端计算的辅助状态字段，以简化前端逻辑
  // "is_deletable": true, 
  // "is_completed": false,
  "nodes": [ /* ... 包含所有根据模板生成的初始节点 ... */ ]
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
返回 `PaginatedResponse[WorkflowSummaryRead]` 对象。**注意**: 此响应不包含完整的 `nodes` 列表以优化性能。
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
返回 `WorkflowInstanceRead` 对象，包含完整的 `nodes` 列表。
```jsonc
{
  "id": 1,
  "name": "Updated Workflow Name",
  "status": "Running",
  "project_id": 12,
  "user_id": 1,
  // "is_deletable": false, // 假设有节点正在执行
  // "is_completed": false,
  "nodes": [ /* ... 当前所有节点的完整信息 ... */ ]
}
```

##### 错误响应
*   `401 Unauthorized`: 认证失败。
*   `403 Forbidden`: 用户无权访问该工作流。
*   `404 Not Found`: 指定的 `workflow_id` 不存在。

##### > 前端实现要点
> *   在进入工作流页面时首次调用此接口。
> *   当收到 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件时，必须调用此接口以获取全新的节点布局并重新渲染。

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
>     1.  首次加载工作流画布时。
>     2.  当任何节点的版本发生变更后（如：用户批准 HITL、手动编辑、切换历史版本）。
>     3.  可选：在收到节点完成的 WebSocket 事件后。
> *   **如何使用**: 遍历返回的字典的键（`"105"`），在画布上找到对应的节点，并为其添加一个视觉提示（如警告图标、虚线边框等），并在鼠标悬浮时展示过时详情。
```

### 5_节点与执行控制(Node_ExecutionControl).md Content:

```md
## API 文档: 节点与执行控制

本部分 API 专注于对工作流中的单个节点进行精细化操作，是实现人机协同（HITL）、版本控制和流程干预的核心。

### 核心概念

为更好地理解本模块 API，请先熟悉以下核心概念：

*   **节点生命周期 (Node Lifecycle)**: 一个节点通常会经历 `Not Started` -> `Executing` -> `Awaiting HITL Approval` -> `Completed` 的状态流。`retry` 或 `re-execute` 等操作会使其重新进入 `Executing` 状态。`Failed` 是一个可能的终态，但可以通过 `retry` 恢复。
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
  "task_group_id": null,
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

用于重新执行一个处于 `FAILED` 状态的节点，旨在完成当前失败的执行。

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
*   `409 Conflict` (`INVALID_STATE`): 节点状态不是 `FAILED`，或正在执行中。

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
*   **重要影响**: 此操作仅改变节点的 `active_version`，但**不会**自动重新执行任何下游节点。用户需自行决定是否基于此旧版本的结果去手动重新执行下游节点。

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
```

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

所有服务器推送的消息均为 JSON 字符串，遵循以下统一结构：

```jsonc
{
  "event_type": "EVENT_TYPE_STRING", // [String] 事件类型
  "workflow_id": 123,                 // [Integer] 所属工作流 ID
  "node_id": 101,                     // [Integer | Null] 关联节点 ID, 工作流级别事件此项为 null
  "data": { ... }                     // [Object] 事件数据负载
}
```

### 5. 事件详解

#### 5.1. `NODE_STATUS_UPDATED` (高频)

*   **描述**: 工作流中单个节点的状态发生变化。这是构建动态 UI 的核心事件。
*   **`data` 负载**: `NodeInstanceRead` 对象 (节点的**完整**最新数据)。
*   **UI 影响与操作**:
    *   **状态变更**: 根据 `status` 和 `current_stage` 更新节点的视觉表现（图标、颜色、文本）。
    *   **交互锁定**: 当 `status` 变为 `Executing` 时，应禁用该节点上的所有操作按钮（如“执行”、“批准”），并显示加载指示器。
    *   **交互解锁**: 当 `status` 变为 `Awaiting HITL Approval` 或 `Failed` 时，应解锁对应的 HITL 操作按钮（如“批准/拒绝”或“重试”）。
    *   **数据刷新**: 如果用户正在查看该节点的详细视图，应使用事件 `data` 中的信息刷新视图内容。

#### 5.2. `WORKFLOW_STRUCTURE_UPDATED` (低频，高影响)

*   **描述**: 工作流的节点集合发生了根本性变化（增加/重排序），通常由 `Generator` 节点完成时触发。
*   **`data` 负载**: `WorkflowInstanceRead` 对象 (包含**全新且完整**的 `nodes` 数组)。
*   **UI 影响与操作**:
    *   **全量替换**: **必须**将前端状态管理器中的 `nodes` 数组完全替换为此事件 `data.nodes`。**严禁**尝试进行 diff 或 patch 操作。
    *   **用户体验考量**: 这是一个颠覆性的更新。建议在 UI 上显示一个短暂的、非阻塞的通知（例如 Toast "工作流已更新"），以告知用户发生了结构性变化。如果用户的焦点（例如，正在编辑的表单）位于受影响的节点上，需要谨慎处理，避免丢失用户输入。
    *   **渲染优化**: 在 Vue/React 中，确保你的节点列表渲染使用了 `key` 属性（例如 `v-for` 或 `.map`），以帮助框架高效地重新渲染 DOM。

#### 5.3. `WORKFLOW_STATUS_UPDATED` (低频)

*   **描述**: 整个工作流的顶级状态发生变化，主要是当工作流完成时。
*   **`data` 负载**: `WorkflowInstanceRead` 对象。
*   **UI 影响与操作**:
    *   **全局状态更新**: 更新页面标题栏或面包屑导航中的工作流状态。
    *   **功能解锁**: 当 `data.status` 变为 `Completed` 时，应**启用**“导出项目”等最终操作按钮。
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
```
</api>

<backend_code>

# Folder Structure of /Users/ann/Documents/projects/MM-Agent/backend/backend

## backend
 - .env
 - __init__.py
 - alembic.ini
 - config.py
 - database.py
 - exceptions.py
 - logging_config.py
 - main.py
 - redis.py
 - task_names.py
 - worker.py
 - workflow_definition.py
 - ws_manager.py

### .env Content:

```
# Redis 配置
REDIS_HOST=10.120.16.27
REDIS_PORT=7379
REDIS_PASSWORD=another_secure_password
REDIS_DB=0
```

### __init__.py Content:

```py
"""Backend package for the O-Award Workflow Engine."""


```

### alembic.ini Content:

```ini
# A generic Alembic configuration file.
# https://alembic.sqlalchemy.org/en/latest/tutorial.html#create-a-config-file

[alembic]
# Path to the migration script directory.
# The path is relative to the location of this ini file.
script_location = alembic

# A file name for the log output, or 'stdout' to log to the console.
# logging_file_name = alembic.log

# The name of the alembic version table.
# version_table = alembic_version


[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S

```

### config.py Content:

```py
import base64
from pathlib import Path

from pydantic import AliasChoices, Field, RedisDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Define a base directory for the project
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """
    Runtime configuration for the O-Award Modeling Platform.
    Loads values from environment variables and a .env file.
    """

    # --- Core Application Settings ---
    DATABASE_URL: str
    REDIS_SCHEME: str = "redis"
    REDIS_HOST: str = "10.120.16.27"
    REDIS_PORT: int = 7379
    REDIS_DB: int = 0
    REDIS_USERNAME: str | None = None
    REDIS_PASSWORD: str = 'another_secure_password'
    REDIS_URL: RedisDsn = "redis://:another_secure_password@10.120.16.27:7379/0 "

    # --- Logging ---
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "console"  # Use "json" for structured logs

    # --- Security and Authentication (R1, R7.3) ---
    SECRET_KEY: str = "a_very_insecure_default_secret_key_for_jwt"
    ENCRYPTION_KEY: str = "R2JofR3Im5x4f8IinLcs3jJ5Hh2R90g6Z_u-d23o1oQ="  # Insecure default
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if v == "a_very_insecure_default_secret_key_for_jwt":
            print(  # Use print as logger might not be configured yet
                "WARNING: Using default insecure SECRET_KEY. "
                "Please set a strong, random key in your environment for production."
            )
        return v

    @field_validator("ENCRYPTION_KEY")
    @classmethod
    def validate_encryption_key(cls, v: str) -> str:
        """Validate that the encryption key is 32 url-safe base64-encoded bytes."""
        try:
            # The key must be 32 bytes after decoding.
            if len(base64.urlsafe_b64decode(v)) != 32:
                raise ValueError("Encryption key must be 32 url-safe base64-encoded bytes.")
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid ENCRYPTION_KEY: {e}") from e
        return v

    @model_validator(mode="after")
    def assemble_redis_url(self):
        """
        Build the Redis DSN from individual components if a full URL is not provided.

        This allows users to configure Redis via either REDIS_URL or the granular
        REDIS_* fields inside their environment (including .env files).
        """

        if "REDIS_URL" in self.model_fields_set:
            return self

        path = str(self.REDIS_DB or 0)
        built_url = RedisDsn.build(
            scheme=self.REDIS_SCHEME,
            username=self.REDIS_USERNAME,
            password=self.REDIS_PASSWORD,
            host=self.REDIS_HOST,
            port=self.REDIS_PORT,
            path=path,
        )

        # object.__setattr__(self, "REDIS_URL", RedisDsn(built_url))
        return self

    @model_validator(mode="after")
    def normalize_database_url(self):
        """Ensure SQLite URLs defined in .env resolve to absolute paths."""
        prefix = "sqlite:///"
        if self.DATABASE_URL.startswith(prefix) and not self.DATABASE_URL.startswith("sqlite:////"):
            relative_path = self.DATABASE_URL.replace(prefix, "", 1)
            absolute_path = (BASE_DIR / relative_path).resolve()
            object.__setattr__(self, "DATABASE_URL", f"sqlite:///{absolute_path}")

        if "+asyncpg" in self.DATABASE_URL:
            # Application code uses synchronous SQLAlchemy sessions, so ensure we do not
            # accidentally bind the asyncpg dialect which requires greenlet contexts.
            sync_url = self.DATABASE_URL.replace("+asyncpg", "+psycopg", 1)
            print(  # Use print because loggers might not yet exist
                "INFO: Converting DATABASE_URL to psycopg driver for compatibility with sync sessions."
            )
            object.__setattr__(self, "DATABASE_URL", sync_url)
        return self

    # --- File Storage (R3.2) ---
    # Use an absolute path for storage relative to the project root
    STORAGE_BASE_PATH: Path = BASE_DIR / "project_storage"

    # --- WebSocket ---
    WEBSOCKET_BROADCAST_CHANNEL: str = "workflow_events"

    # --- Legacy/Temporary Settings (to be refactored) ---
    EXTERNAL_DATA_DIR: str = str(BASE_DIR / "external_data_simulation")
    LLM_MODEL_NAME: str = Field(
        default="Qwen/Qwen3-VL-8B-Instruct",
        validation_alias=AliasChoices("LLM_MODEL_NAME", "MODEL_NAME"),
    )
    LLM_BASE_URL: str | None = Field(
        default="https://api.siliconflow.cn/v1",
        validation_alias=AliasChoices("LLM_BASE_URL", "BASE_URL"),
    )
    LLM_API_KEY: str | None = Field(
        default=None,
        validation_alias=AliasChoices("LLM_API_KEY", "API_KEY"),
    )
    LLM_PROVIDER: str = Field(
        default="openai",
        validation_alias=AliasChoices("LLM_PROVIDER", "PROVIDER"),
    )
    E2B_API_KEY: str | None = None
    DEFAULT_TEMPERATURE: float = 0.1

    model_config = SettingsConfigDict(
        env_file=f"{BASE_DIR}/.env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

```

### database.py Content:

```py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


```

### exceptions.py Content:

```py
from typing import Any, Dict, Optional


class WorkflowException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        error_code: str = "WORKFLOW_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details


class NotFoundException(WorkflowException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=404, error_code="NOT_FOUND", details=details)


class InvalidStateException(WorkflowException):
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        error_code: str = "INVALID_STATE",
    ):
        super().__init__(message, status_code=409, error_code=error_code, details=details)


class ForbiddenException(WorkflowException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=403, error_code="FORBIDDEN", details=details)


class DependencyException(WorkflowException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=424, error_code="DEPENDENCY_FAILED", details=details)

```

### logging_config.py Content:

```py
import json
import logging
import sys

from loguru import logger

from backend.config import settings


class InterceptHandler(logging.Handler):
    """Redirect standard logging records to loguru."""

    def emit(self, record: logging.LogRecord):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def _json_formatter(record: dict) -> str:
    """Serialize log messages into structured JSON."""

    def serialize(log_record: dict) -> dict:
        payload = {
            "timestamp": log_record["time"].isoformat(),
            "level": log_record["level"].name,
            "message": log_record["message"],
            "name": log_record["name"],
        }
        payload.update(log_record["extra"])
        if log_record["exception"]:
            payload["exception"] = str(log_record["exception"])
        return payload

    record["extra"]["serialized"] = json.dumps(serialize(record))
    return "{extra[serialized]}\n"


def setup_logging() -> None:
    """Configure loguru sinks and intercept stdlib logging."""

    logger.remove()
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    if settings.LOG_FORMAT.lower() == "json":
        logger.add(
            sys.stdout,
            level=settings.LOG_LEVEL.upper(),
            format=_json_formatter,
            serialize=False,
        )
    else:
        logger.add(
            sys.stdout,
            colorize=True,
            level=settings.LOG_LEVEL.upper(),
            format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
            "<level>{message}</level>",
        )

    uvicorn_logger = logging.getLogger("uvicorn")
    uvicorn_logger.handlers = [InterceptHandler()]
    logging.getLogger("uvicorn.access").handlers = [InterceptHandler()]
    logging.getLogger("uvicorn.error").handlers = [InterceptHandler()]
    logger.info("Loguru logging configured.", log_format=settings.LOG_FORMAT, log_level=settings.LOG_LEVEL)

```

### main.py Content:

```py
import asyncio
import json
import os
from contextlib import asynccontextmanager

from arq.connections import ArqRedis
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from sqlalchemy.orm import Session
from sqlalchemy.sql import select

from backend.config import settings
from backend.database import get_db
from backend.exceptions import WorkflowException
from backend.logging_config import setup_logging
from backend.redis import close_redis_pool, get_redis_pool
from backend.routers import api_router, auth_router, nodes_router, projects_router, users_router, workflows_router
from backend.schemas.common import SystemInfo
from backend.schemas.error import ErrorResponse
from backend.utils.event_utils import broadcast_from_server

setup_logging()


async def redis_pubsub_listener():
    """Listen to Redis Pub/Sub and forward messages to WebSockets."""

    redis = await get_redis_pool()
    pubsub = redis.pubsub()
    await pubsub.subscribe(settings.WEBSOCKET_BROADCAST_CHANNEL)
    logger.info("Subscribed to Redis channel for workflow events", channel=settings.WEBSOCKET_BROADCAST_CHANNEL)
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if not message:
                await asyncio.sleep(0.05)
                continue
            if message.get("type") != "message":
                continue

            raw_data = message.get("data")
            if isinstance(raw_data, bytes):
                raw_data = raw_data.decode()

            try:
                payload = json.loads(raw_data)
            except json.JSONDecodeError:
                logger.error("Discarding malformed Redis payload", raw_data=raw_data)
                continue

            workflow_id = payload.get("workflow_id")
            if workflow_id is None:
                logger.warning("Dropping event without workflow_id", payload=payload)
                continue

            await broadcast_from_server(workflow_id, payload)
    except asyncio.CancelledError:
        logger.info("Redis listener task cancelled.")
        raise
    finally:
        try:
            await pubsub.unsubscribe(settings.WEBSOCKET_BROADCAST_CHANNEL)
        finally:
            await pubsub.close()
        logger.info("Redis Pub/Sub listener shut down cleanly.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure storage directory exists on startup
    logger.info("Ensuring storage directory exists...")
    os.makedirs(settings.STORAGE_BASE_PATH, exist_ok=True)

    # Database schema is now managed via Alembic migrations.
    logger.info("Skipping automatic table creation. Database schema is managed by Alembic.")
    listener_task = asyncio.create_task(redis_pubsub_listener())
    logger.info("Redis listener startup complete.")
    try:
        yield
    finally:
        listener_task.cancel()
        try:
            await listener_task
        except asyncio.CancelledError:
            logger.info("Redis listener task successfully cancelled.")

        await close_redis_pool()
        logger.info("Redis connection closed.")


app = FastAPI(
    title="O-Award Workflow Engine Backend - Optimized Implementation",
    version="2.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(WorkflowException)
async def workflow_exception_handler(request: Request, exc: WorkflowException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details,
        ).model_dump(exclude_none=True),
    )


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(workflows_router)
app.include_router(nodes_router)
app.include_router(api_router)


@app.get("/", response_model=dict)
def read_root():
    return {"message": "Workflow Engine Backend (Optimized Version) is running."}


@app.get("/health", tags=["System"], response_model=dict)
async def health_check(
    db: Session = Depends(get_db),
    redis: ArqRedis = Depends(get_redis_pool),
):
    try:
        await redis.ping()
        db.execute(select(1))
        return {"status": "ok"}
    except Exception:
        logger.exception("Health check failed")
        raise HTTPException(status_code=503, detail="Service is unhealthy.")


@app.get("/system/info", tags=["System"], response_model=SystemInfo)
def system_info():
    return SystemInfo(app_version=app.version, llm_model_name=settings.LLM_MODEL_NAME)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

```

### redis.py Content:

```py
"""Redis/arq connection management utilities."""

from __future__ import annotations

from typing import Optional

from arq.connections import ArqRedis, RedisSettings, create_pool

from backend.config import settings

redis_pool: Optional[ArqRedis] = None


async def get_redis_pool() -> ArqRedis:
    """Return a lazily instantiated ArqRedis pool."""

    global redis_pool
    if redis_pool is None:
        redis_settings = RedisSettings.from_dsn(str(settings.REDIS_URL))
        redis_pool = await create_pool(redis_settings)
    return redis_pool


async def close_redis_pool() -> None:
    """Gracefully close the shared Redis pool if it exists."""

    global redis_pool
    if redis_pool is not None:
        await redis_pool.close()
        redis_pool = None

```

### task_names.py Content:

```py
"""Shared task name constants used by the worker/producer code."""

TASK_EXECUTE_NODE = "execute_node_task"

```

### worker.py Content:

```py
"""arq worker definition for executing node simulations."""

from __future__ import annotations

import traceback
from typing import Any, Dict

from arq.connections import RedisSettings
from loguru import logger
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, joinedload

from backend.config import settings
from backend.logging_config import setup_logging
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, WorkflowInstance
from backend.schemas.events import EventType
from backend.schemas.node import NodeInstanceRead
from backend.services.node_service import NodeService
from backend.task_names import TASK_EXECUTE_NODE
from backend.utils.event_utils import broadcast_event

setup_logging()

connect_args: Dict[str, Any] = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def execute_node_task(ctx: Dict[str, Any], node_id: int, **kwargs: Any) -> None:
    """arq background task that executes a node with resilient error handling."""

    with logger.contextualize(node_id=node_id, job_args=kwargs):
        logger.info("Worker received task to execute node")
        db = SessionLocal()
        try:
            node = (
                db.query(NodeInstance)
                .options(
                    joinedload(NodeInstance.workflow).joinedload(WorkflowInstance.project),
                    joinedload(NodeInstance.temporary_result),
                )
                .get(node_id)
            )
            if not node:
                logger.error("Node not found in database. Discarding job.")
                return

            if node.status != NodeStatus.EXECUTING:
                logger.warning(
                    "Worker picked up stale job for node. Discarding.",
                    node_status=node.status.value,
                )
                return

            node_service = NodeService(db)
            await node_service.execute_in_worker(node, **kwargs)

        except Exception as exc:
            logger.exception("Worker task for node failed permanently.")
            fail_db = None
            try:
                fail_db = SessionLocal()
                node_to_fail = fail_db.query(NodeInstance).get(node_id)
                if node_to_fail and node_to_fail.status == NodeStatus.EXECUTING:
                    node_to_fail.status = NodeStatus.FAILED
                    node_to_fail.current_stage = ExecutionStage.FAILED
                    if node_to_fail.temporary_result:
                        node_to_fail.temporary_result.error_log = f"Worker Error: {exc}\n{traceback.format_exc()}"

                    fail_db.commit()
                    node_data = NodeInstanceRead.model_validate(node_to_fail).model_dump(mode="json")
                    await broadcast_event(
                        node_to_fail.workflow_instance_id,
                        EventType.NODE_STATUS_UPDATED,
                        node_data,
                        node_id=node_to_fail.id,
                    )
            except Exception:
                logger.exception(
                    "CRITICAL: Failed to update node status to FAILED after task error.",
                    failed_node_id=node_id,
                )
            finally:
                if fail_db:
                    fail_db.close()
        finally:
            db.close()
        logger.info("Worker finished task for node")


async def on_job_failure(ctx: Dict[str, Any], job: Any, exc: BaseException) -> None:
    """Log jobs that exhausted retries for easier inspection."""

    logger.error(
        "Job failed permanently after all retries.",
        job_function=job.function,
        job_args=job.args,
        exception=str(exc),
    )


class WorkerSettings:
    """arq worker configuration."""

    functions = [execute_node_task]
    redis_settings = RedisSettings.from_dsn(str(settings.REDIS_URL))
    job_timeout = 300  # 5 minutes
    on_job_failure = on_job_failure


__all__ = ["WorkerSettings", "execute_node_task", "TASK_EXECUTE_NODE"]

```

### workflow_definition.py Content:

```py
from enum import Enum


class NodeType(str, Enum):
    STANDARD = "Standard"
    GENERATOR = "Generator"


class HITLMode(str, Enum):
    VARL = "VARL"
    SCA = "SCA"
    AVL = "AVL"

# Standardized Keys for Raw Generation
KEY_PRIMARY_ARTIFACT = "primary_artifact"
KEY_CANDIDATES = "candidates"
KEY_ANALYSIS = "comparative_analysis"
KEY_CRITIQUES = "critiques"
KEY_ID = "id"
# Fix 3.1/3.2: Standardized keys for final HITL outputs
KEY_SCA_OUTPUT = "sca_output_wrapper"
KEY_SELECTED_ITEM = "selected_item"
KEY_SELECTED_ITEMS = "selected_items"

# Workflow Structure Constants
PREVIOUS_IN_TASK = "__PREVIOUS_IN_TASK__"
# Fix 2.1: Used for resolving inter-task dependencies
TERMINAL_NODE_SUFFIX = ".2.2.2"

WORKFLOW_DEFINITION = {
    "name": "O-Award Modeling Workflow",
    "structure": [
        {
            "id": "1.1.1",
            "name": "Problem Deconstruction and Mathematical Formulation",
            "phase": "Phase 1: Strategic Analysis & Macro Architecture",
            "type": NodeType.STANDARD,
            "hitl_mode": HITLMode.AVL,
            "dependencies": {},
            "external_inputs": ["Problem Statement", "Datasets"],
        },
        {
            "id": "1.1.2",
            "name": "Architecture Design and Task Decomposition",
            "phase": "Phase 1: Strategic Analysis & Macro Architecture",
            "type": NodeType.GENERATOR,
            "hitl_mode": HITLMode.SCA,
            "dependencies": {
                "1.1.1": {"required_fields": ["Formal Problem Restatement", "Global Assumption Framework"]}
            },
            "external_inputs": [],
        },
        {
            "id": "3.1.1",
            "name": "Global Logic Integration and Strategic Narrative Construction",
            "phase": "Phase 3: Global Synthesis & O-Award Paper Forging",
            "type": NodeType.STANDARD,
            "hitl_mode": HITLMode.SCA,
            "dependencies": {
                "1.1.1": {"required_fields": ["Formal Problem Restatement"]},
                "1.1.2": {"required_fields": ["Structured Modeling Taskbook"]},
            },
            "external_inputs": [],
        },
        {
            "id": "3.1.2",
            "name": "Paper Forging and Professional Optimization",
            "phase": "Phase 3: Global Synthesis & O-Award Paper Forging",
            "type": NodeType.STANDARD,
            "hitl_mode": HITLMode.VARL,
            "dependencies": {
                "3.1.1": {"required_fields": ["Thesis Statement", "Narrative Outline"]}
            },
            "external_inputs": [],
        },
    ],
}

PHASE_2_TEMPLATE = {
    ".2.1.1": {
        "name_prefix": "Data Insights and Candidate Model Generation",
        "type": NodeType.STANDARD,
        "hitl_mode": HITLMode.SCA,
        "inputs": {},
        # Output is the standardized SCA wrapper
        "outputs": [KEY_SCA_OUTPUT],
        "inherits_external_inputs": True,
    },
    ".2.1.2": {
        "name_prefix": "Mathematical Formulation and Computational Design",
        "type": NodeType.STANDARD,
        "hitl_mode": HITLMode.AVL,
        "inputs": {
            # Depends on the SCA wrapper from 2.1.1
            PREVIOUS_IN_TASK: [KEY_SCA_OUTPUT]
        },
        # Concrete output keys used by the simulator
        "outputs": [
            "math_formulation",
            "execution_blueprint",
        ],
        "inherits_external_inputs": False,
    },
    ".2.2.1": {
        "name_prefix": "Code Generation and Automatic Execution",
        "type": NodeType.STANDARD,
        "hitl_mode": HITLMode.VARL,
        "inputs": {
            # Depends on the blueprint from 2.1.2
            PREVIOUS_IN_TASK: ["execution_blueprint"]
        },
        # Concrete output keys used by the simulator
        "outputs": [
            "raw_results",
            "vv_data",
            "sensitivity_data"
        ],
        "inherits_external_inputs": True,
    },
    # This definition corresponds to TERMINAL_NODE_SUFFIX
    TERMINAL_NODE_SUFFIX: {
        "name_prefix": "Robustness Analysis and Strategic Visualization",
        "type": NodeType.STANDARD,
        "hitl_mode": HITLMode.SCA,
        "inputs": {
            # Depends on the data emitted by 2.2.1
            PREVIOUS_IN_TASK: [
                "raw_results",
                "vv_data",
                "sensitivity_data"
            ]
        },
        # Concrete output keys used by the simulator, plus the SCA wrapper
        "outputs": [
            KEY_SCA_OUTPUT,
            "vv_report",
            "key_output_doc",
        ],
        "inherits_external_inputs": False,
    },
}

```

### ws_manager.py Content:

```py
import json
from typing import Dict, List

from fastapi import WebSocket
from loguru import logger


class ConnectionManager:
    """Tracks active WebSocket connections grouped by workflow instance."""

    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, workflow_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(workflow_id, []).append(websocket)
        logger.info("WebSocket connected", workflow_id=workflow_id)

    def disconnect(self, workflow_id: int, websocket: WebSocket):
        connections = self.active_connections.get(workflow_id, [])
        try:
            connections.remove(websocket)
        except ValueError:
            pass
        if not connections and workflow_id in self.active_connections:
            del self.active_connections[workflow_id]
        logger.info("WebSocket disconnected", workflow_id=workflow_id)

    async def broadcast(self, workflow_id: int, message: Dict):
        connections = self.active_connections.get(workflow_id)
        if not connections:
            return

        payload = json.dumps(message, default=str)
        for connection in connections[:]:
            try:
                await connection.send_text(payload)
            except Exception as exc:  # Connection already closed
                logger.warning("Failed to send WebSocket message", workflow_id=workflow_id, error=str(exc))
                self.disconnect(workflow_id, connection)


manager = ConnectionManager()

```

    ## alembic
     - __init__.py
     - env.py
     - script.py.mako

### alembic/__init__.py Content:

```py
# This file is intentionally left empty.

```

### alembic/env.py Content:

```py
"""Alembic environment configuration with SQLite batch-mode support."""

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# --- START: Application Integration ---
# Allow Alembic to import from the project package.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.config import settings
from backend.database import Base
from backend.models import *  # noqa: F401,F403 - needed for metadata population

# --- END: Application Integration ---

# Alembic Config object, provides access to the values within the .ini file.
config = context.config

# --- START: Configuration Update ---
# Ensure Alembic uses the same database URL as the application settings.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
# --- END: Configuration Update ---

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- START: Model Metadata ---
target_metadata = Base.metadata
# --- END: Model Metadata ---


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    render_as_batch = url.startswith("sqlite")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=render_as_batch,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        render_as_batch = connection.dialect.name == "sqlite"

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=render_as_batch,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

```

### alembic/script.py.mako Content:

```mako
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | repr}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}

```

        ## versions
         - 3a5b6c7d8e9f_update_workflow_models_for_multitenancy.py
         - __init__.py
         - a9c8b7d6e5f4_add_project_and_file_models.py
         - b83f6d2e1c4a_normalize_enum_values.py
         - d78b8a3e7d5e_add_user_and_usersettings_models.py
         - f8a3a2a1b0c9_initial_migration.py

### alembic/versions/3a5b6c7d8e9f_update_workflow_models_for_multitenancy.py Content:

```py
"""Update workflow models for multitenancy and manual editing

Revision ID: 3a5b6c7d8e9f
Revises: a9c8b7d6e5f4
Create Date: 2024-05-23 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3a5b6c7d8e9f'
down_revision = 'a9c8b7d6e5f4'
branch_labels = None
depends_on = None

# Define Enum type for database operations
version_source_enum = sa.Enum('AI_GENERATED', 'MANUALLY_EDITED', name='versionsource')


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    
    # Create the new enum type in the database before using it in a column.
    version_source_enum.create(op.get_bind(), checkfirst=False)

    with op.batch_alter_table('node_versions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('source', version_source_enum, server_default='AI_GENERATED', nullable=False))
        batch_op.add_column(sa.Column('based_on_version_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            batch_op.f('fk_node_versions_based_on_version_id_node_versions'), 
            'node_versions', ['based_on_version_id'], ['id']
        )

    with op.batch_alter_table('node_instances', schema=None) as batch_op:
        # Add the new user_id column as non-nullable, enforcing data integrity for new records.
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=False))
        batch_op.create_index(batch_op.f('ix_node_instances_user_id'), ['user_id'], unique=False)
        batch_op.create_foreign_key(
            batch_op.f('fk_node_instances_user_id_users'), 
            'users', ['user_id'], ['id']
        )

    with op.batch_alter_table('workflow_instances', schema=None) as batch_op:
        # Add the new user_id column as non-nullable.
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=False))
        # Alter the existing project_id column to be non-nullable, completing the data model refactoring.
        batch_op.alter_column('project_id', existing_type=sa.INTEGER(), nullable=False)
        batch_op.create_index(batch_op.f('ix_workflow_instances_user_id'), ['user_id'], unique=False)
        batch_op.create_foreign_key(
            batch_op.f('fk_workflow_instances_user_id_users'), 
            'users', ['user_id'], ['id']
        )
        batch_op.drop_column('external_data_refs')

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###

    with op.batch_alter_table('workflow_instances', schema=None) as batch_op:
        batch_op.add_column(sa.Column('external_data_refs', sa.JSON(), nullable=True))
        batch_op.drop_constraint(batch_op.f('fk_workflow_instances_user_id_users'), type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_workflow_instances_user_id'))
        batch_op.drop_column('user_id')
        batch_op.alter_column('project_id', existing_type=sa.INTEGER(), nullable=True)

    with op.batch_alter_table('node_instances', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('fk_node_instances_user_id_users'), type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_node_instances_user_id'))
        batch_op.drop_column('user_id')

    with op.batch_alter_table('node_versions', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('fk_node_versions_based_on_version_id_node_versions'), type_='foreignkey')
        batch_op.drop_column('based_on_version_id')
        batch_op.drop_column('source')

    # Drop the enum type from the database.
    version_source_enum.drop(op.get_bind(), checkfirst=False)
    
    # ### end Alembic commands ###

```

### alembic/versions/__init__.py Content:

```py
# This file is intentionally left empty.

```

### alembic/versions/a9c8b7d6e5f4_add_project_and_file_models.py Content:

```py
"""Add Project, ProjectFile, and HistoricalProblem models

Revision ID: a9c8b7d6e5f4
Revises: d78b8a3e7d5e
Create Date: 2024-05-22 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.ext.mutable import MutableDict


# revision identifiers, used by Alembic.
revision = "a9c8b7d6e5f4"
down_revision = "d78b8a3e7d5e"
branch_labels = None
depends_on = None


project_status_enum = sa.Enum("Configuring", "Running", "Completed", name="projectstatus")
problem_type_enum = sa.Enum("A", "B", "C", "D", "E", "F", "-", name="problemtype")
file_role_enum = sa.Enum("Problem Description", "Dataset", "Reference Material", name="filerole")


def upgrade() -> None:
    problem_type_enum_for_projects = problem_type_enum.copy()

    op.create_table(
        "historical_problems",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("type", problem_type_enum, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description_path", sa.String(), nullable=False),
        sa.Column("dataset_path", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("historical_problems", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_historical_problems_id"), ["id"], unique=False)

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", project_status_enum, nullable=False),
        sa.Column("problem_type", problem_type_enum_for_projects, nullable=False),
        sa.Column("configuration_snapshot", MutableDict.as_mutable(sa.JSON()), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("historical_problem_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["historical_problem_id"], ["historical_problems.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "name", name="_user_project_name_uc"),
    )
    with op.batch_alter_table("projects", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_projects_id"), ["id"], unique=False)
        batch_op.create_index(batch_op.f("ix_projects_name"), ["name"], unique=False)
        batch_op.create_index(batch_op.f("ix_projects_user_id"), ["user_id"], unique=False)

    op.create_table(
        "project_files",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("filename", sa.String(), nullable=False),
        sa.Column("role", file_role_enum, nullable=False),
        sa.Column("storage_path", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("storage_path"),
    )
    with op.batch_alter_table("project_files", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_project_files_id"), ["id"], unique=False)
        batch_op.create_index(batch_op.f("ix_project_files_project_id"), ["project_id"], unique=False)
        batch_op.create_index(batch_op.f("ix_project_files_user_id"), ["user_id"], unique=False)

    with op.batch_alter_table("workflow_instances", schema=None) as batch_op:
        batch_op.add_column(sa.Column("project_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            batch_op.f("fk_workflow_instances_project_id"),
            "projects",
            ["project_id"],
            ["id"],
        )
        batch_op.create_unique_constraint(
            batch_op.f("uq_workflow_instances_project_id"), ["project_id"]
        )


def downgrade() -> None:
    with op.batch_alter_table("workflow_instances", schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f("uq_workflow_instances_project_id"), type_="unique")
        batch_op.drop_constraint(batch_op.f("fk_workflow_instances_project_id"), type_="foreignkey")
        batch_op.drop_column("project_id")

    with op.batch_alter_table("project_files", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_project_files_user_id"))
        batch_op.drop_index(batch_op.f("ix_project_files_project_id"))
        batch_op.drop_index(batch_op.f("ix_project_files_id"))
    op.drop_table("project_files")

    with op.batch_alter_table("projects", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_projects_user_id"))
        batch_op.drop_index(batch_op.f("ix_projects_name"))
        batch_op.drop_index(batch_op.f("ix_projects_id"))
    op.drop_table("projects")

    with op.batch_alter_table("historical_problems", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_historical_problems_id"))
    op.drop_table("historical_problems")

    file_role_enum.drop(op.get_bind(), checkfirst=False)
    project_status_enum.drop(op.get_bind(), checkfirst=False)
    problem_type_enum.drop(op.get_bind(), checkfirst=False)

```

### alembic/versions/b83f6d2e1c4a_normalize_enum_values.py Content:

```py
"""Normalize stored ENUM values to match application definitions.

This migration rebuilds PostgreSQL ENUM types so their labels align with the
human-readable values defined in the application layer. It also backfills
existing data to the new representations.
"""

from collections.abc import Iterable
from typing import Dict, List, Sequence, Tuple

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "b83f6d2e1c4a"
down_revision = "3a5b6c7d8e9f"
branch_labels = None
depends_on = None


EnumSpec = Dict[str, object]


ENUM_SPECS: List[EnumSpec] = [
    {
        "name": "projectstatus",
        "columns": [("projects", "status")],
        "upgrade": {
            "values": ["Configuring", "Running", "Completed"],
            "map": {
                "CONFIGURING": "Configuring",
                "RUNNING": "Running",
                "COMPLETED": "Completed",
                "Configuring": "Configuring",
                "Running": "Running",
                "Completed": "Completed",
            },
        },
        "downgrade": {
            "values": ["CONFIGURING", "RUNNING", "COMPLETED"],
            "map": {
                "Configuring": "CONFIGURING",
                "Running": "RUNNING",
                "Completed": "COMPLETED",
                "CONFIGURING": "CONFIGURING",
                "RUNNING": "RUNNING",
                "COMPLETED": "COMPLETED",
            },
        },
    },
    {
        "name": "workflowstatus",
        "columns": [("workflow_instances", "status")],
        "upgrade": {
            "values": ["Running", "Completed"],
            "map": {
                "RUNNING": "Running",
                "COMPLETED": "Completed",
                "Running": "Running",
                "Completed": "Completed",
            },
        },
        "downgrade": {
            "values": ["RUNNING", "COMPLETED"],
            "map": {
                "Running": "RUNNING",
                "Completed": "COMPLETED",
                "RUNNING": "RUNNING",
                "COMPLETED": "COMPLETED",
            },
        },
    },
    {
        "name": "nodetype",
        "columns": [("node_instances", "node_type")],
        "upgrade": {
            "values": ["Standard", "Generator"],
            "map": {
                "STANDARD": "Standard",
                "GENERATOR": "Generator",
                "Standard": "Standard",
                "Generator": "Generator",
            },
        },
        "downgrade": {
            "values": ["STANDARD", "GENERATOR"],
            "map": {
                "Standard": "STANDARD",
                "Generator": "GENERATOR",
                "STANDARD": "STANDARD",
                "GENERATOR": "GENERATOR",
            },
        },
    },
    {
        "name": "nodestatus",
        "columns": [("node_instances", "status")],
        "upgrade": {
            "values": [
                "Not Started",
                "Executing",
                "Awaiting HITL Approval",
                "Completed",
                "Failed",
            ],
            "map": {
                "NOT_STARTED": "Not Started",
                "EXECUTING": "Executing",
                "AWAITING_HITL_APPROVAL": "Awaiting HITL Approval",
                "COMPLETED": "Completed",
                "FAILED": "Failed",
                "Not Started": "Not Started",
                "Executing": "Executing",
                "Awaiting HITL Approval": "Awaiting HITL Approval",
                "Completed": "Completed",
                "Failed": "Failed",
            },
        },
        "downgrade": {
            "values": [
                "NOT_STARTED",
                "EXECUTING",
                "AWAITING_HITL_APPROVAL",
                "COMPLETED",
                "FAILED",
            ],
            "map": {
                "Not Started": "NOT_STARTED",
                "Executing": "EXECUTING",
                "Awaiting HITL Approval": "AWAITING_HITL_APPROVAL",
                "Completed": "COMPLETED",
                "Failed": "FAILED",
                "NOT_STARTED": "NOT_STARTED",
                "EXECUTING": "EXECUTING",
                "AWAITING_HITL_APPROVAL": "AWAITING_HITL_APPROVAL",
            },
        },
    },
    {
        "name": "executionstage",
        "columns": [("node_instances", "current_stage")],
        "upgrade": {
            "values": [
                "Not Started",
                "Initializing",
                "Processing",
                "Generating Outputs",
                "Awaiting Review",
                "Completed",
                "Failed",
            ],
            "map": {
                "NOT_STARTED": "Not Started",
                "INITIALIZING": "Initializing",
                "PROCESSING": "Processing",
                "GENERATING_OUTPUTS": "Generating Outputs",
                "AWAITING_REVIEW": "Awaiting Review",
                "COMPLETED": "Completed",
                "FAILED": "Failed",
                "Not Started": "Not Started",
                "Initializing": "Initializing",
                "Processing": "Processing",
                "Generating Outputs": "Generating Outputs",
                "Awaiting Review": "Awaiting Review",
                "Completed": "Completed",
                "Failed": "Failed",
            },
        },
        "downgrade": {
            "values": [
                "NOT_STARTED",
                "INITIALIZING",
                "PROCESSING",
                "GENERATING_OUTPUTS",
                "AWAITING_REVIEW",
                "COMPLETED",
                "FAILED",
            ],
            "map": {
                "Not Started": "NOT_STARTED",
                "Initializing": "INITIALIZING",
                "Processing": "PROCESSING",
                "Generating Outputs": "GENERATING_OUTPUTS",
                "Awaiting Review": "AWAITING_REVIEW",
                "Completed": "COMPLETED",
                "Failed": "FAILED",
            },
        },
    },
    {
        "name": "supportedlanguage",
        "columns": [("user_settings", "language")],
        "upgrade": {
            "values": ["en", "zh"],
            "map": {"EN": "en", "ZH": "zh", "en": "en", "zh": "zh"},
        },
        "downgrade": {
            "values": ["EN", "ZH"],
            "map": {"en": "EN", "zh": "ZH", "EN": "EN", "ZH": "ZH"},
        },
    },
    {
        "name": "interfacetheme",
        "columns": [("user_settings", "theme")],
        "upgrade": {
            "values": ["light", "dark"],
            "map": {"LIGHT": "light", "DARK": "dark", "light": "light", "dark": "dark"},
        },
        "downgrade": {
            "values": ["LIGHT", "DARK"],
            "map": {"light": "LIGHT", "dark": "DARK", "LIGHT": "LIGHT", "DARK": "DARK"},
        },
    },
    {
        "name": "hitlprofile",
        "columns": [("user_settings", "hitl_profile")],
        "upgrade": {
            "values": ["Novice", "Experienced", "Expert"],
            "map": {
                "NOVICE": "Novice",
                "EXPERIENCED": "Experienced",
                "EXPERT": "Expert",
                "Novice": "Novice",
                "Experienced": "Experienced",
                "Expert": "Expert",
            },
        },
        "downgrade": {
            "values": ["NOVICE", "EXPERIENCED", "EXPERT"],
            "map": {
                "Novice": "NOVICE",
                "Experienced": "EXPERIENCED",
                "Expert": "EXPERT",
            },
        },
    },
    {
        "name": "thinkingdepth",
        "columns": [("user_settings", "thinking_depth")],
        "upgrade": {
            "values": ["Instant", "Medium", "Heavy"],
            "map": {
                "INSTANT": "Instant",
                "MEDIUM": "Medium",
                "HEAVY": "Heavy",
                "Instant": "Instant",
                "Medium": "Medium",
                "Heavy": "Heavy",
            },
        },
        "downgrade": {
            "values": ["INSTANT", "MEDIUM", "HEAVY"],
            "map": {
                "Instant": "INSTANT",
                "Medium": "MEDIUM",
                "Heavy": "HEAVY",
            },
        },
    },
]


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return

    for spec in ENUM_SPECS:
        _redefine_enum(
            type_name=spec["name"],
            new_values=spec["upgrade"]["values"],
            columns=spec["columns"],
            value_map=spec["upgrade"]["map"],
            bind=bind,
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return

    # Apply in reverse order to avoid dependency issues.
    for spec in reversed(ENUM_SPECS):
        _redefine_enum(
            type_name=spec["name"],
            new_values=spec["downgrade"]["values"],
            columns=spec["columns"],
            value_map=spec["downgrade"]["map"],
            bind=bind,
        )


def _redefine_enum(
    *,
    type_name: str,
    new_values: Sequence[str],
    columns: Iterable[Tuple[str, str]],
    value_map: Dict[str, str],
    bind,
) -> None:
    """Rebuild a PostgreSQL ENUM type and migrate data."""

    op.execute(f"ALTER TYPE {type_name} RENAME TO {type_name}_old")
    sa.Enum(*new_values, name=type_name).create(bind, checkfirst=False)

    for table_name, column_name in columns:
        case_sql = _build_case_expression(column_name, value_map)
        op.execute(
            f"""
            ALTER TABLE {table_name}
            ALTER COLUMN "{column_name}" TYPE {type_name}
            USING ({case_sql})::{type_name}
            """
        )

    op.execute(f"DROP TYPE {type_name}_old")


def _build_case_expression(column_name: str, value_map: Dict[str, str]) -> str:
    column_expr = f'"{column_name}"'
    parts = [f"WHEN {column_expr}::text = '{old}' THEN '{new}'" for old, new in value_map.items()]
    parts.insert(0, f"WHEN {column_expr} IS NULL THEN NULL")
    parts.append(f"ELSE {column_expr}::text")
    return f"(CASE {' '.join(parts)} END)"

```

### alembic/versions/d78b8a3e7d5e_add_user_and_usersettings_models.py Content:

```py
"""Add User and UserSettings models

Revision ID: d78b8a3e7d5e
Revises: f8a3a2a1b0c9
Create Date: 2024-05-22 10:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd78b8a3e7d5e'
down_revision = 'f8a3a2a1b0c9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('hashed_password', sa.String(), nullable=False),
    sa.Column('display_name', sa.String(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('is_verified', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    op.create_table('user_settings',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('language', sa.Enum('EN', 'ZH', name='supportedlanguage'), nullable=False),
    sa.Column('theme', sa.Enum('LIGHT', 'DARK', name='interfacetheme'), nullable=False),
    sa.Column('hitl_profile', sa.Enum('NOVICE', 'EXPERIENCED', 'EXPERT', name='hitlprofile'), nullable=False),
    sa.Column('thinking_depth', sa.Enum('INSTANT', 'MEDIUM', 'HEAVY', name='thinkingdepth'), nullable=False),
    sa.Column('llm_model_name', sa.String(), nullable=True),
    sa.Column('llm_base_url', sa.String(), nullable=True),
    sa.Column('llm_api_key_encrypted', sa.String(), nullable=True),
    sa.Column('e2b_api_key_encrypted', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_settings_id'), 'user_settings', ['id'], unique=False)
    op.create_index(op.f('ix_user_settings_user_id'), 'user_settings', ['user_id'], unique=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_user_settings_user_id'), table_name='user_settings')
    op.drop_index(op.f('ix_user_settings_id'), table_name='user_settings')
    op.drop_table('user_settings')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    # ### end Alembic commands ###


```

### alembic/versions/f8a3a2a1b0c9_initial_migration.py Content:

```py
"""Initial migration

Revision ID: f8a3a2a1b0c9
Revises: 
Create Date: 2024-05-22 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.ext.mutable import MutableDict, MutableList


# revision identifiers, used by Alembic.
revision = "f8a3a2a1b0c9"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "workflow_instances",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("status", sa.Enum("RUNNING", "COMPLETED", name="workflowstatus"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("external_data_refs", MutableDict.as_mutable(sa.JSON()), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_workflow_instances_id"), "workflow_instances", ["id"], unique=False)
    op.create_index(op.f("ix_workflow_instances_name"), "workflow_instances", ["name"], unique=False)

    op.create_table(
        "node_instances",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workflow_instance_id", sa.Integer(), nullable=False),
        sa.Column("definition_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("node_type", sa.Enum("STANDARD", "GENERATOR", name="nodetype"), nullable=False),
        sa.Column("hitl_mode", sa.Enum("VARL", "SCA", "AVL", name="hitlmode"), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "NOT_STARTED",
                "EXECUTING",
                "AWAITING_HITL_APPROVAL",
                "COMPLETED",
                "FAILED",
                name="nodestatus",
            ),
            nullable=True,
        ),
        sa.Column(
            "current_stage",
            sa.Enum(
                "NOT_STARTED",
                "INITIALIZING",
                "PROCESSING",
                "GENERATING_OUTPUTS",
                "AWAITING_REVIEW",
                "COMPLETED",
                "FAILED",
                name="executionstage",
            ),
            nullable=True,
        ),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column("active_version_id", sa.Integer(), nullable=True),
        sa.Column("dependencies", MutableDict.as_mutable(sa.JSON()), nullable=True),
        sa.Column("external_inputs", MutableList.as_mutable(sa.JSON()), nullable=True),
        sa.Column("phase_id", sa.String(), nullable=False),
        sa.Column("task_group_id", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["workflow_instance_id"], ["workflow_instances.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_node_instances_definition_id"), "node_instances", ["definition_id"], unique=False)
    op.create_index(op.f("ix_node_instances_id"), "node_instances", ["id"], unique=False)
    op.create_index(op.f("ix_node_instances_phase_id"), "node_instances", ["phase_id"], unique=False)
    op.create_index(op.f("ix_node_instances_task_group_id"), "node_instances", ["task_group_id"], unique=False)

    op.create_table(
        "node_versions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("node_instance_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("output_data", MutableDict.as_mutable(sa.JSON()), nullable=True),
        sa.Column("raw_generated_output", MutableDict.as_mutable(sa.JSON()), nullable=True),
        sa.Column("input_dependencies", MutableDict.as_mutable(sa.JSON()), nullable=False),
        sa.Column("hitl_history", MutableList.as_mutable(sa.JSON()), nullable=False),
        sa.Column("llm_model_name", sa.String(), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=False),
        sa.Column("summary", sa.String(length=512), nullable=False),
        sa.ForeignKeyConstraint(["node_instance_id"], ["node_instances.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("node_instance_id", "version_number", name="_node_version_uc"),
    )
    op.create_index(op.f("ix_node_versions_id"), "node_versions", ["id"], unique=False)

    op.create_table(
        "temporary_execution_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("node_instance_id", sa.Integer(), nullable=False),
        sa.Column("output_data", MutableDict.as_mutable(sa.JSON()), nullable=True),
        sa.Column("input_dependencies", MutableDict.as_mutable(sa.JSON()), nullable=False),
        sa.Column("accumulated_hitl_interactions", MutableList.as_mutable(sa.JSON()), nullable=False),
        sa.Column("llm_model_name", sa.String(), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=False),
        sa.Column("error_log", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["node_instance_id"], ["node_instances.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("node_instance_id"),
    )
    op.create_index(
        op.f("ix_temporary_execution_results_id"), "temporary_execution_results", ["id"], unique=False
    )

    # Add the foreign key for the circular dependency after both tables are created
    op.create_foreign_key(
        "fk_node_instances_active_version_id_node_versions",
        "node_instances",
        "node_versions",
        ["active_version_id"],
        ["id"],
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(
        "fk_node_instances_active_version_id_node_versions", "node_instances", type_="foreignkey"
    )
    op.drop_index(op.f("ix_temporary_execution_results_id"), table_name="temporary_execution_results")
    op.drop_table("temporary_execution_results")
    op.drop_index(op.f("ix_node_versions_id"), table_name="node_versions")
    op.drop_table("node_versions")
    op.drop_index(op.f("ix_node_instances_task_group_id"), table_name="node_instances")
    op.drop_index(op.f("ix_node_instances_phase_id"), table_name="node_instances")
    op.drop_index(op.f("ix_node_instances_id"), table_name="node_instances")
    op.drop_index(op.f("ix_node_instances_definition_id"), table_name="node_instances")
    op.drop_table("node_instances")
    op.drop_index(op.f("ix_workflow_instances_name"), table_name="workflow_instances")
    op.drop_index(op.f("ix_workflow_instances_id"), table_name="workflow_instances")
    op.drop_table("workflow_instances")
    # ### end Alembic commands ###

```

    ## auth
     - __init__.py
     - dependencies.py
     - security.py
     - service.py

### auth/__init__.py Content:

```py
"""
Authentication and Authorization (Auth) package.

This package encapsulates all logic related to user identity, access control,
and security primitives for the O-Award Modeling Platform. It will handle
user registration, login (JWT), password management, and API key encryption.
"""

```

### auth/dependencies.py Content:

```py
"""
FastAPI dependencies for authentication and authorization.

Provides reusable dependency functions that decode JWTs and ensure the
current user is active and verified before accessing protected endpoints.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError, jwt
from loguru import logger
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db
from backend.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Decode the JWT access token and fetch the corresponding user."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
    except JWTError:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except (TypeError, ValueError):
        raise credentials_exception

    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_verified_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensure the authenticated user is both active and verified.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account.")
    if not current_user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is not verified.")
    return current_user


async def get_user_from_token(token: str, db: Session) -> Optional[User]:
    """
    Decode a JWT specifically for WebSocket auth flows.

    Returns the user instance or None so callers can close the connection with a
    custom code instead of raising HTTPException.
    """
    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            logger.warning("WebSocket auth failed: 'sub' claim missing in token.")
            return None

        user_id = int(user_id_str)
        user = db.get(User, user_id)
        if user is None:
            logger.warning(
                "WebSocket auth failed: User ID {user_id} from token not found in DB.",
                user_id=user_id,
            )
            return None

        return user
    except ExpiredSignatureError:
        logger.info("WebSocket auth failed: Token has expired.")
        return None
    except (JWTError, ValueError, TypeError) as exc:
        logger.warning("WebSocket auth failed due to malformed token: {}", str(exc))
        return None

```

### auth/security.py Content:

```py
"""Core security utilities for password hashing, JWT, and BYOK encryption."""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional, Union

from cryptography.fernet import Fernet
from jose import jwt

from backend.config import settings

PASSWORD_SCHEME = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 390_000
PASSWORD_SALT_BYTES = 16

_fernet = Fernet(settings.ENCRYPTION_KEY)


def _encode_bytes(raw: bytes) -> str:
    return base64.b64encode(raw).decode("utf-8")


def _decode_bytes(value: str) -> bytes:
    return base64.b64decode(value.encode("utf-8"))


def get_password_hash(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256.

    Returns a multi-part string containing the scheme, iterations, salt, and hash.
    """
    if not isinstance(password, str) or not password:
        raise ValueError("Password must be a non-empty string.")

    salt = secrets.token_bytes(PASSWORD_SALT_BYTES)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return f"{PASSWORD_SCHEME}${PASSWORD_ITERATIONS}${_encode_bytes(salt)}${_encode_bytes(derived)}"


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Compare a password to a stored PBKDF2 hash string.

    Returns True if the password matches, otherwise False.
    """
    try:
        scheme, iterations_str, salt_b64, hash_b64 = hashed_password.split("$")
        if scheme != PASSWORD_SCHEME:
            return False
        iterations = int(iterations_str)
        salt = _decode_bytes(salt_b64)
        stored_hash = _decode_bytes(hash_b64)
    except (ValueError, TypeError):
        return False

    new_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(new_hash, stored_hash)


def encrypt_data(value: Optional[Union[str, bytes]]) -> Optional[str]:
    """
    Encrypt arbitrary user-supplied data using the configured Fernet key.

    Returns the encrypted token as a string, or None if the input is falsy.
    """
    if value is None:
        return None

    raw_bytes = value if isinstance(value, bytes) else value.encode("utf-8")
    token = _fernet.encrypt(raw_bytes)
    return token.decode("utf-8")


def decrypt_data(value: Optional[Union[str, bytes]]) -> Optional[str]:
    """
    Decrypt previously encrypted data.

    Raises cryptography.fernet.InvalidToken if the value cannot be decrypted.
    """
    if value is None:
        return None

    token_bytes = value if isinstance(value, bytes) else value.encode("utf-8")
    plaintext = _fernet.decrypt(token_bytes)
    return plaintext.decode("utf-8")


def create_access_token(data: dict) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


__all__ = [
    "decrypt_data",
    "encrypt_data",
    "get_password_hash",
    "verify_password",
    "create_access_token",
]

```

### auth/service.py Content:

```py
"""
Service layer for user authentication and lifecycle management.
Orchestrates user registration, credential verification (login), and
provides stubs for email verification and password reset flows.
"""
from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.security import get_password_hash, verify_password
from backend.exceptions import InvalidStateException
from backend.models.user import User, UserSettings
from backend.schemas.user import UserCreate


class AuthService:
    """Service for user authentication and lifecycle management."""

    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Fetches a user by their email address."""
        return db.query(User).filter(User.email == email).first()

    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user by email and password.

        Args:
            db: The database session.
            email: The user's email.
            password: The user's plain-text password.

        Returns:
            The authenticated User object if credentials are valid, otherwise None.
        """
        user = self.get_user_by_email(db, email)
        if not user or not user.is_active:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    def register_user(self, db: Session, user_in: UserCreate) -> User:
        """
        Register a new user and create their default settings atomically.

        Args:
            db: The database session.
            user_in: A Pydantic model containing user creation data.

        Returns:
            The newly created User object.

        Raises:
            InvalidStateException: If a user with the email already exists.
        """
        if self.get_user_by_email(db, user_in.email):
            raise InvalidStateException(
                f"User with email '{user_in.email}' already exists.",
                error_code="USER_ALREADY_EXISTS",
            )

        hashed_password = get_password_hash(user_in.password)
        new_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            display_name=user_in.display_name or user_in.email.split("@")[0],
            is_active=True,
            is_verified=False,
        )
        new_user.settings = UserSettings()

        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            logger.info("New user registered successfully", user_id=new_user.id, email=new_user.email)
            return new_user
        except Exception:
            db.rollback()
            logger.exception("Failed to register new user. Transaction rolled back.", email=user_in.email)
            raise

    def verify_email(self) -> None:
        """
        (STUB) Business logic for handling email verification.
        This would typically involve validating a token sent to the user's email.
        """
        logger.warning("STUB: Email verification logic is not implemented.")
        pass

    def reset_password(self) -> None:
        """
        (STUB) Business logic for handling password reset requests.
        This would involve generating a secure token and sending a reset link.
        """
        logger.warning("STUB: Password reset logic is not implemented.")
        pass

```

    ## models
     - __init__.py
     - enum_utils.py
     - project.py
     - user.py
     - workflow.py

### models/__init__.py Content:

```py
"""
SQLAlchemy Models Package.

This file provides a centralized export of all data models and their associated enums,
making them easily importable from a single location (e.g., `from backend.models import User`).
"""

# Project Models
from backend.models.project import (
    FileRole,
    HistoricalProblem,
    ProblemType,
    Project,
    ProjectFile,
    ProjectStatus,
)

# User Models
from backend.models.user import (
    HITLProfile,
    InterfaceTheme,
    SupportedLanguage,
    ThinkingDepth,
    User,
    UserSettings,
)

# Workflow Models
from backend.models.workflow import (
    ExecutionStage,
    NodeInstance,
    NodeStatus,
    NodeVersion,
    TemporaryExecutionResult,
    VersionSource,
    WorkflowInstance,
    WorkflowStatus,
)

__all__ = [
    # Project
    "Project",
    "ProjectFile",
    "HistoricalProblem",
    "ProjectStatus",
    "ProblemType",
    "FileRole",
    # User
    "User",
    "UserSettings",
    "SupportedLanguage",
    "InterfaceTheme",
    "HITLProfile",
    "ThinkingDepth",
    # Workflow
    "WorkflowInstance",
    "NodeInstance",
    "NodeVersion",
    "TemporaryExecutionResult",
    "WorkflowStatus",
    "NodeStatus",
    "ExecutionStage",
    "VersionSource",
]

```

### models/enum_utils.py Content:

```py
"""Shared helpers for SQLAlchemy Enum columns."""

from enum import Enum
from typing import Type


def enum_values(enum_cls: Type[Enum]) -> list[str]:
    """Return Enum member values for consistent SAEnum value storage."""

    return [member.value for member in enum_cls]


__all__ = ["enum_values"]

```

### models/project.py Content:

```py
import datetime
from enum import Enum

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import relationship

from backend.database import Base
from backend.models.enum_utils import enum_values


class ProjectStatus(str, Enum):
    """Defines the lifecycle status of a Project (R2.3)."""

    CONFIGURING = "Configuring"
    RUNNING = "Running"
    COMPLETED = "Completed"


class ProblemType(str, Enum):
    """Defines the competition problem type classification (R3.4)."""

    A = "A"
    B = "B"
    C = "C"
    D = "D"
    E = "E"
    F = "F"
    UNKNOWN = "-"


class FileRole(str, Enum):
    """Defines the role of an uploaded file within a project (R3.2.2)."""

    PROBLEM_DESCRIPTION = "Problem Description"
    DATASET = "Dataset"
    REFERENCE_MATERIAL = "Reference Material"


class Project(Base):
    """
    Project model, the central organizational unit for a modeling task.
    Belongs to a User and contains all related assets and configurations.
    """

    __tablename__ = "projects"
    __table_args__ = (UniqueConstraint("user_id", "name", name="_user_project_name_uc"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(
        SAEnum(ProjectStatus, name="projectstatus", values_callable=enum_values),
        default=ProjectStatus.CONFIGURING,
        nullable=False,
    )
    problem_type = Column(
        SAEnum(ProblemType, name="problemtype", values_callable=enum_values),
        default=ProblemType.UNKNOWN,
        nullable=False,
    )

    # A JSON blob storing the decrypted UserSettings snapshot at the time of workflow
    # start, ensuring reproducible executions with user-specific keys (BYOK) (R7.3).
    configuration_snapshot = Column(MutableDict.as_mutable(JSON), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    historical_problem_id = Column(Integer, ForeignKey("historical_problems.id"), nullable=True)

    user = relationship("User", back_populates="projects")
    historical_problem = relationship("HistoricalProblem")
    files = relationship("ProjectFile", back_populates="project", cascade="all, delete-orphan")
    workflow_instance = relationship(
        "WorkflowInstance", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name='{self.name}', user_id={self.user_id})>"

    @property
    def workflow_instance_id(self) -> int | None:
        """
        Expose the associated workflow id for Pydantic serializers.

        The schema expects this attribute even though the database keeps the
        one-to-one relation on the WorkflowInstance side.
        """
        if self.workflow_instance:
            return self.workflow_instance.id
        return None


class ProjectFile(Base):
    """
    Tracks uploaded files associated with a project (R3.2).
    """

    __tablename__ = "project_files"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)

    # user_id is denormalized here for faster, direct authorization checks on files,
    # avoiding a join with the projects table for simple ownership verification (R1.4).
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    filename = Column(String, nullable=False)
    role = Column(SAEnum(FileRole, name="filerole", values_callable=enum_values), nullable=False)
    storage_path = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="files")
    user = relationship("User")

    def __repr__(self) -> str:
        return f"<ProjectFile(id={self.id}, filename='{self.filename}', project_id={self.project_id})>"


class HistoricalProblem(Base):
    """
    Catalogs past competition problems for quick project initialization (R3.3).
    This is a read-only lookup table for the application.
    """

    __tablename__ = "historical_problems"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    type = Column(SAEnum(ProblemType, name="problemtype", values_callable=enum_values), nullable=False)
    name = Column(String, nullable=False)
    description_path = Column(String, nullable=False)
    dataset_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self) -> str:
        return f"<HistoricalProblem(id={self.id}, name='{self.name}', year={self.year})>"

```

### models/user.py Content:

```py
"""User and UserSettings models (Task 4)."""

import datetime
from enum import Enum

from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.database import Base
from backend.models.enum_utils import enum_values


class SupportedLanguage(str, Enum):
    EN = "en"
    ZH = "zh"


class InterfaceTheme(str, Enum):
    LIGHT = "light"
    DARK = "dark"


class HITLProfile(str, Enum):
    NOVICE = "Novice"
    EXPERIENCED = "Experienced"
    EXPERT = "Expert"


class ThinkingDepth(str, Enum):
    INSTANT = "Instant"
    MEDIUM = "Medium"
    HEAVY = "Heavy"


class User(Base):
    """User model for authentication and ownership."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    settings = relationship(
        "UserSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    # Relationship to Project model, with cascading delete.
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    workflows = relationship("WorkflowInstance", back_populates="user", cascade="all, delete-orphan")
    nodes = relationship("NodeInstance", back_populates="user")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"


class UserSettings(Base):
    """User-specific settings for interface, behavior, and BYOK configuration."""

    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    language = Column(
        SAEnum(SupportedLanguage, name="supportedlanguage", values_callable=enum_values),
        default=SupportedLanguage.EN,
        nullable=False,
    )
    theme = Column(
        SAEnum(InterfaceTheme, name="interfacetheme", values_callable=enum_values),
        default=InterfaceTheme.LIGHT,
        nullable=False,
    )

    hitl_profile = Column(
        SAEnum(HITLProfile, name="hitlprofile", values_callable=enum_values),
        default=HITLProfile.EXPERIENCED,
        nullable=False,
    )
    thinking_depth = Column(
        SAEnum(ThinkingDepth, name="thinkingdepth", values_callable=enum_values),
        default=ThinkingDepth.MEDIUM,
        nullable=False,
    )

    llm_model_name = Column(String, nullable=True)
    llm_base_url = Column(String, nullable=True)
    llm_api_key_encrypted = Column(String, nullable=True)
    e2b_api_key_encrypted = Column(String, nullable=True)

    user = relationship("User", back_populates="settings")

    def __repr__(self) -> str:
        return f"<UserSettings(id={self.id}, user_id={self.user_id})>"

```

### models/workflow.py Content:

```py
import datetime
from enum import Enum

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.ext.mutable import MutableDict, MutableList
from sqlalchemy.orm import relationship

from backend.database import Base
from backend.models.enum_utils import enum_values
from backend.workflow_definition import HITLMode, NodeType


class WorkflowStatus(str, Enum):
    RUNNING = "Running"
    COMPLETED = "Completed"


class VersionSource(str, Enum):
    """(R4.3) Defines the origin of a node version."""

    AI_GENERATED = "AI_GENERATED"
    MANUALLY_EDITED = "MANUALLY_EDITED"


class WorkflowInstance(Base):
    __tablename__ = "workflow_instances"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(
        SAEnum(WorkflowStatus, name="workflowstatus", values_callable=enum_values),
        default=WorkflowStatus.RUNNING,
    )
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    # external_data_refs removed in favor of Project-based file resolution.
    # project_id and user_id are non-nullable to enforce multi-tenancy.
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    nodes = relationship(
        "NodeInstance",
        back_populates="workflow",
        cascade="all, delete-orphan",
        order_by="NodeInstance.order_index",
    )
    project = relationship("Project", back_populates="workflow_instance", uselist=False)
    # The `back_populates` assumes a 'workflows' relationship on the User model.
    user = relationship("User", back_populates="workflows")


class NodeStatus(str, Enum):
    NOT_STARTED = "Not Started"
    EXECUTING = "Executing"
    AWAITING_HITL_APPROVAL = "Awaiting HITL Approval"
    COMPLETED = "Completed"
    FAILED = "Failed"


class ExecutionStage(str, Enum):
    """Represents granular execution progress for nodes (R4.3)."""

    NOT_STARTED = "Not Started"
    INITIALIZING = "Initializing"
    PROCESSING = "Processing"
    GENERATING_OUTPUTS = "Generating Outputs"
    AWAITING_REVIEW = "Awaiting Review"
    COMPLETED = "Completed"
    FAILED = "Failed"


class NodeInstance(Base):
    __tablename__ = "node_instances"

    id = Column(Integer, primary_key=True, index=True)
    workflow_instance_id = Column(Integer, ForeignKey("workflow_instances.id"), nullable=False)
    # user_id is non-nullable and denormalized for efficient auth checks.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    definition_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    node_type = Column(SAEnum(NodeType, name="nodetype", values_callable=enum_values), nullable=False)
    hitl_mode = Column(SAEnum(HITLMode, name="hitlmode", values_callable=enum_values), nullable=False)
    status = Column(SAEnum(NodeStatus, name="nodestatus", values_callable=enum_values), default=NodeStatus.NOT_STARTED)
    current_stage = Column(
        SAEnum(ExecutionStage, name="executionstage", values_callable=enum_values),
        default=ExecutionStage.NOT_STARTED,
    )
    order_index = Column(Integer, nullable=False)
    active_version_id = Column(Integer, ForeignKey("node_versions.id"), nullable=True)
    dependencies = Column(MutableDict.as_mutable(JSON), nullable=True)
    external_inputs = Column(MutableList.as_mutable(JSON), nullable=True)
    phase_id = Column(String, nullable=False, index=True)
    task_group_id = Column(String, nullable=True, index=True)

    workflow = relationship("WorkflowInstance", back_populates="nodes")
    # The `back_populates` assumes a 'nodes' relationship on the User model.
    user = relationship("User", back_populates="nodes")
    versions = relationship(
        "NodeVersion",
        back_populates="node_instance",
        # Use Column object for robust foreign_keys definition.
        foreign_keys="NodeVersion.node_instance_id",
        cascade="all, delete-orphan",
    )
    active_version = relationship("NodeVersion", foreign_keys=[active_version_id], post_update=True)
    temporary_result = relationship(
        "TemporaryExecutionResult",
        back_populates="node_instance",
        uselist=False,
        cascade="all, delete-orphan",
    )


class NodeVersion(Base):
    __tablename__ = "node_versions"

    id = Column(Integer, primary_key=True, index=True)
    node_instance_id = Column(Integer, ForeignKey("node_instances.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    version_number = Column(Integer, nullable=False)
    # (R4.3) Fields for tracking manual editing.
    source = Column(
        SAEnum(VersionSource, name="versionsource", values_callable=enum_values),
        nullable=False,
        default=VersionSource.AI_GENERATED,
    )
    based_on_version_id = Column(Integer, ForeignKey("node_versions.id"), nullable=True)
    output_data = Column(MutableDict.as_mutable(JSON), nullable=True)
    raw_generated_output = Column(MutableDict.as_mutable(JSON), nullable=True)
    # Stores Dict[int, int] (NodeID -> VersionID); MutableDict preserves integer keys.
    input_dependencies = Column(MutableDict.as_mutable(JSON), nullable=False)
    hitl_history = Column(MutableList.as_mutable(JSON), nullable=False)
    llm_model_name = Column(String, nullable=False)
    temperature = Column(Float, nullable=False)
    summary = Column(String(512), nullable=False, default="Version created")

    node_instance = relationship("NodeInstance", back_populates="versions", foreign_keys=[node_instance_id])
    based_on_version = relationship("NodeVersion", remote_side=[id], foreign_keys=[based_on_version_id])

    __table_args__ = (UniqueConstraint("node_instance_id", "version_number", name="_node_version_uc"),)


class TemporaryExecutionResult(Base):
    __tablename__ = "temporary_execution_results"

    id = Column(Integer, primary_key=True, index=True)
    node_instance_id = Column(Integer, ForeignKey("node_instances.id"), unique=True, nullable=False)
    output_data = Column(MutableDict.as_mutable(JSON), nullable=True)
    # Stores Dict[int, int] for live execution context.
    input_dependencies = Column(MutableDict.as_mutable(JSON), nullable=False)
    accumulated_hitl_interactions = Column(MutableList.as_mutable(JSON), nullable=False)
    llm_model_name = Column(String, nullable=False)
    temperature = Column(Float, nullable=False)
    error_log = Column(Text, nullable=True)

    node_instance = relationship("NodeInstance", back_populates="temporary_result")

```

    ## routers
     - __init__.py
     - auth.py
     - nodes.py
     - projects.py
     - users.py
     - workflows.py

### routers/__init__.py Content:

```py
from fastapi import APIRouter

from backend.routers.auth import router as auth_router
from backend.routers.nodes import router as nodes_router
from backend.routers.projects import router as projects_router
from backend.routers.users import router as users_router
from backend.routers.workflows import router as workflows_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(projects_router)
api_router.include_router(workflows_router)
api_router.include_router(nodes_router)

__all__ = ["api_router", "auth_router", "nodes_router", "projects_router", "users_router", "workflows_router"]

```

### routers/auth.py Content:

```py
"""API endpoints for user authentication and registration."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.auth.security import create_access_token
from backend.auth.service import AuthService
from backend.database import get_db
from backend.exceptions import InvalidStateException
from backend.schemas.auth import Token
from backend.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_auth_service() -> AuthService:
    """Provide an AuthService instance for request-scoped dependencies."""
    return AuthService()


@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Authenticate user credentials and return a JWT access token."""
    user = auth_service.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not verified. Please check your email.",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Register a new user account."""
    try:
        return auth_service.register_user(db, user_in=user_in)
    except InvalidStateException as exc:
        raise exc


@router.post("/reset-password", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(auth_service: AuthService = Depends(get_auth_service)):
    """Stub endpoint for initiating password reset flow."""
    auth_service.reset_password()
    return {"message": "If an account with this email exists, a password reset link has been sent."}


```

### routers/nodes.py Content:

```py
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user
from backend.database import get_db
from backend.models.user import User
from backend.schemas.hitl import ExecutionRequest, HITLSubmission
from backend.schemas.node import ManualEditSubmission, NodeDetailView, NodeInstanceRead, NodeVersionRead
from backend.services.hitl_service import HITLService
from backend.services.node_service import NodeService

router = APIRouter(prefix="/nodes", tags=["Nodes"])


def get_node_service(db: Session = Depends(get_db)) -> NodeService:
    return NodeService(db)


def get_hitl_service(
    db: Session = Depends(get_db),
    node_service: NodeService = Depends(get_node_service),
) -> HITLService:
    return HITLService(db, node_service)


@router.get("/{node_id}", response_model=NodeDetailView)
def get_node_details(
    node_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_node_detail_view(node_id, current_user)


@router.post(
    "/{node_id}/re-execute",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=Dict[str, Any],
    summary="Re-execute a COMPLETED node",
)
async def re_execute_node(
    node_id: int,
    request: ExecutionRequest,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    await service.enqueue_re_execution(
        node_id,
        current_user,
        user_feedback=request.modification_comments,
        base_version_id=request.base_version_id,
    )
    return {"message": "Node re-execution has been accepted for processing.", "node_id": node_id}


@router.post(
    "/{node_id}/retry",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=Dict[str, Any],
    summary="Retry a FAILED node",
)
async def retry_node(
    node_id: int,
    request: ExecutionRequest,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    await service.enqueue_retry(
        node_id,
        current_user,
        user_feedback=request.modification_comments,
    )
    return {"message": "Node retry has been accepted for processing.", "node_id": node_id}


@router.post("/{node_id}/hitl", response_model=Dict[str, Any])
async def submit_hitl_action(
    node_id: int,
    submission: HITLSubmission,
    service: HITLService = Depends(get_hitl_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return await service.process_submission(node_id, submission, current_user)


@router.post(
    "/{node_id}/manual-edit",
    response_model=NodeInstanceRead,
    summary="Submit a manual edit for a node's output (R4)",
    description="""
Manually edit a node's output, creating a new version (R4).

This action creates a new 'Manually Edited' version based on a specified
base version, sets it as the active version, and marks the node as 'Completed'.
If the node was awaiting HITL approval, this serves as an override.
This action will trigger a staleness check on downstream nodes and advance the workflow.
    """,
)
async def submit_manual_edit(
    node_id: int,
    submission: ManualEditSubmission,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    updated_node = await service.submit_manual_edit(node_id, current_user, submission)
    return updated_node


@router.get("/{node_id}/versions", response_model=List[NodeVersionRead])
def get_node_versions(
    node_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_versions(node_id, current_user)


@router.get("/{node_id}/versions/{version_id}", response_model=NodeVersionRead)
def get_node_version_details(
    node_id: int,
    version_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_version_details(node_id, version_id, current_user)


@router.post("/{node_id}/versions/{version_id}/activate", response_model=NodeInstanceRead)
async def activate_version(
    node_id: int,
    version_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return await service.switch_active_version(node_id, version_id, current_user)

```

### routers/projects.py Content:

```py
"""API endpoints for project management, file uploads, and workflow initiation."""

import re
from urllib.parse import quote

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user
from backend.database import get_db
from backend.models.project import FileRole
from backend.models.user import User
from backend.schemas.common import PaginatedResponse
from backend.schemas.node import NodeInstanceRead
from backend.schemas.project import (
    HistoricalInitializationRequest,
    ProjectCreate,
    ProjectDetailRead,
    ProjectFileRead,
    ProjectSummaryRead,
    ProjectUpdate,
)
from backend.services.export_service import ExportService
from backend.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])


def get_project_service(db: Session = Depends(get_db)) -> ProjectService:
    """Dependency injector for the ProjectService."""
    return ProjectService(db)


def get_export_service(db: Session = Depends(get_db)) -> ExportService:
    """Dependency injector for the ExportService."""
    return ExportService(db)


@router.post("/", response_model=ProjectDetailRead, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Create a new project for the authenticated user."""
    return service.create_project(project_data, current_user)


@router.get("/", response_model=PaginatedResponse[ProjectSummaryRead])
def list_projects(
    skip: int = 0,
    limit: int = 20,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> PaginatedResponse[ProjectSummaryRead]:
    """List all projects for the authenticated user with lightweight pagination."""
    total, items = service.get_projects_paginated(current_user, skip, limit)
    return PaginatedResponse(total=total, items=items)


@router.get("/{project_id}", response_model=ProjectDetailRead)
def get_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Retrieve full details for a specific project owned by the user."""
    return service.get_project_details(project_id, current_user)


@router.patch("/{project_id}", response_model=ProjectDetailRead)
def update_project(
    project_id: int,
    update_data: ProjectUpdate,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Update a project's name, description, or problem type."""
    return service.update_project(project_id, update_data, current_user)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> None:
    """Delete a project and all its associated data."""
    service.delete_project(project_id, current_user)
    return None


@router.post("/{project_id}/files", response_model=ProjectFileRead, status_code=status.HTTP_201_CREATED)
async def upload_project_file(
    project_id: int,
    file: UploadFile = File(...),
    role: FileRole = Form(...),
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectFileRead:
    """Upload a file (e.g., Problem Description, Dataset) to a project."""
    return await service.upload_file(project_id, current_user, file, role)


@router.post("/{project_id}/initialize-from-historical", response_model=ProjectDetailRead)
def initialize_from_historical_problem(
    project_id: int,
    request: HistoricalInitializationRequest,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Initialize a project with data from the historical problem library (R3.3)."""
    return service.initialize_from_historical(project_id, request.historical_problem_id, current_user)


@router.post("/{project_id}/start", response_model=NodeInstanceRead, status_code=status.HTTP_202_ACCEPTED)
async def start_project_workflow(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> NodeInstanceRead:
    """
    Start the modeling workflow for a configured project (R3.5).

    This action snapshots the user's settings, creates the workflow instance,
    and enqueues the first node for execution.
    """
    return await service.start_workflow(project_id, current_user)


@router.get("/{project_id}/export", response_class=Response)
async def export_project(
    project_id: int,
    project_service: ProjectService = Depends(get_project_service),
    export_service: ExportService = Depends(get_export_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> Response:
    """
    Export the project's results as a ZIP archive (R6).

    Compiles all node outputs, uploaded inputs, and a manifest into a single archive.
    """
    project = project_service.get_project_details(project_id, current_user)
    if not project.workflow_instance:
        raise HTTPException(status_code=404, detail="No workflow has been started for this project to export.")

    zip_bytes = export_service.export_project_to_zip(project)

    sanitized_name = re.sub(r'[\\/*?:"<>|]', "", project.name).strip() or "untitled_project"
    filename = f"{sanitized_name}_export.zip"
    ascii_filename = filename.encode("ascii", "ignore").decode() or "project_export.zip"
    if ascii_filename == filename:
        content_disposition = f'attachment; filename="{ascii_filename}"'
    else:
        encoded_filename = quote(filename)
        content_disposition = (
            f'attachment; filename="{ascii_filename}"; filename*=UTF-8\'\'{encoded_filename}'
        )

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": content_disposition},
    )

```

### routers/users.py Content:

```py
"""API endpoints for managing the current user's profile and settings."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user
from backend.database import get_db
from backend.models.user import User
from backend.schemas.user import UserRead, UserSettingsRead, UserSettingsUpdate
from backend.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service() -> UserService:
    """Provide a UserService instance for request-scoped dependencies."""
    return UserService()


@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_active_verified_user)):
    """Return the authenticated user's profile."""
    return current_user


@router.get("/me/settings", response_model=UserSettingsRead)
async def read_user_settings(
    current_user: User = Depends(get_current_active_verified_user),
    user_service: UserService = Depends(get_user_service),
    db: Session = Depends(get_db),
):
    """Fetch the authenticated user's settings."""
    settings = user_service.get_settings(db, user=current_user)
    return UserSettingsRead(
        language=settings.language,
        theme=settings.theme,
        hitl_profile=settings.hitl_profile,
        thinking_depth=settings.thinking_depth,
        llm_model_name=settings.llm_model_name,
        llm_base_url=settings.llm_base_url,
        has_llm_api_key=bool(settings.llm_api_key_encrypted),
        has_e2b_api_key=bool(settings.e2b_api_key_encrypted),
    )


@router.patch("/me/settings", response_model=UserSettingsRead)
async def update_user_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_verified_user),
    user_service: UserService = Depends(get_user_service),
    db: Session = Depends(get_db),
):
    """Update the authenticated user's settings."""
    updated_settings = user_service.update_settings(db, user=current_user, settings_in=settings_in)
    return UserSettingsRead(
        language=updated_settings.language,
        theme=updated_settings.theme,
        hitl_profile=updated_settings.hitl_profile,
        thinking_depth=updated_settings.thinking_depth,
        llm_model_name=updated_settings.llm_model_name,
        llm_base_url=updated_settings.llm_base_url,
        has_llm_api_key=bool(updated_settings.llm_api_key_encrypted),
        has_e2b_api_key=bool(updated_settings.e2b_api_key_encrypted),
    )


```

### routers/workflows.py Content:

```py
from typing import Dict, List

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user, get_user_from_token
from backend.database import get_db
from backend.models.user import User
from backend.models.workflow import WorkflowInstance
from backend.schemas.common import PaginatedResponse
from backend.schemas.node import NodeInstanceRead, StalenessInfo
from backend.schemas.workflow import WorkflowCreate, WorkflowInstanceRead, WorkflowUpdate
from backend.services.workflow_service import WorkflowService
from backend.ws_manager import manager as ws_manager

router = APIRouter(prefix="/workflows", tags=["Workflows"])


def get_workflow_service(db: Session = Depends(get_db)) -> WorkflowService:
    return WorkflowService(db)


@router.post("/", response_model=WorkflowInstanceRead, status_code=status.HTTP_201_CREATED)
def create_workflow(
    workflow_data: WorkflowCreate,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.create_workflow(workflow_data, current_user)


@router.get("/", response_model=PaginatedResponse[WorkflowInstanceRead])
def list_workflows(
    skip: int = 0,
    limit: int = 20,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_workflows_paginated(current_user, skip, limit)


@router.get("/{workflow_id}", response_model=WorkflowInstanceRead)
def get_workflow(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    workflow = service.get_workflow_instance(workflow_id, current_user)
    return workflow


@router.patch("/{workflow_id}", response_model=WorkflowInstanceRead)
def update_workflow(
    workflow_id: int,
    update_data: WorkflowUpdate,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.update_workflow(workflow_id, update_data, current_user)


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    service.delete_workflow(workflow_id, current_user)
    return None


@router.post("/{workflow_id}/start", response_model=NodeInstanceRead)
async def start_workflow(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return await service.start_workflow(workflow_id, current_user)


@router.get("/{workflow_id}/staleness", response_model=Dict[int, List[StalenessInfo]])
def get_workflow_staleness(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.calculate_bulk_staleness(workflow_id, current_user)


@router.websocket("/{workflow_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    workflow_id: int,
    token: str = Query(..., description="JWT access token for authentication"),
    db: Session = Depends(get_db),
):
    """
    WebSocket endpoint for streaming real-time workflow updates.
    """
    user = await get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4001, reason="Authentication failed: Invalid or expired token")
        return

    workflow = db.get(WorkflowInstance, workflow_id)
    if not workflow or workflow.user_id != user.id:
        logger.warning(
            "WebSocket authorization failed for user {user_id} on workflow {workflow_id}",
            user_id=user.id,
            workflow_id=workflow_id,
        )
        await websocket.close(code=4003, reason="Authorization failed: Access denied")
        return

    await ws_manager.connect(workflow_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(workflow_id, websocket)
    except Exception:
        logger.exception("Unexpected WebSocket error", workflow_id=workflow_id)
        ws_manager.disconnect(workflow_id, websocket)

```

    ## schemas
     - __init__.py
     - auth.py
     - common.py
     - error.py
     - events.py
     - hitl.py
     - node.py
     - project.py
     - user.py
     - workflow.py

### schemas/__init__.py Content:

```py
"""
Pydantic Schemas Package.

This file exports the primary data transfer objects (DTOs) used throughout the
application's API layer, providing a centralized point of access and a clear
public interface for the schemas module.
"""

# Auth Schemas
from backend.schemas.auth import Token, TokenData

# Common Schemas
from backend.schemas.common import PaginatedResponse, SystemInfo

# Error Schema
from backend.schemas.error import ErrorResponse

# Event Schemas
from backend.schemas.events import EventPayload, EventType

# HITL Schemas
from backend.schemas.hitl import (
    Adjudication,
    AdjudicationDecision,
    ExecutionRequest,
    HITLActionType,
    HITLSubmission,
)

# Node Schemas
from backend.schemas.node import (
    ManualEditSubmission,
    NodeDetailView,
    NodeInstanceRead,
    NodeVersionRead,
    StalenessInfo,
    TemporaryExecutionRead,
    VersionData,
)

# Project Schemas
from backend.schemas.project import (
    HistoricalInitializationRequest,
    ProjectCreate,
    ProjectDetailRead,
    ProjectFileRead,
    ProjectSummaryRead,
    ProjectUpdate,
)

# User Schemas
from backend.schemas.user import UserCreate, UserRead, UserSettingsRead, UserSettingsUpdate

# Workflow Schemas
from backend.schemas.workflow import WorkflowCreate, WorkflowInstanceRead, WorkflowUpdate

__all__ = [
    # Auth
    "Token",
    "TokenData",
    # Common
    "PaginatedResponse",
    "SystemInfo",
    # Error
    "ErrorResponse",
    # Events
    "EventType",
    "EventPayload",
    # HITL
    "HITLActionType",
    "HITLSubmission",
    "ExecutionRequest",
    "AdjudicationDecision",
    "Adjudication",
    # Node
    "NodeInstanceRead",
    "NodeDetailView",
    "NodeVersionRead",
    "TemporaryExecutionRead",
    "VersionData",
    "StalenessInfo",
    "ManualEditSubmission",
    # Project
    "ProjectCreate",
    "ProjectUpdate",
    "HistoricalInitializationRequest",
    "ProjectFileRead",
    "ProjectSummaryRead",
    "ProjectDetailRead",
    # User
    "UserCreate",
    "UserRead",
    "UserSettingsUpdate",
    "UserSettingsRead",
    # Workflow
    "WorkflowCreate",
    "WorkflowUpdate",
    "WorkflowInstanceRead",
]

```

### schemas/auth.py Content:

```py
"""Pydantic schemas for authentication flows."""

from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    """Schema for the JWT access token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for the data encoded within the JWT."""

    # The 'sub' (subject) claim will hold the user ID.
    sub: Optional[str] = None


```

### schemas/common.py Content:

```py
from typing import Generic, List, TypeVar

from pydantic import BaseModel

DataType = TypeVar("DataType")


class PaginatedResponse(BaseModel, Generic[DataType]):
    """Generic schema for paginated collections."""

    total: int
    items: List[DataType]


class SystemInfo(BaseModel):
    """Schema exposed by the system information endpoint."""

    app_version: str
    llm_model_name: str

```

### schemas/error.py Content:

```py
from typing import Any, Dict, Optional

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response for API exceptions."""

    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None

```

### schemas/events.py Content:

```py
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel


class EventType(str, Enum):
    """WebSocket event types."""

    NODE_STATUS_UPDATED = "NODE_STATUS_UPDATED"
    WORKFLOW_STRUCTURE_UPDATED = "WORKFLOW_STRUCTURE_UPDATED"
    WORKFLOW_STATUS_UPDATED = "WORKFLOW_STATUS_UPDATED"


class EventPayload(BaseModel):
    """Standardized payload for WebSocket events."""

    event_type: EventType
    workflow_id: int
    node_id: Optional[int] = None
    data: Dict[str, Any]

```

### schemas/hitl.py Content:

```py
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class HITLActionType(str, Enum):
    CONTINUE = "Continue"
    REJECT_WITH_FEEDBACK = "RejectAndProvideModificationComments"
    DISCARD = "Discard"


class AdjudicationDecision(str, Enum):
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"


class Adjudication(BaseModel):
    critique_id: str
    decision: AdjudicationDecision
    comment: Optional[str] = None


class HITLSubmission(BaseModel):
    action: HITLActionType
    feedback_comment: Optional[str] = None
    interaction_data: Optional[Dict[str, Any]] = None


class ExecutionRequest(BaseModel):
    modification_comments: Optional[str] = None
    base_version_id: Optional[int] = None


```

### schemas/node.py Content:

```py
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from backend.models.workflow import ExecutionStage, NodeStatus, VersionSource
from backend.workflow_definition import HITLMode, NodeType


class NodeInstanceRead(BaseModel):
    id: int
    definition_id: str
    name: str
    status: NodeStatus
    current_stage: ExecutionStage
    node_type: NodeType
    hitl_mode: HITLMode
    order_index: int
    active_version_id: Optional[int]
    phase_id: str
    task_group_id: Optional[str] = None

    class Config:
        from_attributes = True


class VersionData(BaseModel):
    source: VersionSource
    based_on_version_id: Optional[int]
    output_data: Optional[Dict[str, Any]]
    raw_generated_output: Optional[Dict[str, Any]]
    input_dependencies: Dict[int, int]
    hitl_history: List[Dict[str, Any]]
    llm_model_name: str
    temperature: float


class NodeVersionRead(VersionData):
    id: int
    version_number: int
    node_instance_id: int
    summary: str

    class Config:
        from_attributes = True


class TemporaryExecutionRead(BaseModel):
    output_data: Optional[Dict[str, Any]]
    accumulated_hitl_interactions: List[Dict[str, Any]]
    error_log: Optional[str]

    class Config:
        from_attributes = True


class StalenessInfo(BaseModel):
    """Detailed information about a stale dependency."""

    upstream_node_id: int
    upstream_definition_id: str
    consumed_version_id: int
    current_active_version_id: Optional[int]


class ManualEditSubmission(BaseModel):
    """Schema for submitting a manual edit to a node's output."""

    base_version_id: int
    edited_output_data: Dict[str, Any]
    summary: Optional[str] = None


class NodeDetailView(NodeInstanceRead):
    active_version: Optional[NodeVersionRead] = None
    pending_result: Optional[TemporaryExecutionRead] = None
    staleness_report: Optional[List[StalenessInfo]] = None

```

### schemas/project.py Content:

```py
"""Pydantic schemas for project-related API operations."""

import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from backend.models.project import FileRole, ProblemType, ProjectStatus


class ProjectBase(BaseModel):
    """Shared base attributes for project operations."""

    name: str
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        """Ensure project names are non-empty after trimming whitespace."""
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Project name cannot be empty.")
        return cleaned


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating mutable project fields. Forbids extra fields."""

    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = None
    description: Optional[str] = None
    problem_type: Optional[ProblemType] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        """Validate name for update operations, allowing it to be omitted."""
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Project name cannot be empty.")
        return cleaned


class HistoricalInitializationRequest(BaseModel):
    """Schema for requesting project initialization from the historical library."""

    historical_problem_id: int


class ProjectFileRead(BaseModel):
    """Schema for reading project file data."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    role: FileRole
    created_at: datetime.datetime


class ProjectSummaryRead(BaseModel):
    """A lightweight schema for listing projects on a dashboard."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    status: ProjectStatus
    problem_type: ProblemType
    created_at: datetime.datetime
    updated_at: datetime.datetime
    workflow_instance_id: Optional[int] = None


class ProjectDetailRead(ProjectSummaryRead):
    """A detailed schema for a single project view, including files and description."""

    model_config = ConfigDict(from_attributes=True)

    description: Optional[str] = None
    files: List[ProjectFileRead] = Field(default_factory=list)
    historical_problem_id: Optional[int] = None

```

### schemas/user.py Content:

```py
"""Pydantic schemas for user creation and settings updates."""

from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from backend.models.user import HITLProfile, InterfaceTheme, SupportedLanguage, ThinkingDepth


class UserCreate(BaseModel):
    """Schema for creating a new user."""

    email: EmailStr
    password: str
    display_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        """Enforce minimum password requirements per FRS 1.1."""
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return value


class UserSettingsUpdate(BaseModel):
    """
    Schema for updating user settings. All fields are optional.
    API keys are received in plaintext and encrypted by the service.
    """

    language: Optional[SupportedLanguage] = None
    theme: Optional[InterfaceTheme] = None
    hitl_profile: Optional[HITLProfile] = None
    thinking_depth: Optional[ThinkingDepth] = None
    llm_model_name: Optional[str] = None
    llm_base_url: Optional[str] = None
    llm_api_key: Optional[str] = None  # Plaintext for input
    e2b_api_key: Optional[str] = None  # Plaintext for input


class UserRead(BaseModel):
    """Schema for reading user profile data, excluding sensitive info."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    display_name: Optional[str] = None
    is_active: bool
    is_verified: bool


class UserSettingsRead(BaseModel):
    """Schema for reading user settings, excluding sensitive info."""

    model_config = ConfigDict(from_attributes=True)

    language: SupportedLanguage
    theme: InterfaceTheme
    hitl_profile: HITLProfile
    thinking_depth: ThinkingDepth
    llm_model_name: Optional[str] = None
    llm_base_url: Optional[str] = None
    has_llm_api_key: bool
    has_e2b_api_key: bool

```

### schemas/workflow.py Content:

```py
from typing import List, Optional

from pydantic import BaseModel

from backend.models.workflow import WorkflowStatus
from backend.schemas.node import NodeInstanceRead


class WorkflowCreate(BaseModel):
    """Payload for creating a workflow; user inferred from auth context."""

    name: str
    project_id: int


class WorkflowUpdate(BaseModel):
    """Mutable fields for workflow updates."""

    name: Optional[str] = None


class WorkflowInstanceRead(BaseModel):
    id: int
    name: str
    status: WorkflowStatus
    project_id: int
    user_id: int
    nodes: List[NodeInstanceRead]

    class Config:
        from_attributes = True

```

    ## services
     - __init__.py
     - export_service.py
     - hitl_service.py
     - node_service.py
     - project_service.py
     - storage_service.py
     - user_service.py
     - workflow_service.py

### services/__init__.py Content:

```py
"""Service layer package."""


```

### services/export_service.py Content:

```py
"""
Service for exporting project results into a standardized archive format.
This service fulfills requirements described in FRS R6.
"""

import datetime
import io
import json
import re
import zipfile
from typing import Any, Dict, List

from loguru import logger
from sqlalchemy.orm import Session, joinedload

from backend.models import NodeInstance, Project, ProjectFile
from backend.services.storage_service import storage_service


def _sanitize_filename(name: str) -> str:
    """Return a filesystem-safe filename fragment."""
    cleaned = re.sub(r'[<>:"/\\|?*]', "_", name or "")
    cleaned = re.sub(r"[\x00-\x1f\x7f]", "", cleaned)
    return cleaned.strip() or "untitled"


class ExportService:
    """Service to handle the project export feature (R6)."""

    def __init__(self, db: Session):
        self.db = db

    def export_project_to_zip(self, project: Project) -> bytes:
        """Compile all project artifacts into a single ZIP archive."""
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            logger.info("Starting export for project '{}'", project.name)
            self._add_original_inputs(zf, project)
            node_outputs = self._get_node_outputs(project)
            self._add_structured_outputs(zf, node_outputs)
            self._add_project_manifest(zf, project, node_outputs)
            logger.info("Project export completed for '{}'", project.name)

        zip_buffer.seek(0)
        return zip_buffer.read()

    def _get_node_outputs(self, project: Project) -> Dict[str, Dict[str, Any]]:
        """Retrieve output data from the active version of each executed node."""
        if not project.workflow_instance:
            return {}

        nodes_with_active_versions: List[NodeInstance] = (
            self.db.query(NodeInstance)
            .filter(
                NodeInstance.workflow_instance_id == project.workflow_instance.id,
                NodeInstance.active_version_id.isnot(None),
            )
            .options(joinedload(NodeInstance.active_version))
            .order_by(NodeInstance.order_index)
            .all()
        )

        outputs: Dict[str, Dict[str, Any]] = {}
        for node in nodes_with_active_versions:
            if node.active_version and node.active_version.output_data is not None:
                outputs[node.definition_id] = {
                    "name": node.name,
                    "output": node.active_version.output_data,
                    "version_number": node.active_version.version_number,
                    "order_index": node.order_index,
                }

        logger.debug("Gathered outputs for {} nodes.", len(outputs))
        return outputs

    def _write_content_to_zip(self, zf: zipfile.ZipFile, path: str, data: Any):
        """Serialize content to bytes (if needed) and write it into the archive."""
        if isinstance(data, bytes):
            content_bytes = data
        elif isinstance(data, (dict, list)):
            content_bytes = json.dumps(data, indent=2, default=str).encode("utf-8")
        else:
            content_bytes = str(data).encode("utf-8")
        zf.writestr(path, content_bytes)

    def _add_original_inputs(self, zf: zipfile.ZipFile, project: Project):
        """Add the project's original uploaded files to the archive."""
        project_files: List[ProjectFile] = (
            self.db.query(ProjectFile).filter(ProjectFile.project_id == project.id).all()
        )
        if not project_files:
            return

        for p_file in project_files:
            try:
                content = storage_service.get_file_content(p_file.storage_path)
                role_folder = _sanitize_filename(p_file.role.value)
                path = f"Original Inputs/{role_folder}/{p_file.filename}"
                self._write_content_to_zip(zf, path, content)
            except Exception as exc:
                logger.error("Failed to add original input '{}' to export: {}", p_file.filename, exc)
                error_info = f"Error reading file: {p_file.filename}\n{exc}"
                zf.writestr(f"Original Inputs/{p_file.filename}.error.txt", error_info)

    def _add_structured_outputs(self, zf: zipfile.ZipFile, node_outputs: Dict[str, Dict[str, Any]]):
        """Dispatch node outputs into their artifact-specific handlers."""
        sorted_nodes = sorted(node_outputs.items(), key=lambda item: item[1].get("order_index", 999))
        for def_id, data in sorted_nodes:
            handled = False
            handled = self._add_final_paper(zf, def_id, data) or handled
            handled = self._add_code_artifacts(zf, data) or handled
            handled = self._add_attachments(zf, data) or handled
            if not handled and data.get("output"):
                self._add_intermediate_result(zf, data)

    def _add_final_paper(self, zf: zipfile.ZipFile, def_id: str, data: Dict[str, Any]) -> bool:
        """Capture the final competition paper, if present."""
        output = data.get("output", {})
        if def_id == "3.1.2" and "Submission-Ready Paper" in output:
            paper_content = output["Submission-Ready Paper"]
            self._write_content_to_zip(zf, "Final Paper/O-Award Paper.md", paper_content)
            return True
        return False

    def _add_code_artifacts(self, zf: zipfile.ZipFile, data: Dict[str, Any]) -> bool:
        """Capture generated code artifacts for a node."""
        output_data = data.get("output", {}) or {}
        node_name = _sanitize_filename(data.get("name", "untitled"))
        order_index = data.get("order_index", 999)
        code_keys = ["code", "script", "execution_script"]
        handled = False

        for key in code_keys:
            if key in output_data:
                path = f"Code Artifacts/{order_index:02d}_{node_name}_{key}.py"
                self._write_content_to_zip(zf, path, output_data[key])
                handled = True
        return handled

    def _add_attachments(self, zf: zipfile.ZipFile, data: Dict[str, Any]) -> bool:
        """Capture supporting attachments and visualization data."""
        output_data = data.get("output", {}) or {}
        node_name = _sanitize_filename(data.get("name", "untitled"))
        order_index = data.get("order_index", 999)
        attachment_keys = ["vv_report", "key_output_doc", "visualization", "plot", "sensitivity_data"]
        handled = False

        for key in attachment_keys:
            if key in output_data:
                path = f"Attachments and Visualizations/{order_index:02d}_{node_name}_{key}.json"
                self._write_content_to_zip(zf, path, output_data[key])
                handled = True
        return handled

    def _add_intermediate_result(self, zf: zipfile.ZipFile, data: Dict[str, Any]):
        """Persist intermediate JSON results for nodes lacking a specialized handler."""
        node_name = _sanitize_filename(data.get("name", "untitled"))
        order_index = data.get("order_index", 999)
        path = f"Intermediate Results/{order_index:02d}_{node_name}.json"
        self._write_content_to_zip(zf, path, data["output"])

    def _add_project_manifest(
        self, zf: zipfile.ZipFile, project: Project, node_outputs: Dict[str, Dict[str, Any]]
    ):
        """Generate the project manifest detailing exported artifacts."""
        exported_nodes_summary = [
            {
                "definition_id": def_id,
                "name": data["name"],
                "order_index": data["order_index"],
                "exported_version": data["version_number"],
            }
            for def_id, data in sorted(node_outputs.items(), key=lambda item: item[1]["order_index"])
        ]

        manifest = {
            "project_details": {
                "name": project.name,
                "description": project.description,
                "status": project.status.value,
                "problem_type": project.problem_type.value,
                "created_at": project.created_at,
                "export_date": datetime.datetime.utcnow(),
            },
            "workflow_details": {
                "name": project.workflow_instance.name if project.workflow_instance else "N/A",
                "status": project.workflow_instance.status.value if project.workflow_instance else "N/A",
            },
            "exported_nodes": exported_nodes_summary,
            "configuration_snapshot": project.configuration_snapshot,
        }

        self._write_content_to_zip(zf, "Project Manifest.json", manifest)

```

### services/hitl_service.py Content:

```py
import datetime
from typing import Any, Dict, List, Optional

from loguru import logger
from pydantic import ValidationError
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.exceptions import InvalidStateException
from backend.models.user import User
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, NodeVersion, VersionSource, WorkflowStatus
from backend.schemas.hitl import (
    Adjudication,
    AdjudicationDecision,
    HITLActionType,
    HITLSubmission,
)
from backend.services.node_service import NodeService
from backend.workflow_definition import (
    HITLMode,
    KEY_ANALYSIS,
    KEY_CANDIDATES,
    KEY_CRITIQUES,
    KEY_ID,
    KEY_PRIMARY_ARTIFACT,
    KEY_SCA_OUTPUT,
    KEY_SELECTED_ITEM,
    KEY_SELECTED_ITEMS,
    NodeType,
)

class HITLService:
    def __init__(self, db: Session, node_service: NodeService):
        self.db = db
        self.node_service = node_service

    async def process_submission(
        self, node_id: int, submission: HITLSubmission, user: User
    ) -> Dict[str, Any]:
        """Process a HITL submission, with an ownership check."""
        node = self.node_service.get_node_instance(node_id, user=user)

        if submission.action == HITLActionType.DISCARD:
            if node.status in [NodeStatus.AWAITING_HITL_APPROVAL, NodeStatus.FAILED]:
                return await self._discard_execution(node)
            raise InvalidStateException(f"Cannot discard execution in status {node.status}.")

        if node.status != NodeStatus.AWAITING_HITL_APPROVAL:
            raise InvalidStateException(f"Cannot process HITL submission in status {node.status}.")

        if submission.action == HITLActionType.CONTINUE:
            return await self._handle_approval_or_loop(node, submission.interaction_data or {}, user)
        if submission.action == HITLActionType.REJECT_WITH_FEEDBACK:
            return await self._reject_and_retry(node, submission.feedback_comment, user)

        raise InvalidStateException("Unsupported HITL action.")

    async def _handle_approval_or_loop(
        self, node: NodeInstance, interaction_data: Optional[Dict[str, Any]], user: User
    ):
        self._validate_hitl_integrity(node, interaction_data)

        if node.hitl_mode == HITLMode.AVL:
            adjudication_data_list = (interaction_data or {}).get("adjudication", [])
            if any(item.get("decision") == AdjudicationDecision.ACCEPTED for item in adjudication_data_list):
                self._record_interaction(node, "AVLAdjudication", interaction_data)
                await self.node_service.enqueue_hitl_action(
                    node.id, user=user, adjudication_data=adjudication_data_list
                )
                return {
                    "message": "Adjudication received. Starting AVL refinement iteration.",
                    "node_id": node.id,
                    "action": "AVLLoop",
                }
        return await self._approve_and_proceed(node, interaction_data, user)

    async def _approve_and_proceed(
        self, node: NodeInstance, interaction_data: Optional[Dict[str, Any]], user: User
    ):
        """
        Approves the node, finalizes the version, and advances the workflow atomically (R5.3).
        """
        raw_output = node.temporary_result.output_data
        final_output = self._determine_final_output(node, raw_output, interaction_data)

        try:
            new_version = self._create_version_from_temporary(node, final_output, raw_output, interaction_data)
            await self.node_service._finalize_node_completion_and_advance(
                node,
                user,
                new_version,
                final_output,
            )
        except Exception:
            logger.exception("Failed during HITL approval process for node", node_id=node.id)
            raise

        if node.workflow:
            self.db.refresh(node.workflow)

        next_node = (
            self.db.query(NodeInstance)
            .filter_by(
                workflow_instance_id=node.workflow_instance_id,
                order_index=node.order_index + 1,
            )
            .first()
        )

        if node.workflow and node.workflow.status == WorkflowStatus.COMPLETED:
            return {"message": "Workflow completed successfully.", "next_node_id": None, "action": "Completed"}

        if not next_node:
            raise InvalidStateException("Internal Error: Workflow is not complete, but failed to find the next node.")

        execute_next = next_node.status == NodeStatus.NOT_STARTED
        if execute_next:
            return {
                "message": f"Node approved. Starting next node {next_node.definition_id}.",
                "next_node_id": next_node.id,
                "action": "ExecuteNext",
            }

        return {
            "message": f"Node approved. Navigating to review next node {next_node.definition_id}.",
            "next_node_id": next_node.id,
            "action": "NavigateNext",
        }

    def _validate_hitl_integrity(self, node: NodeInstance, interaction_data: Optional[Dict[str, Any]]):
        raw_output = node.temporary_result.output_data
        if node.hitl_mode == HITLMode.SCA:
            if not interaction_data or "selected_ids" not in interaction_data:
                raise InvalidStateException("SCA requires 'selected_ids' in interaction_data.")
            selected_ids = interaction_data["selected_ids"]
            if not isinstance(selected_ids, list) or len(selected_ids) < 1:
                raise InvalidStateException("SCA requires at least one selection.")

            single_selection_nodes = {"1.1.2", "3.1.1"}
            requires_single_selection = node.definition_id.endswith(".2.1.1") or node.definition_id in single_selection_nodes
            if requires_single_selection and len(selected_ids) != 1:
                raise InvalidStateException(f"Node {node.definition_id} requires exactly one selection.")

            candidates = raw_output.get(KEY_CANDIDATES, [])
            available_ids = {c.get(KEY_ID) for c in candidates if c.get(KEY_ID)}
            if not set(selected_ids).issubset(available_ids):
                raise InvalidStateException("Submitted 'selected_ids' contain invalid IDs.")

        if node.hitl_mode == HITLMode.AVL:
            critiques = raw_output.get(KEY_CRITIQUES, [])
            if not critiques:
                return
            if not interaction_data or "adjudication" not in interaction_data:
                raise InvalidStateException("AVL requires 'adjudication' data when critiques are present.")
            adjudication_data_list = interaction_data["adjudication"]
            try:
                adjudications = [Adjudication(**data) for data in adjudication_data_list]
            except ValidationError as exc:
                raise InvalidStateException(f"Invalid adjudication data structure: {exc}")
            if len(adjudications) != len(critiques):
                raise InvalidStateException("Adjudication data must be provided for all active critiques.")
            available_ids = {c.get(KEY_ID) for c in critiques if c.get(KEY_ID)}
            submitted_ids = {a.critique_id for a in adjudications}
            if submitted_ids != available_ids:
                raise InvalidStateException("Mismatch between active critiques and adjudication decisions.")

    def _determine_final_output(
        self,
        node: NodeInstance,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        if node.hitl_mode == HITLMode.SCA:
            if not interaction_data or "selected_ids" not in interaction_data:
                raise InvalidStateException("SCA output determination requires 'selected_ids'.")
            selected_ids = set(interaction_data["selected_ids"])
            candidates = raw_output.get(KEY_CANDIDATES, [])
            selected_items = [candidate for candidate in candidates if candidate.get(KEY_ID) in selected_ids]

            single_selection_nodes = {"1.1.2", "3.1.1"}
            is_single_selection = node.definition_id.endswith(".2.1.1") or node.definition_id in single_selection_nodes

            selected_item = None
            if is_single_selection:
                if len(selected_items) == 1:
                    selected_item = selected_items[0]
                else:
                    raise InvalidStateException(
                        f"Internal Error: Expected single selection for node {node.definition_id}, "
                        f"found {len(selected_items)}."
                    )

            sca_output_wrapper = {
                KEY_SELECTED_ITEM: selected_item,
                KEY_SELECTED_ITEMS: selected_items,
            }

            if node.definition_id in {"1.1.2", "3.1.1"}:
                if selected_item:
                    final_output = selected_item.copy()
                    final_output[KEY_SCA_OUTPUT] = sca_output_wrapper
                    return final_output
                raise InvalidStateException(f"Internal Error: Failed to find selected item for {node.definition_id}.")

            final_output = {}
            for key, value in raw_output.items():
                if key not in [KEY_CANDIDATES, KEY_ANALYSIS]:
                    final_output[key] = value
            final_output[KEY_SCA_OUTPUT] = sca_output_wrapper
            return final_output

        if node.hitl_mode in [HITLMode.AVL, HITLMode.VARL]:
            if KEY_PRIMARY_ARTIFACT in raw_output:
                return raw_output[KEY_PRIMARY_ARTIFACT]
            return raw_output

        return raw_output

    async def _reject_and_retry(self, node: NodeInstance, feedback: Optional[str], user: User):
        if not feedback:
            raise InvalidStateException("Feedback comment is required for rejection.")
        self._record_interaction(node, "RejectionFeedback", {"comment": feedback})
        await self.node_service.enqueue_hitl_action(node.id, user=user, user_feedback=feedback)
        return {"message": "Feedback received. Re-executing node.", "node_id": node.id, "action": "ReExecute"}

    def _record_interaction(self, node: NodeInstance, interaction_type: str, data: Dict[str, Any]):
        temp_result = node.temporary_result
        interactions = temp_result.accumulated_hitl_interactions or []
        interaction = {
            "type": interaction_type,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "data": data,
        }
        interactions.append(interaction)
        temp_result.accumulated_hitl_interactions = interactions[:]  # copy for SQLAlchemy change tracking
        self.db.commit()

    async def _discard_execution(self, node: NodeInstance) -> Dict[str, Any]:
        if node.temporary_result:
            self.db.delete(node.temporary_result)
        if node.active_version_id:
            node.status = NodeStatus.COMPLETED
            node.current_stage = ExecutionStage.COMPLETED
        else:
            node.status = NodeStatus.NOT_STARTED
            node.current_stage = ExecutionStage.NOT_STARTED
        self.db.commit()
        self.db.refresh(node)
        await self.node_service._broadcast_node_update(node)
        return {"message": "Execution attempt discarded. Status reverted.", "node_id": node.id, "action": "Discarded"}

    def _generate_version_summary(self, interactions: List[Dict[str, Any]]) -> str:
        """Create a concise, context-aware explanation for the version."""

        if not interactions:
            return "Initial version approved."

        for interaction in reversed(interactions):
            interaction_type = interaction.get("type")
            data = interaction.get("data", {})

            if interaction_type == "AVLAdjudication":
                adjudications = data.get("adjudication", [])
                accepted_count = sum(1 for item in adjudications if item.get("decision") == AdjudicationDecision.ACCEPTED)
                if accepted_count > 0:
                    first_comment = next(
                        (
                            item.get("comment")
                            for item in adjudications
                            if item.get("decision") == AdjudicationDecision.ACCEPTED and item.get("comment")
                        ),
                        None,
                    )
                    summary = f"Refined (Accepted {accepted_count} critiques)."
                    if first_comment:
                        summary += f" Context: '{first_comment[:60]}...'"
                    return summary
                return "Approved (Rejected all critiques)."

            if interaction_type in ["RejectionFeedback", "InitialModificationComment", "RetryModificationComment"]:
                comment = data.get("comment")
                if comment:
                    if interaction_type == "InitialModificationComment":
                        prefix = "Re-executed"
                    elif interaction_type == "RetryModificationComment":
                        prefix = "Retried"
                    else:
                        prefix = "Refined"
                    return f"{prefix} based on feedback: '{comment[:80]}...'"

        return "Version approved."

    def _create_version_from_temporary(
        self,
        node: NodeInstance,
        final_output: Dict[str, Any],
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> NodeVersion:
        temp_result = node.temporary_result
        with self.db.begin_nested():
            self.db.query(NodeInstance).filter_by(id=node.id).with_for_update().one_or_none()
            max_version = (
                self.db.query(func.max(NodeVersion.version_number))
                .filter_by(node_instance_id=node.id)
                .scalar()
            )
            next_version_number = (max_version or 0) + 1
            summary = self._generate_version_summary(temp_result.accumulated_hitl_interactions)
            final_interactions = temp_result.accumulated_hitl_interactions[:]
            final_interactions.append(
                {
                    "type": "Approval",
                    "interaction_data": interaction_data,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                }
            )
            version_source = self._determine_version_source(final_interactions)
            base_version_id = node.active_version_id
            new_version = NodeVersion(
                node_instance_id=node.id,
                version_number=next_version_number,
                source=version_source,
                based_on_version_id=base_version_id,
                output_data=final_output,
                raw_generated_output=raw_output,
                input_dependencies=temp_result.input_dependencies,
                hitl_history=final_interactions,
                llm_model_name=temp_result.llm_model_name,
                temperature=temp_result.temperature,
                summary=summary,
            )
            self.db.add(new_version)
            self.db.flush()
        return new_version

    def _determine_version_source(self, interactions: List[Dict[str, Any]]) -> VersionSource:
        if not interactions:
            return VersionSource.AI_GENERATED

        manual_markers = {
            "InitialModificationComment",
            "RetryModificationComment",
            "RejectionFeedback",
            "AVLAdjudication",
        }
        if any(entry.get("type") in manual_markers for entry in interactions):
            return VersionSource.MANUALLY_EDITED
        return VersionSource.AI_GENERATED

```

### services/node_service.py Content:

```py
import datetime
import traceback
from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple

from loguru import logger
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from backend.config import settings
from backend.exceptions import DependencyException, ForbiddenException, InvalidStateException, NotFoundException
from backend.models.project import FileRole, ProjectFile
from backend.models.user import User
from backend.models.workflow import (
    ExecutionStage,
    NodeInstance,
    NodeStatus,
    NodeVersion,
    TemporaryExecutionResult,
    VersionSource,
    WorkflowInstance,
)
from backend.redis import get_redis_pool
from backend.schemas.events import EventType
from backend.schemas.node import (
    ManualEditSubmission,
    NodeDetailView,
    NodeInstanceRead,
    NodeVersionRead,
    StalenessInfo,
    TemporaryExecutionRead,
)
from backend.services.execution_engine.config_resolver import resolve_config
from backend.services.execution_engine.executor import NodeExecutor
from backend.services.storage_service import storage_service
from backend.task_names import TASK_EXECUTE_NODE
from backend.utils.event_utils import broadcast_event
from backend.workflow_definition import HITLMode, NodeType


_INPUT_KEY_TO_ROLE_MAP = {
    "Problem Statement": FileRole.PROBLEM_DESCRIPTION,
    "Datasets": FileRole.DATASET,
    "Reference Material": FileRole.REFERENCE_MATERIAL,
}


class NodeService:
    def __init__(self, db: Session):
        self.db = db

    def get_node_instance(self, node_id: int, user: Optional[User] = None) -> NodeInstance:
        """
        Get a node instance, with an optional ownership check.
        If a user is provided, enforces that the user owns the node.
        """
        node = self.db.query(NodeInstance).get(node_id)
        if not node:
            raise NotFoundException(f"NodeInstance with id {node_id} not found.")
        if user and node.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this node.")
        return node

    async def _enqueue_job(self, node_id: int, **kwargs) -> NodeInstance:
        """Internal helper to enqueue a worker job and update node state."""
        redis = await get_redis_pool()
        await redis.enqueue_job(TASK_EXECUTE_NODE, node_id=node_id, **kwargs)

        node = self.get_node_instance(node_id)
        node.status = NodeStatus.EXECUTING
        node.current_stage = ExecutionStage.INITIALIZING
        self.db.commit()
        self.db.refresh(node)
        await self._broadcast_node_update(node)
        logger.info("Enqueued job for node", node_id=node_id, job_args=kwargs)
        return node

    async def enqueue_initial_execution(self, node_id: int, user: User) -> NodeInstance:
        """Start the first execution for a not-started node, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.NOT_STARTED:
            raise InvalidStateException(
                "Initial execution is only allowed for nodes that have not started.",
                details={"node_id": node.id, "current_status": node.status.value},
            )
        self._validate_execution_request(node, None, False, None, None)
        return await self._enqueue_job(
            node_id,
            user_feedback=None,
            is_retry_from_hitl=False,
            base_version_id=None,
            adjudication_data=None,
            previous_status=node.status.value,
        )

    async def enqueue_re_execution(
        self,
        node_id: int,
        user: User,
        user_feedback: Optional[str] = None,
        base_version_id: Optional[int] = None,
    ) -> NodeInstance:
        """Re-run a completed node, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.COMPLETED:
            raise InvalidStateException(
                f"Node must be 'Completed' to re-execute; current status is '{node.status.value}'.",
                details={"node_id": node.id, "current_status": node.status.value},
            )
        self._validate_execution_request(
            node,
            user_feedback=user_feedback,
            is_retry_from_hitl=False,
            base_version_id=base_version_id,
            adjudication_data=None,
        )
        return await self._enqueue_job(
            node_id,
            user_feedback=user_feedback,
            is_retry_from_hitl=False,
            base_version_id=base_version_id,
            adjudication_data=None,
            previous_status=node.status.value,
        )

    async def enqueue_retry(
        self, node_id: int, user: User, user_feedback: Optional[str] = None
    ) -> NodeInstance:
        """Retry a failed node, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.FAILED:
            raise InvalidStateException(
                f"Node must be 'Failed' to retry; current status is '{node.status.value}'.",
                details={"node_id": node.id, "current_status": node.status.value},
            )
        self._validate_execution_request(
            node,
            user_feedback=user_feedback,
            is_retry_from_hitl=False,
            base_version_id=None,
            adjudication_data=None,
        )
        return await self._enqueue_job(
            node_id,
            user_feedback=user_feedback,
            is_retry_from_hitl=False,
            base_version_id=None,
            adjudication_data=None,
            previous_status=node.status.value,
        )

    async def enqueue_hitl_action(
        self,
        node_id: int,
        user: User,
        user_feedback: Optional[str] = None,
        adjudication_data: Optional[List[Dict[str, Any]]] = None,
    ) -> NodeInstance:
        """Enqueue a HITL action, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.AWAITING_HITL_APPROVAL:
            raise InvalidStateException(f"Cannot enqueue HITL action for node in status {node.status}")

        is_retry = bool(user_feedback)
        self._validate_execution_request(node, user_feedback, is_retry, None, adjudication_data)

        previous_status = node.status.value
        redis = await get_redis_pool()
        await redis.enqueue_job(
            TASK_EXECUTE_NODE,
            node_id=node_id,
            user_feedback=user_feedback,
            is_retry_from_hitl=is_retry,
            base_version_id=None,
            adjudication_data=adjudication_data,
            previous_status=previous_status,
        )

        node.status = NodeStatus.EXECUTING
        node.current_stage = ExecutionStage.PROCESSING
        self.db.commit()
        self.db.refresh(node)
        await self._broadcast_node_update(node)
        logger.info("Enqueued HITL continuation for node", node_id=node_id)
        return node

    async def execute_in_worker(
        self,
        node: NodeInstance,
        user_feedback: Optional[str] = None,
        is_retry_from_hitl: bool = False,
        base_version_id: Optional[int] = None,
        adjudication_data: Optional[List[Dict[str, Any]]] = None,
        previous_status: Optional[str] = None,
    ) -> NodeInstance:
        node_id = node.id
        original_status = NodeStatus(previous_status) if previous_status else node.status

        resolved_inputs: Dict[str, Any] = {}
        input_dependency_map: Dict[int, int] = {}
        previous_hitl_history: List[Dict[str, Any]] = []
        previous_output: Optional[Dict[str, Any]] = None
        executor_feedback = user_feedback
        temp_result: Optional[TemporaryExecutionResult] = None

        try:
            if is_retry_from_hitl or adjudication_data:
                resolved_inputs, input_dependency_map, previous_hitl_history, previous_output = self._prepare_hitl_loop_context(
                    node
                )
                temp_result = node.temporary_result
            else:
                resolved_inputs, input_dependency_map = self._resolve_dependencies(node)

                if original_status == NodeStatus.FAILED and node.temporary_result:
                    temp_result = self._prepare_failed_retry_context(node, input_dependency_map, user_feedback)
                    previous_hitl_history = temp_result.accumulated_hitl_interactions or []
                else:
                    base_history = self._get_base_history(node, base_version_id)
                    temp_result = self._create_fresh_temporary_result(
                        node,
                        input_dependency_map,
                        base_history,
                        user_feedback,
                    )
                    previous_hitl_history = temp_result.accumulated_hitl_interactions or []

                previous_output = None
        except Exception:
            logger.exception("Failed during execution preparation for node", node_id=node_id)
            self.db.rollback()
            raise

        if not temp_result:
            raise InvalidStateException("Internal Error: Failed to establish temporary execution context.")

        temp_result.error_log = None
        self.db.flush()

        project_snapshot = None
        if node.workflow and node.workflow.project:
            project_snapshot = node.workflow.project.configuration_snapshot

        executor = NodeExecutor(config=resolve_config(project_snapshot))

        try:
            node.current_stage = ExecutionStage.PROCESSING
            self.db.commit()
            await self._broadcast_node_update(node)

            execution_output = await executor.execute_node(
                node,
                resolved_inputs,
                previous_hitl_history,
                executor_feedback,
                previous_output,
                adjudication_data,
            )

            node.current_stage = ExecutionStage.GENERATING_OUTPUTS
            self.db.commit()
            await self._broadcast_node_update(node)

            temp_result.output_data = execution_output
            temp_result.error_log = None
            node.status = NodeStatus.AWAITING_HITL_APPROVAL
            node.current_stage = ExecutionStage.AWAITING_REVIEW
        except Exception as exc:
            logger.exception("Execution failed for node", node_id=node.id)
            temp_result.error_log = f"Error: {exc}\nTraceback:\n{traceback.format_exc()}"
            temp_result.output_data = None
            node.status = NodeStatus.FAILED
            node.current_stage = ExecutionStage.FAILED

        self.db.commit()
        self.db.refresh(node)
        await self._broadcast_node_update(node)
        return node

    # --- Execution Preparation Helper Methods ---

    def _prepare_hitl_loop_context(
        self, node: NodeInstance
    ) -> Tuple[Dict[str, Any], Dict[int, int], List[Dict[str, Any]], Optional[Dict[str, Any]]]:
        temp_result = node.temporary_result
        if not temp_result:
            raise InvalidStateException("Temporary execution context missing for HITL loop.")

        resolved_inputs, dependency_map = self._resolve_dependencies_from_map(node, temp_result.input_dependencies)
        history = temp_result.accumulated_hitl_interactions or []
        previous_output = temp_result.output_data
        return resolved_inputs, dependency_map, history, previous_output

    def _prepare_failed_retry_context(
        self,
        node: NodeInstance,
        input_dependency_map: Dict[int, int],
        user_feedback: Optional[str],
    ) -> TemporaryExecutionResult:
        if not node.temporary_result:
            raise InvalidStateException("Cannot retry FAILED node without a temporary execution result.")

        temp_result = node.temporary_result
        temp_result.error_log = None
        temp_result.input_dependencies = input_dependency_map

        interactions = temp_result.accumulated_hitl_interactions or []
        if user_feedback:
            interactions.append(
                {
                    "type": "RetryModificationComment",
                    "data": {"comment": user_feedback},
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                }
            )
        temp_result.accumulated_hitl_interactions = interactions[:]
        return temp_result

    def _get_base_history(self, node: NodeInstance, base_version_id: Optional[int]) -> List[Dict[str, Any]]:
        version_to_use_id = base_version_id if base_version_id is not None else node.active_version_id
        if not version_to_use_id:
            return []

        base_version = (
            self.db.query(NodeVersion)
            .filter_by(id=version_to_use_id, node_instance_id=node.id)
            .first()
        )
        if not base_version:
            raise InvalidStateException(
                f"Base version id {version_to_use_id} does not exist or does not belong to node {node.id}."
            )
        return base_version.hitl_history or []

    def _create_fresh_temporary_result(
        self,
        node: NodeInstance,
        input_map: Dict[int, int],
        history: List[Dict[str, Any]],
        initial_feedback: Optional[str],
    ) -> TemporaryExecutionResult:
        if node.temporary_result:
            self.db.delete(node.temporary_result)
            self.db.flush()

        interactions = history[:]
        if initial_feedback:
            interactions.append(
                {
                    "type": "InitialModificationComment",
                    "data": {"comment": initial_feedback},
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                }
            )

        temp_result = TemporaryExecutionResult(
            node_instance_id=node.id,
            input_dependencies=input_map,
            accumulated_hitl_interactions=interactions,
            llm_model_name=settings.LLM_MODEL_NAME,
            temperature=settings.DEFAULT_TEMPERATURE,
        )
        self.db.add(temp_result)
        self.db.flush()
        return temp_result

    def _validate_execution_request(
        self,
        node: NodeInstance,
        user_feedback: Optional[str],
        is_retry_from_hitl: bool,
        base_version_id: Optional[int],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ):
        if adjudication_data:
            if node.hitl_mode != HITLMode.AVL:
                raise InvalidStateException("Adjudication data can only be provided for AVL nodes.")
            if node.status != NodeStatus.AWAITING_HITL_APPROVAL or not node.temporary_result:
                raise InvalidStateException(
                    "Cannot continue AVL loop unless status is AWAITING_HITL_APPROVAL with pending results."
                )
            if is_retry_from_hitl or user_feedback or base_version_id is not None:
                raise InvalidStateException("Conflicting parameters provided for AVL loop continuation.")
            return

        if is_retry_from_hitl:
            if node.status != NodeStatus.AWAITING_HITL_APPROVAL or not node.temporary_result:
                raise InvalidStateException(
                    "Cannot retry from HITL unless status is AWAITING_HITL_APPROVAL with temporary results."
                )
            if not user_feedback:
                raise InvalidStateException("Feedback must be provided for HITL retry.")
            if base_version_id is not None:
                raise InvalidStateException("base_version_id cannot be specified during a HITL retry loop.")
            return

        if node.node_type == NodeType.GENERATOR and node.status == NodeStatus.COMPLETED:
            raise ForbiddenException("Generator nodes cannot be re-executed once completed (R2.3).")

        if base_version_id is not None:
            exists = (
                self.db.query(NodeVersion.id)
                .filter_by(id=base_version_id, node_instance_id=node.id)
                .scalar()
                is not None
            )
            if not exists:
                raise InvalidStateException(
                    f"Base version id {base_version_id} does not exist or does not belong to node {node.id}."
                )

    def _resolve_external_inputs(self, node: NodeInstance) -> Dict[str, Any]:
        """
        Resolve external data dependencies by querying ProjectFile records once and
        loading the referenced blobs from storage.
        """
        resolved_external: Dict[str, Any] = {}
        if not node.external_inputs:
            return resolved_external

        def get_role_from_key(key: str) -> FileRole:
            if key in _INPUT_KEY_TO_ROLE_MAP:
                return _INPUT_KEY_TO_ROLE_MAP[key]
            try:
                return FileRole(key)
            except ValueError as exc:
                raise DependencyException(
                    f"Unknown external input key '{key}' defined in workflow. No matching FileRole found."
                ) from exc

        workflow = self.db.query(WorkflowInstance).get(node.workflow_instance_id)
        if not workflow or not workflow.project_id:
            raise DependencyException(
                "Node requires external inputs but is not linked to a valid project.",
                details={"node_id": node.id, "workflow_id": node.workflow_instance_id},
            )

        project_id = workflow.project_id
        logger.info("Resolving external inputs for project_id={project_id}", project_id=project_id)

        required_roles = {get_role_from_key(key) for key in node.external_inputs}
        project_files = (
            self.db.query(ProjectFile)
            .filter(
                ProjectFile.project_id == project_id,
                ProjectFile.role.in_(list(required_roles)),
            )
            .all()
        )

        files_by_role: Dict[FileRole, List[ProjectFile]] = defaultdict(list)
        for project_file in project_files:
            files_by_role[project_file.role].append(project_file)

        for input_key in node.external_inputs:
            role_to_find = get_role_from_key(input_key)
            matching_files = files_by_role.get(role_to_find, [])

            if not matching_files:
                raise DependencyException(
                    f"Required file with role '{role_to_find.value}' not found for project {project_id}.",
                    details={"project_id": project_id, "required_role": role_to_find.value},
                )

            if len(matching_files) > 1:
                raise DependencyException(
                    f"Ambiguous dependency: Found {len(matching_files)} files with role '{role_to_find.value}' for project {project_id}. Expected 1.",
                    details={
                        "project_id": project_id,
                        "ambiguous_role": role_to_find.value,
                        "file_ids": [f.id for f in matching_files],
                    },
                )

            project_file = matching_files[0]

            try:
                content_bytes = storage_service.get_file_content(project_file.storage_path)
                resolved_external[input_key] = content_bytes.decode("utf-8")
                logger.debug(
                    "Resolved external input '{key}' using file '{filename}'",
                    key=input_key,
                    filename=project_file.filename,
                )
            except FileNotFoundError as exc:
                logger.error(
                    "Data integrity issue: DB record for file '{path}' exists but file is missing from storage.",
                    path=project_file.storage_path,
                )
                raise DependencyException(
                    f"File not found in storage for role '{role_to_find.value}' at path '{project_file.storage_path}'."
                ) from exc
            except Exception as exc:
                logger.exception("Failed to read or decode file content for role '{role}'", role=role_to_find.value)
                raise DependencyException(f"Error processing file for role '{role_to_find.value}': {exc}") from exc

        return resolved_external

    def _resolve_dependencies(self, node: NodeInstance) -> Tuple[Dict[str, Any], Dict[int, int]]:
        input_dependency_map: Dict[int, int] = {}
        resolved_inputs = self._resolve_external_inputs(node)

        if not node.dependencies:
            return resolved_inputs, input_dependency_map

        upstream_definition_ids = list(node.dependencies.keys())
        upstream_nodes = (
            self.db.query(NodeInstance)
            .filter(
                NodeInstance.workflow_instance_id == node.workflow_instance_id,
                NodeInstance.definition_id.in_(upstream_definition_ids),
            )
            .options(joinedload(NodeInstance.active_version))
            .all()
        )

        found_definition_ids = set()
        for upstream in upstream_nodes:
            definition_id = upstream.definition_id
            found_definition_ids.add(definition_id)
            if upstream.status != NodeStatus.COMPLETED or not upstream.active_version:
                raise DependencyException(f"Upstream dependency '{definition_id}' is not completed.")

            upstream_output = upstream.active_version.output_data or {}
            dependency_spec = node.dependencies.get(definition_id, {})
            required_fields = dependency_spec.get("required_fields", [])

            if required_fields:
                missing_fields = [field for field in required_fields if field not in upstream_output]
                if missing_fields:
                    raise DependencyException(f"Upstream dependency '{definition_id}' is missing fields: {missing_fields}")

            upstream_input_data: Dict[str, Any] = {}
            if required_fields:
                for field in required_fields:
                    upstream_input_data[field] = upstream_output[field]
            resolved_inputs[definition_id] = upstream_input_data
            input_dependency_map[upstream.id] = upstream.active_version_id

        if len(found_definition_ids) != len(upstream_definition_ids):
            missing = set(upstream_definition_ids) - found_definition_ids
            raise DependencyException(f"Could not resolve dependencies: {missing}")
        return resolved_inputs, input_dependency_map

    def _resolve_dependencies_from_map(
        self,
        node: NodeInstance,
        dependency_map: Dict[int, int],
        db_session: Optional[Session] = None,
    ) -> Tuple[Dict[str, Any], Dict[int, int]]:
        db = db_session or self.db
        dependency_map = dependency_map or {}
        try:
            resolved_inputs = self._resolve_external_inputs(node)
        except DependencyException:
            logger.exception("Fatal: Failed to re-resolve external inputs during retry", node_id=node.id)
            raise

        version_ids = list(dependency_map.values())
        if not version_ids:
            return resolved_inputs, dependency_map

        versions = db.query(NodeVersion).filter(NodeVersion.id.in_(version_ids)).options(
            joinedload(NodeVersion.node_instance)
        ).all()
        version_lookup = {version.id: version for version in versions}

        for node_id_value, version_id in dependency_map.items():
            version = version_lookup.get(version_id)
            if not version:
                raise NotFoundException(f"Dependency version {version_id} not found.")

            definition_id = version.node_instance.definition_id
            upstream_output = version.output_data or {}
            dependency_spec = node.dependencies.get(definition_id, {}) if node.dependencies else {}
            required_fields = dependency_spec.get("required_fields", [])

            if required_fields:
                missing_fields = [field for field in required_fields if field not in upstream_output]
                if missing_fields:
                    raise DependencyException(
                        f"Upstream dependency '{definition_id}' is missing fields: {missing_fields}"
                    )

            upstream_input_data: Dict[str, Any] = {}
            if required_fields:
                for field in required_fields:
                    upstream_input_data[field] = upstream_output[field]
            resolved_inputs[definition_id] = upstream_input_data

        return resolved_inputs, dependency_map

    def get_node_detail_view(self, node_id: int, user: User) -> NodeDetailView:
        """Get the detailed view for a node, with an ownership check and optimized query."""
        node = (
            self.db.query(NodeInstance)
            .options(joinedload(NodeInstance.active_version), joinedload(NodeInstance.temporary_result))
            .get(node_id)
        )
        if not node:
            raise NotFoundException(f"NodeInstance with id {node_id} not found.")
        if node.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this node.")

        if node.status == NodeStatus.NOT_STARTED:
            max_executed_index = (
                self.db.query(func.max(NodeInstance.order_index))
                .filter(
                    NodeInstance.workflow_instance_id == node.workflow_instance_id,
                    NodeInstance.status != NodeStatus.NOT_STARTED,
                )
                .scalar()
            )

            execution_frontier = 0 if max_executed_index is None else max_executed_index + 1
            if node.order_index > execution_frontier:
                raise ForbiddenException(
                    f"Cannot jump ahead (R5.2). Node {node.definition_id} (Index {node.order_index}) "
                    f"is beyond the execution frontier (Index {execution_frontier})."
                )

        view = NodeDetailView.model_validate(node)
        if node.active_version:
            view.active_version = NodeVersionRead.model_validate(node.active_version)
        if node.temporary_result:
            view.pending_result = TemporaryExecutionRead.model_validate(node.temporary_result)

        inputs_to_check = None
        if node.status == NodeStatus.COMPLETED and node.active_version:
            inputs_to_check = node.active_version.input_dependencies
        elif node.temporary_result:
            inputs_to_check = node.temporary_result.input_dependencies

        if inputs_to_check:
            staleness_report = self._check_staleness(inputs_to_check)
            view.staleness_report = staleness_report or None

        return view

    def _check_staleness(self, input_map: Dict[int, int]) -> List[StalenessInfo]:
        if not input_map:
            return []

        staleness_report: List[StalenessInfo] = []
        upstream_node_ids = list(input_map.keys())
        upstream_nodes = self.db.query(NodeInstance).filter(NodeInstance.id.in_(upstream_node_ids)).all()

        for upstream in upstream_nodes:
            consumed_version_id = input_map.get(upstream.id)
            if upstream.active_version_id != consumed_version_id:
                staleness_report.append(
                    StalenessInfo(
                        upstream_node_id=upstream.id,
                        upstream_definition_id=upstream.definition_id,
                        consumed_version_id=consumed_version_id,
                        current_active_version_id=upstream.active_version_id,
                    )
                )
        return staleness_report

    def _create_manual_version(
        self,
        node: NodeInstance,
        base_version: NodeVersion,
        submission: ManualEditSubmission,
    ) -> NodeVersion:
        """Create a new NodeVersion record based on a manual edit submission."""
        with self.db.begin_nested():
            (
                self.db.query(NodeInstance)
                .filter_by(id=node.id)
                .with_for_update()
                .one()
            )

            max_version = (
                self.db.query(func.max(NodeVersion.version_number))
                .filter_by(node_instance_id=node.id)
                .scalar()
            )
            next_version_number = (max_version or 0) + 1

            history = list(base_version.hitl_history or [])
            history.append(
                {
                    "type": "ManualEdit",
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "data": {"summary": submission.summary},
                }
            )

            new_version = NodeVersion(
                node_instance_id=node.id,
                version_number=next_version_number,
                source=VersionSource.MANUALLY_EDITED,
                based_on_version_id=base_version.id,
                output_data=submission.edited_output_data,
                raw_generated_output=base_version.raw_generated_output,
                input_dependencies=base_version.input_dependencies,
                hitl_history=history,
                llm_model_name=base_version.llm_model_name,
                temperature=base_version.temperature,
                summary=submission.summary or f"Manual edit based on v{base_version.version_number}",
            )
            self.db.add(new_version)
            self.db.flush()

        return new_version

    async def _finalize_node_completion_and_advance(
        self,
        node: NodeInstance,
        user: User,
        new_version: NodeVersion,
        final_output: Dict[str, Any],
    ):
        """
        Centralized helper to finalize node completion, update workflow state, and advance execution.
        """
        from backend.services.workflow_service import WorkflowService

        workflow_service = WorkflowService(self.db)
        next_node: Optional[NodeInstance] = None
        structure_changed = False
        workflow_completed = False

        try:
            node.active_version_id = new_version.id
            node.status = NodeStatus.COMPLETED
            node.current_stage = ExecutionStage.COMPLETED

            if node.temporary_result:
                self.db.delete(node.temporary_result)

            self.db.flush()

            if node.node_type == NodeType.GENERATOR:
                structure_changed = workflow_service.handle_generator_node_completion(node, final_output)

            next_node = workflow_service.get_next_node(node)

            if not next_node:
                workflow_service.complete_workflow(node.workflow_instance_id, user=user)
                workflow_completed = True

            self.db.commit()
        except Exception:
            self.db.rollback()
            logger.exception(
                "Transaction failed during node finalization and workflow advancement",
                node_id=node.id,
            )
            raise InvalidStateException("Failed to finalize node completion due to an internal error.")

        self.db.refresh(node)
        await self._broadcast_node_update(node)

        if structure_changed:
            await workflow_service.broadcast_structure_update(node.workflow_instance_id)

        if workflow_completed:
            workflow = workflow_service.get_workflow_instance(node.workflow_instance_id, user=user)
            await workflow_service._broadcast_workflow_update(workflow)

        if next_node and next_node.status == NodeStatus.NOT_STARTED:
            await self.enqueue_initial_execution(next_node.id, user=user)

    async def submit_manual_edit(
        self,
        node_id: int,
        user: User,
        submission: ManualEditSubmission,
    ) -> NodeInstance:
        """
        Process a manual edit submission, creating a new version and advancing the workflow (FRS R4).
        """
        node = self.get_node_instance(node_id, user=user)

        if node.status == NodeStatus.COMPLETED and node.node_type == NodeType.GENERATOR:
            raise ForbiddenException("Cannot edit a completed Generator node as it would alter the workflow structure.")

        base_version = (
            self.db.query(NodeVersion)
            .filter_by(id=submission.base_version_id, node_instance_id=node.id)
            .first()
        )
        if not base_version:
            raise InvalidStateException(f"Base version {submission.base_version_id} not found for this node.")

        try:
            new_version = self._create_manual_version(node, base_version, submission)
            await self._finalize_node_completion_and_advance(
                node,
                user,
                new_version,
                final_output=submission.edited_output_data,
            )
        except Exception:
            logger.exception("Failed to process manual edit for node", node_id=node_id)
            raise

        return node

    async def switch_active_version(self, node_id: int, version_id: int, user: User) -> NodeInstance:
        """Switch a node's active version, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        version = self.db.query(NodeVersion).filter_by(id=version_id, node_instance_id=node_id).first()
        if not version:
            raise InvalidStateException(f"Version {version_id} does not belong to node {node_id}.")
        if node.node_type == NodeType.GENERATOR:
            raise ForbiddenException("Switching versions on Generator nodes is forbidden.")
        node.active_version_id = version_id
        status_changed = False
        if node.status not in [NodeStatus.EXECUTING, NodeStatus.AWAITING_HITL_APPROVAL]:
            if node.status != NodeStatus.COMPLETED:
                node.status = NodeStatus.COMPLETED
                node.current_stage = ExecutionStage.COMPLETED
                status_changed = True
        self.db.commit()
        self.db.refresh(node)

        if status_changed:
            await self._broadcast_node_update(node)

        return node

    async def _broadcast_node_update(self, node: NodeInstance):
        """Broadcasts a standardized node update event."""

        node_data = NodeInstanceRead.model_validate(node).model_dump(mode="json")
        await broadcast_event(node.workflow_instance_id, EventType.NODE_STATUS_UPDATED, node_data, node_id=node.id)

    def get_versions(self, node_id: int, user: User) -> List[NodeVersion]:
        """Get all versions for a node, with an ownership check."""
        self.get_node_instance(node_id, user=user)
        return (
            self.db.query(NodeVersion)
            .filter(NodeVersion.node_instance_id == node_id)
            .order_by(NodeVersion.version_number.desc())
            .all()
        )

    def get_version_details(self, node_id: int, version_id: int, user: User) -> NodeVersionRead:
        """Get details for a specific version, with an ownership check."""
        self.get_node_instance(node_id, user=user)
        version = self.db.query(NodeVersion).filter_by(id=version_id, node_instance_id=node_id).first()
        if not version:
            raise NotFoundException(f"Version {version_id} for Node {node_id} not found.")
        return NodeVersionRead.model_validate(version)

```

### services/project_service.py Content:

```py
"""
Service for managing the project lifecycle and workflow orchestration.
"""
from pathlib import Path
from typing import List, Optional, Tuple

from fastapi import UploadFile
from loguru import logger
from sqlalchemy.orm import Session

from backend.config import settings
from backend.exceptions import DependencyException, ForbiddenException, InvalidStateException, NotFoundException
from backend.models.project import FileRole, HistoricalProblem, Project, ProjectFile, ProjectStatus, ProblemType
from backend.models.user import User
from backend.models.workflow import NodeInstance, WorkflowInstance
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.services.storage_service import storage_service
from backend.services.user_service import UserService
from backend.services.workflow_service import WorkflowService


class ProjectService:
    """Service for managing the project lifecycle and configuration."""

    def __init__(
        self,
        db: Session,
        user_service: Optional[UserService] = None,
        workflow_service: Optional[WorkflowService] = None,
    ):
        """
        Initialize service dependencies, allowing overrides for testability.
        """
        self.db = db
        self.user_service = user_service or UserService()
        self.workflow_service = workflow_service or WorkflowService(db)

    def _get_project_for_user(self, project_id: int, user: User) -> Project:
        """Retrieve a project and enforce ownership."""
        project = self.db.query(Project).get(project_id)
        if not project:
            raise NotFoundException(f"Project with id {project_id} not found.")
        if project.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this project.")
        return project

    def create_project(self, project_data: ProjectCreate, user: User) -> Project:
        """Create a new project for the given user."""
        existing_project = (
            self.db.query(Project)
            .filter(Project.user_id == user.id, Project.name == project_data.name)
            .first()
        )
        if existing_project:
            raise InvalidStateException(
                f"Project with name '{project_data.name}' already exists.",
                error_code="PROJECT_NAME_EXISTS",
            )

        new_project = Project(
            user_id=user.id,
            name=project_data.name,
            description=project_data.description,
            status=ProjectStatus.CONFIGURING,
        )
        self.db.add(new_project)
        self.db.commit()
        self.db.refresh(new_project)
        logger.info("Created new project '{}' for user {}", new_project.name, user.id)
        return new_project

    def get_projects_paginated(self, user: User, skip: int, limit: int) -> Tuple[int, List[Project]]:
        """Return a user's projects along with a total count for pagination."""
        query = self.db.query(Project).filter(Project.user_id == user.id)
        total = query.count()
        items = query.order_by(Project.updated_at.desc()).offset(skip).limit(limit).all()
        return total, items

    def get_project_details(self, project_id: int, user: User) -> Project:
        """Return project details after verifying ownership."""
        return self._get_project_for_user(project_id, user)

    def update_project(self, project_id: int, update_data: ProjectUpdate, user: User) -> Project:
        """Update mutable project fields."""
        project = self._get_project_for_user(project_id, user)
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(project, key, value)
        self.db.commit()
        self.db.refresh(project)
        logger.info("Updated project {}", project_id)
        return project

    def delete_project(self, project_id: int, user: User) -> None:
        """Delete a project and its stored files."""
        project = self._get_project_for_user(project_id, user)
        files_to_delete = list(project.files)

        self.db.delete(project)
        self.db.commit()
        logger.info("Deleted project {} from database for user {}", project_id, user.id)

        for file_record in files_to_delete:
            storage_service.delete_file(file_record.storage_path)

    async def upload_file(self, project_id: int, user: User, file: UploadFile, role: FileRole) -> ProjectFile:
        """Upload and associate a file with the project."""
        project = self._get_project_for_user(project_id, user)
        content = await file.read()
        new_file = self._create_and_store_file(project, user, file.filename, role, content)
        self.db.commit()
        self.db.refresh(new_file)
        logger.info("Uploaded file '{}' for project {}", file.filename, project_id)
        return new_file

    def _create_and_store_file(
        self,
        project: Project,
        user: User,
        filename: str,
        role: FileRole,
        content: bytes,
    ) -> ProjectFile:
        """Persist content to storage and return the ProjectFile record."""
        storage_path = storage_service.save_file(
            user_id=user.id,
            project_id=project.id,
            filename=filename,
            content=content,
        )
        new_file = ProjectFile(
            project_id=project.id,
            user_id=user.id,
            filename=filename,
            role=role,
            storage_path=storage_path,
        )
        self.db.add(new_file)
        return new_file

    def initialize_from_historical(self, project_id: int, historical_problem_id: int, user: User) -> Project:
        """Configure a project using assets from the historical library."""
        project = self._get_project_for_user(project_id, user)
        historical_problem = self.db.query(HistoricalProblem).get(historical_problem_id)
        if not historical_problem:
            raise NotFoundException(f"HistoricalProblem with id {historical_problem_id} not found.")

        historical_data_base_path = Path(settings.EXTERNAL_DATA_DIR)
        try:
            desc_path = historical_data_base_path / historical_problem.description_path
            desc_content = desc_path.read_bytes()
            self._create_and_store_file(project, user, desc_path.name, FileRole.PROBLEM_DESCRIPTION, desc_content)

            if historical_problem.dataset_path:
                dataset_path = historical_data_base_path / historical_problem.dataset_path
                dataset_content = dataset_path.read_bytes()
                self._create_and_store_file(project, user, dataset_path.name, FileRole.DATASET, dataset_content)

            project.historical_problem_id = historical_problem.id
            project.problem_type = historical_problem.type
            self.db.commit()
            self.db.refresh(project)
            logger.info("Initialized project {} from historical problem {}", project_id, historical_problem_id)
            return project
        except FileNotFoundError as exc:
            self.db.rollback()
            logger.error("Failed to find historical problem file: {}", exc)
            raise DependencyException(f"A file for '{historical_problem.name}' was not found on the server.") from exc
        except Exception:
            self.db.rollback()
            logger.exception("Failed during historical problem initialization for project {}", project_id)
            raise

    def _create_workflow_for_project(self, project: Project) -> WorkflowInstance:
        """Create and initialize a workflow (and its nodes) for the project."""
        workflow = WorkflowInstance(
            name=f"Workflow for '{project.name}'",
            project_id=project.id,
            user_id=project.user_id,
        )
        self.db.add(workflow)
        self.db.flush()
        self.workflow_service._initialize_nodes(workflow)
        return workflow

    async def start_workflow(self, project_id: int, user: User) -> NodeInstance:
        """Start the workflow for a configured project."""
        project = self._get_project_for_user(project_id, user)

        if project.status != ProjectStatus.CONFIGURING:
            raise InvalidStateException("Project must be in 'Configuring' status to start a workflow.")
        if project.problem_type == ProblemType.UNKNOWN:
            raise InvalidStateException("Problem Type must be set before starting.")
        has_problem_description = (
            self.db.query(ProjectFile)
            .filter_by(project_id=project.id, role=FileRole.PROBLEM_DESCRIPTION)
            .first()
        )
        if not has_problem_description:
            raise InvalidStateException("A 'Problem Description' file must be uploaded before starting.")
        if project.workflow_instance:
            raise InvalidStateException("A workflow has already been started for this project.")

        try:
            decrypted_settings = self.user_service.get_decrypted_settings(self.db, user)
            project.configuration_snapshot = decrypted_settings
            project.status = ProjectStatus.RUNNING

            workflow = self._create_workflow_for_project(project)
            self.db.commit()
            logger.info(
                "Snapshot created, project {} status set to RUNNING. Workflow {} created.",
                project.id,
                workflow.id,
            )

            first_node = await self.workflow_service.start_workflow(workflow.id, user)
            logger.info("Successfully started workflow {} for project {}.", workflow.id, project.id)
            return first_node
        except Exception:
            self.db.rollback()
            logger.exception("Failed to start workflow for project {}", project_id)
            raise

```

### services/storage_service.py Content:

```py
"""
Service for securely managing file storage and retrieval with tenant isolation.
This service abstracts file system operations and enforces security policies to
prevent unauthorized file access.
"""

import os
import uuid
from pathlib import Path

from loguru import logger

from backend.config import settings
from backend.exceptions import ForbiddenException, NotFoundException


class StorageService:
    """
    Manages file storage and retrieval with tenant isolation.
    Ensures that files are stored in a structured way (e.g., base_path/user_id/project_id/)
    and prevents path traversal attacks.
    """

    def __init__(self, base_path: Path):
        self.base_path = base_path.resolve()  # Use absolute path for security checks
        # Ensure the base directory exists
        os.makedirs(self.base_path, exist_ok=True)
        logger.info("StorageService initialized with base path: {}", self.base_path)

    def _get_project_dir(self, user_id: int, project_id: int) -> Path:
        """Constructs and returns the directory path for a specific project."""
        return self.base_path / str(user_id) / str(project_id)

    def _get_and_validate_path(self, storage_path: str) -> Path:
        """
        Constructs a full, absolute path from a relative storage path and validates it.
        Raises:
            ForbiddenException: If the path is invalid or outside the storage root.
        """
        # Prevent any path traversal characters in the relative path.
        if ".." in Path(storage_path).parts:
            logger.warning("Path traversal attempt detected in storage path: {}", storage_path)
            raise ForbiddenException("Invalid storage path format.")

        full_path = (self.base_path / storage_path).resolve()

        # Security Check: Ensure the resolved path is within the base storage directory.
        try:
            if not full_path.is_relative_to(self.base_path):
                raise ForbiddenException("Access to this file path is forbidden.")
        except AttributeError:  # Fallback for Python < 3.9
            if not str(full_path).startswith(str(self.base_path)):
                raise ForbiddenException("Access to this file path is forbidden.")

        return full_path

    def save_file(self, user_id: int, project_id: int, filename: str, content: bytes) -> str:
        """
        Saves file content to a user- and project-specific directory with a unique name.
        Args:
            user_id: The ID of the user owning the project.
            project_id: The ID of the project.
            filename: The original name of the file to save.
            content: The binary content of the file.
        Returns:
            The unique, relative storage path to be saved in the database.
        """
        project_dir = self._get_project_dir(user_id, project_id)
        os.makedirs(project_dir, exist_ok=True)

        original_path = Path(filename)
        # Sanitize filename to prevent security issues (e.g., path traversal in filename itself)
        safe_stem = Path(original_path.stem).name
        if not safe_stem:
            raise ValueError("A valid filename must be provided.")

        # Optimization: Generate a unique filename to prevent overwrites.
        unique_id = uuid.uuid4().hex[:8]
        unique_filename = f"{safe_stem}-{unique_id}{original_path.suffix}"

        file_path = project_dir / unique_filename
        file_path.write_bytes(content)

        relative_path = str(file_path.relative_to(self.base_path))
        logger.info("File saved successfully. Original: '{}', Stored As: '{}'", filename, relative_path)
        return relative_path

    def get_file_content(self, storage_path: str) -> bytes:
        """
        Retrieves the content of a file given its relative storage path.
        Args:
            storage_path: The relative path from the database.
        Returns:
            The binary content of the file.
        """
        full_path = self._get_and_validate_path(storage_path)

        if not full_path.is_file():
            raise NotFoundException(f"File not found at storage path: {storage_path}")

        logger.debug("Reading file content from: {}", full_path)
        return full_path.read_bytes()

    def delete_file(self, storage_path: str) -> None:
        """
        Deletes a file given its relative storage path. Is idempotent.
        Args:
            storage_path: The relative path from the database.
        """
        try:
            full_path = self._get_and_validate_path(storage_path)

            if full_path.is_file():
                os.remove(full_path)
                logger.info("File deleted successfully: {}", full_path)
            else:
                logger.warning("Attempted to delete a non-existent file, operation skipped: {}", storage_path)
        except (NotFoundException, ForbiddenException) as e:
            # If path is invalid or not found, we can consider the "delete" successful.
            logger.warning("Skipped deleting file due to path validation issue: {}. Message: {}", storage_path, e)


# Instantiate a singleton for the service, making it easily accessible.
storage_service = StorageService(base_path=settings.STORAGE_BASE_PATH)

```

### services/user_service.py Content:

```py
"""Service for managing user-specific settings, including BYOK credentials."""

from typing import Any, Dict

from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.security import decrypt_data, encrypt_data
from backend.config import settings
from backend.models.user import User, UserSettings
from backend.schemas.user import UserSettingsUpdate


class UserService:
    """Service for managing user-specific settings."""

    def get_settings(self, db: Session, user: User) -> UserSettings:
        """
        Retrieve settings for a given user.

        Args:
            db: The database session.
            user: The user object.

        Returns:
            The UserSettings object associated with the user.
        """
        if not user.settings:
            logger.critical(
                "Data integrity error: UserSettings not found for an existing user. "
                "This should not happen as they are created during registration.",
                user_id=user.id,
            )
            raise Exception(f"CRITICAL: No settings found for user {user.id}")
        return user.settings

    def update_settings(self, db: Session, user: User, settings_in: UserSettingsUpdate) -> UserSettings:
        """
        Update user settings, securely encrypting API keys before storage.

        Args:
            db: The database session.
            user: The user whose settings are being updated.
            settings_in: A Pydantic model with optional fields to update.

        Returns:
            The updated UserSettings object.
        """
        user_settings = self.get_settings(db, user)
        update_data = settings_in.model_dump(exclude_unset=True)

        try:
            for key, value in update_data.items():
                if key == "llm_api_key":
                    user_settings.llm_api_key_encrypted = encrypt_data(value) if value else None
                elif key == "e2b_api_key":
                    user_settings.e2b_api_key_encrypted = encrypt_data(value) if value else None
                elif hasattr(user_settings, key):
                    setattr(user_settings, key, value)

            db.commit()
            db.refresh(user_settings)
            logger.info("User settings updated successfully.", user_id=user.id)
            return user_settings
        except Exception:
            db.rollback()
            logger.exception("Failed to update user settings.", user_id=user.id)
            raise

    def get_decrypted_settings(self, db: Session, user: User) -> Dict[str, Any]:
        """
        Retrieve user settings with sensitive values decrypted for internal use.
        This is critical for creating the project's configuration snapshot.

        Args:
            db: The database session.
            user: The user object.

        Returns:
            A dictionary of settings with decrypted API keys.
        """
        user_settings = self.get_settings(db, user)

        # Explicitly construct the dictionary to avoid accidentally exposing
        # internal fields (like id, user_id) and to provide a stable contract.
        decrypted_settings = {
            "language": user_settings.language.value,
            "theme": user_settings.theme.value,
            "hitl_profile": user_settings.hitl_profile.value,
            "thinking_depth": user_settings.thinking_depth.value,
            "llm_model_name": user_settings.llm_model_name or settings.LLM_MODEL_NAME,
            "llm_base_url": user_settings.llm_base_url or settings.LLM_BASE_URL,
            "llm_provider": settings.LLM_PROVIDER,
            "llm_api_key": settings.LLM_API_KEY,
            "e2b_api_key": settings.E2B_API_KEY,
        }

        try:
            if user_settings.llm_api_key_encrypted:
                decrypted_settings["llm_api_key"] = decrypt_data(user_settings.llm_api_key_encrypted)
        except Exception:
            logger.warning(
                "Failed to decrypt LLM API key for user. Falling back to default.", user_id=user.id
            )
            decrypted_settings["llm_api_key"] = decrypted_settings.get("llm_api_key") or settings.LLM_API_KEY

        try:
            if user_settings.e2b_api_key_encrypted:
                decrypted_settings["e2b_api_key"] = decrypt_data(user_settings.e2b_api_key_encrypted)
        except Exception:
            logger.warning("Failed to decrypt E2B API key for user. Proceeding without it.", user_id=user.id)
            decrypted_settings["e2b_api_key"] = decrypted_settings.get("e2b_api_key")

        return decrypted_settings

```

### services/workflow_service.py Content:

```py
from typing import Any, Dict, List, Optional, Set

from loguru import logger
from sqlalchemy.orm import Session, joinedload

from backend.exceptions import ForbiddenException, InvalidStateException, NotFoundException
from backend.models.project import Project
from backend.models.user import User
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, WorkflowInstance, WorkflowStatus
from backend.schemas.common import PaginatedResponse
from backend.schemas.events import EventType
from backend.schemas.node import StalenessInfo
from backend.schemas.workflow import WorkflowCreate, WorkflowInstanceRead, WorkflowUpdate
from backend.services.node_service import NodeService
from backend.utils.event_utils import broadcast_event
from backend.workflow_definition import (
    PHASE_2_TEMPLATE,
    PREVIOUS_IN_TASK,
    TERMINAL_NODE_SUFFIX,
    WORKFLOW_DEFINITION,
    NodeType,
)


def _merge_dependencies(
    base_deps: Optional[Dict[str, Dict[str, List[str]]]],
    overlay_deps: Optional[Dict[str, List[str]]],
) -> Dict[str, Dict[str, List[str]]]:
    """
    Merge overlay dependencies into the base dependencies while keeping required_fields unique.
    """
    merged: Dict[str, Dict[str, List[str]]] = {}
    if base_deps:
        for upstream_id, metadata in base_deps.items():
            fields = metadata.get("required_fields", [])
            merged[upstream_id] = {"required_fields": list(fields)}

    if not overlay_deps:
        return merged

    for upstream_id, required_fields_list in overlay_deps.items():
        if not isinstance(required_fields_list, list):
            logger.warning(
                "Skipping malformed dependency requirement",
                upstream_id=upstream_id,
                field_type=type(required_fields_list),
            )
            continue

        existing_fields = set(merged.get(upstream_id, {}).get("required_fields", []))
        existing_fields.update(required_fields_list)
        merged[upstream_id] = {"required_fields": sorted(existing_fields)}

    return merged


class WorkflowService:
    def __init__(self, db: Session):
        self.db = db

    def _get_workflow_for_user(self, workflow_id: int, user: User) -> WorkflowInstance:
        """Retrieve a workflow and enforce ownership."""
        workflow = self.db.query(WorkflowInstance).get(workflow_id)
        if not workflow:
            raise NotFoundException(f"WorkflowInstance {workflow_id} not found.")
        if workflow.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this workflow.")
        return workflow

    def get_workflows_paginated(
        self, user: User, skip: int, limit: int
    ) -> PaginatedResponse[WorkflowInstanceRead]:
        """Return a user's workflows ordered by creation date with pagination."""
        query = self.db.query(WorkflowInstance).filter(WorkflowInstance.user_id == user.id)
        total = query.count()
        workflows = (
            query.options(joinedload(WorkflowInstance.nodes))
            .order_by(WorkflowInstance.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        serialized = [WorkflowInstanceRead.model_validate(workflow) for workflow in workflows]
        return PaginatedResponse(total=total, items=serialized)

    def get_workflow_instance(self, workflow_id: int, user: User) -> WorkflowInstance:
        """Get a workflow instance with ownership check."""
        return self._get_workflow_for_user(workflow_id, user)

    def create_workflow(self, create_data: WorkflowCreate, user: User) -> WorkflowInstance:
        project = self.db.query(Project).get(create_data.project_id)
        if not project:
            raise NotFoundException(f"Project {create_data.project_id} not found.")
        if project.user_id != user.id:
            raise ForbiddenException("You do not have permission to modify this project.")
        if project.workflow_instance:
            raise InvalidStateException("A workflow already exists for this project.")

        workflow = WorkflowInstance(
            name=create_data.name,
            project_id=project.id,
            user_id=user.id,
        )
        self.db.add(workflow)
        self.db.flush()
        self._initialize_nodes(workflow)
        self.db.commit()
        self.db.refresh(workflow)
        return workflow

    def update_workflow(
        self, workflow_id: int, update_data: WorkflowUpdate, user: User
    ) -> WorkflowInstance:
        """Update mutable workflow fields."""
        workflow = self._get_workflow_for_user(workflow_id, user)
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(workflow, key, value)
        self.db.commit()
        self.db.refresh(workflow)
        return workflow

    def delete_workflow(self, workflow_id: int, user: User) -> None:
        """Delete a workflow and all related nodes/versions."""
        workflow = self._get_workflow_for_user(workflow_id, user)
        self.db.delete(workflow)
        self.db.commit()
        logger.info("Deleted workflow and associated data", workflow_id=workflow_id)

    def _initialize_nodes(self, workflow: WorkflowInstance):
        order_index = 0
        for node_def in WORKFLOW_DEFINITION["structure"]:
            node = NodeInstance(
                workflow_instance_id=workflow.id,
                user_id=workflow.user_id,
                definition_id=node_def["id"],
                name=node_def["name"],
                node_type=node_def["type"],
                hitl_mode=node_def["hitl_mode"],
                dependencies=node_def.get("dependencies", {}),
                external_inputs=node_def.get("external_inputs", []),
                order_index=order_index,
                phase_id=node_def["phase"],
                task_group_id=node_def.get("task_group_id"),
                current_stage=ExecutionStage.NOT_STARTED,
            )
            self.db.add(node)
            order_index += 1

    async def start_workflow(self, workflow_id: int, user: User) -> NodeInstance:
        """Starts or resumes a workflow, with an ownership check."""
        workflow = self._get_workflow_for_user(workflow_id, user)
        first_node = (
            self.db.query(NodeInstance)
            .filter_by(workflow_instance_id=workflow_id, order_index=0)
            .first()
        )
        if not first_node:
            raise InvalidStateException("Workflow has no nodes.")
        if first_node.status != NodeStatus.NOT_STARTED:
            if first_node.status != NodeStatus.FAILED or first_node.active_version_id is not None:
                raise InvalidStateException("Workflow has already been started.")
        if workflow.status != WorkflowStatus.RUNNING:
            workflow.status = WorkflowStatus.RUNNING
            self.db.commit()
            await self._broadcast_workflow_update(workflow)

        node_service = NodeService(self.db)
        return await node_service.enqueue_initial_execution(first_node.id, user)

    def get_next_node(self, current_node: NodeInstance) -> Optional[NodeInstance]:
        return (
            self.db.query(NodeInstance)
            .filter_by(
                workflow_instance_id=current_node.workflow_instance_id,
                order_index=current_node.order_index + 1,
            )
            .first()
        )

    def handle_generator_node_completion(self, node: NodeInstance, output: Dict[str, Any]) -> bool:
        """
        Handles dynamic task generation for Generator nodes while relying on the caller's transaction.
        Returns True if the workflow structure changed, False otherwise.
        """
        if node.node_type != NodeType.GENERATOR:
            return False

        taskbook_data = output.get("Structured Modeling Taskbook", {})
        taskbook = taskbook_data.get("tasks")
        if not taskbook:
            logger.warning(
                "Generator node completed without a valid 'Structured Modeling Taskbook'. No dynamic nodes created.",
                node_id=node.id,
            )
            return False

        insertion_index = node.order_index + 1
        total_nodes_to_insert = len(taskbook) * len(PHASE_2_TEMPLATE)
        self._shift_subsequent_nodes(node.workflow_instance_id, insertion_index, total_nodes_to_insert)
        new_phase2_nodes = self._insert_dynamic_tasks(node.workflow_instance_id, insertion_index, taskbook)
        self._update_phase3_dependencies(node.workflow_instance_id, new_phase2_nodes)
        self.db.flush()

        return True

    def _shift_subsequent_nodes(self, workflow_id: int, start_index: int, shift_amount: int):
        (
            self.db.query(NodeInstance)
            .filter(NodeInstance.workflow_instance_id == workflow_id, NodeInstance.order_index >= start_index)
            .update({NodeInstance.order_index: NodeInstance.order_index + shift_amount}, synchronize_session=False)
        )

    def _insert_dynamic_tasks(
        self,
        workflow_id: int,
        start_index: int,
        taskbook: List[Dict[str, Any]],
    ) -> List[NodeInstance]:
        workflow = self.db.query(WorkflowInstance).get(workflow_id)
        if not workflow:
            raise NotFoundException(f"WorkflowInstance {workflow_id} not found during dynamic task insertion.")

        current_index = start_index
        all_new_nodes: List[NodeInstance] = []
        phase_2_name = "Phase 2: Cyclic Sub-problem Execution"
        defined_task_ids: Set[str] = {task["task_id"] for task in taskbook}

        for task in taskbook:
            task_id = task["task_id"]
            io_interfaces = task.get("io_interfaces", {})
            raw_task_specific_inputs = io_interfaces.get("inputs") or {}
            task_external_inputs = task.get("external_inputs") or []
            previous_node_in_task_def_id: Optional[str] = None
            resolved_task_specific_inputs: Dict[str, List[str]] = {}

            for upstream_id, required_fields in raw_task_specific_inputs.items():
                fields_list = required_fields if isinstance(required_fields, list) else [required_fields]

                if upstream_id in defined_task_ids:
                    resolved_id = f"{upstream_id}{TERMINAL_NODE_SUFFIX}"
                    resolved_task_specific_inputs[resolved_id] = list(fields_list)
                else:
                    resolved_task_specific_inputs[upstream_id] = list(fields_list)

            for id_suffix, template in PHASE_2_TEMPLATE.items():
                definition_id = f"{task_id}{id_suffix}"
                name = f"[{task_id}] {template['name_prefix']}"
                dependencies = {
                    "1.1.1": {"required_fields": ["Formal Problem Restatement"]},
                    "1.1.2": {"required_fields": ["Structured Modeling Taskbook"]},
                }

                dependencies = _merge_dependencies(dependencies, resolved_task_specific_inputs)

                template_inputs = template.get("inputs", {})
                intra_task_deps: Dict[str, List[str]] = {}
                for upstream_def_id, required_fields in template_inputs.items():
                    fields_list = list(required_fields)
                    if upstream_def_id == PREVIOUS_IN_TASK:
                        if previous_node_in_task_def_id:
                            intra_task_deps[previous_node_in_task_def_id] = fields_list
                    else:
                        intra_task_deps[upstream_def_id] = fields_list

                dependencies = _merge_dependencies(dependencies, intra_task_deps)

                node_external_inputs: List[str] = []
                if template.get("inherits_external_inputs"):
                    node_external_inputs = list(task_external_inputs)

                new_node = NodeInstance(
                    workflow_instance_id=workflow_id,
                    user_id=workflow.user_id,
                    definition_id=definition_id,
                    name=name,
                    node_type=template["type"],
                    hitl_mode=template["hitl_mode"],
                    dependencies=dependencies,
                    external_inputs=node_external_inputs,
                    order_index=current_index,
                    phase_id=phase_2_name,
                    task_group_id=task_id,
                    current_stage=ExecutionStage.NOT_STARTED,
                )
                self.db.add(new_node)
                all_new_nodes.append(new_node)
                current_index += 1
                previous_node_in_task_def_id = definition_id

        self.db.flush()
        return all_new_nodes

    def _update_phase3_dependencies(self, workflow_id: int, phase2_nodes: List[NodeInstance]):
        """Ensure node 3.1.1 depends on outputs from each Phase 2 robustness node."""
        node_311 = (
            self.db.query(NodeInstance)
            .filter_by(workflow_instance_id=workflow_id, definition_id="3.1.1")
            .first()
        )
        if not node_311:
            return
        current_deps = node_311.dependencies or {}
        new_deps_to_merge: Dict[str, List[str]] = {}
        terminal_template = PHASE_2_TEMPLATE.get(TERMINAL_NODE_SUFFIX)
        if not terminal_template:
            logger.error(
                "Terminal node template not found in PHASE_2_TEMPLATE",
                terminal_suffix=TERMINAL_NODE_SUFFIX,
            )
            return

        for p2_node in phase2_nodes:
            if p2_node.definition_id.endswith(TERMINAL_NODE_SUFFIX):
                required_fields = list(terminal_template.get("outputs", []))
                new_deps_to_merge[p2_node.definition_id] = required_fields

        node_311.dependencies = _merge_dependencies(current_deps, new_deps_to_merge)

    def complete_workflow(self, workflow_id: int, user: User):
        """Marks a workflow as completed, with an ownership check."""
        workflow = self._get_workflow_for_user(workflow_id, user)
        workflow.status = WorkflowStatus.COMPLETED
        self.db.flush()

    def calculate_bulk_staleness(self, workflow_id: int, user: User) -> Dict[int, List[StalenessInfo]]:
        """Returns detailed staleness reports for all workflow nodes, with an ownership check."""

        self._get_workflow_for_user(workflow_id, user)
        nodes = (
            self.db.query(NodeInstance)
            .filter(NodeInstance.workflow_instance_id == workflow_id)
            .options(joinedload(NodeInstance.active_version))
            .all()
        )

        active_version_map: Dict[int, Optional[int]] = {node.id: node.active_version_id for node in nodes}
        definition_id_map: Dict[int, str] = {node.id: node.definition_id for node in nodes}

        bulk_report: Dict[int, List[StalenessInfo]] = {}
        for node in nodes:
            if node.status == NodeStatus.COMPLETED and node.active_version:
                input_dependencies = node.active_version.input_dependencies or {}
                node_staleness: List[StalenessInfo] = []

                for upstream_node_id, consumed_version_id in input_dependencies.items():
                    current_active_version_id = active_version_map.get(upstream_node_id)
                    if current_active_version_id != consumed_version_id:
                        node_staleness.append(
                            StalenessInfo(
                                upstream_node_id=upstream_node_id,
                                upstream_definition_id=definition_id_map.get(upstream_node_id, "N/A"),
                                consumed_version_id=consumed_version_id,
                                current_active_version_id=current_active_version_id,
                            )
                        )

                if node_staleness:
                    bulk_report[node.id] = node_staleness

        return bulk_report

    async def broadcast_structure_update(self, workflow_id: int):
        await self._broadcast_structure_update(workflow_id)

    async def _broadcast_structure_update(self, workflow_id: int):
        workflow = (
            self.db.query(WorkflowInstance)
            .options(joinedload(WorkflowInstance.nodes))
            .get(workflow_id)
        )
        if workflow:
            workflow_data = WorkflowInstanceRead.model_validate(workflow).model_dump(mode="json")
            await broadcast_event(workflow_id, EventType.WORKFLOW_STRUCTURE_UPDATED, workflow_data)

    async def _broadcast_workflow_update(self, workflow: WorkflowInstance):
        if not workflow.nodes:
            self.db.refresh(workflow, ["nodes"])

        workflow_data = WorkflowInstanceRead.model_validate(workflow).model_dump(mode="json")
        await broadcast_event(workflow.id, EventType.WORKFLOW_STATUS_UPDATED, workflow_data)

```

        ## execution_engine
         - __init__.py
         - config_resolver.py
         - executor.py
         - llm_client.py
         - sandbox_client.py

### services/execution_engine/__init__.py Content:

```py
"""
Modular Execution Engine for running workflow nodes.

This package replaces the monolithic `ExecutionSimulator`. It provides a structured
and configurable approach to node execution, designed to support Bring-Your-Own-Key
(BYOK) functionality by isolating user-specific clients (LLM, Sandbox) based
on a project's configuration snapshot.
"""

from .config_resolver import ExecutionConfig, resolve_config
from .executor import NodeExecutor

__all__ = ["NodeExecutor", "ExecutionConfig", "resolve_config"]

```

### services/execution_engine/config_resolver.py Content:

```py
"""
Resolves and provides execution configuration from a project's snapshot.

This component's responsibility is to read the `configuration_snapshot` JSON blob
from a `Project` model. It will then provide a safe and structured interface for
the `NodeExecutor` to access the necessary credentials (API keys) and settings
for a given run.
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field, FieldValidationInfo, field_validator

from backend.config import settings
from backend.models.user import HITLProfile, ThinkingDepth


class ExecutionConfig(BaseModel):
    """
    Validated configuration derived from a project's snapshot.

    Defaults fall back to global settings so execution can proceed even when a
    project snapshot is missing or incomplete.
    """

    model_config = ConfigDict(extra="ignore")

    hitl_profile: HITLProfile = Field(default=HITLProfile.EXPERIENCED)
    thinking_depth: ThinkingDepth = Field(default=ThinkingDepth.MEDIUM)
    llm_model_name: str = Field(default_factory=lambda: settings.LLM_MODEL_NAME)
    llm_base_url: Optional[str] = Field(default_factory=lambda: settings.LLM_BASE_URL)
    llm_api_key: Optional[str] = Field(default_factory=lambda: settings.LLM_API_KEY)
    llm_provider: Optional[str] = Field(default_factory=lambda: settings.LLM_PROVIDER)
    e2b_api_key: Optional[str] = Field(default_factory=lambda: settings.E2B_API_KEY)

    @field_validator("llm_model_name", mode="before")
    @classmethod
    def _ensure_llm_model_name(cls, value: Optional[str]) -> str:
        """Treat null or empty values in snapshots as a request for the default model."""
        return cls._fallback_to_default(value, settings.LLM_MODEL_NAME)

    @field_validator("llm_base_url", "llm_api_key", "llm_provider", mode="before")
    @classmethod
    def _ensure_optional_defaults(cls, value: Optional[str], info: FieldValidationInfo) -> Optional[str]:
        defaults = {
            "llm_base_url": settings.LLM_BASE_URL,
            "llm_api_key": settings.LLM_API_KEY,
            "llm_provider": settings.LLM_PROVIDER,
        }
        return cls._fallback_to_default(value, defaults.get(info.field_name))

    @staticmethod
    def _fallback_to_default(value: Optional[str], default_value: Optional[str]) -> Optional[str]:
        if value is None:
            return default_value
        if isinstance(value, str) and not value.strip():
            return default_value
        return value


def resolve_config(project_snapshot: Optional[Dict[str, Any]]) -> ExecutionConfig:
    """
    Parse a project's configuration snapshot into a validated ExecutionConfig.

    Args:
        project_snapshot: The JSON blob stored on Project.configuration_snapshot.

    Returns:
        ExecutionConfig: ready-to-use configuration for node execution.
    """

    if not project_snapshot:
        return ExecutionConfig()

    return ExecutionConfig.model_validate(project_snapshot)

```

### services/execution_engine/executor.py Content:

```py
"""
Core Node Executor: Orchestrates LLM and Sandbox clients to run a node.

This contains the primary business logic for node execution, adapted from
the old `ExecutionSimulator`. It is initialized with clients (LLM, Sandbox)
that are pre-configured by the config resolver, ensuring that each execution
is isolated and uses the correct user resources.
"""

import asyncio
from typing import Any, Dict, List, Optional

from loguru import logger

from backend.models.user import ThinkingDepth
from backend.models.workflow import NodeInstance
from backend.services.execution_engine.config_resolver import ExecutionConfig
from backend.services.execution_engine.llm_client import LLMClient
from backend.services.execution_engine.sandbox_client import SandboxClient
from backend.workflow_definition import (
    HITLMode,
    KEY_ANALYSIS,
    KEY_CANDIDATES,
    KEY_CRITIQUES,
    KEY_ID,
    KEY_PRIMARY_ARTIFACT,
    KEY_SCA_OUTPUT,
    KEY_SELECTED_ITEM,
)


class NodeExecutor:
    """Simulates node execution flows using configured clients."""

    def __init__(self, config: ExecutionConfig):
        self.config = config
        self.llm_client = LLMClient(
            model_name=config.llm_model_name,
            api_key=config.llm_api_key,
            base_url=config.llm_base_url,
        )
        self.sandbox_client = SandboxClient(api_key=config.e2b_api_key)
        logger.info("NodeExecutor initialized", thinking_depth=self.config.thinking_depth.value)

    async def execute_node(
        self,
        node: NodeInstance,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> Dict[str, Any]:
        await asyncio.sleep(1.0)
        logger.info(
            "Executing node with NodeExecutor",
            definition_id=node.definition_id,
            hitl_mode=node.hitl_mode.value,
            has_feedback=feedback is not None,
            has_adjudication=adjudication_data is not None,
        )

        if node.hitl_mode == HITLMode.SCA:
            return await self._execute_sca(node, inputs, feedback)
        if node.hitl_mode == HITLMode.AVL:
            return await self._execute_avl(node, inputs, feedback, previous_output, adjudication_data)
        return await self._execute_varl(node, inputs, feedback)

    async def _execute_varl(self, node: NodeInstance, inputs: Dict[str, Any], feedback: Optional[str]) -> Dict[str, Any]:
        prompt = f"Generate a VARL artifact. Feedback: {feedback}"
        llm_response = await self.llm_client.generate_text(prompt)

        artifact = {
            "content": llm_response,
            "data": "Generic VARL data output",
        }
        if node.definition_id == "3.1.2":
            artifact["Submission-Ready Paper"] = llm_response
        elif node.definition_id.endswith(".2.2.1"):
            # This part would involve the sandbox client
            code_to_run = "print('Simulated execution')"  # Placeholder
            sandbox_result = await self.sandbox_client.execute_code(code_to_run)
            artifact["raw_results"] = sandbox_result.get("results", "Simulated Raw Data")
            artifact["vv_data"] = "Simulated V&V Data from sandbox"
            artifact["sensitivity_data"] = "Simulated Sensitivity Data from sandbox"

        return {KEY_PRIMARY_ARTIFACT: artifact}

    async def _execute_sca(self, node: NodeInstance, inputs: Dict[str, Any], feedback: Optional[str]) -> Dict[str, Any]:
        output: Dict[str, Any] = {}
        base_candidates: List[Dict[str, Any]] = []

        if node.definition_id == "1.1.2":
            base_candidates = self._generate_taskbook_candidates()
        elif node.definition_id == "3.1.1":
            base_candidates = self._generate_narrative_candidates()
        elif node.definition_id.endswith(".2.2.2"):
            output["vv_report"] = f"V&V Report for {node.definition_id}"
            output["key_output_doc"] = f"Key Outputs for {node.definition_id}"
            base_candidates = [
                {KEY_ID: "V1", "name": "Visualization Plot A", "type": "Plot"},
                {KEY_ID: "V2", "name": "Visualization Table B", "type": "Table"},
                {KEY_ID: "V3", "name": "Visualization Plot C (Extra)", "type": "Plot"},
            ]
        else:  # Default case
            base_candidates = [
                {KEY_ID: "C1", "name": "Model Option A", "description": "A_data"},
                {KEY_ID: "C2", "name": "Model Option B", "description": "B_data"},
                {KEY_ID: "C3", "name": "Model Option C", "description": "C_data"},
                {KEY_ID: "C4", "name": "Model Option D", "description": "D_data"},
            ]

        # Adjust candidate count based on thinking_depth, fulfilling R7.5.
        num_candidates_map = {
            ThinkingDepth.INSTANT: 2,
            ThinkingDepth.MEDIUM: 3,
            ThinkingDepth.HEAVY: 4,
        }
        num_to_generate = num_candidates_map.get(self.config.thinking_depth, 3)

        final_candidates = base_candidates[:num_to_generate]

        if feedback:
            final_candidates.append({KEY_ID: "F1", "name": "Option based on feedback", "description": "F_data"})

        analysis_prompt = f"Provide a comparative analysis of {len(final_candidates)} candidates."
        analysis = await self.llm_client.generate_text(analysis_prompt)

        output[KEY_CANDIDATES] = final_candidates
        output[KEY_ANALYSIS] = analysis
        return output

    def _generate_narrative_candidates(self) -> List[Dict[str, Any]]:
        # Static simulation, no LLM call needed to produce the options.
        return [
            {
                KEY_ID: "N1",
                "Thesis Statement": "Thesis A",
                "Narrative Outline": "Outline A",
                "Global Assessment": "Assessment A",
            },
            {
                KEY_ID: "N2",
                "Thesis Statement": "Thesis B",
                "Narrative Outline": "Outline B",
                "Global Assessment": "Assessment B",
            },
        ]

    def _generate_taskbook_candidates(self) -> List[Dict[str, Any]]:
        # This is also static simulation
        task_a1 = {
            "task_id": "Task_A1",
            "task_name": "Define Objective",
            "io_interfaces": {"inputs": {"1.1.1": ["Formal Problem Restatement"]}, "outputs": ["Objective Function"]},
            "external_inputs": ["Problem Statement"],
        }
        task_a2 = {
            "task_id": "Task_A2",
            "task_name": "Solve Optimization",
            "io_interfaces": {"inputs": {"Task_A1": ["Objective Function"]}, "outputs": ["Optimal Solution"]},
            "external_inputs": ["Datasets"],
        }
        return [
            {
                KEY_ID: "OptA",
                "name": "Optimization Approach",
                "Structured Modeling Taskbook": {"tasks": [task_a1, task_a2]},
            },
            {
                KEY_ID: "OptB",
                "name": "Simulation Approach",
                "Structured Modeling Taskbook": {
                    "tasks": [
                        {"task_id": "Task_B1", "task_name": "Build Sim", "io_interfaces": {}, "external_inputs": []}
                    ]
                },
            },
        ]

    async def _execute_avl(
        self,
        node: NodeInstance,
        inputs: Dict[str, Any],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> Dict[str, Any]:
        if adjudication_data or feedback:
            context = adjudication_data if adjudication_data else feedback
            previous_artifact_content = "N/A"
            if previous_output and KEY_PRIMARY_ARTIFACT in previous_output:
                previous_artifact_content = previous_output[KEY_PRIMARY_ARTIFACT].get("content", "N/A")
            prompt = f"Refine the AVL artifact with context: {context}. Previous content was: {previous_artifact_content}"
        else:
            prompt = "Generate an initial AVL Artifact."

        artifact_content = await self.llm_client.generate_text(prompt)

        artifact = {
            "content": artifact_content,
            "data": "Generic AVL data output",
        }
        if node.definition_id == "1.1.1":
            artifact["Formal Problem Restatement"] = f"Restatement: {artifact_content[:100]}..."
            artifact["Global Assumption Framework"] = "Assumptions derived from artifact..."
        elif node.definition_id.endswith(".2.1.2"):
            input_211 = None
            if node.task_group_id:
                upstream_211_id = f"{node.task_group_id}.2.1.1"
                input_211 = inputs.get(upstream_211_id)

            selected_model_name = "Unknown"
            if input_211 and KEY_SCA_OUTPUT in input_211:
                selected_item = input_211[KEY_SCA_OUTPUT].get(KEY_SELECTED_ITEM)
                if selected_item:
                    selected_model_name = selected_item.get("name", "Unknown Model")

            artifact["math_formulation"] = f"Math formulation for {selected_model_name}."
            artifact["execution_blueprint"] = f"Blueprint for {selected_model_name}."

        critiques = await self._critique(node, artifact, adjudication_data)
        return {
            KEY_PRIMARY_ARTIFACT: artifact,
            KEY_CRITIQUES: critiques,
        }

    async def _critique(
        self,
        node: NodeInstance,
        artifact: Dict[str, Any],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> List[Dict[str, Any]]:
        # This part simulates the critique, it can remain as is.
        if adjudication_data:
            return [
                {
                    KEY_ID: "c3",
                    "critique": "Refinement addressed major issues, but introduced a minor boundary condition error.",
                    "severity": "Low",
                }
            ]
        return [
            {KEY_ID: "c1", "critique": "The core assumption lacks justification.", "severity": "High"},
            {KEY_ID: "c2", "critique": "Terminology is ambiguous.", "severity": "Medium"},
        ]

```

### services/execution_engine/llm_client.py Content:

```py
"""
Client for interacting with Large Language Models (LLMs).

This client is a dedicated interface for making API calls to LLMs.
It is instantiated with user-specific credentials (model name, API key,
base URL) retrieved from the project's configuration snapshot, enabling the
BYOK (Bring-Your-Own-Key) feature.
"""

from typing import Any, Dict, Optional

from loguru import logger


class LLMClient:
    """
    A client for making simulated requests to an LLM provider.
    This is a stub for BYOK integration.
    """

    def __init__(
        self,
        model_name: str,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
    ):
        self.model_name = model_name
        self.has_api_key = bool(api_key)
        self.base_url = base_url
        logger.debug(
            "LLMClient initialized",
            model_name=self.model_name,
            has_api_key=self.has_api_key,
            base_url=self.base_url,
        )

    async def generate_text(self, prompt: str, **kwargs: Any) -> str:
        """Simulates generating text from a prompt."""
        logger.info(
            "Simulating LLM text generation",
            model=self.model_name,
            prompt_start=f"{prompt[:50]}...",
            kwargs=kwargs,
        )
        return f"Simulated LLM output using model '{self.model_name}' for prompt: '{prompt[:30]}...'"

    async def generate_structured_output(self, prompt: str, **kwargs: Any) -> Dict[str, Any]:
        """Simulates generating structured JSON output."""
        logger.info(
            "Simulating LLM structured output generation",
            model=self.model_name,
            prompt_start=f"{prompt[:50]}...",
            kwargs=kwargs,
        )
        return {
            "model": self.model_name,
            "simulated_output": "This is a structured response.",
            "prompt_received": prompt,
        }

```

### services/execution_engine/sandbox_client.py Content:

```py
"""
Client for securely executing code in a sandboxed environment (e.g., E2B).

This client manages interactions with a secure code execution service.
Like the LLM client, it is initialized with user-specific API keys from the
project's configuration snapshot, ensuring code runs in an isolated context
using the user's own sandbox resources.
"""

from typing import Dict, Optional

from loguru import logger


class SandboxClient:
    """
    A client for making simulated requests to a code execution sandbox.
    This is a stub for BYOK integration.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.has_api_key = bool(api_key)
        logger.debug("SandboxClient initialized", has_api_key=self.has_api_key)

    async def execute_code(self, code: str) -> Dict[str, str]:
        """Simulates executing a piece of code and returning the result."""
        logger.info("Simulating sandboxed code execution", code_snippet=f"{code[:100]}...")
        return {
            "stdout": "Simulated standard output from code execution.",
            "stderr": "",
            "results": "Simulated artifacts or results from execution.",
        }

```

    ## utils
     - __init__.py
     - event_utils.py

### utils/__init__.py Content:

```py
"""Utility helpers for the backend package."""

```

### utils/event_utils.py Content:

```py
from typing import Optional

from backend.config import settings
from backend.redis import get_redis_pool
from backend.schemas.events import EventPayload, EventType
from backend.ws_manager import manager


async def broadcast_event(workflow_id: int, event_type: EventType, data: dict, node_id: Optional[int] = None) -> None:
    """Publish standardized workflow events via Redis Pub/Sub."""

    payload = EventPayload(event_type=event_type, workflow_id=workflow_id, node_id=node_id, data=data)
    redis = await get_redis_pool()
    await redis.publish(settings.WEBSOCKET_BROADCAST_CHANNEL, payload.model_dump_json())


async def broadcast_from_server(workflow_id: int, message: dict) -> None:
    """Directly broadcast a message from this process to WebSocket clients."""

    await manager.broadcast(workflow_id, message)

```

</backend_code>

---

深入理解以上需求背景和后端代码，设计尽可能全面详尽的端到端测试方案，聚焦于**核心复杂的完整建模流程和细节微妙的前后端交互逻辑**，而非安全、性能等边缘问题，确保后端代码的正确性和健壮性。确保覆盖所有关键功能点，所有的逻辑链路，所有的业务流程。
设计**尽可能多**、**尽可能全面**的端到端测试用例，聚焦于测试代码框架的设计，不需要实现细节的测试代码。
使用真实的服务而非 mock对象、数据。
