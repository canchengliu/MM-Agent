"use client";

import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import type { Metadata } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useSettingsStore } from "~/core/store/SettingsStore";
import { resolveApiErrorMessage } from "~/lib/form-error";
import { cn } from "~/lib/utils";

import { SETTINGS_TABS } from "./tabs";
import type { SettingsTabDefinition } from "./tabs/types";

export const metadata: Metadata = {
  title: "Settings | O-Award Platform",
};

export default function SettingsPage() {
  const [activeTabId, setActiveTabId] = useState<string>(SETTINGS_TABS[0]?.id ?? "interface");
  const [hasRequestedFetch, setHasRequestedFetch] = useState(false);
  const [hasCompletedInitialFetch, setHasCompletedInitialFetch] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const { settings, isLoading, fetchSettings, updateSettings } = useSettingsStore(
    useShallow((state) => ({
      settings: state.settings,
      isLoading: state.isLoading,
      fetchSettings: state.fetchSettings,
      updateSettings: state.updateSettings,
    })),
  );

  const runFetch = useCallback(async () => {
    setFetchError(null);
    try {
      await fetchSettings();
    } catch (error) {
      setFetchError(resolveApiErrorMessage(error, "无法加载设置，请稍后重试。"));
      throw error;
    } finally {
      setHasCompletedInitialFetch(true);
    }
  }, [fetchSettings]);

  useEffect(() => {
    if (hasRequestedFetch) {
      return;
    }
    setHasRequestedFetch(true);
    runFetch().catch(() => null);
  }, [hasRequestedFetch, runFetch]);

  const handleRetry = async () => {
    setIsRefetching(true);
    try {
      await runFetch();
    } catch {
      // 错误信息已在 runFetch 中处理
    } finally {
      setIsRefetching(false);
    }
  };

  const activeTab = useMemo<SettingsTabDefinition>(() => {
    return SETTINGS_TABS.find((tab) => tab.id === activeTabId) ?? SETTINGS_TABS[0]!;
  }, [activeTabId]);

  const ActiveTabComponent = activeTab.component;
  const showInitialLoader = !hasCompletedInitialFetch && isLoading;
  const isTabBusy = isLoading || isRefetching;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">用户设置中心</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          管理界面偏好、工作流引擎 (BYOK) 与 AI 行为配置。所有更改会即时同步到当前工作区。
        </p>
      </header>

      {fetchError ? (
        <div className="mt-6 flex items-start justify-between gap-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 flex-none" />
            <span>{fetchError}</span>
          </div>
          <Button
            disabled={isRefetching}
            onClick={handleRetry}
            size="sm"
            type="button"
            variant="outline"
          >
            {isRefetching ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                正在重试
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 size-4" />
                重新加载
              </>
            )}
          </Button>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64">
          <nav className="space-y-2">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-left transition",
                  "border-border/60 hover:border-border hover:bg-muted/60",
                  activeTabId === tab.id
                    ? "border-primary/70 bg-primary/5 text-primary"
                    : "text-muted-foreground",
                )}
                onClick={() => setActiveTabId(tab.id)}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="size-4 flex-none" />
                  <div>
                    <p className="text-sm font-semibold">{tab.label}</p>
                    <p className="text-xs">{tab.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1">
          <Card className="border border-border/70">
            <CardHeader>
              <CardTitle>{activeTab.label}</CardTitle>
              <CardDescription>{activeTab.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {showInitialLoader ? (
                <SettingsFormSkeleton />
              ) : (
                <ActiveTabComponent
                  isLoading={isTabBusy}
                  onSubmit={updateSettings}
                  settings={settings}
                />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function SettingsFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-40" />
    </div>
  );
}
