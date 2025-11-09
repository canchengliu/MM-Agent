// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "~/components/ui/badge";
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
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useSettings, useUpdateSettings } from "~/core/api/hooks/useSettings";

const engineFormSchema = z.object({
  llm_provider: z.string().optional(),
  llm_model_name: z.string().min(1, "Model name is required."),
  llm_api_key: z.string().optional(),
  llm_base_url: z
    .string()
    .url({ message: "Invalid URL format." })
    .or(z.literal(""))
    .optional(),
});

type EngineFormValues = z.infer<typeof engineFormSchema>;

const API_KEY_PLACEHOLDER = "********";

export function EngineForm() {
  const { data: settings, isLoading } = useSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateSettings();
  const [showApiKey, setShowApiKey] = useState(false);

  const form = useForm<EngineFormValues>({
    resolver: zodResolver(engineFormSchema),
    defaultValues: {
      llm_provider: "",
      llm_model_name: "",
      llm_api_key: "",
      llm_base_url: "",
    },
  });

  useEffect(() => {
    if (settings?.llm_config) {
      form.reset({
        llm_provider: settings.llm_config.llm_provider ?? "",
        llm_model_name: settings.llm_config.llm_model_name ?? "",
        llm_api_key: settings.llm_config.has_api_key ? API_KEY_PLACEHOLDER : "",
        llm_base_url: settings.llm_config.llm_base_url ?? "",
      });
    }
  }, [form, settings?.llm_config]);

  const onSubmit = async (data: EngineFormValues) => {
    const payload = {
      llm_config: {
        llm_provider: data.llm_provider ? data.llm_provider : null,
        llm_model_name: data.llm_model_name,
        llm_base_url: data.llm_base_url ? data.llm_base_url : null,
        llm_api_key: undefined as string | undefined,
      },
    };

    if (data.llm_api_key !== API_KEY_PLACEHOLDER) {
      payload.llm_config.llm_api_key = data.llm_api_key ?? "";
    }

    try {
      await updateSettings(payload);
    } catch (error) {
      console.error("Failed to update engine settings", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Loading engine settings...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h3 className="text-lg font-medium">Language Model (LLM) Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure the LLM provider used by the workflow engine.
          </p>
        </div>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="llm_provider"
            render={({ field }) => (
              <FormItem className="max-w-xl">
                <FormLabel>Provider (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., openai, anthropic"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>The name of the LLM provider.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="llm_model_name"
            render={({ field }) => (
              <FormItem className="max-w-xl">
                <FormLabel>Model Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., gpt-4o, claude-3-opus"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  The specific model to use for generation tasks.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="llm_api_key"
            render={({ field }) => (
              <FormItem className="max-w-xl">
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-..."
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        if (field.value === API_KEY_PLACEHOLDER) {
                          field.onChange(
                            event.target.value.replace(API_KEY_PLACEHOLDER, ""),
                          );
                        } else {
                          field.onChange(event.target.value);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowApiKey((previous) => !previous)}
                      aria-label={showApiKey ? "Hide API key" : "Show API key"}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Your API key for the LLM provider. Leave unchanged to keep the existing key.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="llm_base_url"
            render={({ field }) => (
              <FormItem className="max-w-xl">
                <FormLabel>API Base URL (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://api.openai.com/v1"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  The base URL for the LLM provider API (for proxies or custom endpoints).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium">Advanced Configuration (coming soon)</h3>
          <p className="text-sm text-muted-foreground">
            These features are planned but not yet implemented.
          </p>
          <div className="mt-4 space-y-4">
            <div className="max-w-xl space-y-2">
              <Label>E2B API Key</Label>
              <Input disabled />
              <Badge variant="outline">Upcoming</Badge>
            </div>
            <div className="max-w-xl space-y-2">
              <Label>HITL Behavior</Label>
              <Input disabled placeholder="Select..." />
              <Badge variant="outline">Upcoming</Badge>
            </div>
            <div className="max-w-xl space-y-2">
              <Label>Thinking Depth</Label>
              <Input disabled placeholder="Select..." />
              <Badge variant="outline">Upcoming</Badge>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || !form.formState.isDirty}
        >
          {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Save configuration
        </Button>
      </form>
    </Form>
  );
}
