import { Cpu, SlidersHorizontal, User } from "lucide-react";

// Defines the structure and navigation for the settings center.
// Based on Design Doc 1.2.1 (User/Account) and 1.2.2 (Settings/Configuration) domains.
export const settingsNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: User,
    description:
      "Manage your public profile information and account security.",
  },
  {
    title: "Preferences",
    href: "/settings/preferences",
    icon: SlidersHorizontal,
    description:
      "Customize the appearance, language, and AI behavior of the interface.",
  },
  {
    title: "Engine (BYOK)",
    href: "/settings/engine",
    icon: Cpu,
    description:
      "Configure custom AI models (LLM), execution sandboxes, and API keys.",
  },
];
