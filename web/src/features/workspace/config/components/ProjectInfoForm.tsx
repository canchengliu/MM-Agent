"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type {
  ProjectDetailRead,
  ProjectUpdate,
} from "~/core/domain/project.types";
import { useUpdateProject } from "~/features/dashboard/hooks/useProjects";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Project name is required." })
    .max(100, { message: "Project name cannot exceed 100 characters." }),
  description: z
    .string()
    .max(500, { message: "Description cannot exceed 500 characters." })
    .optional()
    .or(z.literal("")),
  problem_type: z.enum(["A", "B", "C", "D", "E", "F", "-"]),
});

type ProjectFormValues = z.infer<typeof formSchema>;

const PROBLEM_TYPES: ProjectFormValues["problem_type"][] = [
  "-",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

interface ProjectInfoFormProps {
  project: ProjectDetailRead;
}

export function ProjectInfoForm({ project }: ProjectInfoFormProps) {
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      problem_type: project.problem_type,
    },
  });

  useEffect(() => {
    form.reset({
      name: project.name,
      description: project.description ?? "",
      problem_type: project.problem_type,
    });
  }, [project, form]);

  const onSubmit = (values: ProjectFormValues) => {
    const dirtyFields = form.formState.dirtyFields;
    if (Object.keys(dirtyFields).length === 0) {
      return;
    }

    const payload: ProjectUpdate = {};
    for (const key in dirtyFields) {
      if (Object.prototype.hasOwnProperty.call(dirtyFields, key)) {
        const formKey = key as keyof ProjectFormValues;
        (payload as Record<string, unknown>)[formKey] =
          values[formKey] === "" ? null : values[formKey];
      }
    }

    updateProject(
      { projectId: project.id, data: payload },
      {
        onSuccess: (updatedProject) => {
          form.reset(
            {
              ...updatedProject,
              description: updatedProject.description ?? "",
            },
            { keepIsDirty: false },
          );
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
        <CardDescription>
          Update the project name, description, and problem type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px]"
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
              name="problem_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={project.status !== "Configuring"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a problem type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROBLEM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "-" ? "Not Set" : `Problem ${type}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This is required to start the workflow and cannot be changed
                    later.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isUpdating || !form.formState.isDirty}
              >
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
