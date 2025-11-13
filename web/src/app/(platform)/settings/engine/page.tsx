import { SettingsPageWrapper } from "../components/settings-page-wrapper";

import { EngineConfigurationForm } from "./components/engine-configuration-form";

export default function EnginePage() {
  return (
    // Wrapper handles data loading and Card structure
    <SettingsPageWrapper configPath="/settings/engine">
      {/* Content within the CardContent */}
      <EngineConfigurationForm />
    </SettingsPageWrapper>
  );
}
