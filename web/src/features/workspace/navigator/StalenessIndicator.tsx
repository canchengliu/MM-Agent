// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { RefreshCcw } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useStalenessReport } from "~/features/workspace/hooks/useWorkflowData";
import { cn } from "~/lib/utils";

interface StalenessIndicatorProps {
  nodeId: number;
  workflowId: number;
  className?: string;
}

/**
 * Warns the user when the completed node's inputs are stale.
 * Mirrors the "State Overlays: Stale" pattern from Design Doc 3.1.2.1.
 */
export function StalenessIndicator({
  nodeId,
  workflowId,
  className,
}: StalenessIndicatorProps) {
  const { data: stalenessReport } = useStalenessReport(workflowId, {
    staleTime: 60 * 1000,
  });

  const staleInfo = stalenessReport?.[String(nodeId)];

  if (!staleInfo || staleInfo.length === 0) {
    return null;
  }

  const tooltipContent = staleInfo
    .map(
      (info) =>
        `Input from node ${info.upstream_definition_id} has changed. This result is based on v${info.consumed_version_id}, but the active version is now v${info.current_active_version_id}.`,
    )
    .join("\n");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            tabIndex={0}
            role="button"
            aria-label="Stale node warning"
            className={cn(
              "relative flex cursor-pointer items-center rounded-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              className,
            )}
          >
            <RefreshCcw className="h-4 w-4 text-amber-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="whitespace-pre-wrap">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
