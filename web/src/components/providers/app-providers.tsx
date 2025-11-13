"use client";

import * as React from "react";

import { ThemeProvider } from "~/components/theme-provider";
import { TooltipProvider } from "~/components/ui/tooltip";
import { AuthInitializer } from "./auth-initializer";

// Centralizes all global providers (Theme, UI, etc.)
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      // Design Doc 4.1.1: Dark Mode First
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {/* AuthInitializer handles loading the initial state (Auth and Settings) */}
      <AuthInitializer>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </AuthInitializer>
    </ThemeProvider>
  );
}
