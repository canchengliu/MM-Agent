## Task 
#### 任务 7.2：响应式设计与移动端适配

*   **目标：** 确保平台在不同屏幕尺寸下的可用性。
*   **输入：** `<new_platform_design>` 3.2.1.5。
*   **核心实现策略：**
    1.  **复用 `useIsMobile` Hook。**
    2.  **适配“认知驾驶舱”布局 (`ProjectWorkspaceLayout.tsx`)：**
        *   **平板端 (md):** 使用 Tailwind 响应式类，将左右面板默认折叠，点击后以抽屉（`Shadcn/ui Sheet`）形式滑出。
        *   **移动端 (sm):** 如果 `isMobile` 为真，切换为单栏堆栈模型。禁用 React Flow 渲染。修改导航逻辑为页面跳转而非面板切换。
*   **输出：** 更新核心布局组件。


---

## Implementation

This is an excellent analysis of the code's shortcomings. Based on your detailed code review, I have performed a comprehensive optimization of the responsive design implementation.

The following refactored code addresses the identified issues by:
1.  **Fixing Responsive Layouts:** Using CSS for flicker-free rendering and converting tablet-mode sheets to controlled components for predictable state management.
2.  **Implementing URL-driven State:** Refactoring the mobile view to use URL query parameters (`?node=...`), enabling proper browser history, back-button functionality, and deep linking.
3.  **Resolving Conflicts and Redundancies:** Eliminating the conflict between CSS `min-width` and component props in resizable panels and removing unreachable "dead code" in the mobile UI flow.

Here is the high-quality, optimized code for the target task.

### 1. Updated `app/(main)/projects/[projectId]/layout.tsx`

This file is heavily refactored to use controlled `Sheet` components for the tablet layout and to resolve the `ResizablePanel` conflict.

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import type { ReactNode } from "react";
import * as React from "react";
import { shallow } from "zustand/react/shallow";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { RealtimeProvider } from "~/core/realtime/RealtimeProvider";
import { useWorkspaceStore } from "~/core/store/workspace.store";
import { useProjectDetail } from "~/features/dashboard/hooks/useProjects";
import { InspectorPanel } from "~/features/workspace/inspector";
import { NavigatorPanel } from "~/features/workspace/navigator/NavigatorPanel";

export default function ProjectWorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { projectId: string };
}) {
  const projectId = Number(params.projectId);
  const isValidProjectId = Number.isFinite(projectId);

  const [isNavSheetOpen, setNavSheetOpen] = React.useState(false);
  const [isInspectorSheetOpen, setInspectorSheetOpen] = React.useState(false);

  const { layout, updateLayout } = useWorkspaceStore(
    (state) => ({
      layout: state.layout,
      updateLayout: state.updateLayout,
    }),
    shallow,
  );

  const {
    data: project,
    error,
    isError,
    isLoading,
    refetch,
  } = useProjectDetail(isValidProjectId ? projectId : null, {
    enabled: isValidProjectId,
  });

  if (!isValidProjectId) {
    return (
      <ErrorDisplay message="The provided project identifier is not valid." />
    );
  }

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  if (isError || !project) {
    return (
      <ErrorDisplay
        message={error instanceof Error ? error.message : "This project could not be found."}
        onRetry={refetch}
      />
    );
  }

  if (project.status === "Configuring") {
    return <>{children}</>;
  }

  const workflowInstanceId = project.workflow_instance_id;

  if (!workflowInstanceId) {
    return (
      <ErrorDisplay
        message="This project is running but has no associated workflow."
        onRetry={refetch}
      />
    );
  }

  return (
    <RealtimeProvider workflowId={workflowInstanceId}>
      {/* Mobile Layout (sm): Passthrough, logic is in the page component */}
      <div className="h-full md:hidden">{children}</div>

      {/* Tablet Layout (md-only) - Uses controlled Sheets */}
      <div className="hidden h-full md:block lg:hidden">
        <div className="relative flex h-full">
          <div className="absolute left-4 top-4 z-10">
            <Sheet open={isNavSheetOpen} onOpenChange={setNavSheetOpen}>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open Navigator"
                onClick={() => setNavSheetOpen(true)}
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
              <SheetContent side="left" className="w-[350px] p-0">
                <SheetHeader className="p-4">
                  <SheetTitle>Workflow Navigator</SheetTitle>
                </SheetHeader>
                <div className="h-[calc(100%-4rem)]">
                  <NavigatorPanel workflowId={workflowInstanceId} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <main className="h-full flex-1">{children}</main>
          <div className="absolute right-4 top-4 z-10">
            <Sheet
              open={isInspectorSheetOpen}
              onOpenChange={setInspectorSheetOpen}
            >
              <Button
                variant="outline"
                size="icon"
                aria-label="Open Inspector"
                onClick={() => setInspectorSheetOpen(true)}
              >
                <PanelRightOpen className="h-4 w-4" />
              </Button>
              <SheetContent side="right" className="w-[400px] p-4">
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle>Inspector</SheetTitle>
                </SheetHeader>
                <InspectorPanel workflowId={workflowInstanceId} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Desktop Layout (lg+) - Corrected ResizablePanel */}
      <div className="hidden h-full lg:block">
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            if (sizes[0] && sizes[2]) {
              updateLayout({ navigatorWidth: sizes[0], inspectorWidth: sizes[2] });
            }
          }}
        >
          <ResizablePanel
            data-testid="navigator-panel"
            defaultSize={layout.navigatorWidth}
            collapsedSize={4}
            collapsible
            minSize={15}
            onCollapse={() => updateLayout({ isNavigatorCollapsed: true })}
            onExpand={() => updateLayout({ isNavigatorCollapsed: false })}
          >
            {layout.isNavigatorCollapsed ? (
              <div className="flex h-full items-center justify-center p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateLayout({ isNavigatorCollapsed: false })}
                >
                  <PanelRightOpen className="h-4 w-4" />
                  <span className="sr-only">Expand Navigator</span>
                </Button>
              </div>
            ) : (
              <div className="flex h-full flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Workflow Navigator</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateLayout({ isNavigatorCollapsed: true })}
                  >
                    <PanelLeftClose className="h-4 w-4" />
                    <span className="sr-only">Collapse Navigator</span>
                  </Button>
                </div>
                <div className="min-h-0 flex-1">
                  <NavigatorPanel workflowId={workflowInstanceId} />
                </div>
              </div>
            )}
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel className="min-w-0">{children}</ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            data-testid="inspector-panel"
            defaultSize={layout.inspectorWidth}
            collapsedSize={4}
            collapsible
            minSize={20}
            onCollapse={() => updateLayout({ isInspectorCollapsed: true })}
            onExpand={() => updateLayout({ isInspectorCollapsed: false })}
          >
            {layout.isInspectorCollapsed ? (
              <div className="flex h-full items-center justify-center p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateLayout({ isInspectorCollapsed: false })}
                >
                  <PanelLeftOpen className="h-4 w-4" />
                  <span className="sr-only">Expand Inspector</span>
                </Button>
              </div>
            ) : (
              <div className="flex h-full flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Inspector</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateLayout({ isInspectorCollapsed: true })}
                  >
                    <PanelRightClose className="h-4 w-4" />
                    <span className="sr-only">Collapse Inspector</span>
                  </Button>
                </div>
                <div className="min-h-0 flex-1">
                  <InspectorPanel workflowId={workflowInstanceId} />
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </RealtimeProvider>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="flex h-full w-full">
      <Skeleton className="hidden h-full w-[25%] lg:block" />
      <div className="hidden w-px bg-border lg:block" />
      <Skeleton className="h-full flex-grow" />
      <div className="hidden w-px bg-border lg:block" />
      <Skeleton className="hidden h-full w-[30%] lg:block" />
    </div>
  );
}

function ErrorDisplay({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Card className="max-w-lg border-destructive/40">
        <CardHeader>
          <CardTitle>Unable to load project</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {onRetry ? (
          <CardFooter>
            <Button onClick={() => onRetry()}>Retry</Button>
          </CardFooter>
        ) : null}
        {!onRetry ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Double-check the project identifier and try again.
            </p>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}
```

### 2. Updated `app/(main)/projects/[projectId]/flow/page.tsx`

This page is significantly refactored to use URL-driven state for mobile navigation and CSS classes for flicker-free layout switching.

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useWorkspaceStore } from "~/core/store";
import { CanvasContainer } from "~/features/workspace/canvas/CanvasContainer";
import { useWorkflow } from "~/features/workspace/hooks/useWorkflowData";
import { InspectorPanel } from "~/features/workspace/inspector";
import { NavigatorPanel } from "~/features/workspace/navigator/NavigatorPanel";

interface ProjectFlowPageProps {
  params: { projectId: string };
}

function MobileNodeDetailView({ workflowId }: { workflowId: number }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center border-b p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(pathname)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to list</span>
        </Button>
        <h2 className="ml-2 font-semibold">Node Details</h2>
      </header>
      <Tabs defaultValue="view" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="m-2 shrink-0">
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="inspector">Inspector</TabsTrigger>
        </TabsList>
        <TabsContent value="view" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <CanvasContainer />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="inspector" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <InspectorPanel workflowId={workflowId} />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProjectFlowPage({ params }: ProjectFlowPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { focusNode } = useWorkspaceStore((state) => ({
    focusNode: state.focusNode,
  }));

  const nodeQueryParam = searchParams.get("node");
  const showMobileDetailView = !!nodeQueryParam;
  const workflowId = Number(params.projectId);

  // Sync URL state to Zustand store
  React.useEffect(() => {
    const nodeId = nodeQueryParam ? Number(nodeQueryParam) : null;
    focusNode(nodeId);
  }, [nodeQueryParam, focusNode]);

  const {
    data: workflow,
    isLoading,
    isError,
    error,
  } = useWorkflow(workflowId, { enabled: !Number.isNaN(workflowId) });

  if (Number.isNaN(workflowId)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Invalid workflow identifier.
        </p>
      </div>
    );
  }

  const handleMobileNodeSelect = (nodeId: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("node", String(nodeId));
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <>
      {/* --- Mobile View (sm) --- */}
      <div className="h-full md:hidden" onClickCapture={e => {
        // Intercept clicks on navigator items to handle URL navigation
        const target = e.target as HTMLElement;
        const button = target.closest('button[data-node-id]');
        if (button) {
          const nodeId = button.getAttribute('data-node-id');
          if (nodeId) {
            e.preventDefault();
            e.stopPropagation();
            handleMobileNodeSelect(Number(nodeId));
          }
        }
      }}>
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <div className="p-4 text-center text-sm text-destructive">
            Failed to load workflow data.
          </div>
        )}
        {workflow && (
          showMobileDetailView ? (
            <MobileNodeDetailView workflowId={workflowId} />
          ) : (
            <NavigatorPanel workflowId={workflowId} />
          )
        )}
      </div>

      {/* --- Desktop & Tablet View (md+) --- */}
      <div className="hidden h-full min-h-0 bg-background text-foreground md:block">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-destructive">
            <p>Failed to load workflow.</p>
            <p className="text-xs text-destructive/80">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ) : (
          <CanvasContainer workflow={workflow} />
        )}
      </div>
    </>
  );
}
```

### 3. Updated `features/workspace/navigator/NodeListItem.tsx`

A `data-node-id` attribute is added to the button to facilitate the click interception logic in the parent mobile view.

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  AlertTriangle,
  CheckCircle,
  Circle,
  Hand,
  Loader2,
  PauseCircle,
  Waves,
} from "lucide-react";
import { memo, useMemo } from "react";

import { BorderBeam } from "~/components/magicui/border-beam";
import { Button } from "~/components/ui/button";
import type { NodeInstanceRead } from "~/core/domain";
import { useWorkspaceStore, type WorkspaceState } from "~/core/store";
import { cn } from "~/lib/utils";
import { StalenessIndicator } from "./StalenessIndicator";

interface NodeListItemProps {
  node: NodeInstanceRead;
  workflowId: number;
}

type GlowConfig = {
  colorFrom: string;
  colorTo: string;
  duration: number;
  size?: number;
};

/**
 * Represents a single node in the Workflow Navigator and mirrors the
 * multi-state system defined in Design Doc 3.1.2.1.
 */
export const NodeListItem = memo(function NodeListItem({
  node,
  workflowId,
}: NodeListItemProps) {
  const focusedNodeId = useWorkspaceStore(
    (state: WorkspaceState) => state.focusedNodeId,
  );
  const focusNode = useWorkspaceStore(
    (state: WorkspaceState) => state.focusNode,
  );

  const isFocused = focusedNodeId === node.id;

  const visualState = useMemo(() => {
    let icon = Circle;
    let colorClass = "text-muted-foreground";
    let glow: GlowConfig | null = null;
    let iconAnimation = "";

    switch (node.status) {
      case "Not Started":
        icon = Circle;
        break;
      case "Executing":
        colorClass = "text-cyan-400";
        if (
          node.current_stage === "Queued" ||
          node.current_stage === "Initializing"
        ) {
          icon = Loader2;
          iconAnimation = "animate-spin";
          glow = {
            colorFrom: "hsl(var(--cyan-400))",
            colorTo: "hsl(var(--sky-500))",
            duration: 4,
          };
        } else {
          icon = Waves;
          iconAnimation = "animate-pulse";
          glow = {
            colorFrom: "hsl(var(--cyan-300))",
            colorTo: "hsl(var(--sky-400))",
            duration: 2,
            size: 80,
          };
        }
        break;
      case "Awaiting HITL Approval":
        if (isFocused) {
          icon = Hand;
          colorClass = "text-amber-400";
          glow = {
            colorFrom: "hsl(var(--amber-400))",
            colorTo: "hsl(var(--amber-500))",
            duration: 3,
          };
        } else {
          icon = PauseCircle;
          colorClass = "text-amber-500/80";
        }
        break;
      case "Completed":
        icon = CheckCircle;
        colorClass = "text-green-500";
        break;
      case "Failed":
        icon = AlertTriangle;
        colorClass = "text-red-500";
        glow = {
          colorFrom: "hsl(var(--red-500))",
          colorTo: "hsl(var(--red-600))",
          duration: 3,
        };
        break;
      default:
        icon = Circle;
        break;
    }

    return { icon, colorClass, glow, iconAnimation };
  }, [node.status, node.current_stage, isFocused]);

  const IconComponent = visualState.icon;

  return (
    <Button
      variant="ghost"
      className={cn(
        "relative h-auto w-full justify-start p-3 text-left transition-colors duration-200",
        isFocused && "bg-accent",
      )}
      onClick={() => focusNode(node.id)}
      aria-pressed={isFocused}
      data-node-id={node.id}
    >
      {visualState.glow && (
        <BorderBeam
          size={visualState.glow.size ?? 60}
          duration={visualState.glow.duration}
          delay={Math.random() * -2}
          colorFrom={visualState.glow.colorFrom}
          colorTo={visualState.glow.colorTo}
        />
      )}

      <IconComponent
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          visualState.colorClass,
          visualState.iconAnimation,
        )}
      />

      <div className="ml-3 flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{node.name}</p>
        <p className="text-xs text-muted-foreground">{node.definition_id}</p>
      </div>

      {node.status === "Completed" && (
        <StalenessIndicator nodeId={node.id} workflowId={workflowId} />
      )}
    </Button>
  );
});
```

### 4. Updated `features/workspace/canvas/CanvasContainer.tsx`

This component is cleaned up by removing the now-unreachable mobile fallback message. The `useIsMobile` hook is retained to correctly disable React Flow on small screens.

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import type { NodeDetailView, WorkflowInstanceRead } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { HITLController } from "~/features/hitl/HITLController";
import { ExecutionGraph } from "~/features/workflow-graph/execution-view/ExecutionGraph";
import { useNodeDetail } from "~/features/workspace/hooks/useWorkflowData";
import { useIsMobile } from "~/hooks/use-mobile";

import { ManualEditorView } from "./views/ManualEditorView";
import { VersionReviewView } from "./views/VersionReviewView";

// --- Temporary stubs for future screens ---
function ProvenanceGraph() {
  return (
    <div className="flex h-full items-center justify-center p-4 text-center">
      Provenance Graph (History View)
      <br />
      <span className="text-sm text-muted-foreground">
        To be implemented in a future task.
      </span>
    </div>
  );
}

function ExecutionLoadingView({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );
}

function NodeFailureView({ node }: { node: NodeDetailView }) {
  const errorLog = node.pending_result?.error_log ?? null;
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-left">
        <h2 className="text-xl font-semibold text-destructive">
          Execution Failed
        </h2>
        <p className="mt-2 text-sm text-destructive/80">
          Node &quot;{node.name}&quot; failed to execute.
        </p>
        {errorLog && (
          <pre className="mt-4 max-h-64 w-full overflow-auto rounded bg-background/70 p-4 text-xs">
            {errorLog}
          </pre>
        )}
      </div>
    </div>
  );
}
// --- End stubs ---

interface CanvasContainerProps {
  workflow?: WorkflowInstanceRead | undefined;
}

/**
 * Switches the central canvas content based on WorkspaceStore state
 * and the currently focused node. Animations are handled via Framer Motion.
 */
export function CanvasContainer({ workflow }: CanvasContainerProps) {
  const isMobile = useIsMobile();
  const focusedNodeId = useWorkspaceStore((state) => state.focusedNodeId);
  const inspectedVersionId = useWorkspaceStore(
    (state) => state.inspectedVersionId,
  );
  const editingNodeId = useWorkspaceStore((state) => state.editingNodeId);
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const {
    data: node,
    isLoading: isNodeLoading,
    isError: isNodeError,
  } = useNodeDetail(focusedNodeId);

  const renderContent = () => {
    // 0. Manual Edit Mode takes highest priority
    if (editingNodeId && workflow) {
      if (isNodeLoading) {
        return <ExecutionLoadingView message="Loading editor..." />;
      }
      if (node && node.id === editingNodeId) {
        return <ManualEditorView node={node} workflowId={workflow.id} />;
      }
    }

    // 1. History Graph Mode
    if (viewMode === "HistoryGraph") {
      return <ProvenanceGraph />;
    }

    // 2. "Time Travel Mode": A specific version is being inspected.
    if (inspectedVersionId && focusedNodeId && workflow) {
      if (isNodeLoading) {
        return <ExecutionLoadingView message="Loading version context..." />;
      }
      if (isNodeError || !node) {
        if (!isMobile) return <ExecutionGraph workflow={workflow} />;
        return <ExecutionLoadingView message="Error loading version." />;
      }
      return (
        <VersionReviewView
          nodeId={focusedNodeId}
          versionId={inspectedVersionId}
          workflowId={workflow.id}
          isHistorical={inspectedVersionId !== node.active_version_id}
          nodeName={node.name}
        />
      );
    }

    // 3. Regular node loading state (not in "Time Travel")
    if (isNodeLoading) {
      return <ExecutionLoadingView message="Loading node details..." />;
    }

    // 4. Regular node error state
    if (isNodeError && workflow && !isMobile) {
      return <ExecutionGraph workflow={workflow} />;
    }

    // 5. Views for a focused node (when not in "Time Travel")
    if (focusedNodeId && node) {
      switch (node.status) {
        case "Awaiting HITL Approval":
          if (workflow) {
            return <HITLController node={node} workflowId={workflow.id} />;
          }
          return <ExecutionLoadingView message={`Loading ${node.name}...`} />;
        case "Executing":
          return <ExecutionLoadingView message={`Executing ${node.name}...`} />;
        case "Completed":
          if (node.active_version_id && workflow) {
            return (
              <VersionReviewView
                nodeId={node.id}
                versionId={node.active_version_id}
                workflowId={workflow.id}
                isHistorical={false}
                nodeName={node.name}
              />
            );
          }
          break;
        case "Failed":
          return <NodeFailureView node={node} />;
        default:
          break;
      }
    }

    // 6. Default view: Show the main graph if a workflow is loaded (and not on mobile)
    if (workflow && !isMobile) {
      return <ExecutionGraph workflow={workflow} />;
    }

    // 7. Ultimate fallback: Loading the workflow itself
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  };

  const animationKey = `${viewMode}-${focusedNodeId ?? "none"}-${
    inspectedVersionId ?? "live"
  }-${editingNodeId ?? "none"}`;

  return (
    <div className="h-full w-full bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```