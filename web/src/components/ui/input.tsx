import * as React from "react";

import { cn } from "~/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-md border border-border-interactive bg-background-tertiary px-3 py-2 text-body-large text-text-primary placeholder:text-text-tertiary selection:bg-background-interactive selection:text-text-on-interactive",
        "transition-[background-color,border-color,box-shadow] duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
        "hover:border-border-focused focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
        "aria-invalid:border-border-danger aria-invalid:ring-border-danger/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        "file:inline-flex file:h-8 file:items-center file:justify-center file:rounded-md file:border-0 file:bg-transparent file:px-2 file:text-label file:font-medium file:text-text-primary",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
