--- (31-31 lines) ---
| **表单与验证** | React Hook Form, Zod | 表单管理和数据验证。 |


--- (73-75 lines) ---
│   │   └── /settings/           # L2.3: 用户设置中心
│   │       ├── page.tsx
│   │       └── /tabs/


--- (92-103 lines) ---
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
