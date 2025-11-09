// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useMemo, type ReactElement } from "react";
import {
  Code,
  Download,
  FileQuestion,
  FileText,
  Image,
  Package,
  Table,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useProjectDetail } from "~/core/api/hooks/useProjects";
import type { AssetRead } from "~/core/api/models/asset";
import { ArtifactType } from "~/core/api/models/enums";
import { assetService } from "~/core/api/services/asset-service";
import { useWorkspaceStore } from "~/core/store/workspace-store";
import { cn } from "~/lib/utils";

interface ArtifactListProps {
  snapshotId: string;
}

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes <= 0) {
    return "—";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const normalized = bytes / 1024 ** index;
  return `${normalized.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const assetIconClass = "h-5 w-5 text-primary/80";
const iconByType: Record<ArtifactType, ReactElement> = {
  [ArtifactType.DATASET]: <Table className={assetIconClass} aria-hidden />,
  [ArtifactType.REPORT_DRAFT]: <FileText className={assetIconClass} aria-hidden />,
  [ArtifactType.PROBLEM_STATEMENT]: <FileText className={assetIconClass} aria-hidden />,
  [ArtifactType.FIGURE]: <Image className={assetIconClass} aria-hidden />,
  [ArtifactType.TABLE_DATA]: <Table className={assetIconClass} aria-hidden />,
  [ArtifactType.SOURCE_CODE]: <Code className={assetIconClass} aria-hidden />,
  [ArtifactType.INTERMEDIATE_RESULT]: <FileQuestion className={assetIconClass} aria-hidden />,
  [ArtifactType.EXPORT_PACKAGE]: <Package className={assetIconClass} aria-hidden />,
};

export const ArtifactList = ({ snapshotId }: ArtifactListProps) => {
  const projectId = useWorkspaceStore((state) => state.projectId);
  const {
    data: projectDetail,
    isLoading,
    isError,
  } = useProjectDetail(projectId ?? "");

  const artifacts = useMemo(() => {
    if (!projectDetail) {
      return [];
    }

    return projectDetail.assets.filter(
      (asset: AssetRead) => asset.source_snapshot_id === snapshotId,
    );
  }, [projectDetail, snapshotId]);

  const handleDownload = async (asset: AssetRead) => {
    await toast.promise(assetService.downloadAssetContent(asset.id, asset.name), {
      loading: `Downloading ${asset.name}…`,
      success: `Downloaded ${asset.name}`,
      error: (err) => err?.message || "Failed to download asset",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    );
  }

  if (isError || !projectDetail) {
    return (
      <Alert variant="destructive" className="text-sm">
        <AlertDescription>Unable to load project assets.</AlertDescription>
      </Alert>
    );
  }

  if (!artifacts.length) {
    return (
      <p className="rounded-md border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">
        No artifacts were generated at this checkpoint.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {artifacts.map((asset) => (
        <div
          key={asset.id}
          className={cn(
            "flex items-center justify-between gap-4 rounded-lg border bg-card/80 p-3 text-sm shadow-sm",
          )}
        >
          <div className="flex flex-1 items-center gap-3">
            {iconByType[asset.type] ?? <FileQuestion className={assetIconClass} aria-hidden />}
            <div className="min-w-0">
              <p className="truncate font-medium" title={asset.name}>
                {asset.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[11px]">
                  {asset.type.replaceAll("_", " ")}
                </Badge>
                <span>{formatBytes(asset.file_size)}</span>
              </div>
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => handleDownload(asset)}
            aria-label={`Download ${asset.name}`}
          >
            <Download className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ))}
    </div>
  );
};
