// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useCallback, type ReactNode } from "react";
import { Activity, GitFork, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { useSwitchActiveBranch } from "~/core/api/hooks/useProjects";
import { useCreateBranch } from "~/core/api/hooks/useWorkflow";
import { useWorkspaceStore } from "~/core/store/workspace-store";

interface HistoryNodeContextMenuProps {
  children: ReactNode;
  projectId: string;
  threadId: string;
  checkpointId: string;
  isActiveBranch: boolean;
}

/**
 * Enables provenance actions (branch creation & switching) on history nodes.
 */
export const HistoryNodeContextMenu = ({
  children,
  projectId,
  threadId,
  checkpointId,
  isActiveBranch,
}: HistoryNodeContextMenuProps) => {
  const { mutateAsync: createBranch, isPending: isCreatingBranch } = useCreateBranch();
  const {
    mutate: switchBranch,
    mutateAsync: switchBranchAsync,
    isPending: isSwitchingBranch,
  } = useSwitchActiveBranch();

  const handleBranchCreated = useWorkspaceStore((state) => state.handleBranchCreated);
  const clearBranchContext = useWorkspaceStore((state) => state.clearBranchContext);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);
  const returnToLiveMode = useWorkspaceStore((state) => state.returnToLiveMode);

  const handleCreateBranch = useCallback(async () => {
    try {
      const result = await createBranch({
        projectId,
        data: {
          source_thread_id: threadId,
          rewind_checkpoint_id: checkpointId,
        },
      });

      const newBranchId = result.thread_id;

      try {
        await switchBranchAsync({ projectId, branchId: newBranchId });
        toast.success(
          `✓ 分支已创建。您现在正在探索新分支："${newBranchId.substring(0, 8)}"。`,
        );
      } catch (switchError) {
        console.error("Failed to switch to the newly created branch.", switchError);
        toast.error("Branch created, but failed to switch context. Please switch manually.");
      }

      handleBranchCreated(newBranchId, threadId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message || !message.includes("Failed to switch")) {
        console.error(error);
      }
    }
  }, [checkpointId, createBranch, handleBranchCreated, projectId, switchBranchAsync, threadId]);

  const handleSwitchBranch = useCallback(() => {
    switchBranch(
      { projectId, branchId: threadId },
      {
        onSuccess: () => {
          setViewMode("EXECUTION");
          returnToLiveMode();
          clearBranchContext();
        },
      },
    );
  }, [clearBranchContext, projectId, returnToLiveMode, setViewMode, switchBranch, threadId]);

  const isPending = isCreatingBranch || isSwitchingBranch;

  return (
    <>
      <ContextMenuTrigger asChild disabled={isPending}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={handleCreateBranch} disabled={isPending}>
          <GitFork className="mr-2 h-4 w-4" />
          从此创建新分支 (Branch from here)
          {isCreatingBranch ? <Loader2 className="ml-auto h-4 w-4 animate-spin" /> : null}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={handleSwitchBranch} disabled={isActiveBranch || isPending}>
          <Activity className="mr-2 h-4 w-4" />
          设为活动分支 (Set as Active Branch)
          {isSwitchingBranch && !isCreatingBranch ? (
            <Loader2 className="ml-auto h-4 w-4 animate-spin" />
          ) : null}
        </ContextMenuItem>
      </ContextMenuContent>
    </>
  );
};
