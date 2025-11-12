"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CreateProjectDialog, ProjectTable } from "~/components/platform";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { ProjectProblemType, ProjectStatus, ProjectSummaryRead } from "~/core/api/types";
import { useProjectsStore } from "~/core/store/ProjectsStore";

type FilterStatus = ProjectStatus | "all";
type FilterProblemType = ProjectProblemType | "all";

const STATUS_OPTIONS: FilterStatus[] = ["all", "Configuring", "Running", "Completed"];
const STATUS_LABEL_MAP: Record<Exclude<FilterStatus, "all">, string> = {
  Configuring: "project.configuring",
  Running: "project.running",
  Completed: "project.completed",
};
const TYPE_OPTIONS: FilterProblemType[] = ["all", "A", "B", "C", "D", "E", "F", "-"];

interface ProjectsDashboardProps {
  initialNow: number;
}

export function ProjectsDashboard({ initialNow }: ProjectsDashboardProps) {
  const router = useRouter();
  const t = useTranslations("projects.dashboard");
  const statusT = useTranslations("status");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [typeFilter, setTypeFilter] = useState<FilterProblemType>("all");
  const [projectPendingDelete, setProjectPendingDelete] = useState<ProjectSummaryRead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [referenceTime] = useState(initialNow);

  const { projects, fetchProjects, deleteProject, isLoadingList, listError } = useProjectsStore((state) => ({
    projects: state.projects,
    fetchProjects: state.fetchProjects,
    deleteProject: state.deleteProject,
    isLoadingList: state.isLoadingList,
    listError: state.listError,
  }));

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    return projects.filter((project) => {
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== "all" && project.problem_type !== typeFilter) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      return project.name.toLowerCase().includes(normalizedQuery);
    });
  }, [projects, search, statusFilter, typeFilter]);

  const handleProjectNavigate = (project: ProjectSummaryRead) => {
    router.push(`/projects/${project.id}`);
  };

  const handleDeleteProject = async () => {
    const targetProject = projectPendingDelete;
    if (!targetProject) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject(targetProject.id);
      toast.success(t("toast.deleted", { name: targetProject.name }));
      setProjectPendingDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("toast.deleteFailed");
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
  };
  const getStatusOptionLabel = (option: FilterStatus) =>
    option === "all" ? t("filters.status.all") : statusT(STATUS_LABEL_MAP[option]);

  const emptyState =
    search || statusFilter !== "all" || typeFilter !== "all" ? (
      <div className="flex flex-col items-center gap-2 px-8 py-16 text-center text-sm text-muted-foreground">
        <p>{t("emptyFiltered.title")}</p>
        <p className="text-xs text-muted-foreground/70">{t("emptyFiltered.subtitle")}</p>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          {t("actions.clearFilters")}
        </Button>
      </div>
    ) : (
      undefined
    );

  return (
    <div className="mx-auto w-full max-w-7xl p-6 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t("subtitle")}</p>
        </div>
        <CreateProjectDialog
          onCreated={(project) => {
            handleProjectNavigate(project);
          }}
          trigger={
            <Button size="lg" className="min-w-40">
              {t("actions.newProjectButton")}
            </Button>
          }
        />
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder={t("searchPlaceholder")}
          className="w-full md:max-w-md"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("filters.status.placeholder")} />
            </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {getStatusOptionLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as FilterProblemType)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("filters.type.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "all"
                    ? t("filters.type.all")
                    : option === "-"
                      ? t("filters.type.unassigned")
                      : t("filters.type.option", { type: option })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {listError && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex items-center justify-between gap-4">
            <span>{listError}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoadingList}
              onClick={() => {
                void fetchProjects();
              }}
            >
              {t("actions.retry")}
            </Button>
          </div>
        </div>
      )}

      <ProjectTable
        projects={filteredProjects}
        isLoading={isLoadingList}
        emptyState={emptyState}
        onProjectClick={handleProjectNavigate}
        onEdit={handleProjectNavigate}
        referenceTime={referenceTime}
        onRequestDelete={(project) => {
          setProjectPendingDelete(project);
        }}
      />

      <AlertDialog
        open={projectPendingDelete !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) {
            setProjectPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deleteDescription", {
                name: projectPendingDelete?.name ?? t("dialog.unknownProject"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline" disabled={isDeleting}>
                {t("dialog.cancel")}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                variant="destructive"
                onClick={(event) => {
                  event.preventDefault();
                  void handleDeleteProject();
                }}
                disabled={isDeleting}
              >
                {isDeleting ? t("dialog.deleting") : t("dialog.confirm")}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
