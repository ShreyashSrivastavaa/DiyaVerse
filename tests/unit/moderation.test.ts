import { describe, it, expect } from "vitest";
import { moderateText } from "@/lib/moderation/moderate";
import { graphemeCount, normalizeText } from "@/lib/text";

describe("Text & Grapheme Utilities", () => {
  it("correctly counts English graphemes", () => {
    expect(graphemeCount("Happy Diwali to all!")).toBe(20);
  });

  it("correctly counts Devanagari conjuncts", () => {
    // "नमस्ते" has 3 grapheme clusters in Unicode UAX #29: न, म, स्ते (sa + virama + ta + e)
    const text = "नमस्ते";
    expect(graphemeCount(text)).toBe(3);
  });

  it("normalizes whitespaces and NFC", () => {
    expect(normalizeText("  May   all   be   well  ")).toBe("May all be well");
  });
});

describe("Moderation Functionality", () => {
  it("accepts wholesome festive wishes in English, Hindi, and Hinglish", () => {
    expect(moderateText("May this Diwali bring immense joy and good health to your family!").ok).toBe(true);
    expect(moderateText("इस दिवाली आपके घर में सुख, शांति और समृद्धि का वास हो।").ok).toBe(true);
    expect(moderateText("Aap sabhi ko Diwali ki dher saari shubhkaamnayein!").ok).toBe(true);
  });

  it("does not produce false positives on benign words (no Scunthorpe problem)", () => {
    expect(moderateText("We wish all classic teachers happiness and class today.").ok).toBe(true);
    expect(moderateText("Shri Deepak lights up our home with joy.").ok).toBe(true);
    expect(moderateText("Visiting the temple mandir with pure devotion.").ok).toBe(true);
  });

  it("rejects URLs and website domains", () => {
    expect(moderateText("Visit https://spam.com for free gifts").ok).toBe(false);
    expect(moderateText("Check out diwali-deals.in now").ok).toBe(false);
    expect(moderateText("Go to www.example.org").ok).toBe(false);
  });

  it("rejects email addresses", () => {
    expect(moderateText("Contact me at user@example.com").ok).toBe(false);
  });

  it("rejects phone numbers in various formats", () => {
    expect(moderateText("Call 9876543210 for wishes").ok).toBe(false);
    expect(moderateText("Phone: +91 98765 43210").ok).toBe(false);
    expect(moderateText("Reach me on (022) 2345 6789").ok).toBe(false);
  });

  it("rejects social handles", () => {
    expect(moderateText("Follow me @festive_diya on Instagram").ok).toBe(false);
  });

  it("rejects character repetition spam", () => {
    expect(moderateText("Haaaaaaappy Diwaliiiiii").ok).toBe(false);
    expect(moderateText("Joy and peace !!!!!!!!").ok).toBe(false);
  });

  it("rejects excessive ALL-CAPS shouting", () => {
    expect(moderateText("HAPPY DIWALI EVERYONE LIGHT THE LIGHTS NOW").ok).toBe(false);
  });

  it("rejects profanity and leetspeak variants in English, Hindi, Hinglish", () => {
    expect(moderateText("Have a bastard day").ok).toBe(false);
    expect(moderateText("b@stard celebration").ok).toBe(false);
    expect(moderateText("तू हरामी है").ok).toBe(false);
    expect(moderateText("Yeh sab chutiya baatein hai").ok).toBe(false);
  });
});
