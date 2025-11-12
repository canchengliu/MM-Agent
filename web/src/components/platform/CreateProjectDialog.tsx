"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { ProjectDetail, ProjectProblemType } from "~/core/api/types";
import { useProjectsStore } from "~/core/store/ProjectsStore";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

interface CreateProjectDialogProps {
  trigger?: React.ReactNode;
  onCreated?: (project: ProjectDetail) => void;
}

type Translator = (key: string, values?: Record<string, unknown>) => string;

const PROBLEM_TYPES = ["-", "A", "B", "C", "D", "E", "F"] as const satisfies Readonly<ProjectProblemType[]>;

type CreateProjectFormValues = z.infer<ReturnType<typeof buildFormSchema>>;

const DEFAULT_VALUES: CreateProjectFormValues = {
  name: "",
  description: "",
  problem_type: "-",
};

const buildFormSchema = (t: Translator) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, t("validation.name.min"))
      .max(120, t("validation.name.max")),
    description: z
      .string()
      .trim()
      .max(600, t("validation.description.max"))
      .optional()
      .or(z.literal("")),
    problem_type: z.enum(PROBLEM_TYPES),
  });

export function CreateProjectDialog({ trigger, onCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const createProject = useProjectsStore((state) => state.createProject);
  const t = useTranslations("projects.create");
  const schema = useMemo(() => buildFormSchema(t), [t]);

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
    }
  }, [form, open]);

  const handleSubmit = async (values: CreateProjectFormValues) => {
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() ? values.description.trim() : undefined,
      problem_type: values.problem_type === "-" ? undefined : values.problem_type,
    };

    try {
      const project = await createProject(payload);
      toast.success(t("toast.created", { name: project.name }));
      onCreated?.(project);
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("toast.createFailed");
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="lg">
            <PlusCircle className="size-4" />
            {t("actions.open")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.name.placeholder")}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.description.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={t("fields.description.placeholder")}
                      {...field}
                      value={field.value ?? ""}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="problem_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.problemType.label")}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("fields.problemType.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {PROBLEM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "-" ? t("fields.problemType.unassigned") : t("fields.problemType.option", { type })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setOpen(false)}
              >
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("actions.creating") : t("actions.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
