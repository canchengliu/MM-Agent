// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { PendingInteraction } from "~/core/api/models/workflow";

/**
 * Base props shared by all Human-in-the-Loop (HITL) interaction components.
 */
export interface BaseInteractionProps {
  /** The details of the pending interaction request from the backend. */
  interaction: PendingInteraction;
  /** The latest checkpoint ID, required for concurrency control when resuming the workflow. */
  checkpointId: string;
  /** The ID of the current project. */
  projectId: string;
}
