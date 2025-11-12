"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { UserSettingsUpdate } from "~/core/api/types";
import { applyServerValidationErrors, resolveApiErrorMessage } from "~/lib/form-error";

import type { SettingsTabProps } from "./types";

const behaviorSchema = z.object({
  hitl_profile: z.enum(["Novice", "Experienced", "Expert"]),
  thinking_depth: z.enum(["Instant", "Medium", "Heavy"]),
});

type BehaviorSettingsValues = z.infer<typeof behaviorSchema>;

const HITL_PROFILE_OPTIONS = [
  { value: "Novice", label: "新手 (Novice)" },
  { value: "Experienced", label: "熟练 (Experienced)" },
  { value: "Expert", label: "专家 (Expert)" },
];

const THINKING_DEPTH_OPTIONS = [
  { value: "Instant", label: "即时 (Instant)" },
  { value: "Medium", label: "中等 (Medium)" },
  { value: "Heavy", label: "深度 (Heavy)" },
];

export function AiBehaviorSettingsTab({ settings, isLoading, onSubmit }: SettingsTabProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<BehaviorSettingsValues>({
    resolver: zodResolver(behaviorSchema),
    defaultValues: {
      hitl_profile: settings.hitl_profile,
      thinking_depth: settings.thinking_depth,
    },
  });

  useEffect(() => {
    form.reset({
      hitl_profile: settings.hitl_profile,
      thinking_depth: settings.thinking_depth,
    });
  }, [settings.hitl_profile, settings.thinking_depth, form]);

  const handleSubmit = async (values: BehaviorSettingsValues) => {
    setSubmitError(null);
    const changes: UserSettingsUpdate = {};

    if (values.hitl_profile !== settings.hitl_profile) {
      changes.hitl_profile = values.hitl_profile;
    }
    if (values.thinking_depth !== settings.thinking_depth) {
      changes.thinking_depth = values.thinking_depth;
    }

    if (Object.keys(changes).length === 0) {
      form.reset(values);
      return;
    }

    try {
      await onSubmit(changes);
    } catch (error) {
      const hasAppliedErrors = applyServerValidationErrors(error, form);
      if (!hasAppliedErrors) {
        setSubmitError(resolveApiErrorMessage(error));
      }
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const isDisabled = isLoading || isSubmitting;

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="hitl_profile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HITL Profile</FormLabel>
              <Select disabled={isDisabled} onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择交互等级" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {HITL_PROFILE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>影响 HITL 阶段的提示强度与解释粒度。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thinking_depth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>思考深度</FormLabel>
              <Select disabled={isDisabled} onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择推理深度" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {THINKING_DEPTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>深度越高，生成内容越详实但耗时更长。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {submitError}
          </div>
        ) : null}

        <Button className="min-w-32" disabled={isDisabled || !form.formState.isDirty} type="submit">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              正在保存...
            </>
          ) : (
            "保存更改"
          )}
        </Button>
      </form>
    </Form>
  );
}
