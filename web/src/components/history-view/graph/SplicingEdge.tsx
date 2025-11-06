// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import type { EdgeProps } from "@xyflow/react";
import { getBezierPath } from "@xyflow/react";
import { motion, useAnimation } from "framer-motion";
import { memo, useEffect, useMemo, useRef } from "react";

import { usePrefersReducedMotion } from "~/lib/a11y/motion-preferences";

import type { HistoryEdgePayload, HistoryEdgeType } from "./types";

type SplicingEdgeProps = EdgeProps<HistoryEdgeType>;

const STROKE_COLOR = "var(--color-text-accent)";
const DASH_PATTERN_IDLE = "12 6";
const ANIMATION_DURATION = 0.5; // duration-slow (~500ms)

function extractAnimationToken(data: HistoryEdgePayload | undefined): number | string | null {
  if (!data) {
    return null;
  }
  return (data.splicingAnimationToken ?? data.animationToken ?? null) as
    | number
    | string
    | null;
}

function areSplicingEdgePropsEqual(prev: SplicingEdgeProps, next: SplicingEdgeProps): boolean {
  if (prev.id !== next.id) {
    return false;
  }

  if (
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

  const prevToken = extractAnimationToken(prev.data as HistoryEdgePayload | undefined);
  const nextToken = extractAnimationToken(next.data as HistoryEdgePayload | undefined);

  return prevToken === nextToken;
}

function SplicingEdgeComponent(props: SplicingEdgeProps) {
  const {
    id,
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

  const pathRef = useRef<SVGPathElement | null>(null);
  const controls = useAnimation();
  const lastTokenRef = useRef<number | string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const animationToken = data?.splicingAnimationToken ?? data?.animationToken ?? null;

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
    const element = pathRef.current;
    if (!element || animationToken == null) {
      return;
    }

    if (lastTokenRef.current === animationToken) {
      return;
    }

    lastTokenRef.current = animationToken;

    const totalLength = element.getTotalLength();
    if (prefersReducedMotion) {
      controls.set({
        strokeDasharray: DASH_PATTERN_IDLE,
        strokeDashoffset: 0,
      });
      return;
    }

    controls.set({
      strokeDasharray: `${totalLength}`,
      strokeDashoffset: totalLength,
    });

    let cancelled = false;

    void (async () => {
      await controls.start({
        strokeDashoffset: 0,
        transition: {
          duration: ANIMATION_DURATION,
          ease: [0.4, 0, 0.2, 1],
        },
      });

      if (cancelled) {
        return;
      }

      controls.set({
        strokeDasharray: DASH_PATTERN_IDLE,
        strokeDashoffset: 0,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [animationToken, controls, prefersReducedMotion]);

  return (
    <g className="react-flow__edge">
      <motion.path
        id={id}
        ref={pathRef}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={STROKE_COLOR}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={DASH_PATTERN_IDLE}
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={controls}
        style={style}
        markerEnd={markerEnd}
      />
    </g>
  );
}

export const SplicingEdge = memo(SplicingEdgeComponent, areSplicingEdgePropsEqual);
SplicingEdge.displayName = "HistorySplicingEdge";
