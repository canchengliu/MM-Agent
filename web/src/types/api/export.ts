// Export job lifecycle DTOs.

import type { ExportStatus, UUID } from './common';

export interface ExportJobTriggered {
  job_id: string;
}

export interface ExportJobStatus {
  job_id: string;
  status: ExportStatus;
  result_artifact_id: UUID | null;
  error: string | null;
}
