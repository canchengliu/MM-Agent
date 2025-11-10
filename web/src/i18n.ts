// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { env } from "~/env";
import { defaultLocale, locales, type Locale } from "./i18n-config";

export default getRequestConfig(async ({ locale: requestLocale }) => {
  // Get locale from cookie
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value as Locale | undefined;

  const normalizedLocale =
    (requestLocale && locales.includes(requestLocale as Locale)
      ? (requestLocale as Locale)
      : undefined) ??
    cookieLocale ??
    defaultLocale;

  return {
    messages: (await import(`../messages/${normalizedLocale}.json`)).default,
    locale: normalizedLocale,
    timeZone: env.DEFAULT_TIME_ZONE ?? "UTC",
  };
});

export { locales, defaultLocale };
