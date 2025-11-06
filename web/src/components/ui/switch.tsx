"use client"

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "~/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-10 shrink-0 items-center rounded-full border border-border-interactive bg-background-tertiary transition-[background-color,border-color,box-shadow] duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
        "data-[state=checked]:bg-background-interactive data-[state=checked]:border-transparent",
        "hover:border-border-focused data-[state=checked]:hover:border-transparent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
        "aria-invalid:border-border-danger",
        "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background-primary shadow-sm ring-0 transition-transform duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=checked]:bg-text-on-interactive",
          "data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
