"use client"

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "~/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-md border border-border-interactive bg-background-tertiary transition-[background-color,border-color,box-shadow] duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
        "data-[state=checked]:border-transparent data-[state=checked]:bg-background-interactive data-[state=checked]:text-text-on-interactive",
        "hover:border-border-focused data-[state=checked]:hover:border-transparent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
        "aria-invalid:border-border-danger",
        "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
