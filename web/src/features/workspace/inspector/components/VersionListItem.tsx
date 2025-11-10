// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Check, Rocket } from "lucide-react";
import type { MouseEvent } from "react";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { NodeVersionSummaryRead } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { useActivateVersion } from "~/features/workspace/hooks/useNodeActions";
import { cn } from "~/lib/utils";

interface VersionListItemProps {
  version: NodeVersionSummaryRead;
  nodeId: number;
  workflowId: number;
  isActiveVersion: boolean;
}

export function VersionListItem({
  version,
  nodeId,
  workflowId,
  isActiveVersion,
}: VersionListItemProps) {
  const { inspectedVersionId, inspectVersion } = useWorkspaceStore(
    useShallow((state) => ({
      inspectedVersionId: state.inspectedVersionId,
      inspectVersion: state.inspectVersion,
    })),
  );
  const activateVersionMutation = useActivateVersion();

  const isInspected = version.id === inspectedVersionId;

  const handleActivate = (event: MouseEvent) => {
    event.stopPropagation();
    activateVersionMutation.mutate({
      nodeId,
      versionId: version.id,
      workflowId,
      versionNumber: version.version_number,
    });
  };

  const formattedDate = new Date(version.created_at).toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isInspected}
      onClick={() => inspectVersion(version.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inspectVersion(version.id);
        }
      }}
      className={cn(
        "flex w-full cursor-pointer flex-col items-start gap-1.5 rounded-lg p-3 text-left transition-colors",
        "hover:bg-accent",
        isInspected && "bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <p className="font-semibold">Version {version.version_number}</p>
        {isActiveVersion ? (
          <Badge variant="secondary" className="border border-green-500/30">
            <Check className="mr-1 h-3 w-3 text-green-500" />
            Active
          </Badge>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={handleActivate}
            disabled={activateVersionMutation.isPending}
            aria-label={`Activate version ${version.version_number}`}
          >
            <Rocket className="mr-1 h-3 w-3" />
            Activate
          </Button>
        )}
      </div>
      <p className="line-clamp-2 w-full text-xs text-muted-foreground">
        {version.summary ?? "No summary provided."}
      </p>
      <div className="mt-1 flex w-full items-center justify-between text-xs text-muted-foreground">
        <Badge variant="outline" className="font-mono text-xs">
          {version.source}
        </Badge>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}
