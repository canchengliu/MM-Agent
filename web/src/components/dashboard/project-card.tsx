// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { MoreVerticalIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { ProjectRead } from "~/core/api/models/project";

import { DeleteProjectDialog } from "./delete-project-dialog";
import { ProjectStatusBadge } from "./project-status-badge";

interface ProjectCardProps {
  project: ProjectRead;
}

const formatTimeAgo = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "刚刚";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} 天前`;

    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Invalid date format:", isoString);
    return "未知时间";
  }
};

export function ProjectCard({ project }: ProjectCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const timeAgo = formatTimeAgo(project.updated_at);

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-200 hover:shadow-lg relative group">
        <Link
          href={`/project/${project.id}`}
          className="absolute inset-0 z-0"
          aria-label={`打开项目: ${project.name}`}
        >
          <span className="sr-only">{`打开项目: ${project.name}`}</span>
        </Link>

        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-4">
            <CardTitle
              className="text-lg line-clamp-2 flex-1 pr-8 group-hover:text-primary transition-colors"
              title={project.name}
            >
              {project.name}
            </CardTitle>

            <div className="absolute top-4 right-4 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                    aria-label="项目操作"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  >
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onSelect={(event) => {
                      event.preventDefault();
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <TrashIcon className="mr-2 size-4" />
                    删除项目
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4 pt-0 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {project.description ? (
              project.description
            ) : (
              <span className="italic opacity-70">暂无描述。</span>
            )}
          </p>
        </CardContent>

        <CardFooter className="flex justify-between items-center border-t pt-4 mt-auto">
          <ProjectStatusBadge status={project.status} />
          <span
            className="text-xs text-muted-foreground"
            title={new Date(project.updated_at).toLocaleString("zh-CN")}
          >
            {timeAgo}
          </span>
        </CardFooter>
      </Card>

      <DeleteProjectDialog
        project={project}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}

