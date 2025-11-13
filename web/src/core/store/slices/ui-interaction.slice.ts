import { type SliceCreator } from "~/core/store";

// (Task 22): Define the type for the reconstruction strategy.
// This defines how to transform the edited markdown string back into the required JSON structure.
export type OutputReconstructionStrategy = (
  editedContent: string,
  // We pass original data for context-aware reconstruction (e.g., updating a specific field)
  originalOutputData: Record<string, unknown> | string | null | undefined
) => Record<string, unknown> | string;

// Manages the UI state of the Workflow page, decoupled from the business data.
export interface UIInteractionSlice {
  // --- State ---

  // 1. Navigation & Selection
  activeNodeId: number | null;

  // 2. Workspace View State
  // If null, we are viewing the latest (active_version or pending_result).
  viewingVersionId: number | null;
  isEditing: boolean;

  // (Task 22): Manual Editing Context (Design Doc 2.3.3)
  // The original content string derived by OutputBlock when viewing the latest version. Used to check for changes.
  baseEditContent: string | null;
  // Temporary storage for content being edited locally. Updated by the editor (debounced/onCreate).
  localEditContent: string | null;
  // Strategy provided by OutputBlock to reconstruct JSON from edited string.
  outputReconstructionStrategy: OutputReconstructionStrategy | null;

  // 3. Layout State (Collapsible elements)
  // IDs of phases that are collapsed in the navigator (A)
  collapsedPhases: Set<string>;
  // IDs of stages that are collapsed in the navigator (A)
  collapsedStages: Set<string>;
  // Keys of blocks (e.g., 'inputs', 'artifacts') that are expanded in the workspace (B2)
  expandedBlocks: Set<string>;

  // --- Actions ---
  selectNode: (nodeId: number) => void;
  viewHistoricalVersion: (versionId: number) => void;
  viewLatestVersion: () => void;
  startEditing: () => void;
  stopEditing: () => void;
  // (Task 22): Action for OutputBlock to register the strategy and base content when viewing latest data.
  registerOutputContext: (strategy: OutputReconstructionStrategy | null, baseContent: string | null) => void;
  // Action to update the local draft content
  updateLocalEditContent: (content: string) => void;
  togglePhaseCollapse: (phaseId: string) => void;
  toggleStageCollapse: (stageId: string) => void;
  toggleBlockExpansion: (blockKey: string, isExpanded?: boolean) => void;
  resetWorkflowUIState: () => void;
}

// Define default expanded blocks (Design Doc 3.1.3.B, 2.4.B)
// Key blocks (Output, HITL Zone) default expanded; auxiliary (Inputs, Artifacts) default collapsed.
const DEFAULT_EXPANDED_BLOCKS = new Set(["output", "hitl_zone"]);

export const createUIInteractionSlice: SliceCreator<UIInteractionSlice> = (
  set,
  get,
) => ({
  activeNodeId: null,
  viewingVersionId: null,
  isEditing: false,
  // (Task 22): Initialize new state fields
  baseEditContent: null,
  localEditContent: null,
  outputReconstructionStrategy: null,
  collapsedPhases: new Set(),
  collapsedStages: new Set(),
  expandedBlocks: DEFAULT_EXPANDED_BLOCKS,

  selectNode: (nodeId) => {
    // When selecting a new node, reset the view state and editing context.
    set({
      activeNodeId: nodeId,
      viewingVersionId: null,
      isEditing: false,
      // (Task 22): Reset editing context
      baseEditContent: null,
      localEditContent: null,
      outputReconstructionStrategy: null,
      expandedBlocks: DEFAULT_EXPANDED_BLOCKS,
    });
  },

  viewHistoricalVersion: (versionId) => {
    // Cannot view history while editing
    if (get().isEditing) return;
    // When viewing history, the editing context for the latest version is irrelevant.
    set({ viewingVersionId: versionId, isEditing: false, outputReconstructionStrategy: null, baseEditContent: null, localEditContent: null });
  },

  viewLatestVersion: () => {
    // Allow switching back to latest.
    // We clear the context here; OutputBlock will re-register it when it renders the latest data.
    set({ viewingVersionId: null, outputReconstructionStrategy: null, baseEditContent: null });
    // If we were editing, we keep editing mode on, but clear local draft as the base might have changed if we switched away and back.
    if (get().isEditing) {
        set({ localEditContent: null });
    }
  },

  // (Task 22): Called by OutputBlock when it renders the latest data.
  registerOutputContext: (strategy, baseContent) => {
    // We only update if the context actually changed, to avoid unnecessary state updates.
    const state = get();
    if (state.outputReconstructionStrategy !== strategy || state.baseEditContent !== baseContent) {
        set({ outputReconstructionStrategy: strategy, baseEditContent: baseContent });
    }
  },

  startEditing: () => {
    // Must have an active node to start editing
    if (get().activeNodeId === null) return;

    // (Task 22): Check if the editing context (strategy and base content) is available.
    const state = get();
    if (state.outputReconstructionStrategy === null || state.baseEditContent === null) {
        console.error("Cannot start editing: Output context (strategy or base content) is not registered.");
        // This is a safeguard; the UI (ContextualToolbar) should prevent this by checking if context is ready.
        return;
    }

    // When starting editing, we must be viewing the latest version (Design Doc 3.1.1.D)
    // We set localEditContent to null to signify that the user hasn't made changes yet in this session.
    // The RichTextEditor's onCreate will immediately populate it.
    set({ isEditing: true, viewingVersionId: null, localEditContent: null });
  },

  stopEditing: () => {
    // When stopping editing (Cancel or Save), clear the local draft.
    // We keep the base context registered until the node changes or we view history.
    set({ isEditing: false, localEditContent: null });
  },

  // Update handler for the editor component (debounced for onUpdate, immediate for onCreate)
  updateLocalEditContent: (content: string) => {
    // We allow updates even if isEditing is technically false (e.g. during initialization via RichTextEditor's onCreate).
    set({ localEditContent: content });
  },

  togglePhaseCollapse: (phaseId) => {
    set((state) => {
      // Use Set for efficient management of collapsed state (immutable update)
      const newCollapsedPhases = new Set(state.collapsedPhases);
      if (newCollapsedPhases.has(phaseId)) {
        newCollapsedPhases.delete(phaseId);
      } else {
        newCollapsedPhases.add(phaseId);
      }
      return { collapsedPhases: newCollapsedPhases };
    });
  },

  toggleStageCollapse: (stageId) => {
    set((state) => {
      const newCollapsedStages = new Set(state.collapsedStages);
      if (newCollapsedStages.has(stageId)) {
        newCollapsedStages.delete(stageId);
      } else {
        newCollapsedStages.add(stageId);
      }
      return { collapsedStages: newCollapsedStages };
    });
  },

  toggleBlockExpansion: (blockKey, isExpanded) => {
    set((state) => {
      const newExpandedBlocks = new Set(state.expandedBlocks);
      const currentlyExpanded = newExpandedBlocks.has(blockKey);

      // Determine the desired state (toggle if undefined, otherwise use provided value)
      const shouldExpand = isExpanded ?? !currentlyExpanded;

      if (shouldExpand) {
        newExpandedBlocks.add(blockKey);
      } else {
        newExpandedBlocks.delete(blockKey);
      }
      return { expandedBlocks: newExpandedBlocks };
    });
  },

  // Called when navigating away from the workflow page or clearing workflow data (cross-slice communication)
  resetWorkflowUIState: () => {
    set({
      activeNodeId: null,
      viewingVersionId: null,
      isEditing: false,
      // (Task 22): Reset editing context
      baseEditContent: null,
      localEditContent: null,
      outputReconstructionStrategy: null,
      collapsedPhases: new Set(),
      collapsedStages: new Set(),
      expandedBlocks: DEFAULT_EXPANDED_BLOCKS,
    });
  },
});
