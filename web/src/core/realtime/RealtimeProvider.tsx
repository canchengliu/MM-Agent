"use client";

import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { toast } from "sonner";

import { getToken } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import { useAuth } from "~/core/auth/hooks";

import { dispatchEventToCache } from "./cache.updater";
import { ConnectionManager } from "./connection.manager";
import { isRealtimeEvent } from "./events.types";

const RealtimeContext = createContext<ConnectionManager | null>(null);
const connectionManager = new ConnectionManager();

export function RealtimeProvider({
  workflowId,
  children,
}: {
  workflowId: number;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const hasConnectedOnce = useRef(false);

  useEffect(() => {
    if (!user || !workflowId) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.error("[WebSocket] Cannot establish realtime connection without token.");
      return;
    }

    const handleOpen = () => {
      if (hasConnectedOnce.current) {
        toast.success("Real-time connection re-established. Syncing state...");
        void queryClient.invalidateQueries({
          queryKey: QueryKeys.workflow(workflowId),
        });
        void queryClient.invalidateQueries({
          queryKey: QueryKeys.staleness(workflowId),
        });
      } else {
        toast.success("Real-time connection established.");
        hasConnectedOnce.current = true;
      }
    };

    const handleMessage = (payload: unknown) => {
      if (isRealtimeEvent(payload)) {
        dispatchEventToCache(payload, queryClient);
        return;
      }
      console.warn("[WebSocket] Received non-event payload:", payload);
    };

    const handleClose = (payload: unknown) => {
      const { code } = (payload ?? {}) as { code?: number };
      if (code === 4001 || code === 4003) {
        toast.error("Authentication expired. Please sign in again.");
        logout();
      }
    };

    const unsubOpen = connectionManager.on("open", handleOpen);
    const unsubMessage = connectionManager.on("message", handleMessage);
    const unsubClose = connectionManager.on("close", handleClose);

    connectionManager.connect(workflowId, token);

    return () => {
      unsubOpen();
      unsubMessage();
      unsubClose();
      connectionManager.disconnect();
      hasConnectedOnce.current = false;
    };
  }, [user, workflowId, queryClient, logout]);

  return (
    <RealtimeContext.Provider value={connectionManager}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return ctx;
}
