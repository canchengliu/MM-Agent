"use client";

import { MonitorIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

import { WorkspaceHeader } from "./workspace-header";

export function MobileFallback({ projectId }: { projectId: string }) {
  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader projectId={projectId} />
      <div className="flex flex-1 flex-col items-center justify-center overflow-auto p-4">
        <Alert className="max-w-md">
          <MonitorIcon className="h-4 w-4" />
          <AlertTitle>Desktop Experience Required</AlertTitle>
          <AlertDescription>
            The DeerFlow Project Workspace is optimized for complex analysis and
            requires a larger screen (768px+). Please use a desktop device for
            full functionality.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
