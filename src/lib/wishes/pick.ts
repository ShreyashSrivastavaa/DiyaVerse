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
  } catch (error) {
    console.error("Error picking random wish:", error);
  }

  return CONSTANT_FALLBACK_WISH;
}
