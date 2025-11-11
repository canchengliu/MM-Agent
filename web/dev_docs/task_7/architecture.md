--- (13-13 lines) ---
3.  **状态管理策略（REST + WebSocket）：** 使用 REST API 进行初始数据获取和突变。使用 WebSocket 进行实时更新。Zustand 作为客户端的单一事实来源，协调来自两种来源的数据。


--- (32-32 lines) ---
| **API 通信** | `fetch` (REST), WebSocket (原生) | 与后端服务的通信。 |


--- (104-106 lines) ---
│   ├── /websocket/              # WebSocket 管理
│   │   ├── WebSocketManager.ts  # 连接管理器（认证、重连逻辑）
│   │   └── EventHandler.ts      # 调度 WS 事件到 Zustand 存储的逻辑


--- (130-132 lines) ---
##### 3.1.1 认证存储 (`core/store/AuthStore.ts`)

管理用户会话和 JWT 令牌生命周期，使用 `persist` 中间件进行令牌存储。


--- (142-142 lines) ---
  token: string | null;


--- (281-283 lines) ---
##### 3.1.4 工作流存储 (`core/store/WorkflowStore.ts`) - 核心逻辑

最复杂的存储，管理活动工作流结构、节点状态以及与 WebSocket 事件的同步。


--- (300-311 lines) ---
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


--- (419-419 lines) ---
该层处理与后端的通信，包括 REST API 调用和 WebSocket 连接。


--- (514-589 lines) ---
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
