"use client";

import type { ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useStore } from "~/core/store";

import { settingsNavItems } from "./settings-config";
import { SettingsPageLoader } from "./settings-page-loader";

interface SettingsPageWrapperProps {
  children: ReactNode;
  // The path corresponding to the settingsNavItems config (e.g., "/settings/profile")
  configPath: string;
}

/**
 * Wraps settings forms, handles data loading states, and provides consistent structure (Card UI).
 */
export function SettingsPageWrapper({ children, configPath }: SettingsPageWrapperProps) {
  // Check global loading states for auth initialization and settings data.
  const { isLoadingSettings, settings, isInitialized, user } = useStore(
    useShallow((state) => ({
      isLoadingSettings: state.isLoadingSettings,
      settings: state.settings,
      isInitialized: state.isInitialized,
      user: state.user,
    })),
  );

  // Find the configuration for the current page based on the path
  const config = settingsNavItems.find((item) => item.href === configPath);

  // Determine if the required data (User profile and Settings) is ready.
  // Data is fetched automatically by AuthInitializer upon login.
  const isDataReady =
    isInitialized &&
    Boolean(user) &&
    Boolean(settings ?? !isLoadingSettings);

  if (!isDataReady) {
    // Show the standardized loader skeleton
    return <SettingsPageLoader title={config?.title} description={config?.description} />;
  }

  // Handle case where data failed to load (settings is null and loading is finished)
  if (!settings && !isLoadingSettings) {
    return (
      <Card>
        <CardHeader>
          {config && <CardTitle>{config.title}</CardTitle>}
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed bg-destructive/10 p-6 text-center">
            <p className="text-sm text-destructive-foreground">
              Error: Failed to load settings data. Please try refreshing the page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {config && (
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-8">
        {/* Render the actual form components */}
        {children}
      </CardContent>
    </Card>
  );
}
