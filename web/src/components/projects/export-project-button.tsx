"use client";

import { useEffect, useState } from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Tooltip } from "~/components/deer-flow/tooltip";
import { Button } from "~/components/ui/button";
import {
  initiateExportDownload,
  useExportStatus,
  useTriggerExport,
} from "~/core/api/hooks/useExports";
import { ExportStatus } from "~/core/api/models/export";

interface ExportProjectButtonProps {
  projectId: string;
}

const getStorageKey = (projectId: string) => `exportJobId:${projectId}`;

export function ExportProjectButton({ projectId }: ExportProjectButtonProps) {
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    const storedJobId = sessionStorage.getItem(getStorageKey(projectId));
    if (storedJobId) {
      setJobId(storedJobId);
    }
  }, [projectId]);

  const updateJobId = (newJobId: string | null) => {
    setJobId(newJobId);
    const key = getStorageKey(projectId);
    if (newJobId) {
      sessionStorage.setItem(key, newJobId);
    } else {
      sessionStorage.removeItem(key);
    }
  };

  const { mutate: triggerExport, isPending: isTriggering } = useTriggerExport();
  const { data: statusData, error: statusError } = useExportStatus(jobId || "");
  const currentStatus = statusData?.status;

  useEffect(() => {
    if (!jobId || !currentStatus) return;

    switch (currentStatus) {
      case ExportStatus.COMPLETE:
        toast.success("Export complete!", {
          description: "Your download should start automatically.",
        });

        initiateExportDownload(jobId)
          .catch((error) => {
            toast.error("Failed to download the export file.", {
              description: error instanceof Error ? error.message : "Please try exporting again.",
            });
          })
          .finally(() => {
            updateJobId(null);
          });
        break;
      case ExportStatus.FAILED:
        toast.error("Export failed.", {
          description: statusData?.error ?? "An unknown error occurred during processing.",
        });
        updateJobId(null);
        break;
      case ExportStatus.NOT_FOUND:
        console.warn(`Export job ${jobId} not found, potentially expired. Clearing tracked job.`);
        updateJobId(null);
        break;
      default:
        break;
    }
  }, [currentStatus, jobId, statusData?.error]);

  useEffect(() => {
    if (statusError && jobId) {
      console.warn("Error fetching export status (will retry):", statusError.message);
    }
  }, [statusError, jobId]);

  const isExporting =
    isTriggering ||
    (jobId !== null &&
      (!currentStatus ||
        currentStatus === ExportStatus.QUEUED ||
        currentStatus === ExportStatus.IN_PROGRESS));

  const handleExportClick = () => {
    if (isExporting) return;

    triggerExport(projectId, {
      onSuccess: (data) => {
        updateJobId(data.job_id);
        toast.success("Export job started.", {
          description: `Preparing your files. Tracking ID: ${data.job_id}`,
        });
      },
      onError: (error) => {
        toast.error("Failed to start export job.", {
          description: error.message || "Could not connect to the server.",
        });
      },
    });
  };

  const getButtonContent = () => {
    if (isTriggering) {
      return (
        <>
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          Starting...
        </>
      );
    }

    if (isExporting) {
      let statusText = "Processing...";
      if (currentStatus === ExportStatus.QUEUED) statusText = "Queued...";
      else if (currentStatus === ExportStatus.IN_PROGRESS) statusText = "Exporting...";

      return (
        <>
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          {statusText}
        </>
      );
    }

    return (
      <>
        <DownloadIcon className="mr-2 h-4 w-4" />
        Export
      </>
    );
  };

  const tooltipText = isExporting ? "Export is currently in progress." : "Export project results package (.zip)";

  return (
    <Tooltip title={tooltipText}>
      <div>
        <Button disabled={isExporting} size="sm" variant="outline" onClick={handleExportClick}>
          {getButtonContent()}
        </Button>
      </div>
    </Tooltip>
  );
}
