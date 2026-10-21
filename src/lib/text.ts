/**
 * Unicode and Grapheme utilities for DiyaVerse.
 * Properly counts Devanagari conjuncts (grapheme clusters) rather than raw UTF-16 code units.
 */

export function normalizeText(text: string): string {
  return text.normalize("NFC").trim().replace(/\s+/g, " ");
}

export function graphemeCount(text: string): number {
  if (!text) return 0;
  const normalized = text.normalize("NFC");

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("und", { granularity: "grapheme" });
    let count = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of segmenter.segment(normalized)) {
      count++;
    }
    return count;
  }

  // Fallback for environments lacking Intl.Segmenter
  return Array.from(normalized).length;
}

/**
 * Truncate text cleanly by grapheme count
 */
export function truncateGraphemes(text: string, maxGraphemes: number): string {
  if (!text || graphemeCount(text) <= maxGraphemes) return text;

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("und", { granularity: "grapheme" });
    let count = 0;
    let result = "";
    for (const { segment } of segmenter.segment(text.normalize("NFC"))) {
      if (count >= maxGraphemes) break;
      result += segment;
      count++;
    }
    return result;
  }

  return Array.from(text.normalize("NFC")).slice(0, maxGraphemes).join("");
}
