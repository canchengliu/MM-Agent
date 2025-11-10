// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { useState } from "react";
import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";

import { AuthProvider } from "~/core/auth/AuthProvider";
import { createQueryClient } from "~/lib/queryClient";

interface AppProvidersProps {
  children: ReactNode;
  messages: AbstractIntlMessages;
  locale: string;
}

/**
 * Bundles all client-only context providers to keep RootLayout server compatible.
 */
export function AppProviders({ children, messages, locale }: AppProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
