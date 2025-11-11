"use client";

import { CheckCircle, Clock, Replace } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { NodeDetailView } from "~/core/domain/node.types";
import { useWorkspaceStore } from "~/core/store/workspace.store";
import { useActivateVersion } from "~/features/workspace/hooks/useNodeActions";
import { useNodeVersions } from "~/features/workspace/hooks/useWorkflowData";
import { cn } from "~/lib/utils";

interface HistoryTabProps {
  node: NodeDetailView;
  workflowId: number;
}

function HistoryItemSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="mt-2 flex justify-end gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

export function HistoryTab({ node, workflowId }: HistoryTabProps) {
  const { data: versions, isLoading, isError } = useNodeVersions(node.id);
  const { inspectedVersionId, inspectVersion } = useWorkspaceStore();
  const { mutate: activateVersion, isPending: isActivating } =
    useActivateVersion(workflowId);
  const isGenerator = node.node_type === "Generator";

  const handleActivate = (versionId: number) => {
    activateVersion({ nodeId: node.id, versionId });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <HistoryItemSkeleton />
        <HistoryItemSkeleton />
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load history.</p>;
  }

  if (!versions || versions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No historical versions for this node.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="mb-3 text-sm font-semibold">Revision History</h4>
      <ul className="space-y-3">
        {versions.map((version) => {
          const isInspected = inspectedVersionId === version.id;
          const isActive = node.active_version_id === version.id;
          return (
            <li
              key={version.id}
              className={cn(
                "flex h-auto w-full flex-col items-start rounded-md border p-3 text-left transition-all",
                isInspected ? "border-primary bg-accent shadow-md" : "bg-card/50",
              )}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <span className="font-semibold">
                  Version {version.version_number}
                </span>
                {isActive && (
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </div>
                )}
              </div>
              <p
                className="mt-1 line-clamp-2 text-xs text-muted-foreground"
                title={version.summary ?? ""}
              >
                {version.summary || "No summary provided."}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{new Date(version.created_at).toLocaleString()}</span>
              </div>
              <div className="mt-3 flex w-full justify-end gap-2 border-t border-border/50 pt-3">
                <div className="flex w-full items-start justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inspectVersion(version.id)}
                    disabled={isInspected}
                  >
                    Inspect
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-block">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleActivate(version.id)}
                            disabled={isActive || isActivating || isGenerator}
                          >
                            <Replace className="mr-2 h-4 w-4" />
                            {isActivating
                              ? "Activating..."
                              : isActive
                                ? "Active"
                                : "Activate"}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {isGenerator && (
                        <TooltipContent>
                          <p>
                            Generator nodes cannot have their versions changed.
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
