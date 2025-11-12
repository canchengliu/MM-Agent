import { useWorkflowStore } from "../store/WorkflowStore";

import { EventType, type EventPayload } from "./types";

export const handleEvent = (payload: EventPayload) => {
  const workflowStore = useWorkflowStore.getState();
  if (!workflowStore.workflow || workflowStore.workflow.id !== payload.workflow_id) {
    return;
  }

  switch (payload.event_type) {
    case EventType.NODE_STATUS_UPDATED: {
      workflowStore._processNodeUpdate(payload.data);
      break;
    }
    case EventType.NODE_ACTIVE_VERSION_CHANGED: {
      workflowStore._processNodeUpdate(payload.data);
      void workflowStore.refreshWorkflow().catch((error) => {
        console.error("[WebSocket] Failed to refresh workflow after version change", error);
      });
      break;
    }
    case EventType.WORKFLOW_STRUCTURE_UPDATED:
    case EventType.WORKFLOW_STATUS_UPDATED: {
      workflowStore._processStructureUpdate(payload.data);
      break;
    }
    default: {
      console.warn("[WebSocket] Received unknown event type", payload);
    }
  }
};
