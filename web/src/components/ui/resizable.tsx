"use client";

import * as React from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type PanelGroupProps,
  type PanelProps,
  type PanelResizeHandleProps,
} from "react-resizable-panels";

import { cn } from "~/lib/utils";

const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof PanelGroup>,
  PanelGroupProps
>(({ className, ...props }, ref) => {
  return (
    <PanelGroup
      ref={ref}
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
});
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = React.forwardRef<React.ElementRef<typeof Panel>, PanelProps>(
  ({ className, ...props }, ref) => {
    return <Panel ref={ref} className={cn("min-h-0", className)} {...props} />;
  },
);
ResizablePanel.displayName = "ResizablePanel";

interface ResizableHandleProps extends PanelResizeHandleProps {
  withHandle?: boolean;
}

const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof PanelResizeHandle>,
  ResizableHandleProps
>(({ className, withHandle = false, ...props }, ref) => {
  return (
    <PanelResizeHandle
      ref={ref}
      className={cn(
        "group relative flex items-center justify-center bg-border/40 transition",
        "data-[panel-group-direction=horizontal]:w-px data-[panel-group-direction=horizontal]:h-full",
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        "hover:bg-border/70",
        className,
      )}
      {...props}
    >
      {withHandle ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border border-border/70 bg-background px-1 py-2 shadow-sm",
            "data-[panel-group-direction=vertical]:px-2 data-[panel-group-direction=vertical]:py-1",
          )}
        >
          <div
            className={cn(
              "h-8 w-0.5 rounded-full bg-border/80",
              "data-[panel-group-direction=vertical]:h-0.5 data-[panel-group-direction=vertical]:w-8",
            )}
          />
        </div>
      ) : (
        <div
          className={cn(
            "rounded-full bg-border/80 transition group-hover:bg-border",
            "data-[panel-group-direction=horizontal]:h-8 data-[panel-group-direction=horizontal]:w-0.5",
            "data-[panel-group-direction=vertical]:h-0.5 data-[panel-group-direction=vertical]:w-8",
          )}
        />
      )}
    </PanelResizeHandle>
  );
});
ResizableHandle.displayName = "ResizableHandle";

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
