"use client";

import { Loader2, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  useProjectDetail,
  useStartWorkflow,
} from "~/features/dashboard/hooks/useProjects";
import { FileManager } from "~/features/workspace/config/components/FileManager";
import { ProjectInfoForm } from "~/features/workspace/config/components/ProjectInfoForm";

export default function ProjectConfigPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = Number(params.projectId);
  const router = useRouter();
  const { data: project, isLoading, isError } = useProjectDetail(projectId);

  const { mutate: startWorkflow, isPending: isStarting } = useStartWorkflow();

  const canStart = useMemo(() => {
    if (!project) return false;
    const hasProblemDescription = project.files.some(
      (file) => file.role === "Problem Description",
    );
    const hasProblemType = project.problem_type !== "-";
    return hasProblemDescription && hasProblemType;
  }, [project]);

  const handleStartWorkflow = () => {
    if (!canStart) {
      toast.error("Cannot start workflow.", {
        description:
          'A "Problem Description" file and a "Problem Type" are required before starting.',
      });
      return;
    }
    startWorkflow(projectId, {
      onSuccess: () => {
        router.push(`/projects/${projectId}/flow`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="text-center text-destructive">
        Error loading project. It may not exist or you may not have access.
      </div>
    );
  }

  if (project.status !== "Configuring") {
    router.replace(`/projects/${projectId}/flow`);
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Redirecting to workflow...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            You are in configuration mode. Set up your project and start the
            workflow.
          </p>
        </div>
        <Button
          onClick={handleStartWorkflow}
          disabled={!canStart || isStarting}
          size="lg"
        >
          {isStarting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Play className="mr-2 h-5 w-5" />
          )}
          Start Workflow
        </Button>
      </div>

      <ProjectInfoForm project={project} />
      <FileManager project={project} />
    </div>
  );
}
