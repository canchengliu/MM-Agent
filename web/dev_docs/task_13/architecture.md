--- (46-52 lines) ---
│   ├── /(dashboard)/            # 主应用路由（分组）
│   │   ├── layout.tsx           # 应用外壳（全局导航栏）
│   │   ├── /projects/           # 项目管理
│   │   │   ├── page.tsx         # L2.1: 项目仪表板（列表视图）
│   │   │   └── /[projectId]/    # L2.2: 项目工作区
│   │   │       ├── layout.tsx   # 工作区布局（画布 + 检查器外壳）
│   │   │       ├── page.tsx     # 工作区入口点（处理配置与执行视图）


--- (61-62 lines) ---
│   │   │       │   ├── /execution/        # L2.2.B: 工作流执行视图
│   │   │       │   │   └── ExecutionView.tsx


--- (281-283 lines) ---
##### 3.1.4 工作流存储 (`core/store/WorkflowStore.ts`) - 核心逻辑

最复杂的存储，管理活动工作流结构、节点状态以及与 WebSocket 事件的同步。


--- (293-302 lines) ---
interface WorkflowState {
  workflow: WorkflowInstanceRead | null;
  // 用于快速访问的规范化映射（WS 更新期间 O(1) 查找）
  nodes: Record<number, NodeInstanceRead>;
  isLoading: boolean;

  // 动作
  loadWorkflow: (workflowId: number) => Promise<void>;
  refreshWorkflow: () => Promise<void>;
  clearWorkflow: () => void;


--- (320-341 lines) ---
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


--- (514-555 lines) ---
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


--- (595-626 lines) ---
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
