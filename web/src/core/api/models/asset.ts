// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { ArtifactType } from "./enums";

/**
 * Represents an Asset (Artifact) metadata.
 */
export interface AssetRead {
  id: string;
  name: string;
  type: ArtifactType;
  mime_type: string;
  file_size: number;
  project_id: string | null;
  source_snapshot_id?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request body for updating asset content.
 */
export interface AssetContentUpdate {
  content: string;
  state_update_path?: string;
  content_type?: string;
}
