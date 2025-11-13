import { SettingsPageWrapper } from "../components/settings-page-wrapper";

import { PreferencesForm } from "./components/preferences-form";

export default function PreferencesPage() {
  return (
    // Wrapper handles data loading and Card structure
    <SettingsPageWrapper configPath="/settings/preferences">
      {/* Content within the CardContent */}
      <PreferencesForm />
    </SettingsPageWrapper>
  );
}
