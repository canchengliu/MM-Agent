"use client";

import {
  AlertTriangle,
  CheckCircle,
  Circle,
  Hand,
  HelpCircle,
  Loader2,
} from "lucide-react";
import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import { BorderBeam } from "~/components/magicui/border-beam";
import type { NodeInstanceRead, StalenessInfo } from "~/core/domain/node.types";
import { useWorkspaceStore } from "~/core/store/workspace.store";
import { StalenessIndicator } from "~/features/workspace/navigator/StalenessIndicator";
import { cn } from "~/lib/utils";

type ExecutionNodeData = NodeInstanceRead & {
  isStale?: boolean;
  stalenessDetails?: StalenessInfo[] | null;
} & Record<string, unknown>;

const NodeStatusIcon = React.memo(
  ({ status }: { status: NodeInstanceRead["status"] }) => {
    switch (status) {
      case "Not Started":
        return <Circle className="h-4 w-4 text-muted-foreground/60" />;
      case "Executing":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "Awaiting HITL Approval":
        return <Hand className="h-4 w-4 text-amber-500" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "Failed":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  },
);
NodeStatusIcon.displayName = "NodeStatusIcon";

export function ExecutionNode({ data }: NodeProps) {
  const nodeData = data as ExecutionNodeData | undefined;
  if (!nodeData) {
    return null;
  }
  const { focusNode, focusedNodeId } = useWorkspaceStore();
  const isFocused = focusedNodeId === nodeData.id;
  const isExecuting = nodeData.status === "Executing";
  const isCompleted = nodeData.status === "Completed";
  const isStale = Boolean(nodeData.isStale);
  const stalenessDetails = nodeData.stalenessDetails ?? null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isFocused}
      onClick={() => focusNode(nodeData.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          focusNode(nodeData.id);
        }
      }}
      className={cn(
        "relative w-[250px] cursor-pointer rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-all",
        isFocused
          ? "border-primary shadow-md"
          : "border-border/50 hover:border-primary/60",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <NodeStatusIcon status={nodeData.status} />
          <p
            className="truncate text-sm font-medium"
            title={`${nodeData.definition_id} - ${nodeData.name}`}
          >
            {nodeData.name}
          </p>
        </div>
        {isCompleted && (
          <StalenessIndicator isStale={isStale} details={stalenessDetails} />
        )}
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{nodeData.current_stage ?? "Idle"}</span>
        <span>#{nodeData.definition_id}</span>
      </div>

      <p className="mt-1 text-[11px] uppercase tracking-tight text-muted-foreground/80">
        HITL · {nodeData.hitl_mode} · Order {nodeData.order_index}
      </p>

      {isExecuting && (
        <BorderBeam
          size={110}
          duration={4}
          delay={0}
          colorFrom="hsl(var(--primary))"
          colorTo="hsl(var(--accent))"
        />
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !bg-border"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !bg-border"
      />
    </div>
  );
}
