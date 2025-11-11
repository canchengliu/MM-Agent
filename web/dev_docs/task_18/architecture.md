--- (63-68 lines) ---
│   │   │       │   └── /inspector/        # L2.2.B.3: 节点检查器面板
│   │   │       │       ├── InspectorPanel.tsx
│   │   │       │       ├── /tabs/
│   │   │       │       │   ├── ResultsTab.tsx
│   │   │       │       │   ├── HistoryTab.tsx
│   │   │       │       │   └── DependenciesTab.tsx


--- (369-415 lines) ---
##### 3.1.5 检查器存储 (`core/store/InspectorStore.ts`)

管理检查器面板的 UI 状态，与核心工作流数据解耦。

```typescript
// core/store/InspectorStore.ts
import { create } from 'zustand';
import { NodeService } from '../api/services/NodeService';
import { NodeDetailView, NodeVersionRead } from '../api/types';

interface InspectorState {
  selectedNodeId: number | null;
  activeTab: 'results' | 'history' | 'dependencies';
  isPanelOpen: boolean;
  isEditing: boolean; // 手动编辑模式（R4）

  // 选定节点的缓存数据
  details: NodeDetailView | null;
  versionHistory: NodeVersionRead[] | null;
  isLoadingDetails: boolean;

  // 动作
  selectNode: (nodeId: number) => Promise<void>;
  clearSelection: () => void;
  // ... 其他 UI 状态动作 (setActiveTab, togglePanel, enterEditMode)
}

export const useInspectorStore = create<InspectorState>((set, get) => ({
  // ... 初始状态

  selectNode: async (nodeId) => {
    set({ selectedNodeId: nodeId, isPanelOpen: true, isLoadingDetails: true, details: null, versionHistory: null });
    try {
      // 并行获取详情（API 5.1.1）和版本（API 5.1.2）
      const [details, versions] = await Promise.all([
        NodeService.getDetail(nodeId),
        NodeService.getVersions(nodeId),
      ]);
      set({ details, versionHistory: versions, isLoadingDetails: false });
    } catch (error) {
      // 处理错误（例如，如果超出执行前沿，出现 403 Forbidden R5.2）
      set({ isLoadingDetails: false });
    }
  },
  // ...
}));
```


--- (581-585 lines) ---
    case EventType.NODE_ACTIVE_VERSION_CHANGED:
      // 此事件表示下游可能存在陈旧性。
      // 触发完全刷新以获取更新的 'is_stale' 标志 (Design Doc 5.2)。
      store.refreshWorkflow();
      break;


--- (729-734 lines) ---
#### 5.3 检查器面板 (`InspectorPanel.tsx`)

  * **职责：**
      * 订阅 `InspectorStore` 获取 `selectedNodeDetails`。
      * 渲染带标签页的界面（结果、历史记录、依赖关系）。



--- (745-749 lines) ---
export const ResultsTab = ({ node }) => {
  // 1. 如果存在，显示陈旧性警告 (Design Doc 3.1.2.3)
  if (node.is_stale && node.staleness_report) {
    // 渲染 Alert 组件
  }
