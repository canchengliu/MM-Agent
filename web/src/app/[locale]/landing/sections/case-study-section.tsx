// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  BarChart,
  Bot,
  LineChart,
  Network,
  Plane,
  Sigma,
  Target,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { BentoCard } from "~/components/magicui/bento-grid";

import { SectionHeader } from "../components/section-header";

const caseStudyIcons = [
  { id: "operations-research-logistics", icon: Network },
  { id: "epidemic-modeling-sir", icon: BarChart },
  { id: "financial-portfolio-optimization", icon: LineChart },
  { id: "game-theory-pricing-strategy", icon: Target },
  { id: "aerospace-trajectory-optimization", icon: Plane },
  { id: "machine-learning-model-selection", icon: Bot },
  { id: "differential-equations-predator-prey", icon: Sigma },
];

export function CaseStudySection() {
  const t = useTranslations("landing.caseStudies");
  const cases = t.raw("cases") as Array<{ title: string; description: string }>;

  return (
    <section className="relative container hidden flex-col items-center justify-center md:flex">
      <SectionHeader
        anchor="case-studies"
        title={t("title")}
        description={t("description")}
      />
      <div className="grid w-3/4 grid-cols-1 gap-2 sm:w-full sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cases.map((caseStudy, index) => {
          const iconData = caseStudyIcons[index];
          if (!iconData) return null;
          return (
            <div key={caseStudy.title} className="w-full p-2">
              <BentoCard
                {...{
                  Icon: iconData.icon,
                  name: caseStudy.title,
                  description: caseStudy.description,
                  href: `/chat?replay=${iconData.id}`,
                  cta: t("clickToWatch"),
                  className: "w-full h-full",
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
