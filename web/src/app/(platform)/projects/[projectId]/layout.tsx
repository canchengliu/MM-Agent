import type { ReactNode } from "react";

export default function ProjectDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="h-full">{children}</div>;
}
