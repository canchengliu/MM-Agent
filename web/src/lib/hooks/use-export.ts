// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getExportJobStatus, triggerProjectExport } from "~/core/api/exports";
import { ExportStatus, type ExportJobStatus } from "~/core/api/types";
import { useExportStore } from "~/core/store/export-store";

const POLLING_INTERVAL_MS = 3000;

export const useTriggerExport = () => {
  const addJob = useExportStore((state) => state.addJob);

  return useMutation({
    mutationKey: ["export", "trigger"],
    mutationFn: (projectId: string) => triggerProjectExport(projectId),
    onSuccess: (data, projectId) => {
      if (!projectId) {
        return;
      }
      addJob(data.job_id, projectId);
    },
  });
};

const resolveRefetchInterval = (data?: ExportJobStatus) => {
  if (!data) {
    return POLLING_INTERVAL_MS;
  }

  if (
    data.status === ExportStatus.Queued ||
    data.status === ExportStatus.InProgress
  ) {
    return POLLING_INTERVAL_MS;
  }

  return false;
};

export const useExportStatusPoller = (jobId: string | null) => {
  const updateJobStatus = useExportStore((state) => state.updateJobStatus);

  const queryResult = useQuery<ExportJobStatus>({
    queryKey: ["export", "status", jobId],
    queryFn: () => {
      if (!jobId) {
        throw new Error("Export job id is required to poll status.");
      }
      return getExportJobStatus(jobId);
    },
    enabled: Boolean(jobId),
    refetchInterval: (query) => resolveRefetchInterval(query.state.data),
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (queryResult.data) {
      updateJobStatus(queryResult.data.job_id, queryResult.data.status);
    }
  }, [queryResult.data, updateJobStatus]);

  return queryResult;
};
