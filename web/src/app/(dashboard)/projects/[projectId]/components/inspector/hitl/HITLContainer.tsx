"use client";

import { AlertOctagon, CheckCircle2, Loader2, MessageCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "~/components/platform";
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
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import type {
  HitlInteractionData,
  HitlSubmissionResult,
  HitlAction,
  HitlMode,
  HITLSubmission,
  NodeDetailView,
  TemporaryExecutionRead,
} from "~/core/api";
import { useWorkflowStore } from "~/core/store/WorkflowStore";

import { AVLInterface } from "./AVLInterface";
import { SCAInterface } from "./SCAInterface";
import { VARLInterface } from "./VARLInterface";

type HitlInterfaceComponent = React.ComponentType<HitlInterfaceProps>;

interface HitlInterfaceProps {
  node: NodeDetailView;
  pendingResult: TemporaryExecutionRead;
  onInteractionChange: (data: HitlInteractionData | null, meta?: { isValid?: boolean }) => void;
}

const INTERFACES: Partial<Record<HitlMode, HitlInterfaceComponent>> = {
  SCA: SCAInterface,
  AVL: AVLInterface,
  VARL: VARLInterface,
};

interface HITLContainerProps {
  node: NodeDetailView;
  pendingResult: TemporaryExecutionRead | null;
}

interface InteractionState {
  data: HitlInteractionData | null;
  isValid: boolean;
}

const DEFAULT_INTERACTION_STATE: InteractionState = {
  data: null,
  isValid: false,
};

export function HITLContainer({ node, pendingResult }: HITLContainerProps) {
  const InterfaceComponent = pendingResult ? INTERFACES[node.hitl_mode] : undefined;
  const submitHITL = useWorkflowStore((state) => state.submitHITL);
  const [interactionState, setInteractionState] = useState<InteractionState>(DEFAULT_INTERACTION_STATE);
  const [pendingAction, setPendingAction] = useState<HitlAction | null>(null);
  const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    setInteractionState(DEFAULT_INTERACTION_STATE);
  }, [InterfaceComponent, node.id, pendingResult?.output_data]);

  const handleInteractionChange = useCallback<HitlInterfaceProps["onInteractionChange"]>((data, meta) => {
    setInteractionState({
      data,
      isValid: meta?.isValid ?? data !== null,
    });
  }, []);

  const isSubmitting = pendingAction !== null;

  const handleSubmit = useCallback(
    async (action: HitlAction, payload: Omit<HITLSubmission, "action"> = {}) => {
      if (pendingAction) return false;
      setPendingAction(action);
      try {
        const result = await submitHITL(node.id, { action, ...payload });
        handleSuccessToast(result);
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to submit your review. Please retry shortly.";
        toast.error(message);
        return false;
      } finally {
        setPendingAction(null);
      }
    },
    [node.id, pendingAction, submitHITL],
  );

  const handleApprove = useCallback(() => {
    if (!interactionState.isValid || !pendingResult) return;
    void handleSubmit("Continue", { interaction_data: interactionState.data ?? undefined });
  }, [handleSubmit, interactionState, pendingResult]);

  const handleReject = useCallback(async () => {
    const comment = rejectComment.trim();
    if (!comment) return;
    const ok = await handleSubmit("RejectAndProvideModificationComments", { feedback_comment: comment });
    if (ok) {
      setRejectComment("");
      setRejectDialogOpen(false);
    }
  }, [handleSubmit, rejectComment]);

  const handleDiscard = useCallback(() => {
    void handleSubmit("Discard");
  }, [handleSubmit]);

  const approveDisabled = !pendingResult || !interactionState.isValid || isSubmitting;
  const emptyState = !pendingResult;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
            HITL Review
          </p>
          <div className="text-base font-semibold text-foreground">{node.stage_name}</div>
          <p className="text-xs text-muted-foreground">
            Mode: <span className="font-semibold text-foreground/80">{node.hitl_mode}</span>
          </p>
        </div>
        <StatusBadge status={node.status} />
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {emptyState ? (
            <MissingResultNotice />
          ) : InterfaceComponent ? (
            <InterfaceComponent
              node={node}
              pendingResult={pendingResult}
              onInteractionChange={handleInteractionChange}
            />
          ) : (
            <UnsupportedModeNotice mode={node.hitl_mode} />
          )}
        </div>

        <footer className="border-t border-border/70 bg-card/90 px-5 py-4">
          <ActionBar
            approveDisabled={approveDisabled}
            pendingAction={pendingAction}
            onApprove={handleApprove}
            onReject={() => setRejectDialogOpen(true)}
            onDiscard={handleDiscard}
            discardDisabled={isSubmitting || emptyState}
            rejectDisabled={isSubmitting || emptyState}
          />
        </footer>
      </div>

      <RejectDialog
        open={isRejectDialogOpen}
        isSubmitting={pendingAction === "RejectAndProvideModificationComments"}
        comment={rejectComment}
        onCommentChange={setRejectComment}
        onClose={() => {
          if (isSubmitting) return;
          setRejectDialogOpen(false);
        }}
        onSubmit={handleReject}
      />
    </div>
  );
}

function handleSuccessToast(result: HitlSubmissionResult) {
  const message = result.message || "Review submitted.";
  switch (result.action) {
    case "ExecuteNext":
      toast.success(message, { description: "Next node started automatically." });
      break;
    case "NavigateNext":
      toast.success(message, { description: "Focus moved to the next node for review." });
      break;
    case "Completed":
      toast.success(message);
      break;
    case "Discarded":
      toast.info(message);
      break;
    case "ReExecute":
    case "AVLLoop":
      toast.success(message, { description: "The node is re-executing. Sit tight for updates." });
      break;
    default:
      toast.success(message);
  }
}

interface ActionBarProps {
  pendingAction: HitlAction | null;
  approveDisabled: boolean;
  discardDisabled: boolean;
  rejectDisabled: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDiscard: () => void;
}

function ActionBar({
  pendingAction,
  approveDisabled,
  discardDisabled,
  rejectDisabled,
  onApprove,
  onReject,
  onDiscard,
}: ActionBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">
        Provide clear guidance—your input directs the orchestration of the next execution step.
      </div>
      <div className="flex flex-wrap gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={discardDisabled}
              className="border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Discard
            </Button>
          </AlertDialogTrigger>
          <DiscardDialogContent onConfirm={onDiscard} isSubmitting={pendingAction === "Discard"} />
        </AlertDialog>
        <Button type="button" variant="secondary" disabled={rejectDisabled} onClick={onReject}>
          {pendingAction === "RejectAndProvideModificationComments" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <MessageCircle className="size-4" />
              Reject &amp; Modify
            </>
          )}
        </Button>
        <Button type="button" onClick={onApprove} disabled={approveDisabled}>
          {pendingAction === "Continue" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Approve &amp; Continue
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function MissingResultNotice() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
      <AlertOctagon className="size-6 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">HITL payload unavailable</p>
        <p>Refresh the node to fetch the pending result before taking action.</p>
      </div>
    </div>
  );
}

function UnsupportedModeNotice({ mode }: { mode: HitlMode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
      <AlertOctagon className="size-6 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">Unsupported HITL mode</p>
        <p>
          Mode <span className="font-semibold text-foreground/90">{mode}</span> is not available yet. Please retry after
          the next milestone.
        </p>
      </div>
    </div>
  );
}

interface RejectDialogProps {
  open: boolean;
  isSubmitting: boolean;
  comment: string;
  onCommentChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function RejectDialog({ open, isSubmitting, comment, onCommentChange, onClose, onSubmit }: RejectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : void 0)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject &amp; request modifications</DialogTitle>
          <DialogDescription>
            Explain what needs to change. The orchestration engine will launch a new execution with your guidance.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="Outline the gaps, risks, or missing considerations..."
          rows={6}
          aria-label="Modification feedback"
        />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onSubmit}
            disabled={isSubmitting || comment.trim().length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              <>
                <MessageCircle className="size-4" aria-hidden="true" />
                Submit feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DiscardDialogContent({
  onConfirm,
  isSubmitting,
}: {
  onConfirm: () => void;
  isSubmitting: boolean;
}) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Discard this execution?</AlertDialogTitle>
        <AlertDialogDescription>
          Pending results will be deleted and the node will revert to its previous state. Downstream nodes will remain
          unchanged.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel asChild>
          <Button type="button" variant="ghost" disabled={isSubmitting}>
            Cancel
          </Button>
        </AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Discarding...
              </>
            ) : (
              <>
                <Trash2 className="size-4" aria-hidden="true" />
                Discard execution
              </>
            )}
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
