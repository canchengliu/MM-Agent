// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import { NodeService } from "~/core/api/services/node.service";
import type {
  ExecutionRequest,
  ManualEditSubmission,
  NodeDetailView,
} from "~/core/domain";

/**
 * Creates a shared optimistic update handler for node execution actions.
 * @returns A partial `useMutation` options object.
 */
const useOptimisticNodeUpdate = () => {
  const queryClient = useQueryClient();

  return {
    onMutate: async (variables: { nodeId: number; payload: ExecutionRequest }) => {
      const { nodeId } = variables;
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: QueryKeys.node(nodeId) });

      // Snapshot the previous value
      const previousNode = queryClient.getQueryData<NodeDetailView>(
        QueryKeys.node(nodeId),
      );

      // Optimistically update to the new 'Executing' state, as per Design Doc 3.1.2.1
      if (previousNode) {
        queryClient.setQueryData<NodeDetailView>(QueryKeys.node(nodeId), {
          ...previousNode,
          status: "Executing",
          current_stage: "Queued", // 'Waking Up' visual state
          pending_result: null, // Clear previous failed result or old data
        });
      }

      return { previousNode };
    },
    onError: (
      err: ApiError,
      variables: { nodeId: number; payload: ExecutionRequest },
      context?: { previousNode?: NodeDetailView },
    ) => {
      // On error, roll back to the previous state
      if (context?.previousNode) {
        queryClient.setQueryData(
          QueryKeys.node(variables.nodeId),
          context.previousNode,
        );
      }
      toast.error(err.message || "Operation failed", {
        description: `Could not process node #${variables.nodeId}. Please check the node's state.`,
      });
    },
    onSettled: (
      data: unknown,
      error: Error | null,
      variables: { nodeId: number },
    ) => {
      // Invalidate after an error to ensure state is synced with the server.
      if (error) {
        void queryClient.invalidateQueries({
          queryKey: QueryKeys.node(variables.nodeId),
        });
      }
    },
  };
};

/**
 * Creates a mutation for re-executing a completed node.
 * Includes optimistic UI updates for immediate feedback.
 */
export const useReExecuteNode = () => {
  const optimisticUpdater = useOptimisticNodeUpdate();

  return useMutation({
    mutationFn: (variables: { nodeId: number; payload: ExecutionRequest }) =>
      NodeService.reExecute(variables.nodeId, variables.payload),
    ...optimisticUpdater,
    onSuccess: (data) => {
      toast.info(data.message);
    },
  });
};

/**
 * Creates a mutation for retrying a failed node.
 * Includes optimistic UI updates for immediate feedback.
 */
export const useRetryNode = () => {
  const optimisticUpdater = useOptimisticNodeUpdate();

  return useMutation({
    mutationFn: (variables: { nodeId: number; payload: ExecutionRequest }) =>
      NodeService.retry(variables.nodeId, variables.payload),
    ...optimisticUpdater,
    onSuccess: (data) => {
      toast.info(data.message);
    },
  });
};

/**
 * Creates a mutation for activating a historical version of a node.
 * Invalidates workflow and staleness caches to trigger the "ripple effect".
 */
export const useActivateVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      nodeId: number;
      versionId: number;
      workflowId: number;
      versionNumber: number;
    }) => NodeService.activateVersion(variables.nodeId, variables.versionId),
    onSuccess: (updatedNode, variables) => {
      const { nodeId, workflowId, versionNumber } = variables;

      void queryClient.invalidateQueries({
        queryKey: QueryKeys.staleness(workflowId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.node(nodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.nodeVersions(nodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.workflow(workflowId),
      });

      toast.success(
        `Version ${versionNumber} activated for node "${updatedNode.name}".`,
        {
          description: "Downstream nodes may now be stale.",
        },
      );
    },
    onError: (err: ApiError, variables) => {
      toast.error(err.message || "Failed to activate version", {
        description: `Could not activate version #${variables.versionId} for node #${variables.nodeId}. ${
          err.details ? JSON.stringify(err.details) : "The backend may have rejected the request."
        }`,
      });
    },
  });
};

/**
 * Creates a mutation for submitting a manual edit for a node.
 * Invalidates caches to reflect the new version and trigger the "ripple effect".
 */
export const useManualEdit = (workflowId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      nodeId: number;
      payload: ManualEditSubmission;
    }) => NodeService.manualEdit(variables.nodeId, variables.payload),
    onSuccess: (updatedNode, variables) => {
      const { nodeId } = variables;

      void queryClient.invalidateQueries({
        queryKey: QueryKeys.staleness(workflowId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.node(nodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.nodeVersions(nodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.workflow(workflowId),
      });

      toast.success(
        `New manual version created for node "${updatedNode.name}".`,
      );
    },
    onError: (err: ApiError, variables) => {
      toast.error(err.message || "Failed to save manual edit.", {
        description: `Could not create a new version for node #${variables.nodeId}. ${
          err.details
            ? JSON.stringify(err.details)
            : "The backend may have rejected the request."
        }`,
      });
    },
  });
};
