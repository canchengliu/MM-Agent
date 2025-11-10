"use client";

import { useLocale } from "next-intl";

import { Markdown } from "~/components/deer-flow/markdown";

import aboutEn from "./about-en.md";
import aboutZh from "./about-zh.md";

export function AboutTab() {
  const locale = useLocale();
  return (
    <div className="prose dark:prose-invert max-w-none">
      <Markdown>{locale === "zh" ? aboutZh : aboutEn}</Markdown>
    </div>
  );
}
