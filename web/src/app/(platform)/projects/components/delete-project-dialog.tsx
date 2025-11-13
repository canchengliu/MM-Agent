"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import type { ProjectSummaryRead } from "~/core/models/project.model";
import { useStore } from "~/core/store";

interface DeleteProjectDialogProps {
  project: ProjectSummaryRead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Confirmation dialog for deleting a project and its workflow history.
 */
export function DeleteProjectDialog({
  project,
  isOpen,
  onOpenChange,
}: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteProject = useStore((state) => state.deleteProject);

  const handleRequestChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isDeleting) {
        return;
      }
      onOpenChange(nextOpen);
    },
    [isDeleting, onOpenChange],
  );

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const success = await deleteProject(project.id);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Unexpected error during project deletion:", error);
      toast.error("An unexpected error occurred while deleting the project.");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteProject, onOpenChange, project.id]);

  return (
    <AlertDialog open={isOpen} onOpenChange={handleRequestChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete &ldquo;{project.name}&rdquo;?
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All project files, configurations, and
            workflow executions will be permanently removed.
            {project.status === "Running" ? (
              <p className="mt-4 rounded-md bg-destructive/10 p-3 font-semibold text-destructive">
                Warning: The associated running workflow will be terminated
                immediately.
              </p>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Forever"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
