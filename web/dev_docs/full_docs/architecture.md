## O-Award 建模平台：前端架构与代码框架设计

本文档概述了 O-Award 建模平台的全面前端架构和详细代码框架。它是基于提供的系统需求规范（SRS）、设计文档、后端 API 规范，并借鉴了 Deer-Flow 项目中确立的技术栈和模式而设计的。

### 1\. 概述与技术栈

#### 1.1 架构理念

该架构以核心体验愿景为指导：“赋能思想的精确执行”（Design Doc 1.3.1）。关键架构原则包括：

1.  **特性切片设计（FSD）启发式结构：** 按业务领域（Auth, Projects, Settings）组织 `app/` 目录，以促进封装。
2.  **严格关注点分离：** 清晰区分 UI 组件（`components/`, `app/`）、业务逻辑/状态（`core/`）和基础设施（`lib/`, `config/`）。
3.  **状态管理策略（REST + WebSocket）：** 使用 REST API 进行初始数据获取和突变。使用 WebSocket 进行实时更新。Zustand 作为客户端的单一事实来源，协调来自两种来源的数据。
4.  **用户主权（Design Doc 1.3.2）：** 架构必须支持明确的用户意图和“静默状态管理”（1.4），在不触发自动操作的情况下可视化数据陈旧性。

#### 1.2 核心技术栈

基于 Deer-Flow，并为 O-Award 平台的要求进行了特定添加。

| 区域 | 技术与库 | 在 O-Award 平台中的作用 |
| :--- | :--- | :--- |
| **框架** | Next.js (App Router), React 18+ | 核心应用框架、SSR/RSC、路由。 |
| **语言** | TypeScript | 类型安全和开发者体验。 |
| **状态管理** | Zustand | 集中式、模块化的全局状态管理。 |
| **样式与主题** | Tailwind CSS, `next-themes`, CSS Variables | 实现“精确未来主义”美学。 |
| **UI 基础** | Shadcn/ui, Radix UI | 可访问、可定制的基础组件库。 |
| **工作流可视化** | **React Flow (`@xyflow/react`)** | **（关键添加）** 工作流 DAG/流程图的可视化和交互。 |
| **富文本/LaTeX 编辑器** | Tiptap, Novel, ProseMirror, KaTeX | 用于报告和公式的手动编辑（R4）。 |
| **代码编辑器** | **Monaco Editor (或 CodeMirror)** | **（关键添加）** 平台内部用于工件编辑的代码编辑器。 |
| **动画与效果** | Framer Motion, Magic UI | 功能动画、过渡和视觉效果。 |
| **表单与验证** | React Hook Form, Zod | 表单管理和数据验证。 |
| **API 通信** | `fetch` (REST), WebSocket (原生) | 与后端服务的通信。 |
| **图标** | Lucide React | 主要图标集。 |

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

### 3\. 状态管理架构 (Zustand)

我们采用 Zustand 的多存储方法来管理复杂的应用状态域。

#### 3.1 存储定义

##### 3.1.1 认证存储 (`core/store/AuthStore.ts`)

管理用户会话和 JWT 令牌生命周期，使用 `persist` 中间件进行令牌存储。

```typescript
// core/store/AuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '../api/services/AuthService';
import { UserRead } from '../api/types';

interface AuthState {
  token: string | null;
  user: UserRead | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // 动作
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  initialize: () => Promise<void>; // 在应用加载时验证令牌
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... 初始状态
      login: async (email, password) => {
        try {
          const tokenData = await AuthService.login(email, password);
          set({ token: tokenData.access_token, isAuthenticated: true });
          // 登录后，获取用户资料
          const user = await UserService.getProfile();
          set({ user });
          return true;
        } catch (error) {
          // 处理 401/403 错误
          return false;
        }
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
      initialize: async () => {
        // 使用 GET /users/me 验证现有令牌的逻辑
      }
    }),
    {
      name: 'o-award-auth',
      getStorage: () => sessionStorage, // 推荐的存储方式（API Doc 1）
    }
  )
);
```

##### 3.1.2 设置存储 (`core/store/SettingsStore.ts`)

管理用户偏好（UI、BYOK、AI 行为）（API Doc 2）。

```typescript
// core/store/SettingsStore.ts
import { create } from 'zustand';
import { UserService } from '../api/services/UserService';
import { UserSettingsRead, UserSettingsUpdate } from '../api/types';

interface SettingsState {
  settings: UserSettingsRead;
  isLoading: boolean;

  // 动作
  fetchSettings: () => Promise<void>;
  updateSettings: (changes: UserSettingsUpdate) => Promise<void>;
}

const defaultSettings: UserSettingsRead = {
    theme: 'dark', // 默认深色模式 (Design Doc 4.1.1)
    // ... 其他默认值
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  isLoading: false,

  fetchSettings: async () => {
    // 使用 UserService.getSettings() 的实现
  },

  updateSettings: async (changes) => {
    // 乐观更新并与后端响应同步
    set((state) => ({ settings: { ...state.settings, ...changes } }));
    try {
      const updatedSettings = await UserService.updateSettings(changes);
      // 确保同步（尤其是 BYOK 的 has_key 标志）
      set({ settings: updatedSettings });
    } catch (error) {
      // 如有必要，处理回滚
    }
  },
}));
```

##### 3.1.3 项目存储 (`core/store/ProjectsStore.ts`)

管理项目列表和活动项目配置的生命周期。

```typescript
// core/store/ProjectsStore.ts
import { create } from 'zustand';
import { ProjectService } from '../api/services/ProjectService';
import { ProjectSummaryRead, ProjectDetailRead } from '../api/types';

interface ProjectsState {
  projects: ProjectSummaryRead[];
  activeProject: ProjectDetailRead | null;
  isLoadingList: boolean;

  // 动作
  fetchProjects: () => Promise<void>;
  loadActiveProject: (id: number) => Promise<void>;
  createProject: (data: ProjectCreate) => Promise<ProjectDetailRead>;
  startWorkflow: (projectId: number) => Promise<void>;
  // ... (update, delete, uploadFile actions)
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  // ... 初始状态
  fetchProjects: async () => {
    // 使用 ProjectService.list() 的实现
  },

  loadActiveProject: async (id) => {
    try {
      const project = await ProjectService.getDetail(id);
      set({ activeProject: project });
    } catch (error) {
      // 处理 404 或 403
    }
  },

  startWorkflow: async (projectId: number) => {
    // 使用 ProjectService.startWorkflow() 的实现
    // 成功后（202），在本地更新 activeProject 状态
    const firstNode = await ProjectService.startWorkflow(projectId);
    set((state) => ({
        activeProject: state.activeProject ? { ...state.activeProject, status: 'Running', workflow_instance_id: firstNode.workflow_instance_id } : null
    }));
    // 随后应该初始化 WorkflowStore。
  },
}));
```

##### 3.1.4 工作流存储 (`core/store/WorkflowStore.ts`) - 核心逻辑

最复杂的存储，管理活动工作流结构、节点状态以及与 WebSocket 事件的同步。

```typescript
// core/store/WorkflowStore.ts
import { create } from 'zustand';
import { produce } from 'immer'; // 对于嵌套结构的不可变更新至关重要
import { WorkflowService } from '../api/services/WorkflowService';
import { NodeService } from '../api/services/NodeService';
import { WorkflowInstanceRead, NodeInstanceRead, PhaseRead } from '../api/types';

interface WorkflowState {
  workflow: WorkflowInstanceRead | null;
  // 用于快速访问的规范化映射（WS 更新期间 O(1) 查找）
  nodes: Record<number, NodeInstanceRead>;
  isLoading: boolean;

  // 动作
  loadWorkflow: (workflowId: number) => Promise<void>;
  refreshWorkflow: () => Promise<void>;
  clearWorkflow: () => void;

  // 执行和 HITL 动作（代理到 NodeService）
  reExecuteNode: (nodeId: number, req: ExecutionRequest) => Promise<void>;
  submitHITL: (nodeId: number, submission: HITLSubmission) => Promise<HITLResponse>;

  // WebSocket 事件处理程序（内部）
  _processNodeUpdate: (nodeData: NodeInstanceRead) => void;
  _processStructureUpdate: (workflowData: WorkflowInstanceRead) => void;
}

// 规范化工作流的辅助函数
const normalizeWorkflow = (workflow: WorkflowInstanceRead) => {
  const nodes: Record<number, NodeInstanceRead> = {};
  // 将 phases -> stages -> nodes 展平到 nodes 映射中的逻辑
  return { nodes, phases: workflow.phases };
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflow: null,
  nodes: {},
  isLoading: false,

  loadWorkflow: async (workflowId) => {
    set({ isLoading: true });
    try {
      const workflowData = await WorkflowService.getDetail(workflowId);
      const { nodes } = normalizeWorkflow(workflowData);
      set({ workflow: workflowData, nodes, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  refreshWorkflow: async () => {
    const workflowId = get().workflow?.id;
    if (workflowId) {
      await get().loadWorkflow(workflowId);
    }
  },

  // ... 执行和 HITL 动作实现 (调用 NodeService)

  // --- WebSocket 处理程序 ---

  _processNodeUpdate: (nodeData) => {
    set(produce((state: WorkflowState) => {
      // 更新规范化映射
      state.nodes[nodeData.id] = nodeData;

      // 更新层级结构 (Immer 处理不可变性)
      if (state.workflow) {
        // 在 state.workflow.phases 中查找并更新节点的逻辑
        // (需要详细实现来遍历层级结构)
      }
    }));
  },

  _processStructureUpdate: (workflowData) => {
    // 需要完全替换（Generator 节点已完成）
    const { nodes } = normalizeWorkflow(workflowData);
    set({ workflow: workflowData, nodes });
    // 重要：如果结构发生重大变化，可能需要清除 InspectorStore 缓存。
  },
}));
```

##### 3.1.5 检查器存储 (`core/store/InspectorStore.ts`)

管理检查器面板的 UI 状态，与核心工作流数据解耦。

```typescript
// core/store/InspectorStore.ts
import { create } from 'zustand';
import { NodeService } from '../api/services/NodeService';
import { NodeDetailView, NodeVersionRead } from '../api/types';

interface InspectorState {
  selectedNodeId: number | null;
  activeTab: 'results' | 'history' | 'dependencies';
  isPanelOpen: boolean;
  isEditing: boolean; // 手动编辑模式（R4）

  // 选定节点的缓存数据
  details: NodeDetailView | null;
  versionHistory: NodeVersionRead[] | null;
  isLoadingDetails: boolean;

  // 动作
  selectNode: (nodeId: number) => Promise<void>;
  clearSelection: () => void;
  // ... 其他 UI 状态动作 (setActiveTab, togglePanel, enterEditMode)
}

export const useInspectorStore = create<InspectorState>((set, get) => ({
  // ... 初始状态

  selectNode: async (nodeId) => {
    set({ selectedNodeId: nodeId, isPanelOpen: true, isLoadingDetails: true, details: null, versionHistory: null });
    try {
      // 并行获取详情（API 5.1.1）和版本（API 5.1.2）
      const [details, versions] = await Promise.all([
        NodeService.getDetail(nodeId),
        NodeService.getVersions(nodeId),
      ]);
      set({ details, versionHistory: versions, isLoadingDetails: false });
    } catch (error) {
      // 处理错误（例如，如果超出执行前沿，出现 403 Forbidden R5.2）
      set({ isLoadingDetails: false });
    }
  },
  // ...
}));
```

### 4\. API 集成层

该层处理与后端的通信，包括 REST API 调用和 WebSocket 连接。

#### 4.1 REST API 客户端 (`core/api/ApiClient.ts`)

围绕 `fetch` 的集中式包装器，用于处理认证头、基本 URL 解析和错误处理。

```typescript
// core/api/ApiClient.ts
import { useAuthStore } from '../store/AuthStore';
import { resolveServiceURL } from './utils'; // 解析基本 URL 的辅助函数

// 主 API 客户端函数
export const apiClient = {
  async request<T>(method: string, endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const url = resolveServiceURL(endpoint);
    const token = useAuthStore.getState().token;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 专门处理 FormData (例如, 文件上传)
    if (data instanceof FormData) {
        delete headers['Content-Type'];
    }

    const config: RequestInit = {
      method,
      headers,
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      // 集中式错误处理
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));

      // 全局处理 401 Unauthorized（API Doc 1.1）
      if (response.status === 401) {
        useAuthStore.getState().logout();
      }
      throw new ApiError(response.status, errorData);
    }

    // 处理 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  },
  // 方便方法 (get, post, patch, delete)
};
```

#### 4.2 API 服务 (`core/api/services/`)

与 API 文档模块对应的服务（例如，`AuthService.ts`、`ProjectService.ts`、`WorkflowService.ts`）。

```typescript
// core/api/services/ProjectService.ts
import { apiClient } from '../ApiClient';
// ... 类型

export const ProjectService = {
  list: async (skip: number, limit: number): Promise<PaginatedResponse<ProjectSummaryRead>> => {
    return apiClient.request('GET', `/projects/?skip=${skip}&limit=${limit}`);
  },

  create: async (data: ProjectCreate): Promise<ProjectDetailRead> => {
    return apiClient.request('POST', '/projects/', data);
  },

  uploadFile: async (projectId: number, file: File, role: string): Promise<ProjectFileRead> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);
    return apiClient.request('POST', `/projects/${projectId}/files`, formData);
  },

  startWorkflow: async (projectId: number): Promise<NodeInstanceRead> => {
    // API Doc 3.3.1
    return apiClient.request('POST', `/projects/${projectId}/start`);
  },
  // ... 其他端点
};
```

#### 4.3 WebSocket 管理 (`core/websocket/`)

对于实时更新至关重要（API Doc 6）。

##### 4.3.1 `WebSocketManager.ts`

一个负责连接生命周期的单例服务。

```typescript
// core/websocket/WebSocketManager.ts
import { useAuthStore } from '../store/AuthStore';
import { useWorkflowStore } from '../store/WorkflowStore';
import { handleEvent } from './EventHandler';

class WebSocketManager {
  // ... 私有字段 (ws, workflowId, reconnectAttempts)

  connect(workflowId: number) {
    // ... 连接设置逻辑 ...
    const token = useAuthStore.getState().token;
    const url = `ws://.../ws/${workflowId}?token=${token}`; // API Doc 6.2
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      // 关键：在（重）连接时同步状态（API Doc 6.1.3）
      useWorkflowStore.getState().refreshWorkflow();
    };

    this.ws.onmessage = (message) => {
      const payload = JSON.parse(message.data);
      handleEvent(payload);
    };

    this.ws.onclose = (event) => {
      // 处理特定的关闭代码（API Doc 6.3.2）和重连逻辑
    };
  }
  // ... 断开连接和重连方法
}

export const webSocketManager = new WebSocketManager();
```

##### 4.3.2 `EventHandler.ts`

将传入事件路由到适当的存储动作。

```typescript
// core/websocket/EventHandler.ts
import { useWorkflowStore } from '../store/WorkflowStore';
import { EventPayload, EventType } from './types';

export const handleEvent = (payload: EventPayload) => {
  const store = useWorkflowStore.getState();

  // 确保事件针对当前加载的工作流
  if (payload.workflow_id !== store.workflow?.id) {
    return;
  }

  switch (payload.event_type) {
    case EventType.NODE_STATUS_UPDATED:
      store._processNodeUpdate(payload.data);
      break;
    case EventType.WORKFLOW_STRUCTURE_UPDATED:
      store._processStructureUpdate(payload.data);
      break;
    case EventType.NODE_ACTIVE_VERSION_CHANGED:
      // 此事件表示下游可能存在陈旧性。
      // 触发完全刷新以获取更新的 'is_stale' 标志 (Design Doc 5.2)。
      store.refreshWorkflow();
      break;
    // ... 其他事件
  }
};
```

### 5\. 组件架构和关键视图

#### 5.1 布局 (Next.js)

##### 5.1.1 工作区布局 (`app/(dashboard)/projects/[projectId]/layout.tsx`)

沉浸式工作区布局（Design Doc 3.2.1.2 模板二）。

```tsx
// app/(dashboard)/projects/[projectId]/layout.tsx
import { ProjectControlBar } from './components/ProjectControlBar';
import { InspectorPanel } from './components/inspector/InspectorPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";

export default function WorkspaceLayout({ children }) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <ProjectControlBar />
      <div className="flex-1 overflow-hidden">
        {/* 画布 + 检查器布局，使用 Shadcn Resizable */}
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* 画布区域（主内容 - children） */}
          <ResizablePanel defaultSize={70} minSize={40}>
             {children} {/* 这将渲染 ExecutionView 或 ConfigView */}
          </ResizablePanel>
          <ResizableHandle withHandle />
          {/* 检查器面板 */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50} className="bg-card border-l">
            <InspectorPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
```

#### 5.2 工作流可视化 (React Flow 集成)

##### 5.2.1 `WorkflowCanvas.tsx`

React Flow 的主容器。

  * **职责：**
      * 订阅 `WorkflowStore.phases`。
      * 使用 `LayoutUtils.ts` 将 `phases` 数据转换为 React Flow 的 `nodes` 和 `edges`。
      * 应用布局算法（例如，Dagre 或自定义网格）。
      * 处理 `onNodeClick` 以更新 `InspectorStore.selectedNodeId`。
      * 管理可视化设置（缩放、平移、小地图）。

<!-- end list -->

```tsx
// app/(dashboard)/projects/[projectId]/components/canvas/WorkflowCanvas.tsx
"use client";
import ReactFlow, { Background, Controls, MiniMap } from '@xyflow/react';
import { useWorkflowStore } from '~/core/store/WorkflowStore';
import { useInspectorStore } from '~/core/store/InspectorStore';
import { calculateLayout } from './LayoutUtils';
import { CustomNode } from './CustomNode';

const nodeTypes = { custom: CustomNode };

export const WorkflowCanvas = () => {
  const phases = useWorkflowStore(state => state.workflow?.phases || []);
  const selectNode = useInspectorStore(state => state.selectNode);

  // 当 phases 改变时计算布局
  const { nodes, edges } = useMemo(() => {
    return calculateLayout(phases);
  }, [phases]);

  const onNodeClick = (event, node) => {
    selectNode(parseInt(node.id));
  };

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background variant="dots" gap={12} size={1} className="bg-background" />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
```

##### 5.2.2 `CustomNode.tsx`

节点的视觉表示（Design Doc 5.1.2.1）。

```tsx
// app/(dashboard)/projects/[projectId]/components/canvas/CustomNode.tsx
import { Handle, Position } from '@xyflow/react';
import { Card } from '~/components/ui/card';
import { StatusBadge } from '~/components/platform/StatusBadge';
import { StalenessIndicator } from '~/components/platform/StalenessIndicator';
import { BorderBeam } from '~/components/magicui/border-beam'; // Magic UI 集成

export const CustomNode = ({ data, selected }) => {
  const isExecuting = data.status === 'Executing';

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className={cn(
        "w-[250px] p-3 shadow-md transition-all duration-200 relative",
        selected && "border-primary ring-2 ring-ring" // 选中样式
      )}>
        {/* Executing 状态的动态 BorderBeam (Design Doc 5.1.2.1) */}
        {isExecuting && (
            <BorderBeam size={200} duration={5} delay={0} />
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{data.name}</span>
            <span className="text-xs text-muted-foreground font-mono">{data.definition_id}</span>
          </div>
          <StatusBadge status={data.status} />
        </div>

        {/* 陈旧性指示器 (Design Doc 5.1.2.1) */}
        {data.is_stale && <StalenessIndicator />}
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};
```

#### 5.3 检查器面板 (`InspectorPanel.tsx`)

  * **职责：**
      * 订阅 `InspectorStore` 获取 `selectedNodeDetails`。
      * 渲染带标签页的界面（结果、历史记录、依赖关系）。

##### 5.3.1 `ResultsTab.tsx`

根据节点状态动态切换内容。

```tsx
// app/(dashboard)/projects/[projectId]/components/inspector/tabs/ResultsTab.tsx
import { Alert } from "~/components/ui/alert";
import { HITLContainer } from '../hitl/HITLContainer';
// ... 其他视图 (CompletedView, ExecutingView, FailedView)

export const ResultsTab = ({ node }) => {
  // 1. 如果存在，显示陈旧性警告 (Design Doc 3.1.2.3)
  if (node.is_stale && node.staleness_report) {
    // 渲染 Alert 组件
  }

  // 2. 根据状态切换视图
  switch (node.status) {
    case 'Awaiting HITL Approval':
      return <HITLContainer node={node} pendingResult={node.pending_result} />;
    case 'Completed':
      return <CompletedView node={node} activeVersion={node.active_version} />;
    // ... 其他情况
  }
};
```

#### 5.4 HITL 实现 (`HITLContainer.tsx` 和专业接口)

`HITLContainer` 充当工厂，根据 `hitl_mode` 加载相应的接口（`SCAInterface`、`AVLInterface`）。

##### 5.4.1 `SCAInterface.tsx` (示例)

战略选择架构的实现（Design Doc 5.1.3.1）。

```tsx
// app/(dashboard)/projects/[projectId]/components/inspector/hitl/SCAInterface.tsx
"use client";
import { useState } from 'react';
import { useWorkflowStore } from '~/core/store/WorkflowStore';
import { RadioGroup } from "~/components/ui/radio-group";
import { ShineBorder } from '~/components/magicui/shine-border'; // Magic UI 集成

export const SCAInterface = ({ node, data }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { submitHITL } = useWorkflowStore();

  const handleApprove = async () => {
    if (!selectedId) return;
    await submitHITL(node.id, {
        action: 'Continue',
        interaction_data: { selected_ids: [selectedId] },
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 内容区域 (可滚动) */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 比较分析 (Markdown) */}
        {/* 候选选择 (RadioGroup) */}
        <RadioGroup onValueChange={setSelectedId} value={selectedId ?? undefined}>
          {data.candidates.map(candidate => (
            <div key={candidate.id} className="relative mb-4">
                {/* 选中时应用 ShineBorder (Design Doc 5.1.3.1) */}
                {selectedId === candidate.id && <ShineBorder />}
                {/* 候选卡片 */}
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* HITL 操作栏 (固定页脚) */}
      <div className="p-4 border-t bg-card flex justify-end gap-4">
        {/* 丢弃、拒绝、批准按钮 */}
      </div>
    </div>
  );
};
```

#### 5.5 手动编辑 (Tiptap/Novel 集成)

当用户在 `ResultsTab` 中点击“编辑”（当状态为 `Completed` 时），视图切换到编辑器。

##### 5.5.1 编辑器切换逻辑（在 `ResultsTab.tsx` 或专门的控制器中）

```tsx
// 在 ResultsTab.tsx 中 (CompletedView 组件)
import { useInspectorStore } from '~/core/store/InspectorStore';
import { PlatformEditor } from '~/components/platform/editor/PlatformEditor';

const CompletedView = ({ node, activeVersion }) => {
  const { isEditing, enterEditMode } = useInspectorStore();
  const { submitManualEdit } = useWorkflowStore();

  const handleSave = async (editedContent, summary) => {
    await submitManualEdit(node.id, {
        base_version_id: activeVersion.id,
        edited_output_data: editedContent,
        summary
    });
    useInspectorStore.getState().exitEditMode();
  };

  if (isEditing) {
    return <PlatformEditor initialContent={activeVersion.output_data} onSave={handleSave} onCancel={useInspectorStore.getState().exitEditMode} />;
  }

  return (
    <div>
      <Button onClick={enterEditMode}>手动编辑</Button>
      {/* 工件渲染器 (Markdown/代码查看器) */}
    </div>
  );
};
```

### 6\. 样式和设计系统实现

#### 6.1 主题和令牌

“精确未来主义”的实现（Design Doc 4.1）。

  * **`styles/globals.css`：** 定义 Design Doc 4.1.1.3 中指定的亮色和深色模式的 CSS 变量。
  * **`tailwind.config.js`：** 将这些变量映射到 Tailwind 工具类。配置 Geist 字体 (4.1.2.1) 和基本圆角半径 (6px, 4.1.4.2)。
  * **`next-themes`：** 在根布局中配置 `defaultTheme="dark"`。

#### 6.2 动态系统 (Framer Motion)

功能动态设计的实现（Design Doc 4.2）。

  * **`styles/motion-tokens.ts`：** 持续时间和缓动函数的集中式常量 (4.2.2.3)。
  * **用法：**
      * `InspectorPanel` 中的 `AnimatePresence`，用于在选择节点时平滑内容切换 (5.2.4)。
      * `WorkflowCanvas` 中的 `layout` 动画，用于结构更新时平滑重新定位 (5.2.2)。
      * 动态出现新节点时的交错动画。

该架构为 O-Award 建模平台前端提供了一个详细、可扩展且健壮的框架，确保与所有指定要求和设计原则保持一致。