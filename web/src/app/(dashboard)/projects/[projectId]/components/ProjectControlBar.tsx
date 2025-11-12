"use client";

import { ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "~/components/platform";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { ProjectService } from "~/core/api/services/ProjectService";
import { useProjectsStore } from "~/core/store/ProjectsStore";

interface ProjectControlBarProps {
  projectId: number;
}

export function ProjectControlBar({ projectId }: ProjectControlBarProps) {
  const { project, isLoading } = useProjectsStore((state) => ({
    project: state.activeProject?.id === projectId ? state.activeProject : null,
    isLoading: state.isLoadingActive,
  }));
  const t = useTranslations("workspace.controlBar");
  const [isExporting, setIsExporting] = useState(false);

  const canExport = project?.status === "Completed";
  const buttonDisabled = !canExport || isExporting;
  const buttonTitle = canExport ? undefined : t("exportDisabled");

  const handleExport = async () => {
    if (!project || isExporting) {
      return;
    }

    setIsExporting(true);
    const exportPromise = ProjectService.exportProject(project.id);
    toast.promise(exportPromise, {
      loading: t("toast.loading"),
      success: t("toast.success"),
      error: (error) => (error instanceof Error ? error.message : t("toast.failure")),
    });

    try {
      await exportPromise;
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="border-b border-border/60 bg-card/95 px-6 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {t("workspaceLabel")}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <nav className="flex flex-wrap items-center gap-2 text-muted-foreground">
              <Link href="/projects" className="font-medium text-foreground hover:text-primary">
                {t("breadcrumbs.projects")}
              </Link>
              <ChevronRight className="size-4 text-muted-foreground/60" aria-hidden="true" />
              {project ? (
                <span className="text-base font-semibold text-foreground">{project.name}</span>
              ) : isLoading ? (
                <Skeleton className="h-6 w-40 rounded-md" />
              ) : (
                <span className="text-base font-semibold text-foreground">
                  {t("breadcrumbs.fallback", { id: projectId })}
                </span>
              )}
            </nav>
            {project?.status && <StatusBadge status={project.status} />}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={buttonDisabled}
            aria-disabled={buttonDisabled}
            aria-busy={isExporting}
            title={buttonTitle}
            onClick={handleExport}
          >
            <Download className="size-4" aria-hidden="true" />
            {isExporting ? t("actions.exporting") : t("actions.export")}
          </Button>
        </div>
      </div>
    </div>
  );
}
