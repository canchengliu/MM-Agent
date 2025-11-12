type CubicBezier = [number, number, number, number];

export const MotionDurations = {
  micro: 0.1,
  fast: 0.2,
  medium: 0.3,
  slow: 0.5,
} as const;

export const MotionEasings = {
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  sharp: [0.6, 0.05, 0.1, 0.95],
} as const satisfies Record<string, CubicBezier>;

export const Transitions = {
  standard: {
    duration: MotionDurations.fast,
    ease: MotionEasings.standard,
  },
  enter: {
    duration: MotionDurations.medium,
    ease: MotionEasings.decelerate,
  },
  exit: {
    duration: MotionDurations.fast,
    ease: MotionEasings.accelerate,
  },
  layout: {
    type: "tween",
    duration: MotionDurations.medium,
    ease: MotionEasings.sharp,
  },
} as const;
