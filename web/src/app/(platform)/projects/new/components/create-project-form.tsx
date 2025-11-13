"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

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
import { Textarea } from "~/components/ui/textarea";
import {
  ProjectCreateSchema,
  type ProjectCreate,
} from "~/core/models/project.model";
import { useStore } from "~/core/store";

export function CreateProjectForm() {
  const router = useRouter();
  const createProject = useStore((state) => state.createProject);
  const isMutatingProject = useStore((state) => state.isMutatingProject);

  const form = useForm<ProjectCreate>({
    resolver: zodResolver(ProjectCreateSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(data: ProjectCreate) {
    const result = await createProject(data);

    if (result.success && result.project) {
      router.push(`/projects/${result.project.id}/config`);
      return;
    }

    if (result.error === "PROJECT_NAME_EXISTS") {
      form.setError("name", {
        type: "manual",
        message:
          "A project with this name already exists. Please choose a different name.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 2024 MCM Problem A Analysis"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a unique, descriptive title for this modeling effort.
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the goals and context of this project..."
                  className="resize-none"
                  rows={5}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isMutatingProject}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isMutatingProject}>
            {isMutatingProject ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
