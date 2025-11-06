import type { HistoryEdgeType, HistoryNodeType } from "~/components/history-view/graph/types";
import { GraphStateManager } from "~/core/workflow/graph-state-manager";
import { SSEEventHandler } from "~/core/workflow/sse-event-handler";

function makeNode(id: string, overrides: Partial<HistoryNodeType["data"]> = {}): HistoryNodeType {
  return {
    id,
    position: { x: 0, y: 0 },
    type: "historyNode",
    data: {
      label: overrides.label ?? id,
      step_index: overrides.step_index ?? (id === "Start" ? 1 : 2),
      timestamp: overrides.timestamp ?? new Date("2025-01-01T00:00:00.000Z").toISOString(),
      provenance_status: overrides.provenance_status ?? "QUEUED",
      runtime_status: overrides.runtime_status ?? "QUEUED",
      status: overrides.status ?? "QUEUED",
      source_checkpoint_id: overrides.source_checkpoint_id ?? null,
      executed_nodes: overrides.executed_nodes ?? [],
      thread_id: overrides.thread_id ?? "thread-alpha",
      raw_metadata: overrides.raw_metadata ?? null,
    },
  };
}

function makeEdge(source: string, target: string): HistoryEdgeType {
  return {
    id: `${source}-${target}`,
    source,
    target,
    type: "historyDataFlowEdge",
    animated: false,
    selectable: false,
  };
}

describe("SSEEventHandler", () => {
  const nodeStart = makeNode("Start", {
    raw_metadata: { workflow_stage: "Stage 1" },
  });
  const nodeNext = makeNode("Next", {
    raw_metadata: { workflow_stage: "Stage 2" },
  });
  const edge = makeEdge("Start", "Next");

  function setup() {
    const manager = new GraphStateManager();
    manager.setGraph([nodeStart, nodeNext], [edge]);
    const handler = new SSEEventHandler({ graph: manager });
    return { manager, handler };
  }

  it("marks nodes and triggers data flow based on SSE events", () => {
    const { manager, handler } = setup();

    handler.handle({
      event_type: "NODE_END",
      thread_id: "thread-alpha",
      payload: { node: "Start" },
    });

    expect(manager.getNode("Start")?.data?.runtime_status).toBe("COMPLETED");

    handler.handle({
      event_type: "NODE_START",
      thread_id: "thread-alpha",
      payload: { node: "Next" },
    });

    const nextNode = manager.getNode("Next");
    expect(nextNode?.data?.runtime_status).toBe("RUNNING");

    const snapshot = manager.snapshot();
    const animatedEdge = snapshot.edges.find((item) => item.id === "Start-Next");
    expect(animatedEdge?.data?.isAnimating).toBe(true);

    animatedEdge?.data?.onAnimationComplete?.({
      edgeId: "Start-Next",
      sourceId: "Start",
      targetId: "Next",
      animationToken: animatedEdge.data?.animationToken ?? null,
    });

    const resolvedEdge = manager.snapshot().edges.find((item) => item.id === "Start-Next");
    expect(resolvedEdge?.data?.isAnimating).toBe(false);
  });

  it("infers thread identifiers when SSE payload omits them", () => {
    const { manager, handler } = setup();

    handler.handle({ event_type: "NODE_END", payload: { node: "Start" } });
    handler.handle({ event_type: "NODE_START", payload: { node: "Next" } });

    const nextNode = manager.getNode("Next");
    expect(nextNode?.data?.runtime_status).toBe("RUNNING");
  });
});

