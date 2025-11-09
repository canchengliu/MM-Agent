// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AlertCircle, Info } from "lucide-react";
import { useMemo, type ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { useCheckpointDetail } from "~/core/api/hooks/useWorkflow";
import type { StateSnapshotDetailResponse } from "~/core/api/models/workflow";
import {
  PanelContainer,
  PanelContent,
  PanelHeader,
} from "../panel-placeholders";
import { useWorkspaceStore } from "~/core/store/workspace-store";

import { HistoryReviewBanner } from "./history-review-banner";
import { ExecutionStage } from "./execution-stage";

export const MainStage = () => {
  const projectId = useWorkspaceStore((state) => state.projectId);
  const uiMode = useWorkspaceStore((state) => state.uiMode);
  const selectedHistoryCheckpointId = useWorkspaceStore(
    (state) => state.selectedHistoryCheckpointId,
  );
  const selectedHistoryThreadId = useWorkspaceStore(
    (state) => state.selectedHistoryThreadId,
  );

  const isHistoryReview = uiMode === "history_review";
  const canLoadSnapshot =
    isHistoryReview &&
    Boolean(projectId && selectedHistoryThreadId && selectedHistoryCheckpointId);

  const {
    data: historySnapshot,
    isLoading: isLoadingSnapshot,
    isFetching: isFetchingSnapshot,
    error: historyError,
  } = useCheckpointDetail(
    projectId ?? "",
    selectedHistoryThreadId ?? "",
    selectedHistoryCheckpointId ?? "",
  );

  const shouldShowHistory = isHistoryReview;
  const showLoadingState = canLoadSnapshot && (isLoadingSnapshot || isFetchingSnapshot) && !historySnapshot;

  let content: ReactNode = <ExecutionStage />;

  if (!projectId) {
    content = <Skeleton className="h-full w-full rounded-none" />;
  } else if (shouldShowHistory) {
    if (!selectedHistoryCheckpointId || !selectedHistoryThreadId) {
      content = (
        <PanelContent>
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
            <Info className="h-6 w-6 text-muted-foreground/80" aria-hidden />
            <div>
              <p className="font-semibold text-foreground">History mode active</p>
              <p className="mt-1 text-xs">
                Select a checkpoint from the History Graph to inspect its snapshot in read-only mode.
              </p>
            </div>
          </div>
        </PanelContent>
      );
    } else if (showLoadingState) {
      content = (
        <div className="flex h-full flex-col gap-4 p-4">
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-full w-full flex-1 rounded-md" />
        </div>
      );
    } else if (historyError) {
      const errorMessage =
        historyError instanceof Error
          ? historyError.message
          : "Snapshot unavailable. Please try another checkpoint.";
      content = (
        <PanelContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to load snapshot</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </PanelContent>
      );
    } else if (historySnapshot) {
      content = (
        <div className="flex h-full flex-col overflow-hidden">
          <HistoryReviewBanner snapshot={historySnapshot} />
          <div className="flex-1 overflow-auto p-4">
            <HistorySnapshotViewer snapshot={historySnapshot} />
          </div>
        </div>
      );
    } else {
      content = (
        <PanelContent>
          <Alert>
            <AlertTitle>No data yet</AlertTitle>
            <AlertDescription>
              We could not find snapshot data for checkpoint {selectedHistoryCheckpointId}.
            </AlertDescription>
          </Alert>
        </PanelContent>
      );
    }
  }

  return (
    <PanelContainer>
      <PanelHeader title="[B] Main Stage" />
      {content}
    </PanelContainer>
  );
};

const HistorySnapshotViewer = ({ snapshot }: { snapshot: StateSnapshotDetailResponse }) => {
  const formattedValues = useMemo(() => JSON.stringify(snapshot.values, null, 2), [snapshot.values]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card/80 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Thread</p>
            <p className="font-mono text-xs text-foreground">{snapshot.thread_id}</p>
          </div>
          <Badge variant="secondary">Step {snapshot.step_index}</Badge>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Snapshot values are read-only. Return to live execution to resume editing.
        </p>
      </div>

      <div className="rounded-lg border bg-background p-4 text-sm">
        <p className="text-xs font-semibold uppercase text-muted-foreground">State Values</p>
        <pre className="mt-2 max-h-[60vh] overflow-auto rounded-md bg-muted/40 p-3 text-xs font-mono">
          {formattedValues}
        </pre>
      </div>
    </div>
  );
};
