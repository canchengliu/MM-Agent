// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { fetcher } from "../fetcher";
import type {
  ExecutionHistoryGraphResponse,
  HistoryBranchRequest,
  HistoryComposeRequest,
  HistoryOperationResponse,
  RunResumeRequest,
  RunStateResponse,
  StateSnapshotDetailResponse,
  WorkflowStructureResponse,
} from "../models/workflow";

export const workflowService = {
  getStructure: async () => {
    return fetcher<WorkflowStructureResponse>("workflow/structure");
  },

  getRunState: async (projectId: string) => {
    return fetcher<RunStateResponse>(`projects/${projectId}/run-state`);
  },

  getHistoryGraph: async (projectId: string, threadId?: string) => {
    const query = threadId ? `?thread_id=${encodeURIComponent(threadId)}` : "";
    return fetcher<ExecutionHistoryGraphResponse>(
      `projects/${projectId}/history/graph${query}`,
    );
  },

  getCheckpointDetail: async (
    projectId: string,
    threadId: string,
    checkpointId: string,
  ) => {
    return fetcher<StateSnapshotDetailResponse>(
      `projects/${projectId}/runs/${threadId}/checkpoints/${checkpointId}`,
    );
  },

  resumeWorkflow: async (projectId: string, data: RunResumeRequest) => {
    return fetcher<{ status: string }>(`projects/${projectId}/resume`, {
      method: "POST",
      body: data,
    });
  },

  createBranch: async (projectId: string, data: HistoryBranchRequest) => {
    return fetcher<HistoryOperationResponse>(
      `projects/${projectId}/history/branch`,
      {
        method: "POST",
        body: data,
      },
    );
  },

  composeHistory: async (projectId: string, data: HistoryComposeRequest) => {
    return fetcher<HistoryOperationResponse>(
      `projects/${projectId}/history/compose`,
      {
        method: "POST",
        body: data,
      },
    );
  },
};
