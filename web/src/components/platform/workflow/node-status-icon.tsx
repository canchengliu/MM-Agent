import {
  Ban,
  CheckCircle,
  Circle,
  Hourglass,
  Loader2,
  XCircle,
} from "lucide-react";

import { type NodeStatus } from "~/constants/enums";
import { cn } from "~/lib/utils";

interface NodeStatusIconProps {
  status: NodeStatus;
  className?: string;
  size?: number;
}

/**
 * Maps `NodeStatus` values to the correct Lucide icon and semantic color.
 * (Design Doc 5.1.2.A3, 4.1.1.D)
 * Uses the semantic status colors defined in the design system configuration.
 */
export function NodeStatusIcon({
  status,
  className,
  size = 16,
}: NodeStatusIconProps) {
  const baseClasses = "shrink-0";
  // We combine classes inside the switch to apply the correct semantic tokens.
  const iconProps = { size };

  switch (status) {
    case "Executing":
      // Requirement: Loader2 icon, Cyan (text-status-executing), animate-spin. (Design Doc 5.1.2.A3)
      return (
        <Loader2
          {...iconProps}
          className={cn(
            baseClasses,
            "animate-spin text-status-executing",
            className,
          )}
        />
      );
    case "Completed":
      // Requirement: CheckCircle, Emerald (text-status-completed).
      return (
        <CheckCircle
          {...iconProps}
          className={cn(baseClasses, "text-status-completed", className)}
        />
      );
    case "Awaiting HITL Approval":
      // Requirement: Hourglass, Amber (text-status-awaiting).
      return (
        <Hourglass
          {...iconProps}
          className={cn(baseClasses, "text-status-awaiting", className)}
        />
      );
    case "Failed":
      // Requirement: XCircle, Red (text-status-failed).
      return (
        <XCircle
          {...iconProps}
          // We use text-status-failed (which maps to --destructive)
          className={cn(baseClasses, "text-status-failed", className)}
        />
      );
    case "Canceled":
      // Requirement: Ban, Orange (text-status-canceled). (Design Doc 4.1.1.D)
      return (
        <Ban
          {...iconProps}
          className={cn(baseClasses, "text-status-canceled", className)}
        />
      );
    case "Not Started":
    default:
      // Requirement: Circle, muted color.
      return (
        <Circle
          {...iconProps}
          className={cn(baseClasses, "text-muted-foreground/70", className)}
        />
      );
  }
}