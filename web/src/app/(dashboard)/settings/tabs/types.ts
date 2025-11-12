import type { LucideIcon } from "lucide-react";

import type { UserSettingsRead, UserSettingsUpdate } from "~/core/api/types";

export interface SettingsTabProps {
  settings: UserSettingsRead;
  isLoading: boolean;
  onSubmit: (changes: UserSettingsUpdate) => Promise<UserSettingsRead>;
}

export type SettingsTabComponent = (props: SettingsTabProps) => JSX.Element;

export interface SettingsTabDefinition {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  component: SettingsTabComponent;
}
