// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { ReactNode } from "react";
import Link from "next/link";
import { Command as CommandIcon } from "lucide-react";

import { AuthRedirect } from "~/components/auth/auth-redirect";
import { UserNav } from "~/components/auth/user-nav";
import { Tooltip } from "~/components/deer-flow/tooltip";
import { LanguageSwitcher } from "~/components/deer-flow/language-switcher";
import { ThemeToggle } from "~/components/deer-flow/theme-toggle";
import { Button } from "~/components/ui/button";

const Breadcrumbs = () => {
  return (
    <nav
      className="hidden text-sm text-muted-foreground md:block"
      aria-label="Breadcrumb"
    >
      Dashboard
    </nav>
  );
};

export default function ProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <AuthRedirect redirectIfNotAuthenticated="/login" />
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <header className="sticky top-0 z-40 w-full shrink-0 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="flex items-center text-lg font-semibold"
              >
                <span className="mr-2 text-2xl">🦌</span> DeerFlow
              </Link>
              <Breadcrumbs />
            </div>
            <div className="flex items-center space-x-4">
              <Tooltip title="Open Command Palette (Soon)">
                <Button variant="outline" size="sm" disabled className="hidden md:inline-flex">
                  <CommandIcon className="mr-2 h-4 w-4" />
                  <span className="text-xs text-muted-foreground">⌘K</span>
                </Button>
              </Tooltip>
              <LanguageSwitcher />
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </>
  );
}
