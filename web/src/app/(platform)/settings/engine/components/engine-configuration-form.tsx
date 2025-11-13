"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Brain, Key, Loader2, Terminal } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { infer as zInfer } from "zod";
import { useShallow } from "zustand/react/shallow";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  UserSettingsUpdateSchema,
} from "~/core/models/settings.model";
import type { UserSettingsUpdate } from "~/core/models/settings.model";
import { useStore } from "~/core/store";

// Define the schema for the form using the Update schema.
const EngineFormSchema = UserSettingsUpdateSchema.pick({
  llm_model_name: true,
  llm_base_url: true,
  llm_api_key: true,
  e2b_api_key: true,
});

type EngineFormValues = zInfer<typeof EngineFormSchema>;

// Helper component to display the status of an API key (S3.3)
const ApiKeyStatus = ({ isSet }: { isSet: boolean }) => (
  <div
    className={`mt-1 flex items-center text-xs font-medium ${
      isSet ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
    }`}
  >
    <Key className="mr-1 h-3 w-3" />
    {isSet ? "Key is configured" : "Key not configured (Using system default)"}
  </div>
);

// Implements S3.1, S3.2, S3.3
export function EngineConfigurationForm() {
  const { settings, updateSettings, isUpdatingSettings } = useStore(
    useShallow((state) => ({
      settings: state.settings,
      updateSettings: state.updateSettings,
      isUpdatingSettings: state.isUpdatingSettings,
    })),
  );

  const form = useForm<EngineFormValues>({
    resolver: zodResolver(EngineFormSchema),
    // Default values initialized via reset()
  });

  // Initialize form values when settings data is available
  useEffect(() => {
    if (settings) {
      form.reset({
        llm_model_name: settings.llm_model_name ?? "",
        llm_base_url: settings.llm_base_url ?? "",
        // CRITICAL: BYOK Write-After-Forgotten (S3.3). API Keys are NEVER pre-filled.
        llm_api_key: "",
        e2b_api_key: "",
      });
    }
  }, [settings, form]);

  async function onSubmit(values: EngineFormValues) {
    const payload: UserSettingsUpdate = { ...values };

    // BYOK Handling Logic for PATCH requests (API 2.2.2):
    // If an API key field is empty string, it means the user did not enter a new key.
    // We must remove it from the payload to prevent the backend from clearing the existing key.
    if (!payload.llm_api_key) {
      delete payload.llm_api_key;
    }
    if (!payload.e2b_api_key) {
      delete payload.e2b_api_key;
    }

    // Handle null/empty strings for non-key fields
    // Convert empty strings to null for the API if they were submitted empty.
    if (payload.llm_model_name === "") payload.llm_model_name = null;
    if (payload.llm_base_url === "") payload.llm_base_url = null;

    // Optimization: Don't send if payload is empty (handled by isDirty check on button, but defensive check here)
    if (Object.keys(payload).length === 0) {
      return;
    }

    await updateSettings(payload);

    // If update was successful, the form must be reset to clear the entered secrets from memory/state.
    // This reset is handled by the useEffect above when the 'settings' state updates.
  }

  // Function to explicitly clear a key (Required for BYOK compliance - API 2 Core Concepts)
  const handleClearKey = async (keyField: "llm_api_key" | "e2b_api_key") => {
    const payload: UserSettingsUpdate = {};
    payload[keyField] = "";
    await updateSettings(payload);
  };

  // The Wrapper ensures settings are loaded, but we handle it defensively.
  if (!settings) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security:</strong> Keys are encrypted server-side and never
            returned to the client. Entering a new key overwrites the existing
            one.
          </AlertDescription>
        </Alert>

        {/* --- LLM Configuration (S3.1) --- */}
        <h3 className="text-lg font-medium">
          <span className="flex items-center">
            <Brain className="mr-2 h-5 w-5" /> LLM Configuration
          </span>
        </h3>

        <FormField
          control={form.control}
          name="llm_model_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., gpt-4o (Leave empty for default)"
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
              <FormLabel>API Base URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., https://api.openai.com/v1 (Leave empty for default)"
                  {...field}
                  type="url"
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="llm_api_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LLM API Key</FormLabel>
              <div className="flex items-center gap-3">
                <FormControl>
                  {/* Use password type for secrets */}
                  <Input
                    type="password"
                    placeholder={
                      settings.has_llm_api_key
                        ? "Enter new key to update"
                        : "Enter API Key"
                    }
                    {...field}
                    value={field.value ?? ""}
                    autoComplete="new-password"
                  />
                </FormControl>
                {settings.has_llm_api_key && (
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={() => handleClearKey("llm_api_key")}
                    disabled={isUpdatingSettings}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <ApiKeyStatus isSet={settings.has_llm_api_key} />
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* --- Execution Sandbox Configuration (S3.2) --- */}
        <h3 className="pt-4 text-lg font-medium">
          <span className="flex items-center">
            <Terminal className="mr-2 h-5 w-5" /> Execution Sandbox (E2B)
          </span>
        </h3>

        <FormField
          control={form.control}
          name="e2b_api_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E2B API Key</FormLabel>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Input
                    type="password"
                    placeholder={
                      settings.has_e2b_api_key
                        ? "Enter new key to update"
                        : "Enter E2B API Key"
                    }
                    {...field}
                    value={field.value ?? ""}
                    autoComplete="new-password"
                  />
                </FormControl>
                {settings.has_e2b_api_key && (
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={() => handleClearKey("e2b_api_key")}
                    disabled={isUpdatingSettings}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <ApiKeyStatus isSet={settings.has_e2b_api_key} />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isUpdatingSettings || !form.formState.isDirty}>
          {isUpdatingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Engine Configuration
        </Button>
      </form>
    </Form>
  );
}
