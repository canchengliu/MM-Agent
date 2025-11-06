import type { HistoryEdgeType, HistoryNodeType } from "~/components/history-view/graph/types";
import { GraphStateManager } from "~/core/workflow/graph-state-manager";

function createNode(partial: Partial<HistoryNodeType>): HistoryNodeType {
  const data = partial.data ?? {};

  return {
    id: partial.id ?? "node",
    position: partial.position ?? { x: 0, y: 0 },
    type: "historyNode",
    data: {
      label: data.label ?? "Node",
      step_index: data.step_index ?? 0,
      timestamp:
        data.timestamp ?? new Date("2025-01-01T00:00:00.000Z").toISOString(),
      provenance_status: data.provenance_status ?? "QUEUED",
      executed_nodes: data.executed_nodes ?? [],
      source_checkpoint_id:
        data.source_checkpoint_id === undefined
          ? null
          : data.source_checkpoint_id,
      creation_method: data.creation_method,
      runtime_status: data.runtime_status ?? "QUEUED",
      status: data.status ?? "QUEUED",
      thread_id: data.thread_id ?? "thread-1",
      raw_metadata: data.raw_metadata ?? null,
    },
    dragging: false,
    selected: false,
    positionAbsolute: partial.positionAbsolute ?? { x: 0, y: 0 },
    width: partial.width,
    height: partial.height,
    style: partial.style,
    className: partial.className,
    hidden: partial.hidden,
    parentId: partial.parentId,
    targetPosition: partial.targetPosition,
    sourcePosition: partial.sourcePosition,
    extent: partial.extent,
    expandParent: partial.expandParent,
    deletable: partial.deletable,
    connectable: partial.connectable,
    dragHandle: partial.dragHandle,
    dragHandlePosition: partial.dragHandlePosition,
    focusable: partial.focusable,
    ariaLabel: partial.ariaLabel,
  };
}

function createEdge(partial: Partial<HistoryEdgeType>): HistoryEdgeType {
  return {
    id: partial.id ?? "edge",
    source: partial.source ?? "source",
    target: partial.target ?? "target",
    type: partial.type ?? "historyEdge",
    animated: partial.animated ?? false,
    selectable: partial.selectable ?? false,
    markerEnd: partial.markerEnd,
    markerStart: partial.markerStart,
    data: partial.data,
    className: partial.className,
    hidden: partial.hidden,
    style: partial.style,
    sourceHandle: partial.sourceHandle,
    targetHandle: partial.targetHandle,
    zIndex: partial.zIndex,
  };
}

describe("GraphStateManager", () => {
  const nodeA = createNode({
    id: "A",
    data: {
      label: "Node A",
      step_index: 1,
      provenance_status: "QUEUED",
      runtime_status: "QUEUED",
      thread_id: "thread-1",
      raw_metadata: {
        workflow_stage: "Stage 1",
      },
    },
  });

  const nodeB = createNode({
    id: "B",
    data: {
      label: "Node B",
      step_index: 2,
      provenance_status: "QUEUED",
      runtime_status: "QUEUED",
      thread_id: "thread-1",
      raw_metadata: {
        workflow_stage: "Stage 2",
      },
    },
  });

  const edgeAB = createEdge({
    id: "edge-AB",
    source: "A",
    target: "B",
    type: "historyDataFlowEdge",
  });

  it("updates node status transitions", () => {
    const manager = new GraphStateManager();
    manager.setGraph([nodeA, nodeB], [edgeAB]);

    expect(manager.markNodeRunning("A")).toBe(true);
    expect(manager.getNode("A")?.data?.runtime_status).toBe("RUNNING");

    expect(manager.markNodeCompleted("A")).toBe(true);
    const completed = manager.getNode("A");
    expect(completed?.data?.runtime_status).toBe("COMPLETED");
    expect(manager.isNodeCompleted("A")).toBe(true);
  });

  it("triggers data flow animations and clears them on completion", () => {
    const manager = new GraphStateManager();
    manager.setGraph([nodeA, nodeB], [edgeAB]);

    const triggered = manager.triggerDataFlow("A", "B");
    expect(triggered).toBe(true);

    let snapshot = manager.snapshot();
    const edge = snapshot.edges.find((item) => item.id === "edge-AB");
    expect(edge?.data?.isAnimating).toBe(true);
    expect(edge?.data?.flowColor).toBe("var(--color-stage-2)");
    expect(typeof edge?.data?.onAnimationComplete).toBe("function");

    edge?.data?.onAnimationComplete?.({
      edgeId: "edge-AB",
      sourceId: "A",
      targetId: "B",
      animationToken: edge.data?.animationToken ?? null,
    });

    snapshot = manager.snapshot();
    const resetEdge = snapshot.edges.find((item) => item.id === "edge-AB");
    expect(resetEdge?.data?.isAnimating).toBe(false);
    expect(resetEdge?.data?.onAnimationComplete).toBeUndefined();
  });
});

