// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

const EXPORT_DOWNLOAD_BASE_PATH = "/api/v1/exports";

const buildDownloadUrl = (jobId: string) =>
  `${EXPORT_DOWNLOAD_BASE_PATH}/${encodeURIComponent(jobId)}/download`;

export function initiateAuthenticatedDownload(jobId: string) {
  if (!jobId) {
    throw new Error("A valid export job id is required to start a download.");
  }

  if (typeof window === "undefined") {
    throw new Error("initiateAuthenticatedDownload must be used in the browser.");
  }

  const url = buildDownloadUrl(jobId);
  const link = document.createElement("a");

  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const exportsDownloadUtils = {
  initiateAuthenticatedDownload,
};
