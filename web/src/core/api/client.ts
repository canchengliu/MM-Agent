// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { env } from "~/env";
import { publishUnauthorized } from "~/core/auth/sessionEvents";

const TOKEN_KEY = "auth-token";

/**
 * Stores the authentication token in localStorage.
 * @param token The JWT token received from the server.
 */
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Retrieves the authentication token from localStorage.
 * @returns The stored token or null if not found.
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Removes the authentication token from localStorage.
 */
export function clearToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

// Custom Error class for API errors
export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * A generic API client for making authenticated requests.
 * It automatically adds the Authorization header to every request.
 * @param endpoint The API endpoint to call (e.g., "/users/me").
 * @param options The standard fetch RequestInit options.
 * @returns A promise that resolves with the JSON response.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const apiUrl = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const url = `${apiUrl}${endpoint}`;
  const token = getToken();

  // Create headers and add the Authorization token if it exists.
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set default Content-Type, unless it's a FormData upload
  if (options.body && !(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const response = await fetch(url, { ...options, headers });

  // If the server responds with 401, publish an event to trigger logout.
  if (response.status === 401) {
    publishUnauthorized();
    const errorBody = await response.json().catch(() => ({ detail: "Unauthorized" }));
    throw new ApiError(errorBody.detail || "Authentication failed", 401, errorBody);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: "An unknown error occurred." }));
    throw new ApiError(
      errorBody.detail || `Request failed with status ${response.status}`,
      response.status,
      errorBody,
    );
  }

  // Handle responses with no content (e.g., HTTP 204)
  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return undefined as T;
  }

  // Handle blob responses for file downloads
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/zip") || contentType?.includes("application/octet-stream")) {
    return response.blob() as Promise<T>;
  }

  return response.json() as Promise<T>;
}

/**
 * A specialized client for authentication requests (login)
 * that uses 'application/x-www-form-urlencoded'.
 */
export const authApiClient = {
  login: (
    username: string,
    password: string,
  ): Promise<{ access_token: string; token_type: "bearer" }> => {
    const apiUrl = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    // According to OAuth2 standards, the token endpoint expects form data.
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    return fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }).then(async (res) => {
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(errorBody.detail || `HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  },
};
