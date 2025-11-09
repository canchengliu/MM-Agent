// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { BroadcastEvent } from "../models/realtime";
import { resolveServiceURL } from "../resolve-service-url";

export const realtimeService = {
  subscribeToProjectEvents: (
    projectId: string,
    onEvent: (event: BroadcastEvent) => void,
    onError?: (error: Event) => void,
  ): (() => void) => {
    const url = resolveServiceURL(`projects/${projectId}/stream`);
    const eventSource = new EventSource(url, { withCredentials: true });

    const handleOpen = () => {
      console.log(`[SSE] Connection opened for project ${projectId}`);
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as BroadcastEvent;
        onEvent(data);
      } catch (parseError) {
        console.error("[SSE] Failed to parse message:", event.data, parseError);
      }
    };

    const handleError = (error: Event) => {
      console.error("[SSE] Connection error:", error);
      onError?.(error);
    };

    eventSource.addEventListener("open", handleOpen);
    eventSource.addEventListener("message", handleMessage);
    eventSource.addEventListener("error", handleError);

    return () => {
      eventSource.removeEventListener("open", handleOpen);
      eventSource.removeEventListener("message", handleMessage);
      eventSource.removeEventListener("error", handleError);
      eventSource.close();
      console.log(`[SSE] Closed connection for project ${projectId}`);
    };
  },
};
