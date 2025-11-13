"use client";

import { useEffect, useState } from "react";
import { Loader2, History as HistoryIcon, RefreshCw, AlertTriangle, Info } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { LayoutGroup } from "framer-motion";

import { useStore } from "~/core/store";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { VersionCard } from "./version-card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import type { NodeVersionRead } from "~/core/models/node.model";
import { NodeType } from "~/constants/enums";

interface VersionHistoryPanelProps {
  activeNode: NodeInstanceRead;
}

/**
 * C. Version History Panel (Right Sidebar Content).
 * Manages the fetching, display, and activation of the version history list.
 * (Design Doc 5.1.4, Architecture 7.3)
 */
export function VersionHistoryPanel({ activeNode }: VersionHistoryPanelProps) {
  // Access state and actions from Zustand
  const {
    viewingVersionId,
    viewHistoricalVersion,
    viewLatestVersion,
    fetchNodeVersionList,
    nodeVersionListCache,
    // (Task 23.1): Access activation action and status
    activateVersion,
    isExecutingAction,
  } = useStore(
    useShallow((state) => ({
      viewingVersionId: state.viewingVersionId,
      viewHistoricalVersion: state.viewHistoricalVersion,
      viewLatestVersion: state.viewLatestVersion,
      fetchNodeVersionList: state.fetchNodeVersionList,
      nodeVersionListCache: state.nodeVersionListCache,
      activateVersion: state.activateVersion,
      isExecutingAction: state.isExecutingAction,
    })),
  );

  // (Task 23.3): State for managing the activation confirmation dialog
  const [pendingActivation, setPendingActivation] = useState<NodeVersionRead | null>(null);

  const nodeId = activeNode.id;
  const activeVersionId = activeNode.active_version_id;

  // Retrieve the version list from the cache.
  const versions = nodeVersionListCache.get(nodeId);

  const isLoading = versions === undefined;
  const isError = versions === null;

  // Fetch the version list when the panel becomes visible (nodeId changes).
  useEffect(() => {
    // Trigger fetch (non-blocking). The slice handles caching logic.
    void fetchNodeVersionList(nodeId);
  }, [nodeId, fetchNodeVersionList]);


  // Handle Review interaction (Design Doc 3.1.1.C.1)
  const handleReview = (versionId: number) => {
    if (versionId === activeVersionId) {
      viewLatestVersion();
    } else {
      viewHistoricalVersion(versionId);
    }
  };

  // (Task 23.2 Restriction): Determine if activation is forbidden (Generator nodes - API 5.4.2, W3.2)
  const isActivationForbidden = activeNode.node_type === NodeType.Generator;

  // Handle Activation interaction (Design Doc 3.1.1.C.2, Task 23.3)
  const handleActivateRequest = (version: NodeVersionRead) => {
    // Double-check restrictions before opening dialog
    if (isExecutingAction || isActivationForbidden) return;

    // Open confirmation dialog by setting the pending activation state
    setPendingActivation(version);
  };

  // Handler for confirming activation in the dialog (Task 23.4)
  const confirmActivation = async () => {
    if (pendingActivation) {
      // Call the store action (API 5.4.2). State updates rely on WebSocket (NODE_ACTIVE_VERSION_CHANGED).
      const success = await activateVersion(nodeId, pendingActivation.id);
      if (success) {
        setPendingActivation(null);
      }
      // If failed, keep dialog open so user can see potential toast error (handled in slice) and retry/cancel.
    }
  };

  // --- Render States ---

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    // Pass force=true to retry the fetch
    return <ErrorState onRetry={() => fetchNodeVersionList(nodeId, true)} />;
  }

  // We know versions is an array here (not undefined or null)
  if (versions.length === 0) {
    return <EmptyState />;
  }

  // --- Main Content ---

  return (
    <>
      {/* (Task 23.5): Wrap in LayoutGroup to enable Framer Motion layout animations (Design Doc 5.2.4) */}
      <LayoutGroup>
        <div className="space-y-4 p-4">
            {/* (Task 23 Enhancement): Display informative alert if activation is forbidden (W3.2) */}
            {isActivationForbidden && (
                <Alert className="mb-2 bg-secondary/50 border-border">
                    <Info className="h-4 w-4 text-foreground" />
                    <AlertTitle className="text-sm font-medium text-foreground">Version Switching Disabled</AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground">
                        {/* Requirement W3.2 rationale */}
                        Generator nodes cannot be reverted to ensure workflow consistency.
                    </AlertDescription>
                </Alert>
            )}

            {/* API 5.1.2 returns versions in reverse chronological order (descending). */}
            {versions.map((version) => {
                const isActive = version.id === activeVersionId;
                // Determine if this version is currently being viewed in the workspace.
                const isViewing = viewingVersionId === version.id || (viewingVersionId === null && isActive);

                // Determine the reason for disabling, if any.
                let disableReason: string | undefined = undefined;
                if (isActivationForbidden) {
                    disableReason = "Version switching is disabled for Generator nodes.";
                } else if (isExecutingAction) {
                    disableReason = "An action is currently in progress.";
                }

                return (
                <VersionCard
                    key={version.id}
                    version={version}
                    isActive={isActive}
                    isViewing={isViewing}
                    onReview={() => handleReview(version.id)}
                    onActivate={() => handleActivateRequest(version)}
                    // Disable if an action is ongoing OR if it's a forbidden node type.
                    disabled={isExecutingAction || isActivationForbidden}
                    disableReason={disableReason}
                />
                );
            })}
        </div>
      </LayoutGroup>

      {/* Confirmation Dialog (Task 23.3) */}
      <ActivationConfirmationDialog
        version={pendingActivation}
        onConfirm={confirmActivation}
        onCancel={() => setPendingActivation(null)}
        // Show loading state if activation is pending AND the global action flag is set.
        isActivating={isExecutingAction && !!pendingActivation}
      />
    </>
  );
}

// --- Helper Components for States ---

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="ml-3 text-sm">Loading history...</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4"/>
        <AlertTitle>Error Loading History</AlertTitle>
        <AlertDescription>
          Could not fetch the version history.
        </AlertDescription>
        <Button variant="destructive" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2"/> Retry
        </Button>
      </Alert>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
      <HistoryIcon className="h-12 w-12 text-border" />
      <p className="mt-4 text-sm">No version history found for this node.</p>
    </div>
  );
}

// --- Activation Confirmation Dialog ---

interface ActivationConfirmationDialogProps {
  version: NodeVersionRead | null;
  onConfirm: () => void;
  onCancel: () => void;
  isActivating: boolean;
}

/**
 * Confirmation dialog for version activation. (Task 23.3)
 * Implements the mandatory confirmation mechanism and wording.
 * (Design Doc 3.3.D.4 / 5.1.4.C2)
 */
function ActivationConfirmationDialog({
  version,
  onConfirm,
  onCancel,
  isActivating,
}: ActivationConfirmationDialogProps) {
  if (!version) return null;

  return (
    // Control open state based on whether a version is pending activation.
    // Prevent closing dialog while activation API call is in progress.
    <AlertDialog open={!!version} onOpenChange={(open) => !open && !isActivating && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Design Doc 3.3.D.4 Title */}
          <AlertDialogTitle>
            Activate Version V{version.version_number}?
          </AlertDialogTitle>
          {/* Required text from Design Doc 3.3.D.4 Body (Emphasizing non-cascading updates and Staleness) */}
          <AlertDialogDescription>
            Activating this version will change the node&apos;s output.
            Downstream nodes will be marked as &apos;Stale&apos; and will{" "}
            <strong>NOT</strong> be automatically updated. Do you wish to
            proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Disable buttons during the API call */}
          <AlertDialogCancel disabled={isActivating}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isActivating}>
            {isActivating && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {/* Design Doc 3.3.D.4 Action Button */}
            Activate V{version.version_number}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

