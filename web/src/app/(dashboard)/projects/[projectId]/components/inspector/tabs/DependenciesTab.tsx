import { AlertTriangle, CheckCircle2, Link2, Loader2, Sparkles } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import type { NodeDetailView } from "~/core/api";
import type { StalenessInfo } from "~/core/api/types/workflow";
import { cn } from "~/lib/utils";

interface DependenciesTabProps {
  node: NodeDetailView;
  isLoading?: boolean;
}

interface DependencyEntry {
  key: string;
  consumedVersion: number;
  staleness: StalenessInfo | null;
  synthetic: boolean;
}

export function DependenciesTab({ node, isLoading = false }: DependenciesTabProps) {
  const activeVersion = node.active_version;
  const dependencyEntries = activeVersion
    ? buildDependencyEntries(activeVersion.input_dependencies, node.staleness_report)
    : [];
  const dependencyCount = dependencyEntries.length;
  const staleCount = dependencyEntries.filter((entry) => entry.staleness).length;

  if (isLoading && !activeVersion) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-sm text-muted-foreground"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
        <p>Loading dependency graph…</p>
      </div>
    );
  }

  if (!activeVersion) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
        <Sparkles className="size-5 text-muted-foreground/70" aria-hidden="true" />
        <div>
          <p className="text-base font-semibold text-foreground">No version snapshot yet</p>
          <p className="text-xs text-muted-foreground">
            Execute this node and approve a result to capture its upstream dependencies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Upstream dependencies
        </p>
        <p className="text-xs text-muted-foreground">
          Snapshot captured from version V{activeVersion.version_number ?? "?"}.
        </p>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {dependencyCount === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
            <Sparkles className="size-5 text-muted-foreground/70" aria-hidden="true" />
            <div>
              <p className="text-base font-semibold text-foreground">No recorded upstream inputs</p>
              <p className="text-xs text-muted-foreground">
                The executor did not report any upstream version requirements for this node.
              </p>
            </div>
          </div>
        ) : (
          <>
            {staleCount > 0 ? (
              <div className="mx-4 mt-4 rounded-xl border border-amber-400/60 bg-amber-500/10 p-4 text-sm text-amber-900 shadow-sm dark:text-amber-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-base font-semibold text-foreground">Inputs are stale</p>
                    <p className="text-xs text-amber-900/90 dark:text-amber-100/80">
                      {formatStaleSummary(staleCount, activeVersion.version_number)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-4 mt-4 rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3 text-xs text-emerald-900 shadow-sm dark:text-emerald-50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  <p>All dependencies match the captured inputs from V{activeVersion.version_number}.</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-6">
              {dependencyEntries.map((entry) => (
                <DependencyCard
                  key={`${entry.key}-${entry.consumedVersion}-${entry.synthetic ? "report" : "captured"}`}
                  entry={entry}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DependencyCard({ entry }: { entry: DependencyEntry }) {
  const isStale = Boolean(entry.staleness);
  const activeVersion = entry.staleness?.current_active_version_id;

  return (
    <article
      className={cn(
        "rounded-2xl border p-4 shadow-sm transition-colors",
        isStale
          ? "border-amber-400/70 bg-amber-500/10"
          : "border-border/60 bg-card/80",
      )}
    >
      <div className="flex flex-wrap items-start gap-2">
        <Link2 className={cn("size-4", isStale ? "text-amber-800 dark:text-amber-200" : "text-muted-foreground")} aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{formatDependencyLabel(entry)}</p>
          <p className="text-xs text-muted-foreground">
            Consumed V{entry.consumedVersion} during the last approved run.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[11px]",
              isStale
                ? "border-amber-400/70 bg-amber-500/15 text-amber-900 dark:text-amber-50"
                : "border-emerald-400/60 bg-emerald-500/10 text-emerald-900 dark:text-emerald-50",
            )}
          >
            {isStale ? "Out of sync" : "In sync"}
          </Badge>
          {entry.synthetic ? (
            <Badge variant="outline" className="border-dashed text-[10px] text-muted-foreground">
              Reported
            </Badge>
          ) : null}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 text-xs text-muted-foreground sm:grid-cols-3">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
            Consumed
          </dt>
          <dd className="mt-1 text-sm text-foreground">V{entry.consumedVersion}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
            Current active
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            {isStale ? `V${activeVersion ?? "?"}` : `V${entry.consumedVersion}`}
          </dd>
        </div>
        {entry.staleness?.upstream_definition_id ? (
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
              Definition
            </dt>
            <dd className="mt-1 text-sm text-foreground">{entry.staleness.upstream_definition_id}</dd>
          </div>
        ) : null}
      </dl>

      {isStale ? (
        <p className="mt-3 text-sm text-amber-900 dark:text-amber-50">
          Upstream node published V{activeVersion ?? "?"} after this execution. Re-run to align with the latest data.
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          No changes detected since this version was approved.
        </p>
      )}
    </article>
  );
}

function buildDependencyEntries(
  inputs: Record<string, number> | undefined,
  report: NodeDetailView["staleness_report"],
): DependencyEntry[] {
  const safeInputs = inputs ?? {};
  const entries: DependencyEntry[] = Object.entries(safeInputs).map(([key, consumedVersion]) => ({
    key,
    consumedVersion,
    staleness: findStaleness(report, key),
    synthetic: false,
  }));

  const unmatchedReports = (report ?? []).filter(
    (info) => !entries.some((entry) => matchesReport(entry.key, info)),
  );

  const reportEntries = unmatchedReports.map((info) => ({
    key: info.upstream_definition_id ?? String(info.upstream_node_id),
    consumedVersion: info.consumed_version_id,
    staleness: info,
    synthetic: true,
  }));

  return [...entries, ...reportEntries];
}

function findStaleness(report: NodeDetailView["staleness_report"], key: string) {
  if (!report) return null;
  return report.find((item) => matchesReport(key, item)) ?? null;
}

function matchesReport(key: string, info: StalenessInfo) {
  const numericKey = Number(key);
  if (!Number.isNaN(numericKey) && info.upstream_node_id === numericKey) {
    return true;
  }
  if (info.upstream_definition_id && info.upstream_definition_id === key) {
    return true;
  }
  return false;
}

function formatDependencyLabel(entry: DependencyEntry) {
  if (entry.staleness?.upstream_definition_id) {
    return entry.staleness.upstream_definition_id;
  }
  const numericId = Number(entry.key);
  if (!Number.isNaN(numericId)) {
    return `Node ${numericId}`;
  }
  return entry.key;
}

function formatStaleSummary(count: number, versionNumber: number | null | undefined) {
  const plural = count === 1 ? "dependency is" : "dependencies are";
  const versionLabel = typeof versionNumber === "number" ? `V${versionNumber}` : "the last run";
  return `${count} upstream ${plural} out of sync with ${versionLabel}.`;
}
