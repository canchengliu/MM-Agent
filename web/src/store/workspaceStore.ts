// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { create } from "zustand";

interface ActiveBranchState {
  branchId: string | null;
  branchName?: string | null;
}

interface WorkspaceState {
  activeBranch: ActiveBranchState;
  setActiveBranch: (payload: ActiveBranchState) => void;
  clearActiveBranch: () => void;
}

const initialState: ActiveBranchState = {
  branchId: null,
  branchName: null,
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeBranch: initialState,
  setActiveBranch: (payload) =>
    set(() => ({
      activeBranch: {
        branchId: payload.branchId,
        branchName: payload.branchName ?? null,
      },
    })),
  clearActiveBranch: () => set(() => ({ activeBranch: initialState })),
}));

