"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import { NodeService } from "~/core/api/services/node.service";
import type { HITLSubmission } from "~/core/domain/hitl.types";
import type { NodeInstanceId } from "~/core/domain/version.types";
import { useWorkspaceStore } from "~/core/store";

/**
 * Mutation hook to submit HITL decisions and keep workspace caches fresh.
 */
export function useSubmitHITL(workflowId: number) {
  const queryClient = useQueryClient();
  const { focusNode } = useWorkspaceStore.getState();

  return useMutation({
    mutationFn: (vars: { nodeId: number; submission: HITLSubmission }) =>
      NodeService.submitHITL(vars.nodeId, vars.submission),
    onSuccess: (response, variables) => {
      toast.success(response.message);

      void queryClient.invalidateQueries({
        queryKey: QueryKeys.node(variables.nodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.workflow(workflowId),
      });

      switch (response.action) {
        case "NavigateNext":
          if (response.next_node_id) {
            focusNode(response.next_node_id as NodeInstanceId);
          }
          break;
        case "Completed":
          toast.success("✨ Workflow completed successfully!");
          void queryClient.invalidateQueries({
            queryKey: QueryKeys.workflow(workflowId),
          });
          break;
        case "ExecuteNext":
        case "ReExecute":
        case "AVLLoop":
        case "Discarded":
        default:
          break;
      }
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(`Submission failed: ${error.message}`);
      } else {
        toast.error("An unknown error occurred during submission.");
      }
      console.error("HITL submission error:", error);
    },
  });
}
