// Server-only AI calls (Lovable AI Gateway, Responses API, streamed and consumed server-side).
import { NoObjectGeneratedError, Output, streamText, type ModelMessage } from "ai";
import { z } from "zod/v4";
import { CHAT_MODEL, RESPONSES_OPTIONS, createGatewayProvider, requireAiKey, toAiError } from "./gateway.server";
import { normaliseFeedback, type RawFeedback } from "./prompts";

const replySchema = z.object({
  korean: z.string().describe("The reply in Korean"),
  translation: z.string().describe("Translation of the reply into the student's interface language"),
});

export type AiLine = { korean: string; translation: string };

async function runStructured<T>(instructions: string, messages: ModelMessage[], schema: z.ZodType<T>): Promise<T> {
  const apiKey = requireAiKey();
  const provider = createGatewayProvider(apiKey);
  try {
    const result = streamText({
      model: provider.responses(CHAT_MODEL),
      instructions,
      messages,
      output: Output.object({ schema }),
      providerOptions: RESPONSES_OPTIONS,
    });
    return (await result.output) as T;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("[ai] unusable structured output", error.text?.slice(0, 500));
      throw new Error("ai_bad_output");
    }
    throw toAiError(error);
  }
}

/** Generates the AI partner's next line (conversation reply or professor question). */
export async function generateLine(instructions: string, messages: ModelMessage[]): Promise<AiLine> {
  const out = await runStructured(instructions, messages, replySchema);
  const korean = out.korean?.trim();
  if (!korean) throw new Error("ai_bad_output");
  return { korean, translation: out.translation?.trim() ?? "" };
}

const feedbackSchema = z.object({
  overall: z.number().nullable(),
  grammar: z.number().nullable(),
  vocabulary: z.number().nullable(),
  fluency: z.number().nullable(),
  pronunciation: z.number().nullable(),
  academic: z.number().nullable(),
  organisation: z.number().nullable(),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  corrections: z.array(z.object({ original: z.string(), corrected: z.string(), explanation: z.string() })),
});

export async function generateFeedback(instructions: string, transcript: string) {
  const raw = await runStructured<RawFeedback>(
    instructions,
    [{ role: "user", content: `Transcript of the practice session:\n\n${transcript}` }],
    feedbackSchema as unknown as z.ZodType<RawFeedback>,
  );
  return { ...normaliseFeedback(raw), model: CHAT_MODEL };
}
