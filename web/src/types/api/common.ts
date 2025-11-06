// Shared API DTO types and enumerations for core backend resources.

export type UUID = string;
export type ISO8601String = string;

export interface ValidationErrorDetail {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface ErrorResponse {
  error_code: string;
  message: string;
  validation_details?: ValidationErrorDetail[] | null;
}

export interface HealthCheckResponse {
  status: 'ok';
  timestamp: ISO8601String;
  environment: string;
  app_name: string;
}

export type ProjectStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ERROR';

export type AssetType =
  | 'PROBLEM_STATEMENT'
  | 'DATASET'
  | 'REPORT_DRAFT'
  | 'FIGURE'
  | 'SOURCE_CODE'
  | 'INTERMEDIATE_RESULT'
  | 'EXPORT_PACKAGE';

export type ExportStatus =
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'COMPLETE'
  | 'FAILED'
  | 'NOT_FOUND';
