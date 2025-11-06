"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";

import { Button } from "~/components/ui/button";
import {
  reducedMotionTransition,
  usePrefersReducedMotion,
} from "~/lib/a11y/motion-preferences";
import { duration, easing, spring } from "~/lib/motion-tokens";
import { cn } from "~/lib/utils";

import type { ScaOptionCardProps } from "./sca-option-card";
import { ScaOptionCard } from "./sca-option-card";

const LIST_VARIANTS: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

const ITEM_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.fast,
      ease: easing.decelerate,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: duration.quick,
      ease: easing.accelerate,
    },
  },
};

export interface HitlScaInteractionOption
  extends Omit<ScaOptionCardProps, "optionId" | "isSelected" | "onOptionSelect" | "disabled"> {
  id: string;
  disabled?: boolean;
}

export interface HitlScaInteractionProps {
  title?: string;
  subtitle?: string;
  description?: ReactNode;
  options: HitlScaInteractionOption[];
  selectedOptionId?: string | null;
  defaultSelectedOptionId?: string | null;
  onOptionSelect?: (optionId: string) => void;
  onConfirm?: (optionId: string) => void;
  confirmLabel?: string;
  isConfirming?: boolean;
  disabled?: boolean;
  className?: string;
  confirmButtonClassName?: string;
  footer?: ReactNode;
  aside?: ReactNode;
  emptySelectionHint?: ReactNode;
}

export function HitlScaInteraction({
  title = "Select a strategy to continue",
  subtitle,
  description,
  options,
  selectedOptionId,
  defaultSelectedOptionId,
  onOptionSelect,
  onConfirm,
  confirmLabel = "Confirm selection",
  isConfirming = false,
  disabled = false,
  className,
  confirmButtonClassName,
  footer,
  aside,
  emptySelectionHint,
}: HitlScaInteractionProps) {
  const [internalSelection, setInternalSelection] = useState<string | null>(defaultSelectedOptionId ?? null);

  useEffect(() => {
    setInternalSelection(defaultSelectedOptionId ?? null);
  }, [defaultSelectedOptionId]);

  const resolvedSelection = selectedOptionId ?? internalSelection;
  const prefersReducedMotion = usePrefersReducedMotion();

  const resolvedOptions = useMemo(
    () =>
      options.map((option) => ({
        ...option,
        disabled: disabled || option.disabled === true,
      })),
    [options, disabled],
  );

  const activeOption = useMemo(
    () => resolvedOptions.find((option) => option.id === resolvedSelection) ?? null,
    [resolvedOptions, resolvedSelection],
  );

  const listVariants = useMemo<Variants>(() => {
    if (prefersReducedMotion) {
      return {
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0,
            delayChildren: 0,
          },
        },
      };
    }
    return LIST_VARIANTS;
  }, [prefersReducedMotion]);

  const itemVariants = useMemo<Variants>(() => {
    if (prefersReducedMotion) {
      return {
        hidden: {
          opacity: 0,
        },
        show: {
          opacity: 1,
          transition: reducedMotionTransition,
        },
        exit: {
          opacity: 0,
          transition: reducedMotionTransition,
        },
      };
    }
    return ITEM_VARIANTS;
  }, [prefersReducedMotion]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (!selectedOptionId) {
        setInternalSelection(optionId);
      }
      onOptionSelect?.(optionId);
    },
    [selectedOptionId, onOptionSelect],
  );

  const handleConfirm = useCallback(() => {
    if (!resolvedSelection || disabled) {
      return;
    }
    onConfirm?.(resolvedSelection);
  }, [resolvedSelection, onConfirm, disabled]);

  return (
    <section
      className={cn(
        "flex h-full flex-col gap-8 p-8 text-text-primary",
        "bg-background-overlay/80 backdrop-blur-xl",
        "rounded-2xl border border-border-subtle shadow-2xl shadow-black/30",
        className,
      )}
      data-testid="hitl-sca-interaction"
    >
      <header className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-heading-medium">{title}</h2>
            {subtitle ? (
              <p className="text-caption uppercase tracking-[0.3em] text-text-tertiary">
                {subtitle}
              </p>
            ) : null}
          </div>
          {aside ? <div className="text-sm text-text-tertiary">{aside}</div> : null}
        </div>
        {description ? (
          <div className="prose prose-invert prose-sm max-w-none text-text-secondary">
            {description}
          </div>
        ) : null}
      </header>

      <motion.div
        className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {resolvedOptions.map((option) => (
            <motion.div
              key={option.id}
              layout={prefersReducedMotion ? false : "position"}
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <ScaOptionCard
                optionId={option.id}
                title={option.title}
                subtitle={option.subtitle}
                description={option.description}
                pros={option.pros}
                cons={option.cons}
                metrics={option.metrics}
                scoreTag={option.scoreTag}
                footer={option.footer}
                isSelected={option.id === resolvedSelection}
                disabled={option.disabled}
                onOptionSelect={handleSelect}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 pt-2 md:flex-row md:items-center md:justify-between"
        layout={!prefersReducedMotion}
        transition={
          prefersReducedMotion
            ? reducedMotionTransition
            : {
                type: "spring",
                stiffness: spring.gentle.stiffness,
                damping: spring.gentle.damping,
                mass: spring.gentle.mass,
              }
        }
      >
        <div className="text-sm text-text-tertiary">
          {activeOption ? (
            <span>
              Selected{" "}
              <span className="font-semibold text-text-secondary">{activeOption.title}</span>
              {activeOption.subtitle ? (
                <span className="text-text-tertiary"> • {activeOption.subtitle}</span>
              ) : null}
              .
            </span>
          ) : emptySelectionHint ? (
            emptySelectionHint
          ) : (
            <span>Please choose one option to continue.</span>
          )}
        </div>
        <Button
          type="button"
          size="lg"
          className={cn("min-w-[14rem]", confirmButtonClassName)}
          disabled={!resolvedSelection || disabled || isConfirming}
          onClick={handleConfirm}
        >
          {isConfirming ? (
            <>
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Processing…
            </>
          ) : (
            confirmLabel
          )}
        </Button>
      </motion.div>

      {footer ? <div className="border-t border-border-subtle/50 pt-4 text-sm text-text-secondary">{footer}</div> : null}
    </section>
  );
}
