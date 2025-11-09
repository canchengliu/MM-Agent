// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ProjectStatus } from "../models/enums";
import type {
  HistoryBranchRequest,
  HistoryComposeRequest,
  RunResumeRequest,
  RunStateResponse,
} from "../models/workflow";
import { workflowService } from "../services/workflow.service";

export const workflowKeys = {
  structure: ["workflow", "structure"] as const,
  runState: (projectId: string) => ["projects", projectId, "run-state"] as const,
  historyGraph: (projectId: string, threadId?: string) =>
    ["projects", projectId, "history", threadId ?? "active"] as const,
  checkpoint: (projectId: string, threadId: string, checkpointId: string) =>
    ["projects", projectId, "checkpoints", threadId, checkpointId] as const,
};

export const useWorkflowStructure = () => {
  return useQuery({
    queryKey: workflowKeys.structure,
    queryFn: workflowService.getStructure,
    staleTime: Infinity,
  });
};

export const useRunState = (projectId: string) => {
  return useQuery<RunStateResponse>({
    queryKey: workflowKeys.runState(projectId),
    queryFn: () => workflowService.getRunState(projectId),
    enabled: Boolean(projectId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === ProjectStatus.RUNNING ? 5000 : false;
    },
  });
};

export const useHistoryGraph = (projectId: string, threadId?: string) => {
  return useQuery({
    queryKey: workflowKeys.historyGraph(projectId, threadId),
    queryFn: () => workflowService.getHistoryGraph(projectId, threadId),
    enabled: Boolean(projectId),
  });
};

export const useCheckpointDetail = (
  projectId: string,
  threadId: string,
  checkpointId: string,
) => {
  return useQuery({
    queryKey: workflowKeys.checkpoint(projectId, threadId, checkpointId),
    queryFn: () =>
      workflowService.getCheckpointDetail(projectId, threadId, checkpointId),
    enabled: Boolean(projectId && threadId && checkpointId),
  });
};

export const useResumeWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: RunResumeRequest;
    }) => workflowService.resumeWorkflow(projectId, data),
    onSuccess: (_, { projectId }) => {
      toast.success("Feedback submitted. Workflow resuming.");
      void queryClient.invalidateQueries({ queryKey: workflowKeys.runState(projectId) });
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "history"] });
    },
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: HistoryBranchRequest;
    }) => workflowService.createBranch(projectId, data),
    onSuccess: (_, { projectId }) => {
      toast.success("New branch created. Execution started.");
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
};

export const useComposeHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: HistoryComposeRequest;
    }) => workflowService.composeHistory(projectId, data),
    onSuccess: (_, { projectId }) => {
      toast.success("History composition successful.");
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
};
