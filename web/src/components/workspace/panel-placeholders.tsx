"use client";

import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

export const PanelContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex h-full flex-col overflow-hidden bg-background", className)}>
    {children}
  </div>
);

export const PanelHeader = ({ title }: { title: string }) => (
  <div className="shrink-0 border-b bg-background/50 p-3 text-sm font-semibold backdrop-blur-sm">
    {title}
  </div>
);

export const PanelContent = ({ children }: { children: ReactNode }) => (
  <div className="flex-1 overflow-auto p-3 text-sm text-muted-foreground">
    {children}
  </div>
);

export const BottomPanel = () => (
  <PanelContainer className="border-t bg-background/90 backdrop-blur-sm">
    <PanelHeader title="[D] Bottom Panel" />
    <PanelContent>
      <p>Integrated Tools</p>
      <ul className="mt-2 list-inside list-disc">
        <li>Problems/Output/Terminal</li>
      </ul>
    </PanelContent>
  </PanelContainer>
);
