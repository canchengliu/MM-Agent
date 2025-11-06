// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

import { cn } from "~/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme ?? "dark") as ToasterProps["theme"];
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast glassmorphism text-text-primary shadow-lg",
            "border border-border-default backdrop-blur-md",
            "data-[type=success]:border-border-success data-[type=error]:border-border-danger data-[type=warning]:border-border-interactive",
          ),
          description: "group-[.toast]:text-text-secondary",
          actionButton:
            "group-[.toast]:rounded-md group-[.toast]:bg-background-interactive group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-label group-[.toast]:font-medium group-[.toast]:text-text-on-interactive group-[.toast]:transition-[background-color,color] group-[.toast]:duration-150 hover:group-[.toast]:brightness-110 focus-visible:group-[.toast]:outline-none focus-visible:group-[.toast]:ring-2 focus-visible:group-[.toast]:ring-border-focused focus-visible:group-[.toast]:ring-offset-2 focus-visible:group-[.toast]:ring-offset-background-primary",
          cancelButton:
            "group-[.toast]:rounded-md group-[.toast]:border group-[.toast]:border-border-interactive group-[.toast]:bg-transparent group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-label group-[.toast]:font-medium group-[.toast]:text-text-secondary hover:group-[.toast]:bg-background-tertiary/50 focus-visible:group-[.toast]:outline-none focus-visible:group-[.toast]:ring-2 focus-visible:group-[.toast]:ring-border-focused focus-visible:group-[.toast]:ring-offset-2 focus-visible:group-[.toast]:ring-offset-background-primary",
          closeButton:
            "group-[.toast]:text-text-tertiary hover:group-[.toast]:text-text-primary focus-visible:group-[.toast]:outline-none focus-visible:group-[.toast]:ring-2 focus-visible:group-[.toast]:ring-border-focused focus-visible:group-[.toast]:ring-offset-2 focus-visible:group-[.toast]:ring-offset-background-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
