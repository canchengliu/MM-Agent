import type { JsonObject, Nullable } from "./common";
import type { NodeInstanceRead, StalenessInfo } from "./workflow";

export type NodeVersionSource = "AI_GENERATED" | "MANUALLY_EDITED";

export interface NodeVersionRead {
  id: number;
  version_number: number;
  node_instance_id: number;
  summary: string;
  source: NodeVersionSource;
  based_on_version_id: Nullable<number>;
  output_data: JsonObject | null;
  raw_generated_output: JsonObject | null;
  execution_artifacts: JsonObject | null;
  input_dependencies: Record<string, number>;
  hitl_history: JsonObject[];
  llm_model_name: string;
  temperature: number;
}

export interface TemporaryExecutionRead {
  output_data: JsonObject | null;
  execution_artifacts: JsonObject | null;
  accumulated_hitl_interactions: JsonObject[];
  error_log: Nullable<string>;
}

export interface NodeDetailView extends NodeInstanceRead {
  active_version: Nullable<NodeVersionRead>;
  pending_result: Nullable<TemporaryExecutionRead>;
  staleness_report: Nullable<StalenessInfo[]>;
}

export type HitlAction =
  | "Continue"
  | "RejectAndProvideModificationComments"
  | "Discard";

export interface SCAInteractionData {
  selected_ids: string[];
}

export interface AVLAdjudicationDecision {
  critique_id: string;
  decision: string;
  comment?: Nullable<string>;
}

export interface AVLInteractionData {
  adjudication: AVLAdjudicationDecision[];
}

export type HitlInteractionData =
  | SCAInteractionData
  | AVLInteractionData
  | Record<string, unknown>;

export interface HitlSubmissionPayload {
  action: HitlAction;
  feedback_comment?: Nullable<string>;
  interaction_data?: HitlInteractionData;
}

export type HITLSubmission = HitlSubmissionPayload;

export type NodeActionDirective =
  | "ExecuteNext"
  | "NavigateNext"
  | "Completed"
  | "AVLLoop"
  | "ReExecute"
  | "Discarded";

export interface HitlSubmissionResult {
  message: string;
  next_node_id?: Nullable<number>;
  action: NodeActionDirective;
}

export interface ExecutionRequestPayload {
  modification_comments?: string;
  base_version_id?: number;
}

export type ExecutionRequest = ExecutionRequestPayload;

export interface ManualEditSubmissionPayload {
  base_version_id: number;
  edited_output_data: JsonObject;
  summary?: Nullable<string>;
}

export type ManualEditSubmission = ManualEditSubmissionPayload;

export interface NodeActionAck {
  message: string;
  node_id?: number;
  next_node_id?: number;
}
