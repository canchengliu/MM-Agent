import { useAuthStore } from "../../store/AuthStore";
import { ApiError, apiClient } from "../ApiClient";
import type {
  HistoricalInitializationRequest,
  HistoricalProblemRead,
  ProjectCreatePayload,
  ProjectDetail,
  ProjectFileRead,
  ProjectFileUploadPayload,
  ProjectListResponse,
  ProjectStartWorkflowResponse,
  ProjectUpdatePayload,
} from "../types";
import { resolveServiceURL } from "../utils";

export interface ProjectListQuery {
  skip?: number;
  limit?: number;
}

const ZIP_CONTENT_TYPE = "application/zip";
const DEFAULT_EXPORT_FILENAME = "project-export.zip";

function buildListQuery(params?: ProjectListQuery) {
  const searchParams = new URLSearchParams();
  if (params?.skip !== undefined) {
    searchParams.set("skip", params.skip.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.set("limit", params.limit.toString());
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const ProjectService = {
  list(params?: ProjectListQuery) {
    const query = buildListQuery(params);
    return apiClient.get<ProjectListResponse>(`/projects/${query}`);
  },

  get(projectId: number) {
    return apiClient.get<ProjectDetail>(`/projects/${projectId}`);
  },

  getDetail(projectId: number) {
    return apiClient.get<ProjectDetail>(`/projects/${projectId}`);
  },

  create(payload: ProjectCreatePayload) {
    return apiClient.post<ProjectDetail>("/projects/", payload);
  },

  update(projectId: number, payload: ProjectUpdatePayload) {
    return apiClient.patch<ProjectDetail>(`/projects/${projectId}`, payload);
  },

  async delete(projectId: number) {
    await apiClient.delete<unknown>(`/projects/${projectId}`);
  },

  uploadFile(projectId: number, payload: ProjectFileUploadPayload) {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("role", payload.role);
    return apiClient.post<ProjectFileRead>(`/projects/${projectId}/files`, formData);
  },

  initializeFromHistorical(projectId: number, payload: HistoricalInitializationRequest) {
    return apiClient.post<ProjectDetail>(`/projects/${projectId}/initialize-from-historical`, payload);
  },

  startWorkflow(projectId: number) {
    return apiClient.post<ProjectStartWorkflowResponse>(`/projects/${projectId}/start`);
  },

  getHistoricalProblems() {
    return apiClient.get<HistoricalProblemRead[]>("/historical-problems");
  },

  async exportProject(projectId: number) {
    if (typeof window === "undefined") {
      throw new Error("Project export is only available in the browser.");
    }

    const endpoint = `/projects/${projectId}/export`;
    const url = resolveServiceURL(endpoint);
    const headers = new Headers();

    const token = useAuthStore.getState().token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Accept", ZIP_CONTENT_TYPE);

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().logout();
      }
      const errorPayload = await parseErrorPayload(response);
      throw new ApiError(response.status, errorPayload);
    }

    const blob = await response.blob();
    const filename = extractFilename(response.headers.get("content-disposition")) ?? DEFAULT_EXPORT_FILENAME;
    triggerDownload(blob, filename);
  },
};

async function parseErrorPayload(response: Response) {
  try {
    return await response.clone().json();
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}

function extractFilename(headerValue: string | null): string | null {
  if (!headerValue) {
    return null;
  }

  // Attempt RFC 5987 filename* first
  const encodedPattern = /filename\*\s*=\s*([^;]+)/i;
  const encodedMatch = encodedPattern.exec(headerValue);
  if (encodedMatch) {
    const rawValue = stripQuotes(encodedMatch[1].trim());
    const parts = rawValue.split("''", 2);
    const encodedFilename = parts.length === 2 ? parts[1] : rawValue;
    if (encodedFilename) {
      try {
        return decodeURIComponent(encodedFilename);
      } catch {
        return encodedFilename;
      }
    }
  }

  const filenamePattern = /filename\s*=\s*"?([^";]+)"?/i;
  const quotedMatch = filenamePattern.exec(headerValue);
  if (quotedMatch) {
    return quotedMatch[1];
  }

  return null;
}

function stripQuotes(value: string) {
  return value.replace(/^"(.*)"$/, "$1");
}

function triggerDownload(blob: Blob, filename: string) {
  const safeFilename = filename || DEFAULT_EXPORT_FILENAME;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = safeFilename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);

  anchor.click();

  const cleanup = () => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  };

  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(cleanup);
  } else {
    setTimeout(cleanup, 0);
  }
}
