// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { resolveServiceURL } from "~/core/api/resolve-service-url";
import { useUiStore } from "~/store/uiStore";
import { useWorkspaceStore } from "~/store/workspaceStore";
import type {
  CompatibilityErrorBody,
  ExecutionHistoryGraphResponse,
  HistoryComposeRequest,
  HistoryComposeSegment,
  HistoryOperationResponse,
  HistoryNode,
} from "~/types/api/history";

interface UseComposeHistoryMutationArgs {
  projectId?: string | null;
  autoStart?: boolean;
}

class ComposeHistoryError extends Error {
  code?: string;
  status?: number;
  errorId?: string;
  detail?: unknown;

  constructor(message: string, options?: Partial<ComposeHistoryError>) {
    super(message);
    this.name = "ComposeHistoryError";
    if (options?.code) this.code = options.code;
    if (options?.status) this.status = options.status;
    if (options?.errorId) this.errorId = options.errorId;
    if (options?.detail) this.detail = options.detail;
  }
}

function ensureSortedUnique(values: number[]) {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function resolveThreadId(node: HistoryNode) {
  const directThreadId = node.data?.thread_id;
  if (typeof directThreadId === "string" && directThreadId.trim().length > 0) {
    return directThreadId.trim();
  }

  const rawMetadata = node.data?.raw_metadata;
  if (rawMetadata && isPlainObject(rawMetadata)) {
    const rawThreadId =
      typeof rawMetadata.thread_id === "string"
        ? rawMetadata.thread_id
        : typeof rawMetadata.threadId === "string"
          ? rawMetadata.threadId
          : undefined;

    if (typeof rawThreadId === "string" && rawThreadId.trim().length > 0) {
      return rawThreadId.trim();
    }
  }

  return undefined;
}

function collectThreadSteps(
  nodes: HistoryNode[],
  threadId: string,
  predicate: (stepIndex: number) => boolean,
) {
  const steps = nodes
    .filter((node) => resolveThreadId(node) === threadId)
    .map((node) => node.data?.step_index)
    .filter((stepIndex): stepIndex is number => Number.isFinite(stepIndex))
    .filter(predicate);

  return ensureSortedUnique(steps);
}

function findHistoryGraph(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  threadId: string,
): ExecutionHistoryGraphResponse | undefined {
  const potentialKeys = [
    ["historyGraph", projectId, threadId],
    ["historyGraph", projectId, "active"],
    ["historyGraph", projectId],
  ];

  for (const queryKey of potentialKeys) {
    const cached = queryClient.getQueryData<ExecutionHistoryGraphResponse>(queryKey);
    if (cached) {
      return cached;
    }
  }

  return undefined;
}

function buildCompositionPlan(args: {
  graph: ExecutionHistoryGraphResponse;
  sourceThreadId: string;
  sourceStepIndex: number;
  targetThreadId: string;
  targetStepIndex: number;
}): HistoryComposeSegment[] {
  const { graph, sourceThreadId, sourceStepIndex, targetThreadId, targetStepIndex } =
    args;

  const sourceSteps = collectThreadSteps(
    graph.nodes ?? [],
    sourceThreadId,
    (step) => step <= sourceStepIndex,
  );

  if (!sourceSteps.includes(sourceStepIndex)) {
    sourceSteps.push(sourceStepIndex);
  }

  const targetSteps = collectThreadSteps(
    graph.nodes ?? [],
    targetThreadId,
    (step) => step >= targetStepIndex,
  );

  if (!targetSteps.includes(targetStepIndex)) {
    targetSteps.push(targetStepIndex);
  }

  const plan: HistoryComposeSegment[] = [];

  if (sourceSteps.length > 0) {
    plan.push({
      source_thread_id: sourceThreadId,
      superstep_indices: ensureSortedUnique(sourceSteps),
    });
  }

  if (targetSteps.length > 0) {
    plan.push({
      source_thread_id: targetThreadId,
      superstep_indices: ensureSortedUnique(targetSteps),
    });
  }

  if (plan.length === 0) {
    throw new ComposeHistoryError("Unable to derive composition plan.", {
      code: "INVALID_COMPOSITION",
    });
  }

  return plan;
}

async function parseJsonSafely<T>(response: Response): Promise<T | undefined> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
}

function isCompatibilityDetail(
  value: unknown,
): value is NonNullable<CompatibilityErrorBody["detail"]> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatCompatibilityToast(error: ComposeHistoryError) {
  const detail = isCompatibilityDetail(error.detail) ? error.detail : undefined;
  const reason =
    (typeof detail?.reason === "string" && detail.reason.trim().length > 0
      ? detail.reason
      : undefined) ?? error.message;
  const actionLines = [
    "1. Continue executing the next compatible step on the current branch.",
    "2. Choose a different target checkpoint with matching inputs.",
  ];
  const lines = [
    "拼接失败：状态不兼容 (What)",
    `原因：${reason} (Why)`,
    `建议：\n${actionLines.join("\n")} (Action)`,
  ];
  const detailErrorId =
    (detail && typeof detail.error_id === "string" && detail.error_id.trim().length > 0
      ? detail.error_id
      : undefined) ?? error.errorId;
  if (detailErrorId) {
    lines.push(`错误ID: ${detailErrorId}`);
  }
  return lines.join("\n\n");
}

function resolveErrorMessage(error: unknown): string {
  if (
    error instanceof Error &&
    typeof error.message === "string" &&
    error.message.trim().length > 0
  ) {
    return error.message;
  }
  return "未知错误";
}

export function useComposeHistoryMutation({
  projectId,
  autoStart = true,
}: UseComposeHistoryMutationArgs = {}) {
  const queryClient = useQueryClient();
  const { splicingState, exitSplicingMode, queueCompositionAnimation } = useUiStore((state) => ({
    splicingState: state.splicingState,
    exitSplicingMode: state.exitSplicingMode,
    queueCompositionAnimation: state.queueCompositionAnimation,
  }));
  const setActiveBranch = useWorkspaceStore((state) => state.setActiveBranch);

  return useMutation({
    mutationFn: async () => {
      if (!projectId) {
        throw new ComposeHistoryError("Project ID is required.", {
          code: "INVALID_STATE",
        });
      }

      if (!splicingState) {
        throw new ComposeHistoryError("Splicing context is missing.", {
          code: "INVALID_STATE",
        });
      }

      if (!splicingState.target) {
        throw new ComposeHistoryError("Splicing target is not selected.", {
          code: "INVALID_STATE",
        });
      }

      const { source, target } = splicingState;
      const graph = findHistoryGraph(queryClient, projectId, source.threadId);

      if (!graph) {
        throw new ComposeHistoryError("History graph data is unavailable.", {
          code: "CACHE_MISS",
        });
      }

      const plan = buildCompositionPlan({
        graph,
        sourceThreadId: source.threadId,
        sourceStepIndex: source.stepIndex,
        targetThreadId: target.threadId,
        targetStepIndex: target.stepIndex,
      });

      const requestBody: HistoryComposeRequest = {
        composition_plan: plan,
        auto_start: autoStart,
      };

      const response = await fetch(
        resolveServiceURL(`v1/projects/${projectId}/history/compose`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const payload = await parseJsonSafely<CompatibilityErrorBody>(response);

        if (
          response.status === 400 &&
          payload?.error_code === "COMPATIBILITY_ERROR"
        ) {
          throw new ComposeHistoryError(
            payload.message || "History composition failed.",
            {
              code: payload.error_code,
              status: response.status,
              errorId: payload.detail?.error_id,
              detail: payload.detail,
            },
          );
        }

        throw new ComposeHistoryError(response.statusText || "Request failed.", {
          status: response.status,
          detail: payload,
        });
      }

      const result = await parseJsonSafely<HistoryOperationResponse>(response);

      if (!result) {
        throw new ComposeHistoryError(
          "Server returned an empty payload for history composition.",
          { code: "EMPTY_RESPONSE" },
        );
      }

      return result;
    },
    onSuccess: async (data) => {
      if (projectId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["historyGraph", projectId] }),
          queryClient.invalidateQueries({
            queryKey: ["historyGraph", projectId, "active"],
          }),
          queryClient.invalidateQueries({ queryKey: ["runState", projectId] }),
        ]);
      }

      const threadId = data.thread_id;
      const successMessage =
        data.message || "结果拼接成功。一条新的混合轨迹已生成。";

      if (threadId) {
        setActiveBranch({ branchId: threadId, branchName: null });
      }

      if (splicingState && threadId && projectId) {
        queueCompositionAnimation({
          projectId,
          threadId,
          toastMessage: successMessage,
          source: splicingState.source,
          target: splicingState.target,
        });
      } else {
        toast.success(successMessage);
      }
    },
    onError: (error) => {
      if (error instanceof ComposeHistoryError) {
        if (error.code === "COMPATIBILITY_ERROR") {
          toast.error(formatCompatibilityToast(error));
          return;
        }

        toast.error(
          [
            "无法完成拼接操作。",
            `原因：${error.message}`,
            "建议：请稍后重试，或刷新历史图谱后再次尝试。",
          ].join("\n\n"),
        );
        return;
      }

      toast.error(
        [
          "无法完成拼接操作。",
          `原因：${resolveErrorMessage(error)}`,
          "建议：检查网络连接或稍后重试。",
        ].join("\n\n"),
      );
    },
    onSettled: () => {
      exitSplicingMode();
    },
  });
}
