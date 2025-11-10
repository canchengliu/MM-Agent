// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import type { NodeDetailView } from "~/core/domain";

interface InputOutputTabProps {
  node: NodeDetailView;
}

export function InputOutputTab({ node }: InputOutputTabProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <p className="pt-2 text-center text-xs text-muted-foreground">
          Structured I/O view for &quot;{node.name}&quot; will be implemented in
          a future task.
        </p>
      </CardContent>
    </Card>
  );
}
