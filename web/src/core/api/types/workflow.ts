import type { ISODateString, Nullable } from "./common";

export type WorkflowStatus = "Running" | "Completed";
export type NodeStatus =
  | "Not Started"
  | "Executing"
  | "Awaiting HITL Approval"
  | "Completed"
  | "Failed"
  | "Canceled";
export type NodeExecutionStage =
  | "Not Started"
  | "Initializing"
  | "Processing"
  | "Generating Outputs"
  | "Awaiting Review"
  | "Completed"
  | "Failed";
export type NodeType = "Standard" | "Generator";
export type HitlMode = "VARL" | "SCA" | "AVL";

export interface NodeInstanceRead {
  id: number;
  definition_id: string;
  name: string;
  status: NodeStatus;
  current_stage: NodeExecutionStage;
  node_type: NodeType;
  hitl_mode: HitlMode;
  order_index: number;
  active_version_id: Nullable<number>;
  phase_id: string;
  stage_id: string;
  stage_name: string;
  task_group_id: Nullable<string>;
  is_stale: boolean;
}

export interface StageRead {
  id: string;
  name: string;
  nodes: NodeInstanceRead[];
}

export interface PhaseRead {
  name: string;
  stages: StageRead[];
}

export interface WorkflowInstanceRead {
  id: number;
  name: string;
  status: WorkflowStatus;
  project_id: number;
  user_id: number;
  phases: PhaseRead[];
}

export interface WorkflowSummaryRead {
  id: number;
  name: string;
  status: WorkflowStatus;
  project_id: number;
  user_id: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  node_count?: number;
  completed_node_count?: number;
}

export interface StalenessInfo {
  upstream_node_id: number;
  upstream_definition_id: string;
  consumed_version_id: number;
  current_active_version_id: Nullable<number>;
}

export interface WorkflowCreatePayload {
  name: string;
  project_id: number;
}

export interface WorkflowUpdatePayload {
  name?: string;
}

export type WorkflowCreateRequest = WorkflowCreatePayload;
export type WorkflowUpdateRequest = WorkflowUpdatePayload;
