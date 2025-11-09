// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="pb-4 pt-0 space-y-2 flex-grow">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4 mt-auto">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-4 w-16" />
      </CardFooter>
    </Card>
  );
}

