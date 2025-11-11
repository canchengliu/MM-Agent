"use client";

import { useQuery } from "@tanstack/react-query";

import { QueryKeys } from "~/core/api/queryKeys";
import { SystemService } from "~/core/api/services/system.service";

/**
 * Fetches static system metadata (version, default LLM, etc.).
 * Cached indefinitely because backend reports static build info.
 */
export function useSystemInfo() {
  return useQuery({
    queryKey: QueryKeys.systemInfo(),
    queryFn: ({ signal }) => SystemService.getInfo(signal),
    staleTime: Infinity,
  });
}

