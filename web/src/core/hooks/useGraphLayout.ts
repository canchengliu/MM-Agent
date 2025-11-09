// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import dagre from "dagre";
import { type Edge, type Node, Position } from "@xyflow/react";
import { useCallback } from "react";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 256;
const NODE_HEIGHT = 80;

/**
 * Returns a helper that applies a dagre layout to the given nodes/edges.
 */
export const useGraphLayout = () => {
  const getLayoutedElements = useCallback(
    <TNode extends Node = Node>(
      nodes: TNode[],
      edges: Edge[],
      direction: "TB" | "LR" = "TB",
    ) => {
      const isHorizontal = direction === "LR";

      dagreGraph.setGraph({
        rankdir: direction,
        ranksep: 60,
        nodesep: 40,
      });

      nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
      });
      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      dagre.layout(dagreGraph);

      const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
        node.position = {
          x: nodeWithPosition.x - NODE_WIDTH / 2,
          y: nodeWithPosition.y - NODE_HEIGHT / 2,
        };

        return node;
      });

      return { nodes: layoutedNodes, edges };
    },
    [],
  );

  return { getLayoutedElements };
};
