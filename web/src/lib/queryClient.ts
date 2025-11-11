import { QueryClient } from "@tanstack/react-query";

/**
 * Shared TanStack Query client instance for the entire application.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Websocket events drive cache invalidation, so we keep background work minimal.
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Serve cached data quickly but refresh every 5 minutes for non-critical data.
      staleTime: 5 * 60 * 1000,
      // Retry transient failures twice for resilience.
      retry: 2,
    },
  },
});
