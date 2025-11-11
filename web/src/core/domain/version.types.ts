import type { Brand } from "./common.types";
import type { HITLMode } from "./node.types";

export type VersionId = Brand<number, "VersionId">;
export type NodeInstanceId = Brand<number, "NodeInstanceId">;

/**
 * Provenance indicator for a node's version.
 */
export type VersionSource =
  | "AI_INITIAL"
  | "AI_GENERATED"
  | "HITL_REFINED"
  | "MANUALLY_EDITED";

/**
 * Payload for the SCA (Select Candidate/s) interaction.
 */
export interface SCAInteractionData {
  selected_ids: string[];
}

/**
 * Single adjudication entry for AVL interactions.
 */
export interface AVLAdjudication {
  critique_id: string;
  decision: "Accepted" | "Rejected";
  comment?: string;
}

export interface AVLInteractionData {
  adjudication: AVLAdjudication[];
}

export type HITLInteractionData = SCAInteractionData | AVLInteractionData;

/**
 * Immutable record of a HITL step tied to a version.
 */
export interface HITLRecord {
  interaction_type: HITLMode;
  timestamp: string;
  user_input: HITLInteractionData;
  llm_response?: Record<string, any>;
}

/**
 * Snapshot of a node's approved state and provenance.
 */
export interface NodeStateVersion {
  id: VersionId;
  node_instance_id: NodeInstanceId;
  version_number: number;
  source: VersionSource;
  summary: string | null;
  based_on_version_id: VersionId | null;
  created_at: string;
  input_versions: Record<string, number>;
  output_data: Record<string, any>;
  hitl_records: HITLRecord[];
  environment_params?: Record<string, any>;
}

/**
 * Lightweight view for historical listings.
 */
export type NodeVersionSummary = Pick<
  NodeStateVersion,
  | "id"
  | "version_number"
  | "node_instance_id"
  | "summary"
  | "source"
  | "based_on_version_id"
  | "created_at"
>;
