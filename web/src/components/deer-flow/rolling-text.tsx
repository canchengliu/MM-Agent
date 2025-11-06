// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { motion, AnimatePresence } from "framer-motion";

import { usePrefersReducedMotion } from "~/lib/a11y/motion-preferences";
import { cn } from "~/lib/utils";

export function RollingText({
  className,
  children,
}: {
  className?: string;
  children?: string | string[];
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const contentKey = Array.isArray(children)
    ? children.join("::")
    : children ?? "rolling-text-empty";

  if (prefersReducedMotion) {
    return (
      <span className={cn("relative flex h-[2em] items-center", className)}>
        <span className="truncate">{Array.isArray(children) ? children.join(" ") : children}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative flex h-[2em] items-center overflow-hidden",
        className,
      )}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={contentKey}
          className="absolute w-fit"
          style={{ transition: "all 0.3s ease-in-out" }}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </span>
  );
}
