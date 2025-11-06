// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

type ContextualPanelVariant = "log" | "inspector";

interface ContextualPanelProps extends React.HTMLAttributes<aside> {
  title?: string;
  description?: string;
  variant?: ContextualPanelVariant;
  headerSlot?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

const VARIANT_PADDING: Record<ContextualPanelVariant, string> = {
  log: "p-inset-md",
  inspector: "p-inset-lg",
};

export function ContextualPanel({
  title,
  description,
  variant = "log",
  headerSlot,
  footer,
  children,
  className,
  ...props
}: ContextualPanelProps) {
  return (
    <aside
      className={cn(
        "glassmorphism flex h-full flex-col gap-stack-md rounded-xl",
        VARIANT_PADDING[variant],
        className,
      )}
      {...props}
    >
      {(title || description || headerSlot) && (
        <div className="flex flex-col gap-stack-xs">
          {title ? (
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-heading-small text-text-primary">{title}</h2>
              {headerSlot}
            </div>
          ) : (
            headerSlot
          )}
          {description ? (
            <p className="text-sm text-text-secondary">{description}</p>
          ) : null}
        </div>
      )}
      <div className="flex-1 overflow-hidden rounded-lg border border-border-subtle/60 bg-background-primary/50 shadow-inner shadow-black/10">
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
      {footer ? (
        <div className="border-t border-border-subtle/50 pt-3 text-xs text-text-tertiary">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}
