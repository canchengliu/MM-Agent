import type { LucideIcon } from "lucide-react";

export interface SettingsTabProps {
  hasLlmApiKey: boolean;
  hasE2bApiKey: boolean;
}

export interface SettingsTab {
  id: string;
  icon: LucideIcon;
  component: (props: SettingsTabProps) => JSX.Element;
}
