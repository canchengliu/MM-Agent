// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { ProjectStatus } from "~/core/api/models/enums";
import { useProjectEventStream } from "~/core/api/hooks/useRealtime";
import { useRunState } from "~/core/api/hooks/useWorkflow";
import { useWorkspaceStore } from "~/core/store/workspace-store";

interface WorkspaceStateSynchronizerProps {
  projectId: string;
}

/**
 * Keeps the local workspace store in sync with backend run state via polling and SSE.
 */
export const WorkspaceStateSynchronizer = ({
  projectId,
}: WorkspaceStateSynchronizerProps) => {
  const setRunState = useWorkspaceStore((state) => state.setRunState);
  const processEvent = useWorkspaceStore((state) => state.processEvent);
  const setIsSyncing = useWorkspaceStore((state) => state.setIsSyncing);

  const { data: runState, error, isLoading, isFetching, refetch } = useRunState(projectId);

  useEffect(() => {
    setIsSyncing(isLoading || isFetching);
  }, [isLoading, isFetching, setIsSyncing]);

  useEffect(() => {
    if (runState) {
      setRunState(runState);
    } else if (error && !isLoading) {
      setRunState(null);
    }
  }, [runState, setRunState, error, isLoading]);

  useEffect(() => {
    if (!error) {
      return;
    }

    console.error("[Workspace] Failed to synchronize run state", error);
    const status = (error as { status?: number }).status;
    if (status !== 404) {
      toast.error("Synchronization error", {
        description:
          (error as Error).message ??
          "Real-time updates might be delayed. Refresh if the data looks stale.",
      });
    }
  }, [error]);

  useProjectEventStream(projectId, (event) => {
    processEvent(event);

    let requiresRefetch = false;

    if (event.event_type === "HITL_INTERRUPT") {
      requiresRefetch = true;
      toast.info("Workflow paused", {
        description: "The workflow is waiting for your input.",
        duration: 10_000,
      });
    }

    if (event.event_type === "NODE_END") {
      requiresRefetch = true;
    }

    if (event.event_type === "PROJECT_STATUS_CHANGE") {
      const { status } = event.payload;
      if (
        status === ProjectStatus.COMPLETED ||
        status === ProjectStatus.ERROR ||
        status === ProjectStatus.IDLE ||
        status === ProjectStatus.RUNNING
      ) {
        requiresRefetch = true;
      }
    }

    if (event.event_type === "ERROR") {
      requiresRefetch = true;
      toast.error("Workflow execution error", {
        description: event.payload.message,
      });
    }

    if (requiresRefetch) {
      setIsSyncing(true);
      setTimeout(() => {
        void refetch();
      }, 250);
    }
  });

  return null;
};
