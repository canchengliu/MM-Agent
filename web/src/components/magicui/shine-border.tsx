"use client";

import * as React from "react";

import { usePrefersReducedMotion } from "~/lib/a11y/motion-preferences";
import { cn } from "~/lib/utils";

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the border in pixels
   * @default 1
   */
  borderWidth?: number;
  /**
   * Duration of the animation in seconds
   * @default 14
   */
  duration?: number;
  /**
   * Color of the border, can be a single color or an array of colors
   * @default ["color-mix(in srgb, var(--color-border-decorative) 80%, transparent)", "color-mix(in srgb, var(--color-glow-pulse) 65%, transparent)"]
   */
  shineColor?: string | string[];
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = [
    "color-mix(in srgb, var(--color-border-decorative) 80%, transparent)",
    "color-mix(in srgb, var(--color-glow-pulse) 65%, transparent)",
  ],
  className,
  style,
  ...props
}: ShineBorderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          backgroundImage: `radial-gradient(transparent,transparent, ${
            Array.isArray(shineColor) ? shineColor.join(",") : shineColor
          },transparent,transparent)`,
          backgroundSize: "300% 300%",
          mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--border-width)",
          animationPlayState: prefersReducedMotion ? "paused" : undefined,
          backgroundPosition: prefersReducedMotion ? "50% 50%" : undefined,
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
