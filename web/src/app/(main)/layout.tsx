"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { useAuth } from "~/core/auth/hooks";
import { GlobalNavBar } from "~/features/workspace/layout/GlobalNavBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-muted/20 p-6">
      <GlobalNavBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
