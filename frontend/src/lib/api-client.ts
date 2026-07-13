/**
 * PactFlow — API Client
 * Base HTTP client for all backend communication.
 * Uses fetch with automatic JWT injection, error handling, and retry logic.
 * No business logic here — only transport concerns.
 */
import type { ApiError } from "@/types/domain";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ── Custom Error Class ──
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly apiError: ApiError;

  constructor(status: number, apiError: ApiError) {
    super(apiError.detail ?? apiError.title);
    this.name = "ApiClientError";
    this.status = status;
    this.apiError = apiError;
  }

  get isUnauthorized() { return this.status === 401; }
  get isForbidden() { return this.status === 403; }
  get isNotFound() { return this.status === 404; }
  get isConflict() { return this.status === 409; }
  get isValidationError() { return this.status === 422; }
  get isServerError() { return this.status >= 500; }
}

// ── Request Options ──
interface RequestOptions extends RequestInit {
  /** Override base URL */
  baseUrl?: string;
  /** Idempotency key for safe retry of mutations */
  idempotencyKey?: string;
  /** Skip authentication header */
  skipAuth?: boolean;
}

// ── Token Storage (in-memory — no localStorage for security) ──
let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ── Core Fetch Wrapper ──
async function fetchApi<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    baseUrl = API_BASE_URL,
    idempotencyKey,
    skipAuth = false,
    headers: customHeaders,
    ...rest
  } = options;

  const url = `${baseUrl}${path}`;

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth && _accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  const response = await fetch(url, {
    headers,
    credentials: "include", // Send httpOnly refresh token cookie
    ...rest,
  });

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      data ?? {
        type: "https://pactflow.io/errors/unknown",
        title: "Unknown Error",
        status: response.status,
        detail: "An unexpected error occurred.",
        instance: path,
        timestamp: new Date().toISOString(),
        traceId: "unknown",
      }
    );
  }

  return data as T;
}

// ── Convenience Methods ──
export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    fetchApi<T>(path, { method: "GET", ...options }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    fetchApi<T>(path, {
      method: "POST",
      body: body != null ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    fetchApi<T>(path, {
      method: "PUT",
      body: body != null ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    fetchApi<T>(path, {
      method: "PATCH",
      body: body != null ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    fetchApi<T>(path, { method: "DELETE", ...options }),
};
