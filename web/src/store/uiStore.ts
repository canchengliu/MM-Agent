// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { create } from "zustand";

export type ViewMode = "EXECUTION" | "HISTORY";
export type InteractionMode = "NORMAL" | "SPLICING";

export interface SplicingSourceContext {
  nodeId: string;
  threadId: string;
  stepIndex: number;
  label: string;
  threadName?: string;
}

export interface SplicingTargetContext {
  nodeId: string;
  threadId: string;
  stepIndex: number;
  label: string;
  threadName?: string;
}

export interface SplicingState {
  source: SplicingSourceContext;
  validTargetIds: string[];
  target?: SplicingTargetContext;
}

export type CompositionAnimationStage = "pending" | "playing";

export interface CompositionAnimationState {
  projectId: string;
  threadId: string;
  queuedAt: number;
  toastMessage?: string;
  source?: SplicingSourceContext;
  target?: SplicingTargetContext;
  stage: CompositionAnimationStage;
}

export interface UiStoreState {
  viewMode: ViewMode;
  interactionMode: InteractionMode;
  splicingState: SplicingState | null;
  compositionAnimation: CompositionAnimationState | null;
  setViewMode: (mode: ViewMode) => void;
  enterSplicingMode: (payload: {
    source: SplicingSourceContext;
    validTargetIds: string[];
  }) => void;
  setSplicingTarget: (target: SplicingTargetContext | null) => void;
  exitSplicingMode: () => void;
  queueCompositionAnimation: (payload: {
    projectId: string;
    threadId: string;
    toastMessage?: string;
    source?: SplicingSourceContext;
    target?: SplicingTargetContext;
  }) => void;
  setCompositionAnimationStage: (stage: CompositionAnimationStage) => void;
  clearCompositionAnimation: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  viewMode: "EXECUTION",
  interactionMode: "NORMAL",
  splicingState: null,
  compositionAnimation: null,
  setViewMode: (mode) => set({ viewMode: mode }),
  enterSplicingMode: ({ source, validTargetIds }) =>
    set({
      interactionMode: "SPLICING",
      splicingState: {
        source,
        validTargetIds,
        target: undefined,
      },
    }),
  setSplicingTarget: (target) =>
    set((state) => {
      if (!state.splicingState) {
        return state;
      }
      return {
        ...state,
        splicingState: target
          ? { ...state.splicingState, target }
          : { ...state.splicingState, target: undefined },
      };
    }),
  exitSplicingMode: () =>
    set({
      interactionMode: "NORMAL",
      splicingState: null,
    }),
  queueCompositionAnimation: ({ projectId, threadId, toastMessage, source, target }) =>
    set({
      compositionAnimation: {
        projectId,
        threadId,
        toastMessage,
        source,
        target,
        queuedAt: Date.now(),
        stage: "pending",
      },
    }),
  setCompositionAnimationStage: (stage) =>
    set((state) => {
      if (!state.compositionAnimation) {
        return state;
      }
      if (state.compositionAnimation.stage === stage) {
        return state;
      }
      return {
        ...state,
        compositionAnimation: {
          ...state.compositionAnimation,
          stage,
        },
      };
    }),
  clearCompositionAnimation: () =>
    set((state) =>
      state.compositionAnimation
        ? { ...state, compositionAnimation: null }
        : state,
    ),
}));
