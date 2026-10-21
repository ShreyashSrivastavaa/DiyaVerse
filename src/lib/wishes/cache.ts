import "server-only";
import { prisma } from "../db";

interface LocaleCache {
  ids: string[];
  lastFetched: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache: Record<string, LocaleCache> = {};

export async function getActiveWishIdsForLocale(locale: string): Promise<string[]> {
  const now = Date.now();
  const existing = cache[locale];

  if (existing && now - existing.lastFetched < CACHE_TTL_MS) {
    return existing.ids;
  }

  // Language mapping: "hi" -> "hi", "hinglish" -> "hinglish", "en" -> "en"
  const langFilter = locale === "hi" ? "hi" : locale === "hinglish" ? "hinglish" : "en";

  const rows = await prisma.wish.findMany({
    where: {
      active: true,
      language: langFilter,
    },
    select: { id: true },
  });

  const ids = rows.map((r) => r.id);
  cache[locale] = {
    ids,
    lastFetched: now,
  };

  return ids;
}
