import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest, bodyTooLarge, jsonError, readHead } from "@/lib/api-auth.server";
import { AUDIO_MAX_BYTES, validateAudioFile } from "@/lib/file-validation";

/**
 * Transcribes a student's Korean recording for one of their own active sessions.
 * The recording is kept privately (owner-only) under recordings/{user}/{session}/.
 */
export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateRequest(request);
        if (!auth) return jsonError(401, "not_authenticated");
        if (bodyTooLarge(request, AUDIO_MAX_BYTES + 64 * 1024)) return jsonError(413, "file_too_large");

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return jsonError(400, "invalid_upload");
        }
        const sessionId = String(form.get("sessionId") ?? "");
        const file = form.get("file");
        if (!/^[0-9a-f-]{36}$/i.test(sessionId) || !(file instanceof File)) return jsonError(400, "invalid_upload");

        const check = validateAudioFile({ type: file.type, size: file.size, head: await readHead(file) });
        if (!check.ok) return Response.json({ error: "invalid_file", message: check.error }, { status: 400 });

        // RLS: the student can only see their own sessions.
        const { data: session } = await auth.supabase.from("practice_sessions").select("id, status").eq("id", sessionId).maybeSingle();
        if (!session) return jsonError(404, "session_not_found");
        if (session.status !== "active") return jsonError(409, "session_closed");

        let text: string;
        try {
          const { transcribeKorean } = await import("@/lib/ai/transcribe.server");
          text = await transcribeKorean(file, request.signal);
        } catch (e) {
          const code = e instanceof Error ? e.message : "transcription_failed";
          if (request.signal.aborted) return jsonError(499, "aborted");
          const status = code === "ai_not_configured" ? 503 : code === "ai_rate_limited" ? 429 : code === "ai_credits_exhausted" ? 402 : 502;
          return jsonError(status, /^(ai_|transcription_)/.test(code) ? code : "transcription_failed");
        }

        const path = `${auth.userId}/${sessionId}/${crypto.randomUUID()}.wav`;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const up = await supabaseAdmin.storage.from("recordings").upload(path, file, { contentType: "audio/wav" });
        if (up.error) console.error("[transcribe] could not keep recording", up.error.message);

        return Response.json({ text, recordingPath: up.error ? null : path });
      },
    },
  },
});
