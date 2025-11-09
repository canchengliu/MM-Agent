// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { fetcher } from "../fetcher";
import type { ExportJobStatus, ExportJobTriggered } from "../models/export";

export const exportsService = {
  triggerExport: async (projectId: string) => {
    return fetcher<ExportJobTriggered>(`projects/${projectId}/export`, {
      method: "POST",
    });
  },

  getExportStatus: async (jobId: string) => {
    return fetcher<ExportJobStatus>(`exports/${jobId}/status`);
  },

  getDownload: async (jobId: string) => {
    return fetcher<Response>(`exports/${jobId}/download`, { rawResponse: true });
  },
};
