"use client";

import { Loader2 } from "lucide-react";

import { useProjectDetail } from "~/features/dashboard/hooks/useProjects";
import { CanvasContainer } from "~/features/workspace/canvas/CanvasContainer";

export default function FlowPage({ params }: { params: { projectId: string } }) {
  const projectId = Number(params.projectId);
  const { data: project, isLoading, isError } = useProjectDetail(projectId);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex h-full w-full items-center justify-center text-destructive">
        Failed to load project flow.
      </div>
    );
  }

  const workflowId = project.workflow_instance_id;

  if (!workflowId) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        Workflow is not yet initialized for this project.
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background">
      <CanvasContainer workflowId={workflowId} />
    </div>
  );
}
