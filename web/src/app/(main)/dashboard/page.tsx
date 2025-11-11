"use client";

import { FilePlus2 } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "~/components/ui/skeleton";
import type { ProjectSummaryRead } from "~/core/domain/project.types";
import { CreateProjectDialog } from "~/features/dashboard/components/CreateProjectDialog";
import { ProjectCard } from "~/features/dashboard/components/ProjectCard";
import { useProjectList } from "~/features/dashboard/hooks/useProjects";

function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full mt-16 flex flex-col items-center justify-center gap-4 text-center">
      <FilePlus2 className="h-16 w-16 text-muted-foreground/50" strokeWidth={1} />
      <h3 className="text-xl font-semibold">No Projects Yet</h3>
      <p className="max-w-xs text-muted-foreground">
        Start your first modeling exploration by creating a new project.
      </p>
      <div className="mt-4">
        <CreateProjectDialog />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useProjectList();
  const projects = data?.items ?? [];

  const getProjectLink = (project: ProjectSummaryRead): string => {
    return project.status === "Configuring"
      ? `/projects/${project.id}/config`
      : `/projects/${project.id}/flow`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your active and completed workflow projects.
          </p>
        </div>
        {(isLoading || projects.length > 0) && <CreateProjectDialog />}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && (
          <>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </>
        )}

        {!isLoading && projects.length === 0 && <EmptyState />}

        {!isLoading &&
          projects.map((project) => (
            <Link
              key={project.id}
              href={getProjectLink(project)}
              className="group no-underline"
            >
              <ProjectCard project={project} />
            </Link>
          ))}
      </div>
    </div>
  );
}
