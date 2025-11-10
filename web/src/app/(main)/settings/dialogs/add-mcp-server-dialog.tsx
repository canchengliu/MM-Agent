"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import type { SimpleMCPServerMetadata } from "~/core/mcp";
import type { SettingsState } from "~/core/store";

const serverSchema = z
  .string()
  .min(1, "Cannot be empty")
  .refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Must be valid JSON")
  .refine((val) => {
    const data = JSON.parse(val) as SimpleMCPServerMetadata;
    return "name" in data && "transport" in data;
  }, "Must contain 'name' and 'transport'");

export function AddMCPServerDialog({
  settings,
  onChange,
}: {
  settings: SettingsState;
  onChange: (value: Partial<SettingsState>) => void;
}) {
  const t = useTranslations("settings.mcp");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  void settings;
  void onChange;

  const form = useForm<{ json: string }>({
    resolver: zodResolver(z.object({ json: serverSchema })),
    defaultValues: { json: "" },
  });

  const onSubmit = useCallback(
    async (values: { json: string }) => {
      console.log("Submitting MCP server:", values.json);
      setValidationError("MCP server validation is not yet implemented.");
    },
    [],
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        form.reset();
        setValidationError(null);
      }
      setOpen(isOpen);
    },
    [form],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus size={16} />
          {t("addServer")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addServerTitle")}</DialogTitle>
          <DialogDescription>{t("addServerDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="json"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("serverConfigJson")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={JSON.stringify(
                        {
                          name: "MyToolServer",
                          transport: "http",
                          url: "http://localhost:8001",
                        },
                        null,
                        2,
                      )}
                      className="h-48 font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t("jsonConfigHelp")}</FormDescription>
                  <FormMessage />
                  {validationError && (
                    <p className="text-sm font-medium text-destructive">
                      {validationError}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" className="w-24" disabled>
                {tCommon("add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
