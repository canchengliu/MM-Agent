import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QueryKeys } from "~/core/api/queryKeys";
import type { WorkflowInstanceRead } from "~/core/domain";

import type {
  NodeStatusUpdatedEvent,
  RealtimeEvent,
  WorkflowStatusUpdatedEvent,
  WorkflowStructureUpdatedEvent,
} from "./events.types";

/**
 * Updates node-specific caches and invalidates staleness when a node completes.
 * Keeps both focused node views and workflow summaries consistent without refetch.
 */
function handleNodeStatusUpdate(
  event: NodeStatusUpdatedEvent,
  queryClient: QueryClient,
) {
  const { workflow_id, node_id, data } = event;
  if (!node_id) {
    return;
  }

  queryClient.setQueryData(QueryKeys.node(node_id), data);

  queryClient.setQueryData<WorkflowInstanceRead>(
    QueryKeys.workflow(workflow_id),
    (oldData) => {
      if (!oldData) {
        return undefined;
      }

      const nodeIndex = oldData.nodes.findIndex((node) => node.id === node_id);
      if (nodeIndex === -1) {
        return oldData;
      }

      const nodes = [...oldData.nodes];
      nodes[nodeIndex] = data;
      return { ...oldData, nodes };
    },
  );

  if (data.status === "Completed") {
    void queryClient.invalidateQueries({
      queryKey: QueryKeys.staleness(workflow_id),
    });
  }
}

/**
 * Performs the mandated full workflow cache replacement after structural changes.
 * Also invalidates staleness, as dependencies are guaranteed to differ.
 */
function handleWorkflowStructureUpdate(
  event: WorkflowStructureUpdatedEvent,
  queryClient: QueryClient,
) {
  const { workflow_id, data } = event;
  toast.info("Workflow structure has been updated.");

  queryClient.setQueryData(QueryKeys.workflow(workflow_id), data);
  void queryClient.invalidateQueries({
    queryKey: QueryKeys.staleness(workflow_id),
  });
}

/**
 * Replaces workflow cache for status changes and surfaces completion feedback.
 */
function handleWorkflowStatusUpdate(
  event: WorkflowStatusUpdatedEvent,
  queryClient: QueryClient,
) {
  const { workflow_id, data } = event;

  if (data.status === "Completed") {
    toast.success("Workflow completed successfully!");
  }

  queryClient.setQueryData(QueryKeys.workflow(workflow_id), data);
}

/**
 * Routes incoming realtime events to the appropriate cache mutation strategy.
 */
export function dispatchEventToCache(
  payload: RealtimeEvent,
  queryClient: QueryClient,
) {
  switch (payload.event_type) {
    case "NODE_STATUS_UPDATED":
      handleNodeStatusUpdate(payload, queryClient);
      break;
    case "WORKFLOW_STRUCTURE_UPDATED":
      handleWorkflowStructureUpdate(payload, queryClient);
      break;
    case "WORKFLOW_STATUS_UPDATED":
      handleWorkflowStatusUpdate(payload, queryClient);
      break;
    default:
      console.warn("[Realtime] Received unhandled event.", payload);
  }
}
