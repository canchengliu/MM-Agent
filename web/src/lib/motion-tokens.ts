import type { Transition } from "framer-motion";

/**
 * Tokenized motion parameters defined by the Motion System specification.
 * These tokens centralize all easing, duration, and spring physics values so
 * animations across the app stay consistent with the design system.
 */
export const duration = {
  quick: 0.15,
  fast: 0.25,
  default: 0.35,
  slow: 0.5,
} as const;

export const easing = {
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0.0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
} as const;

export const spring = {
  quick: {
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  default: {
    stiffness: 250,
    damping: 35,
    mass: 1,
  },
  gentle: {
    stiffness: 180,
    damping: 40,
    mass: 1,
  },
} as const;

type MotionTransition = Transition & {
  ease?: Transition["ease"];
};

export const transitions = {
  enter: {
    duration: duration.fast,
    ease: easing.decelerate,
  },
  exit: {
    duration: duration.quick,
    ease: easing.accelerate,
  },
  slideIn: {
    duration: duration.slow,
    ease: easing.standard,
  },
  propertyChange: {
    duration: duration.quick,
    ease: easing.decelerate,
  },
} satisfies Record<string, MotionTransition>;
