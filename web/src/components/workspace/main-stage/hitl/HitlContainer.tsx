// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AlertTriangle } from "lucide-react";

import { HITLMode, ProjectStatus } from "~/core/api/models/enums";
import { useWorkspaceStore } from "~/core/store/workspace-store";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

import { VarlInteraction } from "./VarlInteraction";
import { ScaInteraction } from "./ScaInteraction";
import { AvlInteraction } from "./AvlInteraction";

/**
 * HitlContainer determines if a Human-in-the-Loop interaction is pending for the
 * selected step and renders the appropriate interaction component.
 */
export const HitlContainer = () => {
  const runState = useWorkspaceStore((state) => state.runState);
  const selectedStepId = useWorkspaceStore((state) => state.selectedExecutionStepId);
  const projectId = useWorkspaceStore((state) => state.projectId);

  if (!runState || runState.status !== ProjectStatus.PAUSED || !runState.pending_interaction) {
    return null;
  }

  const pendingInteraction = runState.pending_interaction;

  if (pendingInteraction.source_step_id !== selectedStepId) {
    return null;
  }

  if (!projectId) {
    console.error("HitlContainer: Project ID is missing from WorkspaceStore.");
    return null;
  }

  const checkpointId = runState.latest_checkpoint_id;

  switch (pendingInteraction.mode) {
    case HITLMode.VARL:
      return (
        <VarlInteraction
          interaction={pendingInteraction}
          projectId={projectId}
          checkpointId={checkpointId}
        />
      );
    case HITLMode.SCA:
      return (
        <ScaInteraction
          interaction={pendingInteraction}
          projectId={projectId}
          checkpointId={checkpointId}
        />
      );
    case HITLMode.AVL:
      return (
        <AvlInteraction
          interaction={pendingInteraction}
          projectId={projectId}
          checkpointId={checkpointId}
        />
      );
    case HITLMode.BYPASS:
      return (
        <Alert variant="default" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Auto-Proceeding (Bypass)</AlertTitle>
          <AlertDescription>
            This step is configured for bypass. The workflow should proceed automatically.
          </AlertDescription>
        </Alert>
      );
    default:
      console.error("Unknown HITL mode encountered:", pendingInteraction.mode);
      return (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unknown interaction mode: {String(pendingInteraction.mode)}.
          </AlertDescription>
        </Alert>
      );
  }
};
