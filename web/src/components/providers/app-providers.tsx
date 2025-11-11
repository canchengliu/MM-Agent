"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

import { AuthProvider } from "~/core/auth/AuthProvider";
import { queryClient } from "~/lib/queryClient";

import { ThemeProvider } from "../theme-provider";
import { AppToaster } from "../ui/app-toaster";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
        <AppToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
