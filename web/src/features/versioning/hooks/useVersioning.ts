"use client";

import { useState } from "react";

import type { NodeStateVersion } from "~/core/domain/version.types";

export function useVersioning() {
  const [activeVersion, setActiveVersion] = useState<NodeStateVersion | null>(
    null,
  );

  return {
    activeVersion,
    selectVersion: setActiveVersion,
    versions: [] as NodeStateVersion[],
  };
}
