"use client";

import { Check, X } from "lucide-react";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

import { ShineBorder } from "~/components/magicui/shine-border";
import { cn } from "~/lib/utils";

export interface ScaOptionCardProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  optionId: string;
  title: string;
  subtitle?: string;
  description?: string;
  pros?: string[];
  cons?: string[];
  metrics?: Array<{ label: string; value: string }>;
  scoreTag?: string;
  footer?: ReactNode;
  isSelected?: boolean;
  onOptionSelect?: (optionId: string) => void;
}

export function ScaOptionCard({
  optionId,
  title,
  subtitle,
  description,
  pros = [],
  cons = [],
  metrics,
  scoreTag,
  footer,
  isSelected = false,
  disabled = false,
  onOptionSelect,
  className,
  onClick,
  ...buttonProps
}: ScaOptionCardProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) {
      return;
    }
    onOptionSelect?.(optionId);
  };

  return (
    <button
      type="button"
      {...buttonProps}
      className={cn(
        "group relative flex h-full w-full flex-col gap-5 rounded-xl border border-border-subtle/60 bg-background-secondary/70 p-5 text-left transition-all duration-300",
        "hover:-translate-y-1 hover:border-border-interactive hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused",
        isSelected
          ? "border-border-focused bg-background-primary/80 shadow-glow-accent"
          : "shadow-lg shadow-black/10",
        disabled &&
          "pointer-events-none cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none",
        className,
      )}
      aria-pressed={isSelected}
      disabled={disabled}
      onClick={handleClick}
    >
      {isSelected ? (
        <ShineBorder
          duration={12}
          shineColor={[
            "color-mix(in srgb, var(--color-border-decorative) 75%, transparent)",
            "color-mix(in srgb, var(--color-glow-accent) 60%, transparent)",
          ]}
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-heading-small text-text-primary">{title}</h3>
          {subtitle ? (
            <p className="text-xs uppercase tracking-widest text-text-tertiary">
              {subtitle}
            </p>
          ) : null}
        </div>
        {scoreTag ? (
          <span className="rounded-full border border-border-interactive bg-background-primary/70 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-text-secondary shadow-inner shadow-black/10">
            {scoreTag}
          </span>
        ) : null}
      </div>

      {description ? (
        <p className="text-sm text-text-secondary">{description}</p>
      ) : null}

      {Array.isArray(metrics) && metrics.length > 0 ? (
        <dl className="grid gap-3 rounded-lg border border-border-subtle/50 bg-background-primary/60 p-3 text-xs text-text-secondary sm:grid-cols-3">
          {metrics.map((entry) => (
            <div key={`${optionId}-metric-${entry.label}`} className="flex flex-col gap-1">
              <dt className="font-medium uppercase tracking-wide text-text-tertiary">
                {entry.label}
              </dt>
              <dd className="text-sm font-semibold text-text-primary">
                {entry.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {(pros.length > 0 || cons.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {pros.length > 0 ? (
            <div className="flex flex-col gap-2 rounded-lg border border-border-subtle/40 bg-background-primary/60 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-success">
                Strengths
              </span>
              <ul className="flex flex-col gap-1.5 text-sm text-text-secondary">
                {pros.map((item, index) => (
                  <li key={`${optionId}-pro-${index}`} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 flex-none text-text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {cons.length > 0 ? (
            <div className="flex flex-col gap-2 rounded-lg border border-border-subtle/40 bg-background-primary/60 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-danger">
                Trade-offs
              </span>
              <ul className="flex flex-col gap-1.5 text-sm text-text-secondary">
                {cons.map((item, index) => (
                  <li key={`${optionId}-con-${index}`} className="flex items-start gap-2">
                    <X className="mt-0.5 size-4 flex-none text-text-danger" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {footer ? (
        <div className="border-t border-border-subtle/40 pt-3 text-xs text-text-tertiary">
          {footer}
        </div>
      ) : null}
    </button>
  );
}
