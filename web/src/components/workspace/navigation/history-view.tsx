// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeTypes,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { type MouseEvent, useCallback, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";

import { useHistoryGraph } from "~/core/api/hooks/useWorkflow";
import { useGraphLayout } from "~/core/hooks/useGraphLayout";
import { useWorkspaceStore } from "~/core/store/workspace-store";

import { HistoryGraphNode, type HistoryGraphNodeData } from "./history-graph-node";

type HistoryFlowNode = Node<HistoryGraphNodeData>;

const nodeTypes: NodeTypes = { historyNode: HistoryGraphNode };

const HistoryViewContent = () => {
  const projectId = useWorkspaceStore((state) => state.projectId);
  const activeThreadId = useWorkspaceStore((state) => state.runState?.active_thread_id);
  const selectHistoryNode = useWorkspaceStore((state) => state.selectHistoryNode);
  const selectedHistoryCheckpointId = useWorkspaceStore(
    (state) => state.selectedHistoryCheckpointId,
  );
  const selectedHistoryThreadId = useWorkspaceStore(
    (state) => state.selectedHistoryThreadId,
  );

  const {
    data: historyGraph,
    isLoading,
    error,
  } = useHistoryGraph(projectId ?? "");

  const [nodes, setNodes, onNodesChange] = useNodesState<HistoryFlowNode>([] as HistoryFlowNode[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[]);
  const { getLayoutedElements } = useGraphLayout();
  const currentThreadId = historyGraph?.thread_id ?? null;

  const preparedData = useMemo(() => {
    if (!historyGraph) {
      return { preparedNodes: [], preparedEdges: [] };
    }

    const preparedNodes = historyGraph.nodes.map<HistoryFlowNode>((node) => ({
      ...node,
      type: "historyNode",
      data: {
        ...node.data,
        isActiveBranch: historyGraph.thread_id === activeThreadId,
        threadId: historyGraph.thread_id,
      },
    }));

    const preparedEdges: Edge[] = historyGraph.edges.map((edge) => ({
      ...edge,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed },
    }));

    return { preparedNodes, preparedEdges };
  }, [historyGraph, activeThreadId]);

  useEffect(() => {
    if (preparedData.preparedNodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        preparedData.preparedNodes,
        preparedData.preparedEdges,
        "TB",
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } else {
      setNodes((): HistoryFlowNode[] => []);
      setEdges((): Edge[] => []);
    }
  }, [preparedData, getLayoutedElements, setEdges, setNodes]);

  const handleNodeClick = useCallback(
    (_event: MouseEvent, node: HistoryFlowNode) => {
      if (currentThreadId) {
        selectHistoryNode(currentThreadId, node.id);
      }
    },
    [currentThreadId, selectHistoryNode],
  );

  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        selected:
          node.id === selectedHistoryCheckpointId && currentThreadId === selectedHistoryThreadId,
      })),
    );
  }, [
    selectedHistoryCheckpointId,
    selectedHistoryThreadId,
    currentThreadId,
    setNodes,
  ]);

  if (!projectId) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        Select a project to view execution history.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !historyGraph) {
    const message =
      error && error instanceof Error
        ? error.message
        : "No execution history available for the active branch.";
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        {error ? `Error loading history graph: ${message}` : message}
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
      fitView
      proOptions={{ hideAttribution: true }}
      colorMode="system"
    >
      <Controls />
      <MiniMap
        nodeStrokeWidth={3}
        zoomable
        pannable
        className="!bg-background rounded-md border shadow-md"
      />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
};

export const HistoryView = () => {
  return (
    <div className="h-full w-full bg-background">
      <ReactFlowProvider>
        <HistoryViewContent />
      </ReactFlowProvider>
    </div>
  );
};
