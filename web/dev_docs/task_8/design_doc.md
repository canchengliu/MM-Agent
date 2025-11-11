--- (78-87 lines) ---
##### 模块一：用户认证与账户管理 (UAM)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| UAM-1.1 | 用户注册（邮箱、密码、显示名）。 | P0 | 基础功能。 | R1.1 |
| UAM-1.2 | 安全用户认证（登录/登出，JWT Token 管理）。 | P0 | 所有受保护功能的前置条件。 | R1.2 |
| UAM-1.3 | 访问控制与数据隔离。 | P0 | 安全基石。 | R1.4 |
| UAM-1.4 | 邮箱验证机制（账户激活）。 | P2 | | R1.1 |
| UAM-1.5 | 密码管理（忘记密码重置、登录后修改密码）。 | P2 | | R1.3 |



--- (249-254 lines) ---
##### 1\. 用户 (User)

代表一个认证的系统使用者。

  * `id` (Integer), `email` (EmailStr), `display_name` (String), `is_active` (Boolean), `is_verified` (Boolean).



--- (647-661 lines) ---
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



--- (765-775 lines) ---

定义不同类型反馈的呈现方式和视觉层级。

| 层级 | 类型 | 呈现方式 | 模态性 | 组件示例 | 用途场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L1** | 内联反馈 (Inline) | 文本、图标、输入框样式 | 非阻塞 | `FormHelperText`, Icon | 表单验证错误、字段级状态。 |
| **L2** | 轻量通知 (Toast) | 短暂出现的通知框 | 非阻塞，自动消失 | `Sonner` Toast | 操作成功确认（“保存成功”）；非关键错误。 |
| **L3** | 上下文警示 (Contextual Alert) | 嵌入式警报框、横幅 | 非阻塞，持久显示 | `Shadcn Alert`, Global Banner | 陈旧性警告（Alert）；WebSocket 断连（Banner）。 |
| **L4** | 模态确认与输入 (Modal Interaction) | 对话框 | 阻塞 | `Shadcn AlertDialog`, `Dialog` | 破坏性操作二次确认；输入必要信息（如版本摘要）。 |
| **L5** | 错误页面 (Error Page) | 全屏视图 | 阻塞 | Custom Error Page | 系统崩溃、严重权限错误。 |



--- (1011-1015 lines) ---
**3\. 错误信息 (Error Messages)**

*   **范式:** 发生了什么 + 为什么发生 + 如何解决。
*   **示例:** `Execution Failed. The Python script encountered an error at line 42. Please review the execution log for details and Retry.`



--- (1038-1133 lines) ---
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



--- (1268-1282 lines) ---
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



--- (1432-1448 lines) ---
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

