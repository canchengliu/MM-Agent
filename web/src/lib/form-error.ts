import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import { ApiError } from "~/core/api/ApiClient";

interface ValidationDetail {
  loc?: Array<string | number>;
  msg?: string;
}

const DEFAULT_FIELD_ERROR = "字段填写不正确";
const DEFAULT_ERROR_MESSAGE = "保存失败，请稍后重试。";

function extractValidationDetails(payload: unknown): ValidationDetail[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const detailValue = (payload as { detail?: unknown }).detail;

  if (Array.isArray(detailValue)) {
    return detailValue as ValidationDetail[];
  }

  if (typeof detailValue === "object" && detailValue !== null) {
    return [detailValue as ValidationDetail];
  }

  return [];
}

export function applyServerValidationErrors<TFieldValues extends FieldValues>(
  error: unknown,
  form: UseFormReturn<TFieldValues>,
  fieldMap?: Partial<Record<string, FieldPath<TFieldValues>>>,
): boolean {
  if (!(error instanceof ApiError) || error.status !== 422) {
    return false;
  }

  const details = extractValidationDetails(error.data);
  if (!details.length) {
    return false;
  }

  let applied = false;

  details.forEach((detail) => {
    if (!detail?.loc?.length) {
      return;
    }

    const fieldKey = detail.loc[detail.loc.length - 1];
    if (!fieldKey) {
      return;
    }

    const mappedField =
      fieldMap?.[String(fieldKey)] ?? (String(fieldKey) as FieldPath<TFieldValues>);

    if (mappedField) {
      form.setError(mappedField, {
        message: detail.msg ?? DEFAULT_FIELD_ERROR,
      });
      applied = true;
    }
  });

  return applied;
}

export function resolveApiErrorMessage(error: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
  if (error instanceof ApiError) {
    const payload = error.data;

    if (typeof payload === "string" && payload.trim().length > 0) {
      return payload;
    }

    if (payload && typeof payload === "object") {
      const detail = (payload as { detail?: unknown }).detail;
      if (typeof detail === "string" && detail.trim().length > 0) {
        return detail;
      }

      if (Array.isArray(detail) && detail.length > 0) {
        const message = detail[0]?.msg;
        if (typeof message === "string" && message.trim().length > 0) {
          return message;
        }
      }

      const message = (payload as { message?: unknown }).message;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
