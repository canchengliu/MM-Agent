// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { FolderPlusIcon, RocketIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";

export function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 border-2 border-dashed rounded-lg bg-background shadow-sm mt-8">
      <RocketIcon className="size-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold">欢迎使用时空知识工作站</h3>
      <p className="text-muted-foreground mb-6 mt-1">您还没有任何项目。</p>
      <Button asChild size="lg">
        <Link href="/project/new">
          <FolderPlusIcon className="mr-2 size-5" />
          创建您的第一个项目
        </Link>
      </Button>
    </div>
  );
}

