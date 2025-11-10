// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { ReactNode } from "react";

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

/**
 * Displays a label/value pair within inspector cards.
 */
export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}
