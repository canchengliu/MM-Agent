import React from "react";
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
import { Loader2 } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";

interface DiscardConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDiscarding: boolean;
}

/**
 * Confirmation dialog for discarding the current execution attempt (H2.3).
 * Implemented as a controlled component managed by HITLInteractionManager.
 */
export function DiscardConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isDiscarding,
}: DiscardConfirmationDialogProps) {
  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the default Radix behavior of closing immediately,
    // allowing us to manage the loading state during the async operation.
    e.preventDefault();
    await onConfirm();
    // The dialog will close automatically when the manager updates its state (isDiscarding=false, isOpen=false)
  };

  const handleOpenChange = (open: boolean) => {
    // Prevent closing while the operation is in progress
    if (!isDiscarding && !open) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard Execution Attempt?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the results
            of the current execution attempt and roll back the node state.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDiscarding}>Cancel</AlertDialogCancel>
          {/* Manually handle confirmation to manage loading state */}
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDiscarding}
            // Apply destructive variant styles manually as AlertDialogAction defaults to primary
            className={buttonVariants({ variant: "destructive" })}
          >
            {isDiscarding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

