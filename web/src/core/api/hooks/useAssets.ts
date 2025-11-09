// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AssetContentUpdate } from "../models/asset";
import type { ArtifactType } from "../models/enums";
import { assetsService } from "../services/assets.service";

export const useUploadAsset = () => {
  return useMutation({
    mutationFn: ({
      file,
      type,
      signal,
    }: {
      file: File;
      type: ArtifactType;
      signal?: AbortSignal;
    }) => assetsService.uploadAsset(file, type, signal),
    onSuccess: (asset) => {
      toast.success(`Asset "${asset.name}" uploaded successfully (ID: ${asset.id}).`);
    },
  });
};

export const useUpdateAssetContent = () => {
  return useMutation({
    mutationFn: ({
      assetId,
      data,
      signal,
    }: {
      assetId: string;
      data: AssetContentUpdate;
      signal?: AbortSignal;
    }) => assetsService.updateAssetContent(assetId, data, signal),
  });
};

export const initiateAssetDownload = async (assetId: string) => {
  try {
    const response = await assetsService.downloadAssetContent(assetId);

    const disposition = response.headers.get("Content-Disposition");
    let filename = `asset_${assetId}`;

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

    const blob = await response.blob();
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
    console.error("Download failed:", error);
  }
};
