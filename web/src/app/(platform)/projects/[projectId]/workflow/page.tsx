import { notFound } from "next/navigation";

import { ProjectWorkflowContainer } from "./components/project-workflow-container";

interface ProjectWorkflowPageProps {
  params: { projectId: string };
}

export default function ProjectWorkflowPage({ params }: ProjectWorkflowPageProps) {
  const numericProjectId = Number(params.projectId);
  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
    notFound();
  }

  return <ProjectWorkflowContainer projectId={numericProjectId} />;
}
