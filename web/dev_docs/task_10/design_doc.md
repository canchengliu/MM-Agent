--- (156-158 lines) ---
| SET-7.2 | 界面设置（语言、主题选择）。 | P2 | 提升用户体验。 | R7.2 |
| SET-7.3 | 工作流引擎配置 (BYOK)（LLM Provider, E2B API Key）。 | P2 | 支持用户自定义引擎。 | R7.3 |
| SET-7.4 | HITL 行为配置（用户等级/Profile）与思考深度配置。 | P3 | 高级配置。 | R7.4, R7.5 |


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



--- (442-442 lines) ---
      * 用户控制区：用户头像、设置 (Settings) 链接（指向 L2.3）、登出。


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



--- (800-802 lines) ---
*   **适用场景:** L2.1 项目仪表板、L2.3 用户设置中心。
*   **结构:** 经典的 Web 应用布局。内容区域通常有最大宽度限制并居中。包含页面头部和主内容区（列表、表格或表单）。



--- (1442-1448 lines) ---
##### 2\. 输入控件 (Input, Textarea, Select)

  * **视觉属性:** 圆角 `rounded-md` (6px)。边框 `--input`。
  * **交互状态:**
      * `Focus`: 边框颜色变为 `--primary`（可选），并显示焦点环 (`--ring`)。
      * `Error`: 边框颜色变为 `--destructive`。

