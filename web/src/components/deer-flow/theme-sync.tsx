// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import { useSettings } from "~/core/api/hooks/useSettings";

export function ThemeSync() {
  const { data: settings, isLoading, isError } = useSettings();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    if (isLoading || isError) {
      return;
    }

    if (settings?.ui_theme && theme !== settings.ui_theme) {
      setTheme(settings.ui_theme);
    }
  }, [isError, isLoading, setTheme, settings?.ui_theme, theme]);

  return null;
}
