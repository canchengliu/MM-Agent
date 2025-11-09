// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  ProjectCreateCustomRequest,
  ProjectCreateTemplateRequest,
  ProjectDetailResponse,
} from "../models/project";
import { projectsService } from "../services/projects.service";

const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...projectKeys.lists(), params] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
  templates: () => [...projectKeys.all, "templates"] as const,
};

export const useProjectsList = (params: { skip?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectsService.listProjects(params),
  });
};

export const useProjectDetail = (projectId: string) => {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectsService.getProjectDetail(projectId),
    enabled: Boolean(projectId),
  });
};

export const useProjectTemplates = () => {
  return useQuery({
    queryKey: projectKeys.templates(),
    queryFn: projectsService.listTemplates,
    staleTime: Infinity,
  });
};

export const useCreateProjectFromTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectCreateTemplateRequest) =>
      projectsService.createProjectFromTemplate(data),
    onSuccess: (newProject) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success(`Project "${newProject.name}" created successfully.`);
    },
  });
};

export const useCreateProjectCustom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectCreateCustomRequest) =>
      projectsService.createProjectCustom(data),
    onSuccess: (newProject) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success(`Project "${newProject.name}" created successfully.`);
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectsService.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      void queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      toast.success("Project deleted successfully.");
    },
  });
};

export const useSwitchActiveBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      branchId,
    }: {
      projectId: string;
      branchId: string;
    }) => projectsService.switchActiveBranch(projectId, { branch_id: branchId }),
    onSuccess: (updatedProject, { projectId }) => {
      queryClient.setQueryData<ProjectDetailResponse | undefined>(
        projectKeys.detail(projectId),
        (oldData) => (oldData ? { ...oldData, ...updatedProject } : oldData),
      );

      toast.success("Active branch switched.");

      void queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "run-state"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "history"],
      });
    },
  });
};
