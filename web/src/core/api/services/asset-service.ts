// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { authenticatedFetch } from "../authenticated-fetch";

const FILENAME_STAR_REGEX = /filename\*=UTF-8''([^;]+)/i;
const FILENAME_REGEX = /filename="?([^";]+)"?/i;

const parseFilename = (header: string | null, fallback: string): string => {
  if (!header) {
    return fallback;
  }

  const filenameStar = FILENAME_STAR_REGEX.exec(header);
  if (filenameStar?.[1]) {
    try {
      return decodeURIComponent(filenameStar[1].trim());
    } catch {
      // ignore decoding issue and fall back
    }
  }

  const filenameMatch = FILENAME_REGEX.exec(header);
  if (filenameMatch?.[1]) {
    return filenameMatch[1].trim().replace(/"/g, "");
  }

  return fallback;
};

export const assetService = {
  /**
   * Downloads the asset content (API 6.2) and triggers a browser download.
   */
  async downloadAssetContent(
    assetId: string,
    defaultFilename: string,
    signal?: AbortSignal,
  ): Promise<void> {
    const response = await authenticatedFetch(`assets/${assetId}/content`, {
      method: "GET",
      signal,
    });

    const filename = parseFilename(
      response.headers.get("Content-Disposition"),
      defaultFilename || `asset_${assetId}`,
    );

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.style.display = "none";
    anchor.href = downloadUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    window.URL.revokeObjectURL(downloadUrl);
    anchor.remove();
  },
};
