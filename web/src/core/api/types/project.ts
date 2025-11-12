import type { ISODateString, Nullable } from "./common";
import type { NodeInstanceRead } from "./workflow";

export type ProjectStatus = "Configuring" | "Running" | "Completed";
export type ProjectProblemType = "A" | "B" | "C" | "D" | "E" | "F" | "-";
export type ProjectFileRole = "Problem Description" | "Dataset" | "Reference Material";

export interface ProjectSummaryRead {
  id: number;
  name: string;
  status: ProjectStatus;
  problem_type: ProjectProblemType;
  created_at: ISODateString;
  updated_at: ISODateString;
  workflow_instance_id: Nullable<number>;
}

export type ProjectSummary = ProjectSummaryRead;

export interface ProjectFileRead {
  id: number;
  filename: string;
  role: ProjectFileRole;
  created_at: ISODateString;
}

export type ProjectFile = ProjectFileRead;

export interface ProjectDetailRead extends ProjectSummaryRead {
  description: Nullable<string>;
  files: ProjectFileRead[];
  historical_problem_id: Nullable<number>;
}

export type ProjectDetail = ProjectDetailRead;

export interface ProjectCreatePayload {
  name: string;
  description?: Nullable<string>;
  problem_type?: ProjectProblemType;
}

export type CreateProjectRequest = ProjectCreatePayload;

export interface ProjectUpdatePayload {
  name?: string;
  description?: Nullable<string>;
  problem_type?: ProjectProblemType;
}

export type UpdateProjectRequest = ProjectUpdatePayload;

export interface ProjectFileUploadPayload {
  file: File;
  role: ProjectFileRole;
}

export interface HistoricalProblemRead {
  id: number;
  year: number;
  type: ProjectProblemType;
  name: string;
  has_dataset: boolean;
}

export interface HistoricalInitializationRequest {
  historical_problem_id: number;
}

export type ProjectHistoricalInitializationRequest = HistoricalInitializationRequest;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export type ProjectListResponse = PaginatedResponse<ProjectSummaryRead>;

export interface ProjectStartWorkflowResponse extends NodeInstanceRead {
  workflow_instance_id: number;
}
