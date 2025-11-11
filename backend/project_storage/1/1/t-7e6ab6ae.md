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

