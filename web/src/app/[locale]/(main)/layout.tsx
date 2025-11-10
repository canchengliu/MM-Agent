// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useRouter } from "~/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { useAuth } from "~/core/auth/hooks";
import { GlobalHeader } from "~/features/workspace/layout/GlobalHeader";

// This layout wraps all protected routes and enforces authentication.
export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <header className="flex h-12 w-full items-center border-b px-4">
          <Skeleton className="h-6 w-48" />
        </header>
        <main className="flex-grow">
          <Skeleton className="h-full w-full" />
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <GlobalHeader />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
