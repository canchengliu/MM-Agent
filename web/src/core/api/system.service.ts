import { AxiosError } from "axios";

import type {
  HealthCheckResponse,
  LivenessResponse,
  SystemInfo,
} from "~/core/models/system.model";

import apiClient from "./client";

/**
 * API Service for System & Infrastructure (API 7).
 * These endpoints are public.
 */
export const SystemService = {
  /**
   * Liveness Probe (GET /) (API 7.1). Checks if the service process is running.
   */
  getLiveness: async (): Promise<LivenessResponse> => {
    // Ensure no caching (API 7 Global Conventions)
    const response = await apiClient.get<LivenessResponse>("/", {
      headers: { "Cache-Control": "no-cache" },
      timeout: 5000, // Short timeout
    });
    return response.data;
  },

  /**
   * Readiness Probe (GET /health) (API 7.2). Checks service and dependencies health.
   */
  getReadiness: async (): Promise<HealthCheckResponse> => {
    try {
      // We explicitly validate status 200. 503 will throw an AxiosError.
      const response = await apiClient.get<HealthCheckResponse>("/health", {
        headers: { "Cache-Control": "no-cache" },
        validateStatus: (status) => status === 200,
      });
      return response.data;
    } catch (error) {
      // Handle 503 Service Unavailable specifically
      if (error instanceof AxiosError && error.response?.status === 503) {
        throw new Error("SERVICE_UNHEALTHY");
      }
      throw error;
    }
  },

  /**
   * Gets system information and static configuration (GET /system/info) (API 7.3).
   */
  getSystemInfo: async (): Promise<SystemInfo> => {
    // This response can be cached by the client (handled in state management/hooks).
    const response = await apiClient.get<SystemInfo>("/system/info");
    return response.data;
  },
};
