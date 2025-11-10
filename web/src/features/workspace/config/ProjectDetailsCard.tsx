// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

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
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
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
import { type ProjectDetailRead, type ProjectProblemType } from "~/core/domain";
import { useUpdateProject } from "~/features/dashboard/hooks/useProjects";

const formSchema = z.object({
  name: z.string().min(1, "Project name cannot be empty."),
  // OPTIMIZATION: Switched to nullable() to better match the API spec (string | null).
  description: z.string().nullable().optional(),
  problem_type: z.enum(["A", "B", "C", "D", "E", "F", "-"]),
});

type FormValues = z.infer<typeof formSchema>;

export function ProjectDetailsCard({ project }: { project: ProjectDetailRead }) {
  const updateProjectMutation = useUpdateProject();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      problem_type: project.problem_type,
    },
  });

  // OPTIMIZATION: This effect syncs the form's default state with the latest server data.
  // This is crucial for resetting the `isDirty` flag after a successful update and re-fetch,
  // preventing the "Save Changes" button from being stuck enabled.
  useEffect(() => {
    form.reset({
      name: project.name,
      description: project.description ?? "",
      problem_type: project.problem_type,
    });
  }, [project, form]);

  const onSubmit = (data: FormValues) => {
    // OPTIMIZATION: Ensure empty description is sent as `null`, not `""`.
    const normalizedDescription =
      data.description === "" ? null : data.description ?? null;
    const payload = {
      ...data,
      description: normalizedDescription,
    };
    updateProjectMutation.mutate({ projectId: project.id, payload });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Update your project&rsquo;s name, description, and problem type.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
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
              name="problem_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a problem type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(["-", "A", "B", "C", "D", "E", "F"] as ProjectProblemType[]).map(
                        (type) => (
                          <SelectItem key={type} value={type}>
                            {type === "-" ? "Not Set" : `Problem ${type}`}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* BUG FIX: Changed `name` from "name" to "description" */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of your project goals."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t">
            <Button
              type="submit"
              disabled={
                !form.formState.isDirty || updateProjectMutation.isPending
              }
            >
              {updateProjectMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
