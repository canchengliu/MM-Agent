"use client";

import { FolderKanban, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useStore } from "~/core/store";

import { ProjectCard } from "./project-card";

export function ProjectList() {
  const { projects, isLoadingProjects, fetchProjects } = useStore(
    useShallow((state) => ({
      projects: state.projects,
      isLoadingProjects: state.isLoadingProjects,
      fetchProjects: state.fetchProjects,
    })),
  );

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  if (isLoadingProjects && projects.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
        <FolderKanban className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">No Projects Found</h3>
          <p className="text-sm text-muted-foreground">
            Create a new project to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
