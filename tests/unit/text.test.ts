import { describe, it, expect } from "vitest";
import { graphemeCount, normalizeText, truncateGraphemes } from "@/lib/text";

describe("Unicode & Grapheme Counting (text.ts)", () => {
  it("correctly counts ASCII characters", () => {
    expect(graphemeCount("Happy Diwali")).toBe(12);
    expect(graphemeCount("")).toBe(0);
  });

  it("correctly counts Devanagari conjuncts as single graphemes", () => {
    // 'नमस्ते' has:
    // न (na) + म (ma) + स् (sa + virama) + ते (ta + e matra) = 4 graphemes
    // but in raw UTF-16 length it is 6 code units!
    const namaste = "नमस्ते";
    expect(namaste.length).toBe(6);
    expect(graphemeCount(namaste)).toBe(3);

    // 'दीपावली' (da + ee + pa + a + va + la + ee) = 4 grapheme clusters
    const deepavali = "दीपावली";
    expect(deepavali.length).toBe(7);
    expect(graphemeCount(deepavali)).toBe(4);
  });

  it("normalizes Unicode text to NFC and collapses whitespace", () => {
    const raw = "  May   this  Diwali   bring joy   ";
    expect(normalizeText(raw)).toBe("May this Diwali bring joy");

    // Decomposed vs Composed Unicode: e + combining acute
    const decomposed = "e\u0301";
    const normalized = normalizeText(decomposed);
    expect(normalized).toBe("é");
  });

  it("truncates text accurately by grapheme count", () => {
    const text = "May peace and infinite prosperity fill your home this festive season.";
    const truncated = truncateGraphemes(text, 20);
    expect(graphemeCount(truncated)).toBe(20);
    expect(truncated).toBe("May peace and infini");
  });
});
