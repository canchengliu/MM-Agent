// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { toast } from "sonner";

import { ExportStatus } from "~/core/api/types";
import { useExportStatusPoller } from "~/lib/hooks/use-export";
import {
  type ExportJobRecord,
  selectActiveExportJobs,
  useExportStore,
} from "~/core/store/export-store";
import { initiateAuthenticatedDownload } from "~/core/utils/download";

interface ExportJobHandlerProps extends ExportJobRecord {
  jobId: string;
}

export function ExportStatusMonitor() {
  const activeJobs = useExportStore(selectActiveExportJobs);

  const jobs = useMemo(() => Array.from(activeJobs.entries()), [activeJobs]);

  if (jobs.length === 0) {
    return null;
  }

  return jobs.map(([jobId, record]) => (
    <ExportJobHandler key={jobId} jobId={jobId} {...record} />
  ));
}

function ExportJobHandler({ jobId, projectId, status }: ExportJobHandlerProps) {
  const removeJob = useExportStore((state) => state.removeJob);
  const { data, isError, error } = useExportStatusPoller(jobId);

  const toastIdRef = useRef<string | number | null>(null);
  const lastStatusRef = useRef<ExportStatus | null>(null);
  const dismissOnUnmountRef = useRef(true);
  const hasFinalizedRef = useRef(false);

  useEffect(() => {
    const toastId = toast.loading("正在准备导出结果包…", {
      id: jobId,
      duration: Infinity,
    });
    toastIdRef.current = toastId;

    return () => {
      if (toastIdRef.current && dismissOnUnmountRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [jobId]);

  const downloadExport = useCallback(() => {
    if (!toastIdRef.current) {
      return;
    }

    try {
      initiateAuthenticatedDownload(jobId);
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : "下载导出包时出现问题，请稍后重试。";
      toast.error(message, { id: toastIdRef.current, duration: 8000 });
      return;
    }

    dismissOnUnmountRef.current = false;
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }
    hasFinalizedRef.current = true;
    removeJob(jobId);
  }, [jobId, removeJob]);

  useEffect(() => {
    if (!toastIdRef.current) {
      return;
    }

    if (!status || status === lastStatusRef.current) {
      return;
    }

    switch (status) {
      case ExportStatus.Queued: {
        dismissOnUnmountRef.current = true;
        toast.loading("导出任务已排队，正在等待可用资源…", {
          id: toastIdRef.current,
          duration: Infinity,
        });
        break;
      }
      case ExportStatus.InProgress: {
        dismissOnUnmountRef.current = true;
        toast.loading("正在生成导出结果包…", {
          id: toastIdRef.current,
          duration: Infinity,
        });
        break;
      }
      case ExportStatus.Complete: {
        dismissOnUnmountRef.current = false;
        toast.success("导出完成，可立即下载。", {
          id: toastIdRef.current,
          duration: 120000,
          description: `项目 ${projectId} 的导出包已经准备就绪。`,
          action: {
            label: "下载",
            onClick: downloadExport,
          },
        });
        break;
      }
      case ExportStatus.Failed: {
        if (hasFinalizedRef.current) {
          break;
        }
        dismissOnUnmountRef.current = false;
        const failureMessage =
          data?.error && data.error.trim().length > 0
            ? data.error
            : "导出失败，请稍后重试。";
        toast.error(failureMessage, {
          id: toastIdRef.current,
          duration: 10000,
        });
        hasFinalizedRef.current = true;
        removeJob(jobId);
        break;
      }
      default:
        break;
    }

    lastStatusRef.current = status;
  }, [status, data?.error, downloadExport, jobId, projectId, removeJob]);

  useEffect(() => {
    if (!isError || !toastIdRef.current || hasFinalizedRef.current) {
      return;
    }

    dismissOnUnmountRef.current = false;
    const message =
      error instanceof Error
        ? error.message
        : "查询导出状态时出现问题，请稍后重试。";
    toast.error(message, {
      id: toastIdRef.current,
      duration: 10000,
    });
    hasFinalizedRef.current = true;
    removeJob(jobId);
  }, [error, isError, jobId, removeJob]);

  return null;
}
