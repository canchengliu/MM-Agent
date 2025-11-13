import { Separator } from "~/components/ui/separator";

import { SettingsPageWrapper } from "../components/settings-page-wrapper";

import { AccountSettingsForm } from "./components/account-settings-form";
import { ChangePasswordForm } from "./components/change-password-form";

export default function ProfilePage() {
  return (
    // Wrapper handles data loading states and Card structure
    <SettingsPageWrapper configPath="/settings/profile">
      {/* Content within the CardContent (defined in Wrapper) */}
      <AccountSettingsForm />
      <Separator />
      <ChangePasswordForm />
    </SettingsPageWrapper>
  );
}
