import type { Brand } from "./common.types";
import type { WorkflowInstanceId } from "./workflow.types";

export type ProjectId = Brand<number, "ProjectId">;
export type ProjectFileId = Brand<number, "ProjectFileId">;
export type HistoricalProblemId = Brand<number, "HistoricalProblemId">;

/**
 * Project lifecycle state from API Doc 3.
 */
export type ProjectStatus = "Configuring" | "Running" | "Completed";

/**
 * Declares the purpose of a project file in the workflow.
 */
export type FileRole =
  | "Problem Description"
  | "Dataset"
  | "Reference Material";

/**
 * The type of problem being modeled, as defined in API Doc 3.
 */
export type ProblemType = "A" | "B" | "C" | "D" | "E" | "F" | "-";

/**
 * Metadata for a single project file upload.
 */
export interface ProjectFileRead {
  id: ProjectFileId;
  filename: string;
  role: FileRole;
  created_at: string;
}

/**
 * Summary payload for project list views.
 */
export interface ProjectSummaryRead {
  id: ProjectId;
  name: string;
  status: ProjectStatus;
  problem_type: ProblemType;
  created_at: string;
  updated_at: string;
  workflow_instance_id: WorkflowInstanceId | null;
}

/**
 * Detailed project payload with description and files.
 */
export interface ProjectDetailRead extends ProjectSummaryRead {
  description: string | null;
  files: ProjectFileRead[];
  historical_problem_id: HistoricalProblemId | null;
}

/**
 * Payload for creating a new project.
 */
export interface ProjectCreate {
  name: string;
  description?: string;
}

/**
 * Payload for partially updating a project.
 */
export interface ProjectUpdate {
  name?: string;
  description?: string;
  problem_type?: ProblemType;
}

/**
 * Payload for initializing a project from a historical problem.
 */
export interface HistoricalInitializationRequest {
  historical_problem_id: HistoricalProblemId;
}

/**
 * Payload for fetching a list of historical problems.
 */
export interface HistoricalProblemRead {
  id: HistoricalProblemId;
  year: number;
  type: ProblemType;
  name: string;
  has_dataset: boolean;
}
