--- (96-96 lines) ---
│   │   │   └── WorkflowService.ts (包含 NodeService 函数)


--- (102-103 lines) ---
│   │   ├── WorkflowStore.ts     # 核心工作流状态（阶段、节点、版本）
│   │   └── InspectorStore.ts    # 检查器面板的 UI 状态（选择、标签页）


--- (281-367 lines) ---
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

// 规范化工作流的辅助函数
const normalizeWorkflow = (workflow: WorkflowInstanceRead) => {
  const nodes: Record<number, NodeInstanceRead> = {};
  // 将 phases -> stages -> nodes 展平到 nodes 映射中的逻辑
  return { nodes, phases: workflow.phases };
};

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

  // ... 执行和 HITL 动作实现 (调用 NodeService)

  // --- WebSocket 处理程序 ---

  _processNodeUpdate: (nodeData) => {
    set(produce((state: WorkflowState) => {
      // 更新规范化映射
      state.nodes[nodeData.id] = nodeData;

      // 更新层级结构 (Immer 处理不可变性)
      if (state.workflow) {
        // 在 state.workflow.phases 中查找并更新节点的逻辑
        // (需要详细实现来遍历层级结构)
      }
    }));
  },

  _processStructureUpdate: (workflowData) => {
    // 需要完全替换（Generator 节点已完成）
    const { nodes } = normalizeWorkflow(workflowData);
    set({ workflow: workflowData, nodes });
    // 重要：如果结构发生重大变化，可能需要清除 InspectorStore 缓存。
  },
}));
```


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


--- (562-588 lines) ---
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


--- (634-638 lines) ---
  * **职责：**
      * 订阅 `WorkflowStore.phases`。
      * 使用 `LayoutUtils.ts` 将 `phases` 数据转换为 React Flow 的 `nodes` 和 `edges`。
      * 应用布局算法（例如，Dagre 或自定义网格）。
      * 处理 `onNodeClick` 以更新 `InspectorStore.selectedNodeId`。


--- (644-666 lines) ---
// app/(dashboard)/projects/[projectId]/components/canvas/WorkflowCanvas.tsx
"use client";
import ReactFlow, { Background, Controls, MiniMap } from '@xyflow/react';
import { useWorkflowStore } from '~/core/store/WorkflowStore';
import { useInspectorStore } from '~/core/store/InspectorStore';
import { calculateLayout } from './LayoutUtils';
import { CustomNode } from './CustomNode';

const nodeTypes = { custom: CustomNode };

export const WorkflowCanvas = () => {
  const phases = useWorkflowStore(state => state.workflow?.phases || []);
  const selectNode = useInspectorStore(state => state.selectNode);

  // 当 phases 改变时计算布局
  const { nodes, edges } = useMemo(() => {
    return calculateLayout(phases);
  }, [phases]);

  const onNodeClick = (event, node) => {
    selectNode(parseInt(node.id));
  };



--- (731-733 lines) ---
  * **职责：**
      * 订阅 `InspectorStore` 获取 `selectedNodeDetails`。
      * 渲染带标签页的界面（结果、历史记录、依赖关系）。


--- (780-788 lines) ---
  const { submitHITL } = useWorkflowStore();

  const handleApprove = async () => {
    if (!selectedId) return;
    await submitHITL(node.id, {
        action: 'Continue',
        interaction_data: { selected_ids: [selectedId] },
    });
  };


--- (823-851 lines) ---
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
