import { apiClient } from "../ApiClient";
import type {
  ExecutionRequest,
  HITLSubmission,
  HitlSubmissionResult,
  ManualEditSubmission,
  NodeActionAck,
  NodeDetailView,
  NodeInstanceRead,
  NodeVersionRead,
} from "../types";

export const NodeService = {
  getDetail(nodeId: number) {
    return apiClient.get<NodeDetailView>(`/nodes/${nodeId}`);
  },

  getVersions(nodeId: number) {
    return apiClient.get<NodeVersionRead[]>(`/nodes/${nodeId}/versions`);
  },

  getVersionDetail(nodeId: number, versionId: number) {
    return apiClient.get<NodeVersionRead>(`/nodes/${nodeId}/versions/${versionId}`);
  },

  reExecute(nodeId: number, payload: ExecutionRequest = {}) {
    return apiClient.post<NodeActionAck>(`/nodes/${nodeId}/re-execute`, payload);
  },

  retry(nodeId: number, payload: ExecutionRequest = {}) {
    return apiClient.post<NodeActionAck>(`/nodes/${nodeId}/retry`, payload);
  },

  cancel(nodeId: number) {
    return apiClient.post<NodeActionAck>(`/nodes/${nodeId}/cancel`);
  },

  submitHITL(nodeId: number, submission: HITLSubmission) {
    return apiClient.post<HitlSubmissionResult>(`/nodes/${nodeId}/hitl`, submission);
  },

  manualEdit(nodeId: number, submission: ManualEditSubmission) {
    return apiClient.post<NodeInstanceRead>(`/nodes/${nodeId}/manual-edit`, submission);
  },

  activateVersion(nodeId: number, versionId: number) {
    return apiClient.post<NodeInstanceRead>(`/nodes/${nodeId}/versions/${versionId}/activate`);
  },
};
