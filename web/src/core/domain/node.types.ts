import type { VersionId, NodeStateVersion, HITLRecord, NodeInstanceId } from "./version.types";

/**
 * Lifecycle status for a workflow node instance.
 */
export type NodeStatus =
  | "Not Started"
  | "Executing"
  | "Awaiting HITL Approval"
  | "Completed"
  | "Failed";

/**
 * Describes whether a node is standard or can spawn new structure.
 */
export type NodeType = "Standard" | "Generator";

/**
 * Human-in-the-loop interaction mode used by the node.
 */
export type HITLMode = "VARL" | "SCA" | "AVL";

/**
 * One dependency reason contributing to node staleness.
 */
export interface StalenessInfo {
  upstream_node_id: NodeInstanceId;
  upstream_definition_id: string;
  consumed_version_id: number;
  current_active_version_id: number;
}

/**
 * Summary view of a node returned in workflow detail responses.
 */
export interface NodeInstanceRead {
  id: NodeInstanceId;
  definition_id: string;
  name: string;
  status: NodeStatus;
  current_stage: string | null;
  node_type: NodeType;
  hitl_mode: HITLMode;
  order_index: number;
  active_version_id: VersionId | null;
  phase_id: string | null;
  task_group_id: string | null;
}

/**
 * Pending execution payload awaiting user approval.
 */
export interface PendingResult {
  output_data: Record<string, any>;
  accumulated_hitl_interactions: Partial<HITLRecord>[];
  error_log: string | null;
}

/**
 * Rich detail view for a workflow node, including staleness and pending output.
 */
export interface NodeDetailView extends NodeInstanceRead {
  active_version: NodeStateVersion | null;
  pending_result: PendingResult | null;
  staleness_report: StalenessInfo[] | null;
}
