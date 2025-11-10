import type { HITLMode } from "./node.types";

/**
 * OPTIMIZATION: Defines the set of version sources strictly defined by the backend API.
 * From API Doc 5, Section 1.2 `GET /nodes/{node_id}/versions`.
 */
export type VersionSourceFromAPI = "AI_GENERATED" | "MANUALLY_EDITED";

/**
 * OPTIMIZATION: Defines an enriched set of version sources for richer frontend context.
 * It includes API values plus additional states from the design document for better traceability.
 * From Design Doc 2.1.5.
 */
export type VersionSource =
  | VersionSourceFromAPI
  | "AI_INITIAL"
  | "HITL_REFINED";

/**
 * Represents a detailed user interaction record during a node's execution.
 * Part of a `NodeStateVersion`, capturing the "why" behind a decision.
 * Based on Design Doc 2.1.2.
 */
export interface HITLRecord {
  interaction_type: HITLMode;
  timestamp: string; // ISO 8601 date string
  user_input: Record<string, unknown>;
  llm_response: unknown;
}

/**
 * Represents a summary view of a historical node version.
 * Based on API Doc 5, Section 1.2 `GET /nodes/{node_id}/versions`.
 */
export interface NodeVersionSummaryRead {
  id: number;
  version_number: number;
  node_instance_id: number;
  summary: string | null;
  source: VersionSource;
  based_on_version_id: number | null;
  created_at: string; // ISO 8601 date string
}

/**
 * Represents an immutable, atomic snapshot of a node's state at a point in time.
 * This is the core "Result State" concept.
 * Based on Design Doc 2.1.2 and implied by `NodeDetailView.active_version`
 * and the response from `GET /nodes/{id}/versions/{vid}`.
 */
export interface NodeStateVersion extends NodeVersionSummaryRead {
  /**
   * Records the exact upstream version IDs this version was based on.
   * e.g., `{"<upstream_node_id>": <version_id>}`
   */
  input_versions: Record<string, number>;
  /**
   * The final, structured JSON output of this version.
   */
  output_data: Record<string, unknown>;
  /**
   * A complete log of Human-in-the-Loop interactions that led to this version.
   */
  hitl_records: HITLRecord[];
  /**
   * A snapshot of environmental parameters at the time of execution.
   */
  environment_params: Record<string, unknown>;
  /**
   * The creation timestamp of this version.
   */
  created_at: string; // ISO 8601 date string
}
