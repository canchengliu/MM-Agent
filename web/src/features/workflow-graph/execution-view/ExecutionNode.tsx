// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  AlertTriangle,
  CheckCircle,
  Circle,
  Hand,
  Loader2,
  PauseCircle,
  Waves,
} from "lucide-react";
import { memo, useMemo } from "react";

import type { NodeInstanceRead } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { StalenessIndicator } from "~/features/workspace/navigator/StalenessIndicator";
import { cn } from "~/lib/utils";

export type ExecutionNodeData = NodeInstanceRead & {
  workflowId: number;
};

type VisualState = {
  icon: typeof Circle;
  accentClass: string;
  glowClass: string;
  iconAnimation?: string;
  badgeText: string;
};

/**
 * Custom React Flow node that mirrors the Navigator's visual logic,
 * ensuring a consistent mental model between the list and canvas views.
 */
export const ExecutionNode = memo(function ExecutionNode({
  data,
  id,
}: NodeProps<ExecutionNodeData>) {
  const focusedNodeId = useWorkspaceStore((state) => state.focusedNodeId);
  const focusNode = useWorkspaceStore((state) => state.focusNode);

  const isFocused = focusedNodeId === data.id;

  const visualState = useMemo<VisualState>(() => {
    let icon = Circle;
    let accentClass = "from-muted/50 to-muted";
    let glowClass = "shadow-none";
    let badgeText = data.current_stage;
    let iconAnimation = "";

    switch (data.status) {
      case "Not Started":
        badgeText = "Not Started";
        break;
      case "Executing":
        accentClass = "from-cyan-400/30 to-sky-500/30";
        glowClass = "shadow-[0_0_25px_rgba(34,211,238,0.35)]";
        icon = data.current_stage.match(/Queued|Initializing/)
          ? Loader2
          : Waves;
        iconAnimation = data.current_stage.match(/Queued|Initializing/)
          ? "animate-spin"
          : "animate-pulse";
        badgeText = data.current_stage;
        break;
      case "Awaiting HITL Approval":
        accentClass = "from-amber-400/30 to-amber-500/20";
        icon = data.hitl_mode ? Hand : PauseCircle;
        badgeText = "Awaiting Approval";
        break;
      case "Completed":
        accentClass = "from-emerald-400/30 to-emerald-500/20";
        icon = CheckCircle;
        badgeText = "Completed";
        break;
      case "Failed":
        accentClass = "from-red-500/25 to-red-600/20";
        glowClass = "shadow-[0_0_30px_rgba(248,113,113,0.4)]";
        icon = AlertTriangle;
        badgeText = "Failed";
        break;
      default:
        break;
    }

    return { icon, accentClass, glowClass, badgeText, iconAnimation };
  }, [data.status, data.current_stage, data.hitl_mode]);

  const Icon = visualState.icon;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-muted-foreground/40 !bg-background"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => focusNode(data.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            focusNode(data.id);
          }
        }}
        className={cn(
          "group relative flex h-full min-h-[120px] w-full min-w-[220px] cursor-pointer flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 text-left transition",
          isFocused && "border-primary shadow-lg shadow-primary/20",
          visualState.glowClass,
        )}
      >
        <div className="flex items-start justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            #{String(id).padStart(3, "0")}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium text-muted-foreground",
                isFocused && "text-primary",
              )}
            >
              {visualState.badgeText}
            </span>
            {data.status === "Completed" && (
              <StalenessIndicator
                nodeId={data.id}
                workflowId={data.workflowId}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br",
              visualState.accentClass,
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 text-primary",
                visualState.iconAnimation,
                data.status === "Failed" && "text-destructive",
                data.status === "Completed" && "text-emerald-500",
                data.status === "Executing" && "text-cyan-400",
                data.status === "Awaiting HITL Approval" &&
                  "text-amber-400 dark:text-amber-300",
              )}
            />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="truncate text-sm font-semibold">{data.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {data.definition_id}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{data.node_type}</span>
          <span>Order {data.order_index + 1}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-muted-foreground/40 !bg-background"
      />
    </>
  );
});
