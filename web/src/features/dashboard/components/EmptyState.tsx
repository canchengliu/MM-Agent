// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { PlusIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

import { CreateProjectDialog } from "./CreateProjectDialog";

export function EmptyState() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-10 text-center">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Project Dashboard
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Start your first modeling project
          </h2>
          <p className="text-base text-muted-foreground">
            Create a project to configure data sources, manage workflows, and
            collaborate with your team in one place.
          </p>
        </div>
        <CreateProjectDialog
          trigger={
            <Button size="lg">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Project
            </Button>
          }
        />
      </div>
    </section>
  );
}
