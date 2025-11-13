# Folder Structure of /Users/ann/Documents/projects/MM-Agent/web/src

## src
 - i18n.ts
 - env.js

    ## core

        ## websocket
         - manager.ts
         - backoff.ts
         - resolve-ws-url.ts
         - dispatcher.ts

        ## sse
         - fetch-stream.ts
         - index.ts
         - StreamEvent.ts

        ## markdown
         - katex.ts

        ## utils
         - json.ts
         - deep-clone.ts
         - markdown.ts
         - index.ts
         - time.ts

        ## models
         - user.model.ts
         - events.model.ts
         - node.model.ts
         - auth.model.ts
         - project.model.ts
         - system.model.ts
         - hitl.model.ts
         - workflow.model.ts
         - common.model.ts
         - settings.model.ts

        ## rehype
         - index.ts
         - rehype-split-words-into-spans.ts

        ## hooks
         - use-workflow-connection.ts

        ## api
         - node.service.ts
         - system.service.ts
         - project.service.ts
         - auth.service.ts
         - resolve-service-url.ts
         - user.service.ts
         - types.ts
         - client.ts
         - workflow.service.ts
         - index.ts

        ## store
         - index.ts

            ## slices
             - settings.slice.ts
             - workflow.slice.ts
             - ui-interaction.slice.ts
             - project.slice.ts
             - connection-status.slice.ts
             - auth.slice.ts

    ## app
     - layout.tsx
     - page.tsx

        ## auth
         - layout.tsx

            ## verify-email
             - page.tsx

            ## register
             - page.tsx

            ## verify-email-instructions
             - page.tsx

            ## reset-password
             - page.tsx

            ## login
             - page.tsx

        ## (platform)
         - layout.tsx

            ## settings
             - layout.tsx
             - page.tsx

                ## preferences
                 - page.tsx

                    ## components
                     - preferences-form.tsx

                ## components
                 - settings-config.tsx
                 - settings-page-loader.tsx
                 - settings-sidebar.tsx
                 - settings-page-wrapper.tsx

                ## profile
                 - page.tsx

                    ## components
                     - change-password-form.tsx
                     - account-settings-form.tsx

                ## engine
                 - page.tsx

                    ## components
                     - engine-configuration-form.tsx

            ## projects
             - page.tsx

                ## [projectId]
                 - layout.tsx

                    ## config
                     - page.tsx

                        ## components
                         - project-config-container.tsx
                         - workflow-start-control.tsx
                         - initialize-historical-dialog.tsx
                         - problem-type-selector.tsx
                         - file-management.tsx
                         - project-details-form.tsx

                    ## workflow
                     - page.tsx

                        ## utils
                         - output-derivation.ts

                        ## components
                         - workflow-tree.tsx
                         - project-workflow-container.tsx
                         - cockpit-layout.tsx
                         - node-tree-item.tsx

### app/(platform)/projects/[projectId]/workflow/components/cockpit-layout.tsx Content:

```tsx
"use client";

import { useMemo, useRef, type RefObject } from "react";
// Removed Loader2, NodeStatusIcon, Badge imports as they are now handled within NodeWorkspace
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { useShallow } from "zustand/react/shallow";

import { WorkflowTree } from "./workflow-tree";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import type { WorkflowInstanceRead } from "~/core/models/workflow.model";
import { useStore } from "~/core/store";
import { NodeWorkspace } from "./workspace/node-workspace"; // Import NodeWorkspace
import { VersionHistoryPanel } from "./history/version-history-panel"; // (Task 21) Import VersionHistoryPanel

interface CockpitLayoutProps {
  workflow: WorkflowInstanceRead;
  isSyncing: boolean;
}

export function CockpitLayout({ workflow, isSyncing }: CockpitLayoutProps) {
  const { activeNodeId, nodesById, isEditing } = useStore(
    useShallow((state) => ({
      activeNodeId: state.activeNodeId,
      nodesById: state.nodesById,
      // We need to track the editing state for the Panel C visibility logic.
      isEditing: state.isEditing,
    })),
  );

  const activeNode = useMemo(() => {
    if (!activeNodeId) return null;
    return nodesById.get(activeNodeId) ?? null;
  }, [activeNodeId, nodesById]);

  // Design Doc 2.2.3.C / 3.1.1.C: Panel C (History) visibility logic.
  // Visible only when the Center Workspace is in "Review Mode" (Completed status AND not currently editing).
  const isHistoryVisible = activeNode?.status === "Completed" && !isEditing;

  const navigatorPanelRef = useRef<ImperativePanelHandle>(null);
  const historyPanelRef = useRef<ImperativePanelHandle>(null);

  const togglePanel = (panelRef: RefObject<ImperativePanelHandle | null>) => {
    const panel = panelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="workflow-cockpit-layout"
      className="flex h-full overflow-hidden rounded-2xl border border-border/60 bg-background/60 shadow-inner"
    >
      {/* A. Navigator Panel */}
      <ResizablePanel
        ref={navigatorPanelRef}
        id="workflow-navigator"
        collapsible
        defaultSize={22}
        minSize={18}
        className="bg-card/80"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Workflow Navigator
              </p>
              <p className="text-sm font-medium text-foreground">{workflow.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => togglePanel(navigatorPanelRef)}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">Toggle navigator</span>
            </Button>
          </div>
          <ScrollArea className="flex-1 px-3 py-4">
            <WorkflowTree workflow={workflow} />
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      {/* B. Workspace Panel */}
      <ResizablePanel
        id="workflow-workspace"
        // Dynamically adjust sizes based on Panel C visibility
        minSize={isHistoryVisible ? 45 : 60}
        defaultSize={isHistoryVisible ? 56 : 78}
        className="bg-background"
      >
        {/* Architecture 6.2: Host the NodeWorkspace component. */}
        <NodeWorkspace workflowStatus={workflow.status} isSyncing={isSyncing} />
      </ResizablePanel>

      {/* C. History Panel (Conditional) (Task 21 Implementation) */}
      {/* Ensure activeNode is available and valid before rendering Panel C components */}
      {isHistoryVisible && activeNode ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            ref={historyPanelRef}
            id="workflow-history"
            collapsible
            defaultSize={22}
            minSize={16}
            className="bg-card/80"
          >
            <div className="flex h-full flex-col">
              {/* Header (C1) (Design Doc 5.1.4.C1) */}
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Version History
                  </p>
                  <p className="text-sm font-medium text-foreground truncate" title={activeNode.name}>
                    {activeNode.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => togglePanel(historyPanelRef)}
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Toggle history</span>
                </Button>
              </div>
              {/* Content (C2) - Scrollable Area hosting the panel content */}
              {/* VersionHistoryPanel manages its own rendering logic (loading/error/content) */}
              <ScrollArea className="flex-1">
                {/* Architecture 7.3: Host the VersionHistoryPanel component. */}
                <VersionHistoryPanel activeNode={activeNode} />
              </ScrollArea>
            </div>
          </ResizablePanel>
        </>
      ) : null}
    </ResizablePanelGroup>
  );
}

```

                            ## workspace
                             - action-footer.tsx
                             - useTranscriptData.ts
                             - contextual-toolbar.tsx
                             - node-workspace.tsx
                             - interaction-transcript.tsx
                             - manual-edit-save-dialog.tsx
                             - workspace-header.tsx
                             - execution-dialog.tsx
                             - staleness-banner.tsx

                                ## blocks
                                 - inputs-block.tsx
                                 - hitl-zone-block.tsx
                                 - output-block.tsx
                                 - artifacts-block.tsx
                                 - transcript-block.tsx

                            ## hitl
                             - discard-confirmation-dialog.tsx
                             - hitl-interaction-manager.tsx
                             - reject-feedback-dialog.tsx

                                ## panels
                                 - avl-panel.tsx
                                 - sca-panel.tsx
                                 - varl-panel.tsx

                                    ## avl
                                     - adjudication-controls.tsx

                            ## history
                             - version-card.tsx
                             - version-history-panel.tsx

                ## components
                 - project-list.tsx
                 - project-card.tsx
                 - delete-project-dialog.tsx

                ## new
                 - page.tsx

                    ## components
                     - create-project-form.tsx

    ## constants
     - motion.ts
     - enums.ts

    ## typings
     - md.d.ts

    ## styles
     - prosemirror.css
     - globals.css

### styles/globals.css Content:

```css
@config "../../tailwind.config.ts";
@import "tailwindcss";
@plugin "tailwindcss-animate";
/* Ensure @tailwindcss/typography plugin is enabled for 'prose' classes */
@plugin "@tailwindcss/typography";

/* Import specific styles for the Rich Text Editor */
@import "./prosemirror.css";

@theme {
  --radius: 0.5rem;

  /* Light mode tokens mirrored in :root for runtime CSS variables */
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-card: 0 0% 100%;
  --color-card-foreground: 222.2 84% 4.9%;
  --color-popover: 0 0% 100%;
  --color-popover-foreground: 222.2 84% 4.9%;
  --color-primary: 221.2 83.2% 53.3%;
  --color-primary-foreground: 210 40% 98%;
  --color-secondary: 210 40% 96.1%;
  --color-secondary-foreground: 222.2 47.4% 11.2%;
  --color-muted: 210 40% 96.1%;
  --color-muted-foreground: 215.4 16.3% 46.9%;
  --color-accent: 210 40% 96.1%;
  --color-accent-foreground: 222.2 47.4% 11.2%;
  --color-destructive: 0 84.2% 60.2%;
  --color-destructive-foreground: 210 40% 98%;
  --color-border: 214.3 31.8% 91.4%;
  --color-input: 214.3 31.8% 91.4%;
  --color-ring: 221.2 83.2% 53.3%;
}

/* 4.1.1.B Semantic Tokens and Theming (HSL Format) */
@layer base {
  :root {
    /* UI Radius (4.1.4) */
    --radius: 0.5rem;

    /* Light Mode */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 47.4% 11.2%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 47.4% 11.2%;
    --popover-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground text-sm;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Animation keyframes for word fade-in (used by rehypeSplitWordsIntoSpans) */
@keyframes word-fade-in {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply the animation to the spans generated by the rehype plugin */
.animate-word-fade-in {
  /* display: inline-block; handled by inline style in the plugin */
  animation: word-fade-in 0.3s ease-out forwards;
  opacity: 0; /* Start hidden */
}


/* 4.1.4.C Advanced Visual Effects: Subtle Texture (Dot Grid for Dark Mode) */
.dark body {
  background-image: radial-gradient(
    circle at center,
    hsl(var(--border) / 0.15) 0.5px,
    hsl(var(--background)) 0
  );
  background-size: 24px 24px;
}

```

    ## components
     - theme-provider.tsx

        ## ui
         - alert-dialog.tsx
         - tabs.tsx
         - card.tsx
         - slider.tsx
         - popover.tsx
         - sheet.tsx
         - scroll-area.tsx
         - resizable.tsx
         - label.tsx
         - sonner.tsx
         - accordion.tsx
         - tooltip.tsx
         - alert.tsx
         - switch.tsx
         - radio-group.tsx
         - command.tsx
         - toggle-group.tsx
         - avatar.tsx
         - dialog.tsx
         - badge.tsx
         - separator.tsx
         - button.tsx
         - toggle.tsx
         - checkbox.tsx
         - collapsible.tsx
         - dropdown-menu.tsx
         - select.tsx
         - textarea.tsx
         - input.tsx
         - skeleton.tsx
         - form.tsx

### components/ui/card.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import * as React from "react"

import { cn } from "~/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

```

### components/ui/button.tsx Content:

```tsx
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        "cursor-pointer active:scale-105",
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };

```

### components/ui/input.tsx Content:

```tsx
import * as React from "react";

import { cn } from "~/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Standard Shadcn/ui input styling consistent with the project's theme
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

```

            ## icons
             - magic.tsx

        ## renderers
         - MarkdownRenderer.tsx

        ## deer-flow
         - rainbow-text.tsx
         - loading-animation.tsx
         - rolling-text.tsx
         - toaster.tsx
         - markdown.tsx
         - fav-icon.tsx
         - loading-animation.module.css
         - tooltip.tsx
         - theme-provider-wrapper.tsx
         - logo.tsx
         - language-switcher.tsx
         - image.tsx
         - theme-toggle.tsx
         - rainbow-text.module.css
         - scroll-container.tsx

            ## icons
             - detective.tsx
             - report-style.tsx
             - enhance.tsx

        ## magicui
         - shine-border.tsx
         - aurora-text.tsx
         - border-beam.tsx
         - number-ticker.tsx
         - flickering-grid.tsx
         - bento-grid.tsx

        ## auth
         - register-form.tsx
         - reset-password-form.tsx
         - login-form.tsx

        ## providers
         - app-providers.tsx
         - auth-initializer.tsx

        ## platform
         - theme-toggle.tsx

            ## layout
             - user-menu.tsx
             - connection-status-banner.tsx
             - global-header.tsx

### components/platform/layout/global-header.tsx Content:

```tsx
"use client";

import Link from "next/link";
import { PlusCircle, Workflow } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { ThemeToggle } from "~/components/platform/theme-toggle";
import { UserMenu } from "./user-menu";

export function GlobalHeader() {
  const pathname = usePathname();

  const navItems = [
    { name: "Projects", href: "/projects" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <div className="flex items-center gap-6">
        <Link href="/projects" className="flex items-center gap-2 text-lg font-semibold" aria-label="O-Award Home">
          <Workflow className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">O-Award</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button size="sm" asChild className="hidden sm:flex">
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>

        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

```

            ## data-display
             - timestamp.tsx
             - project-status-badge.tsx

### components/platform/data-display/project-status-badge.tsx Content:

```tsx
import { type VariantProps } from "class-variance-authority";

import { Badge, badgeVariants } from "~/components/ui/badge";
import type { ProjectStatus } from "~/constants/enums";
import { cn } from "~/lib/utils";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

/**
 * Semantic badge for displaying the current project status.
 */
export function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
  let variant: BadgeVariant | undefined = "secondary";
  let text = "";
  let customClasses = "";

  switch (status) {
    case "Configuring":
      variant = "warning";
      text = "Configuring";
      break;
    case "Running":
      variant = undefined;
      text = "Running";
      customClasses =
        "border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300";
      break;
    case "Completed":
      variant = "success";
      text = "Completed";
      break;
    default:
      variant = "outline";
      text = "Unknown";
  }

  return (
    <Badge variant={variant} className={cn(customClasses, className)}>
      {text}
    </Badge>
  );
}

```

            ## workflow
             - node-status-icon.tsx

        ## editors
         - MonacoWrapper.tsx
         - LogViewer.tsx
         - CodeViewer.tsx

### components/editors/MonacoWrapper.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import type { EditorProps, OnMount, Monaco } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import type { editor } from 'monaco-editor';

// Define the Loading fallback component
const MonacoLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

// Dynamically import Monaco Editor for optimized loading (Architecture 9.4.1)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: MonacoLoading,
});

// Define base options for Monaco, ensuring consistency across the platform
// Design Doc 4.1.2.B: Use Geist Mono. Design Doc 4.3.B.3: text-sm (14px).
const MONACO_BASE_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  // Use the CSS variable set by Next.js font optimization (Geist Mono)
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 14,
  lineHeight: 20, // Improved readability
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true, // Automatically adjust layout when the container size changes
  // Configure subtle scrollbars
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    useShadows: false,
  },
  smoothScrolling: true,
  folding: true, // Enable code folding by default (Design Doc 3.1.1.A.2)
};

// Helper function to define custom themes that match the application's aesthetic
const defineCustomThemes = (monaco: Monaco) => {
  // Design Doc 4.1.1.B defines the colors. Monaco requires hex values.

  // Dark theme (Design Doc 4.1.1: Dark Mode First)
  // --background: 222.2 84% 4.9% ≈ #020617 (Deep Blue-Black / Slate 950)
  const darkBg = '#020617';
  // --secondary/border: 217.2 32.6% 17.5% ≈ #1e293b. Used for subtle highlights with sufficient contrast.
  const darkHighlight = '#1e293b';

  monaco.editor.defineTheme('o-award-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      // Design Doc 5.1.3.B2 specifies bg-background for the viewer.
      'editor.background': darkBg,
      'editorGutter.background': darkBg, // Ensure gutter matches background
      'editor.lineHighlightBackground': darkHighlight,
      'editor.selectionBackground': '#334155', // Slate 700 approximation
    },
  });

  // Light theme
  // --background: 0 0% 100% ≈ #ffffff
  const lightBg = '#ffffff';
  monaco.editor.defineTheme('o-award-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': lightBg,
      'editorGutter.background': lightBg,
      'editor.lineHighlightBackground': '#f1f5f9', // Slate 100 approximation
    },
  });
};


export interface MonacoWrapperProps extends EditorProps {
  // We primarily extend EditorProps
}

/**
 * MonacoWrapper component integrates Monaco Editor with the application's theming and font settings.
 * It handles dynamic loading, custom theme definition, and configuration synchronization.
 */
const MonacoWrapper = React.forwardRef<editor.IStandaloneCodeEditor, MonacoWrapperProps>(
  ({ options, onMount, beforeMount, ...props }, ref) => {
    const { resolvedTheme } = useTheme();

    // Determine Monaco theme based on next-themes (Design Doc 4.1.1)
    // Default to dark if theme is unresolved (e.g., during initialization, matching defaultTheme="dark")
    const monacoTheme = (resolvedTheme === 'dark' || !resolvedTheme) ? 'o-award-dark' : 'o-award-light';

    // Merge base options with instance-specific options
    const combinedOptions = React.useMemo(() => ({
      ...MONACO_BASE_OPTIONS,
      ...options,
    }), [options]);

    // Handle Monaco initialization (before mount)
    const handleBeforeMount = (monaco: Monaco) => {
        // Define custom themes before the editor mounts
        defineCustomThemes(monaco);
        if (beforeMount) {
            beforeMount(monaco);
        }
    };

    // Handle editor mount lifecycle
    const handleOnMount: OnMount = (editorInstance, monaco) => {
      // Assign the editor instance to the forwarded ref
      if (ref) {
        if (typeof ref === 'function') {
          ref(editorInstance);
        } else {
          ref.current = editorInstance;
        }
      }
      // Call original onMount if provided
      if (onMount) {
        onMount(editorInstance, monaco);
      }
    };

    return (
      <MonacoEditor
        // Keying by theme helps ensure Monaco re-initializes correctly if theme changes rapidly
        key={monacoTheme}
        theme={monacoTheme}
        options={combinedOptions}
        onMount={handleOnMount}
        beforeMount={handleBeforeMount}
        loading={<MonacoLoading />}
        {...props}
      />
    );
  }
);

MonacoWrapper.displayName = 'MonacoWrapper';

export default MonacoWrapper;


```

            ## RichTextEditor
             - index.tsx
             - math-serializer.ts
             - image-upload.ts
             - slash-command.tsx
             - extensions.tsx

                ## generative
                 - ai-completion-command.tsx
                 - generative-menu-switch.tsx
                 - ai-selector.tsx
                 - ai-selector-commands.tsx

                ## selectors
                 - link-selector.tsx
                 - text-buttons.tsx
                 - node-selector.tsx
                 - math-selector.tsx
                 - color-selector.tsx

        ## editor
         - index.tsx
         - math-serializer.ts
         - image-upload.ts
         - slash-command.tsx
         - extensions.tsx

            ## generative
             - ai-completion-command.tsx
             - generative-menu-switch.tsx
             - ai-selector.tsx
             - ai-selector-commands.tsx

            ## selectors
             - link-selector.tsx
             - text-buttons.tsx
             - node-selector.tsx
             - math-selector.tsx
             - color-selector.tsx

    ## hooks
     - use-intersection-observer.ts
     - use-mobile.ts
     - use-prose-completion.ts

    ## lib
     - fonts.ts
     - utils.ts

