import { z } from "zod";

import {
  FileRoleEnum,
  ProblemTypeEnum,
  ProjectStatusEnum,
} from "~/constants/enums";

import { NodeInstanceReadSchema } from "./workflow.model";

// --- Read Models (Responses) ---

// API 3.5.3: ProjectFileRead
export const ProjectFileReadSchema = z.object({
  id: z.number().int(),
  filename: z.string(),
  role: FileRoleEnum,
  created_at: z.string().datetime(), // ISO 8601 format
});
export type ProjectFileRead = z.infer<typeof ProjectFileReadSchema>;

// API 3.5.1: ProjectSummaryRead (Used in project lists - FRS 2.3)
export const ProjectSummaryReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: ProjectStatusEnum,
  problem_type: ProblemTypeEnum,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // Indicates if the workflow has been started (Design Doc 2.1.1.B)
  workflow_instance_id: z.number().int().nullable(),
});
export type ProjectSummaryRead = z.infer<typeof ProjectSummaryReadSchema>;

// API 3.5.2: ProjectDetailRead (Extends Summary with details)
export const ProjectDetailReadSchema = ProjectSummaryReadSchema.extend({
  description: z.string().nullable(),
  files: z.array(ProjectFileReadSchema),
  historical_problem_id: z.number().int().nullable(),
});
export type ProjectDetailRead = z.infer<typeof ProjectDetailReadSchema>;

// API 3.4.1: HistoricalProblemRead (For the historical case library - FRS 3.3)
export const HistoricalProblemReadSchema = z.object({
  id: z.number().int(),
  year: z.number().int(),
  type: ProblemTypeEnum,
  name: z.string(),
  has_dataset: z.boolean(),
});
export type HistoricalProblemRead = z.infer<typeof HistoricalProblemReadSchema>;

// API 3.3.1 Response: Start Workflow (Returns the first NodeInstanceRead)
export const StartWorkflowResponseSchema = NodeInstanceReadSchema;
export type StartWorkflowResponse = z.infer<typeof StartWorkflowResponseSchema>;

// --- Create/Update Models (Requests) ---

// API 3.1.1: ProjectCreate (FRS 2.2)
export const ProjectCreateSchema = z.object({
  name: z.string().trim().min(1, "Project name cannot be empty."),
  description: z.string().optional(),
});
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;

// API 3.1.4: ProjectUpdate (PATCH request)
export const ProjectUpdateSchema = z.object({
  name: z.string().trim().min(1, "Project name cannot be empty.").optional(),
  description: z.string().optional(),
  // Can only be updated in 'Configuring' state (enforced by backend)
  problem_type: ProblemTypeEnum.optional(),
});
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

// API 3.2.2: HistoricalInitializationRequest
export const HistoricalInitializationRequestSchema = z.object({
  historical_problem_id: z.number().int(),
});
export type HistoricalInitializationRequest = z.infer<
  typeof HistoricalInitializationRequestSchema
>;
