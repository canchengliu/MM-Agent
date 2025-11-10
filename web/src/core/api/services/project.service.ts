// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { apiClient } from "~/core/api/client";
import type {
  FileRole,
  HistoricalProblem,
  ProjectDetailRead,
  ProjectFileRead,
  ProjectProblemType,
  ProjectSummaryRead,
  WorkflowStartResponse,
} from "~/core/domain";

/**
 * Payload for creating a new project.
 * Based on API Doc 3, Section 1.1 `POST /projects/`.
 */
export interface ProjectCreate {
  name: string;
  description?: string;
}

/**
 * Payload for updating a project's details.
 * Based on API Doc 3, Section 1.4 `PATCH /projects/{project_id}`.
 */
export interface ProjectUpdate {
  name?: string;
  description?: string;
  problem_type?: ProjectProblemType;
}

/**
 * Payload for initializing a project from the historical library.
 * Based on API Doc 3, Section 2.2 `POST /projects/{project_id}/initialize-from-historical`.
 */
export interface HistoricalInitializationRequest {
  historical_problem_id: number;
}

/**
 * Structure for paginated project list responses.
 * Based on API Doc 3, Section 1.2 `GET /projects/`.
 */
export interface PaginatedProjects {
  total: number;
  items: ProjectSummaryRead[];
}

/**
 * Service for handling project management API endpoints.
 */
export const ProjectService = {
  /**
   * Creates a new project for the current user.
   * Corresponds to API Doc 3, Section 1.1.
   */
  create: (payload: ProjectCreate): Promise<ProjectDetailRead> => {
    return apiClient<ProjectDetailRead>("/projects/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Retrieves a paginated list of projects for the current user.
   * Corresponds to API Doc 3, Section 1.2.
   */
  getList: (
    params: {
      skip?: number;
      limit?: number;
    } = {},
  ): Promise<PaginatedProjects> => {
    const searchParams = new URLSearchParams();
    if (typeof params.skip === "number") {
      searchParams.set("skip", params.skip.toString());
    }
    if (typeof params.limit === "number") {
      searchParams.set("limit", params.limit.toString());
    }

    const queryString = searchParams.toString();
    const suffix = queryString ? `?${queryString}` : "";
    return apiClient<PaginatedProjects>(`/projects/${suffix}`);
  },

  /**
   * Fetches the detailed information for a single project.
   * Corresponds to API Doc 3, Section 1.3.
   */
  getDetail: (projectId: number): Promise<ProjectDetailRead> => {
    return apiClient<ProjectDetailRead>(`/projects/${projectId}`);
  },

  /**
   * Updates a project's name, description, or problem type.
   * Corresponds to API Doc 3, Section 1.4.
   */
  update: (
    projectId: number,
    payload: ProjectUpdate,
  ): Promise<ProjectDetailRead> => {
    return apiClient<ProjectDetailRead>(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Permanently deletes a project and all its associated data.
   * Corresponds to API Doc 3, Section 1.5.
   */
  delete: (projectId: number): Promise<void> => {
    return apiClient<void>(`/projects/${projectId}`, {
      method: "DELETE",
    });
  },

  /**
   * Uploads a file and associates it with a project.
   * Corresponds to API Doc 3, Section 2.1.
   */
  uploadFile: (
    projectId: number,
    file: File,
    role: FileRole,
  ): Promise<ProjectFileRead> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    return apiClient<ProjectFileRead>(`/projects/${projectId}/files`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Initializes a project using data from a historical problem.
   * Corresponds to API Doc 3, Section 2.2.
   */
  initializeFromHistorical: (
    projectId: number,
    payload: HistoricalInitializationRequest,
  ): Promise<ProjectDetailRead> => {
    return apiClient<ProjectDetailRead>(
      `/projects/${projectId}/initialize-from-historical`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  /**
   * Starts the workflow for a configured project.
   * Corresponds to API Doc 3, Section 3.1.
   */
  startWorkflow: (projectId: number): Promise<WorkflowStartResponse> => {
    return apiClient<WorkflowStartResponse>(`/projects/${projectId}/start`, {
      method: "POST",
    });
  },

  /**
   * Exports all project artifacts as a ZIP file.
   * Corresponds to API Doc 3, Section 3.2.
   */
  exportProject: (projectId: number): Promise<Blob> => {
    return apiClient<Blob>(`/projects/${projectId}/export`);
  },

  /**
   * Fetches the list of available historical problems.
   * Corresponds to API Doc 3, Section 4.1.
   */
  getHistoricalProblems: (): Promise<HistoricalProblem[]> => {
    return apiClient<HistoricalProblem[]>("/historical-problems");
  },
};
