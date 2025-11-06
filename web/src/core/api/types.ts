// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export interface ApiClientConfig {
  baseUrl: string;
}

export type StreamEvent = never;

export enum ExportStatus {
  Queued = "QUEUED",
  InProgress = "IN_PROGRESS",
  Complete = "COMPLETE",
  Failed = "FAILED",
}

export interface ExportJobTriggered {
  job_id: string;
}

export interface ExportJobStatus {
  job_id: string;
  status: ExportStatus;
  result_artifact_id: string | null;
  error: string | null;
}
