// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AlertTriangleIcon, Loader2Icon, Trash2Icon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useDeleteProject } from "~/core/api/hooks/useProjects";
import type { ProjectRead } from "~/core/api/models/project";

interface DeleteProjectDialogProps {
  project: ProjectRead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProjectDialog({
  project,
  isOpen,
  onOpenChange,
}: DeleteProjectDialogProps) {
  const { mutate: deleteProject, isPending } = useDeleteProject();

  const handleDelete = () => {
    deleteProject(project.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!isPending) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <AlertTriangleIcon className="size-5 text-destructive" />
            确认删除项目？
          </DialogTitle>
          <DialogDescription>
            项目“<strong className="font-semibold">{project.name}</strong>”及其所有执行历史将被永久删除。此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                正在删除...
              </>
            ) : (
              <>
                <Trash2Icon className="mr-2 size-4" />
                永久删除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
