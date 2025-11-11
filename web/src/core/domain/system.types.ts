/**
 * Static metadata returned by the backend system info endpoint.
 * Mirrors API doc 7.3.
 */
export interface SystemInfo {
  app_version: string;
  llm_model_name: string;
}

