// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { FileIcon, Loader2Icon, Trash2Icon, UploadCloudIcon, XIcon } from "lucide-react";
import * as React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useUploadAsset } from "~/core/api/hooks/useAssets";
import type { AssetRead } from "~/core/api/models/asset";
import type { ArtifactType } from "~/core/api/models/enums";
import { cn, formatFileSize } from "~/lib/utils";

interface UploadedFile {
  file: File;
  asset: AssetRead;
}

interface UploadingFile {
  file: File;
  progress: number;
  isUploading: boolean;
  error?: string;
  abortController?: AbortController;
}

interface FileUploaderProps {
  artifactType: ArtifactType;
  onUploadComplete: (assets: AssetRead[]) => void;
  initialAssets?: AssetRead[];
  options?: DropzoneOptions;
  className?: string;
  label: string;
  description: string;
}

/**
 * A reusable file uploader component integrated with the Asset API (6.1).
 * Handles uploading files as standalone assets before project creation.
 */
export function FileUploader({
  artifactType,
  onUploadComplete,
  initialAssets = [],
  options,
  className,
  label,
  description,
}: FileUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = React.useState<UploadingFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>(
    initialAssets.map((asset) => ({
      file: new File([], asset.name, { type: asset.mime_type }),
      asset,
    })),
  );

  const { mutateAsync: uploadAsset } = useUploadAsset();

  const handleUpload = React.useCallback(
    async (file: File) => {
      const abortController = new AbortController();
      const newUploadingFile: UploadingFile = {
        file,
        progress: 0,
        isUploading: true,
        abortController,
      };

      setUploadingFiles((prev) => [...prev, newUploadingFile]);

      const progressInterval = window.setInterval(() => {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file && f.isUploading
              ? { ...f, progress: Math.min(f.progress + Math.random() * 10, 95) }
              : f,
          ),
        );
      }, 300);

      try {
        const asset = await uploadAsset({
          file,
          type: artifactType,
          signal: abortController.signal,
        });

        window.clearInterval(progressInterval);

        setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
        setUploadedFiles((prev) => [...prev, { file, asset }]);
      } catch (error: unknown) {
        window.clearInterval(progressInterval);
        console.error("Upload failed:", error);

        if (
          (error instanceof DOMException && error.name === "AbortError") ||
          (error instanceof Error &&
            (error.name === "AbortError" ||
              error.message.toLowerCase().includes("abort")))
        ) {
          toast.info(`Upload cancelled for ${file.name}.`);
          setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
          return;
        }

        const message =
          error instanceof Error ? error.message : "Upload failed. Please try again.";
        toast.error(`Failed to upload ${file.name}. ${message}`);

        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, isUploading: false, error: message, progress: 100 } : f,
          ),
        );
      }
    },
    [artifactType, uploadAsset],
  );

  React.useEffect(() => {
    onUploadComplete(uploadedFiles.map((f) => f.asset));
  }, [uploadedFiles, onUploadComplete]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const filesToUpload = acceptedFiles.filter(
        (file) =>
          !uploadingFiles.some((f) => f.file.name === file.name && f.file.size === file.size) &&
          !uploadedFiles.some((f) => f.asset.name === file.name && f.asset.file_size === file.size),
      );

      if (!options?.multiple && (uploadedFiles.length > 0 || uploadingFiles.length > 0)) {
        toast.warning("只允许上传一个文件。请先移除现有文件。");
        return;
      }

      if (!options?.multiple && filesToUpload.length > 1) {
        toast.warning("一次只能上传一个文件。");
        const firstFile = filesToUpload[0];
        if (firstFile) {
          handleUpload(firstFile);
        }
        return;
      }

      filesToUpload.forEach(handleUpload);
    },
    [handleUpload, uploadingFiles, uploadedFiles, options?.multiple],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    ...options,
  });

  const removeFile = (fileName: string, fileSize: number, isUploaded: boolean) => {
    if (isUploaded) {
      setUploadedFiles((prev) =>
        prev.filter((f) => !(f.asset.name === fileName && f.asset.file_size === fileSize)),
      );
    } else {
      setUploadingFiles((prev) => {
        const fileToCancel = prev.find(
          (f) => f.file.name === fileName && f.file.size === fileSize,
        );

        if (!fileToCancel) {
          return prev;
        }

        if (fileToCancel.isUploading && fileToCancel.abortController) {
          fileToCancel.abortController.abort();
          return prev;
        }

        return prev.filter((f) => f !== fileToCancel);
      });
    }
  };

  const allFiles = [
    ...uploadedFiles.map((f) => ({ ...f, type: "uploaded" as const })),
    ...uploadingFiles.map((f) => ({ ...f, type: "uploading" as const })),
  ];

  return (
    <div className={cn("grid gap-4", className)}>
      <div>
        <h3 className="text-base font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors",
          "cursor-pointer",
          isDragActive ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/50",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloudIcon className="size-10 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm font-medium text-primary">将文件拖放到此处...</p>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            拖放文件到此处，或点击选择文件
            <br />
            <span className="text-xs">
              {options?.accept ? Object.values(options.accept).flat().join(", ") : "支持所有文件类型"}
            </span>
          </p>
        )}
      </div>

      {allFiles.length > 0 && (
        <div className="grid gap-2">
          <h4 className="text-sm font-medium">文件列表 ({allFiles.length})</h4>
          <div className="flex flex-col gap-3">
            {allFiles.map((item, index) => {
              const key = `${item.type}-${item.file.name}-${item.file.size}-${index}`;

              if (item.type === "uploaded") {
                return (
                  <FileCard
                    key={key}
                    fileName={item.asset.name}
                    fileSize={item.asset.file_size}
                    onRemove={() => removeFile(item.asset.name, item.asset.file_size, true)}
                  />
                );
              }

              if (item.type === "uploading") {
                return (
                  <FileProgressCard
                    key={key}
                    fileName={item.file.name}
                    fileSize={item.file.size}
                    progress={item.progress}
                    isUploading={item.isUploading}
                    error={item.error}
                    onRemove={() => removeFile(item.file.name, item.file.size, false)}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface FileCardProps {
  fileName: string;
  fileSize: number;
  onRemove: () => void;
}

function FileCard({ fileName, fileSize, onRemove }: FileCardProps) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-background p-3 shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <FileIcon className="size-5 shrink-0 text-muted-foreground" />
        <div className="overflow-hidden">
          <p className="truncate text-sm font-medium">{fileName}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={onRemove}>
        <Trash2Icon className="size-4 text-destructive" />
      </Button>
    </div>
  );
}

interface FileProgressCardProps extends FileCardProps {
  progress: number;
  isUploading: boolean;
  error?: string;
}

function FileProgressCard({
  fileName,
  fileSize,
  progress,
  isUploading,
  error,
  onRemove,
}: FileProgressCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border bg-background p-3 shadow-sm",
        error && "border-destructive",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          {isUploading ? (
            <Loader2Icon className="size-5 shrink-0 animate-spin text-primary" />
          ) : error ? (
            <XIcon className="size-5 shrink-0 text-destructive" />
          ) : (
            <FileIcon className="size-5 shrink-0 text-muted-foreground" />
          )}
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={onRemove}
          title={isUploading ? "取消上传" : "移除文件"}
        >
          {isUploading ? (
            <XIcon className="size-4 text-muted-foreground" />
          ) : (
            <Trash2Icon className="size-4 text-destructive" />
          )}
        </Button>
      </div>
      {!error && (
        <div className="flex items-center gap-3">
          <Progress
            value={progress}
            className="h-2 flex-1"
            indicatorClassName={isUploading ? undefined : "bg-emerald-500"}
          />
          <span className="w-10 text-right text-xs text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
