import { apiClient } from "../ApiClient";
import type {
  PaginatedResponse,
  StalenessInfo,
  WorkflowCreateRequest,
  WorkflowInstanceRead,
  WorkflowSummaryRead,
  WorkflowUpdateRequest,
} from "../types";

type WorkflowStalenessMap = Record<number, StalenessInfo[]>;

interface WorkflowListParams {
  skip?: number;
  limit?: number;
}

function buildQueryString(params?: WorkflowListParams) {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  if (typeof params.skip === "number") {
    searchParams.set("skip", params.skip.toString());
  }
  if (typeof params.limit === "number") {
    searchParams.set("limit", params.limit.toString());
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const WorkflowService = {
  list(params?: WorkflowListParams) {
    const queryString = buildQueryString(params);
    const endpoint = `/workflows/${queryString}`;
    return apiClient.get<PaginatedResponse<WorkflowSummaryRead>>(endpoint);
  },

  create(payload: WorkflowCreateRequest) {
    return apiClient.post<WorkflowInstanceRead>("/workflows/", payload);
  },

  update(workflowId: number, payload: WorkflowUpdateRequest) {
    return apiClient.patch<WorkflowInstanceRead>(`/workflows/${workflowId}`, payload);
  },

  delete(workflowId: number) {
    return apiClient.delete<void>(`/workflows/${workflowId}`);
  },

  getDetail(workflowId: number) {
    return apiClient.get<WorkflowInstanceRead>(`/workflows/${workflowId}`);
  },

  getStaleness(workflowId: number) {
    return apiClient.get<WorkflowStalenessMap>(`/workflows/${workflowId}/staleness`);
  },
};
