"use client";

import { File, Loader2, UploadCloud, X } from "lucide-react";
import React, { useCallback, useState } from "react";

import { Button } from "~/components/ui/button";
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
import type { FileRole, ProjectDetailRead } from "~/core/domain/project.types";
import { useUploadFile } from "~/features/dashboard/hooks/useProjects";
import { cn } from "~/lib/utils";

interface FileManagerProps {
  project: ProjectDetailRead;
}

const FILE_ROLES: FileRole[] = [
  "Problem Description",
  "Dataset",
  "Reference Material",
];

export function FileManager({ project }: FileManagerProps) {
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(
    null,
  );
  const [selectedRole, setSelectedRole] = useState<FileRole | "">("");
  const [isDragOver, setIsDragOver] = useState(false);

  const { mutate: uploadFile, isPending: isUploading } = useUploadFile(
    project.id,
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]!);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFileSelect(event.dataTransfer.files);
  };

  const handleUpload = useCallback(() => {
    if (!selectedFile || !selectedRole) return;
    uploadFile(
      { file: selectedFile, role: selectedRole },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setSelectedRole("");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      },
    );
  }, [selectedFile, selectedRole, uploadFile]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Files</CardTitle>
        <CardDescription>
          Upload and manage the project input files. A Problem Description file
          is required to start the workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              isDragOver ? "border-primary bg-accent" : "border-border",
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Any document or data file
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => handleFileSelect(event.target.files)}
            />
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <File className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
            <div className="flex-grow">
              <label className="text-sm font-medium">File Role</label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as FileRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role for the file..." />
                </SelectTrigger>
                <SelectContent>
                  {FILE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedRole || isUploading}
              className="w-full sm:w-auto"
            >
              {isUploading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload File
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="mb-4 text-sm font-semibold">Uploaded Files</h4>
          {project.files.length > 0 ? (
            <ul className="space-y-3">
              {project.files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <File className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium">
                        {file.filename}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(file.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                    {file.role}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No files uploaded yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
