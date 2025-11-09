// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

/**
 * Standard structure for validation error details provided by the backend.
 */
export interface ValidationErrorDetail {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

/**
 * Unified error response structure used across the API.
 */
export interface ErrorResponse {
  error_code?: string;
  message?: string;
  validation_details?: ValidationErrorDetail[] | null;
  detail?: string;
}
