"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Smartphone } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useWorkspaceStore } from "~/core/store/workspace.store";
import { HITLController } from "~/features/hitl/HITLController";
import { ManualEditor } from "~/features/versioning/components/ManualEditor";
import { VersionReviewView } from "~/features/versioning/components/VersionReviewView";
import { ExecutionGraph } from "~/features/workflow-graph/execution-view/ExecutionGraph";
import {
  useNodeDetail,
  useVersionDetail,
} from "~/features/workspace/hooks/useWorkflowData";
import { useBreakpoint } from "~/hooks/use-breakpoint";

const HistoryGraph = () => (
  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
    <p>
      Placeholder for the{" "}
      <strong className="text-foreground">History Graph View</strong>.
    </p>
  </div>
);
const ExecutionLoadingView = ({
  node,
}: {
  node: { status: string; current_stage: string | null };
}) => (
  <div className="flex h-full flex-col items-center justify-center gap-4">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
    <p className="font-semibold">{node.status}...</p>
    <p className="text-sm text-muted-foreground">
      {node.current_stage ?? "Processing"}
    </p>
  </div>
);

const MobileGraphDisabledMessage = () => (
  <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
    <Smartphone className="h-12 w-12 text-muted-foreground/50" />
    <h3 className="font-semibold">Graph View Disabled</h3>
    <p className="text-sm text-muted-foreground">
      The interactive workflow graph is not available on this screen size.
    </p>
  </div>
);

export function CanvasContainer({ workflowId }: { workflowId: number }) {
  const {
    focusedNodeId,
    inspectedVersionId,
    viewMode,
    isManualEditing,
    setManualEditing,
  } = useWorkspaceStore();
  const { data: node, isLoading: isLoadingNode } = useNodeDetail(focusedNodeId);
  const breakpoint = useBreakpoint();

  const rawBaseVersionId = inspectedVersionId ?? node?.active_version_id ?? null;
  const baseVersionId = rawBaseVersionId ?? null;
  const numericBaseVersionId =
    baseVersionId === null ? null : Number(baseVersionId);
  const hasInspectedVersion =
    inspectedVersionId !== null && inspectedVersionId !== undefined;
  const requiresBaseVersionFetch = hasInspectedVersion
    ? true
    : !node?.active_version;
  const shouldFetchBaseVersion = Boolean(
    isManualEditing &&
      focusedNodeId &&
      numericBaseVersionId &&
      requiresBaseVersionFetch,
  );

  const {
    data: fetchedBaseVersion,
    isLoading: isLoadingBaseVersion,
    isError: isBaseVersionError,
  } = useVersionDetail(
    shouldFetchBaseVersion ? focusedNodeId : null,
    shouldFetchBaseVersion ? numericBaseVersionId : null,
  );

  const renderContent = () => {
    if (isManualEditing) {
      if (!focusedNodeId) {
        setManualEditing(false);
        return null;
      }

      if (!numericBaseVersionId) {
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <h3 className="text-lg font-semibold text-destructive">
              Cannot Start Manual Edit
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              No base version is available. Inspect a historical version or wait
              for an active version to be created before editing.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManualEditing(false)}
            >
              Go Back
            </Button>
          </div>
        );
      }

      if (
        (isLoadingNode && !node) ||
        (shouldFetchBaseVersion && isLoadingBaseVersion)
      ) {
        return (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading version data for editing...</p>
          </div>
        );
      }

      if (isBaseVersionError) {
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <h3 className="text-lg font-semibold text-destructive">
              Failed to Load Version
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              There was an issue loading the selected version for manual
              editing. Please try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManualEditing(false)}
            >
              Go Back
            </Button>
          </div>
        );
      }

      const baseVersion =
        inspectedVersionId || !node?.active_version
          ? fetchedBaseVersion
          : node.active_version;

      if (!baseVersion) {
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <h3 className="text-lg font-semibold text-destructive">
              Version Data Missing
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              A base version could not be located. Select a version in the
              history tab before starting a manual edit.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManualEditing(false)}
            >
              Go Back
            </Button>
          </div>
        );
      }

      return (
        <ManualEditor
          baseVersion={baseVersion}
          workflowId={workflowId}
          onCancel={() => setManualEditing(false)}
          onSaveSuccess={() => {
            setManualEditing(false);
          }}
        />
      );
    }

    if (viewMode === "HistoryGraph") {
      if (breakpoint === "sm") {
        return <MobileGraphDisabledMessage />;
      }
      return <HistoryGraph />;
    }

    if (inspectedVersionId && focusedNodeId) {
      return (
        <VersionReviewView
          nodeId={focusedNodeId}
          versionId={inspectedVersionId}
          workflowId={workflowId}
          isActiveVersion={inspectedVersionId === node?.active_version_id}
        />
      );
    }

    if (isLoadingNode && focusedNodeId) {
      return (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (focusedNodeId && node) {
      switch (node.status) {
        case "Awaiting HITL Approval":
          return <HITLController node={node} workflowId={workflowId} />;
        case "Executing":
          return <ExecutionLoadingView node={node} />;
        default:
          break;
      }
    }

    if (breakpoint === "sm") {
      return <MobileGraphDisabledMessage />;
    }
    return <ExecutionGraph workflowId={workflowId} />;
  };

  const animationKey = `${viewMode}-${focusedNodeId}-${inspectedVersionId}-${isManualEditing}`;

  return (
    <div className="h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
