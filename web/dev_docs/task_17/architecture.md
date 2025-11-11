--- (65-68 lines) ---
│   │   │       │       ├── /tabs/
│   │   │       │       │   ├── ResultsTab.tsx
│   │   │       │       │   ├── HistoryTab.tsx
│   │   │       │       │   └── DependenciesTab.tsx


--- (299-311 lines) ---
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


--- (574-580 lines) ---
  switch (payload.event_type) {
    case EventType.NODE_STATUS_UPDATED:
      store._processNodeUpdate(payload.data);
      break;
    case EventType.WORKFLOW_STRUCTURE_UPDATED:
      store._processStructureUpdate(payload.data);
      break;


--- (735-760 lines) ---
##### 5.3.1 `ResultsTab.tsx`

根据节点状态动态切换内容。

```tsx
// app/(dashboard)/projects/[projectId]/components/inspector/tabs/ResultsTab.tsx
import { Alert } from "~/components/ui/alert";
import { HITLContainer } from '../hitl/HITLContainer';
// ... 其他视图 (CompletedView, ExecutingView, FailedView)

export const ResultsTab = ({ node }) => {
  // 1. 如果存在，显示陈旧性警告 (Design Doc 3.1.2.3)
  if (node.is_stale && node.staleness_report) {
    // 渲染 Alert 组件
  }

  // 2. 根据状态切换视图
  switch (node.status) {
    case 'Awaiting HITL Approval':
      return <HITLContainer node={node} pendingResult={node.pending_result} />;
    case 'Completed':
      return <CompletedView node={node} activeVersion={node.active_version} />;
    // ... 其他情况
  }
};
```


--- (827-850 lines) ---
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
