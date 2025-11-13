"use client";

import { useMemo, useRef, type RefObject } from "react";
// Removed Loader2, NodeStatusIcon, Badge imports as they are now handled within NodeWorkspace
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { useShallow } from "zustand/react/shallow";

import { WorkflowTree } from "./workflow-tree";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import type { WorkflowInstanceRead } from "~/core/models/workflow.model";
import { useStore } from "~/core/store";
import { NodeWorkspace } from "./workspace/node-workspace"; // Import NodeWorkspace
import { VersionHistoryPanel } from "./history/version-history-panel"; // (Task 21) Import VersionHistoryPanel

interface CockpitLayoutProps {
  workflow: WorkflowInstanceRead;
  isSyncing: boolean;
}

export function CockpitLayout({ workflow, isSyncing }: CockpitLayoutProps) {
  const { activeNodeId, nodesById, isEditing } = useStore(
    useShallow((state) => ({
      activeNodeId: state.activeNodeId,
      nodesById: state.nodesById,
      // We need to track the editing state for the Panel C visibility logic.
      isEditing: state.isEditing,
    })),
  );

  const activeNode = useMemo(() => {
    if (!activeNodeId) return null;
    return nodesById.get(activeNodeId) ?? null;
  }, [activeNodeId, nodesById]);

  // Design Doc 2.2.3.C / 3.1.1.C: Panel C (History) visibility logic.
  // Visible only when the Center Workspace is in "Review Mode" (Completed status AND not currently editing).
  const isHistoryVisible = activeNode?.status === "Completed" && !isEditing;

  const navigatorPanelRef = useRef<ImperativePanelHandle>(null);
  const historyPanelRef = useRef<ImperativePanelHandle>(null);

  const togglePanel = (panelRef: RefObject<ImperativePanelHandle | null>) => {
    const panel = panelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="workflow-cockpit-layout"
      className="flex h-full overflow-hidden rounded-2xl border border-border/60 bg-background/60 shadow-inner"
    >
      {/* A. Navigator Panel */}
      <ResizablePanel
        ref={navigatorPanelRef}
        id="workflow-navigator"
        collapsible
        defaultSize={22}
        minSize={18}
        className="bg-card/80"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Workflow Navigator
              </p>
              <p className="text-sm font-medium text-foreground">{workflow.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => togglePanel(navigatorPanelRef)}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">Toggle navigator</span>
            </Button>
          </div>
          <ScrollArea className="flex-1 px-3 py-4">
            <WorkflowTree workflow={workflow} />
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      {/* B. Workspace Panel */}
      <ResizablePanel
        id="workflow-workspace"
        // Dynamically adjust sizes based on Panel C visibility
        minSize={isHistoryVisible ? 45 : 60}
        defaultSize={isHistoryVisible ? 56 : 78}
        className="bg-background"
      >
        {/* Architecture 6.2: Host the NodeWorkspace component. */}
        <NodeWorkspace workflowStatus={workflow.status} isSyncing={isSyncing} />
      </ResizablePanel>

      {/* C. History Panel (Conditional) (Task 21 Implementation) */}
      {/* Ensure activeNode is available and valid before rendering Panel C components */}
      {isHistoryVisible && activeNode ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            ref={historyPanelRef}
            id="workflow-history"
            collapsible
            defaultSize={22}
            minSize={16}
            className="bg-card/80"
          >
            <div className="flex h-full flex-col">
              {/* Header (C1) (Design Doc 5.1.4.C1) */}
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Version History
                  </p>
                  <p className="text-sm font-medium text-foreground truncate" title={activeNode.name}>
                    {activeNode.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => togglePanel(historyPanelRef)}
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Toggle history</span>
                </Button>
              </div>
              {/* Content (C2) - Scrollable Area hosting the panel content */}
              {/* VersionHistoryPanel manages its own rendering logic (loading/error/content) */}
              <ScrollArea className="flex-1">
                {/* Architecture 7.3: Host the VersionHistoryPanel component. */}
                <VersionHistoryPanel activeNode={activeNode} />
              </ScrollArea>
            </div>
          </ResizablePanel>
        </>
      ) : null}
    </ResizablePanelGroup>
  );
}
