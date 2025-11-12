"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Undo2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
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
import type { UserSettingsUpdate } from "~/core/api/types";
import { applyServerValidationErrors, resolveApiErrorMessage } from "~/lib/form-error";

import type { SettingsTabProps } from "./types";

const engineSchema = z.object({
  llm_model_name: z
    .string()
    .max(120, { message: "模型名称长度需小于 120 个字符" })
    .optional(),
  llm_base_url: z
    .string()
    .max(512, { message: "URL 长度超出限制" })
    .refine((value) => !value || isValidUrl(value), {
      message: "请输入有效的 URL",
    })
    .optional(),
  llm_api_key: z.string().max(512, { message: "密钥长度超出限制" }).optional(),
  e2b_api_key: z.string().max(512, { message: "密钥长度超出限制" }).optional(),
});

type EngineSettingsValues = z.infer<typeof engineSchema>;

function normalizeNullableInput(value?: string | null) {
  const next = value?.trim() ?? "";
  return next.length ? next : null;
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol && parsed.host);
  } catch {
    return false;
  }
}

export function EngineSettingsTab({ settings, isLoading, onSubmit }: SettingsTabProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<EngineSettingsValues>({
    resolver: zodResolver(engineSchema),
    defaultValues: {
      llm_model_name: settings.llm_model_name ?? "",
      llm_base_url: settings.llm_base_url ?? "",
      llm_api_key: undefined,
      e2b_api_key: undefined,
    },
  });

  useEffect(() => {
    form.reset({
      llm_model_name: settings.llm_model_name ?? "",
      llm_base_url: settings.llm_base_url ?? "",
      llm_api_key: undefined,
      e2b_api_key: undefined,
    });
  }, [
    settings.llm_model_name,
    settings.llm_base_url,
    settings.has_llm_api_key,
    settings.has_e2b_api_key,
    form,
  ]);

  const handleSubmit = async (values: EngineSettingsValues) => {
    setSubmitError(null);
    const changes: UserSettingsUpdate = {};
    const normalizedModel = normalizeNullableInput(values.llm_model_name ?? "");
    const normalizedBaseURL = normalizeNullableInput(values.llm_base_url ?? "");

    if (normalizedModel !== (settings.llm_model_name ?? null)) {
      changes.llm_model_name = normalizedModel;
    }

    if (normalizedBaseURL !== (settings.llm_base_url ?? null)) {
      changes.llm_base_url = normalizedBaseURL;
    }

    if (values.llm_api_key !== undefined) {
      changes.llm_api_key = values.llm_api_key;
    }

    if (values.e2b_api_key !== undefined) {
      changes.e2b_api_key = values.e2b_api_key;
    }

    if (Object.keys(changes).length === 0) {
      form.reset({
        llm_model_name: settings.llm_model_name ?? "",
        llm_base_url: settings.llm_base_url ?? "",
        llm_api_key: undefined,
        e2b_api_key: undefined,
      });
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

  const hasCustomModel = useMemo(() => {
    return [settings.llm_model_name, settings.llm_base_url].some((value) => {
      if (typeof value === "string") {
        return value.trim().length > 0;
      }
      return Boolean(value);
    });
  }, [settings.llm_model_name, settings.llm_base_url]);

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          <p>密钥仅在输入时发送给服务器进行加密存储，前端不会保留。</p>
          <p className="mt-1">如需移除密钥，请点击“清除密钥”后提交，系统将以空字符串覆盖。</p>
        </div>

        <FormField
          control={form.control}
          name="llm_model_name"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel>自定义模型名称</FormLabel>
                {hasCustomModel && (
                  <Button
                    disabled={isDisabled}
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      form.setValue("llm_model_name", "", { shouldDirty: true });
                      form.setValue("llm_base_url", "", { shouldDirty: true });
                    }}
                  >
                    <Undo2 className="mr-1 size-4" />
                    恢复默认
                  </Button>
                )}
              </div>
              <FormControl>
                <Input
                  disabled={isDisabled}
                  placeholder="如未设置则使用平台默认模型"
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormDescription>填写供应商提供的模型 ID，例如 gpt-4.1 或 qwen-max。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="llm_base_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>自定义 Base URL</FormLabel>
              <FormControl>
                <Input
                  disabled={isDisabled}
                  inputMode="url"
                  placeholder="https://"
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormDescription>若不填写则沿用系统默认终端地址。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <ApiKeyField
          control={form.control}
          disabled={isDisabled}
          form={form}
          hasKey={settings.has_llm_api_key}
          label="LLM API Key"
          name="llm_api_key"
          placeholder={
            settings.has_llm_api_key ? "已设置，输入以覆盖" : "请输入 LLM 提供的 API Key"
          }
        />

        <ApiKeyField
          control={form.control}
          disabled={isDisabled}
          form={form}
          hasKey={settings.has_e2b_api_key}
          label="E2B API Key"
          name="e2b_api_key"
          placeholder={
            settings.has_e2b_api_key ? "已设置，输入以覆盖" : "请输入 E2B 沙箱 API Key"
          }
        />

        {submitError ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 flex-none" />
            <span>{submitError}</span>
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

interface ApiKeyFieldProps {
  hasKey: boolean;
  label: string;
  placeholder: string;
  name: "llm_api_key" | "e2b_api_key";
  disabled: boolean;
  form: UseFormReturn<EngineSettingsValues>;
  control: UseFormReturn<EngineSettingsValues>["control"];
}

const ApiKeyField = ({
  label,
  placeholder,
  hasKey,
  disabled,
  name,
  form,
  control,
}: ApiKeyFieldProps) => {
  const clearField = () => {
    form.setValue(name, "", { shouldDirty: true });
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between gap-3">
            <FormLabel>{label}</FormLabel>
            {hasKey ? (
              <Button
                disabled={disabled}
                size="sm"
                type="button"
                variant="ghost"
                onClick={clearField}
              >
                清除密钥
              </Button>
            ) : null}
          </div>
          <FormControl>
            <Input
              disabled={disabled}
              placeholder={placeholder}
              type="password"
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value)}
            />
          </FormControl>
          <FormDescription>
            留空表示保持现状；提交空字符串会清除已保存的密钥。
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
