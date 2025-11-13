"use client";

import React, { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Save, X, Check, MessageSquare, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "~/components/ui/button";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import type { NodeDetailView } from "~/core/models/node.model"; // (Task 22): Import NodeDetailView
import { useStore } from "~/core/store";
import { HITLInteractionContext, type HITLInteractionContextType } from "../../hitl/hitl-interaction-manager";
import { NodeStatus } from "~/constants/enums";
import { ManualEditSaveDialog } from "./manual-edit-save-dialog"; // (Task 22): Import dialog

interface ActionFooterProps {
  // We can use NodeInstanceRead as status and ID are sufficient for the footer logic.
  node: NodeInstanceRead;
  // (Task 22): Pass details specifically for accessing original output data during Manual Edit
  nodeDetails: NodeDetailView | null;
}

/**
 * B3. Action Footer (Fixed Bottom, Conditional Visibility)
 * Provides primary actions for HITL Approval or Manual Editing mode.
 * (Design Doc 5.1.3.B3)
 */
export function ActionFooter({ node, nodeDetails }: ActionFooterProps) {
  // (Task 22): Access the full editing context from the store
  const {
    isEditing,
    stopEditing,
    isExecutingAction,
    viewingVersionId,
    localEditContent,
    baseEditContent,
    reconstructionStrategy
  } = useStore(
    useShallow((state) => ({
      // Check if we are editing THIS specific node
      isEditing: state.isEditing && state.activeNodeId === node.id,
      stopEditing: state.stopEditing,
      // isExecutingAction tracks API requests from the store (e.g. Manual Edit save)
      isExecutingAction: state.isExecutingAction,
      viewingVersionId: state.viewingVersionId,
      // (Task 22): Editing context managed by UIInteractionSlice
      localEditContent: state.localEditContent,
      baseEditContent: state.baseEditContent,
      reconstructionStrategy: state.outputReconstructionStrategy,
    })),
  );

  // (Task 22): State for the save dialog
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const isAwaitingHITL = node.status === NodeStatus.AwaitingHITLApproval;
  // HITL interactions are only allowed when viewing the latest state (not historical).
  const isViewingHistory = viewingVersionId !== null;

  // Footer visible in HITL (latest view only) or Editing Mode. (Design Doc 3.1.1.B)
  const showFooter = (isAwaitingHITL && !isViewingHistory) || isEditing;

  // (Task 22): Determine if changes were made.
  // localEditContent holds the latest (debounced) changes from the editor.
  // baseEditContent holds the content when the context was registered (the original content).
  // RichTextEditor's onCreate initializes localEditContent immediately.
  const currentEditorContent = localEditContent ?? baseEditContent ?? "";

  // Changes exist if the current content differs from the base content.
  // We must ensure baseEditContent is available for comparison (it should be if isEditing is true).
  const hasChanges = baseEditContent !== null && currentEditorContent !== baseEditContent;

  // (Task 22): Data required for saving the edit
  // We use the active_version_id from the basic node info (NodeInstanceRead).
  const baseVersionId = node.active_version_id;
  // We need the original output data for context-aware reconstruction.
  // We access this from nodeDetails (which should be available if viewing the latest version/editing).
  // We specifically look at the active_version's output_data within the details.
  const originalOutputData = nodeDetails?.active_version?.output_data;

  // Use HITLInteractionContext if available (provided by HITLInteractionManager when Awaiting HITL)
  // This context manages the state and actions for the HITL process.
  const hitlContext = React.useContext(HITLInteractionContext);

  // Design Doc 5.2.3.2: Action Footer Transition (B3)
  return (
    <>
    <AnimatePresence>
      {showFooter && (
        <motion.footer
          // Animation parameters: initial, animate, exit. Duration.FAST (0.2s), Easing.ENTER
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }} // "easeOut" often corresponds to Easing.ENTER
          // Styling: h-16 (64px), border-t, bg-card. (Design Doc 5.1.3.B3)
          className="flex h-16 shrink-0 items-center justify-between border-t bg-card px-6"
        >
          {isEditing ? (
            <EditingFooterActions
              stopEditing={stopEditing}
              isExecutingAction={isExecutingAction}
              onSave={() => setIsSaveDialogOpen(true)}
              hasChanges={hasChanges}
            />
          ) : (
            <HITLFooterActions
              hitlContext={hitlContext}
              // For HITL actions, we rely primarily on the context's isSubmitting state,
              // but also respect the global isExecutingAction as a fallback/safety measure.
              isGloballyExecuting={isExecutingAction}
            />
          )}
        </motion.footer>
      )}
    </AnimatePresence>

    {/* (Task 22): Manual Edit Save Dialog Portal */}
    {/* We render the dialog when editing, passing the full context required for reconstruction. */}
    {isEditing && (
        <ManualEditSaveDialog
            isOpen={isSaveDialogOpen}
            onClose={() => setIsSaveDialogOpen(false)}
            nodeId={node.id}
            baseVersionId={baseVersionId}
            baseEditContent={baseEditContent}
            localEditContent={localEditContent}
            originalOutputData={originalOutputData}
            reconstructionStrategy={reconstructionStrategy}
        />
    )}
    </>
  );
}

// --- Helper Components for Actions ---

interface EditingFooterActionsProps {
  stopEditing: () => void;
  isExecutingAction: boolean;
  // (Task 22): Added props for save action
  onSave: () => void;
  hasChanges: boolean;
}

// State: Manual Editing Mode (Design Doc 3.1.1.B)
function EditingFooterActions({ stopEditing, isExecutingAction, onSave, hasChanges }: EditingFooterActionsProps) {
  return (
    <>
      <div className="text-sm font-medium text-muted-foreground">
        {/* (Task 22): Indicate unsaved changes */}
        Editing Mode {hasChanges && <span className="text-foreground font-semibold">(Unsaved Changes)</span>}
      </div>
      {/* Layout: flex justify-end space-x-4. */}
      <div className="flex space-x-4">
        <Button
          variant="ghost"
          onClick={stopEditing}
          // Disable Cancel only if an action (like saving via the dialog) is already executing.
          disabled={isExecutingAction}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel Edit
        </Button>
        {/* (Task 22): Implement Save action trigger */}
        <Button
          variant="default"
          // Disable if saving OR if no changes detected
          disabled={isExecutingAction || !hasChanges}
          onClick={onSave}
        >
          <Save className="h-4 w-4 mr-2" />
          Save New Version
        </Button>
      </div>
    </>
  );
}

interface HITLFooterActionsProps {
  hitlContext: HITLInteractionContextType | null;
  isGloballyExecuting: boolean;
}

// State: Awaiting HITL Approval
function HITLFooterActions({ hitlContext, isGloballyExecuting }: HITLFooterActionsProps) {
  // Defensive check: If context is missing, the manager hasn't initialized (e.g., data still loading).
  if (!hitlContext) {
    return (
      <div className="w-full text-center text-sm text-muted-foreground italic">
        Loading HITL Controls...
      </div>
    );
  }

  const {
    handleApprove,
    handleReject,
    handleDiscard,
    isSubmitting,
    isInteractionValid,
  } = hitlContext;

  const isDisabled = isSubmitting || isGloballyExecuting;

  return (
    <>
      <div>
        {/* Secondary Actions: [Discard] (ghost) (H2.3) */}
        <Button
          variant="ghost"
          disabled={isDisabled}
          onClick={handleDiscard}
        >
          <Trash2 className="h-4 w-4" />
          Discard Execution
        </Button>
      </div>
      <div className="flex space-x-4">
        {/* Primary Actions: [Reject] (secondary) (H2.2) */}
        <Button
          variant="secondary"
          disabled={isDisabled}
          onClick={handleReject}
        >
          <MessageSquare className="h-4 w-4" />
          Reject & Provide Feedback
        </Button>
        {/* [Approve] (primary) (H2.1) */}
        <Button
          variant="default"
          // Approve is disabled if overall disabled OR if specific interaction data is invalid (e.g. SCA selection missing)
          disabled={isDisabled || !isInteractionValid}
          onClick={handleApprove}
        >
          <Check className="h-4 w-4" />
          Approve & Continue
        </Button>
      </div>
    </>
  );
}
