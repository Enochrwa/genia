export interface ApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  getAccessToken?: () => string | undefined;
  newId?: () => string;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Required for POSTs that move money or start games. */
  idempotencyKey?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function createApiClient(opts: ApiClientOptions) {
  const doFetch = opts.fetchImpl ?? fetch;
  const newId = opts.newId ?? (() => crypto.randomUUID());

  async function request<T>(path: string, ro: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Request-Id": newId(),
    };
    const token = opts.getAccessToken?.();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (ro.idempotencyKey) headers["Idempotency-Key"] = ro.idempotencyKey;

    const res = await doFetch(`${opts.baseUrl}/v1${path}`, {
      method: ro.method ?? "GET",
      headers,
      body: ro.body === undefined ? undefined : JSON.stringify(ro.body),
    });

    if (!res.ok) {
      let code = "UNKNOWN";
      let message = res.statusText;
      let requestId: string | undefined;
      try {
        const j = (await res.json()) as {
          error?: { code: string; message: string; requestId: string };
        };
        if (j.error) ({ code, message, requestId } = j.error);
      } catch {
        /* non-JSON error body */
      }
      throw new ApiError(res.status, code, message, requestId);
    }
    return (await res.json()) as T;
  }

  return {
    request,
    startGame: (entryLevel: number, category: string, idempotencyKey: string) =>
      request("/games", { method: "POST", body: { entryLevel, category }, idempotencyKey }),
    submitAnswer: (gameId: string, questionId: string, optionId: string) =>
      request(`/games/${gameId}/answers`, { method: "POST", body: { questionId, optionId } }),
    requestWithdrawal: (amount: number, currency: string, idempotencyKey: string) =>
      request("/wallet/withdrawals", {
        method: "POST",
        body: { amount, currency },
        idempotencyKey,
      }),
  };
}
