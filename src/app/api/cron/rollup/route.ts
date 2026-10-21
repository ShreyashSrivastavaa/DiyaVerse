import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleRollup(req);
}

export async function POST(req: NextRequest) {
  return handleRollup(req);
}

async function handleRollup(req: NextRequest) {
  // Verify CRON_SECRET authorization
  const authHeader = req.headers.get("authorization");
  const cronSecret = env.CRON_SECRET || process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
  }

  try {
    const now = new Date();
    // Offset +5.5 hours for IST
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    // Midnight of IST day in UTC representation
    const istDateString = istNow.toISOString().split("T")[0];
    const istDayStart = new Date(`${istDateString}T00:00:00.000Z`);

    // Look back 24 hours for rolling window
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Unique visitors & sessions in IST today
    const sessions = await prisma.session.findMany({
      where: {
        firstSeenAt: { gte: dayAgo },
        isBot: false,
      },
      select: {
        visitorId: true,
        firstSeenAt: true,
      },
    });

    const uniqueVisitors = new Set(sessions.map((s) => s.visitorId).filter(Boolean)).size;
    const sessionCount = sessions.length;

    // 2. Diyas created
    const diyasCreated = await prisma.diya.count({
      where: {
        createdAt: { gte: dayAgo },
        status: { not: "DELETED" },
      },
    });

    // 3. Shares initiated
    const sharesCount = await prisma.analyticsEvent.count({
      where: {
        occurredAt: { gte: dayAgo },
        name: {
          in: ["share_whatsapp_initiated", "share_native_completed", "link_copied", "card_downloaded"],
        },
      },
    });

    // Upsert into DailyStat for this IST day
    const statsToUpsert = [
      { metric: "unique_visitors", value: uniqueVisitors },
      { metric: "sessions", value: sessionCount },
      { metric: "diyas_created", value: diyasCreated },
      { metric: "shares_initiated", value: sharesCount },
    ];

    for (const stat of statsToUpsert) {
      await prisma.dailyStat.upsert({
        where: {
          date_metric_dimension: {
            date: istDayStart,
            metric: stat.metric,
            dimension: "all",
          },
        },
        create: {
          date: istDayStart,
          metric: stat.metric,
          dimension: "all",
          value: stat.value,
        },
        update: {
          value: stat.value,
        },
      });
    }

    return NextResponse.json({
      success: true,
      istDate: istDateString,
      rolledUp: statsToUpsert,
    });
  } catch (err) {
    console.error("Rollup cron error:", err);
    return NextResponse.json({ error: "Rollup failed" }, { status: 500 });
  }
}
