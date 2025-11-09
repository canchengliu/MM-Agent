// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

import { Card, CardContent } from "~/components/ui/card";

import { CustomProjectForm } from "./custom-project-form";
import { ProjectTypeSelector } from "./project-type-selector";
import { TemplateProjectForm } from "./template-project-form";

type ProjectMode = "custom" | "template" | null;

enum WizardStep {
  SELECT_TYPE = 0,
  CONFIGURE = 1,
}

/**
 * Manages the multi-step project creation flow.
 */
export function CreateProjectWizard() {
  const [currentStep, setCurrentStep] = React.useState(WizardStep.SELECT_TYPE);
  const [selectedMode, setSelectedMode] = React.useState<ProjectMode>(null);
  const [direction, setDirection] = React.useState(1);

  const handleModeSelect = (mode: ProjectMode) => {
    if (!mode) {
      return;
    }
    setSelectedMode(mode);
    setDirection(1);
    setCurrentStep(WizardStep.CONFIGURE);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(WizardStep.SELECT_TYPE);
  };

  const renderStep = () => {
    switch (currentStep) {
      case WizardStep.SELECT_TYPE:
        return (
          <ProjectTypeSelector onSelect={handleModeSelect} initialSelection={selectedMode} />
        );
      case WizardStep.CONFIGURE:
        if (selectedMode === "custom") {
          return <CustomProjectForm onBack={handleBack} />;
        }
        if (selectedMode === "template") {
          return <TemplateProjectForm onBack={handleBack} />;
        }
        return (
          <div className="text-center text-sm text-destructive">
            未选择有效的模式，请返回重新选择。
          </div>
        );
      default:
        return null;
    }
  };

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      zIndex: 0,
      x: d < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="relative min-h-[500px] p-8">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
