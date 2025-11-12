"use client";

import { AlertCircle, Paperclip } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "~/components/ui/badge";
import type { ProjectFileRead, ProjectFileRole } from "~/core/api/types";

const ROLE_ORDER: ProjectFileRole[] = ["Problem Description", "Dataset", "Reference Material"];

const ROLE_METADATA: Record<
  ProjectFileRole,
  {
    descriptionKey: string;
    required?: boolean;
  }
> = {
  "Problem Description": {
    descriptionKey: "roles.problemDescription",
    required: true,
  },
  Dataset: {
    descriptionKey: "roles.dataset",
  },
  "Reference Material": {
    descriptionKey: "roles.reference",
  },
};

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return timestampFormatter.format(date);
}

export interface FileListProps {
  files: ProjectFileRead[];
}

export function FileList({ files }: FileListProps) {
  const t = useTranslations("workspace.files.list");
  const grouped = ROLE_ORDER.map((role) => ({
    role,
    files: files
      .filter((file) => file.role === role)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  }));

  return (
    <div className="space-y-4">
      {grouped.map(({ role, files }) => {
        const roleInfo = ROLE_METADATA[role];
        const isProblemDescription = role === "Problem Description";
        const hasConflict = isProblemDescription && files.length > 1;
        const hasFiles = files.length > 0;

        return (
          <div key={role} className="rounded-xl border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{role}</p>
                <p className="text-xs text-muted-foreground">{t(roleInfo.descriptionKey)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {roleInfo.required && (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                    {t("badges.required")}
                  </Badge>
                )}
                <Badge variant="outline" className="text-muted-foreground">
                  {t("badges.count", { count: files.length })}
                </Badge>
              </div>
            </div>

            {hasFiles ? (
              <ul className="mt-4 divide-y divide-border/60">
                {files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <div className="flex flex-1 items-center gap-3">
                      <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground" title={file.filename}>
                          {file.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("uploadedOn", { timestamp: formatTimestamp(file.created_at) })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{file.role}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">{t("emptyState")}</p>
            )}

            {roleInfo.required && !hasFiles && (
              <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
                <AlertCircle className="size-4" aria-hidden="true" />
                <span>{t("alerts.required")}</span>
              </div>
            )}

            {hasConflict && (
              <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="size-4" aria-hidden="true" />
                <span>{t("alerts.conflict")}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
