"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  reducedMotionTransition,
  usePrefersReducedMotion,
} from "~/lib/a11y/motion-preferences";
import { duration, easing, spring } from "~/lib/motion-tokens";
import { cn } from "~/lib/utils";

type InteractionMode = "decision" | "revision";

const ACTION_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    scale: 0.97,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: spring.default.stiffness,
      damping: spring.default.damping,
      mass: spring.default.mass,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: duration.fast,
      ease: easing.accelerate,
    },
  },
};

export interface HitlVarlInteractionProps {
  title?: string;
  subtitle?: string;
  description?: ReactNode;
  promptIcon?: ReactNode;
  content: ReactNode;
  onApprove?: () => void;
  onSubmitRevision?: (feedback: string) => void;
  onEnterRevision?: () => void;
  onCancelRevision?: () => void;
  approveLabel?: string;
  requestRevisionLabel?: string;
  submitRevisionLabel?: string;
  cancelRevisionLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  defaultFeedback?: string;
  autoFocusOnRevision?: boolean;
  className?: string;
  footer?: ReactNode;
  reviewMeta?: ReactNode;
  minFeedbackLength?: number;
}

export function HitlVarlInteraction({
  title = "Review and approve",
  subtitle,
  description,
  promptIcon = <Sparkles className="size-4 text-text-accent" aria-hidden="true" />,
  content,
  onApprove,
  onSubmitRevision,
  onEnterRevision,
  onCancelRevision,
  approveLabel = "Approve",
  requestRevisionLabel = "Request revision",
  submitRevisionLabel = "Submit revision",
  cancelRevisionLabel = "Back",
  isSubmitting = false,
  disabled = false,
  defaultFeedback,
  autoFocusOnRevision = true,
  className,
  footer,
  reviewMeta,
  minFeedbackLength = 1,
}: HitlVarlInteractionProps) {
  const [mode, setMode] = useState<InteractionMode>("decision");
  const [feedback, setFeedback] = useState<string>(defaultFeedback ?? "");
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setFeedback(defaultFeedback ?? "");
  }, [defaultFeedback]);

  useEffect(() => {
    if (mode === "revision" && autoFocusOnRevision) {
      const textarea = document.getElementById("hitl-varl-feedback") as HTMLTextAreaElement | null;
      textarea?.focus({ preventScroll: true });
    }
  }, [mode, autoFocusOnRevision]);

  const trimmedFeedback = useMemo(() => feedback.trim(), [feedback]);
  const isFeedbackValid = trimmedFeedback.length >= minFeedbackLength;
  const actionVariants = useMemo<Variants>(() => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: reducedMotionTransition,
        },
        exit: {
          opacity: 0,
          transition: reducedMotionTransition,
        },
      };
    }
    return ACTION_VARIANTS;
  }, [prefersReducedMotion]);

  const handleApprove = useCallback(() => {
    if (disabled || isSubmitting) {
      return;
    }
    onApprove?.();
  }, [disabled, isSubmitting, onApprove]);

  const enterRevision = useCallback(() => {
    if (disabled) {
      return;
    }
    setMode("revision");
    onEnterRevision?.();
  }, [disabled, onEnterRevision]);

  const cancelRevision = useCallback(() => {
    setMode("decision");
    setFeedback(defaultFeedback ?? "");
    onCancelRevision?.();
  }, [defaultFeedback, onCancelRevision]);

  const handleSubmitRevision = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isFeedbackValid || disabled) {
        return;
      }
      onSubmitRevision?.(trimmedFeedback);
    },
    [isFeedbackValid, disabled, onSubmitRevision, trimmedFeedback],
  );

  return (
    <section
      className={cn(
        "flex h-full flex-col gap-8 p-8 text-text-primary",
        "rounded-2xl border border-border-subtle bg-background-overlay/80 backdrop-blur-xl",
        "shadow-2xl shadow-black/25",
        className,
      )}
      data-testid="hitl-varl-interaction"
    >
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.35em] text-text-tertiary">
              {promptIcon}
              <span>{subtitle ?? "Human-in-the-loop review"}</span>
            </div>
            <h2 className="text-heading-medium">{title}</h2>
          </div>
          {reviewMeta ? (
            <div className="flex flex-col items-end gap-1 text-right text-sm text-text-tertiary">
              {reviewMeta}
            </div>
          ) : null}
        </div>
        {description ? (
          <p className="text-body-medium text-text-secondary">{description}</p>
        ) : null}
      </header>

      <div className="prose prose-invert max-w-none flex-1 overflow-y-auto rounded-xl border border-border-subtle/40 bg-background-primary/70 p-6 text-text-secondary shadow-inner shadow-black/10">
        {content}
      </div>

      <motion.footer
        className="mt-auto space-y-4"
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
        <AnimatePresence mode="wait">
          {mode === "decision" ? (
            <motion.div
              key="decision-controls"
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end"
              variants={actionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Button
                type="button"
                size="lg"
                variant="secondary"
                disabled={disabled || isSubmitting}
                onClick={enterRevision}
              >
                {requestRevisionLabel}
              </Button>
              <Button
                type="button"
                size="lg"
                disabled={disabled || isSubmitting}
                onClick={handleApprove}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Processing…
                  </>
                ) : (
                  approveLabel
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="revision-form"
              className="flex flex-col gap-4 rounded-xl border border-border-subtle/50 bg-background-primary/80 p-5 shadow-lg shadow-black/20"
              onSubmit={handleSubmitRevision}
              variants={actionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="space-y-2">
                <label htmlFor="hitl-varl-feedback" className="text-sm font-semibold text-text-secondary">
                  Provide revision guidance
                </label>
                <Textarea
                  id="hitl-varl-feedback"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Explain what needs to be revised so the system can regenerate the output."
                  minLength={minFeedbackLength}
                  rows={5}
                  disabled={disabled}
                />
                <p className="text-xs text-text-tertiary">
                  Clearly describe what should change — highlight incorrect assumptions, missing details, or desired improvements.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="sm:order-1"
                  disabled={isSubmitting}
                  onClick={cancelRevision}
                >
                  {cancelRevisionLabel}
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!isFeedbackValid || disabled || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                      Submitting…
                    </>
                  ) : (
                    submitRevisionLabel
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.footer>

      {footer ? (
        <div className="border-t border-border-subtle/40 pt-4 text-sm text-text-tertiary">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
