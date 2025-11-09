// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

/**
 * Represents the lifecycle status of a Project.
 */
export enum ProjectStatus {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

/**
 * Classifies the type of an Artifact (Asset).
 */
export enum ArtifactType {
  PROBLEM_STATEMENT = "PROBLEM_STATEMENT",
  DATASET = "DATASET",
  REPORT_DRAFT = "REPORT_DRAFT",
  FIGURE = "FIGURE",
  TABLE_DATA = "TABLE_DATA",
  SOURCE_CODE = "SOURCE_CODE",
  INTERMEDIATE_RESULT = "INTERMEDIATE_RESULT",
  EXPORT_PACKAGE = "EXPORT_PACKAGE",
}

/**
 * Describes how a StateSnapshot was created.
 */
export enum SnapshotCreationMethod {
  INITIAL = "INITIAL",
  EXECUTED = "EXECUTED",
  GRAFTED = "GRAFTED",
  RESUMED = "RESUMED",
}

/**
 * Status used for visualization in the history graph.
 */
export type ProvenanceStatus = SnapshotCreationMethod | "INTERRUPTED" | "ERROR";

/**
 * Defines the mode of Human-in-the-Loop (HITL) interaction required.
 */
export enum HITLMode {
  VARL = "VARL",
  SCA = "SCA",
  AVL = "AVL",
  BYPASS = "BYPASS",
}

/**
 * Represents the status of a specific HITL interaction record.
 */
export enum HITLStatus {
  PENDING_REVIEW = "PENDING_REVIEW",
  COMPLETED = "COMPLETED",
}
