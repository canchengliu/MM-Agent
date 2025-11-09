// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

/**
 * Minimal lodash.get implementation with support for dot paths and JSON Pointer inputs.
 */
export function get(object: any, path: string, defaultValue: any = undefined): any {
  if (!object || typeof object !== "object") {
    return defaultValue;
  }

  const normalizedPath = path.startsWith("/")
    ? path.substring(1).replace(/\//g, ".")
    : path;

  if (!normalizedPath) {
    return object;
  }

  const segments = normalizedPath.split(".");
  let result = object;

  for (const rawKey of segments) {
    const key = rawKey.replace(/~1/g, "/").replace(/~0/g, "~");

    if (result === null || result === undefined || typeof result !== "object") {
      return defaultValue;
    }

    result = result[key];

    if (result === undefined) {
      return defaultValue;
    }
  }

  return result ?? defaultValue;
}
