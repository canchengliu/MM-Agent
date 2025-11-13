"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Loader2, SunMoon, UserCheck, Zap } from "lucide-react";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { infer as zInfer } from "zod";
import { useShallow } from "zustand/react/shallow";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  HitlProfileEnum,
  LanguageEnum,
  ThemeEnumAPI,
  ThinkingDepthEnum,
  UserSettingsUpdateSchema,
} from "~/core/models/settings.model";
import { useStore } from "~/core/store";

// Define the schema for the form based on the API models
const PreferencesFormSchema = UserSettingsUpdateSchema.pick({
  language: true,
  theme: true,
  hitl_profile: true,
  thinking_depth: true,
}).required(); // Fields are required for the form initialization

type PreferencesFormValues = zInfer<typeof PreferencesFormSchema>;

// Implements S2.1, S2.2, S4.1, S4.2
export function PreferencesForm() {
  const { settings, updateSettings, isUpdatingSettings } = useStore(
    useShallow((state) => ({
      settings: state.settings,
      updateSettings: state.updateSettings,
      isUpdatingSettings: state.isUpdatingSettings,
    })),
  );

  const { setTheme } = useTheme(); // next-themes hook for immediate UI update
  const currentLocale = useLocale(); // next-intl hook for current locale

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(PreferencesFormSchema),
    // Default values are initialized via reset() when settings load
  });

  // Initialize form values when settings data is available
  useEffect(() => {
    if (settings) {
      form.reset({
        language: settings.language,
        theme: settings.theme,
        hitl_profile: settings.hitl_profile,
        thinking_depth: settings.thinking_depth,
      });
    }
  }, [settings, form]);

  async function onSubmit(values: PreferencesFormValues) {
    // 1. Handle Theme Change (Immediate UI Feedback)
    if (values.theme !== settings?.theme) {
      // Update next-themes immediately so the UI reflects the change
      setTheme(values.theme);
    }

    // 2. Handle Language Change (Check if reload is needed)
    // This follows the pattern established in deer-flow/language-switcher.tsx (Front Stack 4)
    let requiresReload = false;
    if (values.language !== currentLocale) {
      // Update the cookie required by next-intl (i18n.ts)
      document.cookie = `NEXT_LOCALE=${values.language}; path=/; max-age=31536000; SameSite=lax`;
      requiresReload = true;
    }

    // 3. Update all settings via API (Zustand action)
    const success = await updateSettings(values);

    // 4. Trigger reload if language changed
    if (success && requiresReload) {
      // Provide feedback before reloading
      toast.info("Applying language change...", {
        description: "The application will reload shortly.",
      });
      window.location.reload();
    }
  }

  // The Wrapper ensures settings are loaded, but we handle it defensively.
  if (!settings) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* --- Interface Settings (S2) --- */}
        <h3 className="text-lg font-medium">Interface</h3>

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            // Styled as a settings row for better visual hierarchy
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center text-base">
                  <Globe className="mr-2 h-4 w-4" /> Language
                </FormLabel>
                <FormDescription>
                  Select the language for the user interface (S2.1).
                </FormDescription>
              </div>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LanguageEnum.enum.en}>
                      🇺🇸 English
                    </SelectItem>
                    <SelectItem value={LanguageEnum.enum.zh}>🇨🇳 中文</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center text-base">
                  <SunMoon className="mr-2 h-4 w-4" /> Theme
                </FormLabel>
                <FormDescription>
                  Select the interface theme (S2.2).
                </FormDescription>
              </div>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ThemeEnumAPI.enum.light}>
                      Light Mode
                    </SelectItem>
                    <SelectItem value={ThemeEnumAPI.enum.dark}>
                      Dark Mode
                    </SelectItem>
                    {/* Note: 'System' theme is managed by next-themes provider, but the API stores explicit light/dark */}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- AI Behavior Settings (S4) --- */}
        <h3 className="pt-6 text-lg font-medium">AI Behavior</h3>

        <FormField
          control={form.control}
          name="hitl_profile"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center text-base">
                  <UserCheck className="mr-2 h-4 w-4" /> HITL Profile
                </FormLabel>
                <FormDescription>
                  Defines AI interaction style during Human-in-the-Loop stages
                  (S4.1).
                </FormDescription>
              </div>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={HitlProfileEnum.enum.Novice}>
                      Novice (More guidance)
                    </SelectItem>
                    <SelectItem value={HitlProfileEnum.enum.Experienced}>
                      Experienced (Balanced)
                    </SelectItem>
                    <SelectItem value={HitlProfileEnum.enum.Expert}>
                      Expert (Concise)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thinking_depth"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center text-base">
                  <Zap className="mr-2 h-4 w-4" /> Thinking Depth
                </FormLabel>
                <FormDescription>
                  Impacts AI complexity, response time, and result quality
                  (S4.2).
                </FormDescription>
              </div>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select depth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ThinkingDepthEnum.enum.Instant}>
                      Instant (Fastest)
                    </SelectItem>
                    <SelectItem value={ThinkingDepthEnum.enum.Medium}>
                      Medium (Balanced)
                    </SelectItem>
                    <SelectItem value={ThinkingDepthEnum.enum.Heavy}>
                      Heavy (Comprehensive)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button is disabled if updating or if the form hasn't changed */}
        <Button type="submit" disabled={isUpdatingSettings || !form.formState.isDirty}>
          {isUpdatingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Preferences
        </Button>
      </form>
    </Form>
  );
}
