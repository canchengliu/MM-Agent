import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { UserSettingsUpdate } from "~/core/domain";

import type { SettingsTabProps } from "../types";

import { ApiKeyInput } from "./ApiKeyInput";

export function AiConfigTab({
  hasLlmApiKey,
  hasE2bApiKey,
}: SettingsTabProps) {
  const { control } = useFormContext<UserSettingsUpdate>();
  const t = useTranslations("settings.aiConfigTab");

  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>

      <div className="space-y-6 rounded-lg border p-4">
        <h3 className="font-medium">{t("interactionCardTitle")}</h3>
        <FormField
          control={control}
          name="hitl_profile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hitlProfile.label")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-60">
                    <SelectValue placeholder={t("hitlProfile.placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Novice">{t("hitlProfile.novice")}</SelectItem>
                  <SelectItem value="Experienced">
                    {t("hitlProfile.experienced")}
                  </SelectItem>
                  <SelectItem value="Expert">
                    {t("hitlProfile.expert")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>{t("hitlProfile.description")}</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="thinking_depth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("thinkingDepth.label")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-60">
                    <SelectValue
                      placeholder={t("thinkingDepth.placeholder")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Instant">
                    {t("thinkingDepth.instant")}
                  </SelectItem>
                  <SelectItem value="Medium">
                    {t("thinkingDepth.medium")}
                  </SelectItem>
                  <SelectItem value="Heavy">
                    {t("thinkingDepth.heavy")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>{t("thinkingDepth.description")}</FormDescription>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-6 rounded-lg border p-4">
        <h3 className="font-medium">{t("byokModelCardTitle")}</h3>
        <FormField
          control={control}
          name="llm_model_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("llmModel.label")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("llmModel.placeholder")}
                />
              </FormControl>
              <FormDescription>{t("llmModel.description")}</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="llm_base_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("llmBaseUrl.label")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("llmBaseUrl.placeholder")}
                />
              </FormControl>
              <FormDescription>{t("llmBaseUrl.description")}</FormDescription>
            </FormItem>
          )}
        />
        <ApiKeyInput
          fieldName="llm_api_key"
          label={t("llmApiKey.label")}
          hasKey={hasLlmApiKey}
          placeholder={t("llmApiKey.placeholder")}
          statusText={t("apiKeyStatus")}
          clearButtonText={t("clearAndReplace")}
        />
      </div>

      <div className="space-y-6 rounded-lg border p-4">
        <h3 className="font-medium">{t("byokE2bCardTitle")}</h3>
        <ApiKeyInput
          fieldName="e2b_api_key"
          label={t("e2bApiKey.label")}
          hasKey={hasE2bApiKey}
          placeholder={t("e2bApiKey.placeholder")}
          statusText={t("apiKeyStatus")}
          clearButtonText={t("clearAndReplace")}
        />
      </div>
    </div>
  );
}
