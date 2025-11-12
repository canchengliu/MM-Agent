import { env } from "~/env";

import { DashboardShell } from "./dashboard-shell";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const platformTitle = env.NEXT_PUBLIC_PLATFORM_NAME ?? "O-Award Platform";
  return <DashboardShell platformName={platformTitle}>{children}</DashboardShell>;
}
