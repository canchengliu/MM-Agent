"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RotateCcw, RotateCw, Loader2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { useStore } from "~/core/store";

// Define the schema for the modification comments (API 5.2.1, 5.2.2)
const FormSchema = z.object({
  modification_comments: z.string().optional(),
});

export type ExecutionType = "Re-execute" | "Retry";

interface ExecutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: number;
  nodeName: string;
  type: ExecutionType;
  // Optional base version ID if re-executing from a specific historical version (API 5.2.1)
  baseVersionId?: number;
}

/**
 * Dialog for capturing modification comments before Re-executing or Retrying a node.
 * Unifies the interaction flow for both actions (API 5.2). (Task 17.4)
 */
export function ExecutionDialog({
  isOpen,
  onClose,
  nodeId,
  nodeName,
  type,
  baseVersionId,
}: ExecutionDialogProps) {
  // We rely on isExecutingAction from the store to manage the loading state during the API call.
  const { reExecuteNode, retryNode, isExecutingAction } = useStore((state) => ({
    reExecuteNode: state.reExecuteNode,
    retryNode: state.retryNode,
    isExecutingAction: state.isExecutingAction,
  }));

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      modification_comments: "",
    },
  });

  // Reset form when dialog opens or closes
  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  // Prevent closing the dialog if an action is in progress
  const handleOpenChange = (open: boolean) => {
    if (isExecutingAction) return;
    if (!open) {
      onClose();
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    let success = false;
    // Ensure empty string is converted to undefined for the API
    const comments = data.modification_comments?.trim() || undefined;

    if (type === "Re-execute") {
      success = await reExecuteNode(nodeId, {
        modification_comments: comments,
        base_version_id: baseVersionId,
      });
    } else {
      // Retry does not use baseVersionId
      success = await retryNode(nodeId, {
        modification_comments: comments,
      });
    }

    if (success) {
      onClose();
    }
    // Errors are handled globally in the WorkflowSlice actions and displayed via toasts.
  }

  // Contextualized UI elements
  const title = `${type} Node: ${nodeName}`;
  const description =
    type === "Re-execute"
      ? "Provide optional feedback or instructions for this new execution. A new version will be created (W5.1)."
      : "Provide optional context or instructions for this retry attempt (W5.2).";
  const Icon = type === "Re-execute" ? RotateCcw : RotateCw;
  const placeholder =
    type === "Re-execute"
      ? "e.g., Focus more on the simulation aspect."
      : "e.g., I've updated the input file, please try again.";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="modification_comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modification Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={placeholder}
                      className="resize-y min-h-[120px]"
                      rows={5}
                      {...field}
                      // Ensure field value is treated as string even if optional returns null/undefined
                      value={field.value || ""}
                      disabled={isExecutingAction}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isExecutingAction}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isExecutingAction}
                // Use primary variant for Re-execute, secondary for Retry (visual distinction)
                variant={type === "Re-execute" ? "default" : "secondary"}
              >
                {isExecutingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Icon className="mr-2 h-4 w-4" />
                    Confirm {type}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

