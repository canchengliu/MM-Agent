"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Target, TargetAndTransition } from "framer-motion";

import {
  reducedMotionTransition,
  usePrefersReducedMotion,
} from "~/lib/a11y/motion-preferences";
import { duration, easing, spring } from "~/lib/motion-tokens";
import { cn } from "~/lib/utils";

type MotionPreset = {
  initial: Target;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
};

const MOTION_PRESETS = {
  "fade-scale": {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: spring.default.stiffness,
        damping: spring.default.damping,
        mass: spring.default.mass,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: duration.fast,
        ease: easing.accelerate,
      },
    },
  },
  "cross-fade": {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: duration.default,
        ease: easing.standard,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: duration.default,
        ease: easing.standard,
      },
    },
  },
} satisfies Record<string, MotionPreset>;

export type MainStageTransitionPreset = keyof typeof MOTION_PRESETS;

interface MainStageContainerProps extends HTMLAttributes<HTMLDivElement> {
  contentKey: string | number;
  children: ReactNode;
  transitionPreset?: MainStageTransitionPreset;
  contentClassName?: string;
  animateOnMount?: boolean;
}

export function MainStageContainer({
  contentKey,
  children,
  className,
  contentClassName,
  transitionPreset = "fade-scale",
  animateOnMount = false,
  ...props
}: MainStageContainerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const preset = MOTION_PRESETS[transitionPreset] ?? MOTION_PRESETS["fade-scale"];
  const lowMotionPreset: MotionPreset = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: reducedMotionTransition,
    },
    exit: {
      opacity: 0,
      transition: reducedMotionTransition,
    },
  };
  const resolvedPreset = prefersReducedMotion ? lowMotionPreset : preset;

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden",
        className,
      )}
      {...props}
    >
      <AnimatePresence mode="wait" initial={animateOnMount}>
        <motion.div
          key={contentKey}
          className={cn("flex h-full w-full flex-col", contentClassName)}
          initial={resolvedPreset.initial}
          animate={resolvedPreset.animate}
          exit={resolvedPreset.exit}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
