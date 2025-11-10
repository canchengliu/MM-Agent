// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";

import type { NodeInstanceRead, WorkflowInstanceRead } from "~/core/domain";
import { ExecutionNode, type ExecutionNodeData } from "./ExecutionNode";
import { getLayoutedElements } from "./layout.utils";

type WorkflowNodeWithDeps = NodeInstanceRead & {
  depends_on?: number[] | null;
};

const nodeTypes = {
  executionNode: ExecutionNode,
};

interface ExecutionGraphProps {
  workflow: WorkflowInstanceRead;
}

const buildEdges = (nodes: WorkflowNodeWithDeps[]): Edge[] => {
  const edges: Edge[] = [];
  const nodesWithDependencies = nodes.filter(
    (node) => node.depends_on && node.depends_on.length > 0,
  );

  if (nodesWithDependencies.length > 0) {
    nodes.forEach((node) => {
      const dependencies = node.depends_on ?? [];
      dependencies.forEach((parentId) => {
        edges.push({
          id: `e-${parentId}-${node.id}`,
          source: String(parentId),
          target: String(node.id),
          animated: node.status === "Executing",
        });
      });
    });
    return edges;
  }

  const sorted = [...nodes].sort((a, b) => a.order_index - b.order_index);
  for (let i = 1; i < sorted.length; i++) {
    const source = sorted[i - 1];
    const target = sorted[i];
    edges.push({
      id: `e-${source.id}-${target.id}`,
      source: String(source.id),
      target: String(target.id),
      animated: target.status === "Executing",
    });
  }
  return edges;
};

/**
 * Renders the main workflow graph (Screen 1), visualizing nodes
 * and dependencies with automatic Dagre layout.
 */
export function ExecutionGraph({ workflow }: ExecutionGraphProps) {
  const { nodes, edges } = useMemo(() => {
    if (!workflow?.nodes?.length) {
      return { nodes: [], edges: [] };
    }

    const reactFlowNodes: Node<ExecutionNodeData>[] = workflow.nodes.map(
      (node) => ({
        id: String(node.id),
        type: "executionNode",
        position: { x: 0, y: 0 },
        data: { ...node, workflowId: workflow.id },
        draggable: false,
      }),
    );

    const reactFlowEdges = buildEdges(workflow.nodes as WorkflowNodeWithDeps[]);

    return getLayoutedElements(reactFlowNodes, reactFlowEdges);
  }, [workflow]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.4}
        maxZoom={1.5}
        panOnScroll
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={36} size={1} color="hsl(var(--border))" />
        <Controls position="bottom-right" />
      </ReactFlow>
    </div>
  );
}
