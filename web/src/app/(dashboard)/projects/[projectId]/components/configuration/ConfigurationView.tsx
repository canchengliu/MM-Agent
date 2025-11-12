"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle, Play, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { StatusBadge } from "~/components/platform";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { ProjectService } from "~/core/api/services/ProjectService";
import type {
  HistoricalProblemRead,
  ProjectDetail,
  ProjectProblemType,
} from "~/core/api/types";
import { useProjectsStore } from "~/core/store/ProjectsStore";

import { FileList } from "./FileList";
import { FileUploader } from "./FileUploader";

interface ConfigurationViewProps {
  project: ProjectDetail;
}

const PROBLEM_TYPES: readonly ProjectProblemType[] = ["-", "A", "B", "C", "D", "E", "F"];

type Translator = (key: string, values?: Record<string, unknown>) => string;

const buildMetadataSchema = (t: Translator) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, t("metadata.validation.nameMin"))
      .max(120, t("metadata.validation.nameMax")),
    description: z
      .string()
      .trim()
      .max(600, t("metadata.validation.descriptionMax"))
      .optional()
      .or(z.literal("")),
    problem_type: z.enum(PROBLEM_TYPES as [ProjectProblemType, ...ProjectProblemType[]]),
  });

type MetadataFormValues = z.infer<ReturnType<typeof buildMetadataSchema>>;

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateFormatter.format(date);
};

const mapProjectToValues = (project: ProjectDetail): MetadataFormValues => ({
  name: project.name,
  description: project.description ?? "",
  problem_type: project.problem_type,
});

export function ConfigurationView({ project }: ConfigurationViewProps) {
  const t = useTranslations("workspace.configuration");
  const updateProject = useProjectsStore((state) => state.updateProject);
  const initializeFromHistorical = useProjectsStore((state) => state.initializeFromHistorical);
  const startWorkflow = useProjectsStore((state) => state.startWorkflow);

  const [isStartingWorkflow, setIsStartingWorkflow] = useState(false);
  const [historicalProblems, setHistoricalProblems] = useState<HistoricalProblemRead[]>([]);
  const [historicalError, setHistoricalError] = useState<string | null>(null);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [isInitializingHistorical, setIsInitializingHistorical] = useState(false);
  const [historicalSelection, setHistoricalSelection] = useState(
    project.historical_problem_id ? String(project.historical_problem_id) : "",
  );
  const metadataSchema = useMemo(() => buildMetadataSchema(t), [t]);
  const getProblemTypeLabel = useCallback(
    (value: ProjectProblemType) =>
      value === "-"
        ? t("metadata.problemType.unassigned")
        : t("metadata.problemType.option", { type: value }),
    [t],
  );

  const metadataForm = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataSchema),
    defaultValues: mapProjectToValues(project),
  });

  useEffect(() => {
    metadataForm.reset(mapProjectToValues(project));
  }, [metadataForm, project]);

  useEffect(() => {
    setHistoricalSelection(project.historical_problem_id ? String(project.historical_problem_id) : "");
  }, [project.historical_problem_id]);

  const loadHistoricalProblems = useCallback(async () => {
    setIsLoadingHistorical(true);
    setHistoricalError(null);
    try {
      const problems = await ProjectService.getHistoricalProblems();
      const sorted = [...problems].sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }
        return a.name.localeCompare(b.name);
      });
      setHistoricalProblems(sorted);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("historical.error");
      setHistoricalError(message);
    } finally {
      setIsLoadingHistorical(false);
    }
  }, [t]);

  useEffect(() => {
    void loadHistoricalProblems();
  }, [loadHistoricalProblems]);

  const selectedHistorical = useMemo(
    () => historicalProblems.find((problem) => String(problem.id) === historicalSelection) ?? null,
    [historicalProblems, historicalSelection],
  );

  const problemDescriptionFiles = useMemo(
    () => project.files.filter((file) => file.role === "Problem Description"),
    [project.files],
  );
  const problemDescriptionCount = problemDescriptionFiles.length;
  const latestProblemDescription = useMemo(() => {
    if (!problemDescriptionFiles.length) {
      return null;
    }
    return [...problemDescriptionFiles].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
  }, [problemDescriptionFiles]);

  const workflowRequirements = useMemo(
    () =>
      [
        {
          key: "problem_type",
          label: t("start.requirements.problemType.label"),
          satisfied: project.problem_type !== "-",
          helper:
            project.problem_type === "-"
              ? t("start.requirements.problemType.helperMissing")
              : t("start.requirements.problemType.helperReady", {
                  type: getProblemTypeLabel(project.problem_type),
                }),
        },
        {
          key: "problem_description",
          label: t("start.requirements.problemDescription.label"),
          satisfied: problemDescriptionCount === 1,
          helper:
            problemDescriptionCount === 0
              ? t("start.requirements.problemDescription.helperMissing")
              : problemDescriptionCount > 1
                ? t("start.requirements.problemDescription.helperConflict")
                : latestProblemDescription
                  ? t("start.requirements.problemDescription.helperReady", {
                      filename: latestProblemDescription.filename,
                    })
                  : t("start.requirements.problemDescription.helperReady"),
        },
      ] as const,
    [getProblemTypeLabel, latestProblemDescription, problemDescriptionCount, project.problem_type, t],
  );

  const canStartWorkflow = workflowRequirements.every((requirement) => requirement.satisfied);

  const handleMetadataSubmit = async (values: MetadataFormValues) => {
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() ? values.description.trim() : null,
      problem_type: values.problem_type,
    } as const;

    try {
      await updateProject(project.id, payload);
      toast.success(t("toast.metadataSaved"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t("toast.metadataFailed");
      toast.error(message);
    }
  };

  const handleStartWorkflow = async () => {
    setIsStartingWorkflow(true);
    try {
      await startWorkflow(project.id);
      toast.success(t("toast.workflowStarted"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t("toast.workflowFailed");
      toast.error(message);
    } finally {
      setIsStartingWorkflow(false);
    }
  };

  const handleHistoricalInitialize = async () => {
    if (!historicalSelection) {
      return;
    }

    setIsInitializingHistorical(true);
    try {
      await initializeFromHistorical(project.id, {
        historical_problem_id: Number(historicalSelection),
      });
      toast.success(t("toast.historicalInitialized"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t("toast.historicalFailed");
      toast.error(message);
    } finally {
      setIsInitializingHistorical(false);
    }
  };

  const createdAt = formatDate(project.created_at);
  const updatedAt = formatDate(project.updated_at);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{project.name}</h1>
          <StatusBadge status={project.status} />
          <Badge variant="outline" className="text-muted-foreground">#{project.id}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{t("header.description")}</p>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>{t("header.createdAt", { date: createdAt })}</span>
          <span>{t("header.updatedAt", { date: updatedAt })}</span>
          <span>{t("header.problemType", { type: getProblemTypeLabel(project.problem_type) })}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.metadata.title")}</CardTitle>
              <CardDescription>{t("sections.metadata.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...metadataForm}>
                <form className="space-y-4" onSubmit={metadataForm.handleSubmit(handleMetadataSubmit)}>
                  <FormField
                    control={metadataForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("metadata.fields.name.label")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("metadata.fields.name.placeholder")}
                            {...field}
                            disabled={metadataForm.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={metadataForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("metadata.fields.description.label")}</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            {...field}
                            value={field.value ?? ""}
                            placeholder={t("metadata.fields.description.placeholder")}
                            disabled={metadataForm.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={metadataForm.control}
                    name="problem_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("metadata.fields.problemType.label")}</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange} disabled={metadataForm.formState.isSubmitting}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("metadata.fields.problemType.placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              {PROBLEM_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {getProblemTypeLabel(type)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                    <p className="text-xs text-muted-foreground">{t("metadata.helper")}</p>
                    <Button
                      type="submit"
                      disabled={
                        metadataForm.formState.isSubmitting ||
                        !metadataForm.formState.isDirty
                      }
                    >
                      {metadataForm.formState.isSubmitting ? t("metadata.actions.saving") : t("metadata.actions.save")}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("sections.files.title")}</CardTitle>
              <CardDescription>{t("sections.files.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploader projectId={project.id} files={project.files} />
              <FileList files={project.files} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.start.title")}</CardTitle>
              <CardDescription>{t("sections.start.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-3">
                {workflowRequirements.map((requirement) => (
                  <li key={requirement.key} className="flex items-start gap-3 rounded-lg border border-border/50 px-3 py-2">
                    {requirement.satisfied ? (
                      <CheckCircle2 className="mt-0.5 size-4 text-emerald-500" aria-hidden="true" />
                    ) : (
                      <Circle className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{requirement.label}</p>
                      <p className="text-xs text-muted-foreground">{requirement.helper}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full"
                disabled={!canStartWorkflow || isStartingWorkflow}
                onClick={handleStartWorkflow}
              >
                {isStartingWorkflow ? (
                  t("sections.start.actions.launching")
                ) : (
                  <>
                    <Play className="mr-2 size-4" aria-hidden="true" />
                    {t("sections.start.actions.launch")}
                  </>
                )}
              </Button>
              {!canStartWorkflow && (
                <p className="text-xs text-muted-foreground">{t("sections.start.helperDisabled")}</p>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex-col items-start gap-3">
              <div>
                <CardTitle>{t("sections.historical.title")}</CardTitle>
                <CardDescription>{t("sections.historical.description")}</CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => {
                  void loadHistoricalProblems();
                }}
                disabled={isLoadingHistorical}
              >
                <RefreshCcw className="mr-1 size-3.5" aria-hidden="true" />
                {isLoadingHistorical ? t("sections.historical.actions.refreshing") : t("sections.historical.actions.refresh")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("sections.historical.field.label")}</Label>
                <Select
                  value={historicalSelection || undefined}
                  onValueChange={setHistoricalSelection}
                  disabled={isLoadingHistorical || historicalProblems.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("sections.historical.field.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {historicalProblems.map((problem) => (
                      <SelectItem key={problem.id} value={String(problem.id)}>
                        {problem.year} · {problem.name} ({getProblemTypeLabel(problem.type)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {historicalError && <p className="text-xs text-destructive">{historicalError}</p>}
                {!historicalError && historicalProblems.length === 0 && !isLoadingHistorical && (
                  <p className="text-xs text-muted-foreground">{t("sections.historical.empty")}</p>
                )}
              </div>

              {selectedHistorical ? (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
                  <p className="font-semibold text-foreground">{selectedHistorical.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedHistorical.year} · {getProblemTypeLabel(selectedHistorical.type)}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 w-fit text-xs text-muted-foreground"
                  >
                    {selectedHistorical.has_dataset
                      ? t("sections.historical.badges.datasetIncluded")
                      : t("sections.historical.badges.datasetMissing")}
                  </Badge>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{t("sections.historical.placeholder")}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                type="button"
                variant="outline"
                disabled={!historicalSelection || isInitializingHistorical}
                onClick={handleHistoricalInitialize}
              >
                {isInitializingHistorical
                  ? t("sections.historical.actions.applying")
                  : t("sections.historical.actions.apply")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
