// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

/**
 * Status of an asynchronous export job.
 */
export enum ExportStatus {
  QUEUED = "QUEUED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETE = "COMPLETE",
  FAILED = "FAILED",
  NOT_FOUND = "NOT_FOUND",
}

/**
 * Response when an export job is successfully triggered.
 */
export interface ExportJobTriggered {
  job_id: string;
}

/**
 * Status of a specific export job.
 */
export interface ExportJobStatus {
  job_id: string;
  status: ExportStatus;
  result_artifact_id: string | null;
  error: string | null;
}
