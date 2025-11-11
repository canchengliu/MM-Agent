import type { AVLInteractionData, SCAInteractionData } from "./version.types";

/**
 * Available HITL actions when submitting a pending node decision.
 * Mirrors API Doc 5.3 request body.
 */
export type HITLAction =
  | "Continue"
  | "RejectAndProvideModificationComments"
  | "Discard";

/**
 * Payload structure for POST /nodes/{id}/hitl.
 */
export interface HITLSubmission {
  action: HITLAction;
  feedback_comment?: string | null;
  interaction_data?:
    | SCAInteractionData
    | AVLInteractionData
    | Record<string, any>
    | null;
}

/**
 * Response from HITL submission guiding the next UI step.
 */
export interface HITLResponse {
  message: string;
  next_node_id: number | null;
  action:
    | "ExecuteNext"
    | "NavigateNext"
    | "Completed"
    | "AVLLoop"
    | "ReExecute"
    | "Discarded";
}
