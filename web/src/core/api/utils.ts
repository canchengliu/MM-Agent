import { env } from "~/env";

export function resolveServiceURL(path: string) {
  let baseUrl = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/";
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }
  return new URL(path, baseUrl).toString();
}
