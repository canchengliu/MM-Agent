// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { AlertCircle, History } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkspaceStore } from "~/core/store";
import { useNodeVersions } from "~/features/workspace/hooks/useWorkflowData";

import { VersionListItem } from "./VersionListItem";

interface HistoryTabProps {
  activeVersionId: number | null;
  workflowId: number;
}

export function HistoryTab({ activeVersionId, workflowId }: HistoryTabProps) {
  const focusedNodeId = useWorkspaceStore((state) => state.focusedNodeId);

  if (!focusedNodeId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Select a node to view its version history.
        </CardContent>
      </Card>
    );
  }

  const {
    data: versions,
    isLoading,
    isError,
    error,
    refetch,
  } = useNodeVersions(focusedNodeId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load history."}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
          <History className="h-6 w-6" />
          <p>No historical versions found for this node.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {versions.map((version) => (
        <VersionListItem
          key={version.id}
          version={version}
          nodeId={focusedNodeId}
          workflowId={workflowId}
          isActiveVersion={version.id === activeVersionId}
        />
      ))}
    </div>
  );
}
