"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "~/lib/utils";
import { useConnectionStore } from "~/core/store/ConnectionStore";

import { Tooltip } from "./tooltip";

type Translator = (key: string, values?: Record<string, unknown>) => string;

type DerivedStatus = {
  code: "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";
  label: string;
  indicatorClass: string;
  tooltip: string;
  showBanner: boolean;
  bannerMessage?: string;
};

export function ConnectionStatusIndicator({ className }: { className?: string }) {
  const state = useConnectionStore((store) => ({
    workflowId: store.workflowId,
    isConnected: store.isConnected,
    isConnecting: store.isConnecting,
    isReconnecting: store.isReconnecting,
    lastError: store.lastError,
  }));
  const t = useTranslations("connection.status");

  const derived = deriveStatus(state, t);

  return (
    <Tooltip delayDuration={300} title={derived.tooltip}>
      <div className={cn("flex items-center gap-2 text-xs font-medium text-muted-foreground", className)}>
        <span className={cn("size-2.5 rounded-full", derived.indicatorClass)} aria-hidden />
        <span className="hidden sm:inline">{derived.label}</span>
      </div>
    </Tooltip>
  );
}

export function ConnectionStatusBanner({ className }: { className?: string }) {
  const state = useConnectionStore((store) => ({
    workflowId: store.workflowId,
    isConnected: store.isConnected,
    isConnecting: store.isConnecting,
    isReconnecting: store.isReconnecting,
    lastError: store.lastError,
  }));
  const t = useTranslations("connection.status");

  const derived = deriveStatus(state, t);

  if (!derived.showBanner) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-950/40 dark:text-amber-50",
        className,
      )}
      role="status"
    >
      <AlertTriangle className="size-4 shrink-0" />
      <span className="font-medium">{derived.bannerMessage}</span>
    </div>
  );
}

function deriveStatus(
  state: {
    workflowId: number | null;
    isConnected: boolean;
    isConnecting: boolean;
    isReconnecting: boolean;
    lastError: string | null;
  },
  t: Translator,
): DerivedStatus {
  if (!state.workflowId) {
    return {
      code: "idle",
      label: t("idle.label"),
      indicatorClass: "bg-muted-foreground/40",
      tooltip: t("idle.tooltip"),
      showBanner: false,
    };
  }

  if (state.isConnected) {
    return {
      code: "connected",
      label: t("connected.label"),
      indicatorClass: "bg-emerald-400",
      tooltip: t("connected.tooltip"),
      showBanner: false,
    };
  }

  if (state.isReconnecting) {
    return {
      code: "reconnecting",
      label: t("reconnecting.label"),
      indicatorClass: "bg-amber-400 animate-pulse",
      tooltip: t("reconnecting.tooltip"),
      showBanner: true,
      bannerMessage: t("reconnecting.banner"),
    };
  }

  if (state.isConnecting) {
    return {
      code: "connecting",
      label: t("connecting.label"),
      indicatorClass: "bg-primary/70 animate-pulse",
      tooltip: t("connecting.tooltip"),
      showBanner: false,
    };
  }

  const lastError = state.lastError?.trim();
  return {
    code: "disconnected",
    label: t("disconnected.label"),
    indicatorClass: "bg-destructive",
    tooltip: lastError || t("disconnected.tooltip"),
    showBanner: true,
    bannerMessage: lastError
      ? t("disconnected.bannerWithError", { error: lastError })
      : t("disconnected.banner"),
  };
}
