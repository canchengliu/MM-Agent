"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import { ProjectService } from "~/core/api/services/project.service";
import type {
  FileRole,
  HistoricalInitializationRequest,
  ProjectCreate,
  ProjectDetailRead,
  ProjectUpdate,
} from "~/core/domain/project.types";

/**
 * Hook to fetch a paginated list of projects.
 */
export function useProjectList({ skip = 0, limit = 20 } = {}) {
  const queryKey = [...QueryKeys.projects(), { skip, limit }] as const;
  return useQuery({
    queryKey,
    queryFn: () => ProjectService.getList(skip, limit),
  });
}

/**
 * Hook to fetch the details of a single project.
 */
export function useProjectDetail(projectId: number | null) {
  const hasProject = projectId != null;
  const queryKey =
    projectId != null
      ? QueryKeys.projectDetail(projectId)
      : (["projects", "detail", "noop"] as const);

  return useQuery({
    queryKey,
    queryFn: () => {
      if (projectId == null) {
        throw new Error("Project ID is required to fetch details.");
      }
      return ProjectService.getDetail(projectId);
    },
    enabled: hasProject,
  });
}

/**
 * Hook for creating a new project.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectCreate) => ProjectService.createProject(data),
    onSuccess: () => {
      toast.success("Project created successfully.");
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "PROJECT_NAME_EXISTS") {
        toast.error("Creation failed: A project with this name already exists.");
      } else {
        toast.error(
          `Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
  });
}

/**
 * Hook for partially updating a project.
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: number; data: ProjectUpdate }) =>
      ProjectService.updateProject(vars),
    onSuccess: (updatedProject) => {
      toast.success("Project updated.");
      queryClient.setQueryData(
        QueryKeys.projectDetail(updatedProject.id),
        updatedProject,
      );
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
    },
    onError: (error) => {
      toast.error(
        `Failed to update project: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });
}

/**
 * Hook for deleting a project.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: number) => ProjectService.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      toast.success("Project deleted successfully.");
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
      void queryClient.removeQueries({
        queryKey: QueryKeys.projectDetail(projectId),
      });
    },
    onError: (error) => {
      toast.error(
        `Failed to delete project: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });
}

/**
 * Hook for uploading a file to a project.
 */
export function useUploadFile(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { file: File; role: FileRole }) =>
      ProjectService.uploadFile({ projectId, ...vars }),
    onSuccess: (newFile) => {
      toast.success(`File "${newFile.filename}" uploaded successfully.`);
      queryClient.setQueryData<ProjectDetailRead>(
        QueryKeys.projectDetail(projectId),
        (oldData) => {
          if (!oldData) return undefined;
          if (oldData.files.some((file) => file.id === newFile.id)) {
            return oldData;
          }
          return { ...oldData, files: [...oldData.files, newFile] };
        },
      );
    },
    onError: (error) => {
      toast.error(
        `File upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });
}

/**
 * Hook for starting a project's workflow.
 */
export function useStartWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: number) => ProjectService.startWorkflow(projectId),
    onMutate: async (projectId) => {
      toast.info("Submitting workflow start request...");
      await queryClient.cancelQueries({
        queryKey: QueryKeys.projectDetail(projectId),
      });
      const previousProject = queryClient.getQueryData<ProjectDetailRead>(
        QueryKeys.projectDetail(projectId),
      );
      if (previousProject) {
        queryClient.setQueryData<ProjectDetailRead>(
          QueryKeys.projectDetail(projectId),
          { ...previousProject, status: "Running" },
        );
      }
      return { previousProject };
    },
    onSuccess: (_data, projectId) => {
      toast.success("Workflow started successfully, redirecting...");
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.projectDetail(projectId),
      });
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
      void queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (error, projectId, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(
          QueryKeys.projectDetail(projectId),
          context.previousProject,
        );
      }
      if (error instanceof ApiError && error.code === "INVALID_STATE") {
        toast.error(`Could not start workflow: ${error.message}`);
      } else {
        toast.error(
          `Failed to start workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
  });
}

/**
 * Hook for exporting a project as a ZIP file.
 */
export function useExportProject() {
  return useMutation({
    mutationFn: (projectId: number) => ProjectService.exportProject(projectId),
    onSuccess: ({ blob, filename }, projectId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename ?? `project_${projectId}_export.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Project export started.");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 404) {
        toast.error("Export failed: Project not found or has no content.");
      } else {
        toast.error(
          `Failed to export project: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
  });
}

/**
 * Hook for fetching the list of historical problems.
 */
export function useHistoricalProblems() {
  return useQuery({
    queryKey: QueryKeys.historicalProblems(),
    queryFn: () => ProjectService.getHistoricalProblems(),
    staleTime: Infinity,
  });
}

/**
 * Hook for initializing a project from a historical problem.
 */
export function useInitializeFromHistorical(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HistoricalInitializationRequest) =>
      ProjectService.initializeFromHistorical({ projectId, data }),
    onSuccess: (updatedProject) => {
      toast.success("Project initialized with historical data.");
      queryClient.setQueryData(
        QueryKeys.projectDetail(projectId),
        updatedProject,
      );
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "DEPENDENCY_FAILED") {
        toast.error(`Initialization failed: ${error.message}`);
      } else {
        toast.error(
          `Initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
  });
}
