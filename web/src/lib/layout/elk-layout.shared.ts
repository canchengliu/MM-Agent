// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type {
  ElkExtendedEdge,
  ElkLayoutArguments,
  ElkNode,
  LayoutOptions,
} from "elkjs/lib/elk.bundled.js";

export interface LayoutWorkerNode {
  id: string;
  width: number;
  height: number;
  layoutOptions?: LayoutOptions;
}

export interface LayoutWorkerEdge {
  id: string;
  sources: string[];
  targets: string[];
}

export interface LayoutWorkerRequest {
  id: number;
  nodes: LayoutWorkerNode[];
  edges: LayoutWorkerEdge[];
  graphOptions?: LayoutOptions;
  layoutArguments?: ElkLayoutArguments;
}

export interface LayoutWorkerSuccess {
  id: number;
  type: "success";
  positions: Record<string, { x: number; y: number }>;
}

export interface LayoutWorkerError {
  id: number;
  type: "error";
  error: {
    message: string;
    name?: string;
    stack?: string;
  };
}

export type LayoutWorkerResponse = LayoutWorkerSuccess | LayoutWorkerError;

export const DEFAULT_GRAPH_OPTIONS: LayoutOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.layered.spacing.nodeNodeBetweenLayers": "120",
  "elk.spacing.nodeNode": "80",
  "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
  "elk.layered.crossingMinimization.hierarchyHandling": "INCLUDE_CHILDREN",
};

export function createElkGraphFromRequest(request: LayoutWorkerRequest): ElkNode {
  const graphOptions: LayoutOptions = {
    ...DEFAULT_GRAPH_OPTIONS,
    ...(request.graphOptions ?? {}),
  };

  const nodes: ElkNode["children"] = request.nodes.map((node) => ({
    id: node.id,
    width: node.width,
    height: node.height,
    layoutOptions: node.layoutOptions,
  }));

  const edges: ElkExtendedEdge[] = request.edges.map((edge) => ({
    id: edge.id,
    sources: edge.sources,
    targets: edge.targets,
  }));

  return {
    id: "root",
    children: nodes,
    edges,
    layoutOptions: graphOptions,
  };
}

