// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { AlertTriangle, Pencil, RotateCw } from "lucide-react";
import * as React from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { NodeDetailView } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import {
  useReExecuteNode,
  useRetryNode,
} from "~/features/workspace/hooks/useNodeActions";

import { DetailRow } from "./DetailRow";
import { ExecutionDialog } from "./ExecutionDialog";

interface CurrentVersionTabProps {
  node: NodeDetailView;
}

export function CurrentVersionTab({ node }: CurrentVersionTabProps) {
  const [isReExecuteOpen, setReExecuteOpen] = React.useState(false);
  const [isRetryOpen, setRetryOpen] = React.useState(false);
  const startEditing = useWorkspaceStore((state) => state.startEditingNode);

  const { mutate: reExecute, isPending: isReExecuting } = useReExecuteNode();
  const { mutate: retry, isPending: isRetrying } = useRetryNode();

  const handleReExecute = (comments: string | null) => {
    reExecute({
      nodeId: node.id,
      payload: {
        modification_comments: comments,
        base_version_id: node.active_version_id,
      },
    });
    setReExecuteOpen(false);
  };

  const handleRetry = (comments: string | null) => {
    retry({
      nodeId: node.id,
      payload: { modification_comments: comments },
    });
    setRetryOpen(false);
  };

  const isBusy = isReExecuting || isRetrying;

  const canReExecute =
    node.status === "Completed" && node.node_type !== "Generator";
  const canRetry = node.status === "Failed";
  const canManualEdit =
    node.status === "Completed" && node.node_type !== "Generator";

  const formattedDate = node.active_version
    ? new Date(node.active_version.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const formattedTime = node.active_version
    ? new Date(node.active_version.created_at).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Node Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <DetailRow label="ID">
            <span className="font-mono">{node.definition_id}</span>
          </DetailRow>
          <DetailRow label="Status">
            <Badge variant="outline">{node.status}</Badge>
          </DetailRow>
          <DetailRow label="HITL Mode">
            <Badge variant="secondary">{node.hitl_mode}</Badge>
          </DetailRow>
        </CardContent>
        {canRetry && (
          <CardFooter className="border-t pt-4">
            <ExecutionDialog
              open={isRetryOpen}
              onOpenChange={setRetryOpen}
              isLoading={isBusy}
              onSubmit={handleRetry}
              title="Retry Failed Node"
              description="Provide optional feedback or simply retry the execution with the same parameters."
              buttonText="Retry"
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  className="border-amber-600/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              }
            />
          </CardFooter>
        )}
      </Card>

      {node.active_version ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Active Version (v{node.active_version.version_number})
            </CardTitle>
            <CardDescription>
              {node.active_version.summary ?? "No summary provided."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow label="Source">
              <Badge variant="outline">{node.active_version.source}</Badge>
            </DetailRow>
            <DetailRow label="Created">
              <span>
                {formattedDate}, {formattedTime}
              </span>
            </DetailRow>
          </CardContent>
          {(canReExecute || canManualEdit) && (
            <CardFooter className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              {canReExecute && (
                <ExecutionDialog
                  open={isReExecuteOpen}
                  onOpenChange={setReExecuteOpen}
                  isLoading={isBusy}
                  onSubmit={handleReExecute}
                  title="Re-execute Node"
                  description="Provide new instructions to generate an alternative version of this node's output. Leave blank to run with the same inputs."
                  buttonText="Re-execute"
                  trigger={
                    <Button variant="outline" size="sm" disabled={isBusy}>
                      <RotateCw className="mr-2 h-4 w-4" />
                      Re-execute
                    </Button>
                  }
                />
              )}
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isBusy || !canManualEdit}
                        onClick={() => startEditing(node.id)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Manual Edit
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!canManualEdit && (
                    <TooltipContent>
                      <p>Generator nodes cannot be manually edited.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          )}
        </Card>
      ) : !canRetry ? (
        <Card className="flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            This node has no active version.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

export function CurrentVersionTabSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-2/5" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
