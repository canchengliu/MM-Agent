"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
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
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import type { UserSettingsUpdate } from "~/core/domain/user.types";

import {
  useUpdateSettings,
  useUserSettings,
} from "../hooks/useUserSettings";

import { ApiKeyInput } from "./ApiKeyInput";

const formSchema = z.object({
  hitl_profile: z.enum(["Novice", "Experienced", "Expert"]),
  thinking_depth: z.enum(["Instant", "Medium", "Heavy"]),
  llm_model_name: z.string().nullable(),
  llm_base_url: z.union([
    z
      .string()
      .url({ message: "Please enter a valid URL." }),
    z.literal(""),
    z.null(),
  ]),
  llm_api_key: z.string().nullable(),
  e2b_api_key: z.string().nullable(),
});

type AIConfigFormValues = z.infer<typeof formSchema>;

export function AIConfigForm() {
  const { data: settings, isLoading: isLoadingSettings } = useUserSettings();
  const { mutate: updateSettings, isPending: isUpdating } =
    useUpdateSettings();

  const form = useForm<AIConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hitl_profile: "Experienced",
      thinking_depth: "Medium",
      llm_model_name: null,
      llm_base_url: null,
      llm_api_key: null,
      e2b_api_key: null,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        ...settings,
        llm_api_key: null,
        e2b_api_key: null,
      });
    }
  }, [settings, form]);

  const onSubmit = (values: AIConfigFormValues) => {
    const dirtyFields = form.formState.dirtyFields;
    if (Object.keys(dirtyFields).length === 0) {
      return;
    }

    const payload: UserSettingsUpdate = {};
    for (const key in dirtyFields) {
      if (
        Object.prototype.hasOwnProperty.call(dirtyFields, key) &&
        (dirtyFields as Record<string, unknown>)[key]
      ) {
        const formKey = key as keyof AIConfigFormValues;
        (payload as Record<string, unknown>)[formKey] =
          values[formKey] === "" ? null : values[formKey];
      }
    }

    updateSettings(payload, {
      onSuccess: () => {
        form.reset(form.getValues(), { keepIsDirty: false });
      },
    });
  };

  if (isLoadingSettings) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="hitl_profile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI Interaction Profile</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a profile" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Novice">Novice</SelectItem>
                    <SelectItem value="Experienced">Experienced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Adjusts how AI interacts and provides guidance.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="thinking_depth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI Thinking Depth</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a depth" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Instant">Instant</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Impacts content complexity and generation time.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="llm_model_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom LLM Model Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., gpt-4-turbo (leave blank for system default)"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="llm_base_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom LLM Base URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., https://api.openai.com/v1 (leave blank for system default)"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ApiKeyInput
          name="llm_api_key"
          label="LLM API Key"
          description="Your personal Large Language Model API key. It will be securely stored."
          hasKey={settings?.has_llm_api_key ?? false}
        />
        <ApiKeyInput
          name="e2b_api_key"
          label="E2B Sandbox API Key"
          description="Your personal E2B (secure code execution sandbox) API key."
          hasKey={settings?.has_e2b_api_key ?? false}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isUpdating || !form.formState.isDirty}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
