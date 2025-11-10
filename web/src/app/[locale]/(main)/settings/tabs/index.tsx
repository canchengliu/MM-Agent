import { BrainCircuit, Info, Settings } from "lucide-react";

import { AboutTab } from "~/features/settings/components/AboutTab";
import { AiConfigTab } from "~/features/settings/components/AiConfigTab";
import { GeneralTab } from "~/features/settings/components/GeneralTab";
import type { SettingsTab } from "~/features/settings/types";

export const SETTINGS_TABS: SettingsTab[] = [
  {
    id: "general",
    icon: Settings,
    component: GeneralTab,
  },
  {
    id: "ai-config",
    icon: BrainCircuit,
    component: AiConfigTab,
  },
  {
    id: "about",
    icon: Info,
    component: AboutTab,
  },
];
