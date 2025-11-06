// Project domain DTOs covering metadata and creation flows.

import type { AssetRead } from './asset';
import type { ISO8601String, ProjectStatus, UUID } from './common';

export interface ProjectRead {
  id: UUID;
  name: string;
  description?: string | null;
  user_id: UUID;
  status: ProjectStatus;
  active_thread_id?: string | null;
  config?: Record<string, unknown> | null;
  created_at: ISO8601String;
  updated_at: ISO8601String;
}

export interface ProjectDetailResponse extends ProjectRead {
  assets: AssetRead[];
}

export interface ProjectCreateTemplateRequest {
  name: string;
  description?: string | null;
  template_id: string;
  config?: Record<string, unknown> | null;
}

export interface ProjectCreateCustomRequest {
  name: string;
  description?: string | null;
  problem_statement_asset_id: UUID;
  dataset_asset_ids?: UUID[];
  config?: Record<string, unknown> | null;
}

export interface SwitchBranchRequest {
  branch_id: string;
}
