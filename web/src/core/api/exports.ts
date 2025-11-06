// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { resolveServiceURL } from "./resolve-service-url";
import type { ExportJobStatus, ExportJobTriggered } from "./types";

async function buildErrorMessage(response: Response, fallback: string) {
  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const payload = (await response.json()) as Record<string, unknown>;
      const message = payload?.message;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    } catch {
      /* swallow JSON parse errors */
    }
  } else {
    try {
      const text = await response.text();
      if (text.trim().length > 0) {
        return text;
      }
    } catch {
      /* ignore body read failures */
    }
  }

  return fallback;
}

async function parseJsonOrThrow<T>(response: Response, fallback: string) {
  if (!response.ok) {
    const message = await buildErrorMessage(response, fallback);
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function triggerProjectExport(
  projectId: string,
): Promise<ExportJobTriggered> {
  if (!projectId) {
    throw new Error("A valid projectId is required to trigger an export.");
  }

  const url = resolveServiceURL(`v1/projects/${projectId}/export`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  return parseJsonOrThrow<ExportJobTriggered>(
    response,
    "Failed to start export job.",
  );
}

export async function getExportJobStatus(jobId: string): Promise<ExportJobStatus> {
  if (!jobId) {
    throw new Error("A valid jobId is required to query export status.");
  }

  const url = resolveServiceURL(`v1/exports/${jobId}/status`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return parseJsonOrThrow<ExportJobStatus>(
    response,
    "Failed to retrieve export job status.",
  );
}
