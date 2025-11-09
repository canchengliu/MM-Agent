// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export type WorkflowOutputType = "markdown" | "image" | "code" | "json" | "unknown";

export interface StepOutputConfig {
  statePath: string;
  label: string;
  type: WorkflowOutputType;
  language?: string;
}

/**
 * Configuration describing the outputs produced by each workflow step.
 * This map must stay aligned with the LangGraph GlobalState definition.
 */
export const WORKFLOW_OUTPUT_MAP: Record<string, StepOutputConfig[]> = {
  // --- Phase 1: Strategic Analysis ---
  P1_1_ProblemAnalysis: [
    {
      statePath: "P1_Outputs.Problem_Restatement",
      label: "Problem Restatement",
      type: "markdown",
    },
    {
      statePath: "P1_Outputs.Global_Assumptions",
      label: "Global Assumptions",
      type: "markdown",
    },
  ],

  // --- Phase 2: Model Development ---
  P2_1_ModelDesign: [
    {
      statePath: "P2_Outputs.Model_Description",
      label: "Model Description",
      type: "markdown",
    },
    // Example of image output (uncomment or customize when available)
    // {
    //   statePath: "P2_Outputs.Model_Diagram_Asset",
    //   label: "Architecture Diagram",
    //   type: "image",
    // },
  ],

  P2_2_Implementation: [
    {
      statePath: "P2_Outputs.Source_Code_Asset",
      label: "Implemented Source Code",
      type: "code",
      language: "python",
    },
  ],

  P2_3_ExecutionAndValidation: [
    {
      statePath: "P2_Outputs.Validation_Report",
      label: "Validation Report",
      type: "markdown",
    },
  ],

  // --- Phase 3: Synthesis and Reporting ---
  P3_2_FinalReport: [
    {
      statePath: "P3_Outputs.Final_Paper_Asset",
      label: "Final Paper Draft",
      type: "markdown",
    },
  ],
};

export const inferOutputType = (mimeType: string | undefined): WorkflowOutputType => {
  if (!mimeType) return "unknown";
  if (mimeType.includes("markdown") || mimeType.includes("text/plain")) return "markdown";
  if (mimeType.includes("image/")) return "image";
  if (mimeType.includes("application/json")) return "json";
  if (
    mimeType.includes("text/x-python") ||
    mimeType.includes("text/csv") ||
    mimeType.includes("javascript")
  ) {
    return "code";
  }
  return "unknown";
};
