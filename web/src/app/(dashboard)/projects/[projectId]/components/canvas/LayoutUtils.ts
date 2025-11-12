import { MarkerType, type Edge, type Node } from "@xyflow/react";

import type { NodeInstanceRead, PhaseRead } from "~/core/api/types";

export interface WorkflowNodeData extends NodeInstanceRead, Record<string, unknown> {
  phaseName: string;
  animationIndex?: number;
}

interface StageNodeData extends Record<string, unknown> {
  stageId: string;
  stageName: string;
  phaseName: string;
}

type CanvasNodeData = WorkflowNodeData | StageNodeData;

export type WorkflowCanvasNode = Node<CanvasNodeData>;

export interface LayoutResult {
  nodes: WorkflowCanvasNode[];
  edges: Edge[];
}

const CANVAS_PADDING = 64;
const COLUMN_GAP = 160;
const STAGE_WIDTH = 320;
const STAGE_PADDING = 24;
const STAGE_GAP_Y = 64;
const NODE_HEIGHT = 140;
const NODE_GAP_Y = 24;
const EMPTY_STAGE_HEIGHT = 96;

const getStageHeight = (nodeCount: number) => {
  if (nodeCount === 0) {
    return STAGE_PADDING * 2 + EMPTY_STAGE_HEIGHT;
  }
  return (
    STAGE_PADDING * 2 + nodeCount * NODE_HEIGHT + Math.max(0, nodeCount - 1) * NODE_GAP_Y
  );
};

const createStageNode = (
  id: string,
  x: number,
  y: number,
  nodeCount: number,
  phaseName: string,
  stageName: string,
): WorkflowCanvasNode => {
  return {
    id,
    type: "group" as const,
    position: { x, y },
    data: {
      stageId: id,
      stageName,
      phaseName,
    },
    style: {
      width: STAGE_WIDTH,
      height: getStageHeight(nodeCount),
      padding: STAGE_PADDING,
      borderRadius: 24,
      border: "1px solid hsl(var(--border))",
      background: "hsl(var(--background))",
      boxShadow: "0 15px 45px rgba(15, 23, 42, 0.08)",
    },
    draggable: false,
    selectable: false,
  };
};

const createNode = (
  node: NodeInstanceRead,
  parentId: string,
  yOffset: number,
  phaseName: string,
): WorkflowCanvasNode => {
  return {
    id: node.id.toString(),
    type: "custom",
    data: {
      ...node,
      phaseName,
    },
    position: {
      x: STAGE_PADDING,
      y: STAGE_PADDING + yOffset,
    },
    parentId,
    extent: "parent",
    draggable: false,
  };
};

export const calculateLayout = (phases: PhaseRead[]): LayoutResult => {
  if (!phases || phases.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes: WorkflowCanvasNode[] = [];
  const edges: Edge[] = [];

  let previousNodeId: string | null = null;

  phases.forEach((phase, phaseIndex) => {
    const columnX = CANVAS_PADDING + phaseIndex * (STAGE_WIDTH + COLUMN_GAP);
    let stageCursorY = CANVAS_PADDING;

    phase.stages.forEach((stage, stageIndex) => {
      const stageNodeId = `phase-${phaseIndex}-stage-${stage.id ?? stageIndex}`;

      nodes.push(
        createStageNode(
          stageNodeId,
          columnX,
          stageCursorY,
          stage.nodes.length,
          phase.name,
          stage.name,
        ),
      );

      stage.nodes.forEach((node, nodeIndex) => {
        const verticalOffset = nodeIndex * (NODE_HEIGHT + NODE_GAP_Y);
        const rfNode = createNode(node, stageNodeId, verticalOffset, phase.name);
        nodes.push(rfNode);

        if (previousNodeId) {
          edges.push({
            id: `edge-${previousNodeId}-${rfNode.id}`,
            source: previousNodeId,
            target: rfNode.id,
            type: "smoothstep",
            animated: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        }

        previousNodeId = rfNode.id;
      });

      stageCursorY += getStageHeight(stage.nodes.length) + STAGE_GAP_Y;
    });
  });

  return { nodes, edges };
};
