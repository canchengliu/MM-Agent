import { apiClient } from "~/core/api/client";
import type { SystemInfo } from "~/core/domain/system.types";

/**
 * Service for interacting with system metadata endpoints.
 */
export const SystemService = {
  /**
   * Fetches static application metadata such as version and default LLM.
   */
  async getInfo(signal?: AbortSignal): Promise<SystemInfo> {
    return apiClient<SystemInfo>("/system/info", { signal });
  },

  /**
   * Placeholder historical problem API per spec (unused in UI).
   */
  async getHistoricalProblems(): Promise<Array<{ id: number; title: string }>> {
    return [];
  },
};
