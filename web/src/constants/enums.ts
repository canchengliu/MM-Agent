import { z } from "zod";

// --- Project Management (API 3) ---

// API 3.5.1: Project Status (Design Doc 2.1.1.B)
export const ProjectStatusEnum = z.enum(["Configuring", "Running", "Completed"]);
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

// API 3.5.1: Problem Type (FRS 3.4)
// Note: "-" represents an unset or custom type.
export const ProblemTypeEnum = z.enum(["A", "B", "C", "D", "E", "F", "-"]);
export type ProblemType = z.infer<typeof ProblemTypeEnum>;

// API 3.5.3: File Role (FRS 3.2.2)
export const FileRoleEnum = z.enum([
  "Problem Description",
  "Dataset",
  "Reference Material",
]);
export type FileRole = z.infer<typeof FileRoleEnum>;

// --- Workflow Management (API 4) ---

// API 4.4.1: Workflow Status (Design Doc 2.1.1.C)
export const WorkflowStatusEnum = z.enum(["Running", "Completed"]);
export type WorkflowStatus = z.infer<typeof WorkflowStatusEnum>;

// --- Node & Execution (API 5, Design Doc 2.1.2.A) ---

// API 3.5.4, SRS 4.1: Node Lifecycle Main Status
export const NodeStatusEnum = z.enum([
  "Not Started",
  "Executing",
  "Awaiting HITL Approval",
  "Completed",
  "Failed",
  "Canceled",
]);
export type NodeStatus = z.infer<typeof NodeStatusEnum>;

// (Task 18): Define explicit constants for easier usage in components
export const NodeStatus = {
  NotStarted: "Not Started" as const,
  Executing: "Executing" as const,
  AwaitingHITLApproval: "Awaiting HITL Approval" as const,
  Completed: "Completed" as const,
  Failed: "Failed" as const,
  Canceled: "Canceled" as const,
};

// API 3.5.4: Detailed Execution Stage (for progress indication)
export const ExecutionStageEnum = z.enum([
  "Not Started",
  "Initializing",
  "Processing",
  "Generating Outputs",
  "Awaiting Review",
  "Completed",
  "Failed",
]);
export type ExecutionStage = z.infer<typeof ExecutionStageEnum>;

// API 3.5.4: Node Type (SRS 2.2)
export const NodeTypeEnum = z.enum(["Standard", "Generator"]);
export type NodeType = z.infer<typeof NodeTypeEnum>;

// (Task 21): Define explicit constants for NodeType
export const NodeType = {
  Standard: "Standard" as const,
  Generator: "Generator" as const,
};

// API 3.5.4: HITL Mode
export const HITLModeEnum = z.enum(["VARL", "SCA", "AVL"]);
export type HITLMode = z.infer<typeof HITLModeEnum>;

// (Task 18): Define explicit constants
export const HITLMode = {
  VARL: "VARL" as const,
  SCA: "SCA" as const,
  AVL: "AVL" as const,
};

// API 5.5.2: Version Source (FRS 4.3)
export const VersionSourceEnum = z.enum(["AI_GENERATED", "MANUALLY_EDITED"]);
export type VersionSource = z.infer<typeof VersionSourceEnum>;

// (Task 21): Define explicit constants for VersionSource
export const VersionSource = {
  AI_GENERATED: "AI_GENERATED" as const,
  MANUALLY_EDITED: "MANUALLY_EDITED" as const,
};

// --- HITL Interaction (API 5.3) ---

// API 5.3: HITL Submission Action (User intent)
export const HITLActionEnum = z.enum([
  "Continue", // (H2.1)
  "RejectAndProvideModificationComments", // (H2.2)
  "Discard", // (H2.3)
]);
export type HITLAction = z.infer<typeof HITLActionEnum>;

// (Task 18): Define explicit constants
export const HITLAction = {
  Continue: "Continue" as const,
  RejectAndProvideModificationComments: "RejectAndProvideModificationComments" as const,
  Discard: "Discard" as const,
};

// API 5.3: HITL Response Action (Frontend Navigation Guidance)
export const HITLResponseActionEnum = z.enum([
  "ExecuteNext",
  "NavigateNext",
  "Completed", // Workflow finished
  "AVLLoop", // Internal iteration (AVL mode)
  "ReExecute", // Node is re-executing
  "Discarded",
]);
export type HITLResponseAction = z.infer<typeof HITLResponseActionEnum>;

// (Task 18): Define explicit constants
export const HITLResponseAction = {
  ExecuteNext: "ExecuteNext" as const,
  NavigateNext: "NavigateNext" as const,
  Completed: "Completed" as const,
  AVLLoop: "AVLLoop" as const,
  ReExecute: "ReExecute" as const,
  Discarded: "Discarded" as const,
};
