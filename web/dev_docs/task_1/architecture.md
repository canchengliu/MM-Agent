--- (11-12 lines) ---
1.  **特性切片设计（FSD）启发式结构：** 按业务领域（Auth, Projects, Settings）组织 `app/` 目录，以促进封装。
2.  **严格关注点分离：** 清晰区分 UI 组件（`components/`, `app/`）、业务逻辑/状态（`core/`）和基础设施（`lib/`, `config/`）。


--- (24-24 lines) ---
| **状态管理** | Zustand | 集中式、模块化的全局状态管理。 |


--- (26-26 lines) ---
| **UI 基础** | Shadcn/ui, Radix UI | 可访问、可定制的基础组件库。 |


--- (29-29 lines) ---
| **代码编辑器** | **Monaco Editor (或 CodeMirror)** | **（关键添加）** 平台内部用于工件编辑的代码编辑器。 |


--- (35-122 lines) ---
### 2\. 项目结构（文件树）

项目结构遵循 Next.js App Router 约定，按特性域组织，并清晰分离关注点。

```plaintext
/src
├── /app/                        # Next.js App Router - 特性切片
│   ├── /(auth)/                 # 认证路由（分组）
│   │   ├── /login/page.tsx
│   │   ├── /register/page.tsx
│   │   └── /verify-email/page.tsx
│   ├── /(dashboard)/            # 主应用路由（分组）
│   │   ├── layout.tsx           # 应用外壳（全局导航栏）
│   │   ├── /projects/           # 项目管理
│   │   │   ├── page.tsx         # L2.1: 项目仪表板（列表视图）
│   │   │   └── /[projectId]/    # L2.2: 项目工作区
│   │   │       ├── layout.tsx   # 工作区布局（画布 + 检查器外壳）
│   │   │       ├── page.tsx     # 工作区入口点（处理配置与执行视图）
│   │   │       ├── /components/ # 工作区特定组件
│   │   │       │   ├── /canvas/           # React Flow 实现
│   │   │       │   │   ├── WorkflowCanvas.tsx
│   │   │       │   │   ├── CustomNode.tsx
│   │   │       │   │   └── LayoutUtils.ts
│   │   │       │   ├── /configuration/    # L2.2.A: 项目配置视图
│   │   │       │   │   ├── ConfigurationView.tsx
│   │   │       │   │   └── FileUploader.tsx
│   │   │       │   ├── /execution/        # L2.2.B: 工作流执行视图
│   │   │       │   │   └── ExecutionView.tsx
│   │   │       │   └── /inspector/        # L2.2.B.3: 节点检查器面板
│   │   │       │       ├── InspectorPanel.tsx
│   │   │       │       ├── /tabs/
│   │   │       │       │   ├── ResultsTab.tsx
│   │   │       │       │   ├── HistoryTab.tsx
│   │   │       │       │   └── DependenciesTab.tsx
│   │   │       │       └── /hitl/
│   │   │       │           ├── HITLContainer.tsx
│   │   │       │           ├── SCAInterface.tsx # 战略选择架构接口
│   │   │       │           └── AVLInterface.tsx # 辅助验证与学习接口
│   │   └── /settings/           # L2.3: 用户设置中心
│   │       ├── page.tsx
│   │       └── /tabs/
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 应用入口点（重定向到 /projects）
│
├── /components/                 # 可重用 UI 组件（分层）
│   ├── /ui/                     # 基础 UI 原语 (Shadcn/ui)
│   ├── /platform/               # 应用特定共享组件
│   │   ├── GlobalNavbar.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── StalenessIndicator.tsx
│   │   ├── /editor/             # Tiptap/Novel 封装
│   │   └── /code-editor/        # Monaco/CodeMirror 包装器
│   ├── /magicui/                # 视觉效果组件 (例如, BorderBeam)
│
├── /core/                       # 核心业务逻辑和基础设施（UI 无关）
│   ├── /api/                    # REST API 集成层
│   │   ├── ApiClient.ts         # 基础 fetch 包装器，注入认证
│   │   ├── /services/           # API 服务定义 (REST)
│   │   │   ├── AuthService.ts
│   │   │   ├── UserService.ts
│   │   │   ├── ProjectService.ts
│   │   │   └── WorkflowService.ts (包含 NodeService 函数)
│   │   └── /types/              # API 请求/响应类型
│   ├── /store/                  # Zustand 状态管理
│   │   ├── AuthStore.ts
│   │   ├── SettingsStore.ts
│   │   ├── ProjectsStore.ts
│   │   ├── WorkflowStore.ts     # 核心工作流状态（阶段、节点、版本）
│   │   └── InspectorStore.ts    # 检查器面板的 UI 状态（选择、标签页）
│   ├── /websocket/              # WebSocket 管理
│   │   ├── WebSocketManager.ts  # 连接管理器（认证、重连逻辑）
│   │   └── EventHandler.ts      # 调度 WS 事件到 Zustand 存储的逻辑
│   ├── /utils/                  # 工具函数
│
├── /hooks/                      # 自定义 React Hook
│   ├── useAuth.ts
│   ├── useExecutionControl.ts
│   └── useVersionControl.ts
│
├── /lib/                        # 库集成和配置
│   ├── utils.ts                 # 共享工具 (例如, `cn`)
│
├── /styles/                     # 全局样式和设计令牌
│   ├── globals.css              # Tailwind 设置和 CSS 变量 (4.1.1.3)
│   ├── motion-tokens.ts         # Framer Motion 参数 (4.2.2.3)
│
└── /messages/                   # i18n 翻译文件
```
