import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-sm border px-2 py-0.5",
    "text-caption font-medium transition-[background-color,color,border-color,box-shadow]",
    "duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
    "disabled:pointer-events-none disabled:opacity-40",
    "aria-invalid:border-border-danger aria-invalid:ring-border-danger/20",
    "[&>svg]:size-3 [&>svg]:pointer-events-none [&>svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-border-interactive bg-background-tertiary/80 text-text-primary",
        secondary:
          "border-border-subtle bg-background-secondary text-text-secondary",
        destructive:
          "border-border-danger bg-background-danger/20 text-text-danger focus-visible:ring-border-danger",
        outline:
          "border-border-interactive bg-transparent text-text-accent [a&]:hover:bg-background-tertiary/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
