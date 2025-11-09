// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { fetcher } from "../fetcher";
import { resolveServiceURL } from "../resolve-service-url";
import type { AssetContentUpdate, AssetRead } from "../models/asset";
import type { ArtifactType } from "../models/enums";

export const assetsService = {
  uploadAsset: async (file: File, type: ArtifactType, signal?: AbortSignal) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    return fetcher<AssetRead>("assets/upload", {
      method: "POST",
      body: formData,
      isMultipart: true,
      signal,
    });
  },

  getAssetContentUrl: (assetId: string) => {
    return resolveServiceURL(`assets/${assetId}/content`);
  },

  downloadAssetContent: async (assetId: string, signal?: AbortSignal) => {
    return fetcher<Response>(`assets/${assetId}/content`, {
      rawResponse: true,
      signal,
    });
  },

  updateAssetContent: async (
    assetId: string,
    data: AssetContentUpdate,
    signal?: AbortSignal,
  ) => {
    return fetcher<AssetRead>(`assets/${assetId}/content`, {
      method: "PATCH",
      body: data,
      signal,
    });
  },
};
