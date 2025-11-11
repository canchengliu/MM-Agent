--- (90-94 lines) ---
│   ├── /api/                    # REST API 集成层
│   │   ├── ApiClient.ts         # 基础 fetch 包装器，注入认证
│   │   ├── /services/           # API 服务定义 (REST)
│   │   │   ├── AuthService.ts
│   │   │   ├── UserService.ts


--- (98-100 lines) ---
│   ├── /store/                  # Zustand 状态管理
│   │   ├── AuthStore.ts
│   │   ├── SettingsStore.ts


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


--- (185-229 lines) ---
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


--- (481-483 lines) ---
#### 4.2 API 服务 (`core/api/services/`)

与 API 文档模块对应的服务（例如，`AuthService.ts`、`ProjectService.ts`、`WorkflowService.ts`）。
