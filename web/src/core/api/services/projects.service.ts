// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { fetcher } from "../fetcher";
import type {
  ProjectCreateCustomRequest,
  ProjectCreateTemplateRequest,
  ProjectDetailResponse,
  ProjectRead,
  ProjectTemplateRead,
  SwitchBranchRequest,
} from "../models/project";

const buildQueryString = (
  params: Record<string, string | number | boolean | undefined>,
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const projectsService = {
  listProjects: async (params: { skip?: number; limit?: number } = {}) => {
    const query = buildQueryString(params);
    return fetcher<ProjectRead[]>(`projects/${query}`);
  },

  getProjectDetail: async (projectId: string) => {
    return fetcher<ProjectDetailResponse>(`projects/${projectId}`);
  },

  createProjectFromTemplate: async (data: ProjectCreateTemplateRequest) => {
    return fetcher<ProjectDetailResponse>("projects/template", {
      method: "POST",
      body: data,
    });
  },

  createProjectCustom: async (data: ProjectCreateCustomRequest) => {
    return fetcher<ProjectDetailResponse>("projects/custom", {
      method: "POST",
      body: data,
    });
  },

  listTemplates: async () => {
    return fetcher<ProjectTemplateRead[]>("projects/templates");
  },

  deleteProject: async (projectId: string) => {
    return fetcher<null>(`projects/${projectId}`, { method: "DELETE" });
  },

  switchActiveBranch: async (projectId: string, data: SwitchBranchRequest) => {
    return fetcher<ProjectRead>(`projects/${projectId}/active-branch`, {
      method: "PUT",
      body: data,
    });
  },
};
