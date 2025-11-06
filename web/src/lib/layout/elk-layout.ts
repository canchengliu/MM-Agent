// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { LayoutOptions } from "elkjs/lib/elk.bundled.js";

import type { HistoryEdge, HistoryNode } from "~/types/api/history";

import {
  DEFAULT_GRAPH_OPTIONS,
  type LayoutWorkerRequest,
  type LayoutWorkerResponse,
  type LayoutWorkerSuccess,
  type LayoutWorkerNode,
  type LayoutWorkerEdge,
  createElkGraphFromRequest,
} from "./elk-layout.shared";

const DEFAULT_NODE_WIDTH = 260;
const DEFAULT_NODE_HEIGHT = 120;

let layoutWorker: Worker | null = null;
let requestSequence = 0;
const pendingRequests = new Map<
  number,
  {
    resolve: (response: LayoutWorkerSuccess) => void;
    reject: (error: Error) => void;
  }
>();

function hasFinitePosition(node: HistoryNode | null | undefined): boolean {
  if (!node || !node.position) {
    return false;
  }

  const { x, y } = node.position;
  return Number.isFinite(x) && Number.isFinite(y);
}

function sanitizeDimension(value: number | null | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  return fallback;
}

function hasStableNodeId(node: HistoryNode): node is HistoryNode & { id: string } {
  return typeof node?.id === "string" && node.id.length > 0;
}

function hasStableEdgeTerminals(
  edge: HistoryEdge,
): edge is HistoryEdge & { id: string; source: string; target: string } {
  return (
    typeof edge?.id === "string" &&
    typeof edge?.source === "string" &&
    typeof edge?.target === "string"
  );
}

function toWorkerNodes(nodes: HistoryNode[]): LayoutWorkerNode[] {
  return nodes.filter(hasStableNodeId).map((node) => ({
    id: node.id,
    width: sanitizeDimension(node.width, DEFAULT_NODE_WIDTH),
    height: sanitizeDimension(node.height, DEFAULT_NODE_HEIGHT),
  }));
}

function toWorkerEdges(edges: HistoryEdge[]): LayoutWorkerEdge[] {
  return edges.filter(hasStableEdgeTerminals).map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));
}

function ensureWorker(): Worker | null {
  if (layoutWorker) {
    return layoutWorker;
  }

  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return null;
  }

  layoutWorker = new Worker(new URL("./elk-layout.worker.ts", import.meta.url), {
    type: "module",
  });

  layoutWorker.addEventListener("message", handleWorkerMessage);
  layoutWorker.addEventListener("error", handleWorkerError);

  return layoutWorker;
}

function handleWorkerMessage(event: MessageEvent<LayoutWorkerResponse>) {
  const message = event.data;
  const pending = pendingRequests.get(message.id);

  if (!pending) {
    return;
  }

  pendingRequests.delete(message.id);

  if (message.type === "success") {
    pending.resolve(message);
    return;
  }

  const error = new Error(message.error?.message ?? "Layout worker failed.");
  error.name = message.error?.name ?? "LayoutWorkerError";
  if (message.error?.stack) {
    error.stack = message.error.stack;
  }
  pending.reject(error);
}

function handleWorkerError(event: ErrorEvent) {
  const error = new Error(event.message || "Layout worker runtime error.");
  error.name = "LayoutWorkerRuntimeError";

  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests.clear();

  layoutWorker?.removeEventListener("message", handleWorkerMessage);
  layoutWorker?.removeEventListener("error", handleWorkerError);
  layoutWorker?.terminate();
  layoutWorker = null;
}

async function dispatchToWorker(
  payload: Omit<LayoutWorkerRequest, "id">,
): Promise<LayoutWorkerSuccess> {
  const worker = ensureWorker();
  if (!worker) {
    return runLayoutOnMainThread(payload);
  }

  const id = ++requestSequence;
  const request: LayoutWorkerRequest = {
    id,
    nodes: payload.nodes,
    edges: payload.edges,
    graphOptions: payload.graphOptions,
    layoutArguments: payload.layoutArguments,
  };

  return new Promise<LayoutWorkerSuccess>((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    worker.postMessage(request);
  });
}

async function runLayoutOnMainThread(
  payload: Omit<LayoutWorkerRequest, "id">,
): Promise<LayoutWorkerSuccess> {
  const { default: Elk } = await import("elkjs/lib/elk.bundled.js");
  const elk = new Elk();

  const request: LayoutWorkerRequest = {
    id: -1,
    nodes: payload.nodes,
    edges: payload.edges,
    graphOptions: payload.graphOptions,
    layoutArguments: payload.layoutArguments,
  };

  const graph = createElkGraphFromRequest(request);
  const layout = await elk.layout(graph, payload.layoutArguments);

  const positions: LayoutWorkerSuccess["positions"] = {};
  layout.children?.forEach((child) => {
    if (!child?.id) {
      return;
    }
    const x = typeof child.x === "number" ? child.x : 0;
    const y = typeof child.y === "number" ? child.y : 0;
    positions[child.id] = { x, y };
  });

  return {
    id: request.id,
    type: "success",
    positions,
  };
}

function cloneNodeWithPosition(
  node: HistoryNode,
  position: { x: number; y: number } | null,
): HistoryNode {
  if (!position) {
    return { ...node };
  }

  const x = Number.isFinite(position.x) ? position.x : 0;
  const y = Number.isFinite(position.y) ? position.y : 0;

  return {
    ...node,
    position: { x, y },
  };
}

export interface HistoryGraphLayoutResult {
  nodes: HistoryNode[];
  edges: HistoryEdge[];
  applied: boolean;
}

export interface HistoryGraphLayoutRequest {
  nodes: HistoryNode[];
  edges: HistoryEdge[];
  force?: boolean;
  graphOptions?: LayoutOptions;
}

export async function layoutHistoryGraph({
  nodes,
  edges,
  force = false,
  graphOptions,
}: HistoryGraphLayoutRequest): Promise<HistoryGraphLayoutResult> {
  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const safeEdges = Array.isArray(edges) ? edges : [];

  const mustLayout = force || safeNodes.some((node) => !hasFinitePosition(node));
  if (!mustLayout || safeNodes.length === 0) {
    return {
      nodes: safeNodes.map((node) => ({ ...node })),
      edges: safeEdges,
      applied: false,
    };
  }

  const workerNodes = toWorkerNodes(safeNodes);
  if (workerNodes.length === 0) {
    return {
      nodes: safeNodes.map((node) => ({ ...node })),
      edges: safeEdges,
      applied: false,
    };
  }

  try {
    const response = await dispatchToWorker({
      nodes: workerNodes,
      edges: toWorkerEdges(safeEdges),
      graphOptions: {
        ...DEFAULT_GRAPH_OPTIONS,
        ...(graphOptions ?? {}),
      },
    });

    const mappedNodes = safeNodes.map((node) => {
      const position = response.positions[node.id ?? ""] ?? null;
      return cloneNodeWithPosition(node, position);
    });

    return {
      nodes: mappedNodes,
      edges: safeEdges,
      applied: true,
    };
  } catch (error) {
    console.error("[elk-layout] Failed to compute layout via worker.", error);
    return {
      nodes: safeNodes.map((node) => ({ ...node })),
      edges: safeEdges,
      applied: false,
    };
  }
}
