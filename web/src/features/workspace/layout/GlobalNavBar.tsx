"use client";

import { Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  useExportProject,
  useProjectDetail,
} from "~/features/dashboard/hooks/useProjects";

export function GlobalNavBar() {
  const pathname = usePathname();
  const params = useParams();

  const rawProjectId = params?.projectId;
  const parsedProjectId =
    typeof rawProjectId === "string"
      ? Number(rawProjectId)
      : Array.isArray(rawProjectId)
        ? Number(rawProjectId[0])
        : null;
  const projectId =
    parsedProjectId != null && Number.isFinite(parsedProjectId)
      ? parsedProjectId
      : null;
  const isProjectPage = pathname.startsWith("/projects/");

  const { data: project, isLoading: isLoadingProject } = useProjectDetail(
    isProjectPage ? projectId : null,
  );
  const { mutate: exportProject, isPending: isExporting } = useExportProject();

  const handleExport = () => {
    if (projectId != null) {
      exportProject(projectId);
    }
  };

  const canExport = Boolean(project) && project?.status !== "Configuring";

  return (
    <nav className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
        <Link
          href="/dashboard"
          className="uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        >
          Cognitive Cockpit
        </Link>
        {isProjectPage && (
          <>
            <span className="text-muted-foreground/50">/</span>
            {isLoadingProject ? (
              <Skeleton className="h-5 w-48" />
            ) : (
              project && (
                <span className="truncate font-normal" title={project.name}>
                  {project.name}
                </span>
              )
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        {isProjectPage && canExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export Project
          </Button>
        )}
        <span className="text-xs text-muted-foreground">Docs</span>
        <span className="text-xs text-muted-foreground">Status</span>
        <span className="text-xs text-muted-foreground">Account</span>
      </div>
    </nav>
  );
}
