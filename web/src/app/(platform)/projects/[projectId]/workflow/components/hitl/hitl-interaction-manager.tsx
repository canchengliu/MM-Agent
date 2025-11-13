"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

import { useStore } from "~/core/store";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import type { HITLSubmission, TemporaryExecutionRead } from "~/core/models/node.model";
import { HITLAction, HITLMode, HITLResponseAction } from "~/constants/enums";

import { VARLPanel } from "./panels/varl-panel";
import { SCAPanel } from "./panels/sca-panel";
import { AVLPanel } from "./panels/avl-panel";
import { RejectFeedbackDialog } from "./reject-feedback-dialog";
import { DiscardConfirmationDialog } from "./discard-confirmation-dialog";

// Context for communication between HITL Zone (B2.4) and Action Footer (B3)
interface HITLInteractionContextType {
  node: NodeInstanceRead;
  pendingResult: TemporaryExecutionRead | null;
  // State managed by the panels (SCA, AVL)
  interactionData: Record<string, any> | null;
  setInteractionData: (data: Record<string, any> | null) => void;
  isInteractionValid: boolean; // Derived state for Continue button activation
  // Actions triggered by the footer
  handleApprove: () => Promise<void>;
  handleReject: () => void; // Opens dialog
  handleDiscard: () => void; // Opens dialog
  isSubmitting: boolean;
}

export const HITLInteractionContext = React.createContext<HITLInteractionContextType | null>(null);

export const useHITLInteraction = () => {
  const context = React.useContext(HITLInteractionContext);
  if (!context) {
    // This error is critical as it indicates a setup issue in NodeWorkspace
    throw new Error("useHITLInteraction must be used within a HITLInteractionManager");
  }
  return context;
};

interface HITLInteractionManagerProps {
  node: NodeInstanceRead;
  pendingResult: TemporaryExecutionRead | null;
  children: React.ReactNode; // Wraps Workspace content (B2 and B3)
}

/**
 * Manages the state and logic for HITL interactions.
 * Provides context for the HITL Zone (B2.4) and Action Footer (B3).
 * (Design Doc 3.1.1.E)
 */
export function HITLInteractionManager({ node, pendingResult, children }: HITLInteractionManagerProps) {
  const { submitHITL, selectNode } = useStore(
    useShallow((state) => ({
      submitHITL: state.submitHITL,
      selectNode: state.selectNode,
    }))
  );

  // State managed by the specific HITL panels (e.g. SCA selections)
  const [interactionData, setInteractionData] = useState<Record<string, any> | null>(null);
  // Local submission state tracker (distinct from global isExecutingAction)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog visibility states
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

  // (Task 19 Robustness): Reset interaction data if the node or its pending result changes (e.g., navigation, re-execution completes)
  // This prevents stale interaction data from affecting the new state.
  useEffect(() => {
    setInteractionData(null);
    // Also ensure dialogs are closed on navigation/data change
    setIsRejectDialogOpen(false);
    setIsDiscardDialogOpen(false);
  }, [node.id, pendingResult]);

  // Determine if the interaction data is valid for submission (Continue action)
  // This relies on the panels correctly setting interactionData (or null if invalid).
  const isInteractionValid = useMemo(() => {
    switch (node.hitl_mode) {
      case HITLMode.SCA:
      case HITLMode.AVL:
        // (Task 19, Task 20): SCA and AVL require interaction data to proceed (API 5.3).
        // If the panel has set interactionData (non-null), we assume it's valid according to the panel's internal logic (e.g., RHF validation, handling zero candidates).
        return interactionData !== null;
      case HITLMode.VARL:
      default:
        // VARL (basic approval) doesn't require specific interaction data.
        return true;
    }
  }, [node.hitl_mode, interactionData]);

  // --- Core Submission Handler (Design Doc 2.3.1) ---

  const handleSubmit = useCallback(async (submission: HITLSubmission) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // submitHITL handles the API call and error toasts.
      const response = await submitHITL(node.id, submission);

      if (response) {
        // Close dialogs upon successful submission
        setIsRejectDialogOpen(false);
        setIsDiscardDialogOpen(false);

        // Handle navigation based on the response action (API 5.3)
        switch (response.action) {
          case HITLResponseAction.ExecuteNext:
          case HITLResponseAction.NavigateNext:
            if (response.next_node_id) {
              // Navigate to the next node (Design Doc 2.3.1 Step A.6)
              selectNode(response.next_node_id);
            } else {
                console.warn("HITL Response indicated next node, but next_node_id was null.");
            }
            break;
          case HITLResponseAction.Completed:
            // Feedback handled by global WS listener, but immediate feedback is good UX.
            toast.success("Workflow Completed!");
            break;
          case HITLResponseAction.ReExecute:
          case HITLResponseAction.AVLLoop:
            // Design Doc 2.3.1 Step B.7
            // Stay on current node, wait for WebSocket updates (Status -> Executing).
            break;
          case HITLResponseAction.Discarded:
            // Stay on current node. State refresh handled by the store action (submitHITL).
            break;
          default:
            console.warn(`Unknown HITL response action: ${response.action}`);
        }
      }
    } catch (error) {
      // Errors are already handled within the submitHITL slice action.
      console.error("HITL Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [node.id, submitHITL, selectNode, isSubmitting]);

  // --- Action Handlers (Triggered by Footer) ---

  const handleApprove = useCallback(async () => {
    if (!isInteractionValid) {
        // This serves as a safeguard, the button should already be disabled.
      toast.error("Invalid Interaction", {
        description: "Please complete the required interactions (e.g., select an option) before approving.",
      });
      return;
    }

    const submission: HITLSubmission = {
      action: HITLAction.Continue,
      // API 5.3: interaction_data should be provided when required by the mode (SCA/AVL).
      interaction_data: interactionData,
    };
    await handleSubmit(submission);
  }, [isInteractionValid, interactionData, handleSubmit]);

  const handleReject = useCallback(() => {
    setIsRejectDialogOpen(true);
  }, []);

  const handleDiscard = useCallback(() => {
    setIsDiscardDialogOpen(true);
  }, []);

  // --- Dialog Submission Handlers ---

  const submitRejection = useCallback(async (data: { feedback_comment: string }) => {
    const submission: HITLSubmission = {
      action: HITLAction.RejectAndProvideModificationComments,
      feedback_comment: data.feedback_comment,
    };
    await handleSubmit(submission);
  }, [handleSubmit]);

  const confirmDiscard = useCallback(async () => {
    const submission: HITLSubmission = {
      action: HITLAction.Discard,
    };
    await handleSubmit(submission);
  }, [handleSubmit]);

  // Context Value
  const contextValue: HITLInteractionContextType = {
    node,
    pendingResult,
    interactionData,
    setInteractionData,
    isInteractionValid,
    handleApprove,
    handleReject,
    handleDiscard,
    isSubmitting,
  };

  return (
    <HITLInteractionContext.Provider value={contextValue}>
      {children}
      {/* Render dialogs controlled by this manager */}
      <RejectFeedbackDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onSubmit={submitRejection}
        isSubmitting={isSubmitting}
      />
      <DiscardConfirmationDialog
        isOpen={isDiscardDialogOpen}
        onClose={() => setIsDiscardDialogOpen(false)}
        onConfirm={confirmDiscard}
        isDiscarding={isSubmitting}
      />
    </HITLInteractionContext.Provider>
  );
}

/**
 * Dynamic renderer for the HITL Zone (B2.4).
 * Renders the appropriate panel based on the node's hitl_mode.
 * (Architecture 7.2.3)
 */
export function HITLPanelRenderer() {
  const { node, pendingResult } = useHITLInteraction();

  // Safeguard: Ensure pendingResult is available. output_data might be null if the node produced no output.
  if (!pendingResult) {
    return <div className="p-4 text-muted-foreground">Loading HITL interface or data missing...</div>;
  }

  // output_data can be null if the execution didn't produce any structured output.
  const outputData = pendingResult.output_data;

  switch (node.hitl_mode) {
    case HITLMode.SCA:
      // Implementation in Task 19
      return <SCAPanel outputData={outputData} />;
    case HITLMode.AVL:
      // Implementation in Task 20
      return <AVLPanel outputData={outputData} />;
    case HITLMode.VARL:
    default:
      return <VARLPanel outputData={outputData} />;
  }
}

