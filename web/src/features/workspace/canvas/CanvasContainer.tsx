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

    // 6. Default view: Show the main graph if a workflow is loaded
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
