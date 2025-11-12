import { produce } from "immer";
import { create } from "zustand";

import { NodeService, WorkflowService } from "~/core/api";
import type {
  ExecutionRequest,
  HITLSubmission,
  HitlSubmissionResult,
  ManualEditSubmission,
  NodeActionAck,
  NodeInstanceRead,
  WorkflowInstanceRead,
} from "~/core/api";

import { useInspectorStore } from "./InspectorStore";

interface NormalizedWorkflow {
  nodes: Record<number, NodeInstanceRead>;
}

export interface WorkflowState {
  workflow: WorkflowInstanceRead | null;
  nodes: Record<number, NodeInstanceRead>;
  isLoading: boolean;

  loadWorkflow: (workflowId: number) => Promise<void>;
  refreshWorkflow: () => Promise<void>;
  clearWorkflow: () => void;

  reExecuteNode: (nodeId: number, request?: ExecutionRequest) => Promise<NodeActionAck>;
  retryNode: (nodeId: number, request?: ExecutionRequest) => Promise<NodeActionAck>;
  cancelNode: (nodeId: number) => Promise<NodeActionAck>;
  submitHITL: (nodeId: number, submission: HITLSubmission) => Promise<HitlSubmissionResult>;
  manualEdit: (nodeId: number, submission: ManualEditSubmission) => Promise<NodeInstanceRead>;
  submitManualEdit: (nodeId: number, submission: ManualEditSubmission) => Promise<NodeInstanceRead>;
  activateVersion: (nodeId: number, versionId: number) => Promise<NodeInstanceRead>;

  _processNodeUpdate: (nodeData: NodeInstanceRead) => void;
  _processStructureUpdate: (workflowData: WorkflowInstanceRead) => void;
}

const INITIAL_DATA: Pick<WorkflowState, "workflow" | "nodes" | "isLoading"> = {
  workflow: null,
  nodes: {},
  isLoading: false,
};

const normalizeWorkflow = (workflow: WorkflowInstanceRead): NormalizedWorkflow => {
  const nodes: Record<number, NodeInstanceRead> = {};
  for (const phase of workflow.phases) {
    for (const stage of phase.stages) {
      for (const node of stage.nodes) {
        nodes[node.id] = node;
      }
    }
  }
  return { nodes };
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  ...INITIAL_DATA,

  loadWorkflow: async (workflowId: number) => {
    set({ isLoading: true });
    try {
      const workflowData = await WorkflowService.getDetail(workflowId);
      const { nodes } = normalizeWorkflow(workflowData);
      set({ workflow: workflowData, nodes, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  refreshWorkflow: async () => {
    const workflowId = get().workflow?.id;
    if (!workflowId) return;
    await get().loadWorkflow(workflowId);
  },

  clearWorkflow: () => {
    set({ ...INITIAL_DATA });
    const inspectorStore = useInspectorStore.getState();
    inspectorStore.clearSelection();
    inspectorStore.resetCaches();
  },

  reExecuteNode: (nodeId, request = {}) => {
    return NodeService.reExecute(nodeId, request);
  },

  retryNode: (nodeId, request = {}) => {
    return NodeService.retry(nodeId, request);
  },

  cancelNode: (nodeId) => {
    return NodeService.cancel(nodeId);
  },

  submitHITL: async (nodeId, submission) => {
    const result = await NodeService.submitHITL(nodeId, submission);
    const inspectorStore = useInspectorStore.getState();

    const navigateToNode = (targetId?: number | null) => {
      if (typeof targetId === "number") {
        void inspectorStore.selectNode(targetId);
      }
    };

    switch (result.action) {
      case "ExecuteNext":
      case "NavigateNext": {
        navigateToNode(result.next_node_id ?? null);
        break;
      }
      case "Discarded":
      case "ReExecute":
      case "AVLLoop":
      case "Completed": {
        if (inspectorStore.selectedNodeId === nodeId) {
          void inspectorStore.selectNode(nodeId);
        }
        break;
      }
      default:
        break;
    }

    return result;
  },

  manualEdit: async (nodeId, submission) => {
    const updatedNode = await NodeService.manualEdit(nodeId, submission);
    get()._processNodeUpdate(updatedNode);
    return updatedNode;
  },

  submitManualEdit: async (nodeId, submission) => {
    return get().manualEdit(nodeId, submission);
  },

  activateVersion: async (nodeId, versionId) => {
    const updatedNode = await NodeService.activateVersion(nodeId, versionId);
    get()._processNodeUpdate(updatedNode);
    return updatedNode;
  },

  _processNodeUpdate: (nodeData) => {
    set(
      produce((state: WorkflowState) => {
        state.nodes[nodeData.id] = nodeData;
        if (!state.workflow) return;
        for (const phase of state.workflow.phases) {
          let found = false;
          for (const stage of phase.stages) {
            const index = stage.nodes.findIndex((node) => node.id === nodeData.id);
            if (index !== -1) {
              stage.nodes[index] = nodeData;
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }),
    );
  },

  _processStructureUpdate: (workflowData) => {
    const { nodes } = normalizeWorkflow(workflowData);
    set({ workflow: workflowData, nodes, isLoading: false });
    const inspectorStore = useInspectorStore.getState();
    inspectorStore.resetCaches();
    inspectorStore.clearSelection();
  },
}));
