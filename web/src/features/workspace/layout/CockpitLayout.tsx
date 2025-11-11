"use client";

import React from "react";

export function CockpitLayout({
  navigator,
  canvas,
  inspector,
}: {
  navigator: React.ReactNode;
  canvas: React.ReactNode;
  inspector: React.ReactNode;
}) {
  return (
    <div className="grid h-full grid-cols-[320px_1fr_320px] gap-4">
      <div className="rounded border border-border bg-card">{navigator}</div>
      <div className="rounded border border-border bg-background">
        {canvas}
      </div>
      <div className="rounded border border-border bg-card">{inspector}</div>
    </div>
  );
}
