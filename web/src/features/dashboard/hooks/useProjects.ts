// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import {
  ProjectService,
  type HistoricalInitializationRequest,
  type ProjectCreate,
  type ProjectUpdate,
} from "~/core/api/services/project.service";
import type { FileRole, ProjectDetailRead } from "~/core/domain";

/**
 * Fetches a paginated list of projects.
 */
export const useProjectList = (
  params: { skip?: number; limit?: number },
  options: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof ProjectService.getList>>>
  > = {},
) => {
  return useQuery({
    queryKey: [...QueryKeys.projects(), params] as const,
    queryFn: () => ProjectService.getList(params),
    ...options,
  });
};

/**
 * Fetches the detailed information for a single project.
 */
export const useProjectDetail = (
  projectId: number | null,
  options: Partial<UseQueryOptions<ProjectDetailRead>> = {},
) => {
  const { enabled, ...restOptions } = options;
  const isValidProjectId =
    typeof projectId === "number" && Number.isFinite(projectId);

  return useQuery({
    queryKey: QueryKeys.projectDetail(projectId),
    queryFn: () => {
      if (!isValidProjectId || projectId === null) {
        throw new Error("A valid project id is required to fetch details.");
      }
      return ProjectService.getDetail(projectId);
    },
    enabled: isValidProjectId && (enabled ?? true),
    ...restOptions,
  });
};

/**
 * Creates a mutation for adding a new project.
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectCreate) => ProjectService.create(payload),
    onSuccess: (newProject) => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
      toast.success(`Project "${newProject.name}" created successfully.`);
    },
    onError: (error) => {
      const description =
        error instanceof ApiError ? error.message : "An unknown error occurred.";
      toast.error("Failed to create project", { description });
    },
  });
};

/**
 * Creates a mutation for updating a project.
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { projectId: number; payload: ProjectUpdate }) =>
      ProjectService.update(variables.projectId, variables.payload),
    onSuccess: (updatedProject) => {
      // Update the specific project's cache directly for an immediate UI update.
      queryClient.setQueryData(
        QueryKeys.projectDetail(updatedProject.id),
        updatedProject,
      );
      // Invalidate the list to reflect changes there.
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
      toast.success("Project updated successfully.");
    },
    onError: (error) => {
      const description =
        error instanceof ApiError ? error.message : "An unknown error occurred.";
      toast.error("Failed to update project", { description });
    },
  });
};

/**
 * Creates a mutation for deleting a project.
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) => ProjectService.delete(projectId),
    onSuccess: (_, projectId) => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
      void queryClient.removeQueries({
        queryKey: QueryKeys.projectDetail(projectId),
      });
      toast.success("Project deleted successfully.");
    },
    onError: (error) => {
      const description =
        error instanceof ApiError ? error.message : "An unknown error occurred.";
      toast.error("Failed to delete project", { description });
    },
  });
};

/**
 * Creates a mutation for uploading a file to a project.
 */
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      projectId: number;
      file: File;
      role: FileRole;
    }) =>
      ProjectService.uploadFile(
        variables.projectId,
        variables.file,
        variables.role,
      ),
    onSuccess: (newFile, variables) => {
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.projectDetail(variables.projectId),
      });
      toast.success(`File "${newFile.filename}" uploaded successfully.`);
    },
    onError: (error) => {
      toast.error("File upload failed", {
        description:
          error instanceof ApiError ? error.message : "An unknown error occurred.",
      });
    },
  });
};

/**
 * Creates a mutation for initializing a project from a historical problem.
 */
export const useInitializeFromHistorical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      projectId: number;
      payload: HistoricalInitializationRequest;
    }) =>
      ProjectService.initializeFromHistorical(
        variables.projectId,
        variables.payload,
      ),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(
        QueryKeys.projectDetail(updatedProject.id),
        updatedProject,
      );
      toast.success("Project initialized from historical problem.");
    },
    onError: (error) => {
      toast.error("Failed to initialize project", {
        description:
          error instanceof ApiError ? error.message : "An unknown error occurred.",
      });
    },
  });
};

/**
 * Creates a mutation for starting a project's workflow.
 */
export const useStartWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) => ProjectService.startWorkflow(projectId),
    onSuccess: (_, projectId) => {
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.projectDetail(projectId),
      });
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
      toast.info("Workflow has been started.");
    },
    onError: (error) => {
      const description =
        error instanceof ApiError
          ? error.message
          : "An unknown error occurred.";
      toast.error("Failed to start workflow", { description });
    },
  });
};

/**
 * Creates a mutation for exporting a project and triggers a download.
 */
export const useExportProject = () => {
  return useMutation({
    mutationFn: (variables: { projectId: number; projectName: string }) =>
      ProjectService.exportProject(variables.projectId),
    onSuccess: (blob, variables) => {
      const filename = `${variables.projectName.replace(/\s+/g, "_")}_export.zip`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success("Project export has started.");
    },
    onError: (error) => {
      toast.error("Failed to export project", {
        description:
          error instanceof ApiError
            ? error.message
            : "An unknown error occurred.",
      });
    },
  });
};

/**
 * Fetches the list of all historical problems for initialization.
 */
export const useHistoricalProblems = () => {
  return useQuery({
    queryKey: QueryKeys.historicalProblems(),
    queryFn: ProjectService.getHistoricalProblems,
  });
};
