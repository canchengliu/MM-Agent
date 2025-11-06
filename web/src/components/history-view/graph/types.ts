// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { Node, Edge } from "@xyflow/react";

import type { HistoryNodeData } from "~/types/api/history";
import type { CompositionAnimationStage } from "~/store/uiStore";

export interface HistoryNodeLayoutTransition {
  deltaX: number;
  deltaY: number;
  token: number;
  trigger?: number | null;
}

export interface HistoryNodeVisualState {
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isDiscarded?: boolean;
  animateGrafted?: boolean;
  isSource?: boolean;
  isTarget?: boolean;
  isNewlyAdded?: boolean;
  compositionStage?: CompositionAnimationStage | null;
  layoutTransition?: HistoryNodeLayoutTransition | null;
}

export interface HistoryEdgeAnimationContext {
  edgeId: string;
  sourceId: string;
  targetId: string;
  animationToken?: number | string | null;
}

export interface HistoryEdgeVisualState {
  animateOnMount?: boolean;
  isComposedEdge?: boolean;
  isAnimating?: boolean;
  flowColor?: string;
  animationToken?: number | string | null;
  onAnimationComplete?: (context: HistoryEdgeAnimationContext) => void;
  isSplicingEdge?: boolean;
  splicingAnimationToken?: number | string | null;
}

export type HistoryNodePayload = HistoryNodeData & {
  ui?: HistoryNodeVisualState;
};

export type HistoryEdgePayload = Record<string, unknown> & HistoryEdgeVisualState;

export type HistoryNodeType = Node<HistoryNodePayload, "historyNode">;
export type HistoryEdgeType = Edge<
  HistoryEdgePayload,
  "historyEdge" | "historyDataFlowEdge" | "historySplicingEdge"
>;
