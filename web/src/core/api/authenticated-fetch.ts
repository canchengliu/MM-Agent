// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { getAccessToken } from "./token-storage";
import { resolveServiceURL } from "./resolve-service-url";

const isAbsoluteUrl = (url: string) => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const authenticatedFetch = async (
  pathOrUrl: string,
  options: RequestInit = {},
): Promise<Response> => {
  const url = isAbsoluteUrl(pathOrUrl) ? pathOrUrl : resolveServiceURL(pathOrUrl);
  const headers = new Headers(options.headers);
  const token = getAccessToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: options.credentials ?? "include",
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const contentType = response.headers.get("Content-Type");
        if (contentType?.includes("application/json")) {
          const body = await response.json();
          if (body.message) {
            errorMessage = body.message;
          } else if (body.detail) {
            errorMessage = body.detail;
          }
        } else {
          const text = await response.text();
          if (text) {
            errorMessage = text;
          }
        }
      } catch {
        // ignore parsing failures
      }

      const error = new Error(errorMessage);
      (error as { status?: number }).status = response.status;
      throw error;
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unknown network error");
  }
};
