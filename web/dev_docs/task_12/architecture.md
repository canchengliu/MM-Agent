--- (50-62 lines) ---
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


--- (95-95 lines) ---
│   │   │   ├── ProjectService.ts


--- (231-278 lines) ---
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


--- (446-448 lines) ---
    if (data instanceof FormData) {
        delete headers['Content-Type'];
    }


--- (499-509 lines) ---
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


--- (614-614 lines) ---
             {children} {/* 这将渲染 ExecutionView 或 ConfigView */}
