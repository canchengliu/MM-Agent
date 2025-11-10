// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

type UnauthorizedListener = () => void;

const unauthorizedListeners = new Set<UnauthorizedListener>();

export const subscribeToUnauthorized = (
  listener: UnauthorizedListener,
): (() => void) => {
  unauthorizedListeners.add(listener);

  return () => {
    unauthorizedListeners.delete(listener);
  };
};

export const emitUnauthorized = (): void => {
  unauthorizedListeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error("Unauthorized listener failed", error);
    }
  });
};
