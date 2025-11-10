// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { QueryKeys } from "~/core/api/queryKeys";
import { NodeService } from "~/core/api/services/node.service";
import { WorkflowService } from "~/core/api/services/workflow.service";
import type {
  NodeDetailView,
  NodeStateVersion,
  NodeVersionSummaryRead,
  StalenessReport,
  WorkflowInstanceRead,
} from "~/core/domain";

/**
 * Fetches the complete structure of a single workflow instance.
 * @param workflowId The ID of the workflow to fetch.
 * @param options Optional TanStack Query options.
 */
export const useWorkflow = (
  workflowId: number | null,
  options: Partial<UseQueryOptions<WorkflowInstanceRead>> = {},
) => {
  return useQuery({
    queryKey: QueryKeys.workflow(workflowId),
    queryFn: () => {
      // Type guard to keep the compiler satisfied even when enabled disables the query.
      if (workflowId === null) {
        return Promise.reject(new Error("Workflow ID is required."));
      }
      return WorkflowService.getDetail(workflowId);
    },
    enabled: !!workflowId,
    ...options,
  });
};

/**
 * Fetches the staleness report for a workflow.
 * @param workflowId The ID of the workflow to check.
 * @param options Optional TanStack Query options.
 */
export const useStalenessReport = (
  workflowId: number | null,
  options: Partial<UseQueryOptions<StalenessReport>> = {},
) => {
  return useQuery({
    queryKey: QueryKeys.staleness(workflowId),
    queryFn: () => {
      if (workflowId === null) {
        return Promise.reject(
          new Error("Workflow ID is required for staleness check."),
        );
      }
      return WorkflowService.getStaleness(workflowId);
    },
    enabled: !!workflowId,
    ...options,
  });
};

/**
 * Fetches the detailed information for a single node.
 * @param nodeId The ID of the node to fetch.
 * @param options Optional TanStack Query options.
 */
export const useNodeDetail = (
  nodeId: number | null,
  options: Partial<UseQueryOptions<NodeDetailView>> = {},
) => {
  return useQuery({
    queryKey: QueryKeys.node(nodeId),
    queryFn: () => {
      if (nodeId === null) {
        return Promise.reject(new Error("Node ID is required."));
      }
      return NodeService.getDetail(nodeId);
    },
    enabled: !!nodeId,
    ...options,
  });
};

/**
 * Fetches the list of all historical versions for a node.
 * @param nodeId The ID of the node.
 * @param options Optional TanStack Query options.
 */
export const useNodeVersions = (
  nodeId: number | null,
  options: Partial<UseQueryOptions<NodeVersionSummaryRead[]>> = {},
) => {
  return useQuery({
    queryKey: QueryKeys.nodeVersions(nodeId),
    queryFn: () => {
      if (nodeId === null) {
        return Promise.reject(new Error("Node ID is required for versions."));
      }
      return NodeService.getVersions(nodeId);
    },
    enabled: !!nodeId,
    ...options,
  });
};

/**
 * Fetches the complete snapshot of a specific historical version.
 * @param nodeId The ID of the parent node.
 * @param versionId The ID of the version to fetch.
 * @param options Optional TanStack Query options.
 */
export const useVersionDetail = (
  nodeId: number | null,
  versionId: number | null,
  options: Partial<UseQueryOptions<NodeStateVersion>> = {},
) => {
  return useQuery({
    queryKey: QueryKeys.versionDetail(nodeId, versionId),
    queryFn: () => {
      if (nodeId === null || versionId === null) {
        return Promise.reject(
          new Error("Node ID and Version ID are required."),
        );
      }
      return NodeService.getVersionDetail(nodeId, versionId);
    },
    enabled: !!nodeId && !!versionId,
    ...options,
  });
};
