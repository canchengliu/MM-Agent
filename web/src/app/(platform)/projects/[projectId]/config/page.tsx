import { notFound } from "next/navigation";

import { ProjectConfigContainer } from "./components/project-config-container";

interface ProjectConfigPageProps {
  params: { projectId: string };
}

export default function ProjectConfigPage({ params }: ProjectConfigPageProps) {
  const numericProjectId = Number(params.projectId);

  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
    notFound();
  }

  return <ProjectConfigContainer projectId={numericProjectId} />;
}
