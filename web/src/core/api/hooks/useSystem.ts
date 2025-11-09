// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useQuery } from "@tanstack/react-query";

import { systemService, type HealthCheckResponse } from "../services/system.service";

export const useHealthCheck = () => {
  return useQuery<HealthCheckResponse>({
    queryKey: ["healthz"],
    queryFn: systemService.healthCheck,
    retry: 3,
    refetchInterval: 60000,
  });
};
