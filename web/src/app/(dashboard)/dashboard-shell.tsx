"use client";

import { useTranslations } from "next-intl";
import { Suspense, type ReactNode } from "react";

import { ConnectionStatusBanner, GlobalNavbar } from "~/components/platform";
import { useAuth } from "~/hooks/useAuth";

interface DashboardShellProps {
  platformName: string;
  children: ReactNode;
}

export function DashboardShell({ platformName, children }: DashboardShellProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const canRenderApp = isInitialized && isAuthenticated;
  const t = useTranslations("dashboard.shell");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <GlobalNavbar platformName={platformName} />
      <ConnectionStatusBanner />
      <main className="flex-1">
        {canRenderApp ? (
          <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">{t("loading.view")}</div>}>
            {children}
          </Suspense>
        ) : (
          <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
            <p className="text-base font-medium text-foreground">{t("loading.sessionTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("loading.sessionSubtitle")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
