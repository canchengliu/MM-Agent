"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { Skeleton } from "~/components/ui/skeleton";
import type { NodeInstanceRead, StalenessInfo } from "~/core/domain/node.types";
import {
  useStalenessReport,
  useWorkflow,
} from "~/features/workspace/hooks/useWorkflowData";

import { ExecutionNode } from "./ExecutionNode";
import {
  deriveLinearEdges,
  getLayoutedElements,
  normalizePositions,
} from "./layout.utils";

const nodeTypes = {
  default: ExecutionNode,
};

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function stalenessReportsEqual(
  a?: Record<string, StalenessInfo[]> | null,
  b?: Record<string, StalenessInfo[]> | null,
) {
  if (a === b) return true;
  if (!a || !b) return false;

  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) return false;

  const sortInfos = (infos: StalenessInfo[]) =>
    [...infos].sort((infoA, infoB) => {
      const nodeDiff =
        Number(infoA.upstream_node_id) - Number(infoB.upstream_node_id);
      if (nodeDiff !== 0) {
        return nodeDiff;
      }
      const consumedDiff =
        infoA.consumed_version_id - infoB.consumed_version_id;
      if (consumedDiff !== 0) {
        return consumedDiff;
      }
      return (
        infoA.current_active_version_id - infoB.current_active_version_id
      );
    });

  for (let i = 0; i < aKeys.length; i += 1) {
    if (aKeys[i] !== bKeys[i]) {
      return false;
    }

    const infosA = a[aKeys[i]!] ?? [];
    const infosB = b[bKeys[i]!] ?? [];
    if (infosA.length !== infosB.length) {
      return false;
    }

    const sortedA = sortInfos(infosA);
    const sortedB = sortInfos(infosB);
    for (let j = 0; j < sortedA.length; j += 1) {
      const infoA = sortedA[j]!;
      const infoB = sortedB[j]!;
      if (
        infoA.upstream_node_id !== infoB.upstream_node_id ||
        infoA.upstream_definition_id !== infoB.upstream_definition_id ||
        infoA.consumed_version_id !== infoB.consumed_version_id ||
        infoA.current_active_version_id !== infoB.current_active_version_id
      ) {
        return false;
      }
    }
  }

  return true;
}

function InnerExecutionGraph({ workflowId }: { workflowId: number }) {
  const { data: workflow, isLoading, isError } = useWorkflow(workflowId);
  const { data: stalenessReport } = useStalenessReport(workflowId);

  const [ripplingEdges, setRipplingEdges] = useState<Set<string>>(new Set());
  const prevStalenessReport = usePrevious(stalenessReport);

  useEffect(() => {
    if (
      stalenessReport &&
      !stalenessReportsEqual(stalenessReport, prevStalenessReport)
    ) {
      const newStaleEdges = new Set<string>();
      Object.keys(stalenessReport).forEach((downstreamId) => {
        const infos = stalenessReport[downstreamId];
        if (infos) {
          infos.forEach((info) => {
            newStaleEdges.add(`e-${info.upstream_node_id}-${downstreamId}`);
          });
        }
      });

      if (newStaleEdges.size > 0) {
        setRipplingEdges(new Set(newStaleEdges));
        const timer = window.setTimeout(
          () => setRipplingEdges(new Set()),
          2500,
        );
        return () => window.clearTimeout(timer);
      }
    }
    return undefined;
  }, [stalenessReport, prevStalenessReport]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!workflow?.nodes) {
      return { nodes: [], edges: [] };
    }

    const sortedNodes = normalizePositions(workflow.nodes);
    const reactFlowNodes = sortedNodes.map((node: NodeInstanceRead) => ({
      id: String(node.id),
      position: { x: 0, y: 0 },
      data: {
        ...node,
        isStale: !!stalenessReport?.[String(node.id)],
        stalenessDetails: stalenessReport?.[String(node.id)] ?? null,
      },
      type: "default" as const,
    }));

    const reactFlowEdges = deriveLinearEdges(sortedNodes);
    reactFlowEdges.forEach((edge) => {
      if (ripplingEdges.has(edge.id)) {
        edge.className = "ripple-edge-animation";
      }
    });

    return getLayoutedElements(reactFlowNodes, reactFlowEdges);
  }, [workflow, stalenessReport, ripplingEdges]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        Error loading workflow graph.
      </div>
    );
  }

  if (!layoutedNodes.length) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No nodes available for this workflow.
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={layoutedNodes}
      edges={layoutedEdges}
      nodeTypes={nodeTypes}
      fitView
      proOptions={{ hideAttribution: true }}
      className="h-full w-full"
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}

export function ExecutionGraph({ workflowId }: { workflowId: number }) {
  return (
    <ReactFlowProvider>
      <InnerExecutionGraph workflowId={workflowId} />
    </ReactFlowProvider>
  );
}
