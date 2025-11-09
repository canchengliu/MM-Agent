// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Loader2Icon, RocketIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useCreateProjectCustom } from "~/core/api/hooks/useProjects";
import type { AssetRead } from "~/core/api/models/asset";
import { ArtifactType } from "~/core/api/models/enums";

import { FileUploader } from "./file-uploader";

const customProjectSchema = z.object({
  name: z
    .string()
    .min(3, "项目名称至少需要 3 个字符")
    .max(100, "项目名称不能超过 100 个字符"),
  description: z
    .string()
    .max(1000, "项目描述不能超过 1000 个字符")
    .nullable()
    .optional(),
});

type CustomProjectFormValues = z.infer<typeof customProjectSchema>;

interface CustomProjectFormProps {
  onBack: () => void;
}

/**
 * Form for creating a custom project, including file uploads.
 */
export function CustomProjectForm({ onBack }: CustomProjectFormProps) {
  const router = useRouter();
  const [problemStatementAsset, setProblemStatementAsset] = React.useState<AssetRead | null>(null);
  const [datasetAssets, setDatasetAssets] = React.useState<AssetRead[]>([]);

  const { mutate: createProject, isPending } = useCreateProjectCustom();

  const form = useForm<CustomProjectFormValues>({
    resolver: zodResolver(customProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (values: CustomProjectFormValues) => {
    if (!problemStatementAsset) {
      toast.error("请上传赛题描述文件。");
      return;
    }

    const payload = {
      name: values.name,
      description: values.description || undefined,
      problem_statement_asset_id: problemStatementAsset.id,
      dataset_asset_ids: datasetAssets.map((asset) => asset.id),
    };

    createProject(payload, {
      onSuccess: (newProject) => {
        router.push(`/project/${newProject.id}`);
        toast.info(`项目 "${newProject.name}" 已创建，工作流正在自动启动...`);
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "未知错误";
        toast.error(`创建项目失败: ${message}`);
      },
    });
  };

  const isReadyForSubmission = Boolean(problemStatementAsset) && form.formState.isValid;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">配置自定义项目</h2>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>项目名称</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：2025年 C 题 - 能源分配优化" {...field} />
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
                  <FormLabel>项目描述 (可选)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="简要描述项目的目标和背景..."
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6 border-t pt-4">
            <FileUploader
              label="赛题描述文件 (必需)"
              description="上传赛题的 PDF、Markdown 或文本文件。必须上传一个文件。"
              artifactType={ArtifactType.PROBLEM_STATEMENT}
              onUploadComplete={(assets) => setProblemStatementAsset(assets[0] ?? null)}
              options={{
                multiple: false,
                accept: {
                  "application/pdf": [".pdf"],
                  "text/markdown": [".md", ".markdown"],
                  "text/plain": [".txt"],
                },
              }}
            />

            <FileUploader
              label="数据集文件 (可选)"
              description="上传项目所需的数据集文件 (CSV, Excel)。可上传多个文件。"
              artifactType={ArtifactType.DATASET}
              onUploadComplete={setDatasetAssets}
              options={{
                multiple: true,
                accept: {
                  "text/csv": [".csv"],
                  "application/vnd.ms-excel": [".xls"],
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                },
              }}
            />
          </div>
        </div>

        <div className="flex justify-between border-t pt-6">
          <Button variant="outline" type="button" onClick={onBack} disabled={isPending}>
            <ArrowLeftIcon className="mr-2 size-4" />
            上一步
          </Button>
          <Button type="submit" disabled={!isReadyForSubmission || isPending} size="lg">
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                正在创建...
              </>
            ) : (
              <>
                创建并启动项目
                <RocketIcon className="ml-2 size-5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
