"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuthStore } from "~/core/store/AuthStore";

export interface UseAuthOptions {
  /**
   * Whether the hook should enforce authentication. Defaults to true.
   */
  requireAuth?: boolean;
  /**
   * Path that unauthenticated users should be redirected to.
   * Defaults to `/login`.
   */
  redirectTo?: string;
  /**
   * Whether the current pathname should be preserved via the `next` query param.
   * Defaults to true.
   */
  preservePath?: boolean;
}

const DEFAULT_REDIRECT_PATH = "/login";

export function useAuth(options?: UseAuthOptions) {
  const { requireAuth = true, redirectTo = DEFAULT_REDIRECT_PATH, preservePath = true } = options ?? {};
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);

  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!requireAuth) {
      return;
    }

    if (!isInitialized || isLoading) {
      return;
    }

    if (isAuthenticated) {
      hasRedirectedRef.current = false;
      return;
    }

    if (hasRedirectedRef.current) {
      return;
    }

    hasRedirectedRef.current = true;

    const params = new URLSearchParams();
    if (preservePath && pathname && pathname !== redirectTo) {
      params.set("next", pathname);
    }

    const target = params.size > 0 ? `${redirectTo}?${params.toString()}` : redirectTo;
    router.replace(target);
  }, [
    isAuthenticated,
    isInitialized,
    isLoading,
    pathname,
    preservePath,
    redirectTo,
    requireAuth,
    router,
  ]);

  return {
    isAuthenticated,
    isInitialized,
    isLoading,
    user,
  };
}
