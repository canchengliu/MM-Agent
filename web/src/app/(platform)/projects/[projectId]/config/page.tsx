import { notFound } from "next/navigation";

import { ProjectConfigContainer } from "./components/project-config-container";

interface ProjectConfigPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectConfigPage({ params }: ProjectConfigPageProps) {
  const resolvedParams = await params;
  const numericProjectId = Number(resolvedParams.projectId);

  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
    notFound();
  }

  return <ProjectConfigContainer projectId={numericProjectId} />;
}
