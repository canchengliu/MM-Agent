"use client";

import * as React from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
  type PanelGroupHandle,
  type PanelProps,
  type PanelGroupProps,
  type PanelResizeHandleProps,
} from "react-resizable-panels";

import { cn } from "~/lib/utils";

type ResizablePanelGroupProps = PanelGroupProps;
type ResizablePanelProps = PanelProps & {
  ref?: React.Ref<ImperativePanelHandle>;
};

type ResizableHandleProps = PanelResizeHandleProps & {
  withHandle?: boolean;
};

const ResizablePanelGroup = React.forwardRef<PanelGroupHandle, ResizablePanelGroupProps>(
  ({ className, ...props }, ref) => (
    <PanelGroup
      ref={ref}
      className={cn("flex h-full w-full", className)}
      {...props}
    />
  ),
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = React.forwardRef<ImperativePanelHandle, ResizablePanelProps>(
  ({ className, ...props }, ref) => (
    <Panel
      ref={ref}
      className={cn("relative flex flex-col", className)}
      {...props}
    />
  ),
);
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ className, withHandle, ...props }, ref) => (
    <PanelResizeHandle
      ref={ref}
      className={cn(
        "relative flex w-px items-center justify-center bg-border transition-colors hover:bg-muted-foreground/50",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="flex h-8 w-3 items-center justify-center rounded-full border border-input bg-background shadow-sm">
          <div className="h-4 w-px rounded-full bg-border" />
        </div>
      )}
    </PanelResizeHandle>
  ),
);
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
