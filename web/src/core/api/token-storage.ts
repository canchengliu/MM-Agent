// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

const TOKEN_STORAGE_KEY = "mm-agent:auth:access_token";
let inMemoryToken: string | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function setAccessToken(token: string): void {
  inMemoryToken = token;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // ignore storage failures (e.g. private mode)
    }
  }
}

export function getAccessToken(): string | null {
  if (isBrowser()) {
    try {
      const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        inMemoryToken = storedToken;
        return storedToken;
      }
    } catch {
      // ignore storage failures, fall back to memory
    }
  }

  return inMemoryToken;
}

export function clearAccessToken(): void {
  inMemoryToken = null;
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
