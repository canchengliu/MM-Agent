"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import type { UserSettingsRead, UserSettingsUpdate } from "~/core/domain";
import {
  useUpdateSettings,
  useUserSettings,
} from "~/features/settings/hooks/useUserSettings";
import { cn } from "~/lib/utils";

import { SETTINGS_TABS } from "./tabs";

const settingsSchema = z.object({
  language: z.enum(["en", "zh"]),
  theme: z.enum(["light", "dark"]),
  hitl_profile: z.enum(["Novice", "Experienced", "Expert"]),
  thinking_depth: z.enum(["Instant", "Medium", "Heavy"]),
  llm_model_name: z.union([z.string().trim(), z.null()]).optional(),
  llm_base_url: z
    .union([z.string().trim().url(), z.literal(""), z.null()])
    .optional(),
  llm_api_key: z.string().optional().nullable(),
  e2b_api_key: z.string().optional().nullable(),
});

const mapSettingsToFormValues = (
  data: UserSettingsRead,
): UserSettingsUpdate => ({
  language: data.language,
  theme: data.theme,
  hitl_profile: data.hitl_profile,
  thinking_depth: data.thinking_depth,
  llm_model_name: data.llm_model_name,
  llm_base_url: data.llm_base_url,
  llm_api_key: null,
  e2b_api_key: null,
});

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const tTabs = useTranslations("settings.tabs");

  const [activeTabId, setActiveTabId] = useState(SETTINGS_TABS[0]!.id);
  const { data: settings, isLoading } = useUserSettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateSettings();

  const form = useForm<UserSettingsUpdate>({
    resolver: zodResolver(settingsSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields },
  } = form;

  useEffect(() => {
    if (settings) {
      reset(mapSettingsToFormValues(settings));
    }
  }, [settings, reset]);

  const onSubmit = (data: UserSettingsUpdate) => {
    if (!isDirty) return;

    const changedData: Partial<UserSettingsUpdate> = {};
    for (const key of Object.keys(dirtyFields)) {
      const fieldKey = key as keyof UserSettingsUpdate;
      changedData[fieldKey] = data[fieldKey] ?? null;
    }

    if (changedData.llm_api_key === "") changedData.llm_api_key = null;
    if (changedData.e2b_api_key === "") changedData.e2b_api_key = null;
    if (changedData.llm_base_url === "") changedData.llm_base_url = null;
    if (changedData.llm_model_name === "") changedData.llm_model_name = null;

    if (Object.keys(changedData).length > 0) {
      updateSettings(changedData);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl space-y-6 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-full" />
        <div className="flex gap-8">
          <Skeleton className="h-48 w-52" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container mx-auto max-w-5xl py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <div className="flex gap-8">
            <nav className="flex w-52 shrink-0 flex-col">
              {SETTINGS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTabId === tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={cn(
                    "mb-1 flex h-9 w-full cursor-pointer items-center justify-start gap-2 rounded px-3 text-sm font-medium",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    activeTabId === tab.id &&
                      "!bg-primary !text-primary-foreground",
                  )}
                >
                  <tab.icon size={16} />
                  <span>
                    {tTabs(tab.id as "general" | "ai-config" | "about")}
                  </span>
                </button>
              ))}
            </nav>

            <main className="min-w-0 flex-grow">
              {SETTINGS_TABS.map((tab) => (
                <div
                  key={tab.id}
                  role="tabpanel"
                  className={cn(activeTabId !== tab.id && "hidden")}
                >
                  <tab.component
                    hasLlmApiKey={settings.has_llm_api_key}
                    hasE2bApiKey={settings.has_e2b_api_key}
                  />
                </div>
              ))}
            </main>
          </div>
        </div>

        <footer
          className={cn(
            "sticky bottom-0 mt-8 border-t bg-background/80 py-4 backdrop-blur transition-opacity",
            isDirty ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div className="container mx-auto flex max-w-5xl justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset(mapSettingsToFormValues(settings))}
              disabled={isSaving}
            >
              {tCommon("reset")}
            </Button>
            <Button type="submit" disabled={!isDirty || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tCommon("saveChanges")}
            </Button>
          </div>
        </footer>
      </form>
    </FormProvider>
  );
}
