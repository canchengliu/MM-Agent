"use client";

import { Sparkles } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { AuroraText } from "~/components/magicui/aurora-text";
import { cn } from "~/lib/utils";

interface BranchInfoBannerProps extends HTMLAttributes<HTMLDivElement> {
  branchName: string;
  sourceBranchLabel?: string | null;
  description?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export function BranchInfoBanner({
  branchName,
  sourceBranchLabel,
  description,
  onDismiss,
  dismissLabel = "Dismiss",
  className,
  ...props
}: BranchInfoBannerProps) {
  const defaultDescription = (
    <p className="text-sm text-text-secondary">
      You are exploring{" "}
      <AuroraText className="mx-1 text-base font-semibold leading-none">
        {branchName}
      </AuroraText>
      {sourceBranchLabel ? (
        <>
          (derived from{" "}
          <AuroraText className="mx-1 text-sm font-semibold leading-none">
            {sourceBranchLabel}
          </AuroraText>
          )
        </>
      ) : null}
      .
    </p>
  );

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-between gap-4 rounded-xl border border-border-interactive bg-background-primary/90 px-5 py-3 shadow-lg shadow-black/15",
        "backdrop-blur-md",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 items-start gap-3">
        <div className="flex size-8 items-center justify-center rounded-full border border-border-interactive/60 bg-background-secondary/70 text-text-accent shadow-inner shadow-black/10">
          <Sparkles className="size-4" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-tertiary">
            Active Branch
          </span>
          {description ?? defaultDescription}
        </div>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-full border border-border-subtle/70 bg-background-secondary/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary transition-colors hover:border-border-interactive hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused"
        >
          {dismissLabel}
        </button>
      ) : null}
    </div>
  );
}
