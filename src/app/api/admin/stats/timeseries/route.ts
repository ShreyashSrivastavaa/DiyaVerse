import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";

    const daysCount = range === "90d" ? 90 : range === "30d" ? 30 : 7;
    const now = new Date();
    const startDate = new Date(now.getTime() - daysCount * 24 * 60 * 60 * 1000);

    // Fetch diyas in period
    const diyas = await prisma.diya.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: "DELETED" },
      },
      select: {
        id: true,
        style: true,
        wishSource: true,
        locale: true,
        createdAt: true,
        wish: {
          select: {
            category: true,
          },
        },
      },
    });

    // Fetch sessions in period
    const sessions = await prisma.session.findMany({
      where: {
        firstSeenAt: { gte: startDate },
        isBot: false,
      },
      select: {
        id: true,
        visitorId: true,
        firstSeenAt: true,
      },
    });

    // Fetch events in period
    const shareEvents = await prisma.analyticsEvent.findMany({
      where: {
        occurredAt: { gte: startDate },
        name: {
          in: ["share_whatsapp_initiated", "share_native_completed", "link_copied", "card_downloaded"],
        },
      },
      select: {
        name: true,
        occurredAt: true,
      },
    });

    // Helper for IST date key: YYYY-MM-DD
    const toISTDateString = (d: Date): string => {
      // Offset by +5 hours 30 mins
      const istTime = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
      return istTime.toISOString().split("T")[0];
    };

    // Initialize daily map with 0s for each day in range
    const dailyMap = new Map<
      string,
      {
        date: string;
        visitors: Set<string>;
        sessions: number;
        diyas: number;
        shares: number;
      }
    >();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = toISTDateString(d);
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          visitors: new Set(),
          sessions: 0,
          diyas: 0,
          shares: 0,
        });
      }
    }

    // Populate sessions & visitors
    for (const s of sessions) {
      const key = toISTDateString(s.firstSeenAt);
      const entry = dailyMap.get(key);
      if (entry) {
        entry.sessions += 1;
        if (s.visitorId) entry.visitors.add(s.visitorId);
      }
    }

    // Populate diyas
    for (const d of diyas) {
      const key = toISTDateString(d.createdAt);
      const entry = dailyMap.get(key);
      if (entry) {
        entry.diyas += 1;
      }
    }

    // Populate shares
    for (const sh of shareEvents) {
      const key = toISTDateString(sh.occurredAt);
      const entry = dailyMap.get(key);
      if (entry) {
        entry.shares += 1;
      }
    }

    // Formatted series
    const timeseries = Array.from(dailyMap.values()).map((row) => ({
      date: row.date,
      visitors: row.visitors.size,
      sessions: row.sessions,
      diyas: row.diyas,
      shares: row.shares,
    }));

    // Wish Category distribution
    const categoryCount: Record<string, number> = {};
    const styleCount: Record<string, number> = {};

    for (const d of diyas) {
      const cat = d.wish?.category || (d.wishSource === "CUSTOM" ? "CUSTOM" : "GENERAL");
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      styleCount[d.style] = (styleCount[d.style] || 0) + 1;
    }

    const categories = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
    }));

    const styles = Object.entries(styleCount).map(([name, value]) => ({
      name,
      value,
    }));

    return NextResponse.json({
      range,
      timeseries,
      categories,
      styles,
    });
  } catch (err) {
    console.error("Timeseries stats error:", err);
    return NextResponse.json({ error: "Failed to compute timeseries" }, { status: 500 });
  }
}
