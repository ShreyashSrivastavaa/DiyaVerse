import enBlocklist from "../../../data/moderation/blocklist.en.json";
import hiBlocklist from "../../../data/moderation/blocklist.hi.json";
import hinglishBlocklist from "../../../data/moderation/blocklist.hinglish.json";
import { normalizeText } from "../text";

export interface ModerationResult {
  ok: boolean;
  reason?: string;
  code?:
    | "URL_DETECTED"
    | "EMAIL_DETECTED"
    | "PHONE_DETECTED"
    | "HANDLE_DETECTED"
    | "SPAM_DETECTED"
    | "ALL_CAPS"
    | "PROFANITY_DETECTED";
}

// Leetspeak normalization mapping
const LEET_MAP: Record<string, string> = {
  "@": "a",
  "4": "a",
  "8": "b",
  "3": "e",
  "1": "i",
  "!": "i",
  "0": "o",
  "$": "s",
  "5": "s",
  "7": "t",
  "+": "t",
};

export function normalizeLeet(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((c) => LEET_MAP[c] || c)
    .join("");
}

export function moderateText(text: string, _locale?: string): ModerationResult {
  void _locale;
  if (!text || !text.trim()) {
    return { ok: true };
  }

  const normalized = normalizeText(text);

  // 1. Check for URLs & domains
  const urlRegex =
    /\b(?:https?:\/\/|www\.)[^\s]+|\b[a-zA-Z0-9-]+\.(?:com|in|org|net|co|io|me|app|xyz|dev|edu|gov|live)\b/i;
  if (urlRegex.test(normalized)) {
    return {
      ok: false,
      code: "URL_DETECTED",
      reason: "Wishes cannot contain links or website addresses.",
    };
  }

  // 2. Check for Emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  if (emailRegex.test(normalized)) {
    return {
      ok: false,
      code: "EMAIL_DETECTED",
      reason: "Wishes cannot contain email addresses.",
    };
  }

  // 3. Check for Phone Numbers (10 or more digits with optional spaces/dashes/parentheses)
  const phonePattern = /(?:\+?\d[\s().-]*){10,}/;
  if (phonePattern.test(normalized)) {
    return {
      ok: false,
      code: "PHONE_DETECTED",
      reason: "For safety, please avoid including phone numbers.",
    };
  }

  // 4. Check for Social Handles (@username)
  if (/(?:^|\s)@[a-zA-Z0-9_]{3,}/.test(normalized)) {
    return {
      ok: false,
      code: "HANDLE_DETECTED",
      reason: "Social media handles are not permitted.",
    };
  }

  // 5. Repeated character spam (e.g., "aaaaaaa", "!!!!!!!!", "??????")
  if (/(.)\1{4,}/.test(normalized)) {
    return {
      ok: false,
      code: "SPAM_DETECTED",
      reason: "Please avoid excessive repeated characters.",
    };
  }

  // 6. ALL CAPS shouting (if length >= 15 and > 75% uppercase Latin letters)
  const letters = normalized.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 15) {
    const uppercaseLetters = normalized.replace(/[^A-Z]/g, "").length;
    if (uppercaseLetters / letters.length > 0.75) {
      return {
        ok: false,
        code: "ALL_CAPS",
        reason: "Please avoid ALL-CAPS shouting.",
      };
    }
  }

  // 7. Profanity / Abuse checks
  const lowerText = normalized.toLowerCase();
  const leetText = normalizeLeet(normalized);

  const allBlocklisted = [...enBlocklist, ...hiBlocklist, ...hinglishBlocklist];

  for (const word of allBlocklisted) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Word boundary check to prevent Scunthorpe problem ("class", "deepak", "mandir")
    const wordBoundaryRegex = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?:$|[^\\p{L}\\p{N}])`, "iu");

    if (wordBoundaryRegex.test(lowerText) || wordBoundaryRegex.test(leetText)) {
      return {
        ok: false,
        code: "PROFANITY_DETECTED",
        reason: "Please keep wishes respectful, festive, and warm.",
      };
    }
  }

  return { ok: true };
}
