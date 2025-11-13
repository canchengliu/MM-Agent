"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";

// Define the schema for the feedback form (API 5.3 requires feedback_comment)
const FeedbackSchema = z.object({
  feedback_comment: z.string().min(10, {
    message: "Feedback must be at least 10 characters long.",
  }).max(2000, {
    message: "Feedback cannot exceed 2000 characters.",
  }),
});

type FeedbackFormValues = z.infer<typeof FeedbackSchema>;

interface RejectFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FeedbackFormValues) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Dialog to collect user feedback when rejecting a result (H2.2).
 * Implemented as a controlled component managed by HITLInteractionManager.
 */
export function RejectFeedbackDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: RejectFeedbackDialogProps) {
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(FeedbackSchema),
    defaultValues: {
      feedback_comment: "",
    },
    mode: "onTouched", // Improve UX by validating on blur/touch
  });

  const handleSubmit = async (data: FeedbackFormValues) => {
    await onSubmit(data);
  };

  // Reset form when the dialog is opened
  React.useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const handleOpenChange = (open: boolean) => {
    // Prevent closing while the operation is in progress
    if (!isSubmitting && !open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reject and Provide Feedback</DialogTitle>
          <DialogDescription>
            Please provide detailed feedback on why the current result is unsatisfactory.
            This will help the AI regenerate a better version.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="feedback_comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modification Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., The analysis is too shallow, please focus more on the financial implications..."
                      className="min-h-[150px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific about the changes required.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              {/* Disable submit if form is invalid or currently submitting */}
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback and Re-execute
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

