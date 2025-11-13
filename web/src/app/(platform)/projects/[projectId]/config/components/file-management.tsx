"use client";

import { AlertTriangle, UploadCloud } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useShallow } from "zustand/react/shallow";

import { Timestamp } from "~/components/platform/data-display/timestamp";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { FileRole } from "~/constants/enums";
import type { ProjectDetailRead } from "~/core/models/project.model";
import { useStore } from "~/core/store";
import { cn } from "~/lib/utils";

const FILE_ROLES: FileRole[] = [
  "Problem Description",
  "Dataset",
  "Reference Material",
];

type FileRoleDisplay = {
  label: string;
  description: string;
};

const ROLE_COPY: Record<FileRole, FileRoleDisplay> = {
  "Problem Description": {
    label: "Problem Description",
    description: "Primary contest prompt (must exist before starting workflow).",
  },
  Dataset: {
    label: "Dataset",
    description: "CSV, XLSX, or other structured data referenced downstream.",
  },
  "Reference Material": {
    label: "Reference Material",
    description: "Papers, notes, or supporting PDFs for the research team.",
  },
};

const ROLE_BADGE_VARIANT: Record<FileRole, "info" | "secondary" | "outline"> = {
  "Problem Description": "info",
  Dataset: "secondary",
  "Reference Material": "outline",
};

interface FileManagementProps {
  project: ProjectDetailRead;
}

export function FileManagement({ project }: FileManagementProps) {
  const { uploadFile } = useStore(
    useShallow((state) => ({
      uploadFile: state.uploadFile,
    })),
  );
  const [selectedRole, setSelectedRole] = useState<FileRole | "">("");
  const [roleError, setRoleError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const hasProblemDescription = project.files.some(
    (file) => file.role === "Problem Description",
  );
  const shouldWarnReplacement =
    selectedRole === "Problem Description" && hasProblemDescription;

  const sortedFiles = useMemo(
    () =>
      [...project.files].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [project.files],
  );

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!selectedRole) {
        setRoleError(true);
        return;
      }
      if (acceptedFiles.length === 0) return;

      setRoleError(false);
      setIsUploading(true);
      try {
        for (const file of acceptedFiles) {
          const success = await uploadFile(project.id, file, selectedRole);
          if (!success) break;
        }
      } finally {
        setIsUploading(false);
      }
    },
    [project.id, selectedRole, uploadFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      void handleDrop(acceptedFiles);
    },
    multiple: true,
    disabled: isUploading,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files & Evidence</CardTitle>
        <CardDescription>
          Upload contest statements, data, or references. Role assignment is
          required so downstream tasks can discover the correct inputs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasProblemDescription ? (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Problem Description missing</AlertTitle>
            <AlertDescription>
              Upload the official problem statement before starting the
              workflow. It is a prerequisite for API 3.3.1.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              File Role
            </label>
            <Select
              value={selectedRole || undefined}
              onValueChange={(value) => {
                setSelectedRole(value as FileRole);
                setRoleError(false);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role for incoming files" />
              </SelectTrigger>
              <SelectContent>
                {FILE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{ROLE_COPY[role].label}</span>
                      <span className="text-xs text-muted-foreground">
                        {ROLE_COPY[role].description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {roleError ? (
            <p className="text-sm text-destructive">
              Please choose a role before uploading files.
            </p>
          ) : null}
          {shouldWarnReplacement ? (
            <Alert variant="info">
              <AlertTitle>Replacement behavior</AlertTitle>
              <AlertDescription>
                Projects can only have one Problem Description at a time. A new
                upload will replace the previous file automatically (API 3.2.1).
              </AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-background px-6 py-12 text-center transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDragActive && "border-primary bg-primary/5",
            (roleError || !selectedRole) &&
              "cursor-not-allowed opacity-70 hover:border-muted-foreground/40",
            isUploading && "pointer-events-none opacity-60",
          )}
          aria-disabled={!selectedRole || isUploading}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drag and drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports multiple files per upload. Assigns them to the selected
            role.
          </p>
          {isUploading ? (
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              Uploading...
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Uploaded Files</h4>
            <span className="text-xs text-muted-foreground">
              {sortedFiles.length} total
            </span>
          </div>
          {sortedFiles.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No files uploaded yet. Add at least the problem statement to
              proceed.
            </div>
          ) : (
            <ul className="space-y-3">
              {sortedFiles.map((file) => (
                <li
                  key={file.id}
                  className="rounded-lg border bg-background/80 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">
                      {file.filename}
                    </p>
                    <Badge
                      variant={ROLE_BADGE_VARIANT[file.role]}
                      className="flex-shrink-0"
                    >
                      {file.role}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Added <Timestamp time={file.created_at} />
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
