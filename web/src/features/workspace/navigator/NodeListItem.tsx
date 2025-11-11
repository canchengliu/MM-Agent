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

import { BorderBeam } from "~/components/magicui/border-beam";
import type { NodeInstanceRead, StalenessInfo } from "~/core/domain/node.types";
import { cn } from "~/lib/utils";

import { StalenessIndicator } from "./StalenessIndicator";

interface NodeListItemProps {
  node: NodeInstanceRead;
  isStale: boolean;
  stalenessDetails: StalenessInfo[] | null;
  isFocused: boolean;
  onClick: () => void;
}

/**
 * A memoized component that renders the appropriate status icon
 * based on the node's lifecycle state. This follows Design Doc 3.1.2.1.
 */
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

/**
 * Displays a single node in the workflow navigator, reflecting its real-time status.
 */
export function NodeListItem({
  node,
  isStale,
  stalenessDetails,
  isFocused,
  onClick,
}: NodeListItemProps) {
  const isExecuting = node.status === "Executing";
  const isCompleted = node.status === "Completed";

  return (
    <div className="relative rounded-md">
      <button
        type="button"
        onClick={onClick}
        data-focused={isFocused}
        className={cn(
          "group w-full rounded-md border p-2 text-left transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
          isFocused
            ? "border-primary/50 bg-accent"
            : "border-transparent bg-card/60 hover:border-border hover:bg-accent/80",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <NodeStatusIcon status={node.status} />
            <span
              className="truncate text-sm font-medium"
              title={`${node.definition_id} - ${node.name}`}
            >
              {node.name}
            </span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {isCompleted && (
              <StalenessIndicator
                isStale={isStale}
                details={stalenessDetails}
              />
            )}
            <span className="hidden text-xs text-muted-foreground sm:block">
              {node.definition_id}
            </span>
          </div>
        </div>
      </button>

      {/* Visual State for "Executing" */}
      {isExecuting && (
        <BorderBeam
          size={80}
          duration={3}
          delay={0}
          colorFrom="hsl(var(--primary))"
          colorTo="hsl(var(--accent))"
        />
      )}
    </div>
  );
}
