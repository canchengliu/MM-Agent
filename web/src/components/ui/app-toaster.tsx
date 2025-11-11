"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

export function AppToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      position="top-right"
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
