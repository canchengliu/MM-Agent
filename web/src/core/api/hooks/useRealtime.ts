// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useEffect, useRef } from "react";

import type { BroadcastEvent } from "../models/realtime";
import { realtimeService } from "../services/realtime.service";

export const useProjectEventStream = (
  projectId: string | null,
  onEvent: (event: BroadcastEvent) => void,
) => {
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const cleanup = realtimeService.subscribeToProjectEvents(
      projectId,
      (event) => {
        onEventRef.current(event);
      },
      (error) => {
        console.error("[SSE] Connection error occurred:", error);
      },
    );

    return cleanup;
  }, [projectId]);
};
