--- (249-254 lines) ---
##### 1\. 用户 (User)

代表一个认证的系统使用者。

  * `id` (Integer), `email` (EmailStr), `display_name` (String), `is_active` (Boolean), `is_verified` (Boolean).



--- (432-445 lines) ---
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



--- (493-498 lines) ---
**L2.3: 用户设置中心 (User Settings Center)**
用户配置个人偏好和工作流引擎参数的区域。

  * **路由:** `/settings`
  * **布局结构:** 采用标准的设置面板布局（侧边栏导航+内容区）。
  * **核心模块:** 账户设置、界面设置（主题/语言）、工作流引擎（BYOK）、AI 行为（HITL Profile/Depth）。


--- (746-752 lines) ---
**2\. WebSocket 实时通信管理**

*   **连接状态指示器:** 在全局导航栏中显示 WebSocket 连接状态。
*   **断线与重连:**
    *   连接中断时，在屏幕顶部显示全局横幅 (Global Banner)：“实时更新已中断，正在尝试重连...”。
    *   重连成功后，横幅消失，并立即触发一次全局状态同步。



--- (782-795 lines) ---
#### 3.2.1.1 基础布局框架 (Base Layout Framework)

**1\. 栅格系统与响应式策略 (Grid System and Responsiveness)**

*   **技术基础:** `Tailwind CSS` Flexbox 和 Grid 布局。
*   **设计策略:** **Desktop-First**。优先保证在大屏幕上的高信息密度和操作效率。`lg` (1024px) 是支持完整功能体验的最小推荐尺寸。
*   **栅格系统:** 标准 12 列栅格系统。

**2\. 应用外壳 (Application Shell)**

全局容器，提供持久化的导航。采用全屏高度布局 (`h-screen flex`)。

*   **全局导航栏 (Global Navbar):** 固定在顶部或左侧。包含 Logo、主导航链接（项目）、用户控制区（设置、账户、WebSocket 状态）。



--- (817-821 lines) ---
**1\. 全局路由导航 (Global Routing Navigation - URL Driven)**

*   **机制:** 基于 URL 路由 (`Next.js App Router`)。
*   **用途:** 在 L2 主要视图区域之间切换（项目列表 \<-\> 工作区 \<-\> 设置）。



--- (1289-1289 lines) ---
  * **毛玻璃效果 (Backdrop Blur):** 用于模态框的背景遮罩 (`backdrop-blur-sm`)，以及导航栏或工具栏的背景，营造空间感。
