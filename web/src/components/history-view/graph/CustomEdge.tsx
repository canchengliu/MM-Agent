// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import type { EdgeProps } from "@xyflow/react";
import { getBezierPath } from "@xyflow/react";
import { motion, useAnimation } from "framer-motion";
import { memo, useEffect, useMemo, useRef } from "react";

import { usePrefersReducedMotion } from "~/lib/a11y/motion-preferences";

import type { HistoryEdgePayload, HistoryEdgeType } from "./types";

type CustomEdgeProps = EdgeProps<HistoryEdgeType>;

const BASE_STROKE = "var(--color-border-subtle)";
const COMPOSED_STROKE = "var(--color-state-grafted)";

function areEdgeDataEqual(
  prevData: HistoryEdgeType["data"],
  nextData: HistoryEdgeType["data"],
): boolean {
  const prevPayload = (prevData ?? {}) as HistoryEdgePayload;
  const nextPayload = (nextData ?? {}) as HistoryEdgePayload;

  return (
    Boolean(prevPayload.isComposedEdge) === Boolean(nextPayload.isComposedEdge) &&
    Boolean(prevPayload.animateOnMount) === Boolean(nextPayload.animateOnMount)
  );
}

function areCustomEdgePropsEqual(prev: CustomEdgeProps, next: CustomEdgeProps): boolean {
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

  if (!areEdgeDataEqual(prev.data, next.data)) {
    return false;
  }

  return true;
}

function CustomEdgeComponent(props: CustomEdgeProps) {
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
  const hasAnimatedRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const animateOnMount = Boolean(data?.animateOnMount);
  const isComposed = Boolean(data?.isComposedEdge);

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
        controls.set({
          strokeDasharray: isComposed ? "12 6" : "0",
          strokeDashoffset: 0,
        });
      }
      return;
    }

    const element = pathRef.current;
    if (!element) {
      return;
    }

    const totalLength = element.getTotalLength();
    hasAnimatedRef.current = true;

    if (prefersReducedMotion) {
      controls.set({
        strokeDasharray: isComposed ? "12 6" : "0",
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
          duration: 1.1,
          ease: [0.4, 0, 0.2, 1],
        },
      });

      if (cancelled) {
        return;
      }

      controls.set({
        strokeDasharray: isComposed ? "12 6" : "0",
        strokeDashoffset: 0,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [animateOnMount, controls, isComposed, prefersReducedMotion]);

  const stroke = isComposed ? COMPOSED_STROKE : BASE_STROKE;
  const dashPattern = isComposed ? "12 6" : "0";

  return (
    <g className="react-flow__edge">
      <motion.path
        id={id}
        ref={pathRef}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={stroke}
        strokeWidth={2.25}
        fill="none"
        strokeDasharray={dashPattern}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={controls}
        style={style}
        markerEnd={markerEnd}
      />
    </g>
  );
}

export const CustomEdge = memo(CustomEdgeComponent, areCustomEdgePropsEqual);
CustomEdge.displayName = "HistoryCustomEdge";
