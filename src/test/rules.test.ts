import { describe, expect, it } from "vitest";
import { generateRoomCode, isValidRoomCode, normaliseRoomCode } from "@/lib/room-code";
import { LANGUAGES, translate } from "@/lib/i18n";

describe("group room codes", () => {
  it("generates 6-character codes that pass validation", () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(6);
    expect(isValidRoomCode(code)).toBe(true);
  });

  it("accepts lowercase / spaced input after normalising", () => {
    expect(isValidRoomCode(normaliseRoomCode("k7p l2q"))).toBe(true);
  });

  it("rejects codes that are too short", () => {
    expect(isValidRoomCode(normaliseRoomCode("abc"))).toBe(false);
  });
});

describe("interface languages", () => {
  it("supports Korean, English, Simplified Chinese, Vietnamese, Indonesian and Mongolian", () => {
    expect(LANGUAGES.map((l) => l.code)).toEqual(["ko", "en", "zh", "vi", "id", "mn"]);
  });

  it("translates sidebar labels per language", () => {
    expect(translate("ko", "nav.dashboard")).toBe("대시보드");
    expect(translate("en", "nav.dashboard")).toBe("Dashboard");
  });
});
