"use client";

import { Eye, EyeOff, KeyRound } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

interface ApiKeyInputProps {
  name: string;
  label: string;
  description: string;
  hasKey: boolean;
}

export function ApiKeyInput({
  name,
  label,
  description,
  hasKey,
}: ApiKeyInputProps) {
  const { control, setValue, formState } = useFormContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleClearAndReplace = () => {
    setValue(name, "", { shouldDirty: true });
    setIsEditing(true);
  };

  useEffect(() => {
    if (!formState.isDirty && isEditing) {
      setIsEditing(false);
    }
  }, [formState.isDirty, isEditing]);

  if (hasKey && !isEditing) {
    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <div className="flex items-center gap-4">
          <div className="flex h-9 flex-grow items-center rounded-md border border-input bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
            <KeyRound className="mr-2 h-4 w-4" />
            API Key is set.
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleClearAndReplace}
          >
            Clear & Replace
          </Button>
        </div>
        <FormDescription>{description}</FormDescription>
        <FormMessage />
      </FormItem>
    );
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Enter new key to set, or leave blank to clear"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowKey(!showKey)}
              aria-label={showKey ? "Hide API key" : "Show API key"}
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
