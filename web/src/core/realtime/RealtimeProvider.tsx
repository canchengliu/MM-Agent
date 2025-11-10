// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import { getToken } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import type { WorkflowInstanceRead } from "~/core/domain";

import { connectionManager } from "./connection.manager";
import type {
  WSEventPayload,
  WSNodeStatusUpdatedPayload,
  WSWorkflowStatusUpdatedPayload,
  WSWorkflowStructureUpdatedPayload,
} from "./events.types";

interface RealtimeProviderProps {
  workflowId: number | null;
  children: ReactNode;
}

export function RealtimeProvider({
  workflowId,
  children,
}: RealtimeProviderProps) {
  const queryClient = useQueryClient();
  const isSyncing = useRef(false);
  const messageQueue = useRef<WSEventPayload[]>([]);

  const applyEventToCache = useCallback(
    (payload: WSEventPayload) => {
      if (!workflowId || payload.workflow_id !== workflowId) {
        return;
      }

      switch (payload.event_type) {
        case "NODE_STATUS_UPDATED": {
          const { node_id: nodeId, data: newNodeData } =
            payload as WSNodeStatusUpdatedPayload;
          console.log(`[WS] Applying NODE_STATUS_UPDATED for node ${nodeId}`);

          queryClient.setQueryData<WorkflowInstanceRead>(
            QueryKeys.workflow(workflowId),
            (oldData) => {
              if (!oldData) return oldData;
              const nodes = oldData.nodes.map((node) =>
                node.id === nodeId ? { ...node, ...newNodeData } : node,
              );
              return { ...oldData, nodes };
            },
          );

          void queryClient.invalidateQueries({
            queryKey: QueryKeys.node(nodeId),
          });

          if (newNodeData.status === "Completed") {
            void queryClient.invalidateQueries({
              queryKey: QueryKeys.staleness(workflowId),
            });
          }
          break;
        }

        case "WORKFLOW_STRUCTURE_UPDATED": {
          console.log("[WS] Applying WORKFLOW_STRUCTURE_UPDATED");
          const { data: newWorkflowData } =
            payload as WSWorkflowStructureUpdatedPayload;
          toast.info("Macro-architecture generated!", {
            description: "New sub-tasks have been added to the workflow.",
          });
          queryClient.setQueryData(
            QueryKeys.workflow(workflowId),
            newWorkflowData,
          );
          void queryClient.invalidateQueries({
            queryKey: QueryKeys.staleness(workflowId),
          });
          break;
        }

        case "WORKFLOW_STATUS_UPDATED": {
          console.log("[WS] Applying WORKFLOW_STATUS_UPDATED");
          const { data: newWorkflowData } =
            payload as WSWorkflowStatusUpdatedPayload;
          queryClient.setQueryData(
            QueryKeys.workflow(workflowId),
            newWorkflowData,
          );
          if (newWorkflowData.status === "Completed") {
            toast.success("Congratulations! The workflow has completed.");
          }
          break;
        }
        default:
          console.warn(`[WS] Unhandled event type: ${payload.event_type}`);
      }
    },
    [workflowId, queryClient],
  );

  const processQueue = useCallback(() => {
    const buffered = messageQueue.current;
    messageQueue.current = [];
    if (buffered.length > 0) {
      console.log(`[WS] Processing ${buffered.length} buffered messages.`);
      buffered.forEach(applyEventToCache);
    }
  }, [applyEventToCache]);

  const handleReconnect = useCallback(async () => {
    if (!workflowId || isSyncing.current) return;

    isSyncing.current = true;
    messageQueue.current = [];
    console.log("[WS] Reconnected. Starting state synchronization...");
    toast.info("Real-time connection restored. Syncing latest data...");

    try {
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: QueryKeys.workflow(workflowId),
        }),
        queryClient.refetchQueries({
          queryKey: QueryKeys.staleness(workflowId),
        }),
      ]);
      console.log("[WS] State synchronization successful.");
    } catch (error) {
      console.error("[WS] State synchronization failed:", error);
      toast.error("Could not sync data after reconnecting.");
    } finally {
      isSyncing.current = false;
      console.log("[WS] Sync finished. Processing message queue...");
      processQueue();
    }
  }, [workflowId, queryClient, processQueue]);

  const handleMessage = useCallback(
    (payload: unknown) => {
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("event_type" in payload)
      ) {
        console.warn("[WS] Received malformed message:", payload);
        return;
      }

      const event = payload as WSEventPayload;

      if (isSyncing.current) {
        console.log(`[WS] Buffering message during sync: ${event.event_type}`);
        messageQueue.current.push(event);
      } else {
        applyEventToCache(event);
      }
    },
    [applyEventToCache],
  );

  useEffect(() => {
    const token = getToken();

    if (!workflowId || !token) {
      connectionManager.disconnect();
      return;
    }

    connectionManager.onReconnect(() => {
      void handleReconnect();
    });
    connectionManager.onMessage(handleMessage);
    connectionManager.connect(workflowId, token);

    return () => {
      connectionManager.disconnect();
    };
  }, [workflowId, handleReconnect, handleMessage]);

  return <>{children}</>;
}
