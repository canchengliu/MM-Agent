--- (78-87 lines) ---
##### 模块一：用户认证与账户管理 (UAM)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| UAM-1.1 | 用户注册（邮箱、密码、显示名）。 | P0 | 基础功能。 | R1.1 |
| UAM-1.2 | 安全用户认证（登录/登出，JWT Token 管理）。 | P0 | 所有受保护功能的前置条件。 | R1.2 |
| UAM-1.3 | 访问控制与数据隔离。 | P0 | 安全基石。 | R1.4 |
| UAM-1.4 | 邮箱验证机制（账户激活）。 | P2 | | R1.1 |
| UAM-1.5 | 密码管理（忘记密码重置、登录后修改密码）。 | P2 | | R1.3 |



--- (151-159 lines) ---
##### 模块七：用户设置与导出 (SET/EXP)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| EXP-7.1 | 一键按需导出项目成果（ZIP包，包含所有激活版本）。 | P2 | 最终交付功能。 | R6 |
| SET-7.2 | 界面设置（语言、主题选择）。 | P2 | 提升用户体验。 | R7.2 |
| SET-7.3 | 工作流引擎配置 (BYOK)（LLM Provider, E2B API Key）。 | P2 | 支持用户自定义引擎。 | R7.3 |
| SET-7.4 | HITL 行为配置（用户等级/Profile）与思考深度配置。 | P3 | 高级配置。 | R7.4, R7.5 |



--- (249-254 lines) ---
##### 1\. 用户 (User)

代表一个认证的系统使用者。

  * `id` (Integer), `email` (EmailStr), `display_name` (String), `is_active` (Boolean), `is_verified` (Boolean).



--- (255-266 lines) ---
##### 2\. 用户设置 (UserSettings)

存储用户的个性化配置和外部服务凭证 (BYOK) 状态。与用户一对一关联。

  * `user_id` (Integer).
  * **界面配置:** `language` (Enum: "en", "zh"), `theme` (Enum: "light", "dark").
  * **AI 行为配置:** `hitl_profile` (Enum: "Novice", "Experienced", "Expert"), `thinking_depth` (Enum: "Instant", "Medium", "Heavy").
  * **BYOK 配置 (前端视图):**
      * `llm_model_name` (String | Null), `llm_base_url` (String | Null).
      * `has_llm_api_key` (Boolean): 指示服务器端是否已存储密钥。
      * `has_e2b_api_key` (Boolean): 指示服务器端是否已存储密钥。



--- (493-499 lines) ---
**L2.3: 用户设置中心 (User Settings Center)**
用户配置个人偏好和工作流引擎参数的区域。

  * **路由:** `/settings`
  * **布局结构:** 采用标准的设置面板布局（侧边栏导航+内容区）。
  * **核心模块:** 账户设置、界面设置（主题/语言）、工作流引擎（BYOK）、AI 行为（HITL Profile/Depth）。



--- (656-661 lines) ---
**3\. 数据输入与表单 (Data Input and Forms)**

*   **管理与验证:** 使用 `React Hook Form` 结合 `Zod` 进行管理。
*   **布局与反馈:** 标签位于输入框上方。采用即时内联验证 (Inline Validation)，错误信息直接显示在输入控件下方。
*   **BYOK 密钥输入:** 遵循“写后即忘”原则。使用 `type="password"`。根据 `has_api_key` 状态显示占位符（如“已设置，输入以覆盖”），绝不回显密钥。



--- (822-827 lines) ---
**2\. 上下文状态导航 (Contextual State Navigation - State Driven)**

*   **机制:** 基于客户端状态管理（`Zustand`）而非 URL 路由。
*   **用途:** 在工作流执行视图中切换焦点节点（回溯和审查）。
*   **行为:** 用户点击画布节点，更新 `selectedNodeId` 状态，检查器面板局部更新内容。URL 保持不变（或仅更新查询参数 `?node={id}`）。这使得导航极为快速和流畅。

