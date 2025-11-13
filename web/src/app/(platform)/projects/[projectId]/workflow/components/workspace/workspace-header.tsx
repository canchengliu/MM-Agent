"use client";

import { History, Loader2, Undo2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { NodeStatusIcon } from "~/components/platform/workflow/node-status-icon";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { type WorkflowStatus } from "~/constants/enums";
import type {
  NodeInstanceRead,
  StalenessInfo,
} from "~/core/models/workflow.model";
import { useStore } from "~/core/store";
// (Task 24.3) Import StalenessBanner
import { StalenessBanner } from "./staleness-banner";
import { ContextualToolbar } from "./contextual-toolbar";
import { BorderBeam } from "~/components/magicui/border-beam";

interface WorkspaceHeaderProps {
  // NodeInstanceRead (or derived NodeDetailView) allows rendering basic info while details load.
  node: NodeInstanceRead;
  isSyncing: boolean;
  workflowStatus: WorkflowStatus;
  isLoadingDetails: boolean;
  // Staleness report provides the details if node.is_stale is true (only available when details are loaded).
  stalenessReport: StalenessInfo[] | null;
}

/**
 * Renders the header section (B1) of the Node Workspace.
 * Includes Title, Status, Contextual Toolbar, and Staleness Banner (B1.1).
 * (Design Doc 5.1.3.B1)
 */
export function WorkspaceHeader({
  node,
  isSyncing,
  workflowStatus,
  isLoadingDetails,
  stalenessReport,
}: WorkspaceHeaderProps) {
  // Access UI Interaction state (Design Doc 3.1.1.C.1)
  const { viewingVersionId, viewLatestVersion } = useStore(
    useShallow((state) => ({
      viewingVersionId: state.viewingVersionId,
      viewLatestVersion: state.viewLatestVersion,
    })),
  );

  // We are viewing history if viewingVersionId is set (regardless of whether it's the active version or not).
  const isViewingHistory = viewingVersionId !== null;

  // Determine if the Staleness Banner (B1.1) should be shown. (Task 24.3)
  // Requires node to be marked stale AND we must have the details (report) loaded.
  // Hide staleness banner when viewing history, as staleness relates to the latest state.
  const showStalenessBanner =
    node.is_stale && stalenessReport && stalenessReport.length > 0 && !isViewingHistory;

  // Design Doc 5.1.5: Activate BorderBeam animation (Cyan) when Executing.
  const isExecuting = node.status === "Executing";

  return (
    // B1: Fixed Top Header Container. Uses flex-col to stack main header and banner.
    // Relative positioning required for BorderBeam.
    <div className="relative z-10 flex shrink-0 flex-col border-b border-border/50 bg-background">
       {/* Visual Enhancement: BorderBeam during execution */}
       {isExecuting && (
        <BorderBeam
          // Use the semantic status color for executing (Cyan)
          // status.executing.DEFAULT: hsl(186.2 95.2% 40.3%)
          colorFrom="hsl(186.2 95.2% 40.3%)"
          colorTo="hsl(186.2 95.2% 60%)"
          duration={5}
        />
      )}
      
      {/* Main Header Content (B1) */}
      {/* We use padding (py-3) instead of fixed height (h-12) to accommodate content flexibly. */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3">
        {/* Left side: Title, Status, Metadata */}
        <div className="flex items-center gap-4">
          <NodeStatusIcon status={node.status} size={24} className="hidden sm:block" />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Design Doc 5.1.3.B1: [ID] | [Name] */}
              <h1 className="text-lg font-semibold">
                <span className="font-mono text-sm text-muted-foreground">
                  {node.definition_id}
                </span>{" "}
                | {node.name}
              </h1>

                {/* Status Badge */}
                {/* Hide status badge when viewing history, as the status reflects the current live state, not the historical snapshot. */}
                {!isViewingHistory && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5 text-xs font-medium"
                  >
                    {/* Show detailed stage if executing (Design Doc 3.3.C) */}
                    {node.status === "Executing"
                      ? node.current_stage
                      : node.status}
                  </Badge>
                )}

                {/* Historical View Indicator (Design Doc 3.1.1.C.1) */}
                {isViewingHistory && (
                  <Badge
                    variant="outline"
                    // Use Amber color scheme for prominent visual indication
                    className="flex items-center gap-1.5 text-xs font-medium border-amber-500 text-amber-700 bg-amber-50/50 dark:text-amber-500 dark:bg-amber-950/30 shadow-sm"
                  >
                    <History className="h-3.5 w-3.5" />
                    Reviewing History
                  </Badge>
                )}

              {isLoadingDetails && (
                <Loader2
                  className="h-4 w-4 animate-spin text-muted-foreground"
                  title="Loading details"
                />
              )}
            </div>
            {/* Metadata (Stage and Type) */}
            <p className="text-sm text-muted-foreground mt-0.5">
              {node.stage_name} • Type: {node.node_type} • HITL:{" "}
              {node.hitl_mode}
            </p>
          </div>
        </div>

        {/* Right side: Contextual Toolbar and Workflow Status */}
        <div className="flex items-center gap-6">
          {/* Contextual Toolbar (Dynamic Buttons) */}
            {/* Disable toolbar actions (Re-execute, Edit) when viewing history. */}
          <ContextualToolbar node={node} disabled={isViewingHistory} />

            {/* Action: Return to Latest Version (Improves UX) */}
            {isViewingHistory && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={viewLatestVersion}
                      className="flex items-center gap-2"
                    >
                      <Undo2 className="h-4 w-4" />
                      Return to Latest
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop reviewing history and view the latest active version.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

          {/* Workflow Status Indicator */}
          <div className="flex items-center gap-3 border-l pl-6">
            {isSyncing && (
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing
              </span>
            )}
            <Badge
              variant="outline"
              className="text-xs uppercase tracking-wide"
            >
              Workflow {workflowStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* B1.1: Staleness Banner (Conditional) (Task 24.3) */}
      {showStalenessBanner && <StalenessBanner report={stalenessReport!} />}
    </div>
  );
}

