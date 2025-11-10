import { useMemo } from "react";
import { useStore, useToolCalls } from "~/core/store";
import { parseJSON } from "~/core/utils/json";
import { Tooltip } from "./tooltip";
import { WarningFilled } from "@ant-design/icons";
import { useTranslations } from "next-intl";

export const Link = ({
  href,
  children,
  checkLinkCredibility = false,
}: {
  href: string | undefined;
  children: React.ReactNode;
  checkLinkCredibility: boolean;
}) => {
  const toolCalls = useToolCalls();
  const responding = useStore((state) => state.responding);
  const hasToolCallResults =
    Array.isArray(toolCalls) && toolCalls.length > 0;

  const credibleLinks = useMemo(() => {
    const links = new Set<string>();
    if (!checkLinkCredibility || !hasToolCallResults) return links;

    (toolCalls || []).forEach((call) => {
      if (call && call.name === "web_search" && call.result) {
        try {
          const result = parseJSON(call.result, []) as Array<{ url: string }>;
          if (Array.isArray(result)) {
            result.forEach((r) => {
              if (r && typeof r.url === 'string') {
                // encodeURI is used to handle the case where the link contains chinese or other special characters
                links.add(encodeURI(r.url));
                links.add(r.url);
              }
            });
          }
        } catch (error) {
          console.warn('Failed to parse web_search result:', error);
        }
      }
    });
    return links;
  }, [toolCalls, checkLinkCredibility, hasToolCallResults]);

  const isCredible = useMemo(() => {
    if (!checkLinkCredibility || !href || !hasToolCallResults) {
      return true;
    }
    if (responding) {
      return true;
    }
    return credibleLinks.has(href);
  }, [
    checkLinkCredibility,
    credibleLinks,
    hasToolCallResults,
    href,
    responding,
  ]);

  const t = useTranslations("common");
  return (
    <span className="inline-flex items-center gap-1.5">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
      {!isCredible && (
        <Tooltip title={t("linkNotReliable")} delayDuration={300}>
          <WarningFilled className="text-sx transition-colors hover:!text-yellow-500" />
        </Tooltip>
      )}
    </span>
  );
};
