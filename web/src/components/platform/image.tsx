"use client";

import { memo, useCallback, useEffect, useState } from "react";
import type { SyntheticEvent } from "react";

import { cn } from "~/lib/utils";

import { Tooltip } from "./tooltip";

interface PlatformImageProps {
  className?: string;
  imageClassName?: string;
  imageTransition?: boolean;
  src: string;
  alt: string;
  fallback?: React.ReactNode;
}

function PlatformImage({
  className,
  imageClassName,
  imageTransition,
  src,
  alt,
  fallback = null,
}: PlatformImageProps) {
  const [, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsError(false);
    setIsLoading(false);
  }, []);

  const handleError = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.display = "none";
    console.warn(`Image "${event.currentTarget.src}" failed to load`);
    setIsError(true);
  }, []);

  return (
    <span className={cn("block w-fit overflow-hidden", className)}>
      {isError || !src ? (
        fallback
      ) : (
        <Tooltip title={alt || "No caption"}>
          <img
            alt={alt}
            className={cn(
              "size-full object-cover",
              imageTransition && "transition-all duration-200 ease-out",
              imageClassName,
            )}
            onError={handleError}
            onLoad={handleLoad}
            src={src}
          />
        </Tooltip>
      )}
    </span>
  );
}

export default memo(PlatformImage);
