// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { NodeInstanceId, VersionId } from "~/core/domain/version.types";

/**
 * Available workspace canvas view modes.
 */
export type ViewMode = "ExecutionGraph" | "HistoryGraph";

/**
 * Persisted state for the resizable panels.
 */
interface WorkspaceLayoutState {
  navigatorWidth: number;
  inspectorWidth: number;
  isNavigatorCollapsed: boolean;
  isInspectorCollapsed: boolean;
}

/**
 * Full client-side workspace state.
 */
interface WorkspaceState {
  focusedNodeId: NodeInstanceId | null;
  inspectedVersionId: VersionId | null;
  isManualEditing: boolean;
  viewMode: ViewMode;
  layout: WorkspaceLayoutState;

  focusNode: (nodeId: NodeInstanceId | null) => void;
  inspectVersion: (versionId: VersionId | null) => void;
  setManualEditing: (isEditing: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  updateLayout: (updates: Partial<WorkspaceLayoutState>) => void;
}

const initialLayoutState: WorkspaceLayoutState = {
  navigatorWidth: 25,
  inspectorWidth: 25,
  isNavigatorCollapsed: false,
  isInspectorCollapsed: false,
};

/**
 * Workspace UI store scoped to client-only state.
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      focusedNodeId: null,
      inspectedVersionId: null,
      isManualEditing: false,
      viewMode: "ExecutionGraph",
      layout: initialLayoutState,
      focusNode: (nodeId: NodeInstanceId | null) =>
        set({
          focusedNodeId: nodeId,
          inspectedVersionId: null,
          isManualEditing: false,
        }),
      inspectVersion: (versionId: VersionId | null) =>
        set({ inspectedVersionId: versionId }),
      setManualEditing: (isEditing: boolean) =>
        set({ isManualEditing: isEditing }),
      setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
      updateLayout: (updates: Partial<WorkspaceLayoutState>) =>
        set((state) => ({ layout: { ...state.layout, ...updates } })),
    }),
    {
      name: "cognitive-cockpit-workspace-layout",
      partialize: (state) => ({ layout: state.layout }),
    },
  ),
);
