// Server-only speech-to-text through the Lovable AI Gateway.
import { createParser } from "eventsource-parser";
import { AI_GATEWAY_URL, TRANSCRIBE_MODEL, mapGatewayStatus, requireAiKey } from "./gateway.server";

/** Streams the transcription from the gateway and returns the final text. */
export async function transcribeKorean(file: File, signal?: AbortSignal): Promise<string> {
  const apiKey = requireAiKey();
  const form = new FormData();
  form.append("model", TRANSCRIBE_MODEL);
  form.append("file", file, file.name);
  form.append("response_format", "json");
  form.append("stream", "true");
  form.append("languages", "ko");
  const res = await fetch(`${AI_GATEWAY_URL}/v1/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "X-Lovable-AIG-SDK": "fetch" },
    body: form,
    ...(signal ? { signal } : {}),
  });
  if (!res.ok || !res.body) {
    console.error("[stt] gateway error", res.status, await res.text().catch(() => ""));
    throw new Error(res.status === 400 ? "transcription_failed" : mapGatewayStatus(res.status));
  }

  let text = "";
  let finalText: string | null = null;
  let streamError: string | null = null;
  const parser = createParser({
    onEvent(event) {
      if (!event.data || event.data === "[DONE]") return;
      try {
        const payload = JSON.parse(event.data) as { type?: string; delta?: string; text?: string; error?: unknown };
        if (payload.type === "transcript.text.delta" && payload.delta) text += payload.delta;
        else if (payload.type === "transcript.text.done" && typeof payload.text === "string") finalText = payload.text;
        else if (payload.type === "error" || payload.error) streamError = JSON.stringify(payload.error ?? payload);
      } catch {
        /* ignore keep-alives */
      }
    },
  });
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.feed(value);
  }
  if (streamError) {
    console.error("[stt] stream error", streamError);
    throw new Error("transcription_failed");
  }
  const result = (finalText ?? text).trim();
  if (!result) throw new Error("transcription_failed");
  return result;
}
