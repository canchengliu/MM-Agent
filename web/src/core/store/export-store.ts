// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ExportStatus } from "~/core/api/types";

const STORAGE_KEY = "workspace.export-jobs";

export interface ExportJobRecord {
  projectId: string;
  status: ExportStatus;
}

export interface ExportStoreState {
  activeJobs: Map<string, ExportJobRecord>;
}

export interface ExportStoreActions {
  addJob: (jobId: string, projectId: string) => void;
  updateJobStatus: (jobId: string, status: ExportStatus) => void;
  removeJob: (jobId: string) => void;
}

export type ExportStore = ExportStoreState & ExportStoreActions;

type PersistedExportState = {
  activeJobs: Array<[string, ExportJobRecord]>;
};

const storage =
  typeof window !== "undefined"
    ? createJSONStorage<PersistedExportState>(() => window.localStorage)
    : undefined;

export const useExportStore = create<ExportStore>()(
  persist<ExportStore, [], [], PersistedExportState>(
    (set) => ({
      activeJobs: new Map<string, ExportJobRecord>(),
      addJob: (jobId, projectId) => {
        if (!jobId || !projectId) {
          return;
        }

        set((state) => {
          const next = new Map(state.activeJobs);
          const current = next.get(jobId);

          next.set(jobId, {
            projectId,
            status: current?.status ?? ExportStatus.Queued,
          });

          return { activeJobs: next };
        });
      },
      updateJobStatus: (jobId, status) => {
        if (!jobId) {
          return;
        }

        set((state) => {
          const existing = state.activeJobs.get(jobId);
          if (!existing) {
            return { activeJobs: state.activeJobs };
          }

          const next = new Map(state.activeJobs);
          next.set(jobId, {
            ...existing,
            status,
          });

          return { activeJobs: next };
        });
      },
      removeJob: (jobId) => {
        if (!jobId) {
          return;
        }

        set((state) => {
          if (!state.activeJobs.has(jobId)) {
            return { activeJobs: state.activeJobs };
          }

          const next = new Map(state.activeJobs);
          next.delete(jobId);

          return { activeJobs: next };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage,
      version: 1,
      partialize: (state) => ({
        activeJobs: Array.from(state.activeJobs.entries()),
      }),
      merge: (persisted, current) => {
        const entries =
          (persisted as PersistedExportState | undefined)?.activeJobs ?? [];
        return {
          ...current,
          activeJobs: new Map(entries),
        };
      },
    },
  ),
);

export const selectActiveExportJobs = (state: ExportStore) => state.activeJobs;
