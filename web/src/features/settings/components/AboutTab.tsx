"use client";

import { Skeleton } from "~/components/ui/skeleton";
import { useSystemInfo } from "~/features/settings/hooks/useSystemInfo";

export function AboutTab() {
  const { data: systemInfo, isLoading, isError } = useSystemInfo();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <p className="w-40 flex-shrink-0 font-medium text-muted-foreground">
            Application Version:
          </p>
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center gap-4">
          <p className="w-40 flex-shrink-0 font-medium text-muted-foreground">
            System Default LLM:
          </p>
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Could not load system information.
      </p>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-4">
        <p className="w-40 flex-shrink-0 font-medium text-muted-foreground">
          Application Version:
        </p>
        <p className="font-mono">{systemInfo?.app_version ?? "N/A"}</p>
      </div>
      <div className="flex items-center gap-4">
        <p className="w-40 flex-shrink-0 font-medium text-muted-foreground">
          System Default LLM:
        </p>
        <p className="font-mono">{systemInfo?.llm_model_name ?? "N/A"}</p>
      </div>
    </div>
  );
}

