"use client";

import React, { memo } from "react";

import { cn } from "~/lib/utils";

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

export const AuroraText = memo(
  ({
    children,
    className = "",
    colors,
    speed = 1,
  }: AuroraTextProps) => {
    const clampedSpeed = speed > 0 ? speed : 1;
    const hasCustomPalette = Array.isArray(colors) && colors.length > 0;
    const palette = hasCustomPalette ? colors : undefined;
    const baseGradient =
      hasCustomPalette && palette
        ? `linear-gradient(135deg, ${palette.join(", ")})`
        : "var(--color-aurora-gradient)";

    const durationSeconds = 10 / clampedSpeed;
    const gradientStyle = {
      backgroundImage: baseGradient,
      backgroundSize: "200% auto",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      animationDuration: `${durationSeconds}s`,
      // Tailwind does not yet type custom CSS variables, so cast explicitly.
      "--aurora-duration": `${durationSeconds}s`,
    } as React.CSSProperties;

    return (
      <span className={cn("relative inline-flex", className)}>
        <span className="sr-only">{children}</span>
        <span
          className="relative bg-clip-text text-transparent motion-safe:animate-aurora motion-reduce:animate-none"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    );
  },
);

AuroraText.displayName = "AuroraText";
