import { useAuthStore } from "../store/AuthStore";

import { resolveServiceURL } from "./utils";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ApiRequestData = BodyInit | FormData | URLSearchParams | object | undefined;

const JSON_CONTENT_TYPE = "application/json";
const FORM_URL_ENCODED = "application/x-www-form-urlencoded";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: unknown,
    message?: string,
  ) {
    super(message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
  }
}

interface PreparedBody {
  body?: BodyInit;
  hint?: "json" | "form-data" | "urlencoded";
}

function isReadableStream(value: unknown): value is ReadableStream {
  return typeof ReadableStream !== "undefined" && value instanceof ReadableStream;
}

function prepareBody(data: ApiRequestData): PreparedBody {
  if (data === undefined || data === null) {
    return { body: undefined };
  }

  if (data instanceof FormData) {
    return { body: data, hint: "form-data" };
  }

  if (data instanceof URLSearchParams) {
    return { body: data, hint: "urlencoded" };
  }

  if (
    typeof data === "string" ||
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    ArrayBuffer.isView(data) ||
    isReadableStream(data)
  ) {
    return { body: data as BodyInit };
  }

  if (typeof data === "object") {
    return { body: JSON.stringify(data), hint: "json" };
  }

  return { body: data as BodyInit };
}

function applyContentType(headers: Headers, hint?: PreparedBody["hint"]) {
  if (hint === "json" && !headers.has("Content-Type")) {
    headers.set("Content-Type", JSON_CONTENT_TYPE);
  } else if (hint === "urlencoded" && !headers.has("Content-Type")) {
    headers.set("Content-Type", FORM_URL_ENCODED);
  } else if (hint === "form-data") {
    headers.delete("Content-Type");
  }
}

async function parseErrorPayload(response: Response) {
  try {
    return await response.clone().json();
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  if (contentType.startsWith("text/") || contentType.includes("application/x-www-form-urlencoded")) {
    return (await response.text()) as T;
  }

  return (await response.blob()) as T;
}

async function baseRequest<T>(
  method: HttpMethod,
  endpoint: string,
  data?: ApiRequestData,
  options: RequestInit = {},
): Promise<T> {
  const url = resolveServiceURL(endpoint);
  const { headers: optionHeaders, body: optionBody, ...rest } = options;
  const headers = new Headers(optionHeaders);

  const token = useAuthStore.getState().token;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasExplicitBody = data !== undefined;
  const prepared = prepareBody(data);
  if (hasExplicitBody) {
    applyContentType(headers, prepared.hint);
  }

  const requestConfig: RequestInit = {
    ...rest,
    method,
    headers,
    body: hasExplicitBody ? prepared.body : optionBody,
  };

  const response = await fetch(url, requestConfig);

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }
    const payload = await parseErrorPayload(response);
    throw new ApiError(response.status, payload);
  }

  return parseResponse<T>(response);
}

export const apiClient = {
  request: baseRequest,

  get<T>(endpoint: string, options?: RequestInit) {
    return baseRequest<T>("GET", endpoint, undefined, options);
  },

  post<T>(endpoint: string, data?: ApiRequestData, options?: RequestInit) {
    return baseRequest<T>("POST", endpoint, data, options);
  },

  put<T>(endpoint: string, data?: ApiRequestData, options?: RequestInit) {
    return baseRequest<T>("PUT", endpoint, data, options);
  },

  patch<T>(endpoint: string, data?: ApiRequestData, options?: RequestInit) {
    return baseRequest<T>("PATCH", endpoint, data, options);
  },

  delete<T>(endpoint: string, options?: RequestInit) {
    return baseRequest<T>("DELETE", endpoint, undefined, options);
  },
};
