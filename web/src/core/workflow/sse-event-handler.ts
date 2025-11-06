// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { GraphStateManager } from "./graph-state-manager";

type ConsoleLogger = Pick<Console, "debug" | "warn" | "error">;

interface BaseBroadcastEvent {
  event_type: string;
  timestamp?: string;
  project_id?: string;
  thread_id?: string | null;
  payload?: Record<string, unknown> | null;
}

type NodeEventPayload = Record<string, unknown> & {
  node?: string;
  status?: string;
  inputs?: Record<string, unknown> | null;
  outputs?: Record<string, unknown> | null;
  previous_node?: string;
  source_node?: string;
  parent_node?: string;
  upstream_node?: string;
  next_nodes?: unknown;
};

interface NodeStartEvent extends BaseBroadcastEvent {
  event_type: "NODE_START";
  payload?: NodeEventPayload | null;
}

interface NodeEndEvent extends BaseBroadcastEvent {
  event_type: "NODE_END";
  payload?: NodeEventPayload | null;
}

type BroadcastEvent = NodeStartEvent | NodeEndEvent | BaseBroadcastEvent;

export interface SSEEventHandlerOptions {
  graph: GraphStateManager;
  logger?: ConsoleLogger;
}

export class SSEEventHandler {
  private readonly graph: GraphStateManager;
  private readonly logger?: ConsoleLogger;

  private lastCompletedByThread = new Map<string, string>();
  private lastRunningByThread = new Map<string, string>();

  constructor(options: SSEEventHandlerOptions) {
    this.graph = options.graph;
    this.logger = options.logger;
  }

  public reset(): void {
    this.lastCompletedByThread = new Map();
    this.lastRunningByThread = new Map();
  }

  public handle(event: BroadcastEvent | null | undefined): void {
    if (!event) {
      return;
    }

    switch (event.event_type) {
      case "NODE_START":
        this.handleNodeStart(event as NodeStartEvent);
        break;
      case "NODE_END":
        this.handleNodeEnd(event as NodeEndEvent);
        break;
      default:
        break;
    }
  }

  private handleNodeStart(event: NodeStartEvent): void {
    const nodeId = event.payload?.node?.trim();
    if (!nodeId) {
      this.logger?.warn?.("[SSEEventHandler] NODE_START missing node identifier.");
      return;
    }

    const threadId = this.resolveThreadId(event.thread_id, nodeId);
    const sourceFromPayload = this.extractSourceNode(event.payload);

    let sourceNodeId: string | null = sourceFromPayload;

    if (!sourceNodeId && threadId) {
      sourceNodeId = this.lastCompletedByThread.get(threadId) ?? null;
    }

    sourceNodeId ??= this.findLikelyPredecessor(nodeId, threadId);

    if (sourceNodeId) {
      const triggered = this.graph.triggerDataFlow(sourceNodeId, nodeId);
      if (!triggered) {
        this.logger?.debug?.(
          `[SSEEventHandler] Unable to trigger data flow for edge ${sourceNodeId} -> ${nodeId}.`,
        );
      }
    }

    const updated = this.graph.markNodeRunning(nodeId);
    if (!updated) {
      this.logger?.warn?.(
        `[SSEEventHandler] Failed to mark node ${nodeId} as running; node not found in graph.`,
      );
    }

    if (threadId) {
      this.lastRunningByThread.set(threadId, nodeId);
    }
  }

  private handleNodeEnd(event: NodeEndEvent): void {
    const nodeId = event.payload?.node?.trim();
    if (!nodeId) {
      this.logger?.warn?.("[SSEEventHandler] NODE_END missing node identifier.");
      return;
    }

    const threadId = this.resolveThreadId(event.thread_id, nodeId);

    const updated = this.graph.markNodeCompleted(nodeId);
    if (!updated) {
      this.logger?.warn?.(
        `[SSEEventHandler] Failed to mark node ${nodeId} as completed; node not found in graph.`,
      );
    }

    if (threadId) {
      this.lastCompletedByThread.set(threadId, nodeId);
      this.lastRunningByThread.delete(threadId);
    }

    const nextNodes = this.extractNextNodes(event.payload);
    if (nextNodes.length > 0) {
      nextNodes.forEach((targetId) => {
        const triggered = this.graph.triggerDataFlow(nodeId, targetId);
        if (!triggered) {
          this.logger?.debug?.(
            `[SSEEventHandler] Unable to trigger data flow for edge ${nodeId} -> ${targetId} from NODE_END payload.`,
          );
        }
      });
    }
  }

  private resolveThreadId(initial: string | null | undefined, nodeId: string): string | null {
    if (typeof initial === "string" && initial.trim().length > 0) {
      return initial.trim();
    }

    return this.graph.resolveThreadId(nodeId);
  }

  private extractSourceNode(payload: NodeEventPayload | null | undefined): string | null {
    if (!payload) {
      return null;
    }

    const candidates = [
      payload.previous_node,
      payload.source_node,
      payload.parent_node,
      payload.upstream_node,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }

    return null;
  }

  private extractNextNodes(payload: NodeEventPayload | null | undefined): string[] {
    if (!payload) {
      return [];
    }

    const raw = payload.next_nodes;
    if (!raw) {
      return [];
    }

    if (Array.isArray(raw)) {
      return raw
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value.length > 0);
    }

    if (typeof raw === "string" && raw.trim().length > 0) {
      return [raw.trim()];
    }

    return [];
  }

  private findLikelyPredecessor(nodeId: string, threadId: string | null): string | null {
    const incoming = this.graph.getIncomingEdges(nodeId);
    if (incoming.length === 0) {
      return null;
    }

    const candidates = incoming.filter((edge) => {
      if (!this.graph.isNodeCompleted(edge.source)) {
        return false;
      }

      if (!threadId) {
        return true;
      }

      const sourceThread = this.graph.resolveThreadId(edge.source);
      return !sourceThread || sourceThread === threadId;
    });

    if (candidates.length === 1) {
      return candidates[0]?.source ?? null;
    }

    if (candidates.length > 1) {
      // Prefer the candidate that matches the last completed node for the thread, if available.
      if (threadId) {
        const lastCompleted = this.lastCompletedByThread.get(threadId);
        if (lastCompleted) {
          const match = candidates.find((edge) => edge.source === lastCompleted);
          if (match) {
            return match.source;
          }
        }
      }

      return candidates[0]?.source ?? null;
    }

    return null;
  }
}
