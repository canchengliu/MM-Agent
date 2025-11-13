<design_doc>
--- (87-98 lines) ---
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



--- (251-262 lines) ---
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



--- (347-349 lines) ---
              * **/{project\_id}** (项目详情)
                  * /config (配置页面：上传文件、设置类型)
                  * **/workflow** (工作流执行界面 - 核心交互区)

</design_doc>

<api>
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

</api>

<front_stack>
--- (20-25 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |



--- (34-52 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Tailwind CSS** | 原子化的 CSS 框架，用于构建整个项目的用户界面样式。 |
| **`@tailwindcss/typography`** | Tailwind CSS 的官方插件 (`prose` 类)，用于美化由 Markdown 或富文本编辑器生成的文本块样式。 |
| **`tailwindcss-animate`** | 为 Tailwind CSS 提供了便捷的动画类库。 |
| **next-themes** | 用于实现浅色/深色模式的主题切换功能。 |
| **class-variance-authority (cva)** | 用于创建可组合的、带变体的 UI 组件样式，广泛应用于 `components/ui` 目录。 |
| **tailwind-merge** | 用于智能合并 Tailwind CSS 类名，优雅地解决样式冲突问题。 |
| **clsx** | 一个小巧的工具库，用于根据条件动态地组合 CSS 类名。 |
| **Next.js Font (`next/font`)** | 用于本地化和优化 Web 字体，项目中使用了 `Geist` 字体。 |

### 五、 UI 组件库与视觉效果

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |
| **Sonner** | 用于显示轻量级的 Toast 通知（消息提示）。 |


--- (65-72 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Novel** | 基于 Tiptap 构建的所见即所得（WYSIWYG）富文本编辑器，用于报告编辑功能。 |
| **Tiptap** | 作为 Novel 的核心，是一个无头（Headless）、可扩展的富文本编辑器框架。 |
| **ProseMirror** | Tiptap 底层的核心工具库，提供了编辑器状态管理、视图和事务模型。 |
| **tiptap-markdown** | Tiptap 的扩展，用于在 Markdown 和 Tiptap 的 JSON 格式之间进行双向转换。 |
| **Tiptap 扩展集** | 使用了一系列扩展来增强编辑器功能，包括 `StarterKit`, `Placeholder`, `Link`, `Image`, `TaskList`, `Table`, `CodeBlockLowlight`, `TextStyle`, `Color`, `Highlight`, `Mathematics` 等。 |
| **`MathematicsWithMarkdown`** | 在 `components/editor/math-serializer.ts` 中自定义的 Tiptap 扩展，增强了对 KaTeX 数学公式的 Markdown 序列化支持。 |


--- (85-90 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **React Hook Form** | 用于管理设置页面 (`settings`) 的表单状态、校验和提交。 |
| **Zod** | 一个 TypeScript-first 的 schema 声明和校验库，用于定义表单数据结构和验证规则。 |
| **`@hookform/resolvers`** | 用于将 Zod schema 与 React Hook Form 集成，实现无缝的表单验证。 |



--- (93-96 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **next-intl** | 为 Next.js 应用提供完整的国际化解决方案，包括翻译文本管理、语言环境路由和服务器端集成。 |



--- (105-110 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Lucide React** | 一套简洁、一致的开源图标库，是项目图标的主要来源。 |
| **Ant Design Icons** | 来自 Ant Design 的图标库，补充了部分特定图标。 |
| **Radix UI Icons** | 来自 Radix UI 的图标库，补充了部分特定图标。 |



--- (151-162 lines) ---
#### 2. 核心业务逻辑与状态管理模式

项目基于 Zustand 构建了清晰、高效的状态管理架构，核心代码位于 `core/store/`。

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **状态与设置分离** | `store.ts` 负责管理**会话相关的动态状态**（如消息、响应状态），而 `settings-store.ts` 负责管理**用户配置**。这种分离使得状态管理更加清晰，易于维护。 |
| **`sendMessage` 异步流程编排** | 这个核心函数是整个聊天功能的驱动器。它展示了：<br>1. **乐观更新**: 立即将用户消息追加到状态中。<br>2. **流式处理**: 调用 `chatStream` 并通过 `for await...of` 循环处理 SSE 事件。<br>3. **批量更新**: 使用 `setTimeout` 和 `Map` 对来自流的多个消息更新事件进行批处理，减少 React 的重渲染次数，提升性能。<br>4. **错误处理**: 使用 `try...finally` 确保无论成功与否，`responding` 状态都能被正确重置。 |
| **`mergeMessage` 纯函数** | 位于 `core/messages/merge-message.ts`，这是一个独立的、无副作用的函数，负责根据收到的 SSE 事件更新单个消息对象的状态。这种模式将状态变更的复杂逻辑从主流程中剥离，使其易于测试和维护，是 Reducer 模式的体现。 |
| **派生状态选择器 (Selectors)** | 项目定义了多个自定义 Hook (`useMessage`, `useRenderableMessageIds`, `useLastInterruptMessage`) 来从 store 中派生和选择数据。它们结合 `useShallow` 进行性能优化，封装了获取特定状态的逻辑，避免了组件内的重复计算。`useRenderableMessageIds` 尤其巧妙，它预先过滤出需要在 UI 中渲染的消息，从根源上解决了 React 列表渲染时的 `key` 值警告问题。 |
| **LocalStorage 持久化** | `settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数提供了一个简洁明了的模式，用于将 Zustand store 的状态与 `localStorage` 同步，实现了用户设置的持久化。 |



--- (167-171 lines) ---
| **模拟流式响应 (`chatReplayStream`)** | `core/api/chat.ts` 中的 `chatReplayStream` 函数是一个极具价值的工具。它能够读取静态文本文件，并**模拟**一个实时的 SSE 流，甚至可以控制快进。这对于开发、调试、演示和编写测试用例都非常有用。 |
| **健壮的 JSON 解析 (`parseJSON`)** | 位于 `core/utils/json.ts`，这个工具函数使用 `best-effort-json-parser` 并结合自定义逻辑来处理来自 LLM 的、可能不完全合规的 JSON 字符串（例如，后面跟着多余的文本）。这对于与大语言模型交互的应用来说至关重要。 |
| **Markdown 预处理** | `core/utils/markdown.ts` 提供了一系列用于清理和规范化 Markdown 文本的函数，特别是 `normalizeMathForEditor` 和 `unescapeLatexInMath`，它们解决了在富文本编辑器中正确处理 LaTeX 数学公式的痛点。 |
| **统一的 API URL 解析** | `core/api/resolve-service-url.ts` 中的 `resolveServiceURL` 函数确保了所有对后端服务的请求都通过一个统一的函数来构建 URL，便于管理和切换 API 基地址。 |



--- (198-208 lines) ---
### 十五、 架构模式与项目组织

项目的目录结构和代码组织方式遵循了现代大型前端应用的**最佳实践**，非常值得借鉴。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **功能切片 (Feature-Sliced) 路由** | `app/` 目录下的结构（如 `app/chat/`, `app/landing/`, `app/settings/`）体现了按功能组织代码的原则。每个功能模块都是一个独立的单元，包含了自身的页面、组件和逻辑，使得项目结构清晰，易于扩展和维护。 |
| **组件分层** | 项目中的 `components/` 目录被清晰地划分为三层：<br>1. **`ui/`**: 基础 UI 组件，源自 Shadcn/ui，是应用的视觉基石。<br>2. **`deer-flow/`**: 应用级的共享组件，如 `Logo`, `Markdown`, `Tooltip` 等。它们封装了通用逻辑，在多个功能模块中复用。<br>3. **`magicui/`**: 高度定制化的视觉特效组件，与业务逻辑解耦，可轻松移植到任何项目中。 |
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |
| **自定义 Hooks 封装** | `hooks/` 目录提供了可复用的 React Hooks，如 `useIntersectionObserver` 和 `useIsMobile`。它们将复杂的浏览器 API 或重复的逻辑封装成简单易用的钩子，简化了组件代码。 |



--- (209-218 lines) ---
### 十六、 样式与主题架构

项目建立了一套强大且灵活的样式与主题系统。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **基于 CSS 变量的主题系统** | `styles/globals.css` 中，通过在 `:root` 和 `.dark` 选择器下定义大量的 CSS 自定义属性 (custom properties)，构建了整个应用的主题系统。所有颜色、半径等设计令牌 (design tokens) 都被变量化，使得主题切换（通过 `next-themes`）仅需切换一个顶层 class，浏览器即可高效地重绘。 |
| **Tailwind `@theme` 指令** | 通过 `@theme` 指令，项目将 CSS 变量（如 `--app-background`）与 Tailwind 的配置相结合，创建了语义化的工具类（如 `bg-app`）。这使得在组件中可以直观地使用主题颜色，而无需关心具体的色值。 |
| **`cn` 工具函数** | `lib/utils.ts` 中的 `cn` 函数是整个项目的标准实践。它结合了 `clsx` 和 `tailwind-merge`，解决了在 React 组件中动态、条件性地组合 Tailwind 类名时的所有痛点（如条件判断、样式覆盖冲突），是现代 Tailwind 项目的必备工具。 |



--- (257-262 lines) ---
| :--- | :--- |
| **配置驱动的 UI** | `app/settings/tabs/index.tsx` 中的 `SETTINGS_TABS` 数组是一个典型的配置驱动 UI 模式。开发者只需向这个数组中添加一个新的对象（包含组件、图标、标签等元数据），就能动态生成一个新的设置标签页，无需修改任何 JSX 结构。这种模式极大地简化了扩展，并降低了出错的可能性。 |
| **强大的调试与演示工具** | `core/api/chat.ts` 中的 `chatReplayStream` 是一个强大的开发和演示工具。它允许开发者将一次真实的 API 交互录制为文本文件，然后在本地通过 URL 参数（`?replay=...`）完美复现整个流式交互过程。这对于调试复杂的后端逻辑、制作产品演示以及编写端到端测试都非常有价值。 |
| **直接导入 Markdown 内容** | 项目配置了 Webpack (或 Turbopack) 加载器，允许直接 `import` `.md` 文件作为字符串。如 `app/settings/tabs/about-tab.tsx` 中 `import aboutEn from "./about-en.md";`。配合 `typings/md.d.ts` 中的类型声明，这为处理静态文本内容（如“关于”页面、文档）提供了极为便捷和类型安全的方式。 |
| **原子化且可组合的 Store Action** | `core/store/settings-store.ts` 中提供了一系列小巧、独立的 action 函数，如 `setReportStyle`, `setEnableDeepThinking`。它们封装了对 Zustand store 的特定修改，并自动调用 `saveSettings` 进行持久化。这使得在应用的任何地方修改设置都变得简单且一致。 |



--- (265-271 lines) ---
项目遵循了前端安全和可访问性的基本原则。

| 领域 | 实践与价值 |
| :--- | :--- |
| **安全性** | **防范 XSS 攻击**: 渲染用户生成或来自 API 的内容时，项目始终使用 `react-markdown` (`Markdown` 组件) 或通过 Tiptap 的安全机制进行渲染，而不是直接使用 `dangerouslySetInnerHTML`。<br>**安全处理用户输入**: `components/editor/index.tsx` 中的富文本编辑器在处理粘贴内容时，通过 `handleImagePaste` 和 `transformPastedHTML` 等逻辑对输入进行过滤和转换，防止粘贴恶意的 HTML 代码。<br>**安全的外部链接**: 在所有 `target="_blank"` 的链接中，都添加了 `rel="noopener noreferrer"`，防止了潜在的 "tabnabbing" 漏洞。 |
| **可访问性 (a11y)** | **语义化 HTML**: 项目结构良好，使用了恰当的 HTML5 标签（`header`, `main`, `footer`, `section` 等）。<br>**Radix UI 基础**: 由于 UI 组件库基于 Radix UI，所有组件（如 `Dialog`, `DropdownMenu`, `Tooltip`）都内置了完善的键盘导航支持、焦点管理和 ARIA 属性，提供了坚实的可访问性基础。例如，弹窗打开时焦点会自动移入，关闭后会返回原处。 |



--- (277-281 lines) ---
| :--- | :--- |
| **Pragmatic Bug Fix** | `app/layout.tsx` 中注入的全局 `window.isSpace` 函数是一个非常务实的解决方案。注释明确指出这是为了修复 `markdown-it` 在 Next.js + Turbopack 环境下的一个特定 bug。这展示了在面对第三方库兼容性问题时，如何通过最小的侵入性“打补丁”来解决问题，而不是等待上游修复。 |
| **Zod 作为多场景验证器** | Zod schema 不仅用于 React Hook Form 的表单验证 (`app/settings/tabs/general-tab.tsx`)，还在 `app/settings/dialogs/add-mcp-server-dialog.tsx` 中用于**实时验证用户输入的 JSON 配置**，为用户提供即时的、具体的错误反馈。这展示了 Zod 作为“单一事实来源”在多种场景下统一数据校验逻辑的强大能力。 |
| **可扩展的数据-视图映射** | 在落地页的多个部分（如 `CaseStudySection` 和 `CoreFeatureSection`），UI 的生成是通过**将数据数组映射到 UI 组件**来完成的。例如，`caseStudyIcons` 数组将案例的 ID 与其对应的 Lucide 图标关联起来。这种模式使得添加、删除或修改一个案例或功能特性，只需修改数据数组，而无需触碰渲染逻辑，符合“开放-封闭原则”。 |
| **类型定义文件** | `typings/md.d.ts` 的存在，虽然简单，但它代表了一个良好的工程实践：为项目中非标准的导入（如 `.md` 文件）提供明确的 TypeScript 类型定义，从而在整个项目中享受类型检查带来的好处。 |

</front_stack>

<deer_flow_frontend_code>
--- (772-858 lines) ---
### core/models/project.model.ts Content:

```ts
import { z } from "zod";

import {
  FileRoleEnum,
  ProblemTypeEnum,
  ProjectStatusEnum,
} from "~/constants/enums";

import { NodeInstanceReadSchema } from "./workflow.model";

// --- Read Models (Responses) ---

// API 3.5.3: ProjectFileRead
export const ProjectFileReadSchema = z.object({
  id: z.number().int(),
  filename: z.string(),
  role: FileRoleEnum,
  created_at: z.string().datetime(), // ISO 8601 format
});
export type ProjectFileRead = z.infer<typeof ProjectFileReadSchema>;

// API 3.5.1: ProjectSummaryRead (Used in project lists - FRS 2.3)
export const ProjectSummaryReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: ProjectStatusEnum,
  problem_type: ProblemTypeEnum,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // Indicates if the workflow has been started (Design Doc 2.1.1.B)
  workflow_instance_id: z.number().int().nullable(),
});
export type ProjectSummaryRead = z.infer<typeof ProjectSummaryReadSchema>;

// API 3.5.2: ProjectDetailRead (Extends Summary with details)
export const ProjectDetailReadSchema = ProjectSummaryReadSchema.extend({
  description: z.string().nullable(),
  files: z.array(ProjectFileReadSchema),
  historical_problem_id: z.number().int().nullable(),
});
export type ProjectDetailRead = z.infer<typeof ProjectDetailReadSchema>;

// API 3.4.1: HistoricalProblemRead (For the historical case library - FRS 3.3)
export const HistoricalProblemReadSchema = z.object({
  id: z.number().int(),
  year: z.number().int(),
  type: ProblemTypeEnum,
  name: z.string(),
  has_dataset: z.boolean(),
});
export type HistoricalProblemRead = z.infer<typeof HistoricalProblemReadSchema>;

// API 3.3.1 Response: Start Workflow (Returns the first NodeInstanceRead)
export const StartWorkflowResponseSchema = NodeInstanceReadSchema;
export type StartWorkflowResponse = z.infer<typeof StartWorkflowResponseSchema>;

// --- Create/Update Models (Requests) ---

// API 3.1.1: ProjectCreate (FRS 2.2)
export const ProjectCreateSchema = z.object({
  name: z.string().trim().min(1, "Project name cannot be empty."),
  description: z.string().optional(),
});
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;

// API 3.1.4: ProjectUpdate (PATCH request)
export const ProjectUpdateSchema = z.object({
  name: z.string().trim().min(1, "Project name cannot be empty.").optional(),
  description: z.string().optional(),
  // Can only be updated in 'Configuring' state (enforced by backend)
  problem_type: ProblemTypeEnum.optional(),
});
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

// API 3.2.2: HistoricalInitializationRequest
export const HistoricalInitializationRequestSchema = z.object({
  historical_problem_id: z.number().int(),
});
export type HistoricalInitializationRequest = z.infer<
  typeof HistoricalInitializationRequestSchema
>;

```



--- (1490-1703 lines) ---
### core/api/project.service.ts Content:

```ts
import { AxiosError } from "axios";

import type { FileRole } from "~/constants/enums";
import type { PaginatedResponse } from "~/core/models/common.model";
import type {
  HistoricalInitializationRequest,
  HistoricalProblemRead,
  ProjectCreate,
  ProjectDetailRead,
  ProjectFileRead,
  ProjectSummaryRead,
  ProjectUpdate,
  StartWorkflowResponse,
} from "~/core/models/project.model";

import apiClient from "./client";

/**
 * API Service for Project Management (API 3).
 */
export const ProjectService = {
  // --- 1. Project Lifecycle Management (CRUD) (API 3.1) ---

  /**
   * Creates a new project (API 3.1.1).
   */
  createProject: async (data: ProjectCreate): Promise<ProjectDetailRead> => {
    try {
      // Expect 201 Created
      const response = await apiClient.post<ProjectDetailRead>("/projects/", data, {
        validateStatus: (status) => status === 201,
      });
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (PROJECT_NAME_EXISTS)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("PROJECT_NAME_EXISTS");
      }
      throw error;
    }
  },

  /**
   * Gets the list of projects for the current user (API 3.1.2).
   */
  getProjects: async (
    skip = 0,
    limit = 20,
  ): Promise<PaginatedResponse<ProjectSummaryRead>> => {
    const response = await apiClient.get<PaginatedResponse<ProjectSummaryRead>>(
      "/projects/",
      {
        params: { skip, limit },
      },
    );
    return response.data;
  },

  /**
   * Gets the detailed information of a specific project (API 3.1.3).
   */
  getProjectById: async (projectId: number): Promise<ProjectDetailRead> => {
    const response = await apiClient.get<ProjectDetailRead>(
      `/projects/${projectId}`,
    );
    return response.data;
  },

  /**
   * Updates a project's basic information (API 3.1.4).
   */
  updateProject: async (
    projectId: number,
    data: ProjectUpdate,
  ): Promise<ProjectDetailRead> => {
    try {
      const response = await apiClient.patch<ProjectDetailRead>(
        `/projects/${projectId}`,
        data,
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (e.g., modifying problem_type when not Configuring)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("INVALID_STATE_FOR_UPDATE");
      }
      throw error;
    }
  },

  /**
   * Deletes a project and all associated data (API 3.1.5).
   */
  deleteProject: async (projectId: number): Promise<void> => {
    // Expect 204 No Content
    await apiClient.delete(`/projects/${projectId}`, {
      validateStatus: (status) => status === 204,
    });
  },

  // --- 2. Project Configuration & Data Management (API 3.2) ---

  /**
   * Uploads a file to a project (API 3.2.1). Handles multipart/form-data.
   */
  uploadFile: async (
    projectId: number,
    file: File,
    role: FileRole,
  ): Promise<ProjectFileRead> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    // Expect 201 Created
    const response = await apiClient.post<ProjectFileRead>(
      `/projects/${projectId}/files`,
      formData,
      {
        headers: {
          // Axios automatically sets the correct Content-Type with boundary
          "Content-Type": "multipart/form-data",
        },
        validateStatus: (status) => status === 201,
        // Increase timeout for potentially large file uploads
        timeout: 120000, // 2 minutes
      },
    );
    return response.data;
  },

  /**
   * Initializes a project from a historical problem (API 3.2.2).
   */
  initializeFromHistorical: async (
    projectId: number,
    data: HistoricalInitializationRequest,
  ): Promise<ProjectDetailRead> => {
    try {
      const response = await apiClient.post<ProjectDetailRead>(
        `/projects/${projectId}/initialize-from-historical`,
        data,
      );
      return response.data;
    } catch (error) {
      // Handle 424 Dependency Failed (Historical files missing on server)
      if (error instanceof AxiosError && error.response?.status === 424) {
        throw new Error("DEPENDENCY_FAILED");
      }
      throw error;
    }
  },

  // --- 3. Workflow Orchestration & Export (API 3.3) ---

  /**
   * Starts the workflow for a project (API 3.3.1).
   */
  startWorkflow: async (projectId: number): Promise<StartWorkflowResponse> => {
    try {
      // Expect 202 Accepted. Returns the first node instance information.
      const response = await apiClient.post<StartWorkflowResponse>(
        `/projects/${projectId}/start`,
        null, // No body required
        {
          validateStatus: (status) => status === 202,
        },
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (Preconditions not met or invalid state)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("PRECONDITIONS_NOT_MET");
      }
      throw error;
    }
  },

  /**
   * Exports the project results as a ZIP file (API 3.3.2).
   */
  exportProject: async (projectId: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/export`, {
        responseType: "blob", // Important for handling binary file downloads
        timeout: 300000, // 5 minutes timeout for export generation
      });
      return response.data;
    } catch (error) {
      // Handle 404 Not Found (Workflow not started)
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new Error("WORKFLOW_NOT_STARTED");
      }
      throw error;
    }
  },

  // --- 4. Auxiliary Data Query (API 3.4) ---

  /**
   * Gets the list of historical problems (API 3.4.1).
   */
  getHistoricalProblems: async (): Promise<HistoricalProblemRead[]> => {
    const response = await apiClient.get<HistoricalProblemRead[]>(
      "/historical-problems",
    );
    return response.data;
  },
};

```


--- (2010-2107 lines) ---
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


--- (2252-2306 lines) ---
        ## store
         - index.ts

### core/store/index.ts Content:

```ts
import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

import { createAuthSlice, type AuthSlice } from "./slices/auth.slice";
import {
  createProjectSlice,
  type ProjectSlice,
} from "./slices/project.slice";
import { createSettingsSlice, type SettingsSlice } from "./slices/settings.slice";
import {
  createUIInteractionSlice,
  type UIInteractionSlice,
} from "./slices/ui-interaction.slice";
import {
  createWorkflowSlice,
  type WorkflowSlice,
} from "./slices/workflow.slice";

// Define the combined state interface (Architecture 4.1)
export type GlobalState = AuthSlice &
  SettingsSlice &
  ProjectSlice &
  WorkflowSlice &
  UIInteractionSlice;

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
      ...createProjectSlice(set, get, api),
      ...createWorkflowSlice(set, get, api),
      ...createUIInteractionSlice(set, get, api),
    }),
    { name: "O-Award-Store" }, // Name for Redux DevTools
  ),
);

```


--- (2966-3249 lines) ---
### core/store/slices/project.slice.ts Content:

```ts
import { toast } from "sonner";

import { ProjectService } from "~/core/api/project.service";
import type { FileRole } from "~/constants/enums";
import type {
  ProjectCreate,
  ProjectDetailRead,
  ProjectSummaryRead,
  ProjectUpdate,
} from "~/core/models/project.model";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { type SliceCreator } from "~/core/store";

export interface ProjectSlice {
  // State
  projects: ProjectSummaryRead[];
  currentProject: ProjectDetailRead | null;
  isLoadingProjects: boolean;
  isLoadingProjectDetail: boolean;
  isMutatingProject: boolean; // Covers create, update, delete
  isStartingWorkflow: boolean;

  // Actions
  fetchProjects: (force?: boolean) => Promise<void>;
  loadProjectDetail: (projectId: number) => Promise<ProjectDetailRead | null>;
  createProject: (
    data: ProjectCreate,
  ) => Promise<{
    success: boolean;
    project: ProjectDetailRead | null;
    error?: string;
  }>;
  updateProject: (projectId: number, data: ProjectUpdate) => Promise<boolean>;
  deleteProject: (projectId: number) => Promise<boolean>;
  uploadFile: (
    projectId: number,
    file: File,
    role: FileRole,
  ) => Promise<boolean>;
  startWorkflow: (projectId: number) => Promise<NodeInstanceRead | null>;
  clearCurrentProject: () => void;
}

export const createProjectSlice: SliceCreator<ProjectSlice> = (set, get) => ({
  projects: [],
  currentProject: null,
  isLoadingProjects: false,
  isLoadingProjectDetail: false,
  isMutatingProject: false,
  isStartingWorkflow: false,

  fetchProjects: async (force = false) => {
    if (get().isLoadingProjects || (!force && get().projects.length > 0)) return;

    set({ isLoadingProjects: true });
    try {
      // Fetching the first 100 projects (API 3.1.2).
      const response = await ProjectService.getProjects(0, 100);
      set({ projects: response.items });
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects.");
    } finally {
      set({ isLoadingProjects: false });
    }
  },

  loadProjectDetail: async (projectId) => {
    // Clear previous project details and set loading state
    set({ isLoadingProjectDetail: true, currentProject: null });
    try {
      const project = await ProjectService.getProjectById(projectId);
      set({ currentProject: project });
      return project;
    } catch (error) {
      console.error("Failed to load project detail:", error);
      toast.error(
        "Failed to load project details. It might not exist or you lack permissions.",
      );
      return null;
    } finally {
      set({ isLoadingProjectDetail: false });
    }
  },

  createProject: async (data) => {
    set({ isMutatingProject: true });
    try {
      const newProject = await ProjectService.createProject(data);
      set((state) => ({
        // Prepend the new project to the list (assuming list is sorted by creation/update time desc)
        // Cast required as ProjectDetailRead extends ProjectSummaryRead
        projects: [newProject as ProjectSummaryRead, ...state.projects],
      }));
      toast.success("Project created successfully.");
      return { success: true, project: newProject };
    } catch (error) {
      console.error("Failed to create project:", error);
      let errorType: string | undefined = "UNKNOWN";
      if (error instanceof Error && error.message === "PROJECT_NAME_EXISTS") {
        errorType = "PROJECT_NAME_EXISTS";
        toast.error("Project creation failed", {
          description: "A project with this name already exists.",
        });
      } else {
        toast.error("Failed to create project.");
      }
      return { success: false, project: null, error: errorType };
    } finally {
      set({ isMutatingProject: false });
    }
  },

  updateProject: async (projectId, data) => {
    if (Object.keys(data).length === 0) return true;

    set({ isMutatingProject: true });
    try {
      const updatedProject = await ProjectService.updateProject(projectId, data);

      set((state) => ({
        // Update the project in the summary list
        projects: state.projects.map((p) =>
          p.id === projectId ? (updatedProject as ProjectSummaryRead) : p,
        ),
        // Update the current project detail if it's the one being updated
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
      }));
      toast.success("Project updated successfully.");
      return true;
    } catch (error) {
      console.error("Failed to update project:", error);
      if (
        error instanceof Error &&
        error.message === "INVALID_STATE_FOR_UPDATE"
      ) {
        // API 3.1.4 State-related mutability constraint
        toast.error("Update failed", {
          description:
            "Cannot modify certain fields (like Problem Type) after the workflow has started.",
        });
      } else {
        toast.error("Failed to update project.");
      }
      return false;
    } finally {
      set({ isMutatingProject: false });
    }
  },

  deleteProject: async (projectId) => {
    set({ isMutatingProject: true });
    try {
      await ProjectService.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId
            ? null
            : state.currentProject,
      }));
      toast.success("Project deleted successfully.");
      return true;
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project.");
      return false;
    } finally {
      set({ isMutatingProject: false });
    }
  },

  uploadFile: async (projectId, file, role) => {
    // File upload state handling (not blocking main mutation state)
    try {
      const newFile = await ProjectService.uploadFile(projectId, file, role);

      // Update the currentProject details in the store to reflect the new file
      set((state) => {
        if (state.currentProject && state.currentProject.id === projectId) {
          let updatedFiles = [...state.currentProject.files];

          // API 3.2.1 Note: Handle unique roles (like Problem Description) as replacements in the UI.
          if (role === "Problem Description") {
            updatedFiles = updatedFiles.filter(
              (f) => f.role !== "Problem Description",
            );
          }
          updatedFiles.push(newFile);

          const updatedProject = {
            ...state.currentProject,
            files: updatedFiles,
          };
          return { currentProject: updatedProject };
        }
        return {};
      });

      toast.success(`File "${file.name}" uploaded successfully.`);
      return true;
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error(`Failed to upload file "${file.name}".`);
      return false;
    }
  },

  startWorkflow: async (projectId) => {
    set({ isStartingWorkflow: true });
    try {
      // API 3.3.1 returns the first node instance.
      const firstNode = await ProjectService.startWorkflow(projectId);

      // Optimistically update the project status locally before the confirmation fetch.
      const optimisticUpdate = (state: ProjectSlice) => {
        const updateFn = <T extends ProjectSummaryRead | ProjectDetailRead>(
          p: T,
        ): T => ({
          ...p,
          status: "Running" as const,
          // We don't have the workflow_instance_id yet, but we know it's active.
        });

        const updatedProjects = state.projects.map((p) =>
          p.id === projectId ? updateFn(p) : p,
        );
        const updatedCurrentProject =
          state.currentProject && state.currentProject.id === projectId
            ? updateFn(state.currentProject)
            : state.currentProject;

        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
        };
      };

      set(optimisticUpdate);

      // We must refresh the project detail to get the actual workflow_instance_id (API 3.1.3).
      // This ensures the UI correctly navigates to the workflow view.
      try {
        await get().loadProjectDetail(projectId);
      } catch (refreshError) {
        console.warn(
          "Workflow started, but failed to refresh project details immediately.",
          refreshError,
        );
      }

      toast.success(
        "Workflow started successfully. Navigating to the first task.",
      );
      return firstNode;
    } catch (error) {
      console.error("Failed to start workflow:", error);
      if (error instanceof Error && error.message === "PRECONDITIONS_NOT_MET") {
        // API 3.3.1 Error handling
        toast.error("Cannot start workflow", {
          description:
            "Please ensure the Problem Type is set and a Problem Description file is uploaded.",
        });
      } else {
        toast.error("Failed to start workflow.");
      }
      return null;
    } finally {
      set({ isStartingWorkflow: false });
    }
  },

  clearCurrentProject: () => {
    set({ currentProject: null });
  },
});

```


--- (4630-4664 lines) ---
                    ## config
                     - page.tsx

### app/(platform)/projects/[projectId]/config/page.tsx Content:

```tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "~/components/ui/button";

export default function ProjectConfigPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <div className="h-full bg-background p-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/projects">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">
        Project Configuration (ID: {params.projectId})
      </h1>
      <p className="mt-4 text-muted-foreground">
        Configuration interface implementation coming soon.
      </p>
    </div>
  );
}

```


--- (4766-4903 lines) ---
### app/(platform)/projects/components/project-card.tsx Content:

```tsx
"use client";

import Link from "next/link";
import {
  MoreVertical,
  Settings,
  Trash2,
  Workflow,
} from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ProjectStatusBadge } from "~/components/platform/data-display/project-status-badge";
import { Timestamp } from "~/components/platform/data-display/timestamp";
import type { ProjectSummaryRead } from "~/core/models/project.model";

import { DeleteProjectDialog } from "./delete-project-dialog";

interface ProjectCardProps {
  project: ProjectSummaryRead;
}

/**
 * Compact summary card for a project with quick actions.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const primaryHref = project.workflow_instance_id
    ? `/projects/${project.id}/workflow`
    : `/projects/${project.id}/config`;

  const workflowSummary = project.workflow_instance_id
    ? "Workflow in progress. Continue where you left off."
    : "Workflow not started. Configure the project to begin execution.";

  return (
    <>
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <Link href={primaryHref} className="flex-1 hover:underline">
              <CardTitle className="line-clamp-2 text-lg">
                {project.name}
              </CardTitle>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  aria-label={`Project actions for ${project.name}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <ProjectStatusBadge status={project.status} />
            {project.problem_type !== "-" ? (
              <span className="text-xs font-medium text-muted-foreground">
                Problem {project.problem_type}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex-1 text-sm text-muted-foreground">
          <p className="line-clamp-3">{workflowSummary}</p>
          <dl className="mt-4 space-y-2 text-xs uppercase tracking-wide text-muted-foreground">
            <div className="flex items-center justify-between">
              <dt>Workflow</dt>
              <dd className="font-medium normal-case text-foreground">
                {project.workflow_instance_id ? "Active" : "Not started"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Project ID</dt>
              <dd className="font-mono text-foreground">#{project.id}</dd>
            </div>
          </dl>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <span className="text-xs text-muted-foreground">
            Updated <Timestamp time={project.updated_at} />
          </span>
          <Button size="sm" variant="outline" asChild>
            <Link href={primaryHref}>
              {project.workflow_instance_id ? (
                <>
                  <Workflow className="mr-2 h-4 w-4" />
                  Workflow
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </>
              )}
            </Link>
          </Button>
        </CardFooter>
      </Card>
      <DeleteProjectDialog
        project={project}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}

```


--- (5684-5772 lines) ---
### constants/enums.ts Content:

```ts
import { z } from "zod";

// --- Project Management (API 3) ---

// API 3.5.1: Project Status (Design Doc 2.1.1.B)
export const ProjectStatusEnum = z.enum(["Configuring", "Running", "Completed"]);
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

// API 3.5.1: Problem Type (FRS 3.4)
// Note: "-" represents an unset or custom type.
export const ProblemTypeEnum = z.enum(["A", "B", "C", "D", "E", "F", "-"]);
export type ProblemType = z.infer<typeof ProblemTypeEnum>;

// API 3.5.3: File Role (FRS 3.2.2)
export const FileRoleEnum = z.enum([
  "Problem Description",
  "Dataset",
  "Reference Material",
]);
export type FileRole = z.infer<typeof FileRoleEnum>;

// --- Workflow Management (API 4) ---

// API 4.4.1: Workflow Status (Design Doc 2.1.1.C)
export const WorkflowStatusEnum = z.enum(["Running", "Completed"]);
export type WorkflowStatus = z.infer<typeof WorkflowStatusEnum>;

// --- Node & Execution (API 5, Design Doc 2.1.2.A) ---

// API 3.5.4, SRS 4.1: Node Lifecycle Main Status
export const NodeStatusEnum = z.enum([
  "Not Started",
  "Executing",
  "Awaiting HITL Approval",
  "Completed",
  "Failed",
  "Canceled",
]);
export type NodeStatus = z.infer<typeof NodeStatusEnum>;

// API 3.5.4: Detailed Execution Stage (for progress indication)
export const ExecutionStageEnum = z.enum([
  "Not Started",
  "Initializing",
  "Processing",
  "Generating Outputs",
  "Awaiting Review",
  "Completed",
  "Failed",
]);
export type ExecutionStage = z.infer<typeof ExecutionStageEnum>;

// API 3.5.4: Node Type (SRS 2.2)
export const NodeTypeEnum = z.enum(["Standard", "Generator"]);
export type NodeType = z.infer<typeof NodeTypeEnum>;

// API 3.5.4: HITL Mode
export const HITLModeEnum = z.enum(["VARL", "SCA", "AVL"]);
export type HITLMode = z.infer<typeof HITLModeEnum>;

// API 5.5.2: Version Source (FRS 4.3)
export const VersionSourceEnum = z.enum(["AI_GENERATED", "MANUALLY_EDITED"]);
export type VersionSource = z.infer<typeof VersionSourceEnum>;

// --- HITL Interaction (API 5.3) ---

// API 5.3: HITL Submission Action (User intent)
export const HITLActionEnum = z.enum([
  "Continue", // (H2.1)
  "RejectAndProvideModificationComments", // (H2.2)
  "Discard", // (H2.3)
]);
export type HITLAction = z.infer<typeof HITLActionEnum>;

// API 5.3: HITL Response Action (Frontend Navigation Guidance)
export const HITLResponseActionEnum = z.enum([
  "ExecuteNext",
  "NavigateNext",
  "Completed", // Workflow finished
  "AVLLoop", // Internal iteration (AVL mode)
  "ReExecute", // Node is re-executing
  "Discarded",
]);
export type HITLResponseAction = z.infer<typeof HITLResponseActionEnum>;

```


--- (6472-6571 lines) ---
### components/ui/card.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import * as React from "react"

import { cn } from "~/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

```


--- (7679-7745 lines) ---
### components/ui/button.tsx Content:

```tsx
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        "cursor-pointer active:scale-105",
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };

```


--- (8087-8276 lines) ---
### components/ui/select.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

```


--- (8278-8300 lines) ---
### components/ui/textarea.tsx Content:

```tsx
import * as React from "react"

import { cn } from "~/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

```


--- (8302-8327 lines) ---
### components/ui/input.tsx Content:

```tsx
import * as React from "react"

import { cn } from "~/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }

```


--- (8350-8521 lines) ---
### components/ui/form.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "~/lib/utils"
import { Label } from "~/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}

```

</deer_flow_frontend_code>

<architecture>
--- (65-66 lines) ---
  * **Zod**: 数据结构定义和校验。
  * **React Hook Form**: 表单管理。


--- (93-116 lines) ---
```
/src/app
├── layout.tsx
├── page.tsx (入口，重定向到 /projects)
│
├── (auth)/             # 认证模块 (Public)
│   ├── login/page.tsx
│   └── register/page.tsx
│
└── (platform)/         # 主应用模块 (Protected)
    ├── layout.tsx      # 平台布局 (Global Header, Auth Check)
    │
    ├── projects/
    │   ├── page.tsx    # 项目列表仪表板
    │   └── [projectId]/
    │       ├── layout.tsx
    │       ├── config/page.tsx      # 项目配置页面
    │       └── workflow/            # 工作流执行界面 (The Cockpit)
    │           ├── page.tsx
    │           └── components/      # Cockpit 核心组件 (详见 3.3.3)
    │
    └── settings/       # 用户设置中心
        └── ...
```


--- (170-181 lines) ---
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


--- (226-230 lines) ---
#### 4.3.3 ProjectSlice (`projectSlice.ts`)

  * **State**: `projects: ProjectSummaryRead[]`, `currentProject: ProjectDetailRead | null`, `isLoading`.
  * **Actions**: `fetchProjects`, `loadProjectDetail`, `createProject`, `updateProject`, `deleteProject`, `uploadFile`, `startWorkflow`.



--- (317-332 lines) ---
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


</architecture>



---

<task>


### 任务 6：项目配置 UI：文件管理与问题类型设置

**目标：** 实现项目配置页面，允许用户编辑详情、上传文件、分配角色和设置问题类型。

**核心关注点：** 文件上传（multipart/form-data）、文件角色管理、表单更新（PATCH）、状态依赖性。

**实现策略：**

1.  **项目配置页面（`src/app/(platform)/projects/[projectId]/config/page.tsx` 新建）：**
    *   实现页面布局。加载时调用 `ProjectSlice.loadProjectDetail`。
2.  **项目详情编辑：**
    *   实现项目名称、描述的编辑表单。调用 `ProjectSlice.updateProject`。
3.  **问题类型设置（`<api> 3.1.4`）：**
    *   实现 `problem_type` 选择器（`Select`）。选项包括 A-F 和 '-'。
    *   **关键实现：** 根据项目状态控制可用性。仅在 `Configuring` 状态下可编辑。如果在 `Running` 或 `Completed` 状态下，应禁用编辑。
4.  **文件上传与管理（`<api> 3.2.1`）：**
    *   实现文件上传组件。
    *   **关键实现：** 上传时必须强制用户选择文件角色（`Problem Description`, `Dataset`, `Reference Material`）。
    *   确保 `ProjectSlice.uploadFile` Action 正确构造 `multipart/form-data` 请求（任务 3 和 4 已实现服务和 Action）。
    *   实现文件列表展示（文件名、角色）。实现文件删除功能（如果 API 支持）。

**输入：** 任务 5 的输出, `<api> 3.1.3, 3.1.4, 3.2.1`。
**输出：** 功能完整的项目配置页面（不含工作流启动和历史案例初始化）。


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
