<design_doc>
--- (89-93 lines) ---
| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| P1.1 | 项目创建 | 创建新项目，提供名称和可选描述。 | FRS 2.2 | P0 |
| P1.2 | 项目仪表板 | 列出所有项目，显示关键元数据（名称、类型、日期、状态）。 | FRS 2.3 | P0 |
| P1.3 | 项目删除 | 删除项目及其所有关联数据（需二次确认）。 | FRS 2.4 | P1 |


--- (253-258 lines) ---
  * **Project (项目)**
      * *定义:* 封装一次建模任务的顶级容器。
      * `id`, `name`, `description`.
      * `status` (enum: Configuring, Running, Completed): 项目生命周期状态。**(前端关键：决定项目视图和可用操作)**。
      * `problem_type` (enum).
      * `workflow_instance_id` (integer | null): **(前端关键：判断工作流是否已启动)**。


--- (345-347 lines) ---
          * **/projects** (项目管理，应用主入口/仪表板)
              * / (项目列表仪表板)
              * **/{project\_id}** (项目详情)


--- (358-361 lines) ---
      * [Main Navigation Links]: (Projects, Settings)
      * 
      * [Global Actions]: (e.g., New Project)
      * [User Menu]: (Avatar, Settings, Logout)


--- (634-634 lines) ---
| **AlertDialog (警示对话框)** | 破坏性或不可逆操作的二次确认。阻塞流程。 | **AlertDialog** | 高 |


--- (697-701 lines) ---
#### B. 布局模板 1：通用仪表板/列表布局 (Template 1: Standard Layout)

  * **应用场景：** 项目列表 (`/projects`)，设置中心 (`/settings`)。
  * **结构：** 标准的侧边栏导航 + 主内容区布局。



--- (880-884 lines) ---
  * **版本切换确认:**
      * **Title:** Activate Version V1?
      * **Body:** "Activating this version will change the node's output. Downstream nodes will be marked as 'Stale' and will NOT be automatically updated. Do you wish to proceed?"
      * **Actions:** [Cancel], [Activate V1]



--- (991-1024 lines) ---
##### D. 语义化状态色彩规范 (Semantic Status Colors)

用于传达工作流状态。这些颜色扩展到 Tailwind 配置中，以提供专用的工具类（例如 `text-status-completed`）。

```javascript
// tailwind.config.js (theme.extend.colors)
status: {
  // Completed (Green/Emerald)
  completed: {
    DEFAULT: 'hsl(142.1 76.2% 36.3%)', // Emerald-600
    foreground: 'hsl(145.1 100% 98%)',
  },
  // Executing (Cyan) - 具有科技感和动感
  executing: {
    DEFAULT: 'hsl(186.2 95.2% 40.3%)', // Cyan-600
    foreground: 'hsl(186.2 100% 98%)',
  },
  // Awaiting HITL / Stale (Amber) - 需要注意和行动
  awaiting: {
    DEFAULT: 'hsl(45.9 95.2% 50.3%)', // Amber-500
    foreground: 'hsl(45.9 95.2% 10%)', // Dark foreground for contrast
  },
  // Failed (Red) - Uses --destructive by default, but can be referenced here if needed.
  failed: {
     DEFAULT: 'hsl(var(--destructive))',
     foreground: 'hsl(var(--destructive-foreground))',
  },
  // Canceled (Orange)
  canceled: {
    DEFAULT: 'hsl(24.6 95.2% 53.3%)', // Orange-500
    foreground: 'hsl(24.6 100% 98%)',
  },
},
```


--- (1243-1243 lines) ---
| L5 | 50 | 模态对话框 (Dialog) | `shadow-2xl` |


--- (1368-1370 lines) ---
  * **基础组件：** `Shadcn/ui Button`。
  * **视觉属性：** 字体 `text-sm` (14px)。圆角 `rounded-md` (6px)。默认高度 `h-9` (36px)。
  * **交互状态与动效：** Hover 状态快速过渡。Active 状态使用 Framer Motion `whileTap={{ scale: 0.98 }}`。


--- (1380-1382 lines) ---
  * **基础组件：** `Shadcn/ui Card`。
  * **视觉属性：** 背景 `bg-card`。圆角 `rounded-lg` (8px)。使用清晰的 `border` 分隔，特别是在 Dark Mode 下。


</design_doc>

<api>
--- (40-66 lines) ---

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


--- (504-537 lines) ---
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



--- (540-605 lines) ---
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


--- (607-622 lines) ---
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



--- (647-658 lines) ---
#### 1.5. 删除项目

*   **Endpoint**: `DELETE /projects/{project_id}`
*   **权限**: 项目所有者。
*   **描述**: **永久删除**一个项目及其所有关联数据，包括工作流实例、所有节点版本以及在服务器上存储的所有上传文件。

##### **警告**
此操作将**立即终止**与该项目关联的任何正在运行的后台工作流任务。这是一个破坏性且不可恢复的操作。前端应在执行此操作前，通过一个醒目的模态框向用户进行二次确认。

##### 成功响应 (`204 No Content`)
成功删除后，响应体为空。



--- (806-834 lines) ---
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


</api>

<front_stack>
--- (10-11 lines) ---
| **Next.js** | 应用框架，提供了服务器端渲染 (SSR)、静态站点生成 (SSG)、基于 `app` 目录的文件系统路由、API 路由以及其他现代化 Web 开发功能。 |
| | ↳ **App Router** | 项目采用最新的 App Router 架构，支持 React Server Components (RSC) 和客户端组件。 |


--- (20-25 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |



--- (34-44 lines) ---
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



--- (47-52 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |
| **Sonner** | 用于显示轻量级的 Toast 通知（消息提示）。 |


--- (85-90 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **React Hook Form** | 用于管理设置页面 (`settings`) 的表单状态、校验和提交。 |
| **Zod** | 一个 TypeScript-first 的 schema 声明和校验库，用于定义表单数据结构和验证规则。 |
| **`@hookform/resolvers`** | 用于将 Zod schema 与 React Hook Form 集成，实现无缝的表单验证。 |



--- (153-161 lines) ---
项目基于 Zustand 构建了清晰、高效的状态管理架构，核心代码位于 `core/store/`。

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **状态与设置分离** | `store.ts` 负责管理**会话相关的动态状态**（如消息、响应状态），而 `settings-store.ts` 负责管理**用户配置**。这种分离使得状态管理更加清晰，易于维护。 |
| **`sendMessage` 异步流程编排** | 这个核心函数是整个聊天功能的驱动器。它展示了：<br>1. **乐观更新**: 立即将用户消息追加到状态中。<br>2. **流式处理**: 调用 `chatStream` 并通过 `for await...of` 循环处理 SSE 事件。<br>3. **批量更新**: 使用 `setTimeout` 和 `Map` 对来自流的多个消息更新事件进行批处理，减少 React 的重渲染次数，提升性能。<br>4. **错误处理**: 使用 `try...finally` 确保无论成功与否，`responding` 状态都能被正确重置。 |
| **`mergeMessage` 纯函数** | 位于 `core/messages/merge-message.ts`，这是一个独立的、无副作用的函数，负责根据收到的 SSE 事件更新单个消息对象的状态。这种模式将状态变更的复杂逻辑从主流程中剥离，使其易于测试和维护，是 Reducer 模式的体现。 |
| **派生状态选择器 (Selectors)** | 项目定义了多个自定义 Hook (`useMessage`, `useRenderableMessageIds`, `useLastInterruptMessage`) 来从 store 中派生和选择数据。它们结合 `useShallow` 进行性能优化，封装了获取特定状态的逻辑，避免了组件内的重复计算。`useRenderableMessageIds` 尤其巧妙，它预先过滤出需要在 UI 中渲染的消息，从根源上解决了 React 列表渲染时的 `key` 值警告问题。 |
| **LocalStorage 持久化** | `settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数提供了一个简洁明了的模式，用于将 Zustand store 的状态与 `localStorage` 同步，实现了用户设置的持久化。 |


--- (202-208 lines) ---
| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **功能切片 (Feature-Sliced) 路由** | `app/` 目录下的结构（如 `app/chat/`, `app/landing/`, `app/settings/`）体现了按功能组织代码的原则。每个功能模块都是一个独立的单元，包含了自身的页面、组件和逻辑，使得项目结构清晰，易于扩展和维护。 |
| **组件分层** | 项目中的 `components/` 目录被清晰地划分为三层：<br>1. **`ui/`**: 基础 UI 组件，源自 Shadcn/ui，是应用的视觉基石。<br>2. **`deer-flow/`**: 应用级的共享组件，如 `Logo`, `Markdown`, `Tooltip` 等。它们封装了通用逻辑，在多个功能模块中复用。<br>3. **`magicui/`**: 高度定制化的视觉特效组件，与业务逻辑解耦，可轻松移植到任何项目中。 |
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |
| **自定义 Hooks 封装** | `hooks/` 目录提供了可复用的 React Hooks，如 `useIntersectionObserver` 和 `useIsMobile`。它们将复杂的浏览器 API 或重复的逻辑封装成简单易用的钩子，简化了组件代码。 |



--- (211-218 lines) ---
项目建立了一套强大且灵活的样式与主题系统。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **基于 CSS 变量的主题系统** | `styles/globals.css` 中，通过在 `:root` 和 `.dark` 选择器下定义大量的 CSS 自定义属性 (custom properties)，构建了整个应用的主题系统。所有颜色、半径等设计令牌 (design tokens) 都被变量化，使得主题切换（通过 `next-themes`）仅需切换一个顶层 class，浏览器即可高效地重绘。 |
| **Tailwind `@theme` 指令** | 通过 `@theme` 指令，项目将 CSS 变量（如 `--app-background`）与 Tailwind 的配置相结合，创建了语义化的工具类（如 `bg-app`）。这使得在组件中可以直观地使用主题颜色，而无需关心具体的色值。 |
| **`cn` 工具函数** | `lib/utils.ts` 中的 `cn` 函数是整个项目的标准实践。它结合了 `clsx` 和 `tailwind-merge`，解决了在 React 组件中动态、条件性地组合 Tailwind 类名时的所有痛点（如条件判断、样式覆盖冲突），是现代 Tailwind 项目的必备工具。 |



--- (269-270 lines) ---
| **安全性** | **防范 XSS 攻击**: 渲染用户生成或来自 API 的内容时，项目始终使用 `react-markdown` (`Markdown` 组件) 或通过 Tiptap 的安全机制进行渲染，而不是直接使用 `dangerouslySetInnerHTML`。<br>**安全处理用户输入**: `components/editor/index.tsx` 中的富文本编辑器在处理粘贴内容时，通过 `handleImagePaste` 和 `transformPastedHTML` 等逻辑对输入进行过滤和转换，防止粘贴恶意的 HTML 代码。<br>**安全的外部链接**: 在所有 `target="_blank"` 的链接中，都添加了 `rel="noopener noreferrer"`，防止了潜在的 "tabnabbing" 漏洞。 |
| **可访问性 (a11y)** | **语义化 HTML**: 项目结构良好，使用了恰当的 HTML5 标签（`header`, `main`, `footer`, `section` 等）。<br>**Radix UI 基础**: 由于 UI 组件库基于 Radix UI，所有组件（如 `Dialog`, `DropdownMenu`, `Tooltip`）都内置了完善的键盘导航支持、焦点管理和 ARIA 属性，提供了坚实的可访问性基础。例如，弹窗打开时焦点会自动移入，关闭后会返回原处。 |


--- (279-279 lines) ---
| **Zod 作为多场景验证器** | Zod schema 不仅用于 React Hook Form 的表单验证 (`app/settings/tabs/general-tab.tsx`)，还在 `app/settings/dialogs/add-mcp-server-dialog.tsx` 中用于**实时验证用户输入的 JSON 配置**，为用户提供即时的、具体的错误反馈。这展示了 Zod 作为“单一事实来源”在多种场景下统一数据校验逻辑的强大能力。 |

</front_stack>

<deer_flow_frontend_code>
--- (772-857 lines) ---
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


--- (1007-1032 lines) ---
### core/models/common.model.ts Content:

```ts
import { z } from "zod";

/**
 * Generic schema factory for paginated responses (API 3.1.2, 4.1.2).
 * @param itemSchema The Zod schema for the items in the list.
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    total: z.number().int(),
    items: z.array(itemSchema),
  });

/**
 * Type helper for PaginatedResponse.
 * Aligns with the interface defined in core/api/types.ts.
 */
export type PaginatedResponse<T> = {
  total: number;
  items: T[];
};



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


--- (2255-2305 lines) ---
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



--- (2966-3241 lines) ---
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
  createProject: (data: ProjectCreate) => Promise<ProjectDetailRead | null>;
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
      return newProject;
    } catch (error) {
      console.error("Failed to create project:", error);
      if (error instanceof Error && error.message === "PROJECT_NAME_EXISTS") {
        toast.error("Project creation failed", {
          description: "A project with this name already exists.",
        });
      } else {
        toast.error("Failed to create project.");
      }
      return null;
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


--- (3383-3392 lines) ---
### app/page.tsx Content:

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/projects");
}

```


--- (3397-3553 lines) ---
### app/(platform)/layout.tsx Content:

```tsx
"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { GlobalHeader } from "~/components/platform/layout/global-header";
import { useStore } from "~/core/store";

/**
 * Platform Layout with Authentication Route Guard.
 * Protects all routes within the (platform) group.
 */
export default function PlatformLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
  }));

  useEffect(() => {
    // Wait until initialization (handled by AuthInitializer) is complete.
    if (!isInitialized) return;

    // If initialization is complete and the user is NOT authenticated, redirect to login.
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login.");
      // Use replace to prevent the user from navigating back to the protected route
      // Redirect to the new /auth/login path
      router.replace("/auth/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Show loading state if initializing or if we are unauthenticated (while redirecting)
  if (!isInitialized || !isAuthenticated) {
    // We show a loader here because AuthInitializer also shows a loader during the initial load.
    // This ensures a consistent loading experience until the auth state is confirmed and redirection (if any) occurs.
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render the platform layout if authenticated
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <GlobalHeader />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

```

            ## settings
             - layout.tsx
             - page.tsx

### app/(platform)/settings/layout.tsx Content:

```tsx
import type { ReactNode } from "react";

import { Separator } from "~/components/ui/separator";

import { SettingsSidebar } from "./components/settings-sidebar";

interface SettingsLayoutProps {
  children: ReactNode;
}

// Design Doc 3.3.2.B Layout Template 1: Standard Layout (Sidebar + Content)
export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    // Allow the settings page content to scroll vertically within the main platform layout
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and configure platform preferences.
          </p>
        </div>
        <Separator />
        {/* Flex layout: Sidebar on the left (desktop), Stacked (mobile) */}
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SettingsSidebar />
          </aside>
          {/* Main content area */}
          <div className="flex-1 lg:max-w-3xl">{children}</div>
        </div>
      </div>
    </div>
  );
}

```

### app/(platform)/settings/page.tsx Content:

```tsx
import { redirect } from "next/navigation";

import { settingsNavItems } from "./components/settings-config";

// The root settings page redirects to the first defined tab (Profile).
export default function SettingsPage() {
  const defaultTab = settingsNavItems[0];
  if (defaultTab) {
    redirect(defaultTab.href);
  }

  // Fallback if config is somehow empty
  return (
    <div>
      <p>Settings configuration error.</p>
    </div>
  );
}

```

                ## preferences
                 - page.tsx

### app/(platform)/settings/preferences/page.tsx Content:

```tsx
import { SettingsPageWrapper } from "../components/settings-page-wrapper";

import { PreferencesForm } from "./components/preferences-form";

export default function PreferencesPage() {
  return (
    // Wrapper handles data loading and Card structure
    <SettingsPageWrapper configPath="/settings/preferences">
      {/* Content within the CardContent */}
      <PreferencesForm />
    </SettingsPageWrapper>
  );
}

```

                    ## components
                     - preferences-form.tsx

### app/(platform)/settings/preferences/components/preferences-form.tsx Content:

```tsx
"use client";



--- (4575-4614 lines) ---
### app/(platform)/projects/page.tsx Content:

```tsx
import { PlusCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function ProjectsDashboardPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects Dashboard</h1>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Project list implementation coming soon.</p>
          <p className="mt-4">
            <Link href="/projects/1/workflow" className="text-primary hover:underline">
              View Example Workflow (Placeholder)
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

```


--- (4643-4664 lines) ---
### app/(platform)/projects/new/page.tsx Content:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function NewProjectPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Create New Project</h1>
      <Card>
        <CardHeader>
          <CardTitle>Project Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">New project creation form coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

```


--- (5162-5180 lines) ---
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



--- (5806-5904 lines) ---
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



--- (6242-6269 lines) ---
### components/ui/label.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "~/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }



--- (6272-6307 lines) ---
### components/ui/sonner.tsx Content:

```tsx
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

```


--- (6447-6514 lines) ---
### components/ui/alert.tsx Content:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        // Custom status variants based on Design Doc A. Semantic Colors
        success:
          "border-emerald-500/50 text-emerald-700 dark:text-emerald-400 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
        warning:
          "border-amber-500/50 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };



--- (6793-6931 lines) ---
### components/ui/dialog.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}



--- (6934-6978 lines) ---
### components/ui/badge.tsx Content:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Custom status variants based on Design Doc A. Semantic Colors
        success:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
        warning:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };



--- (7012-7079 lines) ---

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


--- (7636-7661 lines) ---
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


--- (7684-7855 lines) ---
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


--- (10214-10276 lines) ---
### components/platform/layout/global-header.tsx Content:

```tsx
"use client";

import Link from "next/link";
import { PlusCircle, Workflow } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { ThemeToggle } from "~/components/platform/theme-toggle";
import { UserMenu } from "./user-menu";

export function GlobalHeader() {
  const pathname = usePathname();

  const navItems = [
    { name: "Projects", href: "/projects" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <div className="flex items-center gap-6">
        <Link href="/projects" className="flex items-center gap-2 text-lg font-semibold" aria-label="O-Award Home">
          <Workflow className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">O-Award</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button size="sm" asChild className="hidden sm:flex">
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>

        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

```

</deer_flow_frontend_code>

<architecture>
--- (37-49 lines) ---
### 2.2 状态管理与数据流

  * **Zustand**: 全局状态管理。采用切片模式 (Slice Pattern) 组织复杂状态。
  * **React Query (TanStack Query) (推荐引入)**: 用于管理服务器状态缓存、API 请求生命周期和后台同步，与 Zustand 互补。

### 2.3 样式与 UI 组件

  * **Tailwind CSS**: 原子化 CSS 框架，实现设计系统 Token。
  * **Shadcn/ui (基于 Radix UI)**: 基础 UI 组件库，提供可访问性和定制能力。
  * **next-themes + CSS Variables**: 实现主题管理（深色模式优先）。
  * **Geist Fonts (Sans & Mono)**: 指定字体家族。
  * **Lucide Icons**: 主要图标库。



--- (65-66 lines) ---
  * **Zod**: 数据结构定义和校验。
  * **React Hook Form**: 表单管理。


--- (102-116 lines) ---
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


--- (123-128 lines) ---
/src/components
├── /ui/                # 基础 UI 组件 (Shadcn/ui)
├── /platform/          # 应用级共享组件
│   ├── layout/         # GlobalHeader, ResizableHandle
│   ├── data-display/   # StatusBadge, StalenessIndicator, Timestamp
│   └── feedback/       # ConfirmationDialog, Toaster


--- (193-193 lines) ---
3.  **Project State**: 项目列表和元数据。


--- (226-230 lines) ---
#### 4.3.3 ProjectSlice (`projectSlice.ts`)

  * **State**: `projects: ProjectSummaryRead[]`, `currentProject: ProjectDetailRead | null`, `isLoading`.
  * **Actions**: `fetchProjects`, `loadProjectDetail`, `createProject`, `updateProject`, `deleteProject`, `uploadFile`, `startWorkflow`.



--- (329-332 lines) ---
#### 5.1.2 服务层抽象 (Service Layer)

将 API 调用封装在类型安全的服务中（`src/core/api/*.service.ts`），供 Zustand Store 调用。



--- (499-504 lines) ---
#### 8.1.1 CSS Variables 与 Tailwind 配置

  * 在 `styles/globals.css` 中实现设计文档 4.1.1.B 的 CSS 变量定义（HSL 格式）。
  * 在 `tailwind.config.ts` 中配置 Tailwind 使用这些变量。
  * 扩展 Tailwind 配置，实现语义化状态色彩（`status-completed`, `status-executing` 等）（设计文档 4.1.1.D）。



--- (545-551 lines) ---
### 9.2 错误处理与反馈 (Error Handling and Feedback)

  * **反馈机制**: 统一使用 Toast (Sonner), Banner (Alert), AlertDialog 进行反馈（设计文档 3.1.2）。
  * **API 错误**: 在 API Client 拦截器中全局处理通用错误（401, 403, 5xx）。在业务逻辑中处理特定错误（409, 422）。
  * **WebSocket 错误**: 实现连接状态反馈（横幅）和重连逻辑。
  * **Error Boundaries**: 使用 React Error Boundaries 包裹关键组件，防止局部崩溃。



--- (580-584 lines) ---
### 10.3 端到端测试 (E2E Testing)

  * **工具**: Playwright / Cypress。
  * **重点**: 核心用户旅程：项目创建 -\> 工作流启动 -\> HITL 审批 -\> 版本切换 -\> Staleness 处理 -\> 重新执行。测试实时同步的正确性。


</architecture>



---

<task>


### 任务 5：项目管理 UI：仪表板与 CRUD 操作

**目标：** 实现项目列表仪表板页面，支持项目的创建、查看和删除操作。

**核心关注点：** 列表渲染、分页、状态展示、表单处理、用户反馈与确认机制。

**实现策略：**

1.  **项目仪表板页面（`src/app/(platform)/projects/page.tsx` 新建）：**
    *   实现页面布局。连接到 `ProjectSlice`，在页面加载时调用 `fetchProjects`。
2.  **列表渲染：**
    *   使用 Shadcn/ui `Table` 或 `Card` 网格展示项目列表。
    *   显示关键信息（`<api> 3.5.1`）。使用 `Badge` 和语义化颜色（任务 1 配置）展示项目状态（`Configuring`, `Running`, `Completed`）。
    *   实现分页逻辑（如果需要）。
3.  **项目创建流程（`<api> 3.1.1`）：**
    *   实现“新建项目”按钮和对话框 (`Dialog`)。
    *   使用 React Hook Form 和 Zod 校验输入（名称、描述）。调用 `ProjectSlice.createProject`。
    *   处理 `409 Conflict`（名称重复）错误，并在表单中清晰提示。
    *   成功后导航到新项目的配置页面 (`/projects/[id]/config`)。
4.  **项目删除流程（`<api> 3.1.5`）：**
    *   实现删除按钮。
    *   **关键实现：** 必须使用 `AlertDialog` 进行二次确认，明确警告操作的不可逆性和将终止运行中任务的后果（`<api> 3.1.5 警告`）。调用 `ProjectSlice.deleteProject`。

**输入：** 任务 4 的输出（ProjectSlice）, `<api> 3.1, 3.5.1`。
**输出：** 功能完整的项目仪表板 UI。


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
