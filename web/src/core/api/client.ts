// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { env } from "~/env";

const API_BASE_URL = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_STORAGE_KEY = "cognitive_cockpit_token";

type ValidationErrorDetail = {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
  [key: string]: unknown;
};

type ErrorResponseBody = {
  detail?: string | ValidationErrorDetail[];
  message?: string;
  error_code?: string;
  [key: string]: unknown;
};

const isValidationErrorArray = (
  detail: ErrorResponseBody["detail"],
): detail is ValidationErrorDetail[] => Array.isArray(detail);

/**
 * Standardized error type for API responses.
 * Carries HTTP status, server-provided errorCode, and optional validation details.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public errorCode?: string,
    message?: string,
    public detail?: ValidationErrorDetail[],
  ) {
    super(message ?? "An API error occurred");
    this.name = "ApiError";
  }
}

const isBrowser = typeof window !== "undefined";

export const getToken = (): string | null => {
  if (!isBrowser) return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setToken = (token: string): void => {
  if (!isBrowser) return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearToken = (): void => {
  if (!isBrowser) return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const buildHeaders = (initHeaders: HeadersInit | undefined, body: RequestInit["body"]) => {
  const headers = new Headers(initHeaders ?? {});

  if (!headers.has("Content-Type") && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};

const parseErrorBody = async (response: Response): Promise<ErrorResponseBody> => {
  try {
    return await response.json();
  } catch {
    return { detail: "An unknown error occurred" };
  }
};

export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers = buildHeaders(options.headers, options.body);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);

    if (response.status === 401) {
      console.error("401 Unauthorized. Clearing stored token.");
      clearToken();
    }

    const detailArray = isValidationErrorArray(errorBody.detail)
      ? errorBody.detail
      : undefined;

    let message = "An API error occurred";
    if (typeof errorBody.message === "string") {
      message = errorBody.message;
    } else if (typeof errorBody.detail === "string") {
      message = errorBody.detail;
    } else if (detailArray) {
      message = "Request data validation failed.";
    }

    throw new ApiError(
      response.status,
      errorBody.error_code,
      message,
      detailArray,
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("Content-Type");
  if (contentType?.includes("application/zip")) {
    return (await response.blob()) as unknown as T;
  }

  return response.json();
};

export const authApiClient = {
  login: async (
    username: string,
    password: string,
  ): Promise<{ access_token: string; token_type: "bearer" }> => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await parseErrorBody(response);
      throw new ApiError(
        response.status,
        undefined,
        typeof errorBody.detail === "string"
          ? errorBody.detail
          : "Incorrect email or password.",
      );
    }

    return response.json();
  },
};
