// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cva } from "class-variance-authority";
import { format } from "date-fns";
import {
  AlertTriangle,
  GitBranch,
  Info,
  Link,
  Zap,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { useCheckpointDetail, workflowKeys } from "~/core/api/hooks/useWorkflow";
import type {
  ExecutionHistoryGraphResponse,
  HistoryNodeData,
  StateSnapshotDetailResponse,
} from "~/core/api/models/workflow";
import { useWorkspaceStore } from "~/core/store/workspace-store";

import { ArtifactList } from "./artifact-list";

type ProvenanceBadgeStatus =
  | "EXECUTED"
  | "GRAFTED"
  | "INITIAL"
  | "INTERRUPTED"
  | "ERROR"
  | "UNKNOWN";

const provenanceVariants = cva(
  "flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold",
  {
    variants: {
      status: {
        EXECUTED: "border-blue-500 text-blue-700 dark:text-blue-200",
        GRAFTED: "border-dashed border-purple-500 text-purple-700 dark:text-purple-200",
        INITIAL: "border-green-500 text-green-700 dark:text-green-200",
        INTERRUPTED: "border-amber-500 text-amber-700 dark:text-amber-200",
        ERROR: "border-destructive text-destructive",
        UNKNOWN: "border-muted-foreground/40 text-muted-foreground",
      },
    },
    defaultVariants: { status: "UNKNOWN" },
  },
);

const ProvenanceIcon = ({ status }: { status: ProvenanceBadgeStatus }) => {
  switch (status) {
    case "EXECUTED":
      return <Zap className="h-3 w-3" aria-hidden />;
    case "GRAFTED":
      return <Link className="h-3 w-3" aria-hidden />;
    case "INITIAL":
      return <GitBranch className="h-3 w-3" aria-hidden />;
    case "ERROR":
    case "INTERRUPTED":
      return <AlertTriangle className="h-3 w-3" aria-hidden />;
    default:
      return null;
  }
};

const DetailItem = ({
  label,
  value,
  monospace = false,
}: {
  label: string;
  value: ReactNode;
  monospace?: boolean;
}) => (
  <div className="flex items-start justify-between gap-3 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span
      className={
        monospace ? "font-mono text-xs text-foreground break-all" : "text-foreground"
      }
      title={typeof value === "string" ? value : undefined}
    >
      {value ?? "—"}
    </span>
  </div>
);

const useSnapshotDetail = (
  projectId: string | null,
  threadId: string | null,
  checkpointId: string | null,
) => {
  return useCheckpointDetail(projectId ?? "", threadId ?? "", checkpointId ?? "");
};

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) {
    return "Unknown";
  }

  try {
    return format(new Date(timestamp), "PPpp");
  } catch {
    return timestamp;
  }
};

export const NodeInspector = () => {
  const {
    projectId,
    selectedHistoryCheckpointId,
    selectedHistoryThreadId,
    selectHistoryNode,
  } = useWorkspaceStore((state) => ({
    projectId: state.projectId,
    selectedHistoryCheckpointId: state.selectedHistoryCheckpointId,
    selectedHistoryThreadId: state.selectedHistoryThreadId,
    selectHistoryNode: state.selectHistoryNode,
  }));

  const queryClient = useQueryClient();
  const { data: snapshot, isLoading, error } = useSnapshotDetail(
    projectId,
    selectedHistoryThreadId,
    selectedHistoryCheckpointId,
  );

  const graphData = useMemo(() => {
    if (!projectId || !selectedHistoryThreadId) {
      return null;
    }

    return queryClient.getQueryData<ExecutionHistoryGraphResponse>(
      workflowKeys.historyGraph(projectId, selectedHistoryThreadId),
    );
  }, [projectId, queryClient, selectedHistoryThreadId]);

  const nodeData: HistoryNodeData | undefined = graphData?.nodes.find(
    (node) => node.id === selectedHistoryCheckpointId,
  )?.data;

  if (!selectedHistoryCheckpointId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
        <Info className="h-6 w-6 text-muted-foreground/70" aria-hidden />
        <p>Select a node from the history graph to inspect details.</p>
      </div>
    );
  }

  if (isLoading && !snapshot) {
    return <NodeInspectorSkeleton />;
  }

  if (error || !snapshot) {
    const description =
      error instanceof Error ? error.message : "Unable to load snapshot details.";
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Failed to load snapshot</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const provenanceStatus: ProvenanceBadgeStatus =
    (nodeData?.provenance_status?.toUpperCase() as ProvenanceBadgeStatus) ?? "UNKNOWN";
  const sourceCheckpointId = nodeData?.source_checkpoint_id ?? null;
  const executedNodes = nodeData?.executed_nodes ?? [];

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-5">
        <header>
          <h3 className="text-lg font-semibold">{nodeData?.label ?? `Step ${snapshot.step_index}`}</h3>
          <p className="font-mono text-xs text-muted-foreground">{snapshot.checkpoint_id}</p>
        </header>

        <section>
          <h4 className="text-sm font-semibold text-muted-foreground">Metadata</h4>
          <div className="mt-2 space-y-2 rounded-lg border bg-muted/40 p-3">
            <DetailItem label="Timestamp" value={formatTimestamp(snapshot.timestamp)} />
            <DetailItem label="Step index" value={snapshot.step_index} />
            <DetailItem label="Thread ID" value={snapshot.thread_id} monospace />
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-muted-foreground">Provenance</h4>
            <Badge variant="outline" className={provenanceVariants({ status: provenanceStatus })}>
              <ProvenanceIcon status={provenanceStatus} />
              {provenanceStatus}
            </Badge>
          </div>
          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            {sourceCheckpointId ? (
              <DetailItem
                label="Derived from"
                value={
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 font-mono text-xs"
                    onClick={() => {
                      if (selectedHistoryThreadId && sourceCheckpointId) {
                        selectHistoryNode(selectedHistoryThreadId, sourceCheckpointId);
                      }
                    }}
                  >
                    {sourceCheckpointId.slice(0, 8)}…
                  </Button>
                }
              />
            ) : (
              <DetailItem label="Derived from" value="—" />
            )}

            {executedNodes.length ? (
              <div className="text-sm">
                <p className="text-muted-foreground">Executed nodes</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {executedNodes.map((node) => (
                    <Badge key={node} variant="secondary" className="font-mono text-[11px]">
                      {node}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <Separator />

        <section>
          <h4 className="text-sm font-semibold text-muted-foreground">Artifacts</h4>
          <ArtifactList snapshotId={snapshot.checkpoint_id} />
        </section>
      </div>
    </ScrollArea>
  );
};

const NodeInspectorSkeleton = () => (
  <div className="space-y-4 p-5">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <Skeleton className="h-5 w-1/3" />
    <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);
