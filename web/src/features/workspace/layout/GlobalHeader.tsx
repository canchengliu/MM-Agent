"use client";

import { Download } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useAuth } from "~/core/auth/hooks";
import { UserNav } from "~/features/authentication/components/UserNav";
import {
  useExportProject,
  useProjectDetail,
} from "~/features/dashboard/hooks/useProjects";
import { Link } from "~/navigation";

type WorkspaceRouteParams = { projectId?: string | string[] };

export function GlobalHeader() {
  const t = useTranslations("layout");
  const params = useParams<WorkspaceRouteParams>();
  const { user } = useAuth();

  const projectIdParam = Array.isArray(params?.projectId)
    ? params.projectId[0]
    : params?.projectId;
  const projectId = projectIdParam
    ? Number.parseInt(projectIdParam, 10)
    : null;
  const isValidProjectId =
    typeof projectId === "number" && Number.isFinite(projectId);

  const { data: project, isLoading: isProjectLoading } = useProjectDetail(
    isValidProjectId ? projectId : null,
    {
      enabled: isValidProjectId,
    },
  );

  const exportMutation = useExportProject();

  const handleExport = () => {
    if (!project) return;
    exportMutation.mutate({
      projectId: project.id,
      projectName: project.name,
    });
  };

  return (
    <header className="flex h-12 w-full shrink-0 items-center border-b bg-background px-4">
      <div className="flex flex-1 items-center gap-4 overflow-hidden">
        <Link href="/dashboard" className="font-semibold text-foreground">
          {t("appTitle")}
        </Link>
        {isValidProjectId && (
          <>
            <span className="text-muted-foreground">/</span>
            {isProjectLoading ? (
              <Skeleton className="h-5 w-48" />
            ) : project ? (
              <span className="truncate font-medium text-foreground">
                {project.name}
              </span>
            ) : null}
          </>
        )}
      </div>

      <div className="ml-4 flex items-center gap-4">
        {project && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={
              project.status === "Configuring" || exportMutation.isPending
            }
            title={
              project.status === "Configuring"
                ? t("exportUnavailableHint")
                : t("exportAvailableHint")
            }
          >
            <Download className="mr-2 h-4 w-4" />
            {t("exportButton")}
          </Button>
        )}

        {user && <UserNav user={user} />}
      </div>
    </header>
  );
}
