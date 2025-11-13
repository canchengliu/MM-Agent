import { AxiosError } from "axios";

import type { FileRole } from "~/constants/enums";
import type { PaginatedResponse } from "~/core/models/common.model";
import type {
  HistoricalInitializationRequest,
  HistoricalProblemRead,
  ProjectCreate,
  ProjectDetailRead,
  ProjectFileRead,
  ProjectSummaryRead,
  ProjectUpdate,
  StartWorkflowResponse,
} from "~/core/models/project.model";

import apiClient from "./client";

/**
 * API Service for Project Management (API 3).
 */
export const ProjectService = {
  // --- 1. Project Lifecycle Management (CRUD) (API 3.1) ---

  /**
   * Creates a new project (API 3.1.1).
   */
  createProject: async (data: ProjectCreate): Promise<ProjectDetailRead> => {
    try {
      // Expect 201 Created
      const response = await apiClient.post<ProjectDetailRead>("/projects/", data, {
        validateStatus: (status) => status === 201,
      });
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (PROJECT_NAME_EXISTS)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("PROJECT_NAME_EXISTS");
      }
      throw error;
    }
  },

  /**
   * Gets the list of projects for the current user (API 3.1.2).
   */
  getProjects: async (
    skip = 0,
    limit = 20,
  ): Promise<PaginatedResponse<ProjectSummaryRead>> => {
    const response = await apiClient.get<PaginatedResponse<ProjectSummaryRead>>(
      "/projects/",
      {
        params: { skip, limit },
      },
    );
    return response.data;
  },

  /**
   * Gets the detailed information of a specific project (API 3.1.3).
   */
  getProjectById: async (projectId: number): Promise<ProjectDetailRead> => {
    const response = await apiClient.get<ProjectDetailRead>(
      `/projects/${projectId}`,
    );
    return response.data;
  },

  /**
   * Updates a project's basic information (API 3.1.4).
   */
  updateProject: async (
    projectId: number,
    data: ProjectUpdate,
  ): Promise<ProjectDetailRead> => {
    try {
      const response = await apiClient.patch<ProjectDetailRead>(
        `/projects/${projectId}`,
        data,
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (e.g., modifying problem_type when not Configuring)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("INVALID_STATE_FOR_UPDATE");
      }
      throw error;
    }
  },

  /**
   * Deletes a project and all associated data (API 3.1.5).
   */
  deleteProject: async (projectId: number): Promise<void> => {
    // Expect 204 No Content
    await apiClient.delete(`/projects/${projectId}`, {
      validateStatus: (status) => status === 204,
    });
  },

  // --- 2. Project Configuration & Data Management (API 3.2) ---

  /**
   * Uploads a file to a project (API 3.2.1). Handles multipart/form-data.
   */
  uploadFile: async (
    projectId: number,
    file: File,
    role: FileRole,
  ): Promise<ProjectFileRead> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    // Expect 201 Created
    const response = await apiClient.post<ProjectFileRead>(
      `/projects/${projectId}/files`,
      formData,
      {
        headers: {
          // Axios automatically sets the correct Content-Type with boundary
          "Content-Type": "multipart/form-data",
        },
        validateStatus: (status) => status === 201,
        // Increase timeout for potentially large file uploads
        timeout: 120000, // 2 minutes
      },
    );
    return response.data;
  },

  /**
   * Initializes a project from a historical problem (API 3.2.2).
   */
  initializeFromHistorical: async (
    projectId: number,
    data: HistoricalInitializationRequest,
  ): Promise<ProjectDetailRead> => {
    try {
      const response = await apiClient.post<ProjectDetailRead>(
        `/projects/${projectId}/initialize-from-historical`,
        data,
      );
      return response.data;
    } catch (error) {
      // Handle 424 Dependency Failed (Historical files missing on server)
      if (error instanceof AxiosError && error.response?.status === 424) {
        throw new Error("DEPENDENCY_FAILED");
      }
      throw error;
    }
  },

  // --- 3. Workflow Orchestration & Export (API 3.3) ---

  /**
   * Starts the workflow for a project (API 3.3.1).
   */
  startWorkflow: async (projectId: number): Promise<StartWorkflowResponse> => {
    try {
      // Expect 202 Accepted. Returns the first node instance information.
      const response = await apiClient.post<StartWorkflowResponse>(
        `/projects/${projectId}/start`,
        null, // No body required
        {
          validateStatus: (status) => status === 202,
        },
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (Preconditions not met or invalid state)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("PRECONDITIONS_NOT_MET");
      }
      throw error;
    }
  },

  /**
   * Exports the project results as a ZIP file (API 3.3.2).
   */
  exportProject: async (projectId: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/export`, {
        responseType: "blob", // Important for handling binary file downloads
        timeout: 300000, // 5 minutes timeout for export generation
      });
      return response.data;
    } catch (error) {
      // Handle 404 Not Found (Workflow not started)
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new Error("WORKFLOW_NOT_STARTED");
      }
      throw error;
    }
  },

  // --- 4. Auxiliary Data Query (API 3.4) ---

  /**
   * Gets the list of historical problems (API 3.4.1).
   */
  getHistoricalProblems: async (): Promise<HistoricalProblemRead[]> => {
    const response = await apiClient.get<HistoricalProblemRead[]>(
      "/historical-problems",
    );
    return response.data;
  },
};
