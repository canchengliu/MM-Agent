// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

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

import { BorderBeam } from "~/components/magicui/border-beam";
import { Button } from "~/components/ui/button";
import type { NodeInstanceRead } from "~/core/domain";
import { useWorkspaceStore, type WorkspaceState } from "~/core/store";
import { cn } from "~/lib/utils";

import { StalenessIndicator } from "./StalenessIndicator";

interface NodeListItemProps {
  node: NodeInstanceRead;
  workflowId: number;
}

type GlowConfig = {
  colorFrom: string;
  colorTo: string;
  duration: number;
  size?: number;
};

/**
 * Represents a single node in the Workflow Navigator and mirrors the
 * multi-state system defined in Design Doc 3.1.2.1.
 */
export const NodeListItem = memo(function NodeListItem({
  node,
  workflowId,
}: NodeListItemProps) {
  const focusedNodeId = useWorkspaceStore(
    (state: WorkspaceState) => state.focusedNodeId,
  );
  const focusNode = useWorkspaceStore(
    (state: WorkspaceState) => state.focusNode,
  );

  const isFocused = focusedNodeId === node.id;

  const visualState = useMemo(() => {
    let icon = Circle;
    let colorClass = "text-muted-foreground";
    let glow: GlowConfig | null = null;
    let iconAnimation = "";

    switch (node.status) {
      case "Not Started":
        icon = Circle;
        break;
      case "Executing":
        colorClass = "text-cyan-400";
        if (
          node.current_stage === "Queued" ||
          node.current_stage === "Initializing"
        ) {
          icon = Loader2;
          iconAnimation = "animate-spin";
          glow = {
            colorFrom: "hsl(var(--cyan-400))",
            colorTo: "hsl(var(--sky-500))",
            duration: 4,
          };
        } else {
          icon = Waves;
          iconAnimation = "animate-pulse";
          glow = {
            colorFrom: "hsl(var(--cyan-300))",
            colorTo: "hsl(var(--sky-400))",
            duration: 2,
            size: 80,
          };
        }
        break;
      case "Awaiting HITL Approval":
        if (isFocused) {
          icon = Hand;
          colorClass = "text-amber-400";
          glow = {
            colorFrom: "hsl(var(--amber-400))",
            colorTo: "hsl(var(--amber-500))",
            duration: 3,
          };
        } else {
          icon = PauseCircle;
          colorClass = "text-amber-500/80";
        }
        break;
      case "Completed":
        icon = CheckCircle;
        colorClass = "text-green-500";
        break;
      case "Failed":
        icon = AlertTriangle;
        colorClass = "text-red-500";
        glow = {
          colorFrom: "hsl(var(--red-500))",
          colorTo: "hsl(var(--red-600))",
          duration: 3,
        };
        break;
      default:
        icon = Circle;
        break;
    }

    return { icon, colorClass, glow, iconAnimation };
  }, [node.status, node.current_stage, isFocused]);

  const IconComponent = visualState.icon;

  return (
    <Button
      variant="ghost"
      className={cn(
        "relative h-auto w-full justify-start p-3 text-left transition-colors duration-200",
        isFocused && "bg-accent",
      )}
      onClick={() => focusNode(node.id)}
      aria-pressed={isFocused}
      data-node-id={node.id}
    >
      {visualState.glow && (
        <BorderBeam
          size={visualState.glow.size ?? 60}
          duration={visualState.glow.duration}
          delay={Math.random() * -2}
          colorFrom={visualState.glow.colorFrom}
          colorTo={visualState.glow.colorTo}
        />
      )}

      <IconComponent
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          visualState.colorClass,
          visualState.iconAnimation,
        )}
      />

      <div className="ml-3 flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{node.name}</p>
        <p className="text-xs text-muted-foreground">{node.definition_id}</p>
      </div>

      {node.status === "Completed" && (
        <StalenessIndicator nodeId={node.id} workflowId={workflowId} />
      )}
    </Button>
  );
});
