"use client";

import { useEffect } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { useWorkspaceStore } from "~/core/store/workspace-store";
import { useMediaQuery } from "~/hooks/use-media-query";

import { MainStage } from "./main-stage";
import { BottomPanel } from "./panel-placeholders";
import { MobileFallback } from "./mobile-fallback";
import { NavigationPanel } from "./navigation/navigation-panel";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceStateSynchronizer } from "./workspace-state-synchronizer";
import { ContextualPanel } from "./contextual-panel";

const BREAKPOINTS = {
  lg: "(min-width: 1280px)",
  sm: "(max-width: 767px)",
};

interface ProjectWorkspaceProps {
  projectId: string;
}

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  const isDesktop = useMediaQuery(BREAKPOINTS.lg);
  const isMobile = useMediaQuery(BREAKPOINTS.sm);
  const initializeWorkspace = useWorkspaceStore((state) => state.initializeWorkspace);
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);

  useEffect(() => {
    initializeWorkspace(projectId);

    return () => {
      resetWorkspace();
    };
  }, [projectId, initializeWorkspace, resetWorkspace]);

  if (isMobile) {
    return <MobileFallback projectId={projectId} />;
  }

  const layout = isDesktop
    ? {
        nav: 20,
        main: 60,
        contextual: 20,
        bottom: 25,
        mainStage: 75,
      }
    : {
        nav: 25,
        main: 75,
        contextual: 0,
        bottom: 0,
        mainStage: 100,
      };

  const autoSavePrefix = isDesktop ? "workspace-lg" : "workspace-md";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <WorkspaceStateSynchronizer projectId={projectId} />
      <WorkspaceHeader projectId={projectId} />
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          autoSaveId={`${autoSavePrefix}-horizontal`}
          className="h-full"
          direction="horizontal"
        >
          <ResizablePanel
            collapsible
            collapsedSize={0}
            defaultSize={layout.nav}
            id="navigation-panel"
            maxSize={35}
            minSize={15}
            order={1}
          >
            <NavigationPanel />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={layout.main}
            id="main-section"
            minSize={30}
            order={2}
          >
            <ResizablePanelGroup
              autoSaveId={`${autoSavePrefix}-vertical`}
              direction="vertical"
            >
              <ResizablePanel
                defaultSize={layout.mainStage}
                id="main-stage"
                minSize={20}
                order={1}
              >
                <MainStage />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel
                collapsible
                collapsedSize={0}
                defaultSize={layout.bottom}
                id="bottom-panel"
                maxSize={70}
                minSize={10}
                order={2}
              >
                <BottomPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            collapsible
            collapsedSize={0}
            defaultSize={layout.contextual}
            id="contextual-panel"
            maxSize={35}
            minSize={15}
            order={3}
          >
            <ContextualPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
