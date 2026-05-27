const JWT_PATTERN = /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g;
const IRAN_PHONE_PATTERN = /\b(?:\+98|0)?9\d{9}\b/g;

export function redactSensitive(value: unknown): string {
  return JSON.stringify(value, null, 2)
    .replace(JWT_PATTERN, "[REDACTED_JWT]")
    .replace(IRAN_PHONE_PATTERN, "[REDACTED_PHONE]");
}
