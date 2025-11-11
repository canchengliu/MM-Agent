// Centralized definitions for TanStack Query cache keys.
export const QueryKeys = {
  projects: () => ["projects"] as const,
  projectDetail: (id: number) => ["projects", id] as const,
  workflow: (id: number) => ["workflows", id] as const,
  staleness: (workflowId: number) =>
    ["workflows", workflowId, "staleness"] as const,
  node: (id: number) => ["nodes", id] as const,
  nodeVersions: (nodeId: number) => ["nodes", nodeId, "versions"] as const,
  versionDetail: (nodeId: number, versionId: number) =>
    ["nodes", nodeId, "versions", versionId] as const,
  userSettings: () => ["user", "settings"] as const,
  userInfo: () => ["user", "me"] as const,
  systemInfo: () => ["system", "info"] as const,
  historicalProblems: () =>
    ["system", "historical-problems"] as const,
};
