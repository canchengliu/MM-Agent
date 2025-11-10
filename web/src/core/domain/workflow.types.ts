import type { NodeInstanceRead } from "./node.types";

/**
 * Represents the overall status of a workflow instance.
 * From API Doc 4, "Workflow Status" concept.
 */
export type WorkflowStatus = "Running" | "Completed";

/**
 * OPTIMIZATION: Centralized definition for dependency staleness.
 * Represents the staleness information for a single upstream dependency,
 * used in both workflow-level and node-level reports.
 * Based on API Doc 4.3.1 and 5.1.1.
 */
export interface StalenessInfo {
  upstream_node_id: number;
  upstream_definition_id: string;
  consumed_version_id: number;
  current_active_version_id: number;
}

/**
 * A mapping of node IDs to their staleness reasons.
 * Based on API Doc 4, Section 3.1 `GET /workflows/{workflow_id}/staleness`.
 */
export type StalenessReport = Record<string, StalenessInfo[]>;

/**
 * Represents a summary view of a workflow instance.
 * Based on API Doc 4, Section 1.2 `GET /workflows/`.
 */
export interface WorkflowSummaryRead {
  id: number;
  name: string;
  status: WorkflowStatus;
  project_id: number;
  user_id: number;
  created_at: string; // ISO 8601 date string
}

/**
 * Represents the complete detailed information of a single workflow instance,
 * including all its nodes. This is the core data for the canvas.
 * Based on API Doc 4, Section 2.1 `GET /workflows/{workflow_id}`.
 */
export interface WorkflowInstanceRead extends WorkflowSummaryRead {
  nodes: NodeInstanceRead[];
}
