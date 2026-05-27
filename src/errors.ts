export type ErrorCode =
  | "AUTH_EXPIRED"
  | "CONFIG_ERROR"
  | "ENDPOINT_NOT_MAPPED"
  | "NO_ADDRESS_SELECTED"
  | "SNAPPFOOD_API_ERROR"
  | "UNEXPECTED_RESPONSE";

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: Record<string, unknown>
  ) {
    super(`${code}: ${message}`);
    this.name = "AppError";
  }
}

export class EndpointNotMappedError extends AppError {
  constructor(operation: string) {
    super(
      "ENDPOINT_NOT_MAPPED",
      `The Snappfood API endpoint for "${operation}" has not been mapped yet. Capture the relevant Snappfood web request as cURL or HAR and add it to src/snappfood/endpoints.ts.`
    );
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError("SNAPPFOOD_API_ERROR", error.message);
  }

  return new AppError("SNAPPFOOD_API_ERROR", String(error));
}
