// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { ServerCrashIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useProjectsList } from "~/core/api/hooks/useProjects";

import { ProjectCard } from "./project-card";
import { ProjectCardSkeleton } from "./project-card-skeleton";
import { ProjectsEmptyState } from "./projects-empty-state";

export function ProjectsList() {
  const { data: projects, isLoading, isError, error, refetch } = useProjectsList();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-background shadow-sm">
        <ServerCrashIcon className="mb-4 h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">加载项目失败</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          无法获取项目列表。请检查您的网络连接并稍后再试。
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          重试
        </Button>
        {error instanceof Error && (
          <p className="mt-4 text-xs text-destructive/80 max-w-md">
            错误详情: {error.message}
          </p>
        )}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return <ProjectsEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

