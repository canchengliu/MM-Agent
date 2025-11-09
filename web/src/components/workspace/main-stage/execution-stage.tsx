// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useMemo, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { PanelContent } from "../panel-placeholders";
import { useWorkflowStructure } from "~/core/api/hooks/useWorkflow";
import type { GlobalState, WorkflowStep } from "~/core/api/models/workflow";
import { WORKFLOW_OUTPUT_MAP } from "~/core/config";
import { useWorkspaceStore } from "~/core/store/workspace-store";
import { get as lodashGet } from "~/lib/utils/lodash-get";

import { HitlContainer } from "./hitl/HitlContainer";
import { StepOutputRenderer } from "./step-output-renderer";
import { OrientationBanner } from "../orientation-banner";

const dotPathToJsonPointer = (path: string) => {
  if (!path) {
    return "";
  }

  const segments = path.split(".");
  const pointer = segments
    .map((segment) => segment.replace(/~/g, "~0").replace(/\//g, "~1"))
    .join("/");

  return `/${pointer}`;
};

const findStepById = (stepId: string | null, structure?: { phases: { steps: WorkflowStep[] }[] }) => {
  if (!stepId || !structure) {
    return null;
  }

  for (const phase of structure.phases) {
    const step = phase.steps.find((candidate) => candidate.id === stepId);
    if (step) {
      return step;
    }
  }

  return null;
};

export const ExecutionStage = () => {
  const selectedStepId = useWorkspaceStore((state) => state.selectedExecutionStepId);
  const runState = useWorkspaceStore((state) => state.runState);
  const isSyncing = useWorkspaceStore((state) => state.isSyncing);
  const { data: workflowStructure } = useWorkflowStructure();

  const pendingInteraction = runState?.pending_interaction;
  const globalState: GlobalState = (runState?.latest_values ?? {}) as GlobalState;

  const stepMetadata = useMemo(
    () => findStepById(selectedStepId, workflowStructure),
    [selectedStepId, workflowStructure],
  );

  const outputConfigs = selectedStepId ? WORKFLOW_OUTPUT_MAP[selectedStepId] ?? [] : [];

  const entries = outputConfigs.map((config) => ({
    config,
    rawValue: lodashGet(globalState, config.statePath),
    jsonPointer: dotPathToJsonPointer(config.statePath),
  }));

  const isEditable =
    Boolean(pendingInteraction?.source_step_id) &&
    pendingInteraction?.source_step_id === selectedStepId;

  let body: ReactNode;

  if (!selectedStepId) {
    body = (
      <EmptyState
        title="Select a step to inspect outputs"
        description="Choose a step from the Execution Navigator to review generated artifacts."
      />
    );
  } else if (!outputConfigs.length) {
    body = (
      <EmptyState
        title="No configured outputs for this step"
        description="Update the workflow output map configuration to expose artifacts for this step."
      />
    );
  } else {
    body = (
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Selected Step</p>
            <p className="text-base font-semibold text-foreground">
              {stepMetadata?.name ?? selectedStepId}
            </p>
            {stepMetadata?.description ? (
              <p className="text-xs text-muted-foreground">{stepMetadata.description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                Syncing…
              </Badge>
            ) : null}
            {isEditable ? (
              <Badge
                variant="outline"
                className="border-green-500/60 bg-green-500/10 text-foreground"
              >
                Editable
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Read-only
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {entries.map(({ config, rawValue, jsonPointer }) => (
            <StepOutputRenderer
              key={config.statePath}
              config={config}
              rawValue={rawValue}
              jsonPointer={jsonPointer}
              isEditable={isEditable}
            />
          ))}

          <HitlContainer />
        </div>
      </div>
    );
  }

  return (
    <PanelContent>
      <div className="flex h-full flex-col gap-4">
        <OrientationBanner />
        <div className="flex-1 overflow-hidden">{body}</div>
      </div>
    </PanelContent>
  );
};

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
    <p className="text-base font-medium text-foreground">{title}</p>
    <p className="max-w-md text-xs leading-relaxed text-muted-foreground/80">{description}</p>
  </div>
);
