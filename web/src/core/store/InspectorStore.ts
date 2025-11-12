import { create } from "zustand";

import { ApiError, NodeService } from "~/core/api";
import type { NodeDetailView, NodeVersionRead } from "~/core/api";

export type InspectorTab = "results" | "history" | "dependencies";

export interface InspectorState {
  selectedNodeId: number | null;
  activeTab: InspectorTab;
  isPanelOpen: boolean;
  isEditing: boolean;

  details: NodeDetailView | null;
  versionHistory: NodeVersionRead[] | null;
  isLoadingDetails: boolean;
  error: string | null;

  selectNode: (nodeId: number) => Promise<void>;
  clearSelection: () => void;
  setActiveTab: (tab: InspectorTab) => void;
  togglePanel: (isOpen?: boolean) => void;
  enterEditMode: () => void;
  exitEditMode: () => void;
  resetCaches: () => void;

  _detailsCache: Record<number, NodeDetailView>;
  _versionHistoryCache: Record<number, NodeVersionRead[]>;
}

const INITIAL_STATE: Pick<
  InspectorState,
  | "selectedNodeId"
  | "activeTab"
  | "isPanelOpen"
  | "isEditing"
  | "details"
  | "versionHistory"
  | "isLoadingDetails"
  | "error"
> = {
  selectedNodeId: null,
  activeTab: "results",
  isPanelOpen: false,
  isEditing: false,
  details: null,
  versionHistory: null,
  isLoadingDetails: false,
  error: null,
};

const CACHE_STATE: Pick<InspectorState, "_detailsCache" | "_versionHistoryCache"> = {
  _detailsCache: {},
  _versionHistoryCache: {},
};

let selectionRequestToken = 0;

export const useInspectorStore = create<InspectorState>((set, get) => ({
  ...INITIAL_STATE,
  ...CACHE_STATE,

  selectNode: async (nodeId: number) => {
    selectionRequestToken += 1;
    const currentToken = selectionRequestToken;

    set((state) => ({
      selectedNodeId: nodeId,
      activeTab: "results",
      isPanelOpen: true,
      isEditing: false,
      isLoadingDetails: true,
      error: null,
      details: state._detailsCache[nodeId] ?? null,
      versionHistory: state._versionHistoryCache[nodeId] ?? null,
    }));

    try {
      const [details, versions] = await Promise.all([
        NodeService.getDetail(nodeId),
        NodeService.getVersions(nodeId),
      ]);

      if (currentToken !== selectionRequestToken || get().selectedNodeId !== nodeId) {
        return;
      }

      set((state) => ({
        details,
        versionHistory: versions,
        isLoadingDetails: false,
        _detailsCache: { ...state._detailsCache, [nodeId]: details },
        _versionHistoryCache: { ...state._versionHistoryCache, [nodeId]: versions },
      }));
    } catch (error) {
      if (currentToken !== selectionRequestToken || get().selectedNodeId !== nodeId) {
        return;
      }

      let message = "Failed to load node details.";
      if (error instanceof ApiError) {
        if (error.status === 403) {
          message = "This node is ahead of the execution frontier.";
        } else if (error.status === 404) {
          message = "The requested node could not be found.";
        }
      }

      set((state) => ({
        isLoadingDetails: false,
        error: message,
        details: state._detailsCache[nodeId] ?? null,
        versionHistory: state._versionHistoryCache[nodeId] ?? null,
      }));
    }
  },

  clearSelection: () => {
    set({
      selectedNodeId: null,
      details: null,
      versionHistory: null,
      isPanelOpen: false,
      isEditing: false,
      isLoadingDetails: false,
      error: null,
    });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  togglePanel: (isOpen) => {
    if (typeof isOpen === "boolean") {
      set({ isPanelOpen: isOpen });
    } else {
      set((state) => ({ isPanelOpen: !state.isPanelOpen }));
    }
  },

  enterEditMode: () => {
    if (get().selectedNodeId !== null) {
      set({ isEditing: true, activeTab: "results" });
    }
  },

  exitEditMode: () => {
    set({ isEditing: false });
  },

  resetCaches: () => {
    set({
      _detailsCache: {},
      _versionHistoryCache: {},
      details: null,
      versionHistory: null,
      isLoadingDetails: false,
      error: null,
    });
  },
}));
