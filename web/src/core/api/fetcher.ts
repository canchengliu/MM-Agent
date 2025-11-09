// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { toast } from "sonner";

import type { ErrorResponse } from "./models/common";
import { getAccessToken } from "./token-storage";
import { resolveServiceURL } from "./resolve-service-url";

interface FetcherOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  isFormUrlEncoded?: boolean;
  isMultipart?: boolean;
  rawResponse?: boolean;
  signal?: AbortSignal;
  suppress401Toast?: boolean; // Option to suppress 401 Unauthorized toasts
}

export async function fetcher<T>(
  path: string,
  options: FetcherOptions = {},
): Promise<T> {
  const url = resolveServiceURL(path);
  const { method = "GET", body, signal, suppress401Toast } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  const token = getAccessToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | null = null;

  if (body !== undefined && body !== null) {
    if (options.isMultipart) {
      requestBody = body as FormData;
    } else if (options.isFormUrlEncoded) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      requestBody = new URLSearchParams(body as Record<string, string>).toString();
    } else {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: requestBody,
      signal,
      credentials: "include",
    });

    if (response.ok) {
      if (response.status === 204) {
        return null as T;
      }

      if (options.rawResponse) {
        return response as unknown as T;
      }

      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      try {
        return JSON.parse(text) as T;
      } catch (parseError) {
        console.error("Failed to parse JSON response:", text, parseError);
        throw new Error("Invalid JSON response from server.");
      }
    }

    await handleErrorResponse(response, suppress401Toast);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw error;
      }

      if (!(error as { isHandled?: boolean }).isHandled) {
        console.error("API fetcher network error:", error);
        toast.error("Network or Configuration Error", {
          description:
            error.message || "Unable to connect to the server. Check network and API URL.",
        });
      }
    }

    throw error;
  }

  throw new Error("Unexpected error in fetcher");
}

async function handleErrorResponse(
  response: Response,
  suppress401Toast = false,
): Promise<never> {
  let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
  let errorDetails = "";
  let validationErrors: ErrorResponse["validation_details"] | null = null;

  try {
    const contentType = response.headers.get("Content-Type");
    if (contentType?.includes("application/json")) {
      const errorData: ErrorResponse = await response.json();

      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }

      if (errorData.error_code) {
        errorDetails = `Code: ${errorData.error_code}`;
      }

      if (errorData.validation_details?.length) {
        validationErrors = errorData.validation_details;
        errorDetails =
          errorData.validation_details[0]?.msg ?? "Please check the input fields.";
      }
    } else {
      const text = await response.text();
      errorDetails = text.substring(0, 200) || "No details provided.";
    }
  } catch {
    errorDetails = "Could not parse error details.";
  }

  switch (response.status) {
    case 401:
      if (!suppress401Toast) {
        toast.error("Unauthorized", {
          description: "Session expired or invalid. Please log in.",
        });
      }
      break;
    case 403:
      toast.error("Forbidden", {
        description: errorMessage || "You do not have permission for this action.",
      });
      break;
    case 404:
      toast.error("Not Found", { description: errorMessage });
      break;
    case 409:
      toast.error("Conflict", {
        description: errorMessage || "Resource already exists or state conflict.",
      });
      break;
    case 412:
      toast.error("State Mismatch", {
        description: errorMessage || "The resource state has changed. Please refresh.",
      });
      break;
    default:
      if (response.status >= 500) {
        toast.error("Server Error", { description: errorMessage });
      } else {
        toast.error(errorMessage, { description: errorDetails });
      }
  }

  const apiError = new Error(errorMessage);
  (apiError as { status?: number }).status = response.status;
  (apiError as { details?: string }).details = errorDetails;
  (apiError as { validationErrors?: typeof validationErrors }).validationErrors =
    validationErrors;
  (apiError as { isHandled?: boolean }).isHandled = true;

  throw apiError;
}
