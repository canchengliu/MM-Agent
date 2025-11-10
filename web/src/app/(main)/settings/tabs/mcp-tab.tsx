"use client";

import { motion } from "framer-motion";
import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { FavIcon } from "~/components/deer-flow/fav-icon";
import { Tooltip } from "~/components/deer-flow/tooltip";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import type { MCPServerMetadata } from "~/core/mcp";
import type { SettingsState } from "~/core/store";

import { AddMCPServerDialog } from "../dialogs/add-mcp-server-dialog";

export function MCPTab({
  settings,
  onChange,
}: {
  settings: SettingsState;
  onChange: (value: Partial<SettingsState>) => void;
}) {
  const t = useTranslations("settings.mcp");

  const handleRemove = useCallback(
    (server: MCPServerMetadata) => {
      const servers = settings.mcp.servers.filter(
        (s) => s.name !== server.name,
      );
      onChange({ mcp: { ...settings.mcp, servers } });
    },
    [settings, onChange],
  );

  const handleToggle = useCallback(
    (server: MCPServerMetadata, enabled: boolean) => {
      const servers = settings.mcp.servers.map((s) =>
        s.name === server.name ? { ...s, enabled } : s,
      );
      onChange({ mcp: { ...settings.mcp, servers } });
    },
    [settings, onChange],
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("title")}</h3>
        <AddMCPServerDialog settings={settings} onChange={onChange} />
      </div>
      <motion.ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {settings.mcp?.servers?.map((server, index) => (
          <motion.li
            key={server.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {server.transport === "http" && <FavIcon url={server.url} />}
                    {server.name}
                  </CardTitle>
                  <Switch
                    checked={server.enabled}
                    onCheckedChange={(checked) => handleToggle(server, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2 text-sm">
                  {server.description}
                </p>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-sm">{t("providesTools")}:</span>
                  {server.tools.map((tool) => (
                    <Tooltip key={tool.name} title={tool.description}>
                      <Badge variant="secondary">{tool.name}</Badge>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
              <div className="flex justify-end px-6 pb-4">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleRemove(server)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            </Card>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
