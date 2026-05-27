import { normalizeError } from "../errors.js";

export function jsonResult<T>(data: T) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2)
      }
    ],
    structuredContent: data
  };
}

export function markdownResult<T>(text: string, data: T) {
  return {
    content: [
      {
        type: "text" as const,
        text
      }
    ],
    structuredContent: data
  };
}

export function errorResult(error: unknown) {
  const normalized = normalizeError(error);
  const data = {
    ok: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      details: normalized.details ?? {}
    }
  };

  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: normalized.message
      }
    ],
    structuredContent: data
  };
}
