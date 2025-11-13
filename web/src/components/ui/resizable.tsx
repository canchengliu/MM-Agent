
"use client";

import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "~/lib/utils";

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className,
    )}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

/**
 * ResizableHandle implementation aligned with Design Doc 5.1.1 (Separator Handle).
 * Provides the required styling (w-1, bg-border) and interaction feedback (hover:bg-primary/70).
 */
const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      // Base styles: 4px width (w-1), bg-border. (Design Doc 5.1.1)
      "relative flex w-1 items-center justify-center bg-border transition-colors duration-200",
      // Hover effect: Cyber Blue, 70% opacity (Design Doc 5.1.1).
      "hover:bg-primary/70",
      // Accessibility: Ensure clear focus state for keyboard interaction
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:bg-primary/70",
      className,
    )}
    {...props}
  >
    {/* Optional visual handle (Grip) - not explicitly required by the current design, but available if needed */}
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
