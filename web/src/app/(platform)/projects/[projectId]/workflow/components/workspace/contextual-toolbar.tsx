"use client";

import { useState } from "react";
import { Edit2, RotateCcw, RotateCw, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { useStore } from "~/core/store";
import { Loader2 } from "lucide-react";
import { ExecutionDialog, type ExecutionType } from "./execution-dialog";

interface ContextualToolbarProps {
  node: NodeInstanceRead;
  disabled?: boolean; // (Task 21): Optional prop to disable all actions (e.g., when viewing history)
}

/**
 * Renders action buttons based on the node's current state and type, wiring them to store actions.
 * (Design Doc 3.1.3.B1, 5.1.5 State Variations)
 */
export function ContextualToolbar({ node, disabled: externalDisabled = false }: ContextualToolbarProps) {
  // State for managing the Execution Dialog (Task 17.4)
  const [executionDialogState, setExecutionDialogState] = useState<{
    isOpen: boolean;
    type: ExecutionType | null;
  }>({ isOpen: false, type: null });

  // (Task 22): Determine if the editing context is ready in the store.
  // This ensures the "Manual Edit" button is only enabled when OutputBlock has loaded and registered the context.
  const isEditContextReady = useStore(
    (state) => state.outputReconstructionStrategy !== null && state.baseEditContent !== null
  );

  const {
    isExecutingAction,
    isCancelling,
    cancelNode,
    startEditing,
    isEditing,
  } = useStore(
    useShallow((state) => ({
      isExecutingAction: state.isExecutingAction,
      // Check if this specific node is pending cancellation (Task 17.5)
      isCancelling: state.pendingCancellationNodeIds.has(node.id),
      cancelNode: state.cancelNode,
      startEditing: state.startEditing,
      // Check if we are currently editing THIS specific node
      isEditing: state.isEditing && state.activeNodeId === node.id,
    })),
  );

  // Handlers for opening/closing the dialog
  const handleOpenReExecute = () => {
    setExecutionDialogState({ isOpen: true, type: "Re-execute" });
  };

  const handleOpenRetry = () => {
    setExecutionDialogState({ isOpen: true, type: "Retry" });
  };

  const handleCloseDialog = () => {
    setExecutionDialogState({ isOpen: false, type: null });
  };

  // Check if a global action is ongoing (API call), but suppress if the dialog is open.
  const isActionExecutingWhileDialogClosed = isExecutingAction && !executionDialogState.isOpen;

  // If an action is currently executing, show a processing indicator (Task 17.3).
  // We prioritize the specific "Cancelling" UI (handled below in the button logic), so we exclude it here.
  if (isActionExecutingWhileDialogClosed && !isCancelling) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </div>
    );
  }

  // Global disable state: if we are currently editing the node (actions move to footer B3) OR externally disabled (e.g., viewing history)
  const disabled = isEditing || externalDisabled;

  // Design Doc 2.1.2.A: Generator nodes have behavioral restrictions (W3.2).
  const isGenerator = node.node_type === "Generator";
  const generatorMessage =
    "Generator nodes define workflow structure and cannot be modified or re-executed independently.";

  // (Task 22): Determine if manual edit is allowed and the reason if not.
  const canManualEdit = !isGenerator && isEditContextReady;
  let manualEditDisabledReason = "";
  if (isGenerator) manualEditDisabledReason = generatorMessage;
  // Show loading reason only if not otherwise disabled (e.g. by viewing history)
  else if (!isEditContextReady && !disabled) manualEditDisabledReason = "Loading output context required for editing...";

  // Logic based on Design Doc 3.1.3.B (State Variations) and API specs.

  let content = null;

  if (node.status === "Executing") {
    // State: Executing -> Show [Cancel Execution] (API 5.2.3) or [Cancelling...]

    if (isCancelling) {
      // Design Doc 3.1.2.C.4 Step 1: Button immediately becomes "Cancelling..." and disabled.
      content = (
        <Button
          variant="destructive"
          size="sm"
          disabled={true}
          // Apply semantic color (Orange) via text color utility if needed, though 'destructive' variant handles the main color.
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Cancelling...
        </Button>
      );
    } else {
      content = (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => cancelNode(node.id)}
          // Allow canceling even if editing (though unlikely state combination)
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          Cancel Execution
        </Button>
      );
    }
  } else if (node.status === "Failed" || node.status === "Canceled") {
    // State: Failed/Canceled -> Show [Retry] (API 5.2.2)
    content = (
      <Button
        variant="secondary"
        size="sm"
        // Open dialog to allow optional comments (API 5.2.2)
        onClick={handleOpenRetry}
        disabled={disabled}
      >
        <RotateCw className="h-4 w-4" />
        Retry
      </Button>
    );
  } else if (node.status === "Completed") {
    // State: Completed (Review Mode)
    // Standard nodes show [Manual Edit] (API 5.4.1) and [Re-execute] (API 5.2.1)
    content = (
      <div className="flex gap-2">
        {/* Manual Edit Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Span wrapper is required for tooltips on disabled buttons */}
            <span>
              <Button
                variant="outline"
                size="sm"
                // startEditing triggers UI state change in UIInteractionSlice
                onClick={startEditing}
                // (Task 22): Disabled if globally disabled OR if conditions for manual edit are not met.
                disabled={disabled || !canManualEdit}
              >
                {/* (Task 22) Show loader if context is not ready (loading) but button is otherwise enabled */}
                {!isEditContextReady && !disabled ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                    <Edit2 className="h-4 w-4 mr-2" />
                )}
                Manual Edit
              </Button>
            </span>
          </TooltipTrigger>
          {/* (Task 22) Show tooltip with reason if disabled and reason exists */}
          {!canManualEdit && manualEditDisabledReason && <TooltipContent>{manualEditDisabledReason}</TooltipContent>}
        </Tooltip>

        {/* Re-execute Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="default" // Using primary (default) for Re-execute
                size="sm"
                // Open dialog to allow optional comments (API 5.2.1, Task 17.4)
                onClick={handleOpenReExecute}
                disabled={disabled || isGenerator}
              >
                <RotateCcw className="h-4 w-4" />
                Re-execute
              </Button>
            </span>
          </TooltipTrigger>
          {isGenerator && <TooltipContent>{generatorMessage}</TooltipContent>}
        </Tooltip>
      </div>
    );
  }

  // Awaiting HITL Approval (actions in B3), Not Started, or other states have no actions in B1.
  return (
    <>
      <TooltipProvider>{content}</TooltipProvider>
      {/* Render the dialog portal if open */}
      {executionDialogState.type && (
        <ExecutionDialog
          isOpen={executionDialogState.isOpen}
          onClose={handleCloseDialog}
          nodeId={node.id}
          nodeName={node.name}
          type={executionDialogState.type}
          // baseVersionId is omitted here as ContextualToolbar operates on the active version by default (API 5.2.1).
        />
      )}
    </>
  );
}

