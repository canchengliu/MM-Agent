// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { Edge, Node } from "@xyflow/react";
import dagre from "dagre";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 260;
const NODE_HEIGHT = 140;

export interface LayoutOptions {
  rankdir?: "TB" | "BT" | "LR" | "RL";
}

/**
 * Applies Dagre layouting to the provided nodes and edges.
 */
export function getLayoutedElements<T extends Node>(
  nodes: T[],
  edges: Edge[],
  options: LayoutOptions = {},
) {
  dagreGraph.setGraph({
    rankdir: options.rankdir ?? "LR",
    nodesep: 80,
    ranksep: 120,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: x - NODE_WIDTH / 2,
        y: y - NODE_HEIGHT / 2,
      },
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
