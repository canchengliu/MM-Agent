--- (30-30 lines) ---
| **动画与效果** | Framer Motion, Magic UI | 功能动画、过渡和视觉效果。 |


--- (56-56 lines) ---
│   │   │       │   │   ├── CustomNode.tsx


--- (83-84 lines) ---
│   │   ├── StatusBadge.tsx
│   │   ├── StalenessIndicator.tsx


--- (87-87 lines) ---
│   ├── /magicui/                # 视觉效果组件 (例如, BorderBeam)


--- (103-103 lines) ---
│   │   └── InspectorStore.ts    # 检查器面板的 UI 状态（选择、标签页）


--- (391-391 lines) ---
  selectNode: (nodeId: number) => Promise<void>;


--- (399-407 lines) ---
  selectNode: async (nodeId) => {
    set({ selectedNodeId: nodeId, isPanelOpen: true, isLoadingDetails: true, details: null, versionHistory: null });
    try {
      // 并行获取详情（API 5.1.1）和版本（API 5.1.2）
      const [details, versions] = await Promise.all([
        NodeService.getDetail(nodeId),
        NodeService.getVersions(nodeId),
      ]);
      set({ details, versionHistory: versions, isLoadingDetails: false });


--- (581-585 lines) ---
    case EventType.NODE_ACTIVE_VERSION_CHANGED:
      // 此事件表示下游可能存在陈旧性。
      // 触发完全刷新以获取更新的 'is_stale' 标志 (Design Doc 5.2)。
      store.refreshWorkflow();
      break;


--- (638-638 lines) ---
      * 处理 `onNodeClick` 以更新 `InspectorStore.selectedNodeId`。


--- (650-652 lines) ---
import { CustomNode } from './CustomNode';

const nodeTypes = { custom: CustomNode };


--- (656-656 lines) ---
  const selectNode = useInspectorStore(state => state.selectNode);


--- (663-665 lines) ---
  const onNodeClick = (event, node) => {
    selectNode(parseInt(node.id));
  };


--- (673-673 lines) ---
        onNodeClick={onNodeClick}


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
