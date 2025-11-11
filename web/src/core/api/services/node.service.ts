import { apiClient } from "~/core/api/client";
import type {
  AcceptedResponse,
  ManualEditSubmission,
  ReExecutionRequest,
  RetryRequest,
} from "~/core/domain/execution.types";
import type { HITLResponse, HITLSubmission } from "~/core/domain/hitl.types";
import type { NodeDetailView, NodeInstanceRead } from "~/core/domain/node.types";
import type {
  NodeStateVersion,
  NodeVersionSummary,
} from "~/core/domain/version.types";

/**
 * Service to interact with node-specific API endpoints.
 */
export const NodeService = {
  /**
   * Fetches the detailed view for a single node instance.
   * @param nodeId The ID of the node.
   * @param signal Optional AbortSignal used for request cancellation.
   */
  async getNode(
    nodeId: number,
    signal?: AbortSignal,
  ): Promise<NodeDetailView> {
    return apiClient<NodeDetailView>(`/nodes/${nodeId}`, { signal });
  },

  /**
   * Fetches the historical version summaries for a node.
   * @param nodeId The ID of the node.
   * @param signal Optional AbortSignal used for request cancellation.
   */
  async getVersions(
    nodeId: number,
    signal?: AbortSignal,
  ): Promise<NodeVersionSummary[]> {
    return apiClient<NodeVersionSummary[]>(`/nodes/${nodeId}/versions`, {
      signal,
    });
  },

  /**
   * Fetches the detailed information for a single version of a node.
   * @param nodeId The ID of the parent node.
   * @param versionId The ID of the version to fetch.
   * @param signal Optional AbortSignal.
   */
  async getVersionDetail(
    nodeId: number,
    versionId: number,
    signal?: AbortSignal,
  ): Promise<NodeStateVersion> {
    return apiClient<NodeStateVersion>(
      `/nodes/${nodeId}/versions/${versionId}`,
      { signal },
    );
  },

  /**
   * Submit a HITL decision for the pending node result.
   */
  async submitHITL(
    nodeId: number,
    submission: HITLSubmission,
  ): Promise<HITLResponse> {
    return apiClient<HITLResponse>(`/nodes/${nodeId}/hitl`, {
      method: "POST",
      body: JSON.stringify(submission),
    });
  },

  /**
   * Initiates a re-execution request for a completed node.
   */
  async reExecute(
    nodeId: number,
    payload: ReExecutionRequest,
  ): Promise<AcceptedResponse> {
    return apiClient<AcceptedResponse>(`/nodes/${nodeId}/re-execute`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Retries the execution of a failed node.
   */
  async retry(
    nodeId: number,
    payload: RetryRequest,
  ): Promise<AcceptedResponse> {
    return apiClient<AcceptedResponse>(`/nodes/${nodeId}/retry`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Submits a manually edited output to create a new version of a node.
   * @param nodeId The ID of the node being edited.
   * @param payload The submission payload containing the new data.
   */
  async manualEdit(
    nodeId: number,
    payload: ManualEditSubmission,
  ): Promise<NodeInstanceRead> {
    return apiClient<NodeInstanceRead>(`/nodes/${nodeId}/manual-edit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Activates a specific historical version for a node.
   * @param nodeId The ID of the parent node.
   * @param versionId The ID of the version to activate.
   * @param signal Optional AbortSignal used for request cancellation.
   */
  async activateVersion(
    nodeId: number,
    versionId: number,
    signal?: AbortSignal,
  ): Promise<NodeInstanceRead> {
    return apiClient<NodeInstanceRead>(
      `/nodes/${nodeId}/versions/${versionId}/activate`,
      {
        method: "POST",
        signal,
      },
    );
  },
};
