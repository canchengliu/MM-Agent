import { notFound } from "next/navigation";

import { ProjectWorkflowContainer } from "./components/project-workflow-container";

interface ProjectWorkflowPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectWorkflowPage({ params }: ProjectWorkflowPageProps) {
  const resolvedParams = await params;
  const numericProjectId = Number(resolvedParams.projectId);
  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
    notFound();
  }

  return <ProjectWorkflowContainer projectId={numericProjectId} />;
}
