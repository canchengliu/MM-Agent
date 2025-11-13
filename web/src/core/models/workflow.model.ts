import { z } from "zod";

import {
  ExecutionStageEnum,
  HITLModeEnum,
  NodeStatusEnum,
  NodeTypeEnum,
  WorkflowStatusEnum,
} from "~/constants/enums";

// --- Core Component Models (The building blocks) ---

// API 3.5.4: NodeInstanceRead (Central model for Workflow visualization and state management)
export const NodeInstanceReadSchema = z.object({
  id: z.number().int(),
  definition_id: z.string(), // Static ID (e.g., "1.1.1")
  name: z.string(),
  // Execution State
  status: NodeStatusEnum,
  current_stage: ExecutionStageEnum,
  // Configuration
  node_type: NodeTypeEnum,
  hitl_mode: HITLModeEnum,
  order_index: z.number().int(),
  // Versioning
  active_version_id: z.number().int().nullable(),
  // Structural Context (Design Doc 2.1.1.D)
  phase_id: z.string(),
  stage_id: z.string(),
  stage_name: z.string(),
  task_group_id: z.string().nullable(), // For dynamically generated nodes
  // Staleness Indicator (R5.2, V4.1)
  is_stale: z.boolean(),
});
export type NodeInstanceRead = z.infer<typeof NodeInstanceReadSchema>;

// API 4.4.3: StageRead
export const StageReadSchema = z.object({
  id: z.string(),
  name: z.string(),
  nodes: z.array(NodeInstanceReadSchema),
});
export type StageRead = z.infer<typeof StageReadSchema>;

// API 4.4.2: PhaseRead
export const PhaseReadSchema = z.object({
  name: z.string(),
  stages: z.array(StageReadSchema),
});
export type PhaseRead = z.infer<typeof PhaseReadSchema>;

// --- Workflow Instance Models ---

// API 4.1.2: WorkflowSummaryRead (Lightweight version for lists)
export const WorkflowSummaryReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: WorkflowStatusEnum,
  project_id: z.number().int(),
  user_id: z.number().int(),
  // API 4.1.2 example includes created_at
  created_at: z.string().datetime().optional(),
});
export type WorkflowSummaryRead = z.infer<typeof WorkflowSummaryReadSchema>;

// API 4.4.1: WorkflowInstanceRead (The complete workflow structure and state)
export const WorkflowInstanceReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: WorkflowStatusEnum,
  project_id: z.number().int(),
  user_id: z.number().int(),
  phases: z.array(PhaseReadSchema),
});

export type WorkflowInstanceRead = z.infer<typeof WorkflowInstanceReadSchema>;

// --- Utility Models ---

// API 4.4.4: StalenessInfo (Details on why a node is stale)
export const StalenessInfoSchema = z.object({
  upstream_node_id: z.number().int(),
  upstream_definition_id: z.string(),
  consumed_version_id: z.number().int(),
  current_active_version_id: z.number().int().nullable(),
});
export type StalenessInfo = z.infer<typeof StalenessInfoSchema>;

// API 4.3.1: Workflow Staleness Report (Map<NodeId, StalenessInfo[]>)
export const WorkflowStalenessReportSchema = z.record(
  z.string(), // Node ID (as string key in JSON object)
  z.array(StalenessInfoSchema),
);
export type WorkflowStalenessReport = z.infer<
  typeof WorkflowStalenessReportSchema
>;

// --- Create/Update Models (Requests) ---

// API 4.1.1: WorkflowCreate
export const WorkflowCreateSchema = z.object({
  name: z.string().min(1, "Workflow name is required."),
  project_id: z.number().int(),
});
export type WorkflowCreate = z.infer<typeof WorkflowCreateSchema>;

// API 4.2.2: WorkflowUpdate (PATCH request)
export const WorkflowUpdateSchema = z.object({
  name: z.string().min(1, "Workflow name is required.").optional(),
});
export type WorkflowUpdate = z.infer<typeof WorkflowUpdateSchema>;
