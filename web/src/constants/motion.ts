/**
 * Standardized animation durations (seconds) — Design Doc 4.2.1.A.
 */
export const Duration = {
  INSTANT: 0,
  X_FAST: 0.1,
  FAST: 0.2,
  MEDIUM: 0.3,
  SLOW: 0.5,
  X_SLOW: 0.8,
} as const;

/**
 * Standard easing curves (cubic-bezier arrays) — Design Doc 4.2.1.B.
 */
export const Easing = {
  STANDARD: [0.4, 0, 0.2, 1],
  ENTER: [0, 0, 0.2, 1],
  EXIT: [0.4, 0, 1, 1],
  EXPRESSIVE: [0.215, 0.61, 0.355, 1],
} as const;

/**
 * 4.2.2.C Framer Motion Variants Configuration
 */
export const Variants = {
  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: Duration.MEDIUM, ease: Easing.ENTER },
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: { duration: Duration.FAST, ease: Easing.EXIT },
    },
  },
  modalPop: {
    initial: { opacity: 0, scale: 0.96 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: Duration.MEDIUM, ease: Easing.ENTER },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: { duration: Duration.FAST, ease: Easing.EXIT },
    },
  },
} as const;
