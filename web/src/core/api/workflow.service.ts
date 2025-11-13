import { AxiosError } from "axios";

import type { PaginatedResponse } from "~/core/models/common.model";
import type {
  WorkflowCreate,
  WorkflowInstanceRead,
  WorkflowStalenessReport,
  WorkflowSummaryRead,
  WorkflowUpdate,
} from "~/core/models/workflow.model";

import apiClient from "./client";

/**
 * API Service for Workflow Management (API 4).
 */
export const WorkflowService = {
  // --- 1. Workflow Lifecycle Management (API 4.1) ---

  /**
   * Gets the list of workflows for the current user (API 4.1.2).
   */
  getWorkflows: async (
    skip = 0,
    limit = 20,
  ): Promise<PaginatedResponse<WorkflowSummaryRead>> => {
    const response = await apiClient.get<
      PaginatedResponse<WorkflowSummaryRead>
    >("/workflows/", {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Creates a new workflow instance (API 4.1.1).
   * Note: Primary flow uses ProjectService.startWorkflow (API 3.3.1).
   */
  createWorkflow: async (
    data: WorkflowCreate,
  ): Promise<WorkflowInstanceRead> => {
    try {
      // Expect 201 Created
      const response = await apiClient.post<WorkflowInstanceRead>(
        "/workflows/",
        data,
        {
          validateStatus: (status) => status === 201,
        },
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (WORKFLOW_ALREADY_EXISTS)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("WORKFLOW_ALREADY_EXISTS");
      }
      throw error;
    }
  },

  // --- 2. Single Workflow Operations & Query (API 4.2) ---

  /**
   * Gets the detailed information (full structure) of a specific workflow (API 4.2.1).
   * Core API for loading/refreshing the workflow canvas (Architecture 5.3.1).
   */
  getWorkflowById: async (workflowId: number): Promise<WorkflowInstanceRead> => {
    const response = await apiClient.get<WorkflowInstanceRead>(
      `/workflows/${workflowId}`,
    );
    return response.data;
  },

  /**
   * Updates a workflow's basic information (API 4.2.2).
   */
  updateWorkflow: async (
    workflowId: number,
    data: WorkflowUpdate,
  ): Promise<WorkflowInstanceRead> => {
    const response = await apiClient.patch<WorkflowInstanceRead>(
      `/workflows/${workflowId}`,
      data,
    );
    return response.data;
  },

  /**
   * Deletes a workflow instance (API 4.2.3).
   */
  deleteWorkflow: async (workflowId: number): Promise<void> => {
    try {
      // Expect 204 No Content
      await apiClient.delete(`/workflows/${workflowId}`, {
        validateStatus: (status) => status === 204,
      });
    } catch (error) {
      // Handle 409 Conflict (WORKFLOW_IS_ACTIVE)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("WORKFLOW_IS_ACTIVE");
      }
      throw error;
    }
  },

  // --- 3. Workflow State Insights (API 4.3) ---

  /**
   * Gets the detailed staleness report for all nodes (API 4.3.1).
   */
  getWorkflowStaleness: async (
    workflowId: number,
  ): Promise<WorkflowStalenessReport> => {
    const response = await apiClient.get<WorkflowStalenessReport>(
      `/workflows/${workflowId}/staleness`,
    );
    return response.data;
  },
};
