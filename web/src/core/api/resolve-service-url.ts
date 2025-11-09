// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { env } from "~/env";

export function resolveServiceURL(path: string) {
  let baseUrl = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1/";

  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }

  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return new URL(normalizedPath, baseUrl).toString();
}
