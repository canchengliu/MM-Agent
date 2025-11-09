// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { HITLMode, ProjectStatus, ProvenanceStatus } from "./enums";

// --- Workflow Structure ---

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
}

export interface WorkflowPhase {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

export interface WorkflowStructureResponse {
  version: string;
  phases: WorkflowPhase[];
}

// --- Run State ---

export type GlobalState = Record<string, unknown>;

/**
 * Standardized representation for workflow artifacts stored in GlobalState.
 */
export interface WorkflowOutputObject {
  content?: string;
  asset_id?: string;
  mime_type?: string;
  name?: string;
}

export interface PendingInteraction {
  mode: HITLMode;
  source_step_id: string;
  content_for_review: Record<string, unknown>;
  instructions: string;
  metadata: Record<string, unknown>;
}

export interface RunStateResponse {
  project_id: string;
  status: ProjectStatus;
  active_thread_id: string;
  latest_values: GlobalState;
  next_nodes: string[];
  pending_interaction?: PendingInteraction | null;
  latest_checkpoint_id: string;
}

// --- Execution History ---

export interface HistoryNodeData {
  label: string;
  step_index: number;
  timestamp: string;
  provenance_status: ProvenanceStatus;
  executed_nodes: string[];
  source_checkpoint_id: string | null;
  raw_metadata: Record<string, unknown>;
}

export interface HistoryNode {
  id: string;
  type: string;
  data: HistoryNodeData;
  position: { x: number; y: number };
}

export interface HistoryEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface ExecutionHistoryGraphResponse {
  thread_id: string;
  nodes: HistoryNode[];
  edges: HistoryEdge[];
}

export interface StateSnapshotDetailResponse {
  checkpoint_id: string;
  thread_id: string;
  timestamp: string;
  step_index: number;
  values: GlobalState;
  metadata: Record<string, unknown>;
  next_nodes: string[];
}

// --- Workflow Control & HITL ---

export type VARLDecision = "APPROVE" | "REQUEST_REVISION" | "REJECT";

export interface VARLFeedback {
  mode: "VARL";
  decision: VARLDecision;
  notes?: string;
}

export type SCADecision = string | "REJECT_ALL";

export interface SCAFeedback {
  mode: "SCA";
  decision: SCADecision;
  notes?: string;
}

export type AVLDecision =
  | "ACCEPT_CRITIQUE"
  | "REJECT_CRITIQUE"
  | "APPROVE_DRAFT"
  | "MANUAL_REVISION";

export interface AVLFeedback {
  mode: "AVL";
  decision: AVLDecision;
  notes?: string | null;
}

export type HITLFeedback = VARLFeedback | SCAFeedback | AVLFeedback;

export interface RunResumeRequest {
  client_checkpoint_id: string;
  feedback: HITLFeedback;
}

// --- Advanced History Operations ---

export interface HistoryBranchRequest {
  source_thread_id: string;
  rewind_checkpoint_id: string;
  new_thread_id?: string;
  interrupt_after?: string[];
  inputs?: Record<string, unknown> | null;
}

export interface CompositionStep {
  source_thread_id: string;
  superstep_indices: number[];
}

export interface HistoryComposeRequest {
  composition_plan: CompositionStep[];
  new_thread_id?: string;
  auto_start: boolean;
  start_from_thread_id?: string | null;
  start_from_checkpoint_id?: string | null;
}

export interface HistoryOperationResponse {
  thread_id: string;
  status: ProjectStatus;
  message: string;
  latest_checkpoint_id: string;
}
