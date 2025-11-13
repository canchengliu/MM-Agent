import { env } from "~/env.js";

/**
 * Resolves the full URL for a given API service path.
 * Uses the NEXT_PUBLIC_API_BASE_URL environment variable to construct the full URL.
 * 
 * When used with Axios baseURL:
 * - If path is empty, returns the base URL without trailing slash (for Axios baseURL)
 * - If path is provided, constructs the full URL (for non-Axios use cases)
 * 
 * Note: Axios requires baseURL without trailing slash when using paths with leading slash.
 * Example: baseURL="http://localhost:8000/api/v1", path="/users/me" -> "http://localhost:8000/api/v1/users/me"
 */
export function resolveServiceURL(path: string): string {
  const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
  
  // If path is empty, return the base URL without trailing slash (for Axios baseURL)
  // This ensures Axios correctly concatenates paths like "/users/me"
  if (!path) {
    return baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  }
  
  // For non-empty paths, construct the full URL
  // This is used in non-Axios contexts (e.g., WebSocket URLs, fetch calls)
  const base = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${base}${cleanPath}`;
}
