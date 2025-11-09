// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { GitBranch, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { useWorkspaceStore } from "~/core/store/workspace-store";
import { cn } from "~/lib/utils";

/**
 * Shows exploration context when user branches off history nodes.
 */
export const OrientationBanner = () => {
  const branchContext = useWorkspaceStore((state) => state.branchContext);
  const clearBranchContext = useWorkspaceStore((state) => state.clearBranchContext);
  const viewMode = useWorkspaceStore((state) => state.viewMode);

  if (!branchContext || viewMode !== "EXECUTION") {
    return null;
  }

  const { newBranchId, sourceBranchId } = branchContext;
  const shortNewId = newBranchId.substring(0, 8);
  const shortSourceId = sourceBranchId.substring(0, 8);

  return (
    <Alert
      className={cn(
        "relative border-indigo-500/50 bg-indigo-500/10 text-indigo-600 backdrop-blur-sm dark:text-indigo-400",
      )}
    >
      <GitBranch className="h-4 w-4 !text-indigo-600 dark:!text-indigo-400" />
      <AlertTitle className="font-semibold">正在探索新分支 (Exploring New Branch)</AlertTitle>
      <AlertDescription className="pr-10 text-sm">
        您当前位于分支{" "}
        <code className="rounded bg-indigo-500/20 p-0.5 font-mono text-xs">{shortNewId}</code>， 该分支创建自分支{" "}
        <code className="rounded bg-indigo-500/20 p-0.5 font-mono text-xs">{shortSourceId}</code>。
      </AlertDescription>
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearBranchContext}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss banner</span>
        </Button>
      </div>
    </Alert>
  );
};
