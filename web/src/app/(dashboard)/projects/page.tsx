import type { Metadata } from "next";

import { ProjectsDashboard } from "./projects-dashboard";

export const metadata: Metadata = {
  title: "Projects | O-Award Platform",
};

export default function ProjectsPage() {
  return <ProjectsDashboard initialNow={Date.now()} />;
}
