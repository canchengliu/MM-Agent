import type { Transition } from "framer-motion";
import { useReducedMotion } from "framer-motion";

/**
 * Canonical transition to use when the user prefers reduced motion.
 * Keeps easing linear and duration snappy to avoid perceptible movement.
 */
export const reducedMotionTransition: Transition = {
  type: "tween",
  duration: 0.12,
  ease: "linear",
};

/**
 * Convenience hook that ensures we always return a boolean flag and
 * automatically falls back to `false` during SSR.
 */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() === true;
}

/**
 * Returns an appropriate transition object based on the motion preference.
 */
