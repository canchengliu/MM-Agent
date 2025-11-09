// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useMutation, useQuery } from "@tanstack/react-query";

import type { ExportJobStatus } from "../models/export";
import { ExportStatus } from "../models/export";
import { exportsService } from "../services/exports.service";

const exportKeys = {
  status: (jobId: string) => ["exports", jobId, "status"] as const,
};

export const useTriggerExport = () => {
  return useMutation({
    mutationFn: (projectId: string) => exportsService.triggerExport(projectId),
  });
};

export const useExportStatus = (jobId: string) => {
  return useQuery<ExportJobStatus>({
    queryKey: exportKeys.status(jobId),
    queryFn: () => exportsService.getExportStatus(jobId),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (
        status === ExportStatus.COMPLETE ||
        status === ExportStatus.FAILED ||
        status === ExportStatus.NOT_FOUND
      ) {
        return false;
      }
      return 3000;
    },
  });
};

export const initiateExportDownload = async (jobId: string): Promise<void> => {
  try {
    const response = await exportsService.getDownload(jobId);

    if (!response.ok) {
      let errorMessage = `Download failed with status: ${response.status}.`;

      try {
        const contentType = response.headers.get("Content-Type");
        if (contentType?.includes("application/json")) {
          const errorBody = await response.json();
          if (errorBody?.message) {
            errorMessage = errorBody.message;
          }
        } else {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText.substring(0, 200);
          }
        }
      } catch {
        // Ignore parsing errors and fall back to the default message.
      }

      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition");
    let filename = `export_${jobId}.zip`;

    if (disposition?.includes("attachment")) {
      const rfc5987 = /filename\*=UTF-8''(.+?)(?:;|$)/.exec(disposition);
      if (rfc5987?.[1]) {
        filename = decodeURIComponent(rfc5987[1]);
      } else {
        const fallback = /filename="?(.+?)"?(?:;|$)/.exec(disposition);
        if (fallback?.[1]) {
          filename = fallback[1].replace(/['"]/g, "");
        }
      }
    }

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.style.display = "none";
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();

    window.URL.revokeObjectURL(url);
    anchor.remove();
  } catch (error) {
    console.error("Download process failed:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred during download.");
  }
};
