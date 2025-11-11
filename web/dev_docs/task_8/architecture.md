--- (26-26 lines) ---
| **UI 基础** | Shadcn/ui, Radix UI | 可访问、可定制的基础组件库。 |


--- (31-31 lines) ---
| **表单与验证** | React Hook Form, Zod | 表单管理和数据验证。 |


--- (42-45 lines) ---
│   ├── /(auth)/                 # 认证路由（分组）
│   │   ├── /login/page.tsx
│   │   ├── /register/page.tsx
│   │   └── /verify-email/page.tsx


--- (93-93 lines) ---
│   │   │   ├── AuthService.ts


--- (99-99 lines) ---
│   │   ├── AuthStore.ts


--- (130-183 lines) ---
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
