import { env } from "~/env";

export function resolveServiceURL(path: string) {
  let base = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/";
  if (!base.endsWith("/")) {
    base += "/";
  }
  return new URL(path, base).toString();
}
