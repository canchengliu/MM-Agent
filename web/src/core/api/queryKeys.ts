// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

// Placeholder for centralized TanStack Query keys.
export const QueryKeys = {
  userSettings: () => ["user", "settings"] as const,
  userInfo: () => ["user", "me"] as const,
  systemInfo: () => ["system", "info"] as const,

  // Project-related keys
  projects: () => ["projects"] as const,
  projectDetail: (projectId: number | null) =>
    ["projects", "detail", projectId ?? "unknown"] as const,
  historicalProblems: () =>
    ["projects", "historical-problems"] as const,

  // Workspace-related keys
  workflow: (workflowId: number | null) => ["workflows", workflowId] as const,
  staleness: (workflowId: number | null) =>
    ["workflows", workflowId, "staleness"] as const,
  node: (nodeId: number | null) => ["nodes", nodeId] as const,
  nodeVersions: (nodeId: number | null) =>
    ["nodes", nodeId, "versions"] as const,
  versionDetail: (nodeId: number | null, versionId: number | null) =>
    ["nodes", nodeId, "versions", versionId] as const,
} as const;
