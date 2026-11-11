// Server-only Lovable AI Gateway helpers. Never import from browser code.
import { createOpenAI } from "@ai-sdk/openai";
import { APICallError } from "ai";

export const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev";
export const CHAT_MODEL = "openai/gpt-6-astra";
export const TRANSCRIBE_MODEL = "openai/gpt-transcribe";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  return {
    getRunId: () => runId,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      const response = await fetch(input, { ...init, headers });
      runId ??= response.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
      return response;
    },
  };
}

/** Throws `ai_not_configured` instead of inventing output when the key is missing. */
export function requireAiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("ai_not_configured");
  return key;
}

export function createGatewayProvider(apiKey: string) {
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  return createOpenAI({
    baseURL: `${AI_GATEWAY_URL}/v1`,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
}

/** Responses options required on every call (see AI gateway contract). */
export const RESPONSES_OPTIONS = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

/** Maps gateway HTTP failures onto app error codes. */
export function mapGatewayStatus(status: number | undefined): string {
  if (status === 401) return "ai_not_configured";
  if (status === 402 || status === 403) return "ai_credits_exhausted";
  if (status === 429) return "ai_rate_limited";
  return "ai_unavailable";
}

export function toAiError(error: unknown): Error {
  if (error instanceof Error && /^ai_/.test(error.message)) return error;
  const status = APICallError.isInstance(error) ? error.statusCode : undefined;
  console.error("[ai] gateway call failed", error);
  return new Error(mapGatewayStatus(status));
}
