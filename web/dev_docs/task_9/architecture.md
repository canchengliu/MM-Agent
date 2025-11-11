--- (46-47 lines) ---
│   ├── /(dashboard)/            # 主应用路由（分组）
│   │   ├── layout.tsx           # 应用外壳（全局导航栏）


--- (81-82 lines) ---
│   ├── /platform/               # 应用特定共享组件
│   │   ├── GlobalNavbar.tsx


--- (109-110 lines) ---
├── /hooks/                      # 自定义 React Hook
│   ├── useAuth.ts


--- (130-132 lines) ---
##### 3.1.1 认证存储 (`core/store/AuthStore.ts`)

管理用户会话和 JWT 令牌生命周期，使用 `persist` 中间件进行令牌存储。


--- (141-151 lines) ---
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


--- (170-175 lines) ---
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
      initialize: async () => {
        // 使用 GET /users/me 验证现有令牌的逻辑
      }


--- (514-516 lines) ---
#### 4.3 WebSocket 管理 (`core/websocket/`)

对于实时更新至关重要（API Doc 6）。


--- (518-520 lines) ---
##### 4.3.1 `WebSocketManager.ts`

一个负责连接生命周期的单例服务。


--- (537-540 lines) ---
    this.ws.onopen = () => {
      // 关键：在（重）连接时同步状态（API Doc 6.1.3）
      useWorkflowStore.getState().refreshWorkflow();
    };


--- (547-549 lines) ---
    this.ws.onclose = (event) => {
      // 处理特定的关闭代码（API Doc 6.3.2）和重连逻辑
    };
