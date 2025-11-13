import { EventType, type EventPayload } from "~/core/models/events.model";
import { useStore } from "~/core/store";

/**
 * Central dispatcher for WebSocket events. Routes events to the appropriate Zustand store actions.
 * (Architecture 5.2.2)
 */
export function dispatchEvent(payload: EventPayload): void {
  const store = useStore.getState();
  const { event_type, workflow_id } = payload;

  // Ensure the event belongs to the currently active workflow
  if (store.workflowInstance?.id !== workflow_id) {
    console.warn(
      `Dispatcher: Received event for workflow ${workflow_id} but current workflow is ${store.workflowInstance?.id}. Ignoring.`,
    );
    return;
  }

  // Route the event based on its type (API 6.5)
  switch (event_type) {
    case EventType.NodeStatusUpdated:
      // Incremental update (API 6.5.1)
      store.handleNodeStatusUpdated(payload.data);
      break;

    case EventType.NodeActiveVersionChanged:
      // Triggers full sync for staleness (API 6.5.2)
      // The action is async, we use void to explicitly acknowledge we are not waiting for it here.
      void store.handleNodeActiveVersionChanged(payload.data);
      break;

    case EventType.WorkflowStructureUpdated:
      // Full structure replacement (API 6.5.3)
      store.handleWorkflowStructureUpdated(payload.data);
      break;

    case EventType.WorkflowStatusUpdated:
      // Workflow status update
      store.handleWorkflowStatusUpdated(payload.data);
      break;
  }
}