import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";

import type { NodeInstanceRead } from "~/core/domain/node.types";

const NODE_WIDTH = 250;
const NODE_HEIGHT = 60;

/**
 * Uses Dagre to calculate layout for nodes and edges.
 * This function is pure and will not mutate the provided arrays.
 */
export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 60 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

/**
 * Sorts nodes based on their order_index.
 */
export function normalizePositions(nodes: NodeInstanceRead[]) {
  return [...nodes].sort((a, b) => a.order_index - b.order_index);
}

/**
 * Builds a simple linear edge list by connecting nodes sequentially.
 * This is a fallback for when backend dependency mapping is unavailable.
 */
export const deriveLinearEdges = (nodes: NodeInstanceRead[]): Edge[] => {
  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const sourceNode = nodes[i];
    const targetNode = nodes[i + 1];
    if (sourceNode && targetNode) {
      edges.push({
        id: `e-${sourceNode.id}-${targetNode.id}`,
        source: String(sourceNode.id),
        target: String(targetNode.id),
        type: "smoothstep",
        animated:
          targetNode.status === "Executing" ||
          targetNode.status === "Awaiting HITL Approval",
      });
    }
  }
  return edges;
};
