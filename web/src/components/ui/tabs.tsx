// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "~/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-stack-md", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        [
          "inline-flex h-10 w-fit items-center gap-1 rounded-lg border border-border-subtle",
          "bg-background-secondary/70 px-1 py-1 text-text-secondary",
          "transition-colors duration-150 ease-[cubic-bezier(0,0,0.2,1)] backdrop-blur-md",
        ].join(" "),
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        [
          "relative inline-flex min-h-8 flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5",
          "text-label font-medium text-text-secondary transition-[background-color,color,box-shadow] duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
          "disabled:pointer-events-none disabled:opacity-40",
          "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-text-accent after:opacity-0 after:transition-opacity after:duration-150",
          "data-[state=active]:bg-background-secondary data-[state=active]:text-text-primary data-[state=active]:shadow-md data-[state=active]:after:opacity-100",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        ].join(" "),
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
