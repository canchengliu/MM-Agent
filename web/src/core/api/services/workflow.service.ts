import { apiClient } from "~/core/api/client";
import type { StalenessInfo } from "~/core/domain/node.types";
import type { WorkflowInstanceRead } from "~/core/domain/workflow.types";

/**
 * Service to interact with the workflow management API endpoints.
 */
export const WorkflowService = {
  /**
   * Fetches the detailed information for a single workflow instance, including its nodes.
   * @param workflowId The ID of the workflow.
   * @param signal Optional AbortSignal used for request cancellation.
   */
  async getDetail(
    workflowId: number,
    signal?: AbortSignal,
  ): Promise<WorkflowInstanceRead> {
    return apiClient<WorkflowInstanceRead>(`/workflows/${workflowId}`, { signal });
  },

  /**
   * Fetches the staleness report for every node within a workflow.
   * @param workflowId The ID of the workflow.
   * @param signal Optional AbortSignal used for request cancellation.
   */
  async getStaleness(
    workflowId: number,
    signal?: AbortSignal,
  ): Promise<Record<string, StalenessInfo[]>> {
    return apiClient<Record<string, StalenessInfo[]>>(
      `/workflows/${workflowId}/staleness`,
      { signal },
    );
  },

  async triggerExecution(workflowId: number) {
    console.log(`Triggering workflow execution ${workflowId}`);
    return { accepted: true };
  },
};
