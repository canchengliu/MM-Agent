import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import {
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
import type { UserSettingsUpdate } from "~/core/domain";

import type { SettingsTabProps } from "../types";

export function GeneralTab(_: SettingsTabProps) {
  const { control } = useFormContext<UserSettingsUpdate>();
  const t = useTranslations("settings.generalTab");

  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <FormField
        control={control}
        name="theme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("theme.label")}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder={t("theme.placeholder")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="light">{t("theme.light")}</SelectItem>
                <SelectItem value="dark">{t("theme.dark")}</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>{t("theme.description")}</FormDescription>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="language"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("language.label")}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder={t("language.placeholder")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="en">{t("language.en")}</SelectItem>
                <SelectItem value="zh">{t("language.zh")}</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>{t("language.description")}</FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}
