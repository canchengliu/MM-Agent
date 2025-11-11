"use client";

import { useEffect, useState } from "react";

export type Breakpoint = "sm" | "md" | "lg";

const getBreakpoint = (width: number): Breakpoint => {
  if (width < 768) {
    return "sm";
  }
  if (width < 1024) {
    return "md";
  }
  return "lg";
};

/**
 * Returns the current responsive breakpoint.
 * sm: < 768px, md: 768-1023px, lg: >= 1024px
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("lg");

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return breakpoint;
};
