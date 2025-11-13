"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, Loader2, AlertTriangle } from "lucide-react";

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
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useStore } from "~/core/store";
import type { ManualEditSubmission } from "~/core/models/node.model";
import type { OutputReconstructionStrategy } from "~/core/store/slices/ui-interaction.slice";

// (Task 22): Dialog for confirming Manual Edit save and entering summary (Design Doc 3.1.1.D).

const FormSchema = z.object({
  // Summary is optional (API 5.4.1) but encouraged
  summary: z.string().max(500, "Summary must be 500 characters or less").optional(),
});

type FormData = z.infer<typeof FormSchema>;

interface ManualEditSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: number;
  baseVersionId: number | null;
  // Data required for reconstruction, provided by ActionFooter from the store context
  baseEditContent: string | null;
  localEditContent: string | null;
  originalOutputData: Record<string, unknown> | string | null | undefined;
  reconstructionStrategy: OutputReconstructionStrategy | null;
}

export function ManualEditSaveDialog({
  isOpen,
  onClose,
  nodeId,
  baseVersionId,
  baseEditContent,
  localEditContent,
  originalOutputData,
  reconstructionStrategy,
}: ManualEditSaveDialogProps) {
  const { manualEdit, isExecutingAction } = useStore((state) => ({
    manualEdit: state.manualEdit,
    // We rely on the global execution state which is set by the manualEdit action.
    isExecutingAction: state.isExecutingAction,
  }));

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      summary: "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      reset({ summary: "" });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    // 1. Validations (Critical checks before proceeding)
    if (baseVersionId === null) {
        toast.error("Cannot save edit: Base version ID is missing. Please refresh.");
        return;
    }
    if (!reconstructionStrategy) {
        toast.error("Cannot save edit: Reconstruction strategy is missing. Please try canceling and editing again.");
        return;
    }

    // Determine the final content from the editor. localEditContent holds the latest (debounced) changes.
    // If localEditContent is null, it means initialization is pending (should be handled by RichTextEditor onCreate).
    // We use baseEditContent as a fallback just in case, though localEditContent should be initialized.
    const currentEditorContent = localEditContent ?? baseEditContent ?? "";

    // 2. Reconstruct the output data (Crucial Step)
    let reconstructedOutputData: Record<string, unknown> | string;
    try {
        // The strategy handles the complexity of converting Markdown string back to the required JSON structure.
        reconstructedOutputData = reconstructionStrategy(currentEditorContent, originalOutputData);
    } catch (error) {
        console.error("Error during output reconstruction:", error);

        // Handle specific errors thrown by the reconstruction logic (e.g., in output-derivation.ts)
        if (error instanceof Error && error.message === "INVALID_JSON_FORMAT") {
            toast.error("Invalid JSON Format", {
                description: "The edited content is not valid JSON. Please correct the syntax (check braces, commas, quotes) within the code block before saving.",
                duration: 8000,
            });
        } else {
            toast.error("Failed to process edited content.", {
                description: "An unexpected error occurred while reconstructing the output data."
            });
        }
        // Stop the submission if reconstruction fails.
        return;
    }

    // 3. Prepare submission payload (API 5.4.1)
    const submission: ManualEditSubmission = {
        base_version_id: baseVersionId,
        // The API definition uses JsonObjectSchema. We cast here assuming reconstruction logic is sound and backend handles string if appropriate.
        edited_output_data: reconstructedOutputData as Record<string, unknown>,
        summary: data.summary || undefined, // Convert empty string to undefined
    };

    // 4. Call the API via store action
    // The manualEdit action handles setting isExecutingAction, success/error toasts, and calling stopEditing().
    const success = await manualEdit(nodeId, submission);

    if (success) {
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isExecutingAction ? undefined : onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
            <DialogTitle>Save New Version (Manual Edit)</DialogTitle>
            <DialogDescription>
                Please provide a brief summary of your changes.
            </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                {/* Using manual styling for warning alert as 'warning' variant might not be consistently defined */}
                <Alert className="border-amber-500/50 bg-amber-50/50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-500">
                    <AlertTriangle className="h-4 w-4 !text-amber-600 dark:!text-amber-500" />
                    <AlertDescription>
                        This action creates a new active version and marks downstream nodes as ⚠️ Stale.
                    </AlertDescription>
                </Alert>

                <div className="grid gap-3">
                    <Label htmlFor="summary">Change Summary (Optional)</Label>
                    <Controller
                        name="summary"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <Textarea
                                    id="summary"
                                    placeholder="e.g., Corrected typos, reformulated conclusion, adjusted parameters..."
                                    rows={4}
                                    {...field}
                                    className={error ? "border-destructive" : ""}
                                    disabled={isExecutingAction}
                                />
                                {error && <p className="text-sm text-destructive mt-1">{error.message}</p>}
                            </>
                        )}
                    />
                </div>
            </div>
            <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isExecutingAction}>
                Cancel
            </Button>
            <Button type="submit" disabled={isExecutingAction}>
                {isExecutingAction ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Save New Version
                    </>
                )}
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

