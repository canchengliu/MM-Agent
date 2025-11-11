import { env } from "~/env";

const TOKEN_STORAGE_KEY = "cognitive_cockpit_token";
const API_BASE_URL = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Structured API error for downstream handling (e.g., React Query mutations).
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Retrieve the persisted auth token if we are in the browser.
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Persist the auth token for future requests.
 */
export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

/**
 * Clear the persisted auth token.
 */
export const clearToken = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

/**
 * Parses the filename from a Content-Disposition header, if present.
 */
function getFilenameFromHeader(headers: Headers): string | null {
  const contentDisposition = headers.get("content-disposition");
  if (!contentDisposition) return null;

  const matches = /filename="([^"]+)"|filename=([^;]+)/.exec(contentDisposition);
  return matches?.[1] ?? matches?.[2] ?? null;
}

/**
 * Centralized fetch wrapper that injects auth headers, normalizes errors,
 * and applies special handling for binary downloads.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      detail: `Request failed with status ${response.status}`,
    }));

    if (response.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.location.reload();
      }
      throw new ApiError(401, "UNAUTHORIZED", "Authentication failed.", errorBody);
    }

    if (response.status === 409 && errorBody?.error_code) {
      throw new ApiError(
        409,
        errorBody.error_code,
        errorBody.message ?? "Conflict error.",
        errorBody,
      );
    }

    if (response.status === 422) {
      const firstError = errorBody?.detail?.[0];
      const message = firstError
        ? `Validation Error: ${firstError.loc?.join(".")} - ${firstError.msg}`
        : "Validation Error.";
      throw new ApiError(
        422,
        errorBody?.error_code ?? "VALIDATION_ERROR",
        message,
        errorBody,
      );
    }

    const fallbackMessage =
      errorBody?.message ?? errorBody?.detail ?? "An unknown API error occurred.";
    throw new ApiError(
      response.status,
      errorBody?.error_code ?? `HTTP_${response.status}`,
      fallbackMessage,
      errorBody,
    );
  }

  const contentType = response.headers.get("content-type");

  if (response.status === 204 || !contentType) {
    return null as T;
  }

  if (contentType.includes("application/zip")) {
    return {
      blob: await response.blob(),
      filename: getFilenameFromHeader(response.headers),
    } as unknown as T;
  }

  return (await response.json()) as T;
}

/**
 * Specialized client for login flows that require form-encoded payloads.
 */
export const authApiClient = {
  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string; token_type: string }> {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({
        detail: "Login failed.",
      }));
      throw new ApiError(
        response.status,
        `HTTP_${response.status}`,
        errorBody?.detail ?? "Login failed.",
        errorBody,
      );
    }

    return (await response.json()) as { access_token: string; token_type: string };
  },
};
