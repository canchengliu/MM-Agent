"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import type {
  AVLInteractionData,
  SCAInteractionData,
} from "~/core/domain";
import type { HITLSubmission } from "~/core/domain/hitl.types";

import { useSubmitHITL } from "../hooks/useHITL";

type InteractionPayload =
  | SCAInteractionData
  | AVLInteractionData
  | Record<string, unknown>
  | null;

interface HITLActionBarProps {
  nodeId: number;
  workflowId: number;
  getInteractionData: () => InteractionPayload;
  isApprovalReady: boolean;
}

export function HITLActionBar({
  nodeId,
  workflowId,
  getInteractionData,
  isApprovalReady,
}: HITLActionBarProps) {
  const [isRejectionOpen, setIsRejectionOpen] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const { mutate: submit, isPending: isSubmitting } = useSubmitHITL(workflowId);

  const handleApprove = useCallback(() => {
    if (isSubmitting) return;
    const interactionData = getInteractionData();
    if (!interactionData) {
      toast.error("Cannot approve: missing required interaction data.");
      return;
    }
    const submission: HITLSubmission = {
      action: "Continue",
      interaction_data: interactionData,
    };
    submit({ nodeId, submission });
  }, [getInteractionData, nodeId, submit, isSubmitting]);

  const handleReject = useCallback(() => {
    if (isSubmitting) return;
    if (!feedbackComment.trim()) {
      toast.error("Please provide feedback comments to reject.");
      return;
    }
    const submission: HITLSubmission = {
      action: "RejectAndProvideModificationComments",
      feedback_comment: feedbackComment,
    };
    submit({ nodeId, submission });
    setIsRejectionOpen(false);
    setFeedbackComment("");
  }, [feedbackComment, nodeId, submit, isSubmitting]);

  const handleDiscard = useCallback(() => {
    if (isSubmitting) return;
    const submission: HITLSubmission = {
      action: "Discard",
    };
    submit({ nodeId, submission });
  }, [nodeId, submit, isSubmitting]);

  return (
    <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t bg-card p-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isSubmitting}>
            Discard
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to discard?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard the current pending results and roll the node
              back to its previous state. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard}>
              Confirm Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isRejectionOpen} onOpenChange={setIsRejectionOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={isSubmitting}>
            Reject &amp; Revise
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback for Revision</DialogTitle>
            <DialogDescription>
              Explain what you would like the AI to change in the next iteration.
              Your comments will guide the revision process.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={feedbackComment}
            onChange={(event) => setFeedbackComment(event.target.value)}
            placeholder={'e.g., "Focus more on the long-term impact instead of short-term costs."'}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectionOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        onClick={handleApprove}
        disabled={!isApprovalReady || isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Approve &amp; Continue
      </Button>
    </div>
  );
}
