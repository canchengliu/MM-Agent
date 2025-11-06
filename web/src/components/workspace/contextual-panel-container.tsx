"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Target, TargetAndTransition } from "framer-motion";

import {
  reducedMotionTransition,
  usePrefersReducedMotion,
} from "~/lib/a11y/motion-preferences";
import { duration, easing } from "~/lib/motion-tokens";
import { cn } from "~/lib/utils";

type MotionPreset = {
  initial: Target;
  animate: (delay: number) => TargetAndTransition;
  exit: TargetAndTransition;
};

const DEFAULT_DELAY = 0.1;

const MOTION_PRESET: MotionPreset = {
  initial: { opacity: 0 },
  animate: (delay) => ({
    opacity: 1,
    transition: {
      duration: duration.default,
      ease: easing.standard,
      delay,
    },
  }),
  exit: {
    opacity: 0,
    transition: {
      duration: duration.default,
      ease: easing.standard,
    },
  },
};

interface ContextualPanelContainerProps extends HTMLAttributes<HTMLDivElement> {
  contentKey: string | number;
  children: ReactNode;
  contentClassName?: string;
  animateOnMount?: boolean;
  entryDelay?: number;
}

export function ContextualPanelContainer({
  contentKey,
  children,
  className,
  contentClassName,
  animateOnMount = false,
  entryDelay = DEFAULT_DELAY,
  ...props
}: ContextualPanelContainerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const delay = Math.max(0, entryDelay);
  const lowMotionPreset: MotionPreset = {
    initial: { opacity: 0 },
    animate: () => ({
      opacity: 1,
      transition: reducedMotionTransition,
    }),
    exit: {
      opacity: 0,
      transition: reducedMotionTransition,
    },
  };
  const resolvedPreset = prefersReducedMotion ? lowMotionPreset : MOTION_PRESET;

  return (
    <div
      className={cn("relative flex h-full w-full flex-col overflow-hidden", className)}
      {...props}
    >
      <AnimatePresence mode="wait" initial={animateOnMount}>
        <motion.div
          key={contentKey}
          className={cn("flex h-full w-full flex-col", contentClassName)}
          initial={resolvedPreset.initial}
          animate={resolvedPreset.animate(prefersReducedMotion ? 0 : delay)}
          exit={resolvedPreset.exit}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
