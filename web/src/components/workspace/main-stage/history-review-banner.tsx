// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { ArrowRight, Clock3 } from "lucide-react";
import { format } from "date-fns";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import type { StateSnapshotDetailResponse } from "~/core/api/models/workflow";
import { useWorkspaceStore } from "~/core/store/workspace-store";

interface HistoryReviewBannerProps {
  snapshot: StateSnapshotDetailResponse;
}

/**
 * Prominent banner shown while inspecting history mode snapshots.
 * Highlights read-only status and offers a direct path back to live execution.
 */
export const HistoryReviewBanner = ({ snapshot }: HistoryReviewBannerProps) => {
  const returnToLiveMode = useWorkspaceStore((state) => state.returnToLiveMode);

  const formattedTime = snapshot.timestamp
    ? format(new Date(snapshot.timestamp), "PPpp")
    : "Unknown time";
  const shortId = snapshot.checkpoint_id ? `${snapshot.checkpoint_id.slice(0, 8)}…` : "N/A";
  const label =
    (snapshot.metadata?.label as string | undefined) ??
    (snapshot.metadata?.step_label as string | undefined) ??
    `Step ${snapshot.step_index}`;

  return (
    <div className="sticky top-0 z-20 shadow-sm">
      <Alert className="rounded-none border-b-2 border-amber-500 bg-amber-50/95 text-amber-900 backdrop-blur dark:border-amber-400 dark:bg-amber-900/40 dark:text-amber-50">
        <div className="flex flex-wrap items-center justify-between gap-4 px-2 py-2 sm:px-4">
          <div className="flex flex-1 items-center gap-3">
            <Clock3 className="h-6 w-6 text-amber-600 dark:text-amber-300" aria-hidden />
            <div>
              <AlertTitle className="text-base font-semibold">
                History review (read-only)
              </AlertTitle>
              <AlertDescription className="text-sm">
                Viewing <span className="font-medium">{label}</span> • {formattedTime} •{" "}
                <span className="font-mono text-xs uppercase">ID: {shortId}</span>
              </AlertDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="default"
            onClick={returnToLiveMode}
            className="shrink-0 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-slate-900"
          >
            Return to live
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Button>
        </div>
      </Alert>
    </div>
  );
};
