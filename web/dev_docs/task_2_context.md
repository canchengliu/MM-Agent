<design_doc>
--- (63-73 lines) ---
#### 1.2.1 领域：用户认证与账户管理 (Domain: User and Account Management)

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| U1.1 | 用户注册 | 使用邮箱和密码创建账户，需满足基本密码强度要求。 | FRS 1.1 | P0 |
| U1.2 | 邮箱验证 | 用户必须验证邮箱才能激活账户并登录。 | FRS 1.1 | P0 |
| U1.3 | 用户认证 (JWT) | 使用邮箱密码登录，获取 JWT Token 进行会话管理。 | FRS 1.2 | P0 |
| U1.4 | 访问控制 | 用户只能访问和操作自己的账户信息和项目数据。 | FRS 1.4 | P0 |
| U1.5 | 密码重置 | 用户能够通过邮箱重置忘记的密码。 | FRS 1.3 | P1 |
| U1.6 | 密码修改 | 登录状态下，用户能在设置面板修改密码（需验证当前密码）。 | FRS 1.3 | P1 |



--- (74-86 lines) ---
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



--- (240-250 lines) ---
##### A. 用户与设置 (User and Settings)

  * **User (用户画像)**
      * `id`, `email`, `display_name`.
      * `is_active`, `is_verified` (boolean): **(前端关键：用于控制登录和功能访问权限)**。
  * **UserSettings (用户设置)**
      * *Interface:* `language` (enum), `theme` (enum).
      * *Engine Behavior:* `hitl_profile` (enum), `thinking_depth` (enum).
      * *BYOK Configuration:* `llm_model_name`, `llm_base_url`.
      * *Security Indicators:* `has_llm_api_key`, `has_e2b_api_key` (boolean). **(前端关键：遵循“写后即忘”，UI 仅显示存在性，不显示密钥)**。



--- (338-351 lines) ---
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



--- (352-362 lines) ---
#### 2.2.2 全局导航模型 (Global Navigation Model)

全局导航位于应用的**顶部页眉 (Global Header)**，提供对核心模块的快速访问。

  * **Global Header Structure:**
      * [Logo/Home Link]
      * [Main Navigation Links]: (Projects, Settings)
      * 
      * [Global Actions]: (e.g., New Project)
      * [User Menu]: (Avatar, Settings, Logout)



--- (627-635 lines) ---
#### A. 反馈机制分类与组件规范 (Feedback Mechanisms Classification)

| 类型 | 描述与时机 | 组件 (Shadcn/ui Stack) | 侵入性 |
| :--- | :--- | :--- | :--- |
| **Toast (轻提示)** | 非关键操作确认（保存成功、版本激活）。系统事件通知（结构更新）。 | **Sonner** | 低 |
| **Banner (横幅)** | 持久的、重要的上下文相关提示。需要用户关注但无需立即行动。 | **Alert (定制化)** | 中 |
| **Inline Indicator (内联指示器)** | 图标或标签，表示对象状态。实时显示。 | **Badge, Lucide Icons, Tooltip** | 低 |
| **AlertDialog (警示对话框)** | 破坏性或不可逆操作的二次确认。阻塞流程。 | **AlertDialog** | 高 |



--- (648-652 lines) ---
##### 1\. 状态同步范式 (State Synchronization Paradigm)

  * 严格遵循 API 6.1 原则：**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新。**
  * **关键规则:** WebSocket 断线重连后，必须立即重新调用 REST API 获取全量快照，以保证数据一致性。



--- (690-696 lines) ---
#### A. 全局导航模型 (Global Navigation Model)

采用位于顶部的\*\*全局页眉 (Global Header)\*\*作为主导航。

  * **结构:** `[Logo/Home] [Breadcrumbs (Contextual)] ... (Spacer) ... [Global Actions] [User Menu]`。
  * **Breadcrumbs:** 提供当前位置的层级路径和快速返回能力。例如：`Projects / 2024 Problem A / Workflow Execution`。



--- (697-701 lines) ---
#### B. 布局模板 1：通用仪表板/列表布局 (Template 1: Standard Layout)

  * **应用场景：** 项目列表 (`/projects`)，设置中心 (`/settings`)。
  * **结构：** 标准的侧边栏导航 + 主内容区布局。



--- (897-990 lines) ---
#### 4.1.1 色彩系统与主题策略 (Color System and Theming Strategy)

##### A. 设计哲学与策略 (Philosophy and Strategy)

  * **深色优先 (Dark Mode First):** 平台默认为深色模式，以满足专家用户对沉浸感和长时间使用的需求。
  * **克制与功能性 (Restrained and Functional):** 色彩运用极度克制。主色调采用深邃的中性色 (Slate)，色彩主要用于传达语义信息和层级关系。
  * **精密感 (Precision):** 引入具有未来科技感的强调色（赛博蓝 Cyber Blue）用于引导和状态指示。
  * **实现机制:** 采用 CSS Variables 实现主题切换，与 `next-themes` 和 Shadcn/ui 的标准实践保持一致。使用 HSL 格式定义色彩。

##### B. 语义化 Token 与主题定义 (Semantic Tokens and Theming)

以下定义了应用于 `globals.css` 中的 CSS 变量，遵循 Shadcn/ui 的约定。

```css
/* globals.css */

:root {
  /* 浅色模式 (Light Mode - Secondary) */
  --background: 0 0% 100%;        /* Pure White */
  --foreground: 222.2 84% 4.9%;   /* Slate-950 (Near Black) */

  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  /* Primary (Cyber Blue) */
  --primary: 221.2 83.2% 53.3%;    /* Blue-600 */
  --primary-foreground: 210 40% 98%;

  /* Secondary (Cool Gray) */
  --secondary: 210 40% 96.1%;      /* Slate-100 */
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%; /* Slate-500 */

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  /* Destructive (Red) */
  --destructive: 0 84.2% 60.2%;    /* Red-500 */
  --destructive-foreground: 210 40% 98%;

  /* Borders and Inputs */
  --border: 214.3 31.8% 91.4%;     /* Slate-200 */
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;

  /* UI Radius (See 4.1.4) */
  --radius: 0.5rem; /* 8px - Base radius */
}

.dark {
  /* 深色模式 (Dark Mode - Primary/Default) */
  /* 背景使用深邃的蓝黑色，营造精密感 */
  --background: 222.2 84% 4.9%;    /* Deep Blue-Black (Slate 950) */
  --foreground: 210 40% 98%;       /* Near White (Slate 50) */

  /* Card/Panel background - 略高于背景色 */
  --card: 222.2 47.4% 11.2%; /* Slate-900 */
  --card-foreground: 210 40% 98%;

  --popover: 222.2 47.4% 11.2%;
  --popover-foreground: 210 40% 98%;

  /* Primary (Cyber Blue) - 在深色下更明亮 */
  --primary: 217.2 91.2% 59.8%;    /* Blue-500 */
  --primary-foreground: 222.2 47.4% 11.2%; /* Dark text for contrast */

  /* Secondary */
  --secondary: 217.2 32.6% 17.5%;  /* Slate-800 */
  --secondary-foreground: 210 40% 98%;

  /* Muted */
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%; /* Slate-400 */

  /* Accent */
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  /* Destructive */
  --destructive: 0 62.8% 30.6%;    /* Darker Red */
  --destructive-foreground: 210 40% 98%;

  /* Border & Input - 在深色下保持清晰但不过于刺眼 */
  --border: 217.2 32.6% 17.5%;     /* Slate-800 */
  --input: 217.2 32.6% 17.5%;
  --ring: 217.2 91.2% 59.8%;
}
```



--- (1729-1743 lines) ---
##### A. 核心技术栈

  * **框架:** Next.js (App Router), React, Zustand (State Management).
  * **样式与 UI:** Tailwind CSS, Shadcn/ui (基于 Radix UI), `next-themes`.
  * **动效:** Framer Motion.
  * **专业组件:** Monaco Editor, Novel/Tiptap, `react-resizable-panels`.
  * **字体:** Geist Sans, Geist Mono.

##### B. 实现约定与最佳实践

1.  **主题与样式:** 严格遵守 Design Tokens。使用 CSS Variables 实现主题。默认深色模式。使用 `cn` 工具函数组合类名。
2.  **状态同步范式 (关键):** 严格遵循“REST API 为全量快照（Source of Truth），WebSocket 提供增量更新”的原则（参见 3.1.2.C.1）。实现健壮的断线重连和重连后的全量同步。
3.  **Staleness 处理逻辑:** 监听到 `NODE_ACTIVE_VERSION_CHANGED` 事件后，必须立即重新获取全量工作流状态以更新 `is_stale` 标志。
4.  **动态结构处理:** `WORKFLOW_STRUCTURE_UPDATED` 事件必须触发 Zustand Store 的全量替换。



--- (1748-1752 lines) ---
##### A. 色彩系统 (Color System)

  * **核心色板 (Dark Mode):** Background (Slate 950), Card (Slate 900), Border (Slate 800), Foreground (Slate 50), Primary (Cyber Blue 500)。
  * **语义化状态色彩 (Tailwind `status-*`):** Completed (Emerald), Executing (Cyan), Awaiting/Stale (Amber), Failed (Red), Canceled (Orange)。


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


--- (520-524 lines) ---
所有项目相关的 API 端点都需要通过 `Authorization` 头进行 Bearer Token 认证。

```http
Authorization: Bearer <your_jwt_token>
```


--- (1632-1657 lines) ---

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



--- (1946-1959 lines) ---
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
--- (18-25 lines) ---
### 二、 状态管理

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |



--- (33-44 lines) ---

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



--- (83-90 lines) ---
### 七、 表单处理与数据校验

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **React Hook Form** | 用于管理设置页面 (`settings`) 的表单状态、校验和提交。 |
| **Zod** | 一个 TypeScript-first 的 schema 声明和校验库，用于定义表单数据结构和验证规则。 |
| **`@hookform/resolvers`** | 用于将 Zod schema 与 React Hook Form 集成，实现无缝的表单验证。 |



--- (91-96 lines) ---
### 八、 国际化 (i18n)

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **next-intl** | 为 Next.js 应用提供完整的国际化解决方案，包括翻译文本管理、语言环境路由和服务器端集成。 |



--- (153-162 lines) ---
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



--- (172-177 lines) ---
#### 4. 国际化 (i18n) 实现模式

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **服务端 Cookie 读取** | `src/i18n.ts` 中使用 `next/headers` 的 `cookies()` 函数，在**服务端**直接读取 `NEXT_LOCALE` Cookie。这使得在 RSC 或服务器端渲染时就能确定用户的语言偏好，无需等待客户端加载。 |
| **动静结合的语言切换** | `components/deer-flow/language-switcher.tsx` 组件展示了一种实用的语言切换策略：通过客户端 JavaScript 设置 Cookie (`document.cookie = ...`)，然后强制刷新页面 (`window.location.reload()`)。虽然会刷新页面，但这种方法简单可靠，能确保服务端的 `i18n.ts` 能立即读到最新的 Cookie 值并应用正确的语言包。 |


--- (179-185 lines) ---
#### 5. 环境与配置管理

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **类型安全的环境变量** | `src/env.js` 使用 `@t3-oss/env-nextjs` 将环境变量分为 `server` 和 `client` 两部分，并使用 Zod 进行校验和类型定义。`runtimeEnv` 则负责将 `process.env` 的值安全地映射到这些定义上，同时处理了布尔值等类型的转换。这是一个确保应用配置正确、避免运行时错误的最佳实践。 |
| **运行时配置获取** | `core/api/hooks.ts` 中的 `useConfig` Hook 展示了如何从后端异步获取应用配置（如可用的 LLM 模型）。它包含了**重试逻辑**和**超时机制**，并在失败后回退到默认配置，增强了应用的鲁棒性。 |



--- (199-204 lines) ---

项目的目录结构和代码组织方式遵循了现代大型前端应用的**最佳实践**，非常值得借鉴。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **功能切片 (Feature-Sliced) 路由** | `app/` 目录下的结构（如 `app/chat/`, `app/landing/`, `app/settings/`）体现了按功能组织代码的原则。每个功能模块都是一个独立的单元，包含了自身的页面、组件和逻辑，使得项目结构清晰，易于扩展和维护。 |


--- (231-238 lines) ---
项目在代码中体现了防御性编程的思想，确保在各种异常情况下应用依然能稳定运行。

| 策略/模式 | 描述与复用价值 |
| :--- | :--- |
| **API 请求重试与超时** | `core/api/hooks.ts` 中的 `useConfig` Hook 在 `fetch` 配置时，不仅设置了超时 (`AbortSignal.timeout`)，还实现了带有指数退避 (exponential backoff) 的重试逻辑。这显著提高了应用在网络不佳情况下的稳定性。 |
| **组件级错误回退** | `components/deer-flow/fav-icon.tsx` 组件的 `img` 标签上使用了 `onError` 事件处理器。当网站图标加载失败时，它会自动切换到一个通用的备用图标，避免了在 UI 上显示破碎的图片。 |
| **环境驱动的逻辑切换** | `env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY` 环境变量在多个地方被用作开关，以改变应用的行为。例如，`chatStream` 会根据此变量决定是调用真实的 API 还是模拟的 `chatReplayStream`。这使得同一套代码库可以轻松地部署为功能完整的动态应用或纯静态的演示网站。 |
| **容错数据解析** | `core/utils/json.ts` 中的 `parseJSON` 函数在解析失败时不会直接抛出错误，而是会返回一个预设的 `fallback` 值。这使得即使 LLM 返回的 JSON 格式稍有瑕疵，UI 也不会因此崩溃。 |


--- (256-262 lines) ---
| 实践/模式 | 描述与复用价值 |
| :--- | :--- |
| **配置驱动的 UI** | `app/settings/tabs/index.tsx` 中的 `SETTINGS_TABS` 数组是一个典型的配置驱动 UI 模式。开发者只需向这个数组中添加一个新的对象（包含组件、图标、标签等元数据），就能动态生成一个新的设置标签页，无需修改任何 JSX 结构。这种模式极大地简化了扩展，并降低了出错的可能性。 |
| **强大的调试与演示工具** | `core/api/chat.ts` 中的 `chatReplayStream` 是一个强大的开发和演示工具。它允许开发者将一次真实的 API 交互录制为文本文件，然后在本地通过 URL 参数（`?replay=...`）完美复现整个流式交互过程。这对于调试复杂的后端逻辑、制作产品演示以及编写端到端测试都非常有价值。 |
| **直接导入 Markdown 内容** | 项目配置了 Webpack (或 Turbopack) 加载器，允许直接 `import` `.md` 文件作为字符串。如 `app/settings/tabs/about-tab.tsx` 中 `import aboutEn from "./about-en.md";`。配合 `typings/md.d.ts` 中的类型声明，这为处理静态文本内容（如“关于”页面、文档）提供了极为便捷和类型安全的方式。 |
| **原子化且可组合的 Store Action** | `core/store/settings-store.ts` 中提供了一系列小巧、独立的 action 函数，如 `setReportStyle`, `setEnableDeepThinking`。它们封装了对 Zustand store 的特定修改，并自动调用 `saveSettings` 进行持久化。这使得在应用的任何地方修改设置都变得简单且一致。 |



--- (272-281 lines) ---
### 二十二、 精巧的实现细节与模式

一些小而美的代码片段和模式，体现了项目在细节上的考究。

| 细节/模式 | 描述与复用价值 |
| :--- | :--- |
| **Pragmatic Bug Fix** | `app/layout.tsx` 中注入的全局 `window.isSpace` 函数是一个非常务实的解决方案。注释明确指出这是为了修复 `markdown-it` 在 Next.js + Turbopack 环境下的一个特定 bug。这展示了在面对第三方库兼容性问题时，如何通过最小的侵入性“打补丁”来解决问题，而不是等待上游修复。 |
| **Zod 作为多场景验证器** | Zod schema 不仅用于 React Hook Form 的表单验证 (`app/settings/tabs/general-tab.tsx`)，还在 `app/settings/dialogs/add-mcp-server-dialog.tsx` 中用于**实时验证用户输入的 JSON 配置**，为用户提供即时的、具体的错误反馈。这展示了 Zod 作为“单一事实来源”在多种场景下统一数据校验逻辑的强大能力。 |
| **可扩展的数据-视图映射** | 在落地页的多个部分（如 `CaseStudySection` 和 `CoreFeatureSection`），UI 的生成是通过**将数据数组映射到 UI 组件**来完成的。例如，`caseStudyIcons` 数组将案例的 ID 与其对应的 Lucide 图标关联起来。这种模式使得添加、删除或修改一个案例或功能特性，只需修改数据数组，而无需触碰渲染逻辑，符合“开放-封闭原则”。 |
| **类型定义文件** | `typings/md.d.ts` 的存在，虽然简单，但它代表了一个良好的工程实践：为项目中非标准的导入（如 `.md` 文件）提供明确的 TypeScript 类型定义，从而在整个项目中享受类型检查带来的好处。 |

</front_stack>

<deer_flow_frontend_code>
--- (7-34 lines) ---
### i18n.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
const locales: Array<string> = ["zh", "en"];

export default getRequestConfig(async () => {
  // Get locale from cookie
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  // Validate that the incoming `locale` parameter is valid
  const locale =
    cookieLocale && locales.includes(cookieLocale) ? cookieLocale : "en";

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale,
  };
});

```


--- (36-90 lines) ---
### env.js Content:

```js
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_BASE_URL: z
      .string()
      .url()
      .optional()
      .default("http://localhost:8000/api/v1"),
    NEXT_PUBLIC_WS_URL: z.string().url().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  // Removed Deer-Flow specific variables (AMPLITUDE, GITHUB_OAUTH, STATIC_WEBSITE_ONLY, etc.)
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

```


--- (652-677 lines) ---
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


--- (784-794 lines) ---
         - index.ts

### core/store/index.ts Content:

```ts
// Central export point for Zustand stores.
// Deer-Flow specific stores (e.g., settings-store.ts) have been removed.
// O-Award specific stores will be added here in future iterations.
export {};

```


--- (853-871 lines) ---
         - layout.tsx

### app/(platform)/layout.tsx Content:

```tsx
import type { ReactNode } from "react";

import { GlobalHeader } from "~/components/platform/layout/global-header";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <GlobalHeader />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

```


--- (873-899 lines) ---
            ## settings
             - page.tsx

### app/(platform)/settings/page.tsx Content:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">User Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings page implementation coming soon (Profile, Preferences, Engine).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

```


--- (996-1011 lines) ---
         - layout.tsx

### app/(auth)/layout.tsx Content:

```tsx
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

```


--- (1013-1057 lines) ---
            ## login
             - page.tsx

### app/(auth)/login/page.tsx Content:

```tsx
import { Workflow } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Workflow className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">O-Award Platform</h1>
        </div>
        <CardTitle className="text-center text-xl">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-center text-muted-foreground">
          Authentication flows will be implemented here.
        </p>
        <div className="text-center">
          <Link href="/projects" className="text-sm text-primary hover:underline">
            (Dev) Bypass Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

```


--- (1557-1572 lines) ---
     - theme-provider.tsx

### components/theme-provider.tsx Content:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import * as React from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

```


--- (1601-1674 lines) ---
### components/ui/tabs.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "~/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

```


--- (1676-1774 lines) ---
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



--- (2112-2140 lines) ---
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

```


--- (2142-2177 lines) ---
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


--- (2317-2351 lines) ---
### components/ui/switch.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "~/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }



--- (2537-2591 lines) ---
### components/ui/avatar.tsx Content:

```tsx
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "~/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

```


--- (2820-2885 lines) ---
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



--- (2965-3225 lines) ---
### components/ui/dropdown-menu.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}



--- (3228-3416 lines) ---
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



--- (3443-3468 lines) ---
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


--- (3489-3659 lines) ---
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



--- (4162-4194 lines) ---
### components/deer-flow/theme-provider-wrapper.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { usePathname } from "next/navigation";

import { ThemeProvider } from "~/components/theme-provider";

export function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatPage = pathname?.startsWith("/chat");

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={"dark"}
      enableSystem={isChatPage}
      forcedTheme={isChatPage ? undefined : "dark"}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}



--- (4218-4292 lines) ---
### components/deer-flow/language-switcher.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type LanguageOption = {
  code: string;
  name: string;
  flag: string;
};

const languages: Array<LanguageOption> = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentLanguage =
    languages.find((lang) => lang.code === locale) ??
    (languages[0] as LanguageOption);

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      console.log(`updateing locale to ${newLocale}`)
      // Set locale in cookie
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=lax`;
      // Reload the page to apply the new locale
      window.location.reload();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          <span className="mr-2">{currentLanguage.flag}</span>
          {currentLanguage.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={locale === language.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

```


--- (4368-4438 lines) ---
### components/deer-flow/theme-toggle.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

import { Tooltip } from "./tooltip";

export function ThemeToggle() {
  const { theme = "system", setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip title="Change theme">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span
            className={cn(
              theme === "light" ? "font-bold" : "text-muted-foreground",
            )}
          >
            Light
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span
            className={cn(
              theme === "dark" ? "font-bold" : "text-muted-foreground",
            )}
          >
            Dark
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span
            className={cn(
              theme === "system" ? "font-bold" : "text-muted-foreground",
            )}
          >
            System
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}



--- (5305-5331 lines) ---
         - app-providers.tsx

### components/providers/app-providers.tsx Content:

```tsx
"use client";

import * as React from "react";

import { ThemeProvider } from "~/components/theme-provider";
import { TooltipProvider } from "~/components/ui/tooltip";

// Centralizes all global providers (Theme, UI, etc.)
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
    </ThemeProvider>
  );
}

```


--- (5336-5394 lines) ---
### components/platform/theme-toggle.tsx Content:

```tsx
"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export function ThemeToggle() {
  const { theme = "system", setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Change theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span className={cn(theme === "light" ? "font-medium" : "text-muted-foreground")}>
            Light
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span className={cn(theme === "dark" ? "font-medium" : "text-muted-foreground")}>
            Dark
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span className={cn(theme === "system" ? "font-medium" : "text-muted-foreground")}>
            System
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

```


--- (5400-5472 lines) ---
### components/platform/layout/user-menu.tsx Content:

```tsx
"use client";

import Link from "next/link";
import { LogOut, Settings } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function UserMenu() {
  const user = {
    display_name: "Jane Doe",
    email: "jane@example.com",
    avatar_url: null as string | null,
  };

  const initials = user.display_name
    ? user.display_name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleLogout = () => {
    console.log("Logout placeholder: Clear token and redirect.");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url ?? undefined} alt={user.display_name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.display_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}



--- (5475-5536 lines) ---
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


</deer_flow_frontend_code>

<architecture>
--- (37-41 lines) ---
### 2.2 状态管理与数据流

  * **Zustand**: 全局状态管理。采用切片模式 (Slice Pattern) 组织复杂状态。
  * **React Query (TanStack Query) (推荐引入)**: 用于管理服务器状态缓存、API 请求生命周期和后台同步，与 Zustand 互补。



--- (45-46 lines) ---
  * **Shadcn/ui (基于 Radix UI)**: 基础 UI 组件库，提供可访问性和定制能力。
  * **next-themes + CSS Variables**: 实现主题管理（深色模式优先）。


--- (62-66 lines) ---

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


--- (89-117 lines) ---
### 3.2 `src/app` 路由结构 (App Router Structure)

使用路由组 `(group)` 组织功能模块。

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



--- (167-182 lines) ---
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



--- (185-225 lines) ---
## 4\. 状态管理架构 (State Management Architecture - Zustand)

采用 Zustand 进行全局状态管理，使用切片模式 (Slice Pattern) 分离关注点。

### 4.1 状态划分原则 (State Partitioning)

1.  **Auth State**: 认证信息和用户画像。
2.  **Settings State**: 用户偏好设置和 BYOK 配置（持久化）。
3.  **Project State**: 项目列表和元数据。
4.  **Workflow State (核心)**: 当前工作流的结构、节点状态、版本信息（服务器状态缓存）。
5.  **UI Interaction State**: 纯粹的 UI 状态（当前选中的节点、展开/折叠状态等）。

### 4.2 Store 结构与实现 (`src/core/store/`)

```typescript
// src/core/store/index.ts
import { create } from 'zustand';
// ... imports for Slices

interface GlobalState extends AuthSlice, SettingsSlice, ProjectSlice, WorkflowSlice, UIInteractionSlice {}

export const useStore = create<GlobalState>()((...a) => ({
  ...createAuthSlice(...a),
  // ... other slices
}));
```

### 4.3 核心切片详解 (Core Slices Details)

#### 4.3.1 AuthSlice (`authSlice.ts`)

  * **State**: `token`, `userProfile`, `isAuthenticated`, `isInitialized`.
  * **Actions**: `login`, `logout`, `initialize` (从存储加载 Token 并验证)。
  * **Persistence**: Token 存储管理。

#### 4.3.2 SettingsSlice (`settingsSlice.ts`)

  * **State**: `settings: UserSettingsRead`, `isLoading`.
  * **Actions**: `fetchSettings` (GET /users/me/settings), `updateSettings` (PATCH /users/me/settings)。
  * **BYOK Handling**: 负责处理 API Key 的提交（遵循“写后即忘”模型）。



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



--- (339-343 lines) ---
1.  **连接时机**: 当用户进入工作流页面时建立连接。
2.  **认证**: 通过 URL 参数传递 Token (`ws://.../ws/{workflow_id}?token=...`)（API 6.2.1）。
3.  **健壮性**: 实现心跳检测和指数退避的自动重连机制。
4.  **Token 刷新**: 监听 `AuthStore` 的 Token 变化，如果 Token 更新，主动断开并使用新 Token 重连（API 6.3.1）。



--- (505-508 lines) ---
#### 8.1.2 主题策略 (Dark Mode First)

  * 使用 `next-themes`，配置 `defaultTheme="dark"`。



--- (536-557 lines) ---
## 9\. 跨领域关注点 (Cross-Cutting Concerns)

### 9.1 认证与授权 (Authentication and Authorization)

  * **流程**: 实现基于 JWT 的登录、注册、验证流程（API 1）。
  * **Token 管理**: 安全存储 Token（优先 `HttpOnly` Cookie，其次 `localStorage`）。
  * **注入**: API Client 拦截器自动注入 Token。WebSocket 连接时传递 Token。
  * **路由守卫**: 使用 Next.js Middleware 保护主应用路由。

### 9.2 错误处理与反馈 (Error Handling and Feedback)

  * **反馈机制**: 统一使用 Toast (Sonner), Banner (Alert), AlertDialog 进行反馈（设计文档 3.1.2）。
  * **API 错误**: 在 API Client 拦截器中全局处理通用错误（401, 403, 5xx）。在业务逻辑中处理特定错误（409, 422）。
  * **WebSocket 错误**: 实现连接状态反馈（横幅）和重连逻辑。
  * **Error Boundaries**: 使用 React Error Boundaries 包裹关键组件，防止局部崩溃。

### 9.3 国际化 (i18n)

  * 使用 `next-intl` 实现（FRS 7.2）。
  * 支持英语 (en) 和简体中文 (zh)。
  * 通过 Cookie (`NEXT_LOCALE`) 存储和检测语言偏好。


</architecture>



---

<task>


### 任务 2：认证流程、用户设置与 API 客户端基础设施

**目标：** 实现用户认证流程（注册、登录、验证），构建用户设置中心，并搭建健壮的 REST API 客户端基础设施，包括全局认证和错误处理。

**核心关注点：** JWT 管理、API 拦截器、BYOK（Bring-Your-Own-Key）安全模型、Zustand 切片结构。

**实现策略：**

1.  **Zustand Store 基础结构：**
    *   按照《架构文档》4.2，建立 Zustand Store 的切片结构 (`src/core/store/slices/*`)。
    *   实现 `AuthSlice`：管理 `token`, `userProfile`。实现 `login`, `logout`, `initialize` Actions。实现 Token 的安全存储（参考 `<api> 1 核心机制`）。
    *   实现 `SettingsSlice`：管理用户设置状态。
2.  **API 客户端基础设施（`<architecture> 5.1.1`）：**
    *   在 `src/core/api/client.ts`（新建）中配置 Axios 实例。
    *   **关键实现：** 实现请求拦截器，从 `AuthSlice` 获取 Token 并自动注入 `Authorization` Header。实现响应拦截器，全局处理 401（触发登出/重定向）和 403 错误。
3.  **认证流程实现（`<api> 1`）：**
    *   实现 `auth.service.ts`。
    *   实现认证 UI（`src/app/(auth)/*`）：登录、注册、邮箱验证页面。使用 React Hook Form 和 Zod。
    *   **交互细节：** 严格遵循 `<api> 1.1` 的要求，使用 `application/x-www-form-urlencoded` 进行登录。正确处理 `403 Forbidden`（账户未验证）的提示。
4.  **路由保护：** 配置 Next.js Middleware 或在 `(platform)/layout.tsx` 中实现认证检查，保护主应用路由。
5.  **用户设置中心（`<api> 2`, `<design_doc> 1.2.2`）：**
    *   实现 `user.service.ts`。实现设置页面（`src/app/(platform)/settings/*`）。
    *   实现界面设置（语言、主题）和引擎配置（HITL Profile, Thinking Depth）。
    *   **关键实现：** BYOK 配置。严格遵循“写后即忘”模型（`<api> 2 核心概念`）。UI 仅根据 `has_xxx_api_key` 布尔值显示状态，输入框始终为空，通过 PATCH 更新或清空。

**输入：** 任务 1 的输出, `<api> 1, 2`, `<design_doc> 1.2.1, 1.2.2`, `<architecture> 4.3.1, 4.3.2, 5.1.1`。
**输出：** 功能完整的认证系统和用户设置中心，配置好的全局 API 客户端和基础认证/设置状态管理。


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
