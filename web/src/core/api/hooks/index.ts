// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useEffect, useState } from "react";

import { env } from "~/env";

import type { DeerFlowConfig } from "../../config";
import { resolveServiceURL } from "../resolve-service-url";

const DEFAULT_CONFIG: DeerFlowConfig = {
  rag: { provider: "" },
  models: { basic: [], reasoning: [] },
};

export function useConfig(): {
  config: DeerFlowConfig;
  loading: boolean;
} {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<DeerFlowConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    if (env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY) {
      setLoading(false);
      return;
    }

    const fetchConfigWithRetry = async () => {
      const maxRetries = 2;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const res = await fetch(resolveServiceURL("./config"), {
            signal: AbortSignal.timeout(5000),
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          const configData = await res.json();
          setConfig(configData);
          setLoading(false);
          return;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));

          if (attempt === 0) {
            const apiUrl = resolveServiceURL("./config");
            console.warn(`[Config] Failed to fetch from ${apiUrl}: ${lastError.message}`);
          }

          if (attempt < maxRetries) {
            const delay = 2 ** attempt * 100;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      console.warn(
        `[Config] Using default config after ${maxRetries + 1} attempts. Last error: ${lastError?.message ?? "Unknown"}`,
      );
      setConfig(DEFAULT_CONFIG);
      setLoading(false);
    };

    void fetchConfigWithRetry();
  }, []);

  return { config, loading };
}

export * from "./useAssets";
export * from "./useAuth";
export * from "./useExports";
export * from "./useProjects";
export * from "./useRealtime";
export * from "./useSettings";
export * from "./useSystem";
export * from "./useUser";
export * from "./useWorkflow";
