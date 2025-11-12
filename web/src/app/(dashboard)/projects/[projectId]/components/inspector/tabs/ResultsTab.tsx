import { AlertTriangle, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { StatusBadge } from "~/components/platform";
import type { NodeDetailView } from "~/core/api";

import { HITLContainer } from "../hitl/HITLContainer";

import { CompletedView } from "./CompletedView";
import { ExecutingView } from "./ExecutingView";
import { FailedView } from "./FailedView";

interface ResultsTabProps {
  node: NodeDetailView;
}

export function ResultsTab({ node }: ResultsTabProps) {
  if (node.status === "Awaiting HITL Approval") {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-4 py-5">
          {node.is_stale ? <StalenessAlert report={node.staleness_report} /> : null}
          <div className="flex flex-1 flex-col overflow-hidden">
            <HITLContainer node={node} pendingResult={node.pending_result} />
          </div>
        </div>
      </div>
    );
  }

  const view = renderView(node);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
        {node.is_stale ? <StalenessAlert report={node.staleness_report} /> : null}
        {view}
      </div>
    </div>
  );
}

function renderView(node: NodeDetailView) {
  switch (node.status) {
    case "Executing":
      return <ExecutingView node={node} />;
    case "Failed":
    case "Canceled":
      return <FailedView node={node} />;
    case "Completed":
      return <CompletedView node={node} />;
    case "Not Started":
      return <NotStartedPlaceholder node={node} />;
    default:
      return <GenericPlaceholder node={node} />;
  }
}

function StalenessAlert({ report }: { report: NodeDetailView["staleness_report"] }) {
  const t = useTranslations("workspace.results.staleness");
  if (!report || report.length === 0) return null;
  return (
    <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-900 shadow-sm dark:text-amber-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5" aria-hidden="true" />
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-foreground">{t("title")}</p>
            <p>{t("description")}</p>
          </div>
          <ul className="space-y-1 text-xs">
            {report.slice(0, 4).map((item) => (
              <li className="flex items-center gap-2" key={`${item.upstream_node_id}-${item.consumed_version_id}`}>
                <span className="font-medium text-amber-900 dark:text-amber-100">
                  {item.upstream_definition_id ?? t("nodeLabel", { id: item.upstream_node_id })}
                </span>
                <span className="text-amber-900/90 dark:text-amber-50/90">
                  {t("versionDelta", {
                    consumed: item.consumed_version_id,
                    active: item.current_active_version_id ?? t("unknownVersion"),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function NotStartedPlaceholder({ node }: { node: NodeDetailView }) {
  const t = useTranslations("workspace.results.notStarted");
  return (
    <section className="rounded-2xl border border-dashed border-border/70 bg-card/50 p-6 text-sm text-muted-foreground">
      <header className="mb-4 flex items-center gap-3">
        <StatusBadge status={node.status} />
        <span>{t("stage", { stage: node.current_stage })}</span>
      </header>
      <div className="flex items-start gap-3">
        <Sparkles className="size-5 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{t("title")}</p>
          <p>{t("description")}</p>
        </div>
      </div>
    </section>
  );
}

function GenericPlaceholder({ node }: { node: NodeDetailView }) {
  const t = useTranslations("workspace.results.generic");
  return (
    <section className="rounded-2xl border border-border/70 bg-card/70 p-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <StatusBadge status={node.status} />
        <span>{t("stage", { stage: node.current_stage })}</span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{t("description")}</p>
    </section>
  );
}
