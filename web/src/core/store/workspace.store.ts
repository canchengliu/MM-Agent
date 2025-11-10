// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Defines the view modes for the central canvas.
 * 'ExecutionGraph': The default live view of the workflow (Screen 1).
 * 'HistoryGraph': The complete historical provenance view (Screen 2).
 */
export type ViewMode = "ExecutionGraph" | "HistoryGraph";

/**
 * Defines the state and actions for managing the Cognitive Cockpit's UI.
 * This store is responsible for client-side state only, such as user focus and layout preferences.
 * It is intentionally separated from server state, which is managed by TanStack Query.
 */
export interface WorkspaceState {
  // --- Focus Management ---
  // The single source of truth for which part of the workspace the user is interacting with.

  /**
   * The ID of the node currently selected in the Navigator or Canvas.
   * Null if no node is focused.
   */
  focusedNodeId: number | null;
  /**
   * The ID of a specific historical version being reviewed in "Time Travel Mode".
   * Null if not in time travel mode.
   */
  inspectedVersionId: number | null;
  /**
   * The ID of the node currently being manually edited.
   * Null when not in manual edit mode.
   */
  editingNodeId: number | null;

  // --- View State ---
  // Controls which major visualization is active in the central canvas.

  /** The current view mode for the main canvas. */
  viewMode: ViewMode;

  // --- Layout Preferences ---
  // Persisted state to remember the user's preferred panel arrangement.

  /**
   * Dimensions and collapsed states of the resizable panels.
   * This part of the state is persisted to localStorage.
   */
  layout: {
    navigatorWidth: number;
    inspectorWidth: number;
    isNavigatorCollapsed: boolean;
    isInspectorCollapsed: boolean;
  };

  // --- Actions ---
  // Functions to manipulate the UI state.

  /**
   * Sets the focus to a specific node.
   * @param nodeId The ID of the node to focus, or null to clear focus.
   * @importantly This action also resets any active historical version inspection.
   */
  focusNode: (nodeId: number | null) => void;
  /**
   * Enters or exits "Time Travel Mode" by focusing on a specific historical version.
   * @param versionId The ID of the version to inspect, or null to exit the mode.
   */
  inspectVersion: (versionId: number | null) => void;
  /**
   * Enters manual edit mode for a node.
   * @param nodeId The ID of the node to edit.
   */
  startEditingNode: (nodeId: number) => void;
  /**
   * Exits manual edit mode.
   */
  stopEditingNode: () => void;
  /**
   * Switches the central canvas between the live execution graph and the history graph.
   * @param mode The view mode to activate.
   */
  setViewMode: (mode: ViewMode) => void;
  /**
   * Updates the persisted layout preferences.
   * @param updates A partial object of the layout state to update.
   */
  updateLayout: (updates: Partial<WorkspaceState["layout"]>) => void;
}

/**
 * Zustand store for the workspace UI state, with persistence for layout settings.
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      // --- Initial State ---
      focusedNodeId: null,
      inspectedVersionId: null,
      editingNodeId: null,
      viewMode: "ExecutionGraph",
      layout: {
        navigatorWidth: 25,
        inspectorWidth: 30,
        isNavigatorCollapsed: false,
        isInspectorCollapsed: false,
      },

      // --- Actions Implementation ---
      focusNode: (nodeId) =>
        set({
          focusedNodeId: nodeId,
          // CRUCIAL: Resetting inspection ensures the user is viewing the active
          // state of the newly focused node, not a historical version of a previous one.
          inspectedVersionId: null,
          editingNodeId: null,
        }),

      inspectVersion: (versionId) =>
        set((state) => ({
          inspectedVersionId: versionId,
          editingNodeId: versionId ? null : state.editingNodeId,
        })),

      startEditingNode: (nodeId) =>
        set({
          editingNodeId: nodeId,
          focusedNodeId: nodeId,
          inspectedVersionId: null,
        }),

      stopEditingNode: () => set({ editingNodeId: null }),

      setViewMode: (mode) => set({ viewMode: mode }),

      updateLayout: (updates) =>
        set((state) => ({
          layout: { ...state.layout, ...updates },
        })),
    }),
    {
      // The key used to store the data in localStorage.
      name: "workspace-layout-storage",
      // Optimization: Only persist the 'layout' part of the state.
      // Focus and view mode are transient and should reset on page load to ensure
      // a clean starting context for the user. This prevents saving a "stale" UI focus.
      partialize: (state) => ({ layout: state.layout }),
    },
  ),
);
