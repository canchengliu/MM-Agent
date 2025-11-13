import type { NodeInstanceRead, WorkflowInstanceRead } from "./workflow.model";

// Define the Event Types (API 6.5)
export enum EventType {
  NodeStatusUpdated = "NODE_STATUS_UPDATED",
  NodeActiveVersionChanged = "NODE_ACTIVE_VERSION_CHANGED",
  WorkflowStructureUpdated = "WORKFLOW_STRUCTURE_UPDATED",
  WorkflowStatusUpdated = "WORKFLOW_STATUS_UPDATED",
}

// Base structure shared by all event payloads
interface BaseEventPayload {
  event_type: EventType;
  workflow_id: number;
}

export type NodeStatusUpdatedPayload = BaseEventPayload & {
  event_type: EventType.NodeStatusUpdated;
  data: NodeInstanceRead;
  node_id: number;
};

export type NodeActiveVersionChangedPayload = BaseEventPayload & {
  event_type: EventType.NodeActiveVersionChanged;
  data: NodeInstanceRead;
  node_id: number;
};

export type WorkflowStructureUpdatedPayload = BaseEventPayload & {
  event_type: EventType.WorkflowStructureUpdated;
  data: WorkflowInstanceRead;
  node_id: null;
};

export type WorkflowStatusUpdatedPayload = BaseEventPayload & {
  event_type: EventType.WorkflowStatusUpdated;
  data: WorkflowInstanceRead;
  node_id: null;
};

export type EventPayload =
  | NodeStatusUpdatedPayload
  | NodeActiveVersionChangedPayload
  | WorkflowStructureUpdatedPayload
  | WorkflowStatusUpdatedPayload;
