// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { memo, useMemo } from "react";
import { cva } from "class-variance-authority";
import { format } from "date-fns";
import {
  AlertTriangle,
  History as HistoryIcon,
  Link,
  Wrench,
  Zap,
} from "lucide-react";

import { Tooltip } from "~/components/deer-flow/tooltip";
import { ShineBorder } from "~/components/magicui/shine-border";
import { Badge } from "~/components/ui/badge";
import { ContextMenu } from "~/components/ui/context-menu";
import type { HistoryNodeData } from "~/core/api/models/workflow";
import { useWorkspaceStore } from "~/core/store/workspace-store";
import { cn } from "~/lib/utils";
import { HistoryNodeContextMenu } from "./history-node-context-menu";

const nodeVariants = cva(
  "relative flex w-64 flex-col items-start rounded-lg border bg-card/80 p-3 text-left shadow-lg backdrop-blur-md transition-all duration-200",
  {
    variants: {
      status: {
        EXECUTED: "border-primary/30",
        GRAFTED: "border-dashed border-accent-foreground/50",
        RESUMED: "border-primary/50",
        INITIAL: "border-muted-foreground/50",
        INTERRUPTED: "border-amber-500/70",
        ERROR: "border-destructive/70",
      },
      isSelected: {
        true: "ring-2 ring-ring shadow-xl",
        false: "",
      },
      isActiveBranch: {
        true: "",
        false: "opacity-70 hover:opacity-100",
      },
    },
    defaultVariants: {
      status: "EXECUTED",
      isSelected: false,
      isActiveBranch: false,
    },
  },
);

export type HistoryGraphNodeData = HistoryNodeData &
  Record<string, unknown> & {
    isActiveBranch: boolean;
    threadId: string;
  };
type HistoryFlowNode = Node<HistoryGraphNodeData>;
type HistoryGraphNodeProps = NodeProps<HistoryFlowNode>;

const statusConfig = {
  EXECUTED: { icon: Zap, label: "Executed", color: "text-primary" },
  GRAFTED: { icon: Link, label: "Grafted", color: "text-accent-foreground" },
  RESUMED: { icon: Wrench, label: "Resumed", color: "text-primary" },
  INITIAL: { icon: HistoryIcon, label: "Initial", color: "text-muted-foreground" },
  INTERRUPTED: { icon: AlertTriangle, label: "Interrupted", color: "text-amber-500" },
  ERROR: { icon: AlertTriangle, label: "Error", color: "text-destructive" },
} as const;

export const HistoryGraphNode = memo(({ data, selected, id }: HistoryGraphNodeProps) => {
  const { label, timestamp, provenance_status, step_index, isActiveBranch, threadId } = data;
  const config = statusConfig[provenance_status as keyof typeof statusConfig] ?? statusConfig.EXECUTED;
  const projectId = useWorkspaceStore((state) => state.projectId);

  const formattedTime = useMemo(() => {
    try {
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) {
        return "Invalid Timestamp";
      }
      return format(date, "PPp");
    } catch {
      return "Invalid Timestamp";
    }
  }, [timestamp]);

  const Icon = config.icon;

  const nodeContent = (
    <div className={cn(nodeVariants({ status: provenance_status, isSelected: selected, isActiveBranch }))}>
      {isActiveBranch ? (
        <ShineBorder
          className="rounded-lg"
          shineColor={["#4f46e5", "#06b6d4", "#10b981"]}
          duration={10}
          borderWidth={1}
        />
      ) : null}
      <div className="mb-2 flex w-full items-center justify-between">
        <span className="max-w-[80%] truncate text-sm font-medium">{label}</span>
        <Badge variant="secondary" className="text-xs">
          Step {step_index}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Tooltip title={config.label}>
          <span>
            <Icon className={cn("h-4 w-4", config.color)} aria-hidden />
          </span>
        </Tooltip>
        <span>{formattedTime}</span>
      </div>
    </div>
  );

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-border" />
      <Handle type="source" position={Position.Bottom} className="!bg-border" />
      {projectId && threadId ? (
        <ContextMenu>
          <HistoryNodeContextMenu
            projectId={projectId}
            threadId={threadId}
            checkpointId={id}
            isActiveBranch={isActiveBranch}
          >
            {nodeContent}
          </HistoryNodeContextMenu>
        </ContextMenu>
      ) : (
        nodeContent
      )}
    </>
  );
});

HistoryGraphNode.displayName = "HistoryGraphNode";
