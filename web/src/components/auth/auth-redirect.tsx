// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { Loader } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCurrentUser } from "~/core/api/hooks/useUser";

interface AuthRedirectProps {
  redirectIfAuthenticated?: string;
  redirectIfNotAuthenticated?: string;
}

export function AuthRedirect({
  redirectIfAuthenticated,
  redirectIfNotAuthenticated,
}: AuthRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError, error } = useCurrentUser();

  const isUnauthorized = isError && (error as { status?: number } | undefined)?.status === 401;
  const isAuthenticated = Boolean(user) && !isUnauthorized;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (redirectIfAuthenticated && isAuthenticated) {
      router.replace(redirectIfAuthenticated);
    } else if (redirectIfNotAuthenticated && !isAuthenticated) {
      const loginUrl = new URL(redirectIfNotAuthenticated, window.location.origin);
      if (pathname && pathname !== redirectIfNotAuthenticated) {
        loginUrl.searchParams.set("redirect", pathname);
      }
      router.replace(loginUrl.toString());
    }
  }, [
    isAuthenticated,
    isLoading,
    router,
    pathname,
    redirectIfAuthenticated,
    redirectIfNotAuthenticated,
  ]);

  const isRedirecting =
    (redirectIfAuthenticated && isAuthenticated) ||
    (redirectIfNotAuthenticated && !isAuthenticated && !isLoading);

  if (isLoading || isRedirecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return null;
}
