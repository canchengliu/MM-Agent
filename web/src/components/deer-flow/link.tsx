import { WarningFilled } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Tooltip } from "./tooltip";

export const Link = ({
  href,
  children,
  warnUnverified = false,
}: {
  href?: string;
  children: ReactNode;
  warnUnverified?: boolean;
}) => {
  const t = useTranslations("common");
  return (
    <span className="inline-flex items-center gap-1.5">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
      {warnUnverified && (
        <Tooltip title={t("linkNotReliable")} delayDuration={300}>
          <WarningFilled className="text-sx transition-colors hover:!text-yellow-500" />
        </Tooltip>
      )}
    </span>
  );
};
