import { describe, expect, it } from "vitest";
import { CREDIT_PACKAGES, SIGNUP_FREE_CREDITS, decideSessionBilling } from "@/lib/credits";
import { validateAudioFile, validatePresentationFile } from "@/lib/file-validation";
import { isLicenceCurrent } from "@/lib/licence";
import { normaliseFeedback } from "@/lib/ai/prompts";
import { friendlyError } from "@/lib/backend-errors";

const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

describe("credits", () => {
  it("gives new students 3 free credits", () => expect(SIGNUP_FREE_CREDITS).toBe(3));
  it("sells 1 / 5 / 10 credits for 1,900 / 8,900 / 16,900 won", () => {
    expect(CREDIT_PACKAGES.map((p) => [p.credits, p.priceKrw])).toEqual([[1, 1900], [5, 8900], [10, 16900]]);
  });
  it("a practice session uses 1 credit", () => {
    expect(decideSessionBilling({ balance: 3, hasActiveLicence: false })).toEqual({ ok: true, billing: "credit", creditsAfter: 2 });
  });
  it("blocks a session with 0 credits", () => {
    expect(decideSessionBilling({ balance: 0, hasActiveLicence: false }).ok).toBe(false);
  });
  it("a university licence covers the session without using credits", () => {
    expect(decideSessionBilling({ balance: 0, hasActiveLicence: true })).toEqual({ ok: true, billing: "licence", creditsAfter: 0 });
  });
});

describe("licences", () => {
  it("expired licences no longer count", () => {
    expect(isLicenceCurrent({ active: true, licence_starts_at: null, licence_ends_at: "2026-01-01" }, "2026-11-11")).toBe(false);
  });
  it("inactive institutions don't count", () => {
    expect(isLicenceCurrent({ active: false, licence_starts_at: null, licence_ends_at: null }, "2026-11-11")).toBe(false);
  });
});

describe("file validation", () => {
  it("accepts a real PDF script", () => {
    expect(validatePresentationFile({ kind: "script", name: "a.pdf", type: "application/pdf", size: 1000, head: pdf }).ok).toBe(true);
  });
  it("rejects a renamed file whose content isn't a PDF", () => {
    expect(validatePresentationFile({ kind: "script", name: "a.pdf", type: "application/pdf", size: 1000, head: new Uint8Array([1, 2, 3, 4]) }).ok).toBe(false);
  });
  it("rejects scripts over 10 MB", () => {
    expect(validatePresentationFile({ kind: "script", name: "a.pdf", type: "application/pdf", size: 11 * 1024 * 1024, head: pdf }).ok).toBe(false);
  });
  it("rejects unsupported types like .exe", () => {
    expect(validatePresentationFile({ kind: "slides", name: "a.exe", type: "", size: 100 }).ok).toBe(false);
  });
  it("rejects non-WAV audio", () => {
    expect(validateAudioFile({ type: "audio/mpeg", size: 5000 }).ok).toBe(false);
  });
});

describe("AI output", () => {
  it("rejects an empty AI report instead of saving it", () => {
    expect(() =>
      normaliseFeedback({ overall: 80, grammar: null, vocabulary: null, fluency: null, pronunciation: null, academic: null, organisation: null, summary: " ", strengths: [], improvements: [], corrections: [] }),
    ).toThrow("ai_bad_output");
  });
  it("clamps scores to 0-100", () => {
    const r = normaliseFeedback({ overall: 140, grammar: -5, vocabulary: null, fluency: null, pronunciation: null, academic: null, organisation: null, summary: "ok", strengths: [], improvements: [], corrections: [] });
    expect([r.overall_score, r.grammar]).toEqual([100, 0]);
  });
  it("explains missing AI setup clearly", () => {
    expect(friendlyError(new Error("ai_not_configured"))).toMatch(/no AI reply was generated/);
  });
});
