import { produce } from "immer";
import { toast } from "sonner";

import { NodeService } from "~/core/api/node.service";
import { WorkflowService } from "~/core/api/workflow.service";
import type {
  ExecutionRequest,
  HITLResponse,
  HITLSubmission,
  ManualEditSubmission,
  NodeDetailView,
  NodeVersionRead,
} from "~/core/models/node.model";
import type {
  NodeInstanceRead,
  WorkflowInstanceRead,
} from "~/core/models/workflow.model";
import { type SliceCreator } from "~/core/store";
import { HITLResponseAction } from "~/constants/enums";

export interface WorkflowSlice {
  // --- State ---
  workflowInstance: WorkflowInstanceRead | null;
  // Normalized index for fast lookups (Architecture 4.3.4)
  nodesById: Map<number, NodeInstanceRead>;
  // Cache for node details
  nodeDetailsCache: Map<number, NodeDetailView>;
  // Cache for specific historical versions
  nodeVersionsCache: Map<number, NodeVersionRead>;
  // (Task 21): Cache for the list of versions for a node (API 5.1.2). Stores array or null (if fetch failed).
  nodeVersionListCache: Map<number, NodeVersionRead[] | null>;

  isLoading: boolean; // Initial load
  isSyncing: boolean; // Background refresh/sync (e.g., after WS event or staleness update)
  isExecutingAction: boolean; // Covers re-execute, HITL submit, versioning actions (API request duration)

  // Tracks nodes where cancellation has been requested but not yet confirmed by WS. (Design Doc 3.1.2.C.4, Task 17.5)
  pendingCancellationNodeIds: Set<number>;

  // --- Actions ---

  // A. Synchronization & Initialization
  loadWorkflow: (workflowId: number) => Promise<WorkflowInstanceRead | null>;
  _normalizeAndSetData: (workflow: WorkflowInstanceRead) => void;
  clearWorkflowData: () => void;

  // B. WebSocket Event Handlers (Defined here, called by WebSocket manager)
  handleNodeStatusUpdated: (node: NodeInstanceRead) => void;
  handleNodeActiveVersionChanged: (
    node: NodeInstanceRead,
  ) => Promise<void>;
  handleWorkflowStructureUpdated: (workflow: WorkflowInstanceRead) => void;
  handleWorkflowStatusUpdated: (workflow: WorkflowInstanceRead) => void;

  // C. Node Detail Management
  fetchNodeDetails: (
    nodeId: number,
    force?: boolean,
  ) => Promise<NodeDetailView | null>;
  // (Task 21): Action to fetch the list of all versions
  fetchNodeVersionList: (
    nodeId: number,
    force?: boolean,
  ) => Promise<NodeVersionRead[] | null>;
  // Action to fetch a specific historical version
  fetchNodeVersion: (
    nodeId: number,
    versionId: number,
  ) => Promise<NodeVersionRead | null>;

  // D. Execution Control & HITL
  reExecuteNode: (
    nodeId: number,
    data?: ExecutionRequest,
  ) => Promise<boolean>;
  retryNode: (nodeId: number, data?: ExecutionRequest) => Promise<boolean>;
  cancelNode: (nodeId: number) => Promise<boolean>;
  submitHITL: (
    nodeId: number,
    data: HITLSubmission,
  ) => Promise<HITLResponse | null>;
  activateVersion: (nodeId: number, versionId: number) => Promise<boolean>;
  manualEdit: (
    nodeId: number,
    data: ManualEditSubmission,
  ) => Promise<boolean>;
}

export const createWorkflowSlice: SliceCreator<WorkflowSlice> = (set, get) => ({
  workflowInstance: null,
  nodesById: new Map(),
  nodeDetailsCache: new Map(),
  nodeVersionsCache: new Map(),
  nodeVersionListCache: new Map(), // (Task 21)
  isLoading: false,
  isSyncing: false,
  isExecutingAction: false,
  pendingCancellationNodeIds: new Set(),

  // A. Synchronization & Initialization

  /**
   * Loads or synchronizes the workflow state. Handles both initial load and background syncs.
   * (Architecture 5.3.1, 5.3.2)
   */
  loadWorkflow: async (workflowId) => {
    const isInitialLoad =
      get().workflowInstance === null ||
      get().workflowInstance?.id !== workflowId;

    if (isInitialLoad) {
      // Reset state for a new workflow load
      set({
        isLoading: true,
        workflowInstance: null,
        nodesById: new Map(),
        nodeDetailsCache: new Map(),
        nodeVersionsCache: new Map(),
        nodeVersionListCache: new Map(), // (Task 21)
        pendingCancellationNodeIds: new Set(), // Reset pending cancellations
      });
      // Clear associated UI state
      get().resetWorkflowUIState();
    } else {
      // Indicate background synchronization. This prevents WS events from processing (checked in WebSocketManager).
      set({ isSyncing: true });
    }

    try {
      // Fetch the full snapshot (REST as Source of Truth - API 6.1)
      const workflow = await WorkflowService.getWorkflowById(workflowId);
      get()._normalizeAndSetData(workflow);
      return workflow;
    } catch (error) {
      console.error("Failed to load workflow:", error);
      toast.error("Failed to load or synchronize workflow data.");
      return null;
    } finally {
      set({ isLoading: false, isSyncing: false });
    }
  },

  /**
   * Normalizes the workflow data (builds the nodesById map) and updates the state.
   * (Architecture 4.3.4 Strategy 1)
   */
  _normalizeAndSetData: (workflow) => {
    const nodesById = new Map<number, NodeInstanceRead>();
    workflow.phases.forEach((phase) => {
      phase.stages.forEach((stage) => {
        stage.nodes.forEach((node) => {
          nodesById.set(node.id, node);
        });
      });
    });
    // Hydrate the store (Architecture 5.3.1 Step 3)
    set({ workflowInstance: workflow, nodesById });
  },

  clearWorkflowData: () => {
    // (Implementation remains as provided in context)
    set({
      workflowInstance: null,
      nodesById: new Map(),
      nodeDetailsCache: new Map(),
      nodeVersionsCache: new Map(),
      nodeVersionListCache: new Map(), // (Task 21)
      pendingCancellationNodeIds: new Set(), // Clear pending cancellations
    });
    // Also clear associated UI interaction state
    get().resetWorkflowUIState();
  },

  // B. WebSocket Event Handlers

  /**
   * Handles incremental updates (API 6.5.1, Architecture 4.3.4 Strategy 2).
   * Uses Immer for efficient immutable updates of the nested structure.
   */
  handleNodeStatusUpdated: (updatedNode) => {
    // Use produce from immer for immutable updates
    set(
      produce((state: WorkflowSlice) => {
        if (!state.nodesById.has(updatedNode.id)) {
          console.warn(`WorkflowSlice: Received update for unknown node ${updatedNode.id}. Ignoring.`);
          return;
        }

        // 1. Update normalized map
        state.nodesById.set(updatedNode.id, updatedNode);

        // 2. Update nested structure immutably (required for React reactivity)
        if (state.workflowInstance) {
          // Locate the node in the tree structure
          const phase = state.workflowInstance.phases.find(
            (p) => p.name === updatedNode.phase_id,
          );
          if (phase) {
            const stage = phase.stages.find(
              (s) => s.id === updatedNode.stage_id,
            );
            if (stage) {
              const nodeIndex = stage.nodes.findIndex(
                (n) => n.id === updatedNode.id,
              );
              if (nodeIndex !== -1) {
                // Replace the node object (immer handles the immutability)
                stage.nodes[nodeIndex] = updatedNode;
              }
            }
          }
        }

        // 3. Update details cache if the node is currently cached
        const cachedDetails = state.nodeDetailsCache.get(updatedNode.id);
        if (cachedDetails) {
          // Optimistically merge the updated basic info (NodeInstanceRead fields) into the NodeDetailView
          state.nodeDetailsCache.set(updatedNode.id, {
            ...cachedDetails,
            ...updatedNode,
          });
        }

        // 4. Handle Cancellation Confirmation (Design Doc 3.1.2.C.4 Step 3 & 4)
        if (state.pendingCancellationNodeIds.has(updatedNode.id)) {
          // If the status is now Canceled, the cancellation is confirmed.
          if (updatedNode.status === "Canceled") {
            state.pendingCancellationNodeIds.delete(updatedNode.id);
          }
          // Robustness check: If the status changed away from Executing for any other reason (e.g., Failed, Completed naturally before cancellation processed), also clear the pending state.
          else if (updatedNode.status !== "Executing") {
            console.warn(`WorkflowSlice: Node ${updatedNode.id} left Executing state (${updatedNode.status}) while cancellation was pending.`);
            state.pendingCancellationNodeIds.delete(updatedNode.id);
          }
        }
      }),
    );
  },

  /**
   * Handles version changes, triggering a full sync for staleness updates.
   * (API 6.5.2, Architecture 4.3.4 Strategy 4, Design Doc 3.1.2.C.2)
   */
  handleNodeActiveVersionChanged: async (updatedNode) => {
    // (Task 21): Invalidate the version list cache for this node, as the active status indicator in the list must be updated.
    set(
      produce((state: WorkflowSlice) => {
        state.nodeVersionListCache.delete(updatedNode.id);
      }),
    );

    // 1. Optimistically update the specific node first
    get().handleNodeStatusUpdated(updatedNode);

    // 2. Trigger full synchronization (Crucial for updating global is_stale flags)
    const workflowId = get().workflowInstance?.id;
    if (workflowId) {
      console.log(
        `NODE_ACTIVE_VERSION_CHANGED detected for node ${updatedNode.id}. Triggering full workflow sync (Staleness Update).`,
      );
      // We trigger the loadWorkflow in sync mode (isInitialLoad=false)
      await get().loadWorkflow(workflowId);
    }
  },

  /**
   * Handles dynamic structure changes (API 6.5.3, Architecture 4.3.4 Strategy 3).
   */
  handleWorkflowStructureUpdated: (workflow) => {
    // Full replacement is mandatory (Design Doc 3.1.2.C.3).
    get()._normalizeAndSetData(workflow);
    // Notify the user (Design Doc 3.1.2.C.3)
    toast.info("Workflow structure updated.");
  },

  handleWorkflowStatusUpdated: (workflow) => {
    // Update the workflow instance data.
    get()._normalizeAndSetData(workflow);
    if (workflow.status === "Completed") {
      toast.success("Workflow execution completed!");
    }
  },

  // C. Node Detail Management
  fetchNodeDetails: async (nodeId, force = false) => {
    // (Implementation remains as provided in context)
    if (!force && get().nodeDetailsCache.has(nodeId)) {
      return get().nodeDetailsCache.get(nodeId) ?? null;
    }

    try {
      const details = await NodeService.getNodeById(nodeId);
      set(
        produce((state: WorkflowSlice) => {
          state.nodeDetailsCache.set(nodeId, details);
          // Optimization: If details include an active version, cache it in the version cache too.
          if (details.active_version) {
            state.nodeVersionsCache.set(details.active_version.id, details.active_version);
          }
        }),
      );
      return details;
    } catch (error) {
      console.error(`Failed to fetch details for node ${nodeId}:`, error);
      if (error instanceof Error && error.message === "NODE_BEYOND_FRONTIER") {
        // Design Doc N3.2
        toast.error("Access Denied", {
          description: "You cannot view nodes that have not yet been executed.",
        });
      } else {
        toast.error(`Failed to load details for node ${nodeId}.`);
      }
      return null;
    }
  },

  /**
   * (Task 21): Fetches the list of all versions for a node and caches it centrally. (API 5.1.2)
   */
  fetchNodeVersionList: async (nodeId, force = false) => {
    // Check cache first. If force is false AND the key exists (even if the value is null/failed), return the cached value.
    if (!force && get().nodeVersionListCache.has(nodeId)) {
      // Return cached value (which could be the array or null if previously failed).
      return get().nodeVersionListCache.get(nodeId) ?? null;
    }

    try {
      // Fetch from API (API 5.1.2)
      const versions = await NodeService.getNodeVersions(nodeId);

      // Update cache
      set(
        produce((state: WorkflowSlice) => {
          state.nodeVersionListCache.set(nodeId, versions);

          // Optimization: Pre-populate the individual version cache (nodeVersionsCache).
          // This ensures that when a user clicks a version card, the data is immediately available
          // for the workspace (useTranscriptData), potentially avoiding a subsequent fetch (API 5.1.3).
          versions.forEach((version) => {
            // We conservatively update the individual cache. If the list API (5.1.2) returns summarized objects
            // (e.g., missing output_data), we don't want to overwrite a fully detailed object fetched via (5.1.3).
            const existing = state.nodeVersionsCache.get(version.id);
            if (!existing) {
                 state.nodeVersionsCache.set(version.id, version);
            }
            // If API 5.1.2 returns full objects, we could merge/overwrite here, but the conservative approach is safer.
          });
        }),
      );
      return versions;
    } catch (error) {
      console.error(
        `Failed to fetch version list for node ${nodeId}:`,
        error,
      );
      // Provide user feedback
      toast.error(`Failed to load version history.`, {
        description: `Could not retrieve the list of versions.`,
      });
      
      // Set cache value to null to indicate failure, allowing the UI to show an error state.
      set(produce((state: WorkflowSlice) => {
          // We set the value to null, but keep the key, so subsequent checks know the fetch was attempted and failed.
          state.nodeVersionListCache.set(nodeId, null);
      }));
      return null;
    }
  },

  /**
   * Fetches a specific historical version of a node and caches it centrally. (API 5.1.3)
   */
  fetchNodeVersion: async (nodeId, versionId) => {
    // Check cache first
    if (get().nodeVersionsCache.has(versionId)) {
      return get().nodeVersionsCache.get(versionId) ?? null;
    }

    try {
      // Fetch from API
      const version = await NodeService.getNodeVersionById(nodeId, versionId);
      // Update cache
      set(
        produce((state: WorkflowSlice) => {
          state.nodeVersionsCache.set(versionId, version);
        }),
      );
      return version;
    } catch (error) {
      console.error(`Failed to fetch version ${versionId} for node ${nodeId}:`, error);
      // Provide user feedback and a recovery option if fetching fails.
      toast.error(`Failed to load historical version (ID: ${versionId}).`, {
        description: "Please try again or return to the latest version.",
        action: {
          label: "View Latest",
          // Cross-slice communication to revert UI state
          onClick: () => get().viewLatestVersion(),
        },
      });
      return null;
    }
  },

  // D. Execution Control & HITL
  // (Implementations remain as provided in context - they initiate actions via API and rely on WS events above for state updates)
  reExecuteNode: async (nodeId, data = {}) => {
    set({ isExecutingAction: true });
    try {
      await NodeService.reExecuteNode(nodeId, data);
      toast.success("Re-execution started.");
      // State will be updated via WebSocket (NODE_STATUS_UPDATED -> Executing)
      return true;
    } catch (error) {
      handleExecutionError(error, "Re-execute");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  retryNode: async (nodeId, data = {}) => {
    set({ isExecutingAction: true });
    try {
      await NodeService.retryNode(nodeId, data);
      toast.success("Retry started.");
      return true;
    } catch (error) {
      handleExecutionError(error, "Retry");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  /**
   * Handles the asynchronous cancellation process (Design Doc 3.1.2.C.4, API 5.2.3, Task 17.5).
   */
  cancelNode: async (nodeId) => {
    // 1. Optimistically set pending cancellation state and start API request tracking (Design Doc 3.1.2.C.4 Step 1 & 2).
    set(
      produce((state: WorkflowSlice) => {
        // We track the API request duration (isExecutingAction) separately from the persistent pending state (pendingCancellationNodeIds).
        state.isExecutingAction = true;
        state.pendingCancellationNodeIds.add(nodeId);
      }),
    );

    try {
      // 2. Send API request
      await NodeService.cancelNode(nodeId);
      toast.success("Cancellation requested. Waiting for confirmation.");
      // We remain in pending state until WebSocket confirms 'Canceled' via handleNodeStatusUpdated.
      return true;
    } catch (error) {
      // 3. Handle API errors and revert pending state if request failed.
      set(
        produce((state: WorkflowSlice) => {
          state.pendingCancellationNodeIds.delete(nodeId);
        }),
      );

      if (error instanceof Error && error.message === "NODE_NOT_EXECUTING") {
        toast.error("Cannot cancel", {
          description: "The node is not currently executing.",
        });
      } else {
        // Use standardized error structure (Design Doc 3.1.2.B.3)
        toast.error("Cancellation Request Failed.", {
          description: "Could not send the request to the server. Please try again.",
        });
      }
      return false;
    } finally {
      // 4. Stop API request tracking, but maintain pendingCancellationNodeIds if successful.
      set({ isExecutingAction: false });
    }
  },

  submitHITL: async (nodeId, data) => {
    set({ isExecutingAction: true });
    try {
      const response = await NodeService.submitHITL(nodeId, data);
      toast.success(response.message || "Decision submitted.");

      // (Task 18): Handle specific actions requiring immediate frontend state updates
      if (response.action === HITLResponseAction.Discarded) {
        // If discarded, the pending_result is gone and the state might have reverted.
        // We must force a refetch of the node details to clear the cache and update the UI immediately. (API 5.3)
        console.log(
          `Execution discarded for node ${nodeId}. Forcing details refetch to synchronize UI.`,
        );
        // Await this to ensure cache is clean before returning response to caller.
        await get().fetchNodeDetails(nodeId, true);
      }

      // State updates via WebSocket. Response guides UI navigation (handled by HITLInteractionManager).
      return response;
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "NODE_NOT_AWAITING_APPROVAL":
            toast.error("Submission Failed", {
              description: "The node is not currently awaiting approval.",
            });
            // Force a refresh in case the local state is out of sync
            void get().fetchNodeDetails(nodeId, true);
            break;
          case "INVALID_HITL_SUBMISSION":
            toast.error("Invalid Submission", {
              description: "The provided data was invalid. Please check your inputs.",
            });
            break;
          default:
            toast.error("Failed to submit decision.");
        }
      }
      return null;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  // Design Doc 2.3.2 Task Flow: Version Switching
  activateVersion: async (nodeId, versionId) => {
    set({ isExecutingAction: true });
    try {
      // API 5.4.2 returns the updated NodeInstanceRead
      const updatedNode = await NodeService.activateVersion(nodeId, versionId);
      toast.success(`Version activated.`);

      // We rely on the WebSocket handler (NODE_ACTIVE_VERSION_CHANGED) to trigger the necessary syncs for staleness.
      // We optimistically update the local node state immediately.
      get().handleNodeStatusUpdated(updatedNode);

      // Ensure the UI interaction state is updated if we were viewing a historical version
      if (get().viewingVersionId !== null) {
        get().viewLatestVersion();
      }

      return true;
    } catch (error) {
      handleInterventionError(error, "Activate Version");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  // Design Doc 2.3.3 Task Flow: Manual Editing
  manualEdit: async (nodeId, data) => {
    set({ isExecutingAction: true });
    try {
      // API 5.4.1 returns the updated NodeInstanceRead
      const updatedNode = await NodeService.manualEdit(nodeId, data);
      toast.success("Manual edit saved as new version.");

      // Rely on WebSocket (NODE_ACTIVE_VERSION_CHANGED) for global sync.
      // Optimistically update local state.
      get().handleNodeStatusUpdated(updatedNode);

      // Exit editing mode in UI interaction slice (Cross-slice communication)
      get().stopEditing();

      return true;
    } catch (error) {
      handleInterventionError(error, "Manual Edit");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },
});

// Helper functions for error handling (Implementation remains as provided in context)
const handleExecutionError = (error: unknown, actionName: string) => {
  if (error instanceof Error) {
    switch (error.message) {
      case "INVALID_STATE_FOR_EXECUTION":
        toast.error(`${actionName} Failed`, {
          description: "The node is not in a valid state for execution.",
        });
        break;
      case "ACTION_FORBIDDEN_ON_NODE_TYPE":
        toast.error(`${actionName} Forbidden`, {
          description:
            "This action is not allowed for this node type (e.g., Generator nodes).",
        });
        break;
      default:
        toast.error(`Failed to ${actionName.toLowerCase()} node.`);
    }
  } else {
    toast.error(`Failed to ${actionName.toLowerCase()} node.`);
  }
};

const handleInterventionError = (error: unknown, actionName: string) => {
  if (error instanceof Error) {
    switch (error.message) {
      case "INVALID_STATE_OR_VERSION_MISMATCH":
        toast.error(`${actionName} Failed`, {
          description:
            "Invalid state or version mismatch. Please refresh and try again.",
        });
        break;
      case "ACTION_FORBIDDEN_ON_NODE_TYPE":
        toast.error(`${actionName} Forbidden`, {
          description: "This action is not allowed for this node type.",
        });
        break;
      default:
        toast.error(`Failed to ${actionName.toLowerCase()}.`);
    }
  } else {
    toast.error(`Failed to ${actionName.toLowerCase()}.`);
  }
};