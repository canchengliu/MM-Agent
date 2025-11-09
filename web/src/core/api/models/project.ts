// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { AssetRead } from "./asset";
import type { ProjectStatus } from "./enums";

/**
 * Basic information about a project.
 */
export interface ProjectRead {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  active_thread_id: string | null;
  config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Detailed information about a project, including associated assets.
 */
export interface ProjectDetailResponse extends ProjectRead {
  assets: AssetRead[];
}

/**
 * Request body for creating a project from a template.
 */
export interface ProjectCreateTemplateRequest {
  name: string;
  description?: string;
  template_id: string;
  config?: Record<string, unknown>;
}

/**
 * Request body for creating a custom project by linking assets.
 */
export interface ProjectCreateCustomRequest {
  name: string;
  description?: string;
  problem_statement_asset_id: string;
  dataset_asset_ids?: string[];
  config?: Record<string, unknown>;
}

/**
 * Information about an available project template.
 */
export interface ProjectTemplateRead {
  template_id: string;
  name: string;
  description: string;
}

/**
 * Request body for switching the active workflow branch.
 */
export interface SwitchBranchRequest {
  branch_id: string;
}
