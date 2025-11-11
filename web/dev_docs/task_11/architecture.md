--- (11-11 lines) ---
1.  **特性切片设计（FSD）启发式结构：** 按业务领域（Auth, Projects, Settings）组织 `app/` 目录，以促进封装。


--- (48-52 lines) ---
│   │   ├── /projects/           # 项目管理
│   │   │   ├── page.tsx         # L2.1: 项目仪表板（列表视图）
│   │   │   └── /[projectId]/    # L2.2: 项目工作区
│   │   │       ├── layout.tsx   # 工作区布局（画布 + 检查器外壳）
│   │   │       ├── page.tsx     # 工作区入口点（处理配置与执行视图）


--- (83-83 lines) ---
│   │   ├── StatusBadge.tsx


--- (95-95 lines) ---
│   │   │   ├── ProjectService.ts


--- (101-101 lines) ---
│   │   ├── ProjectsStore.ts


--- (231-253 lines) ---
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



--- (254-267 lines) ---
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


--- (486-498 lines) ---
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

