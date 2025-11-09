// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { CreateProjectWizard } from "~/components/projects/create-project-wizard";
import { Button } from "~/components/ui/button";

/**
 * The main page for creating a new project, hosting the creation wizard.
 */
export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-4xl py-12">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeftIcon className="mr-2 size-4" />
            返回仪表盘
          </Link>
        </Button>
      </div>
      <div className="mb-8 flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">创建新项目</h1>
        <p className="text-muted-foreground">选择项目类型并配置详细信息以开始新的建模任务。</p>
      </div>
      <CreateProjectWizard />
    </div>
  );
}
