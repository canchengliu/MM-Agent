import type { NodeInstanceRead, WorkflowInstanceRead } from "../api";

export enum EventType {
  NODE_STATUS_UPDATED = "NODE_STATUS_UPDATED",
  NODE_ACTIVE_VERSION_CHANGED = "NODE_ACTIVE_VERSION_CHANGED",
  WORKFLOW_STRUCTURE_UPDATED = "WORKFLOW_STRUCTURE_UPDATED",
  WORKFLOW_STATUS_UPDATED = "WORKFLOW_STATUS_UPDATED",
}

interface EventPayloadBase<T extends EventType> {
  event_type: T;
  workflow_id: number;
  node_id: number | null;
}

export type NodeEventPayload<T extends EventType.NODE_STATUS_UPDATED | EventType.NODE_ACTIVE_VERSION_CHANGED> =
  EventPayloadBase<T> & {
    data: NodeInstanceRead;
  };

export type WorkflowEventPayload<
  T extends EventType.WORKFLOW_STRUCTURE_UPDATED | EventType.WORKFLOW_STATUS_UPDATED,
> = EventPayloadBase<T> & {
  data: WorkflowInstanceRead;
};

export type EventPayload =
  | NodeEventPayload<EventType.NODE_STATUS_UPDATED>
  | NodeEventPayload<EventType.NODE_ACTIVE_VERSION_CHANGED>
  | WorkflowEventPayload<EventType.WORKFLOW_STRUCTURE_UPDATED>
  | WorkflowEventPayload<EventType.WORKFLOW_STATUS_UPDATED>;
