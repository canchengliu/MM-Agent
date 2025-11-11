--- (89-108 lines) ---
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


--- (231-279 lines) ---
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


--- (481-512 lines) ---
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
