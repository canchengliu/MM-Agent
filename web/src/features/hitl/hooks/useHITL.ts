import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import { NodeService } from "~/core/api/services/node.service";
import type { HITLSubmission } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";

/**
 * Creates a mutation for submitting a HITL decision for a node.
 * Encapsulates request logic plus cache invalidation and workspace navigation.
 */
export const useSubmitHITL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      nodeId: number;
      workflowId: number;
      payload: HITLSubmission;
    }) => NodeService.submitHITL(variables.nodeId, variables.payload),

    onSuccess: (data, variables) => {
      const { nodeId, workflowId } = variables;
      toast.success(data.message);

      switch (data.action) {
        case "ExecuteNext":
        case "NavigateNext":
          if (data.next_node_id) {
            useWorkspaceStore.getState().focusNode(data.next_node_id);
          }
          break;

        case "Completed":
          void queryClient.invalidateQueries({
            queryKey: QueryKeys.node(nodeId),
          });
          void queryClient.invalidateQueries({
            queryKey: QueryKeys.workflow(workflowId),
          });
          break;

        case "AVLLoop":
        case "ReExecute":
          // Backend realtime events will update the UI; no action required here.
          break;

        case "Discarded":
          toast.info("Execution has been discarded.");
          void queryClient.invalidateQueries({
            queryKey: QueryKeys.node(nodeId),
          });
          break;

        default:
          break;
      }
    },

    onError: (error) => {
      const description =
        error instanceof ApiError
          ? error.message
          : "An unknown error occurred.";
      toast.error("Failed to submit decision", { description });
    },
  });
};
