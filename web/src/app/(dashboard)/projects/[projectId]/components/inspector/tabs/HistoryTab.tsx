import { GitBranch, GitCommit, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { NodeService, type NodeDetailView, type NodeVersionRead } from "~/core/api";
import { useInspectorStore } from "~/core/store/InspectorStore";
import { useWorkflowStore } from "~/core/store/WorkflowStore";

import { VersionReviewDialog } from "./VersionReviewDialog";

interface HistoryTabProps {
  node: NodeDetailView;
  versions: NodeVersionRead[] | null;
  isLoading?: boolean;
}

export function HistoryTab({ node, versions, isLoading = false }: HistoryTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<NodeVersionRead | null>(null);
  const [activationDialogOpen, setActivationDialogOpen] = useState(false);
  const [activationTarget, setActivationTarget] = useState<NodeVersionRead | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const activateVersionRequest = useWorkflowStore((state) => state.activateVersion);
  const isGeneratorNode = node.node_type === "Generator";

  const versionsList = useMemo(() => versions ?? [], [versions]);
  const activeVersionId = node.active_version?.id ?? null;

  const versionCards = useMemo(
    () =>
      versionsList.map((version) => ({
        ...version,
        dependencyCount: Object.keys(version.input_dependencies ?? {}).length,
        isActive: activeVersionId === version.id,
      })),
    [versionsList, activeVersionId],
  );

  const handleReview = (version: NodeVersionRead) => {
    setSelectedVersion(version);
    setDialogOpen(true);
  };

  const refreshInspectorData = useCallback(async () => {
    try {
      const [details, versionHistory] = await Promise.all([
        NodeService.getDetail(node.id),
        NodeService.getVersions(node.id),
      ]);

      useInspectorStore.setState((state) => {
        if (state.selectedNodeId !== node.id) {
          return {};
        }
        return {
          details,
          versionHistory,
          _detailsCache: { ...state._detailsCache, [node.id]: details },
          _versionHistoryCache: { ...state._versionHistoryCache, [node.id]: versionHistory },
        };
      });
    } catch (error) {
      console.error("[HistoryTab] Failed to refresh inspector data after activation", error);
    }
  }, [node.id]);

  const handleActivateRequest = (version: NodeVersionRead) => {
    if (version.isActive || isGeneratorNode) return;
    setActivationTarget(version);
    setActivationDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    if (open) {
      setDialogOpen(true);
    } else {
      setDialogOpen(false);
      setSelectedVersion(null);
    }
  };

  const handleActivationDialogChange = (open: boolean) => {
    if (isActivating) return;
    setActivationDialogOpen(open);
    if (!open) {
      setActivationTarget(null);
    }
  };

  const handleConfirmActivate = async () => {
    if (!activationTarget) return;
    setIsActivating(true);
    try {
      await activateVersionRequest(node.id, activationTarget.id);
      await refreshInspectorData();
      toast.success(`Version V${activationTarget.version_number} is now active. Downstream nodes will be marked as Stale until you re-execute them.`);
      setActivationDialogOpen(false);
      setActivationTarget(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to activate this version.";
      toast.error(message);
    } finally {
      setIsActivating(false);
    }
  };

  const showLoading = isLoading && versionsList.length === 0;
  const showEmptyState = !isLoading && versionsList.length === 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Version history
        </p>
        <p className="text-xs text-muted-foreground">
          Review immutable snapshots captured after each approved run.
        </p>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {showLoading ? (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-sm text-muted-foreground"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
            <p>Loading version history…</p>
          </div>
        ) : showEmptyState ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
            <GitBranch className="size-5 text-muted-foreground/70" aria-hidden="true" />
            <div>
              <p className="text-base font-semibold text-foreground">No historical versions yet</p>
              <p className="text-xs text-muted-foreground">
                Approve this node’s first execution to create an immutable snapshot.
              </p>
            </div>
          </div>
        ) : (
          <>
            {isGeneratorNode ? <GeneratorRestrictionNotice /> : null}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
              {versionCards.map((version) => {
                const disableActivate = version.isActive || isGeneratorNode || isActivating;
                const disableReason = version.isActive
                  ? "This version is already active."
                  : isGeneratorNode
                    ? "Generator nodes cannot activate historical versions."
                    : undefined;

                return (
                  <article
                    key={version.id}
                    className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm transition-colors"
                    aria-label={`Version ${version.version_number}`}
                  >
                    <header className="flex flex-wrap items-start gap-3">
                      <div className="flex items-center gap-3">
                        <GitCommit className="size-5 text-muted-foreground" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Version V{version.version_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {version.summary?.trim() || "No summary provided."}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                        {version.isActive ? <Badge variant="secondary">Active</Badge> : null}
                        <Badge variant="outline">{formatVersionSource(version.source)}</Badge>
                        {version.based_on_version_id ? (
                          <Badge variant="outline" className="font-normal">
                            Based on V{version.based_on_version_id}
                          </Badge>
                        ) : null}
                      </div>
                    </header>

                    <dl className="mt-4 grid grid-cols-2 gap-4 text-xs text-muted-foreground sm:grid-cols-4">
                      <MetadataItem label="Dependencies" value={`${version.dependencyCount}`} />
                      <MetadataItem
                        label="Model"
                        value={version.llm_model_name || "Unspecified"}
                        className="col-span-1 sm:col-span-2"
                      />
                      <MetadataItem
                        label="Temperature"
                        value={formatTemperature(version.temperature)}
                      />
                      <MetadataItem
                        label="HITL interactions"
                        value={version.hitl_history?.length ? `${version.hitl_history.length}` : "0"}
                      />
                    </dl>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" type="button" onClick={() => handleReview(version)}>
                        Review snapshot
                      </Button>
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => handleActivateRequest(version)}
                        disabled={disableActivate}
                        title={disableReason}
                      >
                        Activate
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      <VersionReviewDialog
        nodeName={node.name}
        version={selectedVersion}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
      <AlertDialog open={activationDialogOpen} onOpenChange={handleActivationDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activationTarget ? `Activate Version V${activationTarget.version_number}?` : "Activate version"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Activating this historical version will change the output of this node. Downstream nodes will be marked as
              Stale and will not be automatically updated. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline" disabled={isActivating}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="button" onClick={handleConfirmActivate} disabled={isActivating}>
                {isActivating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                    Activating…
                  </>
                ) : (
                  "Activate"
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GeneratorRestrictionNotice() {
  return (
    <div className="mx-4 mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:border-amber-200/30 dark:bg-amber-400/10 dark:text-amber-50">
      <p className="font-semibold">Generator nodes cannot activate historical versions.</p>
      <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-50/80">
        Snapshots remain available for review, but their outputs stay locked to protect downstream structure.
      </p>
    </div>
  );
}

function MetadataItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function formatVersionSource(source: NodeVersionRead["source"]) {
  if (source === "MANUALLY_EDITED") return "Manually edited";
  if (source === "AI_GENERATED") return "AI generated";
  return source ?? "Unknown";
}

function formatTemperature(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "–";
  }
  return value.toFixed(2);
}
