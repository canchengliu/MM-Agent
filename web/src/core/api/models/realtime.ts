// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { ProjectStatus } from "./enums";

export interface BroadcastEventBase {
  event_type: string;
  timestamp: string;
  project_id: string;
  thread_id: string | null;
}

export interface ProjectStatusChangeEvent extends BroadcastEventBase {
  event_type: "PROJECT_STATUS_CHANGE";
  payload: {
    status: ProjectStatus;
    reason: string | null;
  };
}

export interface NodeStartEvent extends BroadcastEventBase {
  event_type: "NODE_START";
  payload: {
    node: string;
    status: "started";
    inputs?: Record<string, unknown>;
  };
}

export interface NodeEndEvent extends BroadcastEventBase {
  event_type: "NODE_END";
  payload: {
    node: string;
    status: "completed";
    outputs?: Record<string, unknown>;
  };
}

export interface HITLInterruptEvent extends BroadcastEventBase {
  event_type: "HITL_INTERRUPT";
  payload: {
    status: "PAUSED";
    snapshot: Record<string, unknown>;
  };
}

export interface ErrorEvent extends BroadcastEventBase {
  event_type: "ERROR";
  payload: {
    message: string;
    type: string;
  };
}

export type BroadcastEvent =
  | ProjectStatusChangeEvent
  | NodeStartEvent
  | NodeEndEvent
  | HITLInterruptEvent
  | ErrorEvent;
