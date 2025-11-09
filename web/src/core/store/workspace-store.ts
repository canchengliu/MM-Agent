// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { ProjectStatus } from "../api/models/enums";
import type { ProjectDetailResponse } from "../api/models/project";
import type { BroadcastEvent } from "../api/models/realtime";
import type { RunStateResponse } from "../api/models/workflow";

/**
 * Supported workspace navigation modes.
 */
export type ViewMode = "EXECUTION" | "HISTORY";

/**
 * Represents the top-level UI context for the workspace.
 * Live mode shows the current execution, while history review locks the UI into read-only.
 */
export type UIMode = "live" | "history_review";

export interface BranchContext {
  newBranchId: string;
  sourceBranchId: string;
}

/**
 * Lightweight status used to decorate execution steps.
 */
export enum StepExecutionStatus {
  QUEUED = "QUEUED",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  INTERRUPTED = "INTERRUPTED",
}

interface WorkspaceState {
  projectId: string | null;
  projectDetail: ProjectDetailResponse | null;
  activeThreadId: string | null;
  viewMode: ViewMode;
  uiMode: UIMode;
  branchContext: BranchContext | null;
  selectedExecutionStepId: string | null;
  selectedHistoryCheckpointId: string | null;
  selectedHistoryThreadId: string | null;
  runState: RunStateResponse | null;
  stepStatuses: Record<string, StepExecutionStatus>;
  isSyncing: boolean;
  initializeWorkspace: (projectId: string, detail?: ProjectDetailResponse | null) => void;
  resetWorkspace: () => void;
  setViewMode: (mode: ViewMode) => void;
  setProjectDetail: (detail: ProjectDetailResponse | null) => void;
  selectExecutionStep: (stepId: string) => void;
  selectHistoryNode: (threadId: string, checkpointId: string) => void;
  returnToLiveMode: () => void;
  setRunState: (state: RunStateResponse | null) => void;
  processEvent: (event: BroadcastEvent) => void;
  setIsSyncing: (syncing: boolean) => void;
  handleBranchCreated: (newBranchId: string, sourceBranchId: string) => void;
  clearBranchContext: () => void;
}

type WorkspaceActions =
  | "initializeWorkspace"
  | "resetWorkspace"
  | "setViewMode"
  | "setProjectDetail"
  | "selectExecutionStep"
  | "selectHistoryNode"
  | "returnToLiveMode"
  | "setRunState"
  | "processEvent"
  | "setIsSyncing"
  | "handleBranchCreated"
  | "clearBranchContext";

const initialState: Omit<WorkspaceState, WorkspaceActions> = {
  projectId: null,
  projectDetail: null,
  activeThreadId: null,
  viewMode: "EXECUTION",
  uiMode: "live",
  branchContext: null,
  selectedExecutionStepId: null,
  selectedHistoryCheckpointId: null,
  selectedHistoryThreadId: null,
  runState: null,
  stepStatuses: {},
  isSyncing: true,
};

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      initializeWorkspace: (projectId, detail = null) => {
        if (get().projectId !== projectId) {
          set(
            {
              ...initialState,
              projectId,
              projectDetail: detail,
              activeThreadId: detail?.active_thread_id ?? null,
            },
            false,
            "initializeWorkspace",
          );
        }
      },

      resetWorkspace: () => set(initialState, false, "resetWorkspace"),

      setViewMode: (mode) => {
        if (get().viewMode === mode) {
          return;
        }

        if (mode === "EXECUTION") {
          set(
            {
              viewMode: mode,
              uiMode: "live",
              selectedHistoryCheckpointId: null,
              selectedHistoryThreadId: null,
            },
            false,
            "setViewMode",
          );
          return;
        }

        set({ viewMode: mode }, false, "setViewMode");
      },

      setProjectDetail: (detail) =>
        set(
          (state) => {
            const nextState: Partial<WorkspaceState> = {
              projectDetail: detail,
            };

            if (!state.runState) {
              nextState.activeThreadId = detail?.active_thread_id ?? null;
            }

            return nextState;
          },
          false,
          "setProjectDetail",
        ),

      selectExecutionStep: (stepId) => {
        if (get().selectedExecutionStepId === stepId && get().uiMode === "live") {
          return;
        }

        set(
          {
            viewMode: "EXECUTION",
            uiMode: "live",
            selectedExecutionStepId: stepId,
            selectedHistoryCheckpointId: null,
            selectedHistoryThreadId: null,
          },
          false,
          "selectExecutionStep",
        );
      },

      selectHistoryNode: (threadId, checkpointId) => {
        const { selectedHistoryCheckpointId, selectedHistoryThreadId } = get();
        if (
          selectedHistoryCheckpointId === checkpointId &&
          selectedHistoryThreadId === threadId &&
          get().uiMode === "history_review"
        ) {
          return;
        }

        set(
          {
            viewMode: "HISTORY",
            uiMode: "history_review",
            selectedHistoryThreadId: threadId,
            selectedHistoryCheckpointId: checkpointId,
            selectedExecutionStepId: null,
          },
          false,
          "selectHistoryNode",
        );
      },

      returnToLiveMode: () =>
        set(
          {
            uiMode: "live",
            selectedHistoryCheckpointId: null,
            selectedHistoryThreadId: null,
          },
          false,
          "returnToLiveMode",
        ),

      setIsSyncing: (syncing) => {
        if (get().isSyncing !== syncing) {
          set({ isSyncing: syncing }, false, "setIsSyncing");
        }
      },

      setRunState: (nextRunState) => {
        const state = get();
        const reconciledStepStatuses = { ...state.stepStatuses };
        const currentRunState = state.runState;

        if (nextRunState) {
          if (nextRunState.latest_values) {
            for (const stepId of Object.keys(nextRunState.latest_values)) {
              reconciledStepStatuses[stepId] = StepExecutionStatus.SUCCESS;
            }
          }

          if (
            nextRunState.status === ProjectStatus.PAUSED &&
            nextRunState.pending_interaction
          ) {
            const stepId = nextRunState.pending_interaction.source_step_id;
            reconciledStepStatuses[stepId] = StepExecutionStatus.INTERRUPTED;

            if (get().viewMode === "EXECUTION") {
              get().selectExecutionStep(stepId);
            }
          } else if (
            nextRunState.status === ProjectStatus.COMPLETED ||
            nextRunState.status === ProjectStatus.IDLE ||
            nextRunState.status === ProjectStatus.ERROR
          ) {
            for (const [stepId, status] of Object.entries(reconciledStepStatuses)) {
              if (
                status === StepExecutionStatus.RUNNING ||
                status === StepExecutionStatus.INTERRUPTED
              ) {
                if (nextRunState.latest_values?.[stepId] !== undefined) {
                  reconciledStepStatuses[stepId] = StepExecutionStatus.SUCCESS;
                } else if (
                  nextRunState.status === ProjectStatus.ERROR &&
                  status === StepExecutionStatus.RUNNING
                ) {
                  reconciledStepStatuses[stepId] = StepExecutionStatus.FAILED;
                } else if (nextRunState.status === ProjectStatus.IDLE) {
                  delete reconciledStepStatuses[stepId];
                }
              }
            }
          }
        }

        const stateUpdate: Partial<WorkspaceState> = {
          runState: nextRunState,
          stepStatuses: reconciledStepStatuses,
          isSyncing: nextRunState ? false : state.isSyncing,
        };

        if (
          nextRunState &&
          state.activeThreadId !== nextRunState.active_thread_id
        ) {
          stateUpdate.activeThreadId = nextRunState.active_thread_id;
        }

        if (nextRunState) {
          const previousThreadId = currentRunState?.active_thread_id;
          const nextThreadId = nextRunState.active_thread_id;

          if (previousThreadId && nextThreadId !== previousThreadId) {
            const context = state.branchContext;
            if (context && context.newBranchId !== nextThreadId) {
              stateUpdate.branchContext = null;
            }
          }
        } else if (!nextRunState && state.branchContext) {
          stateUpdate.branchContext = null;
        }

        set(stateUpdate, false, "setRunState");
      },

      processEvent: (event) => {
        const { stepStatuses } = get();
        const nextStepStatuses = { ...stepStatuses };
        const actionName = `processEvent/${event.event_type}`;
        let hasChanges = false;

        switch (event.event_type) {
          case "NODE_START":
            nextStepStatuses[event.payload.node] = StepExecutionStatus.RUNNING;
            hasChanges = true;
            if (get().viewMode === "EXECUTION") {
              get().selectExecutionStep(event.payload.node);
            }
            break;
          case "NODE_END":
            nextStepStatuses[event.payload.node] = StepExecutionStatus.SUCCESS;
            hasChanges = true;
            break;
          case "ERROR": {
            const runningEntry = Object.entries(stepStatuses).find(
              ([, status]) => status === StepExecutionStatus.RUNNING,
            );
            if (runningEntry) {
              nextStepStatuses[runningEntry[0]] = StepExecutionStatus.FAILED;
              hasChanges = true;
            }
            break;
          }
          case "PROJECT_STATUS_CHANGE": {
            const currentRunState = get().runState;
            if (currentRunState && currentRunState.status !== event.payload.status) {
              set(
                {
                  runState: {
                    ...currentRunState,
                    status: event.payload.status,
                  },
                },
                false,
                `${actionName}/updateGlobalStatus`,
              );
            }
            break;
          }
          default:
            break;
        }

        if (hasChanges) {
          let changed = false;
          for (const key of Object.keys({
            ...stepStatuses,
            ...nextStepStatuses,
          })) {
            if (stepStatuses[key] !== nextStepStatuses[key]) {
              changed = true;
              break;
            }
          }

          if (changed) {
            set({ stepStatuses: nextStepStatuses }, false, actionName);
          }
        }
      },
      handleBranchCreated: (newBranchId, sourceBranchId) => {
        set(
          {
            viewMode: "EXECUTION",
            uiMode: "live",
            selectedHistoryCheckpointId: null,
            selectedHistoryThreadId: null,
            branchContext: { newBranchId, sourceBranchId },
            isSyncing: true,
          },
          false,
          "handleBranchCreated",
        );
      },

      clearBranchContext: () => {
        if (get().branchContext) {
          set({ branchContext: null }, false, "clearBranchContext");
        }
      },
    }),
    { name: "WorkspaceStore" },
  ),
);
