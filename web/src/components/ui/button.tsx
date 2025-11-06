import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md cursor-pointer",
    "text-label font-medium transition-[background-color,color,box-shadow,transform,filter] duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.98] active:shadow-inset",
    "select-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "aria-invalid:border-border-danger aria-invalid:ring-border-danger/20",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-background-interactive text-text-on-interactive shadow-md",
          "hover:brightness-110",
        ].join(" "),
        secondary: [
          "border border-border-interactive bg-background-tertiary text-text-primary shadow-sm",
          "hover:bg-background-secondary hover:border-border-focused",
        ].join(" "),
        destructive: [
          "bg-background-danger text-text-on-interactive shadow-md",
          "hover:brightness-110 focus-visible:ring-border-danger",
        ].join(" "),
        outline: [
          "border border-border-interactive bg-transparent text-text-primary shadow-sm",
          "hover:bg-background-tertiary/60",
        ].join(" "),
        ghost: [
          "bg-transparent text-text-accent shadow-none",
          "hover:bg-background-tertiary/40",
        ].join(" "),
        link: "bg-transparent text-text-accent underline underline-offset-4 hover:text-text-accent/80 shadow-none",
      },
      size: {
        default: "h-10 px-4 has-[>svg]:px-3",
        sm: "h-8 px-3 text-caption has-[>svg]:px-2.5",
        lg: "h-12 px-6 text-body-large has-[>svg]:px-5",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
