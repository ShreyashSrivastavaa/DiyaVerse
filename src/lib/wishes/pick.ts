import "server-only";
import crypto from "node:crypto";
import { prisma } from "../db";
import { getActiveWishIdsForLocale } from "./cache";

export interface PickWishOptions {
  locale?: string;
  excludeIds?: string[];
}

export interface PickedWish {
  id: string;
  text: string;
  category: string;
  language: string;
}

const CONSTANT_FALLBACK_WISH: PickedWish = {
  id: "W-FALLBACK",
  text: "May the light of Diwali brighten your path with lasting joy and peace.",
  category: "happiness",
  language: "en",
};

export async function pickWish(options: PickWishOptions = {}): Promise<PickedWish> {
  const locale = options.locale || "en";
  const excludeSet = new Set(options.excludeIds || []);

  try {
    let ids = await getActiveWishIdsForLocale(locale);
    let candidates = ids.filter((id) => !excludeSet.has(id));

    // If all excluded, use all IDs for locale
    if (candidates.length === 0 && ids.length > 0) {
      candidates = ids;
    }

    // Fallback to English if pool is empty
    if (candidates.length === 0 && locale !== "en") {
      ids = await getActiveWishIdsForLocale("en");
      candidates = ids.filter((id) => !excludeSet.has(id));
      if (candidates.length === 0 && ids.length > 0) {
        candidates = ids;
      }
    }

    if (candidates.length > 0) {
      const randomIndex = crypto.randomInt(0, candidates.length);
      const chosenId = candidates[randomIndex];

      const record = await prisma.wish.findUnique({
        where: { id: chosenId },
        select: {
          id: true,
          text: true,
          category: true,
          language: true,
        },
      });

      if (record) {
        return record;
      }
    }
  } catch {
    // When local DB is not available, pick from data/wishes/ on disk
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const wishesDir = path.resolve(process.cwd(), "data/wishes");
      if (fs.existsSync(wishesDir)) {
        const files = ["happiness.json", "universal.json", "family.json", "friendship.json", "love.json", "hope.json"];
        const file = files[Math.floor(Math.random() * files.length)];
        const filePath = path.join(wishesDir, file);
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, "utf-8");
          const list = JSON.parse(raw);
          const matching = Array.isArray(list)
            ? list.filter((w: Record<string, unknown>) => w.language === locale && w.active)
            : [];
          const pool = matching.length > 0 ? matching : list;
          if (pool.length > 0) {
            const item = pool[Math.floor(Math.random() * pool.length)];
            return {
              id: item.id,
              text: item.text,
              category: item.category,
              language: item.language,
            };
          }
        }
      }
    } catch {
      // ignore and use constant fallback
    }
  }

  return CONSTANT_FALLBACK_WISH;
}
