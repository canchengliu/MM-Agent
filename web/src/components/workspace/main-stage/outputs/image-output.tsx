// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { assetsService } from "~/core/api/services/assets.service";

interface ImageOutputProps {
  assetId: string | null;
  alt: string;
}

export const ImageOutput = ({ assetId, alt }: ImageOutputProps) => {
  const [hasError, setHasError] = useState(false);

  if (!assetId) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-dashed border-muted-foreground/40 bg-muted/20 p-4 text-sm text-muted-foreground">
        <ImageOff className="h-4 w-4" aria-hidden />
        <span>No image asset attached to this output.</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-dashed border-muted-foreground/40 bg-destructive/5 p-4 text-sm text-destructive">
        <ImageOff className="h-4 w-4" aria-hidden />
        <span>Unable to load image asset.</span>
      </div>
    );
  }

  const src = assetsService.getAssetContentUrl(assetId);

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-lg border bg-black/5">
        <img
          src={src}
          alt={alt}
          className="w-full object-contain"
          onError={() => setHasError(true)}
        />
      </div>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary underline underline-offset-4"
      >
        Open image in new tab
      </a>
    </div>
  );
};
