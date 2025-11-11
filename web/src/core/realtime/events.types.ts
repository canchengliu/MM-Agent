import type { NodeInstanceRead, WorkflowInstanceRead } from "~/core/domain";

/**
 * Standardized payload envelope returned by the realtime API.
 */
interface BaseEvent<T extends string, D> {
  event_type: T;
  workflow_id: number;
  node_id: number | null;
  data: D;
}

/**
 * Fired when a node changes state or metadata; carries the full node payload.
 */
export type NodeStatusUpdatedEvent = BaseEvent<
  "NODE_STATUS_UPDATED",
  NodeInstanceRead
>;

/**
 * Fired when the workflow structure mutates (node add/remove/reorder).
 * Requires consumers to replace the workflow cache entirely.
 */
export type WorkflowStructureUpdatedEvent = BaseEvent<
  "WORKFLOW_STRUCTURE_UPDATED",
  WorkflowInstanceRead
>;

/**
 * Fired when the workflow summary changes (status, metadata, etc.).
 */
export type WorkflowStatusUpdatedEvent = BaseEvent<
  "WORKFLOW_STATUS_UPDATED",
  WorkflowInstanceRead
>;

export type RealtimeEvent =
  | NodeStatusUpdatedEvent
  | WorkflowStructureUpdatedEvent
  | WorkflowStatusUpdatedEvent;

/**
 * Type guard to validate incoming WebSocket payloads before processing.
 */
export function isRealtimeEvent(payload: unknown): payload is RealtimeEvent {
  if (
    payload === null ||
    typeof payload !== "object" ||
    !("event_type" in payload) ||
    !("workflow_id" in payload) ||
    !("data" in payload)
  ) {
    return false;
  }

  const event = payload as Record<string, unknown>;
  return (
    typeof event.event_type === "string" &&
    typeof event.workflow_id === "number"
  );
}
