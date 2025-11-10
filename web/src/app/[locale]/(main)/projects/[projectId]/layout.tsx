// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import * as React from "react";
import type { ReactNode } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { usePathname, useRouter } from "~/navigation";
import { useShallow } from "zustand/react/shallow";

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
import { ProjectWorkspaceProvider } from "~/features/workspace/context/ProjectWorkspaceContext";
import { InspectorPanel } from "~/features/workspace/inspector";
import { NavigatorPanel } from "~/features/workspace/navigator/NavigatorPanel";

export default function ProjectWorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const isFlowRoute = pathSegments[pathSegments.length - 1] === "flow";
  const { projectId: projectIdParam } = React.use(params);
  const projectId = Number(projectIdParam);
  const isValidProjectId = Number.isFinite(projectId);
  const navigatorPanelRef = React.useRef<ImperativePanelHandle | null>(null);
  const inspectorPanelRef = React.useRef<ImperativePanelHandle | null>(null);

  const [isNavSheetOpen, setNavSheetOpen] = React.useState(false);
  const [isInspectorSheetOpen, setInspectorSheetOpen] = React.useState(false);

  const { layout, updateLayout } = useWorkspaceStore(
    useShallow((state) => ({
      layout: state.layout,
      updateLayout: state.updateLayout,
    })),
  );

  const collapseNavigator = React.useCallback(() => {
    if (navigatorPanelRef.current) {
      navigatorPanelRef.current.collapse();
    } else {
      updateLayout({ isNavigatorCollapsed: true });
    }
  }, [updateLayout]);

  const expandNavigator = React.useCallback(() => {
    if (navigatorPanelRef.current) {
      navigatorPanelRef.current.expand();
      navigatorPanelRef.current.resize(layout.navigatorWidth);
    } else {
      updateLayout({ isNavigatorCollapsed: false });
    }
  }, [layout.navigatorWidth, updateLayout]);

  const collapseInspector = React.useCallback(() => {
    if (inspectorPanelRef.current) {
      inspectorPanelRef.current.collapse();
    } else {
      updateLayout({ isInspectorCollapsed: true });
    }
  }, [updateLayout]);

  const expandInspector = React.useCallback(() => {
    if (inspectorPanelRef.current) {
      inspectorPanelRef.current.expand();
      inspectorPanelRef.current.resize(layout.inspectorWidth);
    } else {
      updateLayout({ isInspectorCollapsed: false });
    }
  }, [layout.inspectorWidth, updateLayout]);

  React.useEffect(() => {
    const panel = navigatorPanelRef.current;
    if (!panel) return;

    if (layout.isNavigatorCollapsed && !panel.isCollapsed()) {
      panel.collapse();
      return;
    }

    if (!layout.isNavigatorCollapsed && panel.isCollapsed()) {
      panel.expand();
      panel.resize(layout.navigatorWidth);
    }
  }, [layout.isNavigatorCollapsed, layout.navigatorWidth]);

  React.useEffect(() => {
    const panel = inspectorPanelRef.current;
    if (!panel) return;

    if (layout.isInspectorCollapsed && !panel.isCollapsed()) {
      panel.collapse();
      return;
    }

    if (!layout.isInspectorCollapsed && panel.isCollapsed()) {
      panel.expand();
      panel.resize(layout.inspectorWidth);
    }
  }, [layout.isInspectorCollapsed, layout.inspectorWidth]);

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
    if (isFlowRoute) {
      return <FlowAccessRedirect projectId={project.id} />;
    }
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
    <ProjectWorkspaceProvider project={project}>
      <RealtimeProvider workflowId={workflowInstanceId}>
        {/* Mobile layout (handled inside individual pages) */}
        <div className="h-full md:hidden">{children}</div>

        {/* Tablet layout: navigator/inspector become sheets */}
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

        {/* Desktop layout with resizable panels */}
        <div className="hidden h-full lg:block">
          <ResizablePanelGroup
            direction="horizontal"
            onLayout={(sizes: number[]) => {
              if (sizes[0] && sizes[2]) {
                updateLayout({
                  navigatorWidth: sizes[0],
                  inspectorWidth: sizes[2],
                });
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
              ref={navigatorPanelRef}
            >
              {layout.isNavigatorCollapsed ? (
                <div className="flex h-full items-center justify-center p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={expandNavigator}
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
                      onClick={collapseNavigator}
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
              ref={inspectorPanelRef}
            >
              {layout.isInspectorCollapsed ? (
                <div className="flex h-full items-center justify-center p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={expandInspector}
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
                      onClick={collapseInspector}
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
    </ProjectWorkspaceProvider>
  );
}

function FlowAccessRedirect({ projectId }: { projectId: number }) {
  const router = useRouter();

  React.useEffect(() => {
    router.replace(`/projects/${projectId}/config`);
  }, [projectId, router]);

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Card className="max-w-lg border-muted/40">
        <CardHeader>
          <CardTitle>Workflow not ready yet</CardTitle>
          <CardDescription>
            This project is still being configured. You&apos;ll be redirected to
            the configuration page to finish setup before using the workspace.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.replace(`/projects/${projectId}/config`)}>
            Continue to configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
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
