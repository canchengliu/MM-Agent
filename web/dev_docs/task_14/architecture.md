--- (27-27 lines) ---
| **工作流可视化** | **React Flow (`@xyflow/react`)** | **（关键添加）** 工作流 DAG/流程图的可视化和交互。 |


--- (54-57 lines) ---
│   │   │       │   ├── /canvas/           # React Flow 实现
│   │   │       │   │   ├── WorkflowCanvas.tsx
│   │   │       │   │   ├── CustomNode.tsx
│   │   │       │   │   └── LayoutUtils.ts


--- (102-102 lines) ---
│   │   ├── WorkflowStore.ts     # 核心工作流状态（阶段、节点、版本）


--- (281-334 lines) ---
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


--- (628-683 lines) ---
#### 5.2 工作流可视化 (React Flow 集成)

##### 5.2.1 `WorkflowCanvas.tsx`

React Flow 的主容器。

  * **职责：**
      * 订阅 `WorkflowStore.phases`。
      * 使用 `LayoutUtils.ts` 将 `phases` 数据转换为 React Flow 的 `nodes` 和 `edges`。
      * 应用布局算法（例如，Dagre 或自定义网格）。
      * 处理 `onNodeClick` 以更新 `InspectorStore.selectedNodeId`。
      * 管理可视化设置（缩放、平移、小地图）。

<!-- end list -->

```tsx
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

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background variant="dots" gap={12} size={1} className="bg-background" />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
```


--- (685-727 lines) ---
##### 5.2.2 `CustomNode.tsx`

节点的视觉表示（Design Doc 5.1.2.1）。

```tsx
// app/(dashboard)/projects/[projectId]/components/canvas/CustomNode.tsx
import { Handle, Position } from '@xyflow/react';
import { Card } from '~/components/ui/card';
import { StatusBadge } from '~/components/platform/StatusBadge';
import { StalenessIndicator } from '~/components/platform/StalenessIndicator';
import { BorderBeam } from '~/components/magicui/border-beam'; // Magic UI 集成

export const CustomNode = ({ data, selected }) => {
  const isExecuting = data.status === 'Executing';

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className={cn(
        "w-[250px] p-3 shadow-md transition-all duration-200 relative",
        selected && "border-primary ring-2 ring-ring" // 选中样式
      )}>
        {/* Executing 状态的动态 BorderBeam (Design Doc 5.1.2.1) */}
        {isExecuting && (
            <BorderBeam size={200} duration={5} delay={0} />
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{data.name}</span>
            <span className="text-xs text-muted-foreground font-mono">{data.definition_id}</span>
          </div>
          <StatusBadge status={data.status} />
        </div>

        {/* 陈旧性指示器 (Design Doc 5.1.2.1) */}
        {data.is_stale && <StalenessIndicator />}
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};
```


--- (870-871 lines) ---
      * `WorkflowCanvas` 中的 `layout` 动画，用于结构更新时平滑重新定位 (5.2.2)。
      * 动态出现新节点时的交错动画。
