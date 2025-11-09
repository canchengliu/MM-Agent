// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { HTMLAttributes } from "react";

import { cn } from "~/lib/utils";

interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {}

export const BentoGrid = ({ className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn("grid w-full auto-rows-[18rem] grid-cols-1 gap-4 md:grid-cols-2", className)}
      {...props}
    />
  );
};

interface BentoGridItemProps extends HTMLAttributes<HTMLDivElement> {}

export const BentoGridItem = ({ className, ...props }: BentoGridItemProps) => {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
};
