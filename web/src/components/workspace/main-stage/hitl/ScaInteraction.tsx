// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useState } from "react";
import { AlertTriangle, Check, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { BentoGrid } from "~/components/magicui/bento-grid";
import { useResumeWorkflow } from "~/core/api/hooks/useWorkflow";
import type { RunResumeRequest, SCAFeedback } from "~/core/api/models/workflow";
import { cn } from "~/lib/utils";

import type { BaseInteractionProps } from "./types";

interface ScaOption {
  id: string;
  name: string;
  description: string;
  pros?: string[];
  cons?: string[];
}

const parseScaOptions = (interaction: BaseInteractionProps["interaction"]): ScaOption[] => {
  const options = (interaction.metadata?.options || interaction.content_for_review?.options) as unknown;

  if (Array.isArray(options)) {
    return options.filter(
      (option): option is ScaOption =>
        typeof option === "object" &&
        option !== null &&
        typeof option.id === "string" &&
        typeof option.name === "string",
    );
  }

  return [];
};

/**
 * SCA (Strategic Choice Architecture) interaction component.
 * Implements the option comparison pattern with responsive cards.
 */
export const ScaInteraction = ({ interaction, projectId, checkpointId }: BaseInteractionProps) => {
  const options = parseScaOptions(interaction);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const { mutate: resumeWorkflow, isPending } = useResumeWorkflow();

  const handleConfirmSelection = () => {
    if (!selectedOptionId) {
      toast.warning("Please select an option before continuing.");
      return;
    }

    if (isPending) return;

    const feedback: SCAFeedback = {
      mode: "SCA",
      decision: selectedOptionId,
      notes: `User selected option: ${selectedOptionId}`,
    };

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
            toast.error("Failed to submit selection", {
              description: errorMessage,
            });
          }
        },
      },
    );
  };

  if (options.length === 0) {
    return (
      <Card className="mt-6 border-red-500/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error: No Options Available (SCA)
          </CardTitle>
          <CardDescription>
            The workflow paused for a strategic choice, but no valid options were provided.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const gridColsClass =
    options.length >= 3 ? "lg:grid-cols-3" : options.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-1";

  return (
    <Card className="mt-6 border-indigo-500/50 shadow-xl transition-all duration-300 hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Strategic Choice Required (SCA)</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {interaction.instructions ||
            "Please compare the following options and select the best one to proceed."}
        </CardDescription>
      </CardHeader>
      <div className="px-6 pb-6">
        <BentoGrid className={cn("auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2", gridColsClass)}>
          {options.map((option) => (
            <ScaOptionCard
              key={option.id}
              option={option}
              isSelected={selectedOptionId === option.id}
              onSelect={() => setSelectedOptionId(option.id)}
            />
          ))}
        </BentoGrid>
      </div>
      <CardFooter className="flex justify-end border-t bg-muted/30 pt-6">
        <Button onClick={handleConfirmSelection} disabled={isPending || !selectedOptionId}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Confirm Selection and Continue
        </Button>
      </CardFooter>
    </Card>
  );
};

interface ScaOptionCardProps {
  option: ScaOption;
  isSelected: boolean;
  onSelect: () => void;
}

const ScaOptionCard = ({ option, isSelected, onSelect }: ScaOptionCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl border bg-background p-0 transition-all duration-300",
        isSelected
          ? "scale-[1.01] border-primary shadow-xl ring-2 ring-primary/50"
          : "border-border shadow-md hover:scale-[1.01] hover:border-primary/70 hover:shadow-lg",
        "dark:bg-background dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect();
        }
      }}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-700 dark:text-neutral-300">
            <Lightbulb className="h-5 w-5 text-muted-foreground" />
            {option.name}
          </h3>
          {isSelected ? <Check className="h-5 w-5 text-primary" /> : null}
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{option.description}</p>
        <div className="mt-2 space-y-3 text-xs">
          {option.pros && option.pros.length > 0 ? (
            <div>
              <p className="mb-1 font-medium text-green-700 dark:text-green-500">Advantages:</p>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                {option.pros.map((pro, index) => (
                  <li key={`pro-${option.id}-${index}`}>{pro}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {option.cons && option.cons.length > 0 ? (
            <div>
              <p className="mb-1 font-medium text-red-700 dark:text-red-500">Disadvantages:</p>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                {option.cons.map((con, index) => (
                  <li key={`con-${option.id}-${index}`}>{con}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
    </div>
  );
};
