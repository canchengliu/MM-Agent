import { ArrowRightIcon } from "@radix-ui/react-icons";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string;
  className: string;
  background?: ReactNode;
  Icon: React.ElementType;
  description: string;
  href: string;
  cta: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn("grid w-full auto-rows-auto grid-cols-2 gap-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group glassmorphism col-span-3 flex flex-col justify-between rounded-xl",
      "transform-gpu transition-[transform,box-shadow] duration-300 ease-out",
      "hover:-translate-y-1 focus-within:-translate-y-1 motion-reduce:transform-none motion-reduce:hover:translate-y-0 motion-reduce:focus-within:translate-y-0",
      className,
    )}
    {...props}
  >
    {background && <div>{background}</div>}
    <a
      className="z-10 flex transform-gpu flex-col gap-2 p-6 transition-transform duration-300 group-hover:-translate-y-3 motion-reduce:transform-none motion-reduce:group-hover:translate-y-0"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <Icon className="h-12 w-12 origin-left transform-gpu text-text-secondary transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:text-text-accent motion-reduce:transform-none motion-reduce:group-hover:scale-100" />
      <h3 className="text-heading-medium font-semibold text-text-primary">
        {name}
      </h3>
      <p className="max-w-lg text-text-secondary">{description}</p>
    </a>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 flex w-full translate-y-8 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:opacity-100",
      )}
    >
      <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
        <a href={href} target="_blank" rel="noreferrer">
          {cta}
          <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
        </a>
      </Button>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--color-background-overlay)_25%,transparent)]" />
  </div>
);

export { BentoCard, BentoGrid };
