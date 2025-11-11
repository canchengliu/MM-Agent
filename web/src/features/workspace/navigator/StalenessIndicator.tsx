"use client";

import { RefreshCcw } from "lucide-react";
import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { StalenessInfo } from "~/core/domain/node.types";

interface StalenessIndicatorProps {
  isStale: boolean;
  details: StalenessInfo[] | null;
}

/**
 * Displays a visual indicator when a node's inputs are "stale",
 * with a tooltip explaining the reason(s) in a structured list.
 */
export function StalenessIndicator({
  isStale,
  details,
}: StalenessIndicatorProps) {
  if (!isStale || !details?.length) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger
          asChild
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="flex items-center"
            aria-label="This node's inputs are stale"
          >
            <RefreshCcw className="h-3.5 w-3.5 animate-pulse text-amber-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="max-w-xs space-y-2 p-1">
            <p className="font-semibold">Inputs Have Changed</p>
            {details.map((info) => (
              <p
                key={info.upstream_node_id}
                className="text-xs text-muted-foreground"
              >
                Based on{" "}
                <strong className="text-foreground">
                  v{info.consumed_version_id}
                </strong>{" "}
                of node{" "}
                <strong className="text-foreground">
                  {info.upstream_definition_id}
                </strong>
                , but its active version is now{" "}
                <strong className="text-foreground">
                  v{info.current_active_version_id}
                </strong>
                .
              </p>
            ))}
            <p className="pt-2 text-xs font-medium">
              Re-execution is recommended to use the latest data.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
