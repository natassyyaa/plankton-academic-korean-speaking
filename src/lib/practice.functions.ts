import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ModelMessage } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { speakingScenarios } from "@/lib/sample-data";
import {
  MAX_AI_TURNS_PER_SESSION,
  MAX_QNA_QUESTIONS,
  feedbackInstructions,
  professorQuestionInstructions,
  speakingInstructions,
  transcriptForFeedback,
  type ProfileForPrompt,
} from "@/lib/ai/prompts";

type Ctx = { supabase: SupabaseClient<Database>; userId: string };

const DEFAULT_PROFILE: ProfileForPrompt = { korean_level: "topik3", interface_language: "en", major: "" };

async function loadProfile(ctx: Ctx): Promise<ProfileForPrompt> {
  const { data } = await ctx.supabase
    .from("profiles")
    .select("korean_level, interface_language, major")
    .eq("id", ctx.userId)
    .maybeSingle();
  return data ?? DEFAULT_PROFILE;
}

/** Loads a session through RLS, so only the owner can reach it. */
async function loadOwnSession(ctx: Ctx, sessionId: string) {
  const { data, error } = await ctx.supabase.from("practice_sessions").select("*").eq("id", sessionId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("session_not_found");
  return data as {
    id: string;
    type: "speaking" | "presentation" | "qna" | "group";
    scenario: string | null;
    topic: string;
    difficulty: "basic" | "intermediate" | "advanced" | null;
    status: string;
    ai_turns: number;
    target_seconds: number | null;
    duration_seconds: number | null;
    script_text: string | null;
    created_at: string;
  };
}

async function loadMessages(ctx: Ctx, sessionId: string) {
  const { data, error } = await ctx.supabase
    .from("session_messages")
    .select("id, role, content, translation, source, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; role: "user" | "assistant" | "system"; content: string; translation: string | null; source: string; created_at: string }[];
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Asks the AI for the partner's next line and stores it. Returns null (and an
 * error code) when AI isn't available — nothing is invented in its place.
 */
async function produceAiTurn(ctx: Ctx, sessionId: string) {
  const session = await loadOwnSession(ctx, sessionId);
  if (session.status !== "active") throw new Error("session_closed");
  if (session.type !== "speaking" && session.type !== "qna") return { message: null, error: null, done: false };
  if (session.ai_turns >= MAX_AI_TURNS_PER_SESSION) throw new Error("turn_limit");

  const history = await loadMessages(ctx, sessionId);
  const askedSoFar = history.filter((m) => m.role === "assistant").length;
  if (session.type === "qna" && askedSoFar >= MAX_QNA_QUESTIONS) return { message: null, error: null, done: true };

  const profile = await loadProfile(ctx);
  const instructions =
    session.type === "speaking"
      ? speakingInstructions(session.scenario ?? "", profile)
      : professorQuestionInstructions({
          topic: session.topic,
          difficulty: session.difficulty ?? "intermediate",
          profile,
          questionNumber: askedSoFar + 1,
        });
  const messages: ModelMessage[] = history
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }) as ModelMessage);
  if (messages.length === 0 || messages[messages.length - 1]!.role !== "user") {
    messages.push({ role: "user", content: session.type === "qna" ? "(The student has finished presenting. Please ask your question.)" : "(The student is listening.)" });
  }

  try {
    const { generateLine } = await import("@/lib/ai/generate.server");
    const line = await generateLine(instructions, messages);
    const db = await admin();
    const { data: saved, error } = await db
      .from("session_messages")
      .insert({ session_id: sessionId, user_id: ctx.userId, role: "assistant", content: line.korean, translation: line.translation, source: "ai" })
      .select("id, role, content, translation, source, created_at")
      .single();
    if (error) throw new Error(error.message);
    await db.from("practice_sessions").update({ ai_turns: session.ai_turns + 1 }).eq("id", sessionId);
    return { message: saved, error: null, done: false };
  } catch (e) {
    const code = e instanceof Error && /^ai_|^transcription_/.test(e.message) ? e.message : "ai_unavailable";
    if (code === "ai_unavailable") console.error("[practice] AI turn failed", e);
    return { message: null, error: code, done: false };
  }
}

const startSchema = z.object({
  type: z.enum(["speaking", "presentation", "qna", "group"]),
  scenario: z.string().max(40).nullable().default(null),
  topic: z.string().trim().max(300).default(""),
  difficulty: z.enum(["basic", "intermediate", "advanced"]).nullable().default(null),
  targetSeconds: z.number().int().min(30).max(7200).nullable().default(null),
  scriptText: z.string().max(30000).nullable().default(null),
  scriptFileId: z.string().uuid().nullable().default(null),
  slidesFileId: z.string().uuid().nullable().default(null),
});

/** Starts a session (uses 1 credit unless a university licence covers it). Speaking gets its scripted opener; Q&A its first AI question. */
export const startPracticeSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof startSchema>) => startSchema.parse(input))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    if (data.type === "speaking" && !speakingScenarios.some((s) => s.id === data.scenario)) throw new Error("session_not_found");
    await context.supabase.rpc("sync_my_institution_access");
    const { data: sessionId, error } = await context.supabase.rpc("start_practice_session", {
      _type: data.type,
      _scenario: data.scenario,
      _topic: data.topic,
      _difficulty: data.difficulty,
      _target_seconds: data.targetSeconds,
      _script_text: data.scriptText,
      _script_file_id: data.scriptFileId,
      _slides_file_id: data.slidesFileId,
    } as never);
    if (error) throw new Error(error.message);
    const id = sessionId as unknown as string;

    let firstAi: Awaited<ReturnType<typeof produceAiTurn>> | null = null;
    if (data.type === "speaking") {
      const s = speakingScenarios.find((x) => x.id === data.scenario)!;
      const db = await admin();
      await db.from("session_messages").insert({
        session_id: id,
        user_id: ctx.userId,
        role: "assistant",
        content: s.opening,
        translation: s.openingEn,
        source: "ai",
      });
    } else if (data.type === "qna") {
      firstAi = await produceAiTurn(ctx, id);
    }
    const messages = await loadMessages(ctx, id);
    return { sessionId: id, messages, aiError: firstAi?.error ?? null };
  });

const sendSchema = z.object({
  sessionId: z.string().uuid(),
  text: z.string().trim().min(1).max(4000),
  source: z.enum(["typed", "speech"]).default("typed"),
  recordingPath: z.string().max(300).nullable().default(null),
});

/** Saves the student's line, then asks the AI for its reply / next question. */
export const sendPracticeMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof sendSchema>) => sendSchema.parse(input))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const session = await loadOwnSession(ctx, data.sessionId);
    if (session.status !== "active") throw new Error("session_closed");
    const { data: userMessage, error } = await context.supabase
      .from("session_messages")
      .insert({
        session_id: data.sessionId,
        user_id: context.userId,
        role: "user",
        content: data.text,
        source: data.source,
        recording_path: data.recordingPath,
      })
      .select("id, role, content, translation, source, created_at")
      .single();
    if (error) throw new Error(error.message);
    const ai = await produceAiTurn(ctx, data.sessionId);
    return { userMessage, aiMessage: ai.message, aiError: ai.error, done: ai.done };
  });

/** Retries the AI's turn (e.g. after "AI busy"). */
export const retryAiTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string }) => z.object({ sessionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const ai = await produceAiTurn(context as unknown as Ctx, data.sessionId);
    return { aiMessage: ai.message, aiError: ai.error, done: ai.done };
  });

export const completePracticeSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string; durationSeconds?: number | null }) =>
    z.object({ sessionId: z.string().uuid(), durationSeconds: z.number().int().min(0).max(14400).nullable().default(null) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const session = await loadOwnSession(context as unknown as Ctx, data.sessionId);
    if (session.status !== "active") return { ok: true };
    const duration = data.durationSeconds ?? Math.round((Date.now() - new Date(session.created_at).getTime()) / 1000);
    const db = await admin();
    const { error } = await db
      .from("practice_sessions")
      .update({ status: "completed", completed_at: new Date().toISOString(), duration_seconds: Math.min(duration, 14400) })
      .eq("id", data.sessionId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Generates (once) and stores the AI feedback report for a session. */
export const generateFeedbackReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string }) => z.object({ sessionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const session = await loadOwnSession(ctx, data.sessionId);
    const existing = await context.supabase.from("feedback_reports").select("*").eq("session_id", data.sessionId).maybeSingle();
    if (existing.data) return { report: existing.data, error: null };

    const messages = await loadMessages(ctx, data.sessionId);
    let transcriptSource = messages;
    if (session.type === "presentation" && session.script_text && !messages.some((m) => m.role === "user")) {
      transcriptSource = [{ id: "script", role: "user", content: session.script_text, translation: null, source: "typed", created_at: "" }];
    }
    if (!transcriptSource.some((m) => m.role === "user")) throw new Error("report_needs_answers");

    const profile = await loadProfile(ctx);
    try {
      const { generateFeedback } = await import("@/lib/ai/generate.server");
      const report = await generateFeedback(
        feedbackInstructions({ type: session.type, profile, targetSeconds: session.target_seconds, durationSeconds: session.duration_seconds }),
        transcriptForFeedback(transcriptSource),
      );
      const db = await admin();
      const { data: saved, error } = await db
        .from("feedback_reports")
        .upsert({ session_id: data.sessionId, user_id: context.userId, ...report }, { onConflict: "session_id" })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      if (session.status === "active") {
        await db
          .from("practice_sessions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            duration_seconds: session.duration_seconds ?? Math.min(14400, Math.round((Date.now() - new Date(session.created_at).getTime()) / 1000)),
          })
          .eq("id", data.sessionId);
      }
      return { report: saved, error: null };
    } catch (e) {
      const code = e instanceof Error && /^ai_/.test(e.message) ? e.message : "ai_unavailable";
      if (code === "ai_unavailable") console.error("[practice] feedback failed", e);
      return { report: null, error: code };
    }
  });

export const getPracticeSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string }) => z.object({ sessionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const session = await loadOwnSession(ctx, data.sessionId);
    const [messages, report] = await Promise.all([
      loadMessages(ctx, data.sessionId),
      context.supabase.from("feedback_reports").select("*").eq("session_id", data.sessionId).maybeSingle(),
    ]);
    return { session, messages, report: report.data ?? null };
  });

/** Practice history with report scores, newest first. */
export const listPracticeHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { limit?: number } | undefined) => z.object({ limit: z.number().int().min(1).max(200).default(50) }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("practice_sessions")
      .select("id, type, scenario, topic, difficulty, status, billing, duration_seconds, created_at, completed_at, feedback_reports(overall_score, grammar, vocabulary, fluency, pronunciation, academic, organisation)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const rep = Array.isArray(r.feedback_reports) ? r.feedback_reports[0] : r.feedback_reports;
      return { ...r, feedback_reports: undefined, report: rep ?? null };
    });
  });

/** Latest report (or a specific one). Null when the student has none yet. */
export const getFeedbackReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId?: string | null } | undefined) => z.object({ sessionId: z.string().uuid().nullable().default(null) }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("feedback_reports")
      .select("*, practice_sessions(id, type, topic, scenario, created_at, duration_seconds)")
      .eq("user_id", context.userId);
    if (data.sessionId) q = q.eq("session_id", data.sessionId);
    const { data: rows, error } = await q.order("created_at", { ascending: false }).limit(1);
    if (error) throw new Error(error.message);
    return rows?.[0] ?? null;
  });
