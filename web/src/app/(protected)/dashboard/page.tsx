// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { ProjectsList } from "~/components/dashboard/projects-list";
import { Button } from "~/components/ui/button";

export default function DashboardPage() {
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">项目仪表盘</h1>
          <p className="text-muted-foreground">管理您的数学建模项目。</p>
        </div>
        <div>
          <Button asChild size="lg">
            <Link href="/project/new">
              <PlusIcon className="mr-2 size-5" />
              创建新项目
            </Link>
          </Button>
        </div>
      </div>

      <ProjectsList />
    </>
  );
}
