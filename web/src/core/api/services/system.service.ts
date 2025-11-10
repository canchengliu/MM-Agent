// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { apiClient } from "~/core/api/client";

/**
 * Represents static metadata about the backend application.
 * @see API Doc 7, Section 3 `GET /system/info`.
 */
export interface SystemInfo {
  app_version: string;
  llm_model_name: string;
  commit_hash?: string;
  build_timestamp?: string;
  documentation_url?: string;
  feature_flags?: Record<string, boolean>;
}

export const SystemService = {
  /**
   * Fetches build-time metadata for display in the About tab.
   */
  getInfo: (): Promise<SystemInfo> => {
    return apiClient<SystemInfo>("/system/info");
  },
};
