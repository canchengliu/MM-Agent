import type { NodeInstanceRead } from "./node.types";

/**
 * Represents the lifecycle status of a project.
 * From API Doc 3, "Project Lifecycle" concept.
 */
export type ProjectStatus = "Configuring" | "Running" | "Completed";

/**
 * Defines the role of a file within a project.
 * From API Doc 3, Section 2.1 `POST /projects/{project_id}/files`.
 */
export type FileRole =
  | "Problem Description"
  | "Dataset"
  | "Reference Material";

/**
 * Represents the type of problem a project is addressing.
 * From API Doc 3, Section 1.4 `PATCH /projects/{project_id}`.
 */
export type ProjectProblemType = "A" | "B" | "C" | "D" | "E" | "F" | "-";

/**
 * Represents a file uploaded to a project.
 * Based on API Doc 3, Section 2.1 `POST /projects/{project_id}/files` success response.
 */
export interface ProjectFileRead {
  id: number;
  filename: string;
  role: FileRole;
  created_at: string; // ISO 8601 date string
}

/**
 * Represents a summary view of a project, suitable for list displays.
 * Based on API Doc 3, Section 1.2 `GET /projects/`.
 */
export interface ProjectSummaryRead {
  id: number;
  name: string;
  status: ProjectStatus;
  problem_type: ProjectProblemType;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  workflow_instance_id: number | null;
}

/**
 * Represents the complete detailed information of a single project.
 * Based on API Doc 3, Section 1.3 `GET /projects/{project_id}`.
 */
export interface ProjectDetailRead {
  id: number;
  name: string;
  status: ProjectStatus;
  problem_type: ProjectProblemType;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  workflow_instance_id: number | null;
  description: string | null;
  files: ProjectFileRead[];
  historical_problem_id: number | null;
}

/**
 * Represents an item from the historical problem library.
 * Based on API Doc 3, Section 4.1 `GET /historical-problems`.
 */
export interface HistoricalProblem {
  id: number;
  year: number;
  type: ProjectProblemType;
  name: string;
  has_dataset: boolean;
}

/**
 * Represents the first node instance created when a workflow starts.
 * Based on API Doc 3, Section 3.1 `POST /projects/{project_id}/start`.
 */
export type WorkflowStartResponse = NodeInstanceRead;
