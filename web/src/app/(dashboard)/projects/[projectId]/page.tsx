"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";

import { Button } from "~/components/ui/button";
import type { ProjectDetail } from "~/core/api/types";
import { useProjectsStore } from "~/core/store/ProjectsStore";

import { ConfigurationView } from "./components/configuration/ConfigurationView";
import { ExecutionView } from "./components/execution/ExecutionView";

interface ProjectWorkspacePageProps {
  params: { projectId: string };
}

export default function ProjectWorkspacePage({ params }: ProjectWorkspacePageProps) {
  const projectId = Number(params.projectId);
  const t = useTranslations("workspace.projectPage");

  const { activeProject, isLoadingActive, activeError } = useProjectsStore((state) => ({
    activeProject: state.activeProject,
    isLoadingActive: state.isLoadingActive,
    activeError: state.activeError,
  }));
  const loadActiveProject = useProjectsStore((state) => state.loadActiveProject);

  useEffect(() => {
    if (Number.isFinite(projectId)) {
      void loadActiveProject(projectId);
    }
  }, [projectId, loadActiveProject]);

  const project: ProjectDetail | null =
    activeProject && activeProject.id === projectId ? activeProject : null;

  if (!Number.isFinite(projectId)) {
    return (
      <PageMessage
        title={t("invalidId.title")}
        description={t("invalidId.description")}
        action={
          <Button asChild>
            <Link href="/projects">{t("actions.backToProjects")}</Link>
          </Button>
        }
      />
    );
  }

  if (isLoadingActive && !project) {
    return (
      <PageMessage
        title={t("loading.title")}
        description={t("loading.description")}
        icon={<Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />}
      />
    );
  }

  if (activeError && !project) {
    return (
      <PageMessage
        title={t("loadFailed.title")}
        description={activeError ?? t("loadFailed.description")}
        action={
          <Button variant="outline" onClick={() => loadActiveProject(projectId)}>
            {t("actions.retry")}
          </Button>
        }
      />
    );
  }

  if (!project) {
    return (
      <PageMessage
        title={t("notFound.title")}
        description={t("notFound.description")}
        action={
          <Button asChild>
            <Link href="/projects">{t("actions.backToProjects")}</Link>
          </Button>
        }
      />
    );
  }

  if (project.status === "Configuring") {
    return <ConfigurationView project={project} />;
  }

  return <ExecutionView project={project} />;
}

interface PageMessageProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

function PageMessage({ title, description, action, icon }: PageMessageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-sm text-muted-foreground">
      {icon}
      <div>
        <p className="text-lg font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 text-base text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
