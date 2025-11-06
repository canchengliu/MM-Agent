import * as React from "react";

import { cn } from "~/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content flex min-h-16 w-full rounded-md border border-border-interactive bg-background-tertiary px-3 py-2 text-body-large text-text-primary placeholder:text-text-tertiary",
        "transition-[background-color,border-color,box-shadow] duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
        "hover:border-border-focused focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
        "aria-invalid:border-border-danger aria-invalid:ring-border-danger/20",
        "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
