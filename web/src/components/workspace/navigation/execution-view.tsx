// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkflowStructure } from "~/core/api/hooks/useWorkflow";
import type { WorkflowPhase, WorkflowStep } from "~/core/api/models/workflow";
import {
  StepExecutionStatus,
  useWorkspaceStore,
} from "~/core/store/workspace-store";
import { cn } from "~/lib/utils";

/**
 * Linear workflow navigation for the Execution mode with realtime status feedback.
 */
export const ExecutionView = () => {
  const { data: structure, isLoading, error } = useWorkflowStructure();
  const selectedStepId = useWorkspaceStore((state) => state.selectedExecutionStepId);
  const selectExecutionStep = useWorkspaceStore((state) => state.selectExecutionStep);
  const stepStatuses = useWorkspaceStore((state) => state.stepStatuses);
  const isSyncing = useWorkspaceStore((state) => state.isSyncing);
  const hasRunState = useWorkspaceStore((state) => Boolean(state.runState));

  if (isLoading || (isSyncing && !hasRunState)) {
    return <ExecutionViewSkeleton />;
  }

  if (error || !structure) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading workflow</AlertTitle>
          <AlertDescription>
            Could not retrieve the workflow structure. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const defaultExpandedPhases = structure.phases.map((phase) => phase.id);

  return (
    <div className="h-full overflow-y-auto">
      <Accordion type="multiple" defaultValue={defaultExpandedPhases} className="w-full">
        {structure.phases.map((phase) => (
          <PhaseItem
            key={phase.id}
            phase={phase}
            selectedStepId={selectedStepId}
            onSelectStep={selectExecutionStep}
            stepStatuses={stepStatuses}
          />
        ))}
      </Accordion>
    </div>
  );
};

interface PhaseItemProps {
  phase: WorkflowPhase;
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  stepStatuses: Record<string, StepExecutionStatus>;
}

const PhaseItem = ({
  phase,
  selectedStepId,
  onSelectStep,
  stepStatuses,
}: PhaseItemProps) => (
  <AccordionItem value={phase.id} className="border-b-0">
    <AccordionTrigger className="px-3 py-3 text-sm font-semibold transition-colors hover:bg-muted/50 hover:no-underline">
      <div className="flex items-center gap-2">
        <Boxes className="h-4 w-4 text-primary" />
        {phase.name}
      </div>
    </AccordionTrigger>
    <AccordionContent className="pb-2 pl-2 pr-2 pt-0">
      <div className="flex flex-col gap-1">
        {phase.steps.map((step) => (
          <StepItem
            key={step.id}
            step={step}
            isSelected={step.id === selectedStepId}
            onSelect={onSelectStep}
            status={stepStatuses[step.id] ?? StepExecutionStatus.QUEUED}
          />
        ))}
      </div>
    </AccordionContent>
  </AccordionItem>
);

interface StepItemProps {
  step: WorkflowStep;
  isSelected: boolean;
  onSelect: (stepId: string) => void;
  status: StepExecutionStatus;
}

const StatusIcon = ({
  status,
  isSelected,
}: {
  status: StepExecutionStatus;
  isSelected: boolean;
}) => {
  const baseClasses = "h-4 w-4 shrink-0 transition-colors";
  const hoverClasses = "group-hover:text-accent-foreground";

  switch (status) {
    case StepExecutionStatus.RUNNING:
      return (
        <div className="relative flex h-4 w-4 items-center justify-center" title="Running">
          <motion.div
            className="absolute h-full w-full rounded-full bg-primary/80"
            animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          />
          <div className="relative h-2 w-2 rounded-full bg-primary" />
        </div>
      );
    case StepExecutionStatus.INTERRUPTED:
      return (
        <motion.div
          aria-hidden
          className="text-indigo-500 dark:text-indigo-400"
          animate={{ opacity: [0.7, 1, 0.7], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <PauseCircle className={cn(baseClasses)} />
        </motion.div>
      );
    case StepExecutionStatus.SUCCESS:
      return <CheckCircle2 aria-hidden className={cn(baseClasses, "text-green-600 dark:text-green-500")} />;
    case StepExecutionStatus.FAILED:
      return <XCircle aria-hidden className={cn(baseClasses, "text-destructive")} />;
    case StepExecutionStatus.QUEUED:
    default:
      return (
        <Clock
          aria-hidden
          className={cn(
            baseClasses,
            isSelected ? "text-foreground" : `text-muted-foreground/70 ${hoverClasses}`,
          )}
        />
      );
  }
};

const StepItem = ({ step, isSelected, onSelect, status }: StepItemProps) => {
  const isActive =
    status === StepExecutionStatus.RUNNING || status === StepExecutionStatus.INTERRUPTED;

  return (
    <button
      type="button"
      onClick={() => onSelect(step.id)}
      className={cn(
        "group relative flex w-full items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-left text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isSelected
          ? "bg-accent font-medium text-accent-foreground"
          : isActive
            ? "bg-muted/50 font-medium text-foreground"
            : "text-muted-foreground",
      )}
      aria-label={`Select step: ${step.name} (Status: ${status})`}
      title={step.description}
    >
      <StatusIcon status={status} isSelected={isSelected || isActive} />
      <span className="truncate">{step.name}</span>
      {status === StepExecutionStatus.INTERRUPTED && (
        <span
          className="pointer-events-none absolute inset-0 rounded-md border border-indigo-500/70 dark:border-indigo-400/70"
          aria-hidden="true"
        />
      )}
    </button>
  );
};

const ExecutionViewSkeleton = () => (
  <div className="space-y-4 p-3">
    {[1, 2, 3].map((index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-1 pl-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    ))}
  </div>
);
