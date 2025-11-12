import type { CSSProperties } from "react";

import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export interface TooltipProps {
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  title?: React.ReactNode;
  open?: boolean;
  side?: "left" | "right" | "top" | "bottom";
  sideOffset?: number;
  delayDuration?: number;
}

export function Tooltip({
  className,
  style,
  children,
  title,
  open,
  side,
  sideOffset,
  delayDuration = 750,
}: TooltipProps) {
  return (
    <TooltipProvider>
      <ShadcnTooltip delayDuration={delayDuration} open={open}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          className={cn(className)}
          side={side}
          sideOffset={sideOffset}
          style={style}
        >
          {title}
        </TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  );
}
