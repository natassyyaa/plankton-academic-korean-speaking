// Server-only: verifies the bearer token on raw HTTP server routes (uploads, transcription).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function jsonError(status: number, code: string) {
  return Response.json({ error: code }, { status });
}

export async function authenticateRequest(request: Request) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Missing backend configuration");
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token.split(".").length !== 3) return null;
  const supabase = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { supabase, userId: data.claims.sub as string };
}

/** Rejects bodies larger than `maxBytes` before buffering them. */
export function bodyTooLarge(request: Request, maxBytes: number) {
  const len = Number(request.headers.get("content-length") ?? "0");
  return Number.isFinite(len) && len > maxBytes;
}

export async function readHead(file: File, n = 16) {
  return new Uint8Array(await file.slice(0, n).arrayBuffer());
}
