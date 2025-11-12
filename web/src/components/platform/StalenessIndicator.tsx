"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "~/lib/utils";

interface StalenessIndicatorProps {
  className?: string;
  label?: string;
}

export function StalenessIndicator({
  className,
  label,
}: StalenessIndicatorProps) {
  const t = useTranslations("workspace.staleness");
  const resolvedLabel = label ?? t("defaultLabel");

  return (
    <div
      className={cn(
        "pointer-events-none absolute -right-1.5 -top-1.5 z-10 rounded-full bg-background/95 p-1 shadow-md ring-2 ring-[hsl(var(--warning))/0.4]",
        "text-[hsl(var(--warning))]",
        className,
      )}
      aria-label={resolvedLabel}
    >
      <AlertTriangle className="size-3" aria-hidden="true" />
      <span className="sr-only">{resolvedLabel}</span>
    </div>
  );
}
