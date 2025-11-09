// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { fetcher } from "../fetcher";

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  environment: string;
  app_name: string;
}

export const systemService = {
  healthCheck: async () => {
    return fetcher<HealthCheckResponse>("healthz");
  },
};
