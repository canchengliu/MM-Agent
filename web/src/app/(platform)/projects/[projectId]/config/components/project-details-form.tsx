"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { Textarea } from "~/components/ui/textarea";
import type {
  ProjectDetailRead,
  ProjectUpdate,
} from "~/core/models/project.model";
import { ProjectUpdateSchema } from "~/core/models/project.model";
import { useStore } from "~/core/store";

const ProjectDetailsSchema = z.object({
  name: ProjectUpdateSchema.shape.name.unwrap(),
  description: ProjectUpdateSchema.shape.description.unwrap().optional(),
});

type ProjectDetailsFormValues = z.infer<typeof ProjectDetailsSchema>;

interface ProjectDetailsFormProps {
  project: ProjectDetailRead;
}

export function ProjectDetailsForm({ project }: ProjectDetailsFormProps) {
  const { updateProject, isMutatingProject } = useStore(
    useShallow((state) => ({
      updateProject: state.updateProject,
      isMutatingProject: state.isMutatingProject,
    })),
  );

  const form = useForm<ProjectDetailsFormValues>({
    resolver: zodResolver(ProjectDetailsSchema),
    mode: "onBlur",
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: project.name,
      description: project.description ?? "",
    });
  }, [form, project.description, project.id, project.name]);

  const handleSubmit = async (values: ProjectDetailsFormValues) => {
    const payload: ProjectUpdate = {};
    const trimmedName = values.name.trim();
    const trimmedDescription = values.description?.trim() ?? "";
    const currentDescription = project.description ?? "";

    if (trimmedName !== project.name) {
      payload.name = trimmedName;
    }

    if (trimmedDescription !== currentDescription) {
      payload.description = trimmedDescription;
    }

    if (Object.keys(payload).length === 0) {
      form.reset(
        {
          name: project.name,
          description: project.description ?? "",
        },
        { keepDirty: false },
      );
      return;
    }

    await updateProject(project.id, payload);
  };

  const isSubmitDisabled = isMutatingProject || !form.formState.isDirty;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
        <CardDescription>
          Update the core metadata for this project. Changes are validated
          against API 3.1.4 and saved immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 2024 MCM Problem A Analysis"
                    />
                  </FormControl>
                  <FormDescription>
                    Use a descriptive name. This value is shown in dashboards
                    and workflow breadcrumbs.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      className="min-h-[120px] resize-none"
                      placeholder="Summarize the modeling goals, datasets, or constraints for collaborators."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="flex items-center justify-end gap-3 p-0">
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                aria-disabled={isSubmitDisabled}
              >
                {isMutatingProject ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
