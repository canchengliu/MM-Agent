import type { ReactNode } from "react";

import { Separator } from "~/components/ui/separator";

import { SettingsSidebar } from "./components/settings-sidebar";

interface SettingsLayoutProps {
  children: ReactNode;
}

// Design Doc 3.3.2.B Layout Template 1: Standard Layout (Sidebar + Content)
export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    // Allow the settings page content to scroll vertically within the main platform layout
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and configure platform preferences.
          </p>
        </div>
        <Separator />
        {/* Flex layout: Sidebar on the left (desktop), Stacked (mobile) */}
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SettingsSidebar />
          </aside>
          {/* Main content area */}
          <div className="flex-1 lg:max-w-3xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
