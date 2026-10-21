import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleRetention(req);
}

export async function POST(req: NextRequest) {
  return handleRetention(req);
}

async function handleRetention(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = env.CRON_SECRET || process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized retention execution" }, { status: 401 });
  }

  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // 1. Delete events older than 90 days
    const deletedEvents = await prisma.analyticsEvent.deleteMany({
      where: {
        occurredAt: { lt: ninetyDaysAgo },
      },
    });

    // 2. Delete non-active sessions older than 90 days
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        lastSeenAt: { lt: ninetyDaysAgo },
      },
    });

    return NextResponse.json({
      success: true,
      retentionCutoff: ninetyDaysAgo.toISOString(),
      deletedEventsCount: deletedEvents.count,
      deletedSessionsCount: deletedSessions.count,
    });
  } catch (err) {
    console.error("Retention cleanup error:", err);
    return NextResponse.json({ error: "Retention cleanup failed" }, { status: 500 });
  }
}
