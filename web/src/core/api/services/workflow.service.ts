// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { apiClient } from "~/core/api/client";
import type { StalenessReport, WorkflowInstanceRead } from "~/core/domain";

/**
 * Service for handling workflow-level API endpoints.
 * Corresponds to API Doc 4.
 */
export const WorkflowService = {
  /**
   * Fetches the detailed information for a single workflow, including all nodes.
   * This is the core API for loading the workspace canvas.
   * Corresponds to API Doc 4, Section 2.1.
   * @param workflowId The ID of the workflow to fetch.
   * @returns A promise resolving to the full workflow instance.
   */
  getDetail: (workflowId: number): Promise<WorkflowInstanceRead> => {
    return apiClient<WorkflowInstanceRead>(`/workflows/${workflowId}`);
  },

  /**
   * Fetches the staleness report for all nodes within a workflow.
   * Corresponds to API Doc 4, Section 3.1.
   * @param workflowId The ID of the workflow to check.
   * @returns A promise resolving to the staleness report object.
   */
  getStaleness: (workflowId: number): Promise<StalenessReport> => {
    return apiClient<StalenessReport>(`/workflows/${workflowId}/staleness`);
  },
};
