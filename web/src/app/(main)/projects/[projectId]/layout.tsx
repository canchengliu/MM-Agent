"use client";

import { Loader2, PanelLeft, PanelRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import { RealtimeProvider } from "~/core/realtime/RealtimeProvider";
import { useWorkspaceStore } from "~/core/store/workspace.store";
import { useProjectDetail } from "~/features/dashboard/hooks/useProjects";
import { useNodeDetail } from "~/features/workspace/hooks/useWorkflowData";
import { InspectorPanel } from "~/features/workspace/inspector/InspectorPanel";
import { DetailsTab } from "~/features/workspace/inspector/tabs/DetailsTab";
import { HistoryTab } from "~/features/workspace/inspector/tabs/HistoryTab";
import { InputOutputTab } from "~/features/workspace/inspector/tabs/InputOutputTab";
import { NavigatorPanel } from "~/features/workspace/navigator/NavigatorPanel";
import { useBreakpoint } from "~/hooks/use-breakpoint";

function usePrevious<T>(value: T) {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default function ProjectWorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { projectId: string };
}) {
  const projectId = Number(params.projectId);
  const router = useRouter();
  const pathname = usePathname();
  const breakpoint = useBreakpoint();

  const { data: project, isLoading, isError } = useProjectDetail(projectId);
  const { layout, updateLayout, focusedNodeId, focusNode } =
    useWorkspaceStore();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const previousFocusedNodeId = usePrevious(focusedNodeId);

  const isConfiguring = project?.status === "Configuring";
  const loadMobileNodeId =
    breakpoint === "sm" && !isConfiguring ? focusedNodeId : null;
  const { data: mobileFocusedNode } = useNodeDetail(loadMobileNodeId);

  const needsRedirect = useMemo(() => {
    if (!project) return null;

    const isOnConfigPage = pathname.endsWith(`/config`);
    if (isConfiguring && !isOnConfigPage) {
      return `/projects/${projectId}/config`;
    }
    if (!isConfiguring && isOnConfigPage) {
      return `/projects/${projectId}/flow`;
    }
    return null;
  }, [project, pathname, projectId, isConfiguring]);

  useEffect(() => {
    if (needsRedirect) {
      router.replace(needsRedirect);
    }
  }, [needsRedirect, router]);

  useEffect(() => {
    if (
      breakpoint === "md" &&
      focusedNodeId &&
      focusedNodeId !== previousFocusedNodeId &&
      isNavOpen
    ) {
      setIsNavOpen(false);
      const timer = setTimeout(() => setIsInspectorOpen(true), 150);
      return () => clearTimeout(timer);
    }
  }, [breakpoint, focusedNodeId, previousFocusedNodeId, isNavOpen]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        <Skeleton className="w-1/4 rounded-xl" />
        <Skeleton className="w-1/2 rounded-xl" />
        <Skeleton className="w-1/4 rounded-xl" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
        Error loading project. It may not exist or you may not have access.
      </div>
    );
  }

  if (needsRedirect) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Redirecting to correct workspace...
      </div>
    );
  }

  if (isConfiguring) {
    return <>{children}</>;
  }

  const workflowId = project.workflow_instance_id;

  const renderLayout = () => {
    if (!workflowId) {
      return (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          Initializing Workspace...
        </div>
      );
    }

    switch (breakpoint) {
      case "lg":
        return (
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full rounded-lg border border-border bg-card"
            onLayout={(sizes: number[]) => {
              if (sizes.length === 3) {
                updateLayout({
                  navigatorWidth: sizes[0],
                  inspectorWidth: sizes[2],
                });
              }
            }}
          >
            <ResizablePanel
              id="navigator"
              order={1}
              collapsible
              defaultSize={layout.navigatorWidth}
              minSize={15}
              collapsedSize={4}
              onCollapse={() => updateLayout({ isNavigatorCollapsed: true })}
              onExpand={() => updateLayout({ isNavigatorCollapsed: false })}
            >
              <NavigatorPanel workflowId={workflowId} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="canvas" order={2} defaultSize={50} minSize={35}>
              {children}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="inspector"
              order={3}
              collapsible
              defaultSize={layout.inspectorWidth}
              minSize={20}
              collapsedSize={4}
              onCollapse={() => updateLayout({ isInspectorCollapsed: true })}
              onExpand={() => updateLayout({ isInspectorCollapsed: false })}
            >
              <InspectorPanel workflowId={workflowId} />
            </ResizablePanel>
          </ResizablePanelGroup>
        );
      case "md":
        return (
          <div className="flex h-full flex-col rounded-lg border border-border bg-card">
            <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
            <footer className="flex flex-shrink-0 items-center justify-between border-t p-2">
              <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <PanelLeft className="mr-2 h-4 w-4" />
                    Navigator
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <NavigatorPanel workflowId={workflowId} />
                </SheetContent>
              </Sheet>
              <Sheet open={isInspectorOpen} onOpenChange={setIsInspectorOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" disabled={!focusedNodeId}>
                    Inspector <PanelRight className="ml-2 h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0">
                  <InspectorPanel workflowId={workflowId} />
                </SheetContent>
              </Sheet>
            </footer>
          </div>
        );
      case "sm":
        return (
          <div className="flex h-full flex-col rounded-lg border border-border bg-card">
            <div className="flex-1 overflow-y-auto">
              <NavigatorPanel workflowId={workflowId} />
            </div>
            <Sheet
              open={!!focusedNodeId}
              onOpenChange={(open) => {
                if (!open) {
                  focusNode(null);
                }
              }}
            >
              <SheetContent
                side="bottom"
                className="flex h-[90vh] flex-col border-t-4 border-primary p-0"
              >
                {mobileFocusedNode ? (
                  <Tabs
                    key={mobileFocusedNode.id}
                    defaultValue="content"
                    className="flex h-full flex-col"
                  >
                    <div className="flex-shrink-0 border-b p-4">
                      <h3 className="truncate font-semibold">
                        {mobileFocusedNode.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        ID: {mobileFocusedNode.definition_id}
                      </p>
                    </div>
                    <TabsList className="mx-4 mt-4 grid w-auto grid-cols-4">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                      <TabsTrigger value="io">I/O</TabsTrigger>
                    </TabsList>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      <TabsContent value="content" className="mt-0 h-full">
                        <div className="h-full w-full">{children}</div>
                      </TabsContent>
                      <TabsContent value="details" className="p-4">
                        <DetailsTab
                          node={mobileFocusedNode}
                          workflowId={workflowId}
                        />
                      </TabsContent>
                      <TabsContent value="history" className="p-4">
                        <HistoryTab
                          node={mobileFocusedNode}
                          workflowId={workflowId}
                        />
                      </TabsContent>
                      <TabsContent value="io" className="p-4">
                        <InputOutputTab node={mobileFocusedNode} />
                      </TabsContent>
                    </div>
                  </Tabs>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      {workflowId ? (
        <RealtimeProvider workflowId={workflowId}>
          {renderLayout()}
        </RealtimeProvider>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          Initializing Workspace...
        </div>
      )}
    </div>
  );
}
