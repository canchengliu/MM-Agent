// Asset metadata and update payload DTOs.

import type { AssetType, ISO8601String, UUID } from './common';

export interface AssetRead {
  id: UUID;
  name: string;
  type: AssetType;
  mime_type: string;
  file_size: number;
  project_id: UUID | null;
  user_id: UUID;
  created_at: ISO8601String;
  updated_at: ISO8601String;
}

export interface AssetContentUpdate {
  content: string;
  state_update_path?: string;
  content_type?: string;
}
