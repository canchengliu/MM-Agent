// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type {
  HistoryEdgeAnimationContext,
  HistoryEdgePayload,
  HistoryEdgeType,
  HistoryNodePayload,
  HistoryNodeType,
} from "~/components/history-view/graph/types";

type GraphStateListener = (snapshot: GraphStateSnapshot) => void;

export interface GraphStateSnapshot {
  nodes: HistoryNodeType[];
  edges: HistoryEdgeType[];
}

export interface GraphStateManagerOptions {
  onChange?: GraphStateListener;
  logger?: Pick<Console, "debug" | "warn" | "error">;
}

const DEFAULT_FLOW_COLOR = "var(--color-stage-1)";

export class GraphStateManager {
  private readonly logger?: Pick<Console, "debug" | "warn" | "error">;

  private nodeOrder: string[] = [];
  private edgeOrder: string[] = [];

  private nodes = new Map<string, HistoryNodeType>();
  private edges = new Map<string, HistoryEdgeType>();

  private listeners = new Set<GraphStateListener>();

  private outgoingEdgeMap = new Map<string, Set<string>>();
  private incomingEdgeMap = new Map<string, Set<string>>();

  private edgeAnimationTokens = new Map<string, number>();

  constructor(options: GraphStateManagerOptions = {}) {
    this.logger = options.logger;

    if (options.onChange) {
      this.listeners.add(options.onChange);
    }
  }

  public setGraph(nodes: HistoryNodeType[], edges: HistoryEdgeType[]): void {
    this.nodes = new Map();
    this.edges = new Map();
    this.nodeOrder = [];
    this.edgeOrder = [];
    this.outgoingEdgeMap = new Map();
    this.incomingEdgeMap = new Map();
    this.edgeAnimationTokens = new Map();

    nodes.forEach((node) => {
      const clone = this.cloneNode(node);
      this.nodes.set(clone.id, clone);
      this.nodeOrder.push(clone.id);
    });

    edges.forEach((edge) => {
      const clone = this.cloneEdge(edge);
      this.edges.set(clone.id, clone);
      this.edgeOrder.push(clone.id);

      this.registerEdge(clone);
    });

    this.notify();
  }

  public subscribe(listener: GraphStateListener, emitCurrent = true): () => void {
    this.listeners.add(listener);
    if (emitCurrent) {
      listener(this.snapshot());
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  public snapshot(): GraphStateSnapshot {
    return {
      nodes: this.nodeOrder
        .map((id) => this.nodes.get(id))
        .filter((node): node is HistoryNodeType => Boolean(node))
        .map((node) => this.cloneNode(node)),
      edges: this.edgeOrder
        .map((id) => this.edges.get(id))
        .filter((edge): edge is HistoryEdgeType => Boolean(edge))
        .map((edge) => this.cloneEdge(edge)),
    };
  }

  public getNode(nodeId: string): HistoryNodeType | null {
    const node = this.nodes.get(nodeId);
    return node ? this.cloneNode(node) : null;
  }

  public getIncomingEdges(nodeId: string): HistoryEdgeType[] {
    const edgeIds = this.incomingEdgeMap.get(nodeId);
    if (!edgeIds || edgeIds.size === 0) {
      return [];
    }

    return Array.from(edgeIds)
      .map((edgeId) => this.edges.get(edgeId))
      .filter((edge): edge is HistoryEdgeType => Boolean(edge))
      .map((edge) => this.cloneEdge(edge));
  }

  public getOutgoingEdges(nodeId: string): HistoryEdgeType[] {
    const edgeIds = this.outgoingEdgeMap.get(nodeId);
    if (!edgeIds || edgeIds.size === 0) {
      return [];
    }

    return Array.from(edgeIds)
      .map((edgeId) => this.edges.get(edgeId))
      .filter((edge): edge is HistoryEdgeType => Boolean(edge))
      .map((edge) => this.cloneEdge(edge));
  }

  public markNodeQueued(nodeId: string): boolean {
    return this.updateNodeStatus(nodeId, {
      runtime_status: "IDLE",
      provenance_status: "QUEUED",
    });
  }

  public markNodeRunning(nodeId: string): boolean {
    return this.updateNodeStatus(nodeId, {
      runtime_status: "RUNNING",
      provenance_status: "RESUMED",
    });
  }

  public markNodeCompleted(nodeId: string): boolean {
    return this.updateNodeStatus(nodeId, {
      runtime_status: "COMPLETED",
      provenance_status: "EXECUTED",
    });
  }

  public markNodeFailed(nodeId: string): boolean {
    return this.updateNodeStatus(nodeId, {
      runtime_status: "ERROR",
      provenance_status: "ERROR",
    });
  }

  public triggerDataFlow(
    sourceId: string,
    targetId: string,
    options: { flowColor?: string | null } = {},
  ): boolean {
    const outgoingEdgeIds = this.outgoingEdgeMap.get(sourceId);
    if (!outgoingEdgeIds || outgoingEdgeIds.size === 0) {
      this.logger?.debug?.(
        `[GraphStateManager] No outgoing edges found when triggering data flow (source=${sourceId}, target=${targetId}).`,
      );
      return false;
    }

    const targetEdges = Array.from(outgoingEdgeIds)
      .map((edgeId) => this.edges.get(edgeId))
      .filter((edge): edge is HistoryEdgeType => Boolean(edge))
      .filter((edge) => edge.target === targetId);

    if (targetEdges.length === 0) {
      this.logger?.debug?.(
        `[GraphStateManager] No edges connect source ${sourceId} to target ${targetId}.`,
      );
      return false;
    }

    const flowColor =
      options.flowColor ?? this.resolveStageColor(targetId) ?? DEFAULT_FLOW_COLOR;

    let updated = false;

    targetEdges.forEach((edge) => {
      const nextEdge = this.cloneEdge(edge);
      const nextData = this.cloneEdgeData(nextEdge.data);

      const nextToken = (this.edgeAnimationTokens.get(edge.id) ?? 0) + 1;
      this.edgeAnimationTokens.set(edge.id, nextToken);

      nextData.isAnimating = true;
      nextData.flowColor = flowColor;
      nextData.animationToken = nextToken;
      nextData.onAnimationComplete = (context: HistoryEdgeAnimationContext) => {
        const tokenFromContext = context.animationToken ?? nextToken;
        this.handleEdgeAnimationComplete(edge.id, tokenFromContext);
      };

      nextEdge.data = nextData;
      this.edges.set(edge.id, nextEdge);
      updated = true;
    });

    if (updated) {
      this.notify();
    }

    return updated;
  }

  public resolveThreadId(nodeId: string): string | null {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return null;
    }

    const directThread = node.data?.thread_id;
    if (typeof directThread === "string" && directThread.trim().length > 0) {
      return directThread;
    }

    const rawMetadata = node.data?.raw_metadata;
    if (this.isRecord(rawMetadata)) {
      const candidates = ["thread_id", "threadId", "thread"] as const;
      for (const key of candidates) {
        const value = rawMetadata[key];
        if (typeof value === "string" && value.trim().length > 0) {
          return value.trim();
        }
      }
    }

    return null;
  }

  public isNodeCompleted(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return false;
    }

    const runtimeStatus = node.data?.runtime_status ?? node.data?.status ?? null;
    const provenanceStatus = node.data?.provenance_status ?? null;
    const normalizedRuntime = typeof runtimeStatus === "string"
      ? runtimeStatus.toUpperCase()
      : null;
    const normalizedProvenance = typeof provenanceStatus === "string"
      ? provenanceStatus.toUpperCase()
      : null;

    if (normalizedRuntime === "COMPLETED" || normalizedRuntime === "SUCCESS") {
      return true;
    }

    return normalizedProvenance === "EXECUTED" || normalizedProvenance === "GRAFTED";
  }

  private handleEdgeAnimationComplete(edgeId: string, token: number | string | null): void {
    const expectedToken = this.edgeAnimationTokens.get(edgeId);

    if (expectedToken !== undefined && token !== null && expectedToken !== token) {
      // Stale animation completion; ignore.
      return;
    }

    const edge = this.edges.get(edgeId);
    if (!edge) {
      return;
    }

    const nextEdge = this.cloneEdge(edge);
    const nextData = this.cloneEdgeData(nextEdge.data);

    if (nextData.isAnimating !== true) {
      return;
    }

    nextData.isAnimating = false;
    nextData.animationToken = null;
    nextData.onAnimationComplete = undefined;

    nextEdge.data = nextData;
    this.edges.set(edgeId, nextEdge);
    this.edgeAnimationTokens.delete(edgeId);

    this.notify();
  }

  private updateNodeStatus(
    nodeId: string,
    payload: Pick<HistoryNodePayload, "runtime_status" | "provenance_status">,
  ): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      this.logger?.warn?.(`[GraphStateManager] Unable to update unknown node: ${nodeId}`);
      return false;
    }

    const nextNode = this.cloneNode(node);
    const nextData: HistoryNodePayload = {
      ...(nextNode.data ?? {}),
      runtime_status: payload.runtime_status ?? nextNode.data?.runtime_status,
      status: payload.runtime_status ?? nextNode.data?.status,
      provenance_status:
        payload.provenance_status ?? nextNode.data?.provenance_status,
    };

    nextNode.data = nextData;
    this.nodes.set(nodeId, nextNode);

    this.notify();
    return true;
  }

  private resolveStageColor(nodeId: string): string | null {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return null;
    }

    const data = node.data;
    if (!data) {
      return null;
    }

    const rawMetadata = data.raw_metadata;
    if (this.isRecord(rawMetadata)) {
      const explicit = this.readStringProperty(rawMetadata, [
        "stage_color",
        "stageColor",
        "stageColour",
      ]);
      if (explicit) {
        return explicit;
      }

      const identifier = this.readStringProperty(rawMetadata, [
        "workflow_stage",
        "workflowStage",
        "stage",
        "stage_id",
        "stageId",
        "phase",
        "phase_id",
        "phaseId",
      ]);

      const token = identifier ? this.resolveColorToken(identifier) : null;
      if (token) {
        return token;
      }
    }

    const topLevelStage = this.readStringProperty(data, [
      "workflow_stage",
      "workflowStage",
      "stage",
      "stage_id",
      "stageId",
      "phase",
      "phase_id",
      "phaseId",
    ]);

    if (topLevelStage) {
      const token = this.resolveColorToken(topLevelStage);
      if (token) {
        return token;
      }
    }

    return null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  private resolveColorToken(value: string): string | null {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    if (
      normalized.includes("3") ||
      normalized.includes("three") ||
      normalized.includes("final") ||
      normalized.includes("synthesis") ||
      normalized.includes("stage_c") ||
      normalized.includes("phase_c")
    ) {
      return "var(--color-stage-3)";
    }

    if (
      normalized.includes("2") ||
      normalized.includes("two") ||
      normalized.includes("middle") ||
      normalized.includes("model") ||
      normalized.includes("loop") ||
      normalized.includes("execution") ||
      normalized.includes("stage_b") ||
      normalized.includes("phase_b")
    ) {
      return "var(--color-stage-2)";
    }

    if (
      normalized.includes("1") ||
      normalized.includes("one") ||
      normalized.includes("analysis") ||
      normalized.includes("explore") ||
      normalized.includes("initial") ||
      normalized.includes("stage_a") ||
      normalized.includes("phase_a")
    ) {
      return "var(--color-stage-1)";
    }

    return null;
  }

  private readStringProperty(
    source: Record<string, unknown>,
    keys: readonly string[],
  ): string | null {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
    }

    return null;
  }

  private cloneNode(node: HistoryNodeType): HistoryNodeType {
    return {
      ...node,
      data: node.data
        ? {
            ...node.data,
            ui: node.data.ui ? { ...node.data.ui } : undefined,
          }
        : node.data,
    };
  }

  private cloneEdge(edge: HistoryEdgeType): HistoryEdgeType {
    return {
      ...edge,
      data: this.cloneEdgeData(edge.data),
    };
  }

  private cloneEdgeData(data: HistoryEdgePayload | undefined): HistoryEdgePayload {
    return data ? { ...data } : {};
  }

  private registerEdge(edge: HistoryEdgeType): void {
    if (!this.outgoingEdgeMap.has(edge.source)) {
      this.outgoingEdgeMap.set(edge.source, new Set());
    }
    this.outgoingEdgeMap.get(edge.source)!.add(edge.id);

    if (!this.incomingEdgeMap.has(edge.target)) {
      this.incomingEdgeMap.set(edge.target, new Set());
    }
    this.incomingEdgeMap.get(edge.target)!.add(edge.id);
  }

  private notify(): void {
    if (this.listeners.size === 0) {
      return;
    }

    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        this.logger?.error?.("[GraphStateManager] Listener error", error);
      }
    });
  }
}
