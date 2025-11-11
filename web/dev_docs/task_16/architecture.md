--- (63-68 lines) ---
│   │   │       │   └── /inspector/        # L2.2.B.3: 节点检查器面板
│   │   │       │       ├── InspectorPanel.tsx
│   │   │       │       ├── /tabs/
│   │   │       │       │   ├── ResultsTab.tsx
│   │   │       │       │   ├── HistoryTab.tsx
│   │   │       │       │   └── DependenciesTab.tsx


--- (83-83 lines) ---
│   │   ├── StatusBadge.tsx


--- (103-103 lines) ---
│   │   └── InspectorStore.ts    # 检查器面板的 UI 状态（选择、标签页）


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


--- (638-638 lines) ---
      * 处理 `onNodeClick` 以更新 `InspectorStore.selectedNodeId`。


--- (729-734 lines) ---
#### 5.3 检查器面板 (`InspectorPanel.tsx`)

  * **职责：**
      * 订阅 `InspectorStore` 获取 `selectedNodeDetails`。
      * 渲染带标签页的界面（结果、历史记录、依赖关系）。



--- (869-870 lines) ---
      * `InspectorPanel` 中的 `AnimatePresence`，用于在选择节点时平滑内容切换 (5.2.4)。
      * `WorkflowCanvas` 中的 `layout` 动画，用于结构更新时平滑重新定位 (5.2.2)。
