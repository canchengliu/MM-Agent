"use client";

import {
  Handle,
  Position,
  type Node as ReactFlowNode,
  type NodeProps,
} from "@xyflow/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { BorderBeam } from "~/components/magicui/border-beam";
import { StalenessIndicator } from "~/components/platform/StalenessIndicator";
import {
  StatusBadge,
  getStatusVisual,
} from "~/components/platform/StatusBadge";
import { Card } from "~/components/ui/card";
import type { NodeStatus } from "~/core/api/types";
import { cn } from "~/lib/utils";
import { MotionDurations, MotionEasings, Transitions } from "~/styles/motion-tokens";

import type { WorkflowNodeData } from "./LayoutUtils";

type CustomNodeType = ReactFlowNode<WorkflowNodeData>;

const ICON_ACCENTS: Record<NodeStatus, string> = {
  "Not Started":
    "border-dashed border-border/70 bg-muted/40 text-muted-foreground",
  Executing:
    "border-[hsl(var(--primary))/0.4] bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))]",
  "Awaiting HITL Approval":
    "border-[hsl(var(--warning))/0.45] bg-[hsl(var(--warning))/0.12] text-[hsl(var(--warning))]",
  Completed:
    "border-[hsl(var(--success))/0.4] bg-[hsl(var(--success))/0.12] text-[hsl(var(--success))]",
  Failed:
    "border-[hsl(var(--destructive))/0.45] bg-[hsl(var(--destructive))/0.12] text-[hsl(var(--destructive))]",
  Canceled: "border-orange-400/40 bg-orange-500/10 text-orange-500",
};

const STATUS_BORDER: Partial<Record<NodeStatus, string>> = {
  Executing: "border-[hsl(var(--primary))/0.6]",
  "Awaiting HITL Approval": "border-[hsl(var(--warning))/0.8]",
  Failed: "border-[hsl(var(--destructive))/0.8]",
  Canceled: "border-orange-500/70",
};

const STAGGER_INTERVAL = 0.05;

function StatusGlyph({
  status,
  prefersReducedMotion,
}: {
  status: NodeStatus;
  prefersReducedMotion: boolean;
}) {
  const { icon: Icon, iconClassName } = getStatusVisual(status);

  return (
    <motion.div
      layout={!prefersReducedMotion}
      transition={{ layout: Transitions.layout }}
      className={cn(
        "flex size-9 items-center justify-center rounded-lg border",
        "shadow-inner transition-colors duration-300",
        ICON_ACCENTS[status],
      )}
      aria-hidden="true"
    >
      <AnimatePresence mode="wait" initial={false}>
        {Icon ? (
          <motion.span
            key={status}
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, rotate: -6, scale: 0.95 }
            }
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, rotate: 6, scale: 0.95 }
            }
            transition={Transitions.standard}
            className="flex items-center justify-center"
          >
            <Icon className={cn("size-5", iconClassName)} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function CustomNode({ data, selected }: NodeProps<CustomNodeType>) {
  const prefersReducedMotion = useReducedMotion();
  const isExecuting = data.status === "Executing";
  const isAwaitingHitl = data.status === "Awaiting HITL Approval";
  const animationDelay = (data.animationIndex ?? 0) * STAGGER_INTERVAL;

  const badge = (
    <StatusBadge status={data.status} className="max-w-[150px]" />
  );

  return (
    <motion.div
      layout={!prefersReducedMotion}
      initial={
        prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        ...(prefersReducedMotion
          ? {}
          : {
              ...Transitions.enter,
              delay: animationDelay,
            }),
        layout: Transitions.layout,
      }}
      className="relative flex flex-col items-center gap-0"
    >
      <Handle type="target" position={Position.Top} />
      <Card
        className={cn(
          "relative flex w-[260px] flex-col gap-0 rounded-lg border border-border/70 bg-card/95 p-0 shadow-md transition-all duration-200",
          "hover:border-accent/60 hover:shadow-lg",
          STATUS_BORDER[data.status],
          isExecuting && "shadow-lg",
          selected && "border-primary ring-2 ring-ring shadow-xl",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isExecuting ? (
            <motion.div
              key="border-beam"
              className="absolute inset-0"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={{
                duration: MotionDurations.medium,
                ease: MotionEasings.standard,
              }}
            >
              <BorderBeam
                size={320}
                duration={5}
                delay={0.2}
                colorFrom="#1e40af"
                colorTo="#3b82f6"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {data.is_stale ? <StalenessIndicator /> : null}

        <div className="relative flex items-center gap-3 px-3 py-3">
          <StatusGlyph status={data.status} prefersReducedMotion={prefersReducedMotion} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {data.name}
            </p>
            <p className="truncate text-xs font-mono text-muted-foreground/80">
              {data.definition_id}
            </p>
          </div>
          {isAwaitingHitl && !prefersReducedMotion ? (
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [1, 0.85, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: MotionEasings.standard,
              }}
            >
              {badge}
            </motion.div>
          ) : (
            badge
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 bg-muted/10 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="truncate font-semibold text-foreground/80">
            {data.stage_name}
          </span>
          <span className="truncate text-right">{data.phaseName}</span>
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </motion.div>
  );
}
