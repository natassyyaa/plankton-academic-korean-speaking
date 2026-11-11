/**
 * Prompt builders and AI output normalisation. Pure functions (no secrets), so
 * they are unit-tested and safe to import anywhere.
 */
import { speakingScenarios } from "@/lib/sample-data";

export type ProfileForPrompt = { korean_level: string; interface_language: string; major: string };

const LANGUAGE_NAMES: Record<string, string> = {
  ko: "Korean",
  en: "English",
  zh: "Simplified Chinese",
  vi: "Vietnamese",
  id: "Indonesian",
  mn: "Mongolian",
};

export function languageName(code: string) {
  return LANGUAGE_NAMES[code] ?? "English";
}

function levelLine(level: string) {
  return level === "none" ? "has not taken TOPIK yet" : `is around ${level.toUpperCase().replace("TOPIK", "TOPIK level ")}`;
}

export function speakingInstructions(scenarioId: string, profile: ProfileForPrompt) {
  const s = speakingScenarios.find((x) => x.id === scenarioId);
  const scene = s ? `${s.title} (${s.titleKo}): ${s.description}` : "an academic conversation at a Korean university";
  const persona = s ? `${s.persona.name}, ${s.persona.role}` : "a Korean professor";
  return [
    `You are ${persona} in a speaking practice app for international students at Korean universities.`,
    `Scenario: ${scene}.`,
    `The student ${levelLine(profile.korean_level)}${profile.major ? ` and studies ${profile.major}` : ""}.`,
    "Stay in character and reply ONLY in natural academic Korean, 1-3 short sentences, matching the student's level.",
    "Keep the conversation going with one follow-up question when natural. Do not switch to another language.",
    `Also give a translation of your reply into ${languageName(profile.interface_language)}.`,
  ].join("\n");
}

export function professorQuestionInstructions(input: {
  topic: string;
  difficulty: "basic" | "intermediate" | "advanced";
  profile: ProfileForPrompt;
  questionNumber: number;
}) {
  const style = {
    basic: "clarifying and summary questions",
    intermediate: "questions about method, reasoning and limitations",
    advanced: "thesis-defence style challenges that probe assumptions and contributions",
  }[input.difficulty];
  return [
    "You are a Korean university professor listening to an international student's presentation.",
    `Presentation topic: ${input.topic || "(not given — ask about the student's research in general)"}.`,
    `Ask question number ${input.questionNumber}. Difficulty: ${input.difficulty} — ${style}.`,
    `The student ${levelLine(input.profile.korean_level)}.`,
    "Base the question on the student's previous answers when there are any. Ask exactly ONE question, in polite academic Korean (합니다/하십시오체), 1-2 sentences.",
    `Also give a translation into ${languageName(input.profile.interface_language)}.`,
  ].join("\n");
}

export function feedbackInstructions(input: { type: string; profile: ProfileForPrompt; targetSeconds?: number | null; durationSeconds?: number | null }) {
  const lang = languageName(input.profile.interface_language);
  return [
    "You are an experienced Korean-language instructor assessing an international student's academic Korean.",
    `Practice type: ${input.type}. The student ${levelLine(input.profile.korean_level)}.`,
    input.targetSeconds ? `Target length ${input.targetSeconds}s, actual ${input.durationSeconds ?? "unknown"}s.` : "",
    "Assess ONLY the student's own words in the transcript. Score each skill 0-100.",
    "Pronunciation can't be judged from text: set pronunciation to null unless the transcript is marked as spoken, and even then only judge what transcription errors suggest.",
    `Write summary, strengths and improvements in ${lang}. Corrections: quote the student's original Korean, give a corrected academic Korean version and a short explanation in ${lang}.`,
    "Give 2-4 strengths, 2-4 improvements and up to 5 corrections. Be specific and encouraging; never invent sentences the student didn't say.",
  ]
    .filter(Boolean)
    .join("\n");
}

export type RawFeedback = {
  overall: number | null;
  grammar: number | null;
  vocabulary: number | null;
  fluency: number | null;
  pronunciation: number | null;
  academic: number | null;
  organisation: number | null;
  summary: string;
  strengths: string[];
  improvements: string[];
  corrections: { original: string; corrected: string; explanation: string }[];
};

function clampScore(v: number | null | undefined) {
  if (typeof v !== "number" || Number.isNaN(v)) return null;
  return Math.max(0, Math.min(100, Math.round(v)));
}

/** Clamps scores, trims lists and rejects empty reports so nothing invented reaches the database. */
export function normaliseFeedback(raw: RawFeedback) {
  const summary = raw.summary?.trim();
  if (!summary) throw new Error("ai_bad_output");
  const clean = (xs: string[] | undefined, n: number) => (xs ?? []).map((x) => x.trim()).filter(Boolean).slice(0, n);
  return {
    overall_score: clampScore(raw.overall),
    grammar: clampScore(raw.grammar),
    vocabulary: clampScore(raw.vocabulary),
    fluency: clampScore(raw.fluency),
    pronunciation: clampScore(raw.pronunciation),
    academic: clampScore(raw.academic),
    organisation: clampScore(raw.organisation),
    summary,
    strengths: clean(raw.strengths, 4),
    improvements: clean(raw.improvements, 4),
    corrections: (raw.corrections ?? [])
      .filter((c) => c.original?.trim() && c.corrected?.trim())
      .slice(0, 5)
      .map((c) => ({ original: c.original.trim(), corrected: c.corrected.trim(), explanation: (c.explanation ?? "").trim() })),
  };
}

/** Builds the transcript sent for assessment; student lines are labelled so the model only grades them. */
export function transcriptForFeedback(messages: { role: string; content: string; source: string }[]) {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? `STUDENT${m.source === "speech" ? " (spoken)" : ""}` : "PARTNER"}: ${m.content}`)
    .join("\n");
}

export const MAX_AI_TURNS_PER_SESSION = 30;
export const MAX_QNA_QUESTIONS = 5;
