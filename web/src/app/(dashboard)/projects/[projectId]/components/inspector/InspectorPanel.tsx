"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { StatusBadge } from "~/components/platform";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { NodeDetailView, NodeVersionRead } from "~/core/api";
import { useInspectorStore, type InspectorTab } from "~/core/store/InspectorStore";
import { Transitions } from "~/styles/motion-tokens";

import { DependenciesTab } from "./tabs/DependenciesTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { ResultsTab } from "./tabs/ResultsTab";

const TAB_ITEMS: Array<{ value: InspectorTab; labelKey: string }> = [
  { value: "results", labelKey: "tabs.results" },
  { value: "history", labelKey: "tabs.history" },
  { value: "dependencies", labelKey: "tabs.dependencies" },
];

const isInspectorTab = (value: string): value is InspectorTab =>
  TAB_ITEMS.some((item) => item.value === value);

export function InspectorPanel() {
  const { selectedNodeId, details, versionHistory, isLoadingDetails, error, activeTab, setActiveTab } =
    useInspectorStore((state) => ({
      selectedNodeId: state.selectedNodeId,
      details: state.details,
      versionHistory: state.versionHistory,
      isLoadingDetails: state.isLoadingDetails,
      error: state.error,
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
    }));
  const t = useTranslations("workspace.inspector");
  const tabItems = TAB_ITEMS.map((tab) => ({
    ...tab,
    label: t(tab.labelKey),
  }));

  const sharedMotionProps = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: Transitions.standard,
    className: "flex h-full flex-col",
  } as const;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card">
      <AnimatePresence mode="wait" initial={false}>
        {selectedNodeId === null ? (
          <motion.section key="inspector-empty" {...sharedMotionProps}>
            <EmptyState />
          </motion.section>
        ) : (
          <motion.section key={`inspector-${selectedNodeId}`} {...sharedMotionProps}>
            <PanelHeader
              nodeId={selectedNodeId}
              details={details}
              isLoading={isLoadingDetails}
            />
            <div className="flex flex-1 flex-col overflow-hidden">
              {isLoadingDetails && !details ? (
                <LoadingState />
              ) : !details && error ? (
                <ErrorState message={error} />
              ) : details ? (
                <InspectorTabs
                  details={details}
                  versionHistory={versionHistory}
                  error={error}
                  activeTab={activeTab}
                  isLoading={isLoadingDetails}
                  tabs={tabItems}
                  onTabChange={(tab) => setActiveTab(tab)}
                />
              ) : (
                <ErrorState message={t("error.fallback")} />
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PanelHeaderProps {
  nodeId: number;
  details: NodeDetailView | null;
  isLoading: boolean;
}

function PanelHeader({ nodeId, details, isLoading }: PanelHeaderProps) {
  const t = useTranslations("workspace.inspector");
  const title = details?.name ?? t("panel.fallbackTitle", { id: nodeId });
  const subtitle = details
    ? t("panel.subtitle", { stage: details.stage_name, type: details.node_type })
    : isLoading
      ? t("panel.loadingSubtitle")
      : t("panel.missingSubtitle");

  return (
    <div className="border-b border-border/60 px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {t("panel.label")}
          </p>
          <div className="text-lg font-semibold text-foreground">{title}</div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {details?.status ? (
          <StatusBadge status={details.status} className="max-w-[180px] shrink-0" />
        ) : null}
      </div>
    </div>
  );
}

interface InspectorTabsProps {
  details: NodeDetailView;
  versionHistory: NodeVersionRead[] | null;
  error: string | null;
  activeTab: InspectorTab;
  isLoading: boolean;
  tabs: Array<{ value: InspectorTab; label: string }>;
  onTabChange: (tab: InspectorTab) => void;
}

function InspectorTabs({ details, versionHistory, error, activeTab, isLoading, onTabChange, tabs }: InspectorTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        if (isInspectorTab(value)) {
          onTabChange(value);
        }
      }}
      className="flex h-full flex-1 flex-col"
    >
      <TabsList className="w-full border-b border-border/60 bg-transparent px-4 pb-2 pt-2">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-1 px-3">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex flex-1 flex-col overflow-hidden">
        {error && <InlineError message={error} />}
        <TabsContent value="results" className="flex h-full flex-col overflow-hidden">
          <ResultsTab node={details} />
        </TabsContent>
        <TabsContent value="history" className="flex h-full flex-col overflow-hidden">
          <HistoryTab
            node={details}
            versions={versionHistory}
            isLoading={isLoading && !versionHistory}
          />
        </TabsContent>
        <TabsContent value="dependencies" className="flex h-full flex-col overflow-hidden">
          <DependenciesTab node={details} isLoading={isLoading} />
        </TabsContent>
      </div>
    </Tabs>
  );
}

function InlineError({ message }: { message: string }) {
  const t = useTranslations("workspace.inspector");
  return (
    <div className="mx-4 mt-4 flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-50">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">{t("inlineError.title")}</p>
        <p>{message}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  const t = useTranslations("workspace.inspector");
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
      <Sparkles className="size-5 text-muted-foreground/70" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{t("empty.title")}</p>
        <p>{t("empty.description")}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  const t = useTranslations("workspace.inspector");
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-sm text-muted-foreground"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
      <p>{t("loading")}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  const t = useTranslations("workspace.inspector");
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
      <AlertCircle className="size-6 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-destructive">{t("error.title")}</p>
        <p>{message}</p>
      </div>
    </div>
  );
}
