// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  useProjectDetail,
  useStartWorkflow,
} from "~/features/dashboard/hooks/useProjects";
import { ProjectDetailsCard } from "~/features/workspace/config/ProjectDetailsCard";
import { ProjectFilesCard } from "~/features/workspace/config/ProjectFilesCard";
import { useParams, useRouter } from "~/navigation";

export default function ProjectConfigPage() {
  const router = useRouter();
  const params = useParams<{ projectId?: string }>();
  const projectIdParam = params?.projectId;
  const projectId = Number(projectIdParam);
  const isValidProjectId = Number.isFinite(projectId);

  const {
    data: project,
    isLoading,
    isError,
    refetch,
  } = useProjectDetail(isValidProjectId ? projectId : null, {
    enabled: isValidProjectId,
  });

  const startWorkflowMutation = useStartWorkflow();

  useEffect(() => {
    if (project?.status === "Running") {
      router.push(`/projects/${project.id}/flow`);
    }
  }, [project, router]);

  const hasProblemDescriptionFile =
    project?.files.some((file) => file.role === "Problem Description") ?? false;
  const isConfiguring = project?.status === "Configuring";
  const canStartWorkflow = Boolean(isConfiguring && hasProblemDescriptionFile);

  const handleStartWorkflow = () => {
    if (!project || !isConfiguring) {
      return;
    }
    startWorkflowMutation.mutate(project.id);
  };

  if (!isValidProjectId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Project</CardTitle>
            <CardDescription>
              The provided project identifier is not valid.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <ProjectConfigSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Unable to load project</CardTitle>
            <CardDescription>
              Something went wrong while fetching this project. Please try
              again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!project) {
    return <ProjectConfigSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Configure Project
        </h1>
        <p className="text-muted-foreground">
          Update project metadata, upload the required files, and start the
          workflow when ready.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProjectDetailsCard project={project} />
          <ProjectFilesCard project={project} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Start Workflow</CardTitle>
              <CardDescription>
                Ensure a Problem Description file is uploaded before launching
                the workflow. Projects that are already running or completed
                cannot be relaunched.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isConfiguring
                  ? "The workflow becomes available once the Problem Description file is present. Upload it in the Project Files section if you haven’t already."
                  : "This project has already moved past the configuration stage. Review the workflow instead of relaunching it."}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={!canStartWorkflow || startWorkflowMutation.isPending}
                onClick={handleStartWorkflow}
              >
                {startWorkflowMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isConfiguring
                  ? hasProblemDescriptionFile
                    ? "Launch Workflow"
                    : "Awaiting Problem Description"
                  : project.status === "Running"
                    ? "Workflow In Progress"
                    : "Workflow Completed"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProjectConfigSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
