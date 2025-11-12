import { ProjectWorkspaceLayoutClient } from "./components/ProjectWorkspaceLayoutClient";

interface ProjectWorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ProjectWorkspaceLayout({
  children,
  params,
}: ProjectWorkspaceLayoutProps) {
  const resolvedParams = await params;
  const projectId = Number(resolvedParams.projectId);

  return (
    <ProjectWorkspaceLayoutClient projectId={Number.isFinite(projectId) ? projectId : 0}>
      {children}
    </ProjectWorkspaceLayoutClient>
  );
}
