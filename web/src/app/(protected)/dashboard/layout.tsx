import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="container h-full overflow-auto py-6">
      {children}
    </div>
  );
}
