"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface TimestampProps {
  time: string;
  className?: string;
}

/**
 * Displays relative time with an absolute timestamp on hover.
 */
export function Timestamp({ time, className }: TimestampProps) {
  try {
    const date = parseISO(time);
    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    const relativeTime = formatDistanceToNow(date, { addSuffix: true });
    const absoluteTime = format(date, "PPpp");

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={className} suppressHydrationWarning>
              {relativeTime}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{absoluteTime}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  } catch (error) {
    console.error("Invalid timestamp:", time, error);
    return (
      <span className={className} suppressHydrationWarning>
        Invalid date
      </span>
    );
  }
}
