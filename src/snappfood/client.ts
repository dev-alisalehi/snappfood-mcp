import type { Config } from "../config.js";
import { AppError } from "../errors.js";
import { redactSensitive } from "../utils/redact.js";

interface RequestOptions {
  method?: "GET" | "POST";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export class SnappfoodClient {
  constructor(private readonly config: Config) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path, this.config.baseUrl);

    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    if (this.config.debug) {
      console.error(`snappfood-mcp request: ${options.method ?? "GET"} ${url.toString()}`);
    }

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.config.jwt}`,
        "Content-Type": "application/json",
        "User-Agent": "snappfood-mcp/0.1.0",
        "X-Is-Bonyan": "true"
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    if (response.status === 401 || response.status === 403) {
      throw new AppError(
        "AUTH_EXPIRED",
        "Your Snappfood JWT is invalid or expired. Log in again and update SNAPPFOOD_JWT in your MCP config."
      );
    }

    const text = await response.text();

    if (!response.ok) {
      throw new AppError("SNAPPFOOD_API_ERROR", `Snappfood API returned HTTP ${response.status}.`, {
        status: response.status,
        body: this.config.debug ? redactSensitive(text) : undefined
      });
    }

    if (!text) {
      return undefined as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new AppError("UNEXPECTED_RESPONSE", "Snappfood API returned a non-JSON response.", {
        body: this.config.debug ? redactSensitive(text) : undefined
      });
    }
  }
}
