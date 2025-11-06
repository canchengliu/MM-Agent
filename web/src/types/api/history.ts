// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from "@xyflow/react";

import type { ISO8601String, ProjectStatus, UUID } from "./common";

/**
 * Provenance flag describing how a snapshot was created.
 * Mirrors `SnapshotCreationMethod` from the backend contract.
 */
export type SnapshotCreationMethod =
  | "INITIAL"
  | "EXECUTED"
  | "GRAFTED"
  | "RESUMED";

/**
 * Status describing the runtime provenance state of a node.
 */
export type ProvenanceStatus =
  | "QUEUED"
  | "EXECUTED"
  | "GRAFTED"
  | "INTERRUPTED"
  | "ERROR"
  | "RESUMED";

/**
 * Additional metadata attached to history nodes that is useful for UI logic.
 * Most fields are optional because older API responses may not expose
 * everything yet.
 */
export interface HistoryNodeData extends Record<string, unknown> {
  label: string;
  step_index: number;
  timestamp: ISO8601String;
  provenance_status: ProvenanceStatus;
  executed_nodes: string[];
  source_checkpoint_id: UUID | null;
  creation_method?: SnapshotCreationMethod;
  runtime_status?: ProjectStatus | null;
  status?: ProjectStatus | null;
  thread_id?: string;
  thread_name?: string;
  branch_id?: string;
  raw_metadata?: Record<string, unknown> | null;
}

export type HistoryNode = ReactFlowNode<HistoryNodeData>;
export type HistoryEdge = ReactFlowEdge;

export interface ExecutionHistoryGraphResponse {
  thread_id: string;
  nodes: HistoryNode[];
  edges: HistoryEdge[];
}

export interface HistoryComposeSegment {
  source_thread_id: string;
  superstep_indices: number[];
}

export interface HistoryComposeRequest {
  composition_plan: HistoryComposeSegment[];
  new_thread_id?: string | null;
  auto_start?: boolean;
  start_from_thread_id?: string | null;
  start_from_checkpoint_id?: string | null;
}

export interface HistoryOperationResponse {
  thread_id: string;
  status: string;
  message: string;
  latest_checkpoint_id?: string;
}

export interface CompatibilityErrorBody {
  error_code: "COMPATIBILITY_ERROR";
  message: string;
  detail?: {
    reason?: string;
    source_step?: string | number;
    target_step?: string | number;
    error_id?: string;
  } | null;
}
