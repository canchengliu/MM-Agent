// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { FolderOpenIcon, PackageIcon } from "lucide-react";
import * as React from "react";

import { cn } from "~/lib/utils";

interface ProjectTypeSelectorProps {
  onSelect: (mode: "custom" | "template") => void;
  initialSelection: "custom" | "template" | null;
}

/**
 * Step 1 of the wizard: Allows the user to choose between custom or template creation.
 */
export function ProjectTypeSelector({ onSelect, initialSelection }: ProjectTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-semibold">选择项目创建方式</h2>
        <p className="text-muted-foreground">您希望如何开始？</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TypeCard
          title="自定义项目"
          description="上传您自己的赛题描述和数据集，从零开始构建项目。"
          icon={FolderOpenIcon}
          onClick={() => onSelect("custom")}
          isSelected={initialSelection === "custom"}
        />
        <TypeCard
          title="从模板创建"
          description="使用平台预设的历年赛题模板快速启动项目。"
          icon={PackageIcon}
          onClick={() => onSelect("template")}
          isSelected={initialSelection === "template"}
        />
      </div>
    </div>
  );
}

interface TypeCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  isSelected: boolean;
}

function TypeCard({ title, description, icon: Icon, onClick, isSelected }: TypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-4 rounded-lg border-2 p-6 text-left shadow-sm transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-background hover:border-primary/70 hover:shadow-md",
      )}
    >
      <Icon className="size-10 text-primary" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
}
