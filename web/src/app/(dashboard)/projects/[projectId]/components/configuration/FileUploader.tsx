"use client";

import { AlertCircle, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { ProjectFileRead, ProjectFileRole } from "~/core/api/types";
import { useProjectsStore } from "~/core/store/ProjectsStore";

const ROLE_OPTIONS: Array<{
  value: ProjectFileRole;
  labelKey: string;
  descriptionKey: string;
}> = [
  {
    value: "Problem Description",
    labelKey: "roles.problemDescription.label",
    descriptionKey: "roles.problemDescription.description",
  },
  {
    value: "Dataset",
    labelKey: "roles.dataset.label",
    descriptionKey: "roles.dataset.description",
  },
  {
    value: "Reference Material",
    labelKey: "roles.reference.label",
    descriptionKey: "roles.reference.description",
  },
];

const UNIQUE_ROLES: ProjectFileRole[] = ["Problem Description"];

export interface FileUploaderProps {
  projectId: number;
  files: ProjectFileRead[];
}

export function FileUploader({ projectId, files }: FileUploaderProps) {
  const uploadFile = useProjectsStore((state) => state.uploadFile);
  const [selectedRole, setSelectedRole] = useState<ProjectFileRole>("Problem Description");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("workspace.files.uploader");

  const uniqueRoleOccupied = UNIQUE_ROLES.includes(selectedRole) && files.some((file) => file.role === selectedRole);
  const selectedRoleMeta = ROLE_OPTIONS.find((option) => option.value === selectedRole);
  const selectedRoleLabel = selectedRoleMeta ? t(selectedRoleMeta.labelKey) : selectedRole;
  const selectedRoleDescription = selectedRoleMeta ? t(selectedRoleMeta.descriptionKey) : null;

  const handleUpload = async () => {
    if (!pendingFile) {
      return;
    }

    setIsUploading(true);
    try {
      await uploadFile(projectId, { file: pendingFile, role: selectedRole });
      toast.success(t("toast.success", { name: pendingFile.name, role: selectedRoleLabel }));
      setPendingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("toast.failure");
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-dashed border-border/60 bg-muted/30 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("fields.role.label")}</Label>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as ProjectFileRole)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("fields.role.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedRoleDescription && <p className="text-xs text-muted-foreground">{selectedRoleDescription}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-file">{t("fields.file.label")}</Label>
          <Input
            ref={fileInputRef}
            id="project-file"
            type="file"
            onChange={(event) => setPendingFile(event.target.files?.[0] ?? null)}
            disabled={isUploading}
          />
          {pendingFile ? (
            <p className="text-xs text-muted-foreground">
              {t("fields.file.selected", { name: pendingFile.name })}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{t("fields.file.hint")}</p>
          )}
        </div>
      </div>

      {uniqueRoleOccupied && (
        <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
          <AlertCircle className="size-4" aria-hidden="true" />
          <span>{t("warnings.roleConflict", { role: selectedRoleLabel })}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{t("hints.formats")}</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!pendingFile || isUploading}
            onClick={() => {
              setPendingFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            {t("actions.clear")}
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!pendingFile || isUploading}>
            {isUploading ? (
              t("actions.uploading")
            ) : (
              <>
                <Upload className="mr-2 size-4" aria-hidden="true" />
                {t("actions.upload")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
