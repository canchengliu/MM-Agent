import { env } from "~/env.js";

export function resolveWebSocketURL(path: string): string {
  const basePath = path.startsWith("/") ? path : `/${path}`;

  if (env.NEXT_PUBLIC_WS_URL) {
    const baseUrl = env.NEXT_PUBLIC_WS_URL.endsWith("/")
      ? env.NEXT_PUBLIC_WS_URL.slice(0, -1)
      : env.NEXT_PUBLIC_WS_URL;
    return `${baseUrl}${basePath}`;
  }

  const apiBaseUrl = env.NEXT_PUBLIC_API_BASE_URL;

  try {
    const absoluteApiBaseUrl =
      typeof window !== "undefined" && apiBaseUrl.startsWith("/")
        ? window.location.origin + apiBaseUrl
        : apiBaseUrl;

    const url = new URL(absoluteApiBaseUrl);
    const protocol = url.protocol === "https:" ? "wss:" : "ws:";

    return `${protocol}//${url.host}${basePath}`;
  } catch (error) {
    console.error(
      `Error deriving WebSocket URL from API_BASE_URL (${apiBaseUrl}). Falling back.`,
      error,
    );

    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${window.location.host}${basePath}`;
    }

    console.error(
      "Could not determine WebSocket URL. Please check environment configuration.",
    );
    throw new Error("WebSocket configuration invalid.");
  }
}
