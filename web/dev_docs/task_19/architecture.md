--- (69-72 lines) ---
│   │   │       │       └── /hitl/
│   │   │       │           ├── HITLContainer.tsx
│   │   │       │           ├── SCAInterface.tsx # 战略选择架构接口
│   │   │       │           └── AVLInterface.tsx # 辅助验证与学习接口


--- (304-307 lines) ---
  // 执行和 HITL 动作（代理到 NodeService）
  reExecuteNode: (nodeId: number, req: ExecutionRequest) => Promise<void>;
  submitHITL: (nodeId: number, submission: HITLSubmission) => Promise<HITLResponse>;



--- (740-755 lines) ---
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


--- (762-814 lines) ---
#### 5.4 HITL 实现 (`HITLContainer.tsx` 和专业接口)

`HITLContainer` 充当工厂，根据 `hitl_mode` 加载相应的接口（`SCAInterface`、`AVLInterface`）。

##### 5.4.1 `SCAInterface.tsx` (示例)

战略选择架构的实现（Design Doc 5.1.3.1）。

```tsx
// app/(dashboard)/projects/[projectId]/components/inspector/hitl/SCAInterface.tsx
"use client";
import { useState } from 'react';
import { useWorkflowStore } from '~/core/store/WorkflowStore';
import { RadioGroup } from "~/components/ui/radio-group";
import { ShineBorder } from '~/components/magicui/shine-border'; // Magic UI 集成

export const SCAInterface = ({ node, data }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { submitHITL } = useWorkflowStore();

  const handleApprove = async () => {
    if (!selectedId) return;
    await submitHITL(node.id, {
        action: 'Continue',
        interaction_data: { selected_ids: [selectedId] },
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 内容区域 (可滚动) */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 比较分析 (Markdown) */}
        {/* 候选选择 (RadioGroup) */}
        <RadioGroup onValueChange={setSelectedId} value={selectedId ?? undefined}>
          {data.candidates.map(candidate => (
            <div key={candidate.id} className="relative mb-4">
                {/* 选中时应用 ShineBorder (Design Doc 5.1.3.1) */}
                {selectedId === candidate.id && <ShineBorder />}
                {/* 候选卡片 */}
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* HITL 操作栏 (固定页脚) */}
      <div className="p-4 border-t bg-card flex justify-end gap-4">
        {/* 丢弃、拒绝、批准按钮 */}
      </div>
    </div>
  );
};
```
