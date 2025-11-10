import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

interface HITLActionBarProps {
  onApprove: () => void;
  onReject: (feedback: string) => void;
  onDiscard: () => void;
  isSubmitting: boolean;
  isApprovalDisabled?: boolean;
}

const rejectSchema = z.object({
  feedback_comment: z
    .string()
    .min(10, {
      message: "Please provide detailed feedback (min. 10 characters).",
    }),
});

export function HITLActionBar({
  onApprove,
  onReject,
  onDiscard,
  isSubmitting,
  isApprovalDisabled = false,
}: HITLActionBarProps) {
  const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setDiscardDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof rejectSchema>>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { feedback_comment: "" },
  });

  const handleRejectSubmit = (values: z.infer<typeof rejectSchema>) => {
    onReject(values.feedback_comment);
    setRejectDialogOpen(false);
    form.reset();
  };

  const handleDiscardConfirm = () => {
    onDiscard();
    setDiscardDialogOpen(false);
  };

  return (
    <div className="flex w-full items-center justify-center gap-4 border-t bg-background/80 p-4 backdrop-blur-sm">
      <Dialog open={isDiscardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" disabled={isSubmitting}>
            Discard
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm discarding this execution?</DialogTitle>
            <DialogDescription>
              This will permanently discard all temporary results from this
              execution attempt. The node will revert to its previous state.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDiscardDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDiscardConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Discard"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={isSubmitting}>
            Reject and Provide Modification Comments
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRejectSubmit)}>
              <DialogHeader>
                <DialogTitle>Provide Modification Comments</DialogTitle>
                <DialogDescription>
                  Your feedback will guide the AI to generate a better result in
                  the next round.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <FormField
                  control={form.control}
                  name="feedback_comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">
                        Feedback Comment
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Focus more on the scalability aspect and provide a cost analysis...'"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setRejectDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit Feedback and Regenerate"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Button
        onClick={onApprove}
        disabled={isSubmitting || isApprovalDisabled}
        className="min-w-48"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Approve and Continue"
        )}
      </Button>
    </div>
  );
}
