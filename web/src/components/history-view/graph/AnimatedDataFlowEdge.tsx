// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import type { EdgeProps } from "@xyflow/react";
import { getBezierPath } from "@xyflow/react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import type { HistoryEdgePayload, HistoryEdgeType } from "./types";

type AnimatedDataFlowEdgeProps = EdgeProps<HistoryEdgeType>;

const BASE_STROKE = "var(--color-border-subtle)";
const DEFAULT_FLOW_COLOR = "var(--color-stage-1)";
const COMPOSED_STROKE = "var(--color-state-grafted)";

const MIN_BEAM = 28;
const MAX_BEAM = 88;
const MIN_DURATION = 0.45;
const MAX_DURATION = 1.2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizePayload(
  payload: HistoryEdgePayload | undefined,
): Pick<
  HistoryEdgePayload,
  "animateOnMount" | "isComposedEdge" | "flowColor" | "isAnimating" | "animationToken" | "onAnimationComplete"
> {
  return {
    animateOnMount: Boolean(payload?.animateOnMount),
    isComposedEdge: Boolean(payload?.isComposedEdge),
    flowColor:
      typeof payload?.flowColor === "string" && payload.flowColor.length > 0
        ? payload.flowColor
        : undefined,
    isAnimating: payload?.isAnimating === true,
    animationToken: payload?.animationToken ?? null,
    onAnimationComplete: payload?.onAnimationComplete,
  };
}

function areAnimatedEdgePropsEqual(
  prev: AnimatedDataFlowEdgeProps,
  next: AnimatedDataFlowEdgeProps,
): boolean {
  if (prev.id !== next.id) {
    return false;
  }

  if (
    prev.source !== next.source ||
    prev.target !== next.target ||
    prev.sourceX !== next.sourceX ||
    prev.sourceY !== next.sourceY ||
    prev.targetX !== next.targetX ||
    prev.targetY !== next.targetY ||
    prev.sourcePosition !== next.sourcePosition ||
    prev.targetPosition !== next.targetPosition
  ) {
    return false;
  }

  if (prev.markerEnd !== next.markerEnd || prev.style !== next.style) {
    return false;
  }

  const prevData = normalizePayload(prev.data as HistoryEdgePayload | undefined);
  const nextData = normalizePayload(next.data as HistoryEdgePayload | undefined);

  return (
    prevData.animateOnMount === nextData.animateOnMount &&
    prevData.isComposedEdge === nextData.isComposedEdge &&
    prevData.flowColor === nextData.flowColor &&
    prevData.isAnimating === nextData.isAnimating &&
    prevData.animationToken === nextData.animationToken &&
    prevData.onAnimationComplete === nextData.onAnimationComplete
  );
}

function AnimatedDataFlowEdgeComponent(props: AnimatedDataFlowEdgeProps) {
  const {
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
    data,
  } = props;

  const basePathRef = useRef<SVGPathElement | null>(null);
  const flowPathRef = useRef<SVGPathElement | null>(null);

  const baseControls = useAnimation();
  const hasAnimatedRef = useRef(false);

  const prefersReducedMotion = useReducedMotion();

  const animateOnMount = Boolean(data?.animateOnMount);
  const isComposed = Boolean(data?.isComposedEdge);
  const flowColor =
    typeof data?.flowColor === "string" && data.flowColor.length > 0
      ? data.flowColor
      : DEFAULT_FLOW_COLOR;

  const shouldAnimateFlow =
    Boolean(data?.isAnimating) && prefersReducedMotion !== true;

  const animationToken = data?.animationToken ?? null;
  const normalizedToken = animationToken ?? "__null__";
  const onAnimationComplete =
    typeof data?.onAnimationComplete === "function"
      ? data.onAnimationComplete
      : undefined;

  const completionNotifiedRef = useRef<number | string | "__null__" | null>(null);

  const [edgePath] = useMemo(
    () =>
      getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        curvature: 0.18,
      }),
    [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition],
  );

  useEffect(() => {
    if (!animateOnMount || hasAnimatedRef.current) {
      if (prefersReducedMotion) {
        baseControls.set({
          strokeDasharray: isComposed ? "12 6" : "0",
          strokeDashoffset: 0,
        });
      }
      return;
    }

    const element = basePathRef.current;
    if (!element) {
      return;
    }

    const totalLength = element.getTotalLength();
    hasAnimatedRef.current = true;

    if (prefersReducedMotion) {
      baseControls.set({
        strokeDasharray: isComposed ? "12 6" : "0",
        strokeDashoffset: 0,
      });
      return;
    }

    baseControls.set({
      strokeDasharray: `${totalLength}`,
      strokeDashoffset: totalLength,
    });

    let cancelled = false;

    void (async () => {
      await baseControls.start({
        strokeDashoffset: 0,
        transition: {
          duration: 1.1,
          ease: [0.4, 0, 0.2, 1],
        },
      });

      if (cancelled) {
        return;
      }

      baseControls.set({
        strokeDasharray: isComposed ? "12 6" : "0",
        strokeDashoffset: 0,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [animateOnMount, baseControls, isComposed, prefersReducedMotion]);

  const [dashPattern, setDashPattern] = useState("48 72");
  const [patternLength, setPatternLength] = useState(120);
  const [animationDuration, setAnimationDuration] = useState(0.65);

  useLayoutEffect(() => {
    if (!shouldAnimateFlow) {
      return;
    }

    const element = flowPathRef.current;
    if (!element) {
      return;
    }

    const length = element.getTotalLength();
    const beam = clamp(length * 0.2, MIN_BEAM, MAX_BEAM);
    const gap = clamp(beam * 1.6, beam + 10, MAX_BEAM * 2.4);
    const pattern = `${Math.round(beam)} ${Math.round(gap)}`;

    setDashPattern(pattern);
    setPatternLength(Math.round(beam + gap));

    const normalizedDuration = clamp((beam + gap) / 140, MIN_DURATION, MAX_DURATION);
    setAnimationDuration(parseFloat(normalizedDuration.toFixed(2)));
  }, [edgePath, shouldAnimateFlow]);

  const stroke = isComposed ? COMPOSED_STROKE : BASE_STROKE;
  const dashPatternBase = isComposed ? "12 6" : "0";

  const flowStyle: CSSProperties = {
    strokeDasharray: dashPattern,
    animationDuration: `${animationDuration}s`,
    opacity: 0.9,
    filter:
      "drop-shadow(0 0 6px color-mix(in srgb, var(--color-glow-accent) 45%, transparent))",
    animationIterationCount: 1,
    animationFillMode: "forwards",
  };

  (flowStyle as Record<string, string>)["--data-flow-length"] = `${patternLength}px`;

  useEffect(() => {
    if (!shouldAnimateFlow) {
      if (
        onAnimationComplete &&
        data?.isAnimating === true &&
        completionNotifiedRef.current !== normalizedToken
      ) {
        completionNotifiedRef.current = normalizedToken;
        onAnimationComplete({
          edgeId: id,
          sourceId: source,
          targetId: target,
          animationToken,
        });
      }

      return;
    }

    const element = flowPathRef.current;
    if (!element) {
      return;
    }

    completionNotifiedRef.current = null;

    const handleAnimationEnd = () => {
      if (completionNotifiedRef.current === normalizedToken) {
        return;
      }

      completionNotifiedRef.current = normalizedToken;
      onAnimationComplete?.({
        edgeId: id,
        sourceId: source,
        targetId: target,
        animationToken,
      });
    };

    element.addEventListener("animationend", handleAnimationEnd, { once: true });

    return () => {
      element.removeEventListener("animationend", handleAnimationEnd);
    };
  }, [
    shouldAnimateFlow,
    data?.isAnimating,
    onAnimationComplete,
    animationToken,
    id,
    source,
    target,
  ]);

  return (
    <g className="react-flow__edge">
      <motion.path
        id={id}
        ref={basePathRef}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={stroke}
        strokeWidth={2.25}
        fill="none"
        strokeDasharray={dashPatternBase}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={baseControls}
        style={style}
        markerEnd={markerEnd}
      />

      {shouldAnimateFlow ? (
        <path
          ref={flowPathRef}
          d={edgePath}
          className="pointer-events-none animate-data-flow"
          stroke={flowColor}
          strokeWidth={2.6}
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={flowStyle}
        />
      ) : null}
    </g>
  );
}

export const AnimatedDataFlowEdge = memo(
  AnimatedDataFlowEdgeComponent,
  areAnimatedEdgePropsEqual,
);
AnimatedDataFlowEdge.displayName = "HistoryAnimatedDataFlowEdge";
