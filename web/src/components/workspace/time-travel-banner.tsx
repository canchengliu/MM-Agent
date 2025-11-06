"use client";

import { Clock3 } from "lucide-react";
import type { HTMLAttributes } from "react";
import { useEffect, useMemo, useRef } from "react";

import { RollingText } from "~/components/deer-flow/rolling-text";
import { NumberTicker } from "~/components/magicui/number-ticker";
import { cn } from "~/lib/utils";

interface TimeTravelBannerProps extends HTMLAttributes<HTMLDivElement> {
  snapshotLabel?: string | null;
  snapshotId?: string | null;
  stepIndex?: number | null;
  timestamp?: string | Date | null;
  threadName?: string | null;
  branchName?: string | null;
}

type NumberTickerConfig = {
  value: number;
  startValue: number;
  direction: "up" | "down";
};

function formatTimestamp(value?: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

function abbreviateSnapshotId(snapshotId?: string | null): string | null {
  if (!snapshotId?.trim()) {
    return null;
  }
  const normalized = snapshotId.trim();
  if (normalized.length <= 12) {
    return normalized;
  }
  return `${normalized.slice(0, 6)}…${normalized.slice(-4)}`;
}

function resolveTickerConfig(
  stepIndex: number | null,
  previousStep: number | null,
): NumberTickerConfig | null {
  if (stepIndex == null || Number.isNaN(stepIndex)) {
    return null;
  }

  if (previousStep == null || Number.isNaN(previousStep)) {
    return {
      value: stepIndex,
      startValue: stepIndex,
      direction: "up",
    };
  }

  if (stepIndex < previousStep) {
    return {
      value: previousStep,
      startValue: stepIndex,
      direction: "down",
    };
  }

  if (stepIndex > previousStep) {
    return {
      value: stepIndex,
      startValue: previousStep,
      direction: "up",
    };
  }

  return {
    value: stepIndex,
    startValue: stepIndex,
    direction: "up",
  };
}

export function TimeTravelBanner({
  snapshotLabel,
  snapshotId,
  stepIndex,
  timestamp,
  threadName,
  branchName,
  className,
  ...props
}: TimeTravelBannerProps) {
  const trimmedLabel = snapshotLabel?.trim() ?? null;
  const trimmedSnapshotId = snapshotId?.trim() ?? null;
  const normalizedStep =
    typeof stepIndex === "number" && Number.isFinite(stepIndex)
      ? Math.trunc(stepIndex)
      : null;

  const previousStepRef = useRef<number | null>(null);
  const previousStep = previousStepRef.current;

  const tickerConfig = useMemo(
    () => resolveTickerConfig(normalizedStep, previousStep),
    [normalizedStep, previousStep],
  );

  useEffect(() => {
    if (normalizedStep != null) {
      previousStepRef.current = normalizedStep;
    }
  }, [normalizedStep]);

  const timestampLabel = useMemo(() => formatTimestamp(timestamp), [timestamp]);
  const snapshotPrimary =
    trimmedLabel ?? abbreviateSnapshotId(trimmedSnapshotId) ?? "Historical Snapshot";
  const snapshotSecondary =
    trimmedLabel && trimmedSnapshotId
      ? `ID ${abbreviateSnapshotId(trimmedSnapshotId)}`
      : null;

  return (
    <div
      className={cn(
        "relative flex w-full items-start gap-4 rounded-xl border border-border-interactive bg-background-primary/95 px-5 py-4 text-sm shadow-lg shadow-black/15 backdrop-blur-md",
        className,
      )}
      {...props}
    >
      <div className="flex size-10 items-center justify-center rounded-lg border border-border-interactive/60 bg-background-secondary/80 text-text-accent shadow-inner shadow-black/10">
        <Clock3 className="size-5" />
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-text-tertiary">
            Time Travel Mode
          </span>
          <span className="rounded-full border border-border-subtle/60 bg-background-secondary/70 px-2 py-0.5 text-[0.68rem] font-medium uppercase tracking-wide text-text-secondary">
            Read-only
          </span>
          {branchName ? (
            <span className="text-xs text-text-tertiary">
              Branch{" "}
              <span className="font-medium text-text-secondary">{branchName}</span>
            </span>
          ) : null}
          {threadName ? (
            <span className="text-xs text-text-tertiary">
              Thread{" "}
              <span className="font-medium text-text-secondary">{threadName}</span>
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm leading-tight text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
              Snapshot
            </span>
            <RollingText className="text-base font-semibold text-text-primary">
              {snapshotPrimary}
            </RollingText>
            {snapshotSecondary ? (
              <RollingText className="text-xs uppercase tracking-[0.28em] text-text-tertiary">
                {snapshotSecondary}
              </RollingText>
            ) : null}
          </div>

          {tickerConfig ? (
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
                Step
              </span>
              <NumberTicker
                key={`${tickerConfig.startValue}-${tickerConfig.value}-${tickerConfig.direction}`}
                value={tickerConfig.value}
                startValue={tickerConfig.startValue}
                direction={tickerConfig.direction}
                decimalPlaces={0}
                className="text-base font-semibold text-text-accent"
              />
            </div>
          ) : null}

          {timestampLabel ? (
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
                Viewed
              </span>
              <RollingText className="text-sm text-text-secondary">
                {timestampLabel}
              </RollingText>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
