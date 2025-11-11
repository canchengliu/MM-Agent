"use client";

import { useQuery } from "@tanstack/react-query";

import { QueryKeys } from "~/core/api/queryKeys";
import { NodeService } from "~/core/api/services/node.service";
import { WorkflowService } from "~/core/api/services/workflow.service";

/**
 * Fetch the structure of a workflow, including its node list.
 * The query remains idle until a valid workflowId is provided.
 */
export function useWorkflow(workflowId: number | undefined | null) {
  return useQuery({
    queryKey: QueryKeys.workflow(workflowId!),
    queryFn: ({ signal }) => WorkflowService.getDetail(workflowId!, signal),
    enabled: !!workflowId,
  });
}

/**
 * Fetch the staleness report for a workflow.
 * Uses a shorter staleTime to keep the warnings fairly current.
 */
export function useStalenessReport(workflowId: number | undefined | null) {
  return useQuery({
    queryKey: QueryKeys.staleness(workflowId!),
    queryFn: ({ signal }) => WorkflowService.getStaleness(workflowId!, signal),
    enabled: !!workflowId,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch detailed information for the focused node in the workspace.
 */
export function useNodeDetail(nodeId: number | undefined | null) {
  return useQuery({
    queryKey: QueryKeys.node(nodeId!),
    queryFn: ({ signal }) => NodeService.getNode(nodeId!, signal),
    enabled: !!nodeId,
  });
}

/**
 * Fetch historical versions for a node.
 */
export function useNodeVersions(nodeId: number | undefined | null) {
  return useQuery({
    queryKey: QueryKeys.nodeVersions(nodeId!),
    queryFn: ({ signal }) => NodeService.getVersions(nodeId!, signal),
    enabled: !!nodeId,
  });
}

/**
 * Fetch detailed information for a specific version of a node.
 */
export function useVersionDetail(
  nodeId: number | undefined | null,
  versionId: number | undefined | null,
) {
  return useQuery({
    queryKey: QueryKeys.versionDetail(nodeId!, versionId!),
    queryFn: ({ signal }) =>
      NodeService.getVersionDetail(nodeId!, versionId!, signal),
    enabled: !!nodeId && !!versionId,
  });
}
