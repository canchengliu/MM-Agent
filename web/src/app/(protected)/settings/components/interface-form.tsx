// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useSettings, useUpdateSettings } from "~/core/api/hooks/useSettings";
import type { UITheme } from "~/core/api/models/settings";

const interfaceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Select a theme.",
  }),
});

type InterfaceFormValues = z.infer<typeof interfaceFormSchema>;

export function InterfaceForm() {
  const { data: settings, isLoading } = useSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateSettings();
  const { setTheme } = useTheme();

  const form = useForm<InterfaceFormValues>({
    resolver: zodResolver(interfaceFormSchema),
    defaultValues: { theme: "system" },
  });

  useEffect(() => {
    if (settings?.ui_theme) {
      form.reset({ theme: settings.ui_theme });
    }
  }, [form, settings?.ui_theme]);

  const onSubmit = async (data: InterfaceFormValues) => {
    try {
      await updateSettings({
        ui_preferences: {
          ui_theme: data.theme as UITheme,
        },
      });
      setTheme(data.theme);
    } catch (error) {
      console.error("Failed to update settings", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Loading interface settings...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-lg font-medium">Theme</FormLabel>
              <FormDescription>
                Select the theme for the platform interface.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid max-w-md grid-cols-3 gap-8 pt-2"
              >
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="light" className="sr-only" />
                    </FormControl>
                    <div className="cursor-pointer items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-2 w-1/2 rounded-lg bg-[#ecedef]" />
                          <div className="h-2 w-2/3 rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-1/2 rounded-lg bg-[#ecedef]" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Light
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="dark" className="sr-only" />
                    </FormControl>
                    <div className="cursor-pointer items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                        <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-2 w-1/2 rounded-lg bg-slate-400" />
                          <div className="h-2 w-2/3 rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-1/2 rounded-lg bg-slate-400" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Dark
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="system" className="sr-only" />
                    </FormControl>
                    <div className="cursor-pointer items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="relative h-[88px] overflow-hidden rounded-sm">
                        <div className="absolute left-0 top-0 h-full w-1/2 bg-[#ecedef] p-2">
                          <div className="mt-2 h-2 w-2/3 rounded-lg bg-white" />
                        </div>
                        <div className="absolute right-0 top-0 h-full w-1/2 bg-slate-950 p-2">
                          <div className="mt-2 h-2 w-2/3 rounded-lg bg-slate-800" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      System
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending || !form.formState.isDirty}
        >
          {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Update preferences
        </Button>
      </form>
    </Form>
  );
}
