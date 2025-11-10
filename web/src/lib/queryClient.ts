// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { QueryClient } from "@tanstack/react-query";

/**
 * Centralized TanStack Query configuration to keep cache policy consistent app-wide.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 5 * 60 * 1000,
        retry: 2,
      },
    },
  });
}
