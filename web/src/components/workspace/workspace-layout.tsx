// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

interface WorkspaceLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  navigation: ReactNode;
  main: ReactNode;
  contextual: ReactNode;
  bottomPanel?: ReactNode;
}

export function WorkspaceLayout({
  navigation,
  main,
  contextual,
  bottomPanel,
  className,
  ...props
}: WorkspaceLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-[calc(100vh-4rem)] flex-col gap-stack-md px-6 pb-6",
        className,
      )}
      {...props}
    >
      <div className="grid flex-1 grid-cols-[minmax(240px,1fr)_minmax(0,2.5fr)_minmax(260px,1fr)] gap-stack-md">
        <div className="h-full">{navigation}</div>
        <div className="flex h-full flex-col gap-stack-md">
          <div className="flex-1 overflow-hidden rounded-xl border border-border-default bg-background-primary shadow-lg shadow-black/20">
            {main}
          </div>
          {bottomPanel ? (
            <div className="glassmorphism rounded-xl p-inset-md">{bottomPanel}</div>
          ) : null}
        </div>
        <div className="h-full">{contextual}</div>
      </div>
    </div>
  );
}
