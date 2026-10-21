import fs from "node:fs";
import path from "node:path";
import { moderateText } from "../src/lib/moderation/moderate";
import { normalizeText, graphemeCount } from "../src/lib/text";

export interface WishEntry {
  id: string;
  text: string;
  category: string;
  language: "en" | "hi" | "hinglish";
  tone?: string;
  tags: string[];
  active: boolean;
  version?: number;
  length?: number;
}

const CATEGORY_CODES: Record<string, string> = {
  happiness: "HAP",
  family: "FAM",
  love: "LOV",
  health: "HEA",
  success: "SUC",
  friendship: "FRI",
  hope: "HOP",
  universal: "UNI",
  funny: "FUN",
};

// Word 3-gram helper
function getWord3Grams(text: string): Set<string> {
  const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/).filter(Boolean);
  const grams = new Set<string>();
  for (let i = 0; i <= words.length - 3; i++) {
    grams.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return grams;
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

function getFirstSixWords(text: string): string {
  const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/).filter(Boolean);
  return words.slice(0, 6).join(" ");
}

export function validateWishLibrary() {
  const wishesDir = path.resolve(__dirname, "../data/wishes");
  if (!fs.existsSync(wishesDir)) {
    throw new Error(`Wishes directory not found at ${wishesDir}`);
  }

  const files = fs.readdirSync(wishesDir).filter((f) => f.endsWith(".json"));
  const allWishes: WishEntry[] = [];

  for (const file of files) {
    const filePath = path.join(wishesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const json: WishEntry[] = JSON.parse(content);
    allWishes.push(...json);
  }

  const errors: string[] = [];
  const activeWishes = allWishes.filter((w) => w.active !== false);

  // 1. Total Count Check
  if (activeWishes.length !== 2000) {
    errors.push(`Expected exactly 2000 active wishes, found ${activeWishes.length}`);
  }

  // 2. Language Breakdown
  const languageCounts = { en: 0, hi: 0, hinglish: 0 };
  const categoryCounts: Record<string, number> = {};

  const idSet = new Set<string>();
  const normalizedTextSet = new Set<string>();
  const word3GramMap = new Map<string, { id: string; grams: Set<string>; firstSix: string }>();

  // Regex for ID: W-<CODE>-<4 digits>
  const idRegex = /^W-[A-Z]{3,4}-\d{4}$/;

  for (let idx = 0; idx < activeWishes.length; idx++) {
    const wish = activeWishes[idx];
    const prefix = `[Wish ${wish.id || `idx ${idx}`}]`;

    // ID validation
    if (!wish.id || !idRegex.test(wish.id)) {
      errors.push(`${prefix} Invalid ID format '${wish.id}'. Must match pattern W-<CAT>-0000`);
    } else if (idSet.has(wish.id)) {
      errors.push(`${prefix} Duplicate ID '${wish.id}'`);
    } else {
      idSet.add(wish.id);
    }

    // Language counting
    if (wish.language in languageCounts) {
      languageCounts[wish.language as keyof typeof languageCounts]++;
    } else {
      errors.push(`${prefix} Unknown language '${wish.language}'`);
    }

    // Category counting
    if (!CATEGORY_CODES[wish.category]) {
      errors.push(`${prefix} Unknown category '${wish.category}'`);
    } else {
      categoryCounts[wish.category] = (categoryCounts[wish.category] || 0) + 1;
    }

    // Length check (40 - 140 graphemes)
    const gLength = graphemeCount(wish.text);
    if (gLength < 40 || gLength > 140) {
      errors.push(`${prefix} Length ${gLength} out of bounds (40-140 graphemes): "${wish.text}"`);
    }

    // Normalized duplicate check
    const norm = normalizeText(wish.text).toLowerCase();
    if (normalizedTextSet.has(norm)) {
      errors.push(`${prefix} Duplicate normalized text: "${wish.text}"`);
    } else {
      normalizedTextSet.add(norm);
    }

    // Moderate check (must pass moderation)
    const modResult = moderateText(wish.text, wish.language);
    if (!modResult.ok) {
      errors.push(`${prefix} Failed moderation (${modResult.code}): ${modResult.reason}`);
    }

    // Near-duplicate check
    const grams = getWord3Grams(wish.text);
    const firstSix = getFirstSixWords(wish.text);

    if (grams.size >= 3) {
      for (const [existingId, data] of word3GramMap.entries()) {
        if (firstSix.length > 20 && firstSix === data.firstSix) {
          errors.push(`${prefix} Identical first 6 words with ${existingId}: "${firstSix}"`);
          break;
        }
        const similarity = jaccardSimilarity(grams, data.grams);
        if (similarity > 0.6) {
          errors.push(
            `${prefix} High 3-gram similarity (${similarity.toFixed(2)}) with ${existingId}: "${wish.text}" vs existing`,
          );
          break;
        }
      }
    }
    word3GramMap.set(wish.id, { id: wish.id, grams, firstSix });
  }

  // Check language targets: English 1100, Hindi 450, Hinglish 450
  if (languageCounts.en !== 1100) {
    errors.push(`English wishes target is 1100, got ${languageCounts.en}`);
  }
  if (languageCounts.hi !== 450) {
    errors.push(`Hindi wishes target is 450, got ${languageCounts.hi}`);
  }
  if (languageCounts.hinglish !== 450) {
    errors.push(`Hinglish wishes target is 450, got ${languageCounts.hinglish}`);
  }

  // Check category targets: funny capped ~120, others >= 150
  if ((categoryCounts["funny"] || 0) > 130) {
    errors.push(`Funny wishes count ${categoryCounts["funny"]} exceeds cap of ~120`);
  }
  for (const [cat] of Object.entries(CATEGORY_CODES)) {
    if (cat !== "funny" && (categoryCounts[cat] || 0) < 150) {
      errors.push(`Category '${cat}' has ${categoryCounts[cat] || 0} wishes (minimum 150 required)`);
    }
  }

  // Print Coverage Table
  console.log("\n==================== WISH LIBRARY COVERAGE ====================");
  console.log(`Total Active Wishes: ${activeWishes.length} / 2000`);
  console.log("---------------------------------------------------------------");
  console.log("Language Breakdown:");
  console.log(`  • English (en):       ${languageCounts.en} (Target: 1100)`);
  console.log(`  • Hindi (hi):         ${languageCounts.hi} (Target: 450)`);
  console.log(`  • Hinglish:           ${languageCounts.hinglish} (Target: 450)`);
  console.log("---------------------------------------------------------------");
  console.log("Category Breakdown:");
  for (const cat of Object.keys(CATEGORY_CODES)) {
    console.log(`  • ${cat.padEnd(12)}: ${categoryCounts[cat] || 0}`);
  }
  console.log("===============================================================\n");

  if (errors.length > 0) {
    console.error(`Validation failed with ${errors.length} errors:`);
    errors.slice(0, 25).forEach((e) => console.error(` - ${e}`));
    if (errors.length > 25) {
      console.error(` ... and ${errors.length - 25} more errors.`);
    }
    process.exit(1);
  }

  console.log("✔ Wish library validation passed successfully!\n");
}

if (require.main === module || process.argv[1]?.endsWith("wishes-validate.ts")) {
  validateWishLibrary();
}
