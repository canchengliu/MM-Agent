import "~/styles/globals.css";

import { type Metadata } from "next";
import type { ReactNode } from "react";

import { AppProviders } from "~/components/providers/app-providers";
import { Toaster } from "~/components/ui/sonner";
import { fontMono, fontSans } from "~/lib/fonts";
import { cn } from "~/lib/utils";

export const metadata: Metadata = {
  title: "O-Award Modeling Platform",
  description: "The Expert's Cognitive Cockpit for advanced modeling and simulation.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <AppProviders>{children}</AppProviders>
        <Toaster richColors />
      </body>
    </html>
  );
}
