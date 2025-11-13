import { redirect } from "next/navigation";

import { settingsNavItems } from "./components/settings-config";

// The root settings page redirects to the first defined tab (Profile).
export default function SettingsPage() {
  const defaultTab = settingsNavItems[0];
  if (defaultTab) {
    redirect(defaultTab.href);
  }

  // Fallback if config is somehow empty
  return (
    <div>
      <p>Settings configuration error.</p>
    </div>
  );
}
