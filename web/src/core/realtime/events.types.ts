// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type {
  NodeInstanceRead,
  WorkflowInstanceRead,
} from "~/core/domain";

/**
 * Union of all possible WebSocket event types from the server.
 * Derived from API Doc 6.4.
 */
export type WSEventType =
  | "NODE_STATUS_UPDATED"
  | "WORKFLOW_STRUCTURE_UPDATED"
  | "WORKFLOW_STATUS_UPDATED"
  | "ERROR";

/**
 * Generic structure for all incoming WebSocket messages.
 * Derived from API Doc 6.4.
 */
export interface WSEventPayload {
  event_type: WSEventType;
  workflow_id: number;
  node_id: number | null;
  data: unknown;
}

/**
 * Strongly typed payload for the 'NODE_STATUS_UPDATED' event (API Doc 6.5.1).
 */
export interface WSNodeStatusUpdatedPayload extends WSEventPayload {
  event_type: "NODE_STATUS_UPDATED";
  node_id: number;
  data: NodeInstanceRead;
}

/**
 * Strongly typed payload for the 'WORKFLOW_STRUCTURE_UPDATED' event (API Doc 6.5.2).
 */
export interface WSWorkflowStructureUpdatedPayload extends WSEventPayload {
  event_type: "WORKFLOW_STRUCTURE_UPDATED";
  data: WorkflowInstanceRead;
}

/**
 * Strongly typed payload for the 'WORKFLOW_STATUS_UPDATED' event (API Doc 6.5.3).
 */
export interface WSWorkflowStatusUpdatedPayload extends WSEventPayload {
  event_type: "WORKFLOW_STATUS_UPDATED";
  data: WorkflowInstanceRead;
}
