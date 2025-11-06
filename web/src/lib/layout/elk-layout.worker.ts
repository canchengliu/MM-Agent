/// <reference lib="webworker" />

// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import ELK from "elkjs/lib/elk.bundled.js";

import { createElkGraphFromRequest } from "./elk-layout.shared";
import type {
  LayoutWorkerRequest,
  LayoutWorkerResponse,
  LayoutWorkerSuccess,
  LayoutWorkerError,
} from "./elk-layout.shared";

const elk = new ELK();

self.onmessage = async (event: MessageEvent<LayoutWorkerRequest>) => {
  const request = event.data;

  try {
    const graph = createElkGraphFromRequest(request);
    const layout = await elk.layout(graph, request.layoutArguments);

    const positions: Record<string, { x: number; y: number }> = {};
    if (Array.isArray(layout.children)) {
      for (const child of layout.children) {
        if (!child?.id) {
          continue;
        }

        const x = typeof child.x === "number" ? child.x : 0;
        const y = typeof child.y === "number" ? child.y : 0;
        positions[child.id] = { x, y };
      }
    }

    const response: LayoutWorkerSuccess = {
      id: request.id,
      type: "success",
      positions,
    };

    postMessage(response satisfies LayoutWorkerResponse);
  } catch (error) {
    const normalized =
      error instanceof Error
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack,
          }
        : {
            message: "Unknown error while running ELK layout.",
            name: "UnknownError",
          };

    const response: LayoutWorkerError = {
      id: request.id,
      type: "error",
      error: normalized,
    };

    postMessage(response satisfies LayoutWorkerResponse);
  }
};
