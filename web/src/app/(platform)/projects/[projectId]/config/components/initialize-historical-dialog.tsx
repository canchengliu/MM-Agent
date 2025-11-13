"use client";

import { History, Loader2, Package, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { ProjectDetailRead } from "~/core/models/project.model";
import { useStore } from "~/core/store";

interface InitializeHistoricalDialogProps {
  project: ProjectDetailRead;
}

/**
 * Dialog for initializing a project from the historical case library.
 * (P2.3, FRS 3.3, API 3.2.2, 3.4.1)
 */
export function InitializeHistoricalDialog({
  project,
}: InitializeHistoricalDialogProps) {
  const {
    historicalProblems,
    isLoadingHistorical,
    fetchHistoricalProblems,
    initializeFromHistorical,
    isMutatingProject,
  } = useStore(
    useShallow((state) => ({
      historicalProblems: state.historicalProblems,
      isLoadingHistorical: state.isLoadingHistorical,
      fetchHistoricalProblems: state.fetchHistoricalProblems,
      initializeFromHistorical: state.initializeFromHistorical,
      isMutatingProject: state.isMutatingProject,
    })),
  );

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingInitializationId, setPendingInitializationId] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (isOpen) {
      void fetchHistoricalProblems();
    }
  }, [isOpen, fetchHistoricalProblems]);

  const filteredProblems = useMemo(() => {
    if (!searchQuery) return historicalProblems;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return historicalProblems.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerCaseQuery) ||
        p.year.toString().includes(lowerCaseQuery) ||
        `Problem ${p.type}`.toLowerCase().includes(lowerCaseQuery),
    );
  }, [historicalProblems, searchQuery]);

  const handleInitialize = async (problemId: number) => {
    setPendingInitializationId(problemId);
    try {
      const success = await initializeFromHistorical(project.id, problemId);
      if (success) {
        setIsOpen(false);
        setSearchQuery("");
      }
    } finally {
      setPendingInitializationId(null);
    }
  };

  const isLocked = project.status !== "Configuring";
  const isDisabled = isLocked || isMutatingProject;

  const triggerButton = (
    <Button variant="outline" size="sm" disabled={isDisabled}>
      <History className="mr-2 h-4 w-4" />
      Initialize from History
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {isDisabled ? (
              <span tabIndex={0}>
                <DialogTrigger asChild>{triggerButton}</DialogTrigger>
              </span>
            ) : (
              <DialogTrigger asChild>{triggerButton}</DialogTrigger>
            )}
          </TooltipTrigger>
          {isLocked && (
            <TooltipContent>
              Initialization is disabled because the workflow has already
              started.
            </TooltipContent>
          )}
          {isMutatingProject && !isLocked && (
            <TooltipContent>
              Please wait while the project is updating.
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Initialize from Historical Case Library</DialogTitle>
          <DialogDescription>
            Select a past contest problem to automatically populate this
            project&apos;s files and settings.
            <span className="mt-1 block font-semibold text-destructive">
              Warning: This will overwrite the current problem type and existing
              files.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, year, or type (e.g., 2023 C)..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoadingHistorical}
          />
        </div>

        {isLoadingHistorical ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="grid gap-4 p-1 sm:grid-cols-2">
              {filteredProblems.map((problem) => {
                const isPending = pendingInitializationId === problem.id;
                return (
                  <div
                    key={problem.id}
                    className="flex flex-col rounded-lg border p-4 shadow-sm transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                        {problem.name}
                      </h3>
                      <Badge variant="secondary" className="shrink-0">
                        {problem.year}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-medium">
                        Problem {problem.type}
                      </span>
                      {problem.has_dataset && (
                        <span
                          className="flex items-center gap-1 text-green-600 dark:text-green-400"
                          title="Includes dataset files"
                        >
                          <Package className="h-3 w-3" />
                          Dataset
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => void handleInitialize(problem.id)}
                      disabled={isMutatingProject || isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        "Select Case"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            {filteredProblems.length === 0 && historicalProblems.length > 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No matching historical cases found for &quot;{searchQuery}&quot;.
              </div>
            )}
            {historicalProblems.length === 0 && !isLoadingHistorical && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                The historical case library is currently empty.
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
