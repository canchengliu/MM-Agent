"use client";

import { Info, Loader2 } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { ProblemType } from "~/constants/enums";
import type { ProjectDetailRead } from "~/core/models/project.model";
import { useStore } from "~/core/store";
import { cn } from "~/lib/utils";

const PROBLEM_TYPE_OPTIONS: Array<{
  value: ProblemType;
  title: string;
  description: string;
}> = [
  {
    value: "A",
    title: "Problem A",
    description:
      "Classical continuous modeling scenarios with heavy analytical reasoning.",
  },
  {
    value: "B",
    title: "Problem B",
    description:
      "Discrete, network, or combinatorial challenges often requiring heuristics.",
  },
  {
    value: "C",
    title: "Problem C",
    description: "Data-rich investigations with emphasis on statistical modeling.",
  },
  {
    value: "D",
    title: "Problem D",
    description: "Interdisciplinary scenario analysis and policy recommendations.",
  },
  {
    value: "E",
    title: "Problem E",
    description: "Emerging domains such as AI alignment or complex simulations.",
  },
  {
    value: "F",
    title: "Problem F",
    description: "Wildcard or “create your own” prompts with custom constraints.",
  },
  {
    value: "-",
    title: "Unassigned",
    description: "Leave unset until the official contest problem is announced.",
  },
];

interface ProblemTypeSelectorProps {
  project: ProjectDetailRead;
}

export function ProblemTypeSelector({ project }: ProblemTypeSelectorProps) {
  const { updateProject, isMutatingProject } = useStore(
    useShallow((state) => ({
      updateProject: state.updateProject,
      isMutatingProject: state.isMutatingProject,
    })),
  );
  const [pendingSelection, setPendingSelection] = useState<ProblemType | null>(
    null,
  );

  const isLocked = project.status !== "Configuring";
  const disabled = isLocked || isMutatingProject;

  const handleSelection = async (value: ProblemType) => {
    if (value === project.problem_type || disabled) return;
    setPendingSelection(value);
    try {
      await updateProject(project.id, { problem_type: value });
    } finally {
      setPendingSelection(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              Problem Type
            </CardTitle>
            <Tooltip>
              <TooltipTrigger className="text-muted-foreground">
                <Info className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-center">
                Pick the official contest problem letter (FRS P2.4). Once the
                workflow starts, this setting becomes immutable per Design Doc
                2.1.1.B.
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <CardDescription>
          Align the project configuration with the official contest statement to
          unlock task-specific automations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={isLocked ? "info" : "warning"}>
          <AlertTitle>
            {isLocked ? "Locked after workflow start" : "Required for execution"}
          </AlertTitle>
          <AlertDescription>
            {isLocked
              ? "The workflow has already progressed, so the problem type can no longer be modified."
              : "Select the problem type before starting the workflow to ensure model templates and heuristics are aligned."}
          </AlertDescription>
        </Alert>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROBLEM_TYPE_OPTIONS.map((option) => {
            const isActive = project.problem_type === option.value;
            const isPending = pendingSelection === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => void handleSelection(option.value)}
                disabled={disabled}
                className={cn(
                  "group rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{option.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.value === "-"
                        ? "Unassigned"
                        : `Letter ${option.value}`}
                    </p>
                  </div>
                  <Badge
                    variant={isActive ? "success" : "outline"}
                    className="whitespace-nowrap"
                  >
                    {isActive ? (
                      "Selected"
                    ) : isPending ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Saving
                      </>
                    ) : (
                      "Select"
                    )}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
