import { useTranslations } from "next-intl";

import { Skeleton } from "~/components/ui/skeleton";
import { useSystemInfo } from "~/features/system/hooks/useSystem";

import type { SettingsTabProps } from "../types";

export function AboutTab(_: SettingsTabProps) {
  const t = useTranslations("settings.aboutTab");
  const { data: systemInfo, isLoading, isError } = useSystemInfo();

  const versionContent = (() => {
    if (isLoading) return <Skeleton className="h-5 w-24" />;
    if (isError) {
      return (
        <span className="font-mono text-sm text-destructive">Unavailable</span>
      );
    }
    return (
      <span className="font-mono text-sm text-foreground">
        {systemInfo?.app_version ?? "—"}
      </span>
    );
  })();

  const modelContent = (() => {
    if (isLoading) return <Skeleton className="h-5 w-48" />;
    if (isError) {
      return (
        <span className="font-mono text-sm text-destructive">Unavailable</span>
      );
    }
    return (
      <span className="font-mono text-sm text-foreground">
        {systemInfo?.llm_model_name ?? "—"}
      </span>
    );
  })();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <div className="space-y-4 rounded-lg border p-4 text-sm">
        <p className="text-muted-foreground">{t("description")}</p>
        <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-3">
          <span className="font-medium text-muted-foreground">
            {t("versionLabel")}
          </span>
          {versionContent}

          <span className="font-medium text-muted-foreground">
            {t("defaultModelLabel")}
          </span>
          {modelContent}
        </div>
      </div>
    </div>
  );
}
