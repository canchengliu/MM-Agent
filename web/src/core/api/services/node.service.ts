// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { apiClient } from "~/core/api/client";
import type {
  ExecutionRequest,
  HITLSubmission,
  HITLSubmissionResponse,
  ManualEditSubmission,
  NodeDetailView,
  NodeInstanceRead,
  NodeStateVersion,
  NodeVersionSummaryRead,
} from "~/core/domain";

/**
 * Service for handling individual node-level API endpoints.
 * Corresponds to API Doc 5.
 */
export const NodeService = {
  /**
   * Fetches the detailed information for a single node instance.
   * This is the core API for the Inspector panel and HITL views.
   * Corresponds to API Doc 5, Section 1.1.
   * @param nodeId The ID of the node to fetch.
   * @returns A promise resolving to the detailed node view.
   */
  getDetail: (nodeId: number): Promise<NodeDetailView> => {
    return apiClient<NodeDetailView>(`/nodes/${nodeId}`);
  },

  /**
   * Fetches the list of all historical versions for a given node.
   * Corresponds to API Doc 5, Section 1.2.
   * @param nodeId The ID of the node.
   * @returns A promise resolving to an array of version summaries.
   */
  getVersions: (nodeId: number): Promise<NodeVersionSummaryRead[]> => {
    return apiClient<NodeVersionSummaryRead[]>(`/nodes/${nodeId}/versions`);
  },

  /**
   * Fetches the complete snapshot for a specific historical version of a node.
   * Corresponds to API Doc 5, Section 1.3.
   * @param nodeId The ID of the parent node.
   * @param versionId The ID of the version to fetch.
   * @returns A promise resolving to the full node state version.
   */
  getVersionDetail: (
    nodeId: number,
    versionId: number,
  ): Promise<NodeStateVersion> => {
    return apiClient<NodeStateVersion>(
      `/nodes/${nodeId}/versions/${versionId}`,
    );
  },

  /**
   * Activates a historical version for a node.
   * Corresponds to API Doc 5, Section 4.2.
   * @param nodeId The ID of the parent node.
   * @param versionId The ID of the version to activate.
   * @returns A promise resolving to the updated node instance.
   */
  activateVersion: (
    nodeId: number,
    versionId: number,
  ): Promise<NodeInstanceRead> => {
    return apiClient<NodeInstanceRead>(
      `/nodes/${nodeId}/versions/${versionId}/activate`,
      {
        method: "POST",
      },
    );
  },

  /**
   * Submits a user-provided manual edit for a node, creating a new version.
   * Corresponds to API Doc 5, Section 4.1.
   * @param nodeId The ID of the node to edit.
   * @param payload The manual edit submission data.
   * @returns A promise resolving to the updated node instance.
   */
  manualEdit: (
    nodeId: number,
    payload: ManualEditSubmission,
  ): Promise<NodeInstanceRead> => {
    return apiClient<NodeInstanceRead>(`/nodes/${nodeId}/manual-edit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Submits a user's decision for a node awaiting HITL approval.
   * This is the core of human-in-the-loop interaction.
   * Corresponds to API Doc 5, Section 3.
   * @param nodeId The ID of the node to submit the decision for.
   * @param payload The HITL submission data.
   * @returns A promise resolving to the action response from the backend.
   */
  submitHITL: (
    nodeId: number,
    payload: HITLSubmission,
  ): Promise<HITLSubmissionResponse> => {
    return apiClient<HITLSubmissionResponse>(`/nodes/${nodeId}/hitl`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Triggers a re-execution of a completed node.
   * Corresponds to API Doc 5, Section 2.1.
   * @param nodeId The ID of the node to re-execute.
   * @param payload The execution request details.
   * @returns A promise resolving to the acceptance message.
   */
  reExecute: (
    nodeId: number,
    payload: ExecutionRequest,
  ): Promise<{ message: string; node_id: number }> => {
    return apiClient(`/nodes/${nodeId}/re-execute`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Triggers a retry of a failed node.
   * Corresponds to API Doc 5, Section 2.2.
   * @param nodeId The ID of the node to retry.
   * @param payload The execution request details.
   * @returns A promise resolving to the acceptance message.
   */
  retry: (
    nodeId: number,
    payload: ExecutionRequest,
  ): Promise<{ message: string; node_id: number }> => {
    return apiClient(`/nodes/${nodeId}/retry`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
