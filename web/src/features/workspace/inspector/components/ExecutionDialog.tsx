// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
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
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

interface ExecutionDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onSubmit: (comments: string | null) => void;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * A reusable dialog for triggering node execution actions (re-execute, retry)
 * that can accept optional user comments.
 */
export function ExecutionDialog({
  trigger,
  title,
  description,
  buttonText,
  onSubmit,
  isLoading,
  open,
  onOpenChange,
}: ExecutionDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { comments: "" },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values.comments || null);
    // Let the parent component close the dialog upon mutation initiation.
  };

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional: Provide new instructions or feedback..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buttonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
