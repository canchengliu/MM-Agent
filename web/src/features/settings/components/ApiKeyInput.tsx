import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { UserSettingsUpdate } from "~/core/domain";

type ApiKeyField = "llm_api_key" | "e2b_api_key";

interface ApiKeyInputProps {
  fieldName: ApiKeyField;
  label: string;
  hasKey: boolean;
  placeholder: string;
  statusText: string;
  clearButtonText: string;
}

export function ApiKeyInput({
  fieldName,
  label,
  hasKey,
  placeholder,
  statusText,
  clearButtonText,
}: ApiKeyInputProps) {
  const { control, setValue, formState } =
    useFormContext<UserSettingsUpdate>();
  const [showPassword, setShowPassword] = React.useState(false);

  const isDirty = Boolean(formState.dirtyFields[fieldName]);
  const isEditing = !hasKey || isDirty;

  const handleClearAndReplace = () => {
    setValue(fieldName, "", { shouldDirty: true, shouldTouch: true });
  };

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {isEditing ? (
            <div className="relative">
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type={showPassword ? "text" : "password"}
                  placeholder={placeholder}
                  autoComplete="new-password"
                />
              </FormControl>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide key" : "Show key"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          ) : (
            <div className="flex h-9 items-center justify-between rounded-md border border-input bg-muted/50 px-3 text-sm">
              <p className="text-muted-foreground">{statusText}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClearAndReplace}
              >
                {clearButtonText}
              </Button>
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
