/**
 * Payload for POST /nodes/{id}/re-execute.
 */
export interface ReExecutionRequest {
  modification_comments?: string;
  base_version_id?: number;
}

/**
 * Payload for POST /nodes/{id}/retry.
 */
export interface RetryRequest {
  modification_comments?: string;
}

/**
 * Generic response schema for asynchronous node-control actions.
 */
export interface AcceptedResponse {
  message: string;
  node_id: number;
}

/**
 * Payload for POST /nodes/{id}/manual-edit.
 */
export interface ManualEditSubmission {
  base_version_id: number;
  edited_output_data: Record<string, unknown>;
  summary?: string;
}
