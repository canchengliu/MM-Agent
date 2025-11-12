"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { UserSettingsUpdate } from "~/core/api/types";
import { applyServerValidationErrors, resolveApiErrorMessage } from "~/lib/form-error";

import type { SettingsTabProps } from "./types";

const interfaceSchema = z.object({
  language: z.enum(["en", "zh"]),
  theme: z.enum(["light", "dark"]),
});

type InterfaceSettingsValues = z.infer<typeof interfaceSchema>;

const LANGUAGE_OPTIONS = [
  { value: "zh", label: "简体中文" },
  { value: "en", label: "English" },
];

const THEME_OPTIONS = [
  { value: "light", label: "浅色模式" },
  { value: "dark", label: "深色模式" },
];

export function InterfaceSettingsTab({ settings, isLoading, onSubmit }: SettingsTabProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<InterfaceSettingsValues>({
    resolver: zodResolver(interfaceSchema),
    defaultValues: {
      language: settings.language,
      theme: settings.theme,
    },
  });

  useEffect(() => {
    form.reset({
      language: settings.language,
      theme: settings.theme,
    });
  }, [settings.language, settings.theme, form]);

  const handleSubmit = async (values: InterfaceSettingsValues) => {
    setSubmitError(null);
    const changes: UserSettingsUpdate = {};

    if (values.language !== settings.language) {
      changes.language = values.language;
    }
    if (values.theme !== settings.theme) {
      changes.theme = values.theme;
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
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>界面语言</FormLabel>
              <Select disabled={isDisabled} onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择语言" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>主题模式</FormLabel>
              <Select disabled={isDisabled} onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择主题" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {THEME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
