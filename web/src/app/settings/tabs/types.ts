// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { LucideIcon } from "lucide-react";
import type { FunctionComponent } from "react";

import type { SettingsState } from "~/core/store";

type TabComponent = FunctionComponent<{
  settings: SettingsState;
  onChange: (changes: Partial<SettingsState>) => void;
}>;

export type Tab = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  component: TabComponent;
};
