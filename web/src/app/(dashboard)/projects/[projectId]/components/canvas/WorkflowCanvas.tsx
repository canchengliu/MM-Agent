"use client";
import "@xyflow/react/dist/style.css";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react";
import { LayoutGroup, motion } from "motion/react";
import { useCallback, useMemo } from "react";

import { useInspectorStore } from "~/core/store/InspectorStore";
import { useWorkflowStore } from "~/core/store/WorkflowStore";
import { Transitions } from "~/styles/motion-tokens";

import { CustomNode } from "./CustomNode";
import { calculateLayout } from "./LayoutUtils";

const nodeTypes = { custom: CustomNode };

export function WorkflowCanvas() {
  const phases = useWorkflowStore((state) => state.workflow?.phases ?? []);
  const selectNode = useInspectorStore((state) => state.selectNode);

  const { nodes, edges } = useMemo(() => calculateLayout(phases), [phases]);

  const animatedNodes = useMemo(() => {
    let sequence = 0;
    return nodes.map((node) => {
      if (node.type !== "custom" || !node.data) {
        return node;
      }

      return {
        ...node,
        data: {
          ...node.data,
          animationIndex: sequence++,
        },
      };
    });
  }, [nodes]);

  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_event, node) => {
      const nodeId = Number(node.id);
      if (!Number.isNaN(nodeId)) {
        void selectNode(nodeId);
      }
    },
    [selectNode],
  );

  return (
    <LayoutGroup>
      <motion.div
        layout
        transition={{ layout: Transitions.layout }}
        className="h-full w-full rounded-2xl border border-border bg-card/80 shadow-inner"
      >
        <ReactFlow
          className="h-full"
          nodes={animatedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          panOnScroll
          zoomOnScroll
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          minZoom={0.3}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="hsl(var(--muted-foreground) / 0.35)"
          />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </motion.div>
    </LayoutGroup>
  );
}
