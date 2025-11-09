// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { ReactNode } from "react";

import { type Metadata } from "next";

import { AuthRedirect } from "~/components/auth/auth-redirect";

export const metadata: Metadata = {
  title: "Authentication - DeerFlow",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <AuthRedirect redirectIfAuthenticated="/dashboard" />
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        {children}
      </div>
    </>
  );
}
