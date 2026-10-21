import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    // Return latest 20 events. STRICT PRIVACY: NEVER return wish or dedication text.
    const recentEvents = await prisma.analyticsEvent.findMany({
      orderBy: { occurredAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        occurredAt: true,
        path: true,
        session: {
          select: {
            device: true,
            browser: true,
            source: true,
          },
        },
      },
    });

    const items = recentEvents.map((ev) => ({
      id: ev.id.toString(),
      name: ev.name,
      occurredAt: ev.occurredAt.toISOString(),
      path: ev.path,
      device: ev.session?.device || "unknown",
      browser: ev.session?.browser || "unknown",
      source: ev.session?.source || "direct",
    }));

    return NextResponse.json({
      items,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Live activity feed error:", err);
    return NextResponse.json({ error: "Failed to fetch live activity" }, { status: 500 });
  }
}
