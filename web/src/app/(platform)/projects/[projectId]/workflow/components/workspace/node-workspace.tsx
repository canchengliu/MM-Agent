"use client";

import { useEffect } from "react";
import { Loader2, Workflow } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { ScrollArea } from "~/components/ui/scroll-area";
import { useStore } from "~/core/store";
import { WorkspaceHeader } from "./workspace-header";
import { NodeStatus, type WorkflowStatus } from "~/constants/enums";
import { InteractionTranscript } from "./interaction-transcript";
import { ActionFooter } from "./action-footer";
import { useTranscriptData } from "./useTranscriptData";
import { HITLInteractionManager } from "../hitl/hitl-interaction-manager";
import type { TemporaryExecutionRead } from "~/core/models/node.model";

interface NodeWorkspaceProps {
  workflowStatus: WorkflowStatus;
  isSyncing: boolean;
}

/**
 * B. Node Interaction Workspace (Center Panel).
 * Manages data fetching optimization for the active node and implements the B1/B2/B3 layout.
 * (Architecture 7.2, Design Doc 3.1.3.B)
 */
export function NodeWorkspace({
  workflowStatus,
  isSyncing,
}: NodeWorkspaceProps) {
  const { activeNodeId, fetchNodeDetails, nodeDetailsCache, nodesById } =
    useStore(
      useShallow((state) => ({
        activeNodeId: state.activeNodeId,
        fetchNodeDetails: state.fetchNodeDetails,
        nodeDetailsCache: state.nodeDetailsCache,
        nodesById: state.nodesById,
      })),
    );

  // 1. Basic info (NodeInstanceRead) - available instantly from normalized store
  const activeNodeBasic = activeNodeId ? nodesById.get(activeNodeId) : null;

  // 2. Detailed info (NodeDetailView) - fetched on demand and cached
  const activeNodeDetails = activeNodeId
    ? nodeDetailsCache.get(activeNodeId)
    : null;

  // 3. Fetch latest details when activeNodeId changes
  useEffect(() => {
    if (activeNodeId) {
      // Trigger fetch (non-blocking). The slice handles caching and errors (toasts).
      void fetchNodeDetails(activeNodeId);
    }
  }, [activeNodeId, fetchNodeDetails]);

  // 4. Determine the data source for the transcript (Handles historical vs latest)
  // This hook manages fetching historical data via the store if needed.
  const transcriptData = useTranscriptData(activeNodeDetails);

  // 5. Determine loading state and display data
  // We are loading initial details if we have an ID but not the details object yet.
  const isLoadingDetails = !!activeNodeId && !activeNodeDetails;

  // The transcript content is loading if initial details are loading OR if the hook reports loading (e.g., historical fetch).
  const isTranscriptLoading = isLoadingDetails || transcriptData.isLoading;

  // Use details if available, otherwise fallback to basic info if available.
  // This ensures responsiveness: basic info renders immediately while details load.
  const displayNode = activeNodeDetails ?? activeNodeBasic;

  // Handle Empty State (No node selected)
  if (!displayNode) {
    // If activeNodeId is null, it's empty. If activeNodeId is set but basic info is missing (e.g. data sync issue), also treat as empty/loading.
    return activeNodeId ? <LoadingWorkspace /> : <EmptyWorkspace />;
  }

  // (Task 18): Determine if HITL Manager is needed
  const isAwaitingHITL = displayNode.status === NodeStatus.AwaitingHITLApproval;

  // Define the main content (B2 and B3)
  const workspaceContent = (
    <>
      {/* B2: Content (Scrollable) - InteractionTranscript */}
      <ScrollArea className="flex-1">
        {isTranscriptLoading ? (
          // Loading State for Details within B2
          <div className="p-6">
            <LoadingWorkspaceDetails />
          </div>
        ) : (
          // Loaded State
          // We know activeNodeDetails must exist here if isTranscriptLoading is false (due to the hook implementation).
          // We pass the selected dataSource to the transcript.
          <InteractionTranscript
            node={activeNodeDetails!}
            dataSource={transcriptData}
          />
        )}
      </ScrollArea>

      {/* B3: Footer (Fixed Bottom, Conditional Visibility) */}
      {/* Visibility logic (HITL or Editing) is handled inside ActionFooter. */}
      {/* (Task 22): Pass nodeDetails for access to originalOutputData during Manual Edit reconstruction. */}
      <ActionFooter node={displayNode} nodeDetails={activeNodeDetails} />
    </>
  );

  // Render the workspace structure (Design Doc 3.1.3.B)
  // B1/B2/B3 Layout implementation using flex column.
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* B1: Header (Fixed Top) - Includes B1.1 Staleness Banner internally */}
      <WorkspaceHeader
        node={displayNode}
        isSyncing={isSyncing}
        workflowStatus={workflowStatus}
        isLoadingDetails={isTranscriptLoading}
        // Pass the staleness report from the details (only available when details are loaded)
        stalenessReport={activeNodeDetails?.staleness_report ?? null}
      />

      {/* Conditionally wrap B2 and B3 with HITLInteractionManager (Design Doc 3.1.1.E) */}
      {isAwaitingHITL ? (
        // When Awaiting HITL, provide the manager with the necessary context.
        // We use a key based on the node ID and its status to ensure the manager state resets
        // when the underlying state changes (e.g., navigating or after ReExecute which changes status).
        <HITLInteractionManager
          key={`${displayNode.id}-${displayNode.status}`}
          node={displayNode}
          // Determine the pending result source reliably for the manager.
          // Prioritize the transcriptData if it's pending, otherwise fallback to details.
          pendingResult={
            (transcriptData.isPending ? (transcriptData.data as TemporaryExecutionRead) : null) ??
            activeNodeDetails?.pending_result ??
            null
          }
        >
          {workspaceContent}
        </HITLInteractionManager>
      ) : (
        workspaceContent
      )}
    </div>
  );
}

// --- Helper Components for States ---

function EmptyWorkspace() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-12 text-center text-muted-foreground">
      <Workflow className="h-16 w-16 text-border" />
      <h3 className="mt-4 text-lg font-semibold">Select a Node</h3>
      <p className="text-sm mt-2 max-w-md">
        Choose a node from the Workflow Navigator (Panel A) to view its details,
        outputs, and interact with the execution.
      </p>
    </div>
  );
}

// Used when the entire workspace is loading (e.g. initial selection before basic info is available, though unlikely with current architecture)
function LoadingWorkspace() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="mt-4 text-sm">Loading workspace...</p>
    </div>
  );
}

// Used when basic info is available but details (B2 content) are loading
function LoadingWorkspaceDetails() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="ml-3 text-sm text-muted-foreground">
        Loading detailed execution data...
      </p>
    </div>
  );
}

