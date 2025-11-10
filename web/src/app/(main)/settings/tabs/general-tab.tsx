"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import type { SettingsState } from "~/core/store";

export function GeneralTab({
  settings,
  onChange,
}: {
  settings: SettingsState;
  onChange: (value: Partial<SettingsState>) => void;
}) {
  const t = useTranslations("settings.general");

  const schema = z.object({
    enableDeepThinking: z.boolean(),
    enableBackgroundInvestigation: z.boolean(),
    reportStyle: z.enum([
      "academic",
      "popular_science",
      "news",
      "social_media",
      "strategic_investment",
    ]),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: settings.general,
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      onChange({ general: value as SettingsState["general"] });
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  useEffect(() => {
    form.reset(settings.general);
  }, [settings.general, form]);

  return (
    <Form {...form}>
      <form className="grid gap-6">
        <FormField
          control={form.control}
          name="enableDeepThinking"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("deepThinking.label")}
                </FormLabel>
                <FormDescription>
                  {t("deepThinking.description")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enableBackgroundInvestigation"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("backgroundInvestigation.label")}
                </FormLabel>
                <FormDescription>
                  {t("backgroundInvestigation.description")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reportStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("reportStyle.label")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("reportStyle.placeholder")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="academic">
                    {t("reportStyle.academic")}
                  </SelectItem>
                  <SelectItem value="popular_science">
                    {t("reportStyle.popular_science")}
                  </SelectItem>
                  <SelectItem value="news">
                    {t("reportStyle.news")}
                  </SelectItem>
                  <SelectItem value="social_media">
                    {t("reportStyle.social_media")}
                  </SelectItem>
                  <SelectItem value="strategic_investment">
                    {t("reportStyle.strategic_investment")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t("reportStyle.description")}
              </FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
