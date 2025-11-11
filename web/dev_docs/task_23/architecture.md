--- (95-95 lines) ---
│   │   │   ├── ProjectService.ts


--- (421-479 lines) ---
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


--- (595-608 lines) ---
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
