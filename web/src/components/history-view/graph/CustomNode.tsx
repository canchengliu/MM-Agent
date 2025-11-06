// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import type { NodeProps } from "@xyflow/react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
} from "framer-motion";
import type { AnimationPlaybackControls } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Link2,
  Loader2,
  PauseCircle,
  TimerIcon,
  XCircle,
} from "lucide-react";
import { memo, useEffect, useRef } from "react";

import {
  reducedMotionTransition,
  usePrefersReducedMotion,
} from "~/lib/a11y/motion-preferences";
import { cn } from "~/lib/utils";
import { duration, easing, spring } from "~/lib/motion-tokens";
import type { ProvenanceStatus } from "~/types/api/history";
import { useWorkspaceStore } from "~/store/workspaceStore";
import { BorderBeam } from "~/components/magicui/border-beam";

import type { HistoryNodeType, HistoryNodeVisualState, HistoryNodeLayoutTransition } from "./types";

type CustomNodeProps = NodeProps<HistoryNodeType>;

type VisualStatus =
  | "queued"
  | "running"
  | "interrupted"
  | "success"
  | "failed"
  | "grafted";

interface StatusMeta {
  color: string;
  Icon: LucideIcon;
  iconClassName?: string;
}

const VISUAL_STATUS_META: Record<VisualStatus, StatusMeta> = {
  queued: {
    color: "var(--color-state-queued)",
    Icon: TimerIcon,
  },
  running: {
    color: "var(--color-state-running)",
    Icon: Loader2,
    iconClassName: "animate-spin motion-reduce:animate-none",
  },
  interrupted: {
    color: "var(--color-state-interrupted)",
    Icon: PauseCircle,
  },
  success: {
    color: "var(--color-state-success)",
    Icon: CheckCircle2,
  },
  failed: {
    color: "var(--color-state-failed)",
    Icon: XCircle,
  },
  grafted: {
    color: "var(--color-state-grafted)",
    Icon: Link2,
  },
};

const SHADOW_BASE = "var(--shadow-node-base)";
const SHADOW_ACTIVE = "var(--shadow-node-active)";
const SHADOW_GRAFTED = "var(--shadow-node-grafted)";
const SHADOW_TRANSPARENT = "var(--shadow-node-none)";

function resolveVisualStatus({
  provenanceStatus,
  runtimeStatus,
  creationMethod,
}: {
  provenanceStatus: ProvenanceStatus | null;
  runtimeStatus: string | null;
  creationMethod?: string | null;
}): VisualStatus {
  const normalizedRuntime = runtimeStatus?.toUpperCase() ?? null;

  if (creationMethod === "GRAFTED" || provenanceStatus === "GRAFTED") {
    return "grafted";
  }

  if (normalizedRuntime === "RUNNING" || provenanceStatus === "RESUMED") {
    return "running";
  }

  if (normalizedRuntime === "PAUSED" || provenanceStatus === "INTERRUPTED") {
    return "interrupted";
  }

  if (normalizedRuntime === "ERROR" || provenanceStatus === "ERROR") {
    return "failed";
  }

  if (normalizedRuntime === "COMPLETED" || provenanceStatus === "EXECUTED") {
    return "success";
  }

  return "queued";
}

function areLayoutTransitionsEqual(
  prev: HistoryNodeLayoutTransition | null | undefined,
  next: HistoryNodeLayoutTransition | null | undefined,
): boolean {
  if (!prev && !next) {
    return true;
  }
  if (!prev || !next) {
    return false;
  }
  return (
    prev.token === next.token &&
    prev.trigger === next.trigger &&
    Math.abs((prev.deltaX ?? 0) - (next.deltaX ?? 0)) < 0.25 &&
    Math.abs((prev.deltaY ?? 0) - (next.deltaY ?? 0)) < 0.25
  );
}

function areVisualStatesEqual(
  prev: HistoryNodeVisualState | undefined,
  next: HistoryNodeVisualState | undefined,
): boolean {
  if (prev === next) {
    return true;
  }
  if (!prev || !next) {
    return false;
  }

  return (
    prev.isHighlighted === next.isHighlighted &&
    prev.isDimmed === next.isDimmed &&
    prev.isDiscarded === next.isDiscarded &&
    prev.animateGrafted === next.animateGrafted &&
    prev.isSource === next.isSource &&
    prev.isTarget === next.isTarget &&
    prev.isNewlyAdded === next.isNewlyAdded &&
    prev.compositionStage === next.compositionStage &&
    areLayoutTransitionsEqual(prev.layoutTransition, next.layoutTransition)
  );
}

function areNodePropsEqual(prev: CustomNodeProps, next: CustomNodeProps): boolean {
  if (prev.id !== next.id) {
    return false;
  }

  if (
    prev.selected !== next.selected ||
    prev.dragging !== next.dragging ||
    prev.xPos !== next.xPos ||
    prev.yPos !== next.yPos ||
    prev.width !== next.width ||
    prev.height !== next.height
  ) {
    return false;
  }

  const prevData = prev.data;
  const nextData = next.data;

  if (prevData === nextData) {
    return true;
  }

  if (!prevData || !nextData) {
    return false;
  }

  if (
    prevData.label !== nextData.label ||
    prevData.thread_id !== nextData.thread_id ||
    prevData.thread_name !== nextData.thread_name ||
    prevData.step_index !== nextData.step_index ||
    prevData.timestamp !== nextData.timestamp ||
    prevData.creation_method !== nextData.creation_method ||
    prevData.provenance_status !== nextData.provenance_status ||
    prevData.runtime_status !== nextData.runtime_status ||
    prevData.status !== nextData.status
  ) {
    return false;
  }

  return areVisualStatesEqual(prevData.ui, nextData.ui);
}

function CustomNodeComponent({ id, data }: CustomNodeProps) {
  const ui = data.ui;
  const activeBranchId = useWorkspaceStore(
    (state) => state.activeBranch.branchId,
  );
  const isActiveBranch =
    Boolean(activeBranchId) && activeBranchId === data.thread_id;

  const isDiscarded = ui?.isDiscarded === true;
  const prefersReducedMotion = usePrefersReducedMotion();
  const layoutOffsetX = useMotionValue(0);
  const layoutOffsetY = useMotionValue(0);
  const layoutAnimationRef = useRef<{
    key?: string;
    x?: AnimationPlaybackControls;
    y?: AnimationPlaybackControls;
  }>({});

  const isGraftedCreation = data.creation_method === "GRAFTED";
  const provenanceStatus = data.provenance_status;
  const runtimeStatus =
    data.runtime_status ??
    (typeof data.status === "string" ? data.status : null) ??
    null;

  const visualStatus = resolveVisualStatus({
    provenanceStatus,
    runtimeStatus,
    creationMethod: data.creation_method ?? null,
  });
  const statusMeta = VISUAL_STATUS_META[visualStatus];
  const StatusIcon = statusMeta?.Icon ?? null;
  const statusColor = statusMeta?.color ?? "var(--color-border-subtle)";
  const iconClassName = statusMeta?.iconClassName;
  const shouldScaleIcon =
    visualStatus === "success" || visualStatus === "failed";

  const shouldShowRunningBeam =
    !prefersReducedMotion &&
    visualStatus === "running" &&
    ui?.isDimmed !== true &&
    !isDiscarded;
  const borderColor = isGraftedCreation
    ? "var(--color-state-grafted)"
    : statusColor;

  const layoutTransition = ui?.layoutTransition ?? null;

  const layoutShadow = isDiscarded
    ? SHADOW_TRANSPARENT
    : ui?.animateGrafted
      ? SHADOW_GRAFTED
      : isActiveBranch
        ? SHADOW_ACTIVE
        : SHADOW_BASE;

  const animateScale = isDiscarded
    ? 0.95
    : ui?.isDimmed === true
      ? 0.96
      : ui?.isHighlighted === true
        ? 1.035
        : 1;

  const animateOpacity = isDiscarded ? 0.2 : ui?.isDimmed === true ? 0.35 : 1;
  const resolvedScale = prefersReducedMotion ? 1 : animateScale;

  const baseSpringTransition = {
    type: "spring" as const,
    stiffness: spring.default.stiffness,
    damping: spring.default.damping,
    mass: spring.default.mass,
  };

  const layoutSpringTransition = {
    type: "spring" as const,
    stiffness: spring.gentle.stiffness,
    damping: spring.gentle.damping,
    mass: spring.gentle.mass,
  };

  const motionTransition = isDiscarded
    ? {
        layout: {
          duration: duration.default,
          ease: easing.decelerate,
        },
        opacity: {
          duration: duration.default,
          ease: easing.decelerate,
        },
        scale: {
          duration: duration.default,
          ease: easing.decelerate,
        },
        boxShadow: {
          duration: duration.default,
          ease: easing.decelerate,
        },
        borderColor: {
          duration: duration.fast,
          ease: easing.decelerate,
        },
      }
    : {
        layout: layoutSpringTransition,
        opacity: baseSpringTransition,
        scale: baseSpringTransition,
        boxShadow: {
          duration: duration.fast,
          ease: easing.decelerate,
        },
        borderColor: {
          duration: duration.fast,
          ease: easing.decelerate,
        },
      };

  const reducedMotionPropertyTransition = {
    duration: duration.fast,
    ease: easing.decelerate,
  };

  const resolvedTransition = prefersReducedMotion
    ? {
        layout: reducedMotionPropertyTransition,
        opacity: reducedMotionPropertyTransition,
        scale: reducedMotionPropertyTransition,
        boxShadow: reducedMotionPropertyTransition,
        borderColor: reducedMotionPropertyTransition,
      }
    : motionTransition;

  useEffect(() => {
    const ref = layoutAnimationRef.current;

    if (prefersReducedMotion) {
      ref.x?.stop();
      ref.y?.stop();
      layoutOffsetX.set(0);
      layoutOffsetY.set(0);
      layoutAnimationRef.current = { key: undefined };
      return;
    }

    if (!layoutTransition) {
      ref.x?.stop();
      ref.y?.stop();
      layoutOffsetX.set(0);
      layoutOffsetY.set(0);
      layoutAnimationRef.current = { key: undefined };
      return;
    }

    if (layoutTransition.trigger == null) {
      return;
    }

    const transitionKey = `${layoutTransition.token}-${layoutTransition.trigger}`;
    if (ref.key === transitionKey) {
      return;
    }

    ref.x?.stop();
    ref.y?.stop();

    const { deltaX, deltaY } = layoutTransition;
    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
      layoutOffsetX.set(0);
      layoutOffsetY.set(0);
      layoutAnimationRef.current = { key: transitionKey };
      return;
    }

    layoutOffsetX.set(deltaX);
    layoutOffsetY.set(deltaY);

    const controlsX = animate(layoutOffsetX, 0, {
      type: "spring",
      stiffness: spring.gentle.stiffness,
      damping: spring.gentle.damping,
      mass: spring.gentle.mass,
    });

    const controlsY = animate(layoutOffsetY, 0, {
      type: "spring",
      stiffness: spring.gentle.stiffness,
      damping: spring.gentle.damping,
      mass: spring.gentle.mass,
    });

    layoutAnimationRef.current = {
      key: transitionKey,
      x: controlsX,
      y: controlsY,
    };

    return () => {
      controlsX.stop();
      controlsY.stop();
    };
  }, [
    layoutTransition?.token,
    layoutTransition?.trigger,
    layoutTransition?.deltaX,
    layoutTransition?.deltaY,
    prefersReducedMotion,
    layoutOffsetX,
    layoutOffsetY,
  ]);

  const timestampLabel = (() => {
    if (!data.timestamp) {
      return "—";
    }
    const parsed = new Date(data.timestamp);
    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }
    return parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  })();

  return (
    <motion.div
      layout={!prefersReducedMotion}
      layoutDependency={ui?.compositionStage ?? undefined}
      data-node-id={id}
      initial={false}
      className={cn(
        "group relative flex min-w-[220px] max-w-[260px] flex-col gap-2 overflow-hidden rounded-2xl border px-4 py-3",
        "bg-background-overlay/85 backdrop-blur-md transition-colors duration-150",
        ui?.isHighlighted && !isDiscarded && "ring-2 ring-brand/45",
        ui?.isSource && !isDiscarded && "ring-2 ring-[var(--color-state-running)]",
        ui?.isTarget && !isDiscarded && "ring-2 ring-[var(--color-state-success)]",
      )}
      animate={{
        boxShadow: layoutShadow,
        scale: resolvedScale,
        opacity: animateOpacity,
        borderColor,
      }}
      transition={resolvedTransition}
      style={{
        borderStyle: isGraftedCreation ? "dashed" : "solid",
        filter: isDiscarded ? "saturate(0.6)" : undefined,
        x: layoutOffsetX,
        y: layoutOffsetY,
        boxShadow: layoutShadow,
      }}
    >
      {shouldShowRunningBeam ? (
        <BorderBeam
          size={140}
          duration={4}
          colorFrom="color-mix(in srgb, var(--color-state-running) 85%, transparent)"
          colorTo="color-mix(in srgb, var(--color-glow-accent) 70%, transparent)"
          className="opacity-90"
        />
      ) : null}
      <AnimatePresence initial={false}>
        {ui?.animateGrafted ? (
          <motion.div
            key="grafted-glow"
            className="pointer-events-none absolute -inset-[1.5px] rounded-2xl border border-[var(--color-state-grafted)]/75 bg-[radial-gradient(circle_at_top,var(--color-state-grafted)/0.18,transparent_55%)]"
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }
            }
            animate={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
            }
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }
            }
            transition={{
              duration: prefersReducedMotion ? duration.quick : duration.fast,
              ease: easing.decelerate,
            }}
          />
        ) : null}
      </AnimatePresence>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
            {StatusIcon ? (
              <motion.span
                key={visualStatus}
                initial={{
                  opacity: 0,
                  scale: prefersReducedMotion ? 1 : shouldScaleIcon ? 0.8 : 1,
                }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={
                  prefersReducedMotion
                    ? reducedMotionTransition
                    : {
                        type: "spring",
                        stiffness: spring.default.stiffness,
                        damping: spring.default.damping,
                        mass: spring.default.mass,
                      }
                }
                className="flex items-center justify-center"
              >
                <StatusIcon
                  className={cn(
                    "size-4 transition-colors duration-150",
                    iconClassName,
                  )}
                  style={{
                    color: statusColor,
                  }}
                />
              </motion.span>
            ) : null}
          </AnimatePresence>
          <span className="text-sm font-semibold leading-tight text-text-primary">
            {data.label}
          </span>
        </div>
        {isActiveBranch ? (
          <span className="rounded-full border border-white/20 bg-background/70 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-text-secondary shadow-inner">
            Active
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <span className="truncate">
          {data.thread_name ?? data.thread_id ?? "—"}
        </span>
        <span className="text-text-tertiary">•</span>
        <span>Step {data.step_index}</span>
      </div>

      <div className="flex items-center justify-between text-[0.7rem] text-text-tertiary">
        <span>{timestampLabel}</span>
        {isGraftedCreation ? (
          <span className="flex items-center gap-1 text-text-secondary">
            <Link2 className="size-3.5" />
            Grafted
          </span>
        ) : null}
      </div>

      {ui?.isNewlyAdded ? (
        <motion.div
          className="pointer-events-none absolute -inset-[2px] rounded-2xl border border-brand/40"
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }
          }
          animate={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
          }
          exit={{ opacity: 0 }}
          transition={
            prefersReducedMotion
              ? reducedMotionTransition
              : { duration: 0.35, ease: "easeOut" }
          }
        />
      ) : null}
    </motion.div>
  );
}

export const CustomNode = memo(CustomNodeComponent, areNodePropsEqual);
CustomNode.displayName = "HistoryGraphNode";
