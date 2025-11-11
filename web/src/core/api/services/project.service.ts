import { apiClient } from "~/core/api/client";
import type { PaginatedResponse } from "~/core/domain/common.types";
import type { NodeInstanceRead } from "~/core/domain/node.types";
import type {
  FileRole,
  HistoricalInitializationRequest,
  HistoricalProblemRead,
  ProjectCreate,
  ProjectDetailRead,
  ProjectFileRead,
  ProjectSummaryRead,
  ProjectUpdate,
} from "~/core/domain/project.types";

/**
 * Service to interact with the project management API endpoints.
 */
export const ProjectService = {
  /**
   * Creates a new project for the authenticated user.
   */
  async createProject(data: ProjectCreate): Promise<ProjectDetailRead> {
    return apiClient<ProjectDetailRead>("/projects/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Fetches a paginated list of projects for the current user.
   */
  async getList(
    skip = 0,
    limit = 20,
  ): Promise<PaginatedResponse<ProjectSummaryRead>> {
    const params = new URLSearchParams({
      skip: String(skip),
      limit: String(limit),
    });
    return apiClient<PaginatedResponse<ProjectSummaryRead>>(
      `/projects/?${params.toString()}`,
    );
  },

  /**
   * Fetches the detailed information for a single project.
   */
  async getDetail(projectId: number): Promise<ProjectDetailRead> {
    return apiClient<ProjectDetailRead>(`/projects/${projectId}`);
  },

  /**
   * Partially updates a project's information.
   */
  async updateProject({
    projectId,
    data,
  }: {
    projectId: number;
    data: ProjectUpdate;
  }): Promise<ProjectDetailRead> {
    return apiClient<ProjectDetailRead>(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Permanently deletes a project and all its associated data.
   */
  async deleteProject(projectId: number): Promise<void> {
    await apiClient<null>(`/projects/${projectId}`, {
      method: "DELETE",
    });
  },

  /**
   * Uploads a file to a project with a specified role.
   */
  async uploadFile({
    projectId,
    file,
    role,
  }: {
    projectId: number;
    file: File;
    role: FileRole;
  }): Promise<ProjectFileRead> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    return apiClient<ProjectFileRead>(`/projects/${projectId}/files`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Initializes a project using data from a pre-defined historical problem.
   */
  async initializeFromHistorical({
    projectId,
    data,
  }: {
    projectId: number;
    data: HistoricalInitializationRequest;
  }): Promise<ProjectDetailRead> {
    return apiClient<ProjectDetailRead>(
      `/projects/${projectId}/initialize-from-historical`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  /**
   * Starts the workflow for a given project.
   */
  async startWorkflow(projectId: number): Promise<NodeInstanceRead> {
    return apiClient<NodeInstanceRead>(`/projects/${projectId}/start`, {
      method: "POST",
    });
  },

  /**
   * Exports all project artifacts as a ZIP archive.
   */
  async exportProject(
    projectId: number,
  ): Promise<{ blob: Blob; filename: string | null }> {
    return apiClient<{ blob: Blob; filename: string | null }>(
      `/projects/${projectId}/export`,
    );
  },

  /**
   * Fetches the list of all available historical problems for initialization.
   */
  async getHistoricalProblems(): Promise<HistoricalProblemRead[]> {
    return apiClient<HistoricalProblemRead[]>("/historical-problems");
  },
};
