import type { NodeInstanceRead } from "./node.types";
import type { Brand } from "./common.types";
import type { ProjectId } from "./project.types";
import type { UserId } from "./user.types";

export type WorkflowId = Brand<number, "WorkflowId">;
export type WorkflowInstanceId = Brand<number, "WorkflowInstanceId">;

/**
 * Workflow lifecycle state.
 */
export type WorkflowStatus = "Running" | "Completed";

/**
 * Summary of a workflow instance for list views.
 */
export interface WorkflowSummaryRead {
  id: WorkflowId;
  name: string;
  status: WorkflowStatus;
  project_id: ProjectId;
  user_id: UserId;
  created_at: string;
  node_count?: number;
  completed_node_count?: number;
}

/**
 * Full workflow detail payload including node collection.
 */
export interface WorkflowInstanceRead {
  id: WorkflowId;
  name: string;
  status: WorkflowStatus;
  project_id: ProjectId;
  user_id: UserId;
  is_deletable?: boolean;
  is_completed?: boolean;
  nodes: NodeInstanceRead[];
}
