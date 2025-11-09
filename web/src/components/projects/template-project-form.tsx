// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Loader2Icon, RocketIcon, ServerCrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { useCreateProjectFromTemplate, useProjectTemplates } from "~/core/api/hooks/useProjects";

const templateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "项目名称至少需要 3 个字符")
    .max(100, "项目名称不能超过 100 个字符"),
  description: z
    .string()
    .max(1000, "项目描述不能超过 1000 个字符")
    .nullable()
    .optional(),
  template_id: z.string().min(1, "请选择一个模板"),
});

type TemplateProjectFormValues = z.infer<typeof templateProjectSchema>;

interface TemplateProjectFormProps {
  onBack: () => void;
}

/**
 * Form for creating a project based on a template.
 */
export function TemplateProjectForm({ onBack }: TemplateProjectFormProps) {
  const router = useRouter();
  const { data: templates, isLoading, isError, refetch } = useProjectTemplates();
  const { mutate: createProject, isPending } = useCreateProjectFromTemplate();

  const form = useForm<TemplateProjectFormValues>({
    resolver: zodResolver(templateProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      template_id: "",
    },
    mode: "onBlur",
  });

  const selectedTemplateId = form.watch("template_id");

  React.useEffect(() => {
    if (!selectedTemplateId || !templates) {
      return;
    }
    const selectedTemplate = templates.find((template) => template.template_id === selectedTemplateId);
    if (!selectedTemplate) {
      return;
    }

    if (!form.getValues("name")) {
      form.setValue("name", `基于模板: ${selectedTemplate.name}`);
    }
    if (!form.getValues("description")) {
      form.setValue("description", selectedTemplate.description);
    }
  }, [selectedTemplateId, templates, form]);

  const onSubmit = (values: TemplateProjectFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      template_id: values.template_id,
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

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-12 text-center">
        <ServerCrashIcon className="mb-4 h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">加载模板失败</h3>
        <p className="mb-6 text-sm text-muted-foreground">无法获取可用的项目模板列表。</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack}>
            返回
          </Button>
          <Button variant="default" onClick={() => refetch()}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">配置模板项目</h2>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-20 w-full" />
        <div className="flex justify-between border-t pt-6">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-12 text-center">
        <h3 className="text-lg font-semibold">暂无可用模板</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          平台当前没有配置任何项目模板。请选择自定义项目创建方式。
        </p>
        <Button variant="outline" onClick={onBack}>
          返回上一步
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">配置模板项目</h2>

          <FormField
            control={form.control}
            name="template_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>选择模板</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择一个项目模板" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.template_id} value={template.template_id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplateId && (
                  <FormDescription>
                    {templates.find((template) => template.template_id === selectedTemplateId)?.description}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 border-t pt-4">
            <p className="text-sm text-muted-foreground">您可以修改基于模板创建的项目的名称和描述。</p>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>项目名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入项目名称" {...field} />
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
                      placeholder="输入项目描述..."
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
        </div>

        <div className="flex justify-between border-t pt-6">
          <Button variant="outline" type="button" onClick={onBack} disabled={isPending}>
            <ArrowLeftIcon className="mr-2 size-4" />
            上一步
          </Button>
          <Button type="submit" disabled={!form.formState.isValid || isPending} size="lg">
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
