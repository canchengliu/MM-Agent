import type { NodeStateVersion, HITLRecord } from "./version.types";
import type { StalenessInfo } from "./workflow.types";

/**
 * Represents the lifecycle status of a node instance.
 * From API Doc 5, "Node Lifecycle" concept.
 */
export type NodeStatus =
  | "Not Started"
  | "Executing"
  | "Awaiting HITL Approval"
  | "Completed"
  | "Failed";

/**
 * Defines the type of a node, influencing system behavior.
 * `Generator` nodes can dynamically alter the workflow structure.
 * From Design Doc 2.1.5, API Doc 5, Section 1.1 `NodeDetailView`.
 */
export type NodeType = "Standard" | "Generator";

/**
 * Defines the Human-in-the-Loop interaction pattern for a node.
 * From Design Doc 2.1.5, API Doc 5, Section 1.1 `NodeDetailView`.
 */
export type HITLMode = "VARL" | "SCA" | "AVL";

/**
 * Represents a summary view of a node instance within a workflow.
 * Based on API Doc 3, Section 3.1 `POST /projects/{id}/start` response,
 * which returns a `NodeInstanceRead`.
 */
export interface NodeInstanceRead {
  id: number;
  definition_id: string;
  name: string;
  status: NodeStatus;
  current_stage: string;
  node_type: NodeType;
  hitl_mode: HITLMode;
  order_index: number;
  active_version_id: number | null;
  phase_id: string;
  task_group_id: string | null;
}

/**
 * The payload for re-executing or retrying a node.
 * From API Doc 5, Section 2.1 & 2.2.
 */
export interface ExecutionRequest {
  modification_comments?: string | null;
  base_version_id?: number | null;
}

/**
 * The payload for submitting a HITL decision.
 * From API Doc 5, Section 3.
 */
export interface HITLSubmission {
  action: "Continue" | "RejectAndProvideModificationComments" | "Discard";
  feedback_comment?: string | null;
  interaction_data?: Record<string, unknown> | null;
}

/**
 * The payload for submitting a manual edit to a node.
 * From API Doc 5, Section 4.1.
 */
export interface ManualEditSubmission {
  base_version_id: number;
  edited_output_data: Record<string, unknown>;
  summary?: string;
}

/**
 * The response from a successful HITL submission.
 * From API Doc 5, Section 3.
 */
export interface HITLSubmissionResponse {
  message: string;
  next_node_id: number | null;
  action:
    | "ExecuteNext"
    | "NavigateNext"
    | "Completed"
    | "AVLLoop"
    | "ReExecute"
    | "Discarded";
}

/**
 * Represents the temporary result of a node's execution that is
 * either in-progress or awaiting user approval (HITL).
 * This corresponds to the `ExecutionTrace` concept's output.
 * From API Doc 5, Section 1.1 `pending_result` field.
 */
export interface PendingExecutionResult {
  output_data: Record<string, unknown>;
  /**
   * OPTIMIZATION: Replaced `any[]` with a specific type for improved type safety,
   * assuming the structure is consistent with the final `HITLRecord`.
   */
  accumulated_hitl_interactions: HITLRecord[];
  error_log: string | null;
}

/**
 * Represents the complete detailed information of a single node instance.
 * This is the primary data source for the Inspector and HITL views.
 * Based on API Doc 5, Section 1.1 `GET /nodes/{node_id}`.
 */
export interface NodeDetailView extends NodeInstanceRead {
  active_version: NodeStateVersion | null;
  pending_result: PendingExecutionResult | null;
  /**
   * OPTIMIZATION: Now uses the centralized `StalenessInfo` type.
   */
  staleness_report: StalenessInfo[] | null;
}
