// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import type { ReactNode } from "react";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

interface NavigationPanelProps extends React.HTMLAttributes<HTMLElement> {
  activeMode?: "execution" | "history";
  onModeChange?: (next: "execution" | "history") => void;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

const MODE_LABEL: Record<"execution" | "history", string> = {
  execution: "执行视图",
  history: "历史视图",
};

export function NavigationPanel({
  activeMode = "execution",
  onModeChange,
  headerExtra,
  footer,
  children,
  className,
  ...props
}: NavigationPanelProps) {
  return (
    <aside
      className={cn(
        "glassmorphism flex h-full flex-col gap-stack-md rounded-xl p-inset-md",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-stack-sm">
        <Tabs
          value={activeMode}
          onValueChange={(value) =>
            onModeChange?.(value as "execution" | "history")
          }
        >
          <TabsList className="grid grid-cols-2 gap-1 rounded-full bg-background-tertiary/70 p-1">
            {(Object.keys(MODE_LABEL) as Array<"execution" | "history">).map(
              (mode) => (
                <TabsTrigger
                  key={mode}
                  value={mode}
                  className="rounded-full text-sm font-medium data-[state=active]:bg-background-primary data-[state=active]:text-text-primary"
                >
                  {MODE_LABEL[mode]}
                </TabsTrigger>
              ),
            )}
          </TabsList>
        </Tabs>
        {headerExtra}
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-border-subtle/60 bg-background-primary/60 text-sm text-text-secondary shadow-inner shadow-black/10">
        <div className="h-full overflow-y-auto px-3 py-2">{children}</div>
      </div>

      {footer ? <div className="text-xs text-text-tertiary">{footer}</div> : null}
    </aside>
  );
}
