// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { useResumeWorkflow } from "~/core/api/hooks/useWorkflow";
import type { RunResumeRequest, VARLFeedback } from "~/core/api/models/workflow";

import type { BaseInteractionProps } from "./types";

/**
 * VARL (Validate, Approve, Revise, Log) interaction component.
 * Implements the Binary Decision Card pattern with animated transitions.
 */
export const VarlInteraction = ({ interaction, projectId, checkpointId }: BaseInteractionProps) => {
  const [isRevising, setIsRevising] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const { mutate: resumeWorkflow, isPending } = useResumeWorkflow();

  const handleResume = (feedback: VARLFeedback) => {
    if (isPending) return;

    const request: RunResumeRequest = {
      client_checkpoint_id: checkpointId,
      feedback,
    };

    resumeWorkflow(
      { projectId, data: request },
      {
        onError: (error) => {
          const errorMessage = (error as Error)?.message || "An unexpected error occurred.";
          if (errorMessage.includes("412") || errorMessage.includes("Precondition Failed")) {
            toast.error("Workflow state mismatch", {
              description: "The workflow state has changed. Please review the updates and try again.",
            });
          } else {
            toast.error("Failed to submit feedback", {
              description: errorMessage,
            });
          }
        },
      },
    );
  };

  const handleApprove = () => {
    handleResume({
      mode: "VARL",
      decision: "APPROVE",
    });
  };

  const handleSubmitRevision = () => {
    if (!revisionNotes.trim()) {
      toast.warning("Please provide detailed revision notes.");
      return;
    }

    handleResume({
      mode: "VARL",
      decision: "REQUEST_REVISION",
      notes: revisionNotes.trim(),
    });
  };

  return (
    <Card className="mt-6 border-indigo-500/50 shadow-xl transition-all duration-300 hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Review Required (VARL)</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {interaction.instructions ||
            "Please review the generated content above and decide the next step."}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end border-t bg-muted/30 pt-6">
        <AnimatePresence mode="wait" initial={false}>
          {!isRevising ? (
            <motion.div
              key="decision-buttons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex gap-4"
            >
              <Button variant="outline" onClick={() => setIsRevising(true)} disabled={isPending}>
                <Pencil className="mr-2 h-4 w-4" />
                Request Revision
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isPending}
                className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              >
                {isPending && !isRevising ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Approve and Continue
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="revision-input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex w-full flex-col gap-4"
            >
              <Textarea
                placeholder="Please provide detailed feedback for the revision..."
                value={revisionNotes}
                onChange={(event) => setRevisionNotes(event.target.value)}
                rows={5}
                disabled={isPending}
                className="bg-background"
              />
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setIsRevising(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitRevision} disabled={isPending || !revisionNotes.trim()}>
                  {isPending && isRevising ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="mr-2 h-4 w-4" />
                  )}
                  Submit Revision Request
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
    </Card>
  );
};
