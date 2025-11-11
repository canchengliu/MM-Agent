--- (28-29 lines) ---
| **富文本/LaTeX 编辑器** | Tiptap, Novel, ProseMirror, KaTeX | 用于报告和公式的手动编辑（R4）。 |
| **代码编辑器** | **Monaco Editor (或 CodeMirror)** | **（关键添加）** 平台内部用于工件编辑的代码编辑器。 |


--- (66-66 lines) ---
│   │   │       │       │   ├── ResultsTab.tsx


--- (85-86 lines) ---
│   │   ├── /editor/             # Tiptap/Novel 封装
│   │   └── /code-editor/        # Monaco/CodeMirror 包装器


--- (102-103 lines) ---
│   │   ├── WorkflowStore.ts     # 核心工作流状态（阶段、节点、版本）
│   │   └── InspectorStore.ts    # 检查器面板的 UI 状态（选择、标签页）


--- (281-311 lines) ---
##### 3.1.4 工作流存储 (`core/store/WorkflowStore.ts`) - 核心逻辑

最复杂的存储，管理活动工作流结构、节点状态以及与 WebSocket 事件的同步。

```typescript
// core/store/WorkflowStore.ts
import { create } from 'zustand';
import { produce } from 'immer'; // 对于嵌套结构的不可变更新至关重要
import { WorkflowService } from '../api/services/WorkflowService';
import { NodeService } from '../api/services/NodeService';
import { WorkflowInstanceRead, NodeInstanceRead, PhaseRead } from '../api/types';

interface WorkflowState {
  workflow: WorkflowInstanceRead | null;
  // 用于快速访问的规范化映射（WS 更新期间 O(1) 查找）
  nodes: Record<number, NodeInstanceRead>;
  isLoading: boolean;

  // 动作
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


--- (369-394 lines) ---
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


--- (755-756 lines) ---
    case 'Completed':
      return <CompletedView node={node} activeVersion={node.active_version} />;


--- (816-851 lines) ---
#### 5.5 手动编辑 (Tiptap/Novel 集成)

当用户在 `ResultsTab` 中点击“编辑”（当状态为 `Completed` 时），视图切换到编辑器。

##### 5.5.1 编辑器切换逻辑（在 `ResultsTab.tsx` 或专门的控制器中）

```tsx
// 在 ResultsTab.tsx 中 (CompletedView 组件)
import { useInspectorStore } from '~/core/store/InspectorStore';
import { PlatformEditor } from '~/components/platform/editor/PlatformEditor';

const CompletedView = ({ node, activeVersion }) => {
  const { isEditing, enterEditMode } = useInspectorStore();
  const { submitManualEdit } = useWorkflowStore();

  const handleSave = async (editedContent, summary) => {
    await submitManualEdit(node.id, {
        base_version_id: activeVersion.id,
        edited_output_data: editedContent,
        summary
    });
    useInspectorStore.getState().exitEditMode();
  };

  if (isEditing) {
    return <PlatformEditor initialContent={activeVersion.output_data} onSave={handleSave} onCancel={useInspectorStore.getState().exitEditMode} />;
  }

  return (
    <div>
      <Button onClick={enterEditMode}>手动编辑</Button>
      {/* 工件渲染器 (Markdown/代码查看器) */}
    </div>
  );
};
```
