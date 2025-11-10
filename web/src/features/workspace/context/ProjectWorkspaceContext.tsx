// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import type { ProjectDetailRead } from "~/core/domain";

interface ProjectWorkspaceContextValue {
  project: ProjectDetailRead;
  projectId: number;
  workflowId: number;
}

const ProjectWorkspaceContext = createContext<ProjectWorkspaceContextValue | null>(null);

export function ProjectWorkspaceProvider({
  project,
  children,
}: {
  project: ProjectDetailRead;
  children: ReactNode;
}) {
  if (project.workflow_instance_id === null) {
    throw new Error("ProjectWorkspaceProvider requires a project with a workflow instance.");
  }

  const value: ProjectWorkspaceContextValue = {
    project,
    projectId: project.id,
    workflowId: project.workflow_instance_id,
  };

  return (
    <ProjectWorkspaceContext.Provider value={value}>
      {children}
    </ProjectWorkspaceContext.Provider>
  );
}

export function useProjectWorkspace(): ProjectWorkspaceContextValue {
  const context = useContext(ProjectWorkspaceContext);
  if (!context) {
    throw new Error("useProjectWorkspace must be used within a ProjectWorkspaceProvider.");
  }
  return context;
}
