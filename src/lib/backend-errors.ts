/**
 * Error codes raised by database functions / server code, mapped to messages
 * students can act on. Server functions throw `new Error(code)`; the UI calls
 * `friendlyError(err)`.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: "Please sign in again to continue.",
  insufficient_credits: "You've used all your credits. Each practice session uses 1 credit.",
  invalid_code: "That code isn't valid or has expired. Please check it with your university.",
  licence_inactive: "Your university's licence isn't active right now.",
  no_seats: "Your university's licence has no free seats left. Please contact your university.",
  forbidden: "You don't have permission to do that.",
  invalid_email: "Please enter a valid email address.",
  room_not_found: "No room found with that code. Please check it with your group.",
  room_full: "This room is full (12 members maximum).",
  file_not_found: "That file couldn't be found. Please upload it again.",
  session_not_found: "This practice session couldn't be found.",
  session_closed: "This practice session has already finished. Start a new one to keep practising.",
  turn_limit: "This session has reached its message limit. Finish it to get your feedback report.",
  ai_not_configured: "AI features aren't set up yet, so no AI reply was generated.",
  ai_rate_limited: "The AI is busy right now. Please wait a moment and try again.",
  ai_credits_exhausted: "The app's AI usage allowance has run out. Please tell the PLANKTON team.",
  ai_unavailable: "The AI couldn't respond just now. Your message was saved — please try again.",
  ai_bad_output: "The AI returned an unusable answer. Please try again.",
  transcription_failed: "We couldn't understand that recording. Please try again or type your answer.",
  report_needs_answers: "Answer at least one question before asking for feedback.",
  payments_not_configured: "Online payment isn't available yet.",
};

export function errorCode(err: unknown): string {
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const known = Object.keys(ERROR_MESSAGES).find((code) => raw === code || raw.includes(code));
  return known ?? "unknown";
}

export function friendlyError(err: unknown): string {
  const code = errorCode(err);
  if (code !== "unknown") return ERROR_MESSAGES[code]!;
  if (err instanceof Error && /unauthori[sz]ed/i.test(err.message)) return ERROR_MESSAGES['not_authenticated']!;
  return "Something went wrong. Please try again.";
}
