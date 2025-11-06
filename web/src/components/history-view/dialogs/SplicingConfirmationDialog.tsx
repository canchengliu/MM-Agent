// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { Loader2Icon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useComposeHistoryMutation } from "~/hooks/api/useProvenance";
import { useUiStore } from "~/store/uiStore";

interface SplicingConfirmationDialogProps {
  projectId?: string | null;
}

export function SplicingConfirmationDialog({
  projectId,
}: SplicingConfirmationDialogProps) {
  const { splicingState, setSplicingTarget } = useUiStore((state) => ({
    splicingState: state.splicingState,
    setSplicingTarget: state.setSplicingTarget,
  }));

  const target = splicingState?.target;
  const open = Boolean(target);

  const { mutate, isPending } = useComposeHistoryMutation({ projectId });

  if (!splicingState) {
    return null;
  }

  const { source } = splicingState;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSplicingTarget(null);
    }
  };

  const handleCancel = () => {
    setSplicingTarget(null);
  };

  const handleConfirm = () => {
    if (!target || isPending) {
      return;
    }
    mutate();
  };

  const sourceBranchLabel = source.threadName ?? source.threadId;
  const targetBranchLabel = target?.threadName ?? target?.threadId ?? "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认拼接历史结果</DialogTitle>
          <DialogDescription>
            {target ? (
              <>
                将把分支
                <span className="mx-1 font-semibold text-text-primary">
                  {targetBranchLabel}
                </span>
                自
                <span className="mx-1 font-semibold text-text-primary">
                  {target.label}
                </span>
                起的全部结果拼接到当前分支
                <span className="mx-1 font-semibold text-text-primary">
                  {sourceBranchLabel}
                </span>
                ，以
                <span className="mx-1 font-semibold text-text-primary">
                  {source.label}
                </span>
                为衔接点。确认继续吗？
              </>
            ) : (
              "请选择一个合法的历史节点以完成拼接。"
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            type="button"
            onClick={handleCancel}
            disabled={isPending}
          >
            取消
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin motion-reduce:animate-none" />
                正在拼接…
              </>
            ) : (
              "确认拼接"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
