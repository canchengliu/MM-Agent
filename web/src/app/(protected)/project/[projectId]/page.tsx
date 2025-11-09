import { ProjectWorkspace } from "~/components/workspace/project-workspace";

interface ProjectWorkspacePageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  return <ProjectWorkspace projectId={params.projectId} />;
}
