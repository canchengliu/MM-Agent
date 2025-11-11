--- (50-51 lines) ---
│   │   │   └── /[projectId]/    # L2.2: 项目工作区
│   │   │       ├── layout.tsx   # 工作区布局（画布 + 检查器外壳）


--- (63-64 lines) ---
│   │   │       │   └── /inspector/        # L2.2.B.3: 节点检查器面板
│   │   │       │       ├── InspectorPanel.tsx


--- (121-121 lines) ---
└── /messages/                   # i18n 翻译文件


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
