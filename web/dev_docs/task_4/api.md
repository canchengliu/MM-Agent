--- (4-5 lines) ---
 - 1_认证与授权(Authentication_Authorization).md
 - 2_用户管理(UserManagement).md


--- (12-278 lines) ---
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
