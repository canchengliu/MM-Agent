"use client";

import { PanelRightOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useInspectorStore } from "~/core/store/InspectorStore";
import { useIsMobile } from "~/hooks/use-mobile";

import { InspectorPanel } from "./inspector/InspectorPanel";
import { ProjectControlBar } from "./ProjectControlBar";

interface ProjectWorkspaceLayoutClientProps {
  projectId: number;
  children: React.ReactNode;
}

export function ProjectWorkspaceLayoutClient({
  projectId,
  children,
}: ProjectWorkspaceLayoutClientProps) {
  const isCompact = useIsMobile(1024);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const t = useTranslations("workspace.layout");
  const selectedNodeId = useInspectorStore((state) => state.selectedNodeId);

  useEffect(() => {
    if (isCompact && selectedNodeId !== null) {
      setIsDrawerOpen(true);
    }
  }, [isCompact, selectedNodeId]);

  return (
    <div className="flex h-full flex-col bg-background">
      <ProjectControlBar projectId={projectId} />
      <div className="flex flex-1 overflow-hidden">
        {isCompact ? (
          <MobileWorkspace
            isDrawerOpen={isDrawerOpen}
            onDrawerChange={setIsDrawerOpen}
            triggerLabel={t("drawerTrigger")}
            drawerTitle={t("drawerTitle")}
          >
            {children}
          </MobileWorkspace>
        ) : (
          <DesktopWorkspace>{children}</DesktopWorkspace>
        )}
      </div>
    </div>
  );
}

function DesktopWorkspace({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={70} minSize={45} className="min-w-0">
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {children}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-transparent px-1" />
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          maxSize={45}
          className="min-w-[280px] border-l border-border bg-card"
        >
          <InspectorPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function MobileWorkspace({
  children,
  isDrawerOpen,
  onDrawerChange,
  triggerLabel,
  drawerTitle,
}: {
  children: React.ReactNode;
  isDrawerOpen: boolean;
  onDrawerChange: (open: boolean) => void;
  triggerLabel: string;
  drawerTitle: string;
}) {
  return (
    <Sheet open={isDrawerOpen} onOpenChange={onDrawerChange}>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
        <div className="border-t border-border/60 bg-background/95 p-4 shadow-inner">
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className="w-full">
              <PanelRightOpen className="mr-2 size-4" aria-hidden="true" />
              {triggerLabel}
            </Button>
          </SheetTrigger>
        </div>
      </div>
      <SheetContent side="right" className="w-full max-w-full border-l border-border/60 p-0 sm:max-w-xl">
        <div className="flex h-full flex-col overflow-hidden bg-card">
          <div className="border-b border-border/60 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {drawerTitle}
            </p>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <InspectorPanel />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
