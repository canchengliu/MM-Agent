// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "~/lib/utils";

type ShineColor = string | string[];

interface ShineBorderProps extends HTMLAttributes<HTMLSpanElement> {
  shineColor?: ShineColor;
  borderWidth?: number;
  duration?: number;
}

const animationName = "shine-border__pulse";

export const ShineBorder = ({
  className,
  shineColor = ["#818cf8", "#06b6d4", "#22d3ee"],
  borderWidth = 2,
  duration = 8,
  ...props
}: ShineBorderProps) => {
  const colors = Array.isArray(shineColor) ? shineColor : [shineColor];
  const gradient = colors.join(", ");

  const style: CSSProperties = {
    borderRadius: "inherit",
    padding: borderWidth,
    background: `linear-gradient(120deg, ${gradient})`,
    backgroundSize: "200% 200%",
    animation: `${animationName} ${duration}s ease infinite`,
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  };

  return (
    <>
      <span
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 block opacity-90", className)}
        style={style}
        {...props}
      />
      <style jsx>{`
        @keyframes ${animationName} {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
};
