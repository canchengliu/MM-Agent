"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import { NodeService } from "~/core/api/services/node.service";
import type {
  ManualEditSubmission,
  ReExecutionRequest,
  RetryRequest,
} from "~/core/domain/execution.types";
import type { NodeDetailView } from "~/core/domain/node.types";
import type { NodeInstanceId } from "~/core/domain/version.types";
import type { WorkflowInstanceRead } from "~/core/domain/workflow.types";

type ReExecuteVariables = {
  nodeId: NodeInstanceId;
  payload: ReExecutionRequest;
};

type RetryVariables = {
  nodeId: NodeInstanceId;
  payload: RetryRequest;
};

type ActivateVersionVariables = {
  nodeId: NodeInstanceId;
  versionId: number;
};

type ManualEditVariables = {
  nodeId: NodeInstanceId;
  payload: ManualEditSubmission;
};

/**
 * Hook for re-executing a completed node.
 * Includes optimistic updates for responsive feedback.
 */
export function useReExecuteNode(workflowId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: ReExecuteVariables) =>
      NodeService.reExecute(vars.nodeId, vars.payload),
    onMutate: async ({ nodeId }) => {
      toast.info("Re-execution requested for this node.");
      await queryClient.cancelQueries({ queryKey: QueryKeys.node(nodeId) });

      const previousNode = queryClient.getQueryData<NodeDetailView>(
        QueryKeys.node(nodeId),
      );

      if (previousNode) {
        queryClient.setQueryData<NodeDetailView>(QueryKeys.node(nodeId), {
          ...previousNode,
          status: "Executing",
          current_stage: "Initializing",
          pending_result: null,
          staleness_report: null,
        });
      }

      return { previousNode };
    },
    onError: (error, { nodeId }, context) => {
      if (context?.previousNode) {
        queryClient.setQueryData(QueryKeys.node(nodeId), context.previousNode);
      }

      if (error instanceof ApiError) {
        toast.error(`Re-execution failed: ${error.message}`);
      } else {
        toast.error("Re-execution failed due to an unknown error.");
      }
    },
    onSuccess: (_response, { nodeId }) => {
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.workflow(workflowId),
      });
      void queryClient.invalidateQueries({ queryKey: QueryKeys.node(nodeId) });
    },
  });
}

/**
 * Hook for retrying a failed node execution.
 */
export function useRetryNode(workflowId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: RetryVariables) =>
      NodeService.retry(vars.nodeId, vars.payload),
    onMutate: async ({ nodeId }) => {
      toast.info("Retry requested for this node.");
      await queryClient.cancelQueries({ queryKey: QueryKeys.node(nodeId) });

      const previousNode = queryClient.getQueryData<NodeDetailView>(
        QueryKeys.node(nodeId),
      );

      if (previousNode) {
        queryClient.setQueryData<NodeDetailView>(QueryKeys.node(nodeId), {
          ...previousNode,
          status: "Executing",
          current_stage: "Initializing",
          pending_result: null,
        });
      }

      return { previousNode };
    },
    onError: (error, { nodeId }, context) => {
      if (context?.previousNode) {
        queryClient.setQueryData(QueryKeys.node(nodeId), context.previousNode);
      }

      if (error instanceof ApiError) {
        toast.error(`Retry failed: ${error.message}`);
      } else {
        toast.error("Retry failed due to an unknown error.");
      }
    },
    onSuccess: (_response, { nodeId }) => {
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.workflow(workflowId),
      });
      void queryClient.invalidateQueries({ queryKey: QueryKeys.node(nodeId) });
    },
  });
}

/**
 * Hook for submitting a manual edit to a node.
 * Creates a new version sourced from MANUALLY_EDITED.
 */
export function useManualEditNode(workflowId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: ManualEditVariables) =>
      NodeService.manualEdit(vars.nodeId, vars.payload),
    onSuccess: (updatedNodeData, { nodeId }) => {
      toast.success(
        `Node ${updatedNodeData.name} updated with a new manual version.`,
      );

      void queryClient.invalidateQueries({ queryKey: QueryKeys.node(nodeId) });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.nodeVersions(nodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.workflow(workflowId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.staleness(workflowId),
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "An unknown error occurred.";
      toast.error(`Manual edit failed: ${message}`);
      console.error("Manual edit error:", error);
    },
  });
}

/**
 * Hook for activating a historical version of a node.
 * Invalidates staleness report on success to trigger the "ripple effect" UI update.
 */
export function useActivateVersion(workflowId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: ActivateVersionVariables) =>
      NodeService.activateVersion(vars.nodeId, vars.versionId),
    onSuccess: (updatedNodeData, { nodeId, versionId }) => {
      toast.success(
        `Version ${versionId} of node ${updatedNodeData.name} has been activated.`,
      );

      // OPTIMIZATION: Directly update the node's cache with the returned data.
      // This avoids a network refetch for the node detail itself.
      queryClient.setQueryData<NodeDetailView>(
        QueryKeys.node(nodeId),
        (oldData) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            ...updatedNodeData,
            active_version: null,
            staleness_report: null,
          };
        },
      );

      // Update the node within the main workflow list for immediate UI feedback.
      queryClient.setQueryData<WorkflowInstanceRead>(
        QueryKeys.workflow(workflowId),
        (oldWorkflow) => {
          if (!oldWorkflow) return undefined;
          const nodeIndex = oldWorkflow.nodes.findIndex((n) => n.id === nodeId);
          if (nodeIndex === -1) return oldWorkflow;

          const newNodes = [...oldWorkflow.nodes];
          newNodes[nodeIndex] = { ...newNodes[nodeIndex]!, ...updatedNodeData };
          return { ...oldWorkflow, nodes: newNodes };
        },
      );

      // CRITICAL: Trigger the "ripple effect" by invalidating the staleness report.
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.staleness(workflowId),
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "An unknown error occurred.";
      toast.error(`Version activation failed: ${message}`);
      console.error("Activate version error:", error);
    },
  });
}
