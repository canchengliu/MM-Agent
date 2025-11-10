// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, HardDrive, Loader2, UploadCloud } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
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
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { type FileRole, type ProjectDetailRead } from "~/core/domain";
import { useUploadFile } from "~/features/dashboard/hooks/useProjects";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  file: z.instanceof(File, { message: "A file is required." }),
  role: z.enum(["Problem Description", "Dataset", "Reference Material"], {
    required_error: "You must select a file role.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function ProjectFilesCard({ project }: { project: ProjectDetailRead }) {
  const uploadFileMutation = useUploadFile();
  // OPTIMIZATION: State to manage the replacement warning for unique roles.
  const [isReplacingUniqueRole, setIsReplacingUniqueRole] = useState(false);

  // OPTIMIZATION: Memoize this calculation to avoid re-computing on every render.
  const hasProblemDescriptionFile = useMemo(
    () => project.files.some((f) => f.role === "Problem Description"),
    [project.files],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        form.setValue("file", acceptedFiles[0], { shouldValidate: true });
        form.clearErrors("file");
      }
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const onSubmit = async (data: FormValues) => {
    await uploadFileMutation.mutateAsync({
      projectId: project.id,
      file: data.file,
      role: data.role,
    });
    form.reset();
    setIsReplacingUniqueRole(false);
  };

  const selectedFile = form.watch("file");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Files</CardTitle>
        <CardDescription>
          Upload and manage your project&rsquo;s input files. Each file needs a
          role.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {project.files.length > 0 ? (
          <ul className="space-y-3">
            {project.files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{file.filename}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {file.role}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <HardDrive className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              No files uploaded yet.
            </p>
          </div>
        )}

        <div className="rounded-lg border bg-muted/30 p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              <div
                {...getRootProps()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition-colors",
                  isDragActive && "border-primary bg-primary/10",
                )}
              >
                <input {...getInputProps()} />
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">
                  {selectedFile
                    ? `Selected: ${selectedFile.name}`
                    : "Drag & drop a file here, or click to select"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Single file at a time.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      {/* OPTIMIZATION: Logic to guide user on replacing unique files. */}
                      <Select
                        onValueChange={(value: FileRole) => {
                          field.onChange(value);
                          if (
                            value === "Problem Description" &&
                            hasProblemDescriptionFile
                          ) {
                            setIsReplacingUniqueRole(true);
                          } else {
                            setIsReplacingUniqueRole(false);
                          }
                        }}
                        value={field.value}
                        // OPTIMIZATION: Removed redundant `required` prop. Zod handles validation.
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a file role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(
                            [
                              "Problem Description",
                              "Dataset",
                              "Reference Material",
                            ] as FileRole[]
                          ).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isReplacingUniqueRole ? (
                        <FormDescription className="text-amber-600 dark:text-amber-500">
                          A &lsquo;Problem Description&rsquo; file already
                          exists. Uploading will replace it.
                        </FormDescription>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={!selectedFile || uploadFileMutation.isPending}
                  className="w-full"
                >
                  {uploadFileMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="mr-2 h-4 w-4" />
                  )}
                  {/* OPTIMIZATION: Dynamically change button text for clarity. */}
                  {isReplacingUniqueRole ? "Replace & Upload" : "Upload File"}
                </Button>
              </div>
              {form.formState.errors.file?.message ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.file.message}
                </p>
              ) : null}
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
