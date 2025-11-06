// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { resolveServiceURL } from "~/core/api/resolve-service-url";
import { layoutHistoryGraph } from "~/lib/layout/elk-layout";
import { usePrefersReducedMotion } from "~/lib/a11y/motion-preferences";
import type { ExecutionHistoryGraphResponse, HistoryNode } from "~/types/api/history";
import type { CompositionAnimationStage } from "~/store/uiStore";
import { useUiStore } from "~/store/uiStore";
import { FlickeringGrid } from "~/components/magicui/flickering-grid";

import { SplicingConfirmationDialog } from "../dialogs/SplicingConfirmationDialog";
import { AnimatedDataFlowEdge } from "./AnimatedDataFlowEdge";
import { CustomEdge } from "./CustomEdge";
import { CustomNode } from "./CustomNode";
import { SplicingEdge } from "./SplicingEdge";
import type {
  HistoryEdgePayload,
  HistoryEdgeType,
  HistoryEdgeVisualState,
  HistoryNodeLayoutTransition,
  HistoryNodePayload,
  HistoryNodeType,
  HistoryNodeVisualState,
} from "./types";

interface HistoryGraphProps extends PropsWithChildren {
  projectId?: string | null;
}

interface CompositionDiff {
  newNodes: string[];
  newEdges: string[];
  graftedNodes: string[];
}

const nodeTypes = {
  historyNode: CustomNode,
};

const edgeTypes = {
  historyEdge: CustomEdge,
  historyDataFlowEdge: AnimatedDataFlowEdge,
  historySplicingEdge: SplicingEdge,
};

const proOptions = { hideAttribution: true };

const STAGE_COLOR_BY_TOKEN = {
  "1": "var(--color-stage-1)",
  "2": "var(--color-stage-2)",
  "3": "var(--color-stage-3)",
} as const;

const STAGE_COLOR_KEYS = ["stage_color", "stageColor", "stageColour"] as const;
const STAGE_IDENTIFIER_KEYS = [
  "workflow_stage",
  "workflowStage",
  "stage",
  "stage_id",
  "stageId",
  "phase",
  "phase_id",
  "phaseId",
] as const;

const EDGE_KIND_DATA_FLOW = "DATA_FLOW";

function readStringProperty(
  source: Record<string, unknown> | null | undefined,
  keys: readonly string[],
): string | null {
  if (!source) {
    return null;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function resolveStageTokenFromString(
  value: string,
): keyof typeof STAGE_COLOR_BY_TOKEN | null {
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
    return "3";
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
    return "2";
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
    return "1";
  }

  return null;
}

function resolveNodeStageColor(data: HistoryNodePayload | undefined): string | null {
  if (!data) {
    return null;
  }

  const raw = (data.raw_metadata ?? null) as Record<string, unknown> | null;

  const explicitColor = readStringProperty(raw, STAGE_COLOR_KEYS);
  if (explicitColor) {
    return explicitColor;
  }

  const rawStage = readStringProperty(raw, STAGE_IDENTIFIER_KEYS);
  const tokenFromRaw = rawStage ? resolveStageTokenFromString(rawStage) : null;
  if (tokenFromRaw) {
    return STAGE_COLOR_BY_TOKEN[tokenFromRaw];
  }

  const topLevelStage = readStringProperty(
    data as Record<string, unknown>,
    STAGE_IDENTIFIER_KEYS,
  );
  const tokenFromTopLevel = topLevelStage
    ? resolveStageTokenFromString(topLevelStage)
    : null;

  if (tokenFromTopLevel) {
    return STAGE_COLOR_BY_TOKEN[tokenFromTopLevel];
  }

  return null;
}

function resolveEdgeShouldAnimate(data: Record<string, unknown> | undefined): boolean {
  if (!data) {
    return false;
  }

  if (data.isAnimating === true) {
    return true;
  }

  const kind =
    typeof data.kind === "string" ? data.kind.trim().toUpperCase() : undefined;
  if (kind === EDGE_KIND_DATA_FLOW) {
    return true;
  }

  const animation = data.animation;
  if (animation && typeof animation === "object") {
    const animationRecord = animation as Record<string, unknown>;
    if (
      animationRecord.active === true ||
      animationRecord.enabled === true ||
      animationRecord.isActive === true
    ) {
      return true;
    }
  }

  return false;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function resolveDiscardedNodeIds(args: {
  nodes: HistoryNodeType[];
  source?: { threadId: string; stepIndex: number } | null;
  newNodeIds: string[];
}): string[] {
  const { nodes, source, newNodeIds } = args;
  if (!source) {
    return [];
  }

  const newNodeSet = new Set(newNodeIds);

  return nodes
    .filter((node) => {
      if (!node?.data) {
        return false;
      }

      if (!node.data.thread_id || node.data.thread_id !== source.threadId) {
        return false;
      }

      const stepIndex = node.data.step_index;
      if (!Number.isFinite(stepIndex)) {
        return false;
      }

      if (stepIndex <= source.stepIndex) {
        return false;
      }

      if (newNodeSet.has(node.id)) {
        return false;
      }

      return true;
    })
    .map((node) => node.id);
}

function resolveSplicingEdge(args: {
  edges: HistoryEdgeType[];
  newEdgeIds: string[];
  sourceId: string | null;
  targetId: string | null;
}): HistoryEdgeType | null {
  const { edges, newEdgeIds, sourceId, targetId } = args;
  if (newEdgeIds.length === 0) {
    return null;
  }

  const newEdgeSet = new Set(newEdgeIds);
  const candidates = edges.filter((edge) => newEdgeSet.has(edge.id));
  if (candidates.length === 0) {
    return null;
  }

  const directCandidate = candidates.find((edge) => {
    if (sourceId && edge.source === sourceId) {
      if (targetId) {
        return edge.target === targetId;
      }
      return true;
    }
    return false;
  });

  if (directCandidate) {
    return directCandidate;
  }

  const composedEdge = candidates.find((edge) => {
    const payload = (edge.data ?? {}) as HistoryEdgePayload;
    return payload.isComposedEdge === true;
  });

  return composedEdge ?? candidates[0] ?? null;
}

function useHistoryGraph(projectId?: string | null) {
  const enabled = Boolean(projectId);
  return useQuery({
    queryKey: ["historyGraph", projectId ?? "unknown", "active"],
    enabled,
    queryFn: async (): Promise<ExecutionHistoryGraphResponse> => {
      if (!projectId) {
        throw new Error("Project ID is required to load history graph.");
      }

      const response = await fetch(
        resolveServiceURL(`v1/projects/${projectId}/history/graph`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(response.statusText || "Failed to load history graph.");
      }

      return (await response.json()) as ExecutionHistoryGraphResponse;
    },
    staleTime: 20_000,
  });
}

function HistoryGraphInner({ projectId, children }: HistoryGraphProps) {
  const reactFlow = useReactFlow<HistoryNodeType, HistoryEdgeType>();

  const { data, isFetching, isLoading, error } = useHistoryGraph(projectId);

  const [baseNodes, setBaseNodes] = useState<HistoryNodeType[]>([]);
  const [baseEdges, setBaseEdges] = useState<HistoryEdgeType[]>([]);
  const baseNodesRef = useRef<HistoryNodeType[]>([]);
  const layoutTokenRef = useRef(0);
  const [layoutTransitions, setLayoutTransitions] = useState<
    Map<string, HistoryNodeLayoutTransition>
  >(() => new Map());
  const [layoutAnimationTrigger, setLayoutAnimationTrigger] = useState<number | null>(null);

  const [highlightNodeIds, setHighlightNodeIds] = useState<string[]>([]);
  const [dimmedNodeIds, setDimmedNodeIds] = useState<string[]>([]);
  const [graftedAnimationIds, setGraftedAnimationIds] = useState<string[]>([]);
  const [discardedNodeIds, setDiscardedNodeIds] = useState<string[]>([]);
  const [splicingEdgeState, setSplicingEdgeState] = useState<
    { edgeId: string; token: number } | null
  >(null);

  const latestDiffRef = useRef<CompositionDiff | null>(null);
  const pendingDiffRef = useRef<CompositionDiff | null>(null);
  const animationAbortRef = useRef<(() => void) | null>(null);
  const initialFitRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const previousNodeMetaRef = useRef<Map<string, { creationMethod?: string }>>(
    new Map(),
  );
  const previousEdgeSetRef = useRef<Set<string>>(new Set());

  const {
    compositionAnimation,
    setCompositionAnimationStage,
    clearCompositionAnimation,
    interactionMode,
    exitSplicingMode,
  } = useUiStore((state) => ({
    compositionAnimation: state.compositionAnimation,
    setCompositionAnimationStage: state.setCompositionAnimationStage,
    clearCompositionAnimation: state.clearCompositionAnimation,
    interactionMode: state.interactionMode,
    exitSplicingMode: state.exitSplicingMode,
  }));
  const isSplicingMode = interactionMode === "SPLICING";

  useEffect(() => {
    let cancelled = false;

    const resetState = () => {
      setBaseNodes([]);
      setBaseEdges([]);
      latestDiffRef.current = null;
      pendingDiffRef.current = null;
      baseNodesRef.current = [];
      layoutTokenRef.current = 0;
      setLayoutTransitions(new Map());
      setLayoutAnimationTrigger(null);
    };

    const needsLayout = (node: HistoryNode) => {
      const position = node?.position;
      if (!position) {
        return true;
      }

      const { x, y } = position;
      return !Number.isFinite(x) || !Number.isFinite(y);
    };

    const applyGraph = async () => {
      if (!data) {
        resetState();
        return;
      }

      const rawNodes = Array.isArray(data.nodes) ? data.nodes : [];
      const rawEdges = Array.isArray(data.edges) ? data.edges : [];

      let resolvedNodes = rawNodes;
      let resolvedEdges = rawEdges;

      let shouldForceLayout = rawNodes.some(needsLayout);
      if (!shouldForceLayout && rawNodes.length > 1) {
        const uniquePositions = new Set(
          rawNodes.map((node) => {
            const position = node.position;
            const x = position?.x ?? 0;
            const y = position?.y ?? 0;
            return `${Math.round(x * 100) / 100}:${Math.round(y * 100) / 100}`;
          }),
        );
        if (uniquePositions.size <= 1) {
          shouldForceLayout = true;
        }
      }

      try {
        const layoutResult = await layoutHistoryGraph({
          nodes: rawNodes,
          edges: rawEdges,
          force: shouldForceLayout,
        });

        if (cancelled) {
          return;
        }

        resolvedNodes = layoutResult.nodes ?? rawNodes;
        resolvedEdges = layoutResult.edges ?? rawEdges;
      } catch (layoutError) {
        console.error("[HistoryGraph] Failed to compute layout.", layoutError);
      }

      if (cancelled) {
        return;
      }

      const nextNodeMeta = new Map<string, { creationMethod?: string }>();
      const newNodeIds: string[] = [];
      const graftedTransitionIds: string[] = [];

      const previousPositions = new Map<string, { x: number; y: number }>();
      baseNodesRef.current.forEach((node) => {
        const prevX = node.position?.x ?? 0;
        const prevY = node.position?.y ?? 0;
        previousPositions.set(node.id, { x: prevX, y: prevY });
      });

      let nextLayoutToken = layoutTokenRef.current;
      const nextLayoutTransitions = new Map<string, HistoryNodeLayoutTransition>();

      const mappedNodes: HistoryNodeType[] = resolvedNodes.map((node) => {
        const creationMethod = node.data?.creation_method;
        const previous = previousNodeMetaRef.current.get(node.id);

        if (!previous) {
          newNodeIds.push(node.id);
        } else if (
          creationMethod === "GRAFTED" &&
          previous.creationMethod !== "GRAFTED"
        ) {
          graftedTransitionIds.push(node.id);
        }

        nextNodeMeta.set(node.id, { creationMethod });

        const payload: HistoryNodePayload = {
          ...node.data,
        };

        const mappedNode: HistoryNodeType = {
          ...node,
          type: "historyNode",
          draggable: false,
          selectable: false,
          connectable: false,
          data: payload,
        } as HistoryNodeType;

        const previousPosition = previousPositions.get(mappedNode.id);
        if (previousPosition) {
          const nextX = mappedNode.position?.x ?? 0;
          const nextY = mappedNode.position?.y ?? 0;

          const deltaX = previousPosition.x - nextX;
          const deltaY = previousPosition.y - nextY;

          if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
            nextLayoutToken += 1;
            nextLayoutTransitions.set(mappedNode.id, {
              deltaX,
              deltaY,
              token: nextLayoutToken,
            });
          }
        }

        return mappedNode;
      });

      const nodeStageColorMap = new Map<string, string>();
      mappedNodes.forEach((node) => {
        const stageColor = resolveNodeStageColor(node.data);
        if (stageColor) {
          nodeStageColorMap.set(node.id, stageColor);
        }
      });

      const nextEdgeSet = new Set<string>();
      const newEdgeIds: string[] = [];

      const graftedNodeIds = new Set<string>([...graftedTransitionIds]);

      const mappedEdges: HistoryEdgeType[] = resolvedEdges.map((edge) => {
        nextEdgeSet.add(edge.id);
        if (!previousEdgeSetRef.current.has(edge.id)) {
          newEdgeIds.push(edge.id);
        }

        const baseEdgeData = (edge.data ?? {}) as Record<string, unknown>;
        const isComposedEdge =
          baseEdgeData.isComposedEdge === true ||
          edge.type === "grafted" ||
          (typeof baseEdgeData.kind === "string" &&
            baseEdgeData.kind.trim().toUpperCase() === "COMPOSED");

        const explicitFlowColor =
          typeof baseEdgeData.flowColor === "string" &&
          baseEdgeData.flowColor.trim().length > 0
            ? baseEdgeData.flowColor.trim()
            : undefined;

        const inferredFlowColor =
          explicitFlowColor ??
          (edge.target ? nodeStageColorMap.get(edge.target) : undefined);

        const shouldAnimate = resolveEdgeShouldAnimate(baseEdgeData);
        const forceAnimatedType =
          edge.type === "historyDataFlowEdge" ||
          edge.type === "dataFlow" ||
          edge.type === "animatedDataFlowEdge";

        const nextData: HistoryEdgePayload = {
          ...baseEdgeData,
          animateOnMount: !previousEdgeSetRef.current.has(edge.id),
          isComposedEdge,
        };

        if (inferredFlowColor) {
          nextData.flowColor = inferredFlowColor;
        }

        if (shouldAnimate) {
          nextData.isAnimating = true;
        }

        const resolvedType: HistoryEdgeType["type"] =
          forceAnimatedType || shouldAnimate || Boolean(inferredFlowColor)
            ? "historyDataFlowEdge"
            : "historyEdge";

        return {
          ...edge,
          type: resolvedType,
          animated: false,
          data: nextData,
        } as HistoryEdgeType;
      });

      mappedNodes.forEach((node) => {
        if (node.data?.creation_method === "GRAFTED" && newNodeIds.includes(node.id)) {
          graftedNodeIds.add(node.id);
        }
      });

      const diff: CompositionDiff = {
        newNodes: newNodeIds,
        newEdges: newEdgeIds,
        graftedNodes: Array.from(graftedNodeIds),
      };

      latestDiffRef.current = diff;
      pendingDiffRef.current = diff;
      layoutTokenRef.current = nextLayoutToken;
      setLayoutTransitions(nextLayoutTransitions);

      previousNodeMetaRef.current = nextNodeMeta;
      previousEdgeSetRef.current = nextEdgeSet;

      setBaseNodes(mappedNodes);
      setBaseEdges(mappedEdges);
      baseNodesRef.current = mappedNodes;
    };

    void applyGraph();

    return () => {
      cancelled = true;
    };
  }, [data]);

  useEffect(() => {
    if (!initialFitRef.current && baseNodes.length > 0) {
      initialFitRef.current = true;
      reactFlow.fitView({ padding: 0.3, duration: 400 });
    }
  }, [baseNodes, reactFlow]);

  useEffect(() => {
    if (interactionMode !== "SPLICING") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        exitSplicingMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [interactionMode, exitSplicingMode]);

  useEffect(() => {
    if (!compositionAnimation || compositionAnimation.stage !== "pending") {
      return;
    }

    const diff = pendingDiffRef.current;
    if (!diff) {
      return;
    }

    const hasMeaningfulChange =
      diff.newNodes.length > 0 ||
      diff.newEdges.length > 0 ||
      diff.graftedNodes.length > 0;

    if (!hasMeaningfulChange) {
      return;
    }

    const highlightCandidates = new Set<string>([
      ...diff.newNodes,
      ...(compositionAnimation.source?.nodeId
        ? [compositionAnimation.source.nodeId]
        : []),
      ...(compositionAnimation.target?.nodeId
        ? [compositionAnimation.target.nodeId]
        : []),
    ]);

    if (highlightCandidates.size === 0 && diff.newEdges.length === 0) {
      return;
    }

    let cancelled = false;
    animationAbortRef.current?.();
    animationAbortRef.current = () => {
      cancelled = true;
      setHighlightNodeIds([]);
      setDimmedNodeIds([]);
      setGraftedAnimationIds([]);
      setDiscardedNodeIds([]);
      setSplicingEdgeState(null);
      setLayoutAnimationTrigger(null);
    };

    const runSequence = async () => {
      setCompositionAnimationStage("playing");

      const initialNodes = reactFlow.getNodes();
      const nodesToFocus = initialNodes.filter((node) =>
        highlightCandidates.has(node.id),
      );

      setHighlightNodeIds(Array.from(highlightCandidates));

      await delay(200);
      if (cancelled) return;

      if (nodesToFocus.length > 0) {
        reactFlow.fitView({
          nodes: nodesToFocus,
          padding: 0.2,
          duration: 500,
        });
      }

      const discardedIds = resolveDiscardedNodeIds({
        nodes: initialNodes,
        source: compositionAnimation.source
          ? {
              threadId: compositionAnimation.source.threadId,
              stepIndex: compositionAnimation.source.stepIndex,
            }
          : null,
        newNodeIds: diff.newNodes,
      });

      setDiscardedNodeIds(discardedIds);

      await delay(300);
      if (cancelled) return;

      const latestEdges = reactFlow.getEdges();
      const splicingEdge = resolveSplicingEdge({
        edges: latestEdges,
        newEdgeIds: diff.newEdges,
        sourceId: compositionAnimation.source?.nodeId ?? null,
        targetId: compositionAnimation.target?.nodeId ?? null,
      });

      if (splicingEdge) {
        setSplicingEdgeState({
          edgeId: splicingEdge.id,
          token: Date.now(),
        });
      }

      await delay(600);
      if (cancelled) return;

      const hasLayoutShift = layoutTransitions.size > 0;
      if (hasLayoutShift) {
        setLayoutAnimationTrigger(Date.now());
      }

      if (diff.graftedNodes.length > 0) {
        setGraftedAnimationIds(diff.graftedNodes);
      }

      await delay(500);
      if (cancelled) return;

      setDimmedNodeIds([]);
      setHighlightNodeIds([]);
      setGraftedAnimationIds([]);
      setDiscardedNodeIds([]);
      setSplicingEdgeState(null);
      setLayoutAnimationTrigger(null);

      const finalNodes = nodesToFocus.length > 0 ? nodesToFocus : initialNodes;

      if (finalNodes.length > 0) {
        reactFlow.fitView({
          nodes: finalNodes,
          padding: 0.3,
          duration: 600,
        });
      } else {
        reactFlow.fitView({ duration: 600 });
      }

      toast.success(
        compositionAnimation.toastMessage ??
          "结果拼接成功。一条新的混合轨迹已生成。",
      );

      clearCompositionAnimation();
      pendingDiffRef.current = null;
      animationAbortRef.current = null;
    };

    runSequence().catch((sequenceError) => {
      console.error(sequenceError);
      clearCompositionAnimation();
      pendingDiffRef.current = null;
      animationAbortRef.current = null;
      setLayoutAnimationTrigger(null);
    });

    return () => {
      cancelled = true;
      animationAbortRef.current = null;
      setLayoutAnimationTrigger(null);
    };
  }, [
    compositionAnimation,
    reactFlow,
    clearCompositionAnimation,
    setCompositionAnimationStage,
    layoutTransitions,
  ]);

  useEffect(() => {
    return () => {
      animationAbortRef.current?.();
      animationAbortRef.current = null;
    };
  }, []);

  const highlightSet = useMemo(
    () => new Set(highlightNodeIds),
    [highlightNodeIds],
  );
  const dimSet = useMemo(() => new Set(dimmedNodeIds), [dimmedNodeIds]);
  const graftedSet = useMemo(
    () => new Set(graftedAnimationIds),
    [graftedAnimationIds],
  );
  const discardedSet = useMemo(
    () => new Set(discardedNodeIds),
    [discardedNodeIds],
  );

  const nodes = useMemo(() => {
    if (baseNodes.length === 0) {
      return baseNodes;
    }

    const lastDiff = latestDiffRef.current;
    const newNodeSet = new Set(lastDiff?.newNodes ?? []);

    const stage: CompositionAnimationStage | null =
      compositionAnimation?.stage ?? null;
    const sourceId = compositionAnimation?.source?.nodeId;
    const targetId = compositionAnimation?.target?.nodeId;

    return baseNodes.map((node) => {
      const rawLayoutTransition = layoutTransitions.get(node.id) ?? null;
      const layoutTransition =
        rawLayoutTransition && layoutAnimationTrigger !== null
          ? { ...rawLayoutTransition, trigger: layoutAnimationTrigger }
          : rawLayoutTransition
            ? { ...rawLayoutTransition, trigger: null }
            : null;

      const ui: HistoryNodeVisualState = {
        ...(node.data?.ui ?? {}),
        isHighlighted: highlightSet.has(node.id),
        isDimmed: dimSet.has(node.id),
        isDiscarded: discardedSet.has(node.id),
        animateGrafted: graftedSet.has(node.id),
        isSource: sourceId === node.id,
        isTarget: targetId === node.id,
        isNewlyAdded: newNodeSet.has(node.id),
        compositionStage: stage,
        layoutTransition,
      };

      return {
        ...node,
        data: {
          ...node.data,
          ui,
        },
      };
    });
  }, [
    baseNodes,
    highlightSet,
    dimSet,
    discardedSet,
    graftedSet,
    compositionAnimation?.stage,
    compositionAnimation?.source?.nodeId,
    compositionAnimation?.target?.nodeId,
    layoutTransitions,
    layoutAnimationTrigger,
  ]);

  const edges = useMemo(() => {
    if (baseEdges.length === 0) {
      return baseEdges;
    }

    const splicingEdgeId = splicingEdgeState?.edgeId ?? null;
    const splicingToken = splicingEdgeState?.token ?? null;

    return baseEdges.map((edge) => {
      const edgeData = (edge.data ?? {}) as HistoryEdgePayload;
      const normalizedData: HistoryEdgePayload = {
        ...edgeData,
        animateOnMount: Boolean(edgeData.animateOnMount),
        isComposedEdge: Boolean(edgeData.isComposedEdge),
      };

      if (
        typeof edgeData.flowColor === "string" &&
        edgeData.flowColor.trim().length > 0
      ) {
        normalizedData.flowColor = edgeData.flowColor.trim();
      }

      if (edgeData.isAnimating === true) {
        normalizedData.isAnimating = true;
      }

      const isSplicingEdge = splicingEdgeId !== null && edge.id === splicingEdgeId;
      if (isSplicingEdge) {
        normalizedData.isSplicingEdge = true;
        normalizedData.splicingAnimationToken = splicingToken ?? null;
      }

      const shouldUseAnimatedEdge =
        !isSplicingEdge &&
        (edge.type === "historyDataFlowEdge" ||
          normalizedData.isAnimating === true ||
          Boolean(normalizedData.flowColor));

      const resolvedType: HistoryEdgeType["type"] = isSplicingEdge
        ? "historySplicingEdge"
        : shouldUseAnimatedEdge
          ? "historyDataFlowEdge"
          : "historyEdge";

      return {
        ...edge,
        type: resolvedType,
        data: normalizedData,
      } as HistoryEdgeType;
    });
  }, [baseEdges, splicingEdgeState]);

  const showLoadingState = isLoading || (isFetching && baseNodes.length === 0);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <FlickeringGrid
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        color="var(--gray-900)"
        maxOpacity={0.2}
        squareSize={3}
        gridGap={7}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={isSplicingMode}
        connectOnClick={false}
        panOnScroll
        panOnDrag={[1, 2]}
        zoomOnScroll
        zoomOnPinch
        preventScrolling={false}
        proOptions={proOptions}
        className="bg-app"
        fitView={false}
        minZoom={0.25}
        maxZoom={1.85}
        selectionOnDrag={false}
        onlyRenderVisibleElements
      >
        <Background className="!opacity-20" />
        <MiniMap pannable zoomable />
        <Controls position="bottom-right" />
        {children}
      </ReactFlow>

      <SplicingConfirmationDialog projectId={projectId} />

      {showLoadingState ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-full bg-background-overlay px-4 py-2 shadow-lg shadow-black/20">
            <span className="size-3 animate-ping motion-reduce:animate-none rounded-full bg-primary" />
            <span className="text-sm font-medium text-text-secondary">
              正在加载历史图谱…
            </span>
          </div>
        </div>
      ) : null}

      {isSplicingMode ? (
        prefersReducedMotion ? (
          <button
            type="button"
            onClick={exitSplicingMode}
            className="absolute inset-0 z-40 w-full cursor-pointer bg-black/40 backdrop-blur-[2px]"
            aria-label="退出拼接模式"
          />
        ) : (
          <motion.button
            type="button"
            onClick={exitSplicingMode}
            className="absolute inset-0 z-40 w-full cursor-pointer bg-black/40 backdrop-blur-[2px]"
            aria-label="退出拼接模式"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )
      ) : null}

      {error ? (
        <div className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-destructive/90 px-4 py-2 text-sm text-destructive-foreground shadow-lg shadow-black/30">
          无法加载历史图谱：{(error as Error).message}
        </div>
      ) : null}
    </div>
  );
}

export function HistoryGraph({ projectId, children }: HistoryGraphProps) {
  return (
    <ReactFlowProvider>
      <HistoryGraphInner projectId={projectId}>{children}</HistoryGraphInner>
    </ReactFlowProvider>
  );
}
