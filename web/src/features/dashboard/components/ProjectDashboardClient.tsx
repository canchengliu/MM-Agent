// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AlertCircle, PlusIcon, RefreshCcw } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useProjectList } from "~/features/dashboard/hooks/useProjects";

import { CreateProjectDialog } from "./CreateProjectDialog";
import { EmptyState } from "./EmptyState";
import { ProjectCard } from "./ProjectCard";
import { ProjectCardSkeleton } from "./ProjectCardSkeleton";

export function ProjectDashboardClient() {
  const { data, isLoading, isError, refetch, error } = useProjectList({
    limit: 100,
  });
  const hasProjects = !isLoading && (data?.items.length ?? 0) > 0;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "We couldn’t load your projects. Please try again."}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      );
    }

    if (!hasProjects) {
      return <EmptyState />;
    }

    return (
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.items.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto flex h-full flex-col p-4 md:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your modeling workspaces and monitor workflow progress.
          </p>
        </div>
        {hasProjects && (
          <CreateProjectDialog
            trigger={
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                New Project
              </Button>
            }
          />
        )}
      </header>
      <main className="flex flex-grow">{renderContent()}</main>
    </div>
  );
}
