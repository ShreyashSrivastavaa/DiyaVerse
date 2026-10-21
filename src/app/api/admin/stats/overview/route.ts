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

    const now = new Date();
    let startDate = new Date();

    if (range === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === "90d") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else {
      // Default 7d
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // 1. Fetch Diya records in period
    const diyasInPeriod = await prisma.diya.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: "DELETED" },
      },
      select: {
        id: true,
        wishSource: true,
        createdAt: true,
        locale: true,
        style: true,
      },
    });

    const totalDiyasLit = diyasInPeriod.length;
    const wishesAttached = totalDiyasLit;
    const customWishes = diyasInPeriod.filter((d) => d.wishSource === "CUSTOM").length;

    // 2. Fetch Sessions & Analytics Events in period
    const sessions = await prisma.session.findMany({
      where: {
        firstSeenAt: { gte: startDate },
        isBot: false,
      },
      select: {
        id: true,
        visitorId: true,
        source: true,
        device: true,
        browser: true,
        firstSeenAt: true,
      },
    });

    const totalSessions = sessions.length;
    const uniqueVisitorIds = new Set(sessions.map((s) => s.visitorId).filter(Boolean));
    const uniqueVisitors = uniqueVisitorIds.size;

    // Count returning visitors
    const allVisitors = await prisma.session.findMany({
      where: { isBot: false, visitorId: { not: null } },
      select: { visitorId: true, firstSeenAt: true },
    });

    const visitorDayMap = new Map<string, Set<string>>();
    for (const s of allVisitors) {
      if (!s.visitorId) continue;
      const day = s.firstSeenAt.toISOString().split("T")[0];
      if (!visitorDayMap.has(s.visitorId)) {
        visitorDayMap.set(s.visitorId, new Set());
      }
      visitorDayMap.get(s.visitorId)!.add(day);
    }

    let returningVisitorsCount = 0;
    uniqueVisitorIds.forEach((vid) => {
      if (vid && (visitorDayMap.get(vid)?.size || 0) > 1) {
        returningVisitorsCount++;
      }
    });

    // 3. Count Specific Events in period
    const events = await prisma.analyticsEvent.findMany({
      where: {
        occurredAt: { gte: startDate },
      },
      select: {
        name: true,
        path: true,
      },
    });

    let creationAttempts = 0;
    let successfulCreations = 0;
    let shareMenuOpens = 0;
    let whatsappInitiated = 0;
    let nativeShareCompleted = 0;
    let linkCopies = 0;
    let cardDownloads = 0;

    const pageViewsByPath: Record<string, number> = {};

    for (const ev of events) {
      if (ev.name === "page_viewed") {
        pageViewsByPath[ev.path] = (pageViewsByPath[ev.path] || 0) + 1;
      } else if (ev.name === "diya_submit_attempted") creationAttempts++;
      else if (ev.name === "diya_created") successfulCreations++;
      else if (ev.name === "share_menu_opened") shareMenuOpens++;
      else if (ev.name === "share_whatsapp_initiated") whatsappInitiated++;
      else if (ev.name === "share_native_completed") nativeShareCompleted++;
      else if (ev.name === "link_copied") linkCopies++;
      else if (ev.name === "card_downloaded") cardDownloads++;
    }

    // Top pages list
    const topPages = Object.entries(pageViewsByPath)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Traffic sources
    const sourcesCount: Record<string, number> = {};
    for (const s of sessions) {
      const src = s.source || "Direct / Unknown";
      sourcesCount[src] = (sourcesCount[src] || 0) + 1;
    }
    const trafficSources = Object.entries(sourcesCount)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Today's snapshot
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const visitorsToday = sessions.filter((s) => s.firstSeenAt >= todayStart).length;
    const diyasToday = diyasInPeriod.filter((d) => d.createdAt >= todayStart).length;

    // Derived Rates
    const completionRate =
      creationAttempts > 0 ? (totalDiyasLit / creationAttempts) * 100 : 0;
    const avgCreationsPerVisitor =
      uniqueVisitors > 0 ? (totalDiyasLit / uniqueVisitors).toFixed(2) : "0.00";
    const totalShareActions = whatsappInitiated + linkCopies + cardDownloads;
    const shareActionRate =
      totalDiyasLit > 0 ? (totalShareActions / totalDiyasLit) * 100 : 0;
    const returningRate =
      uniqueVisitors > 0 ? (returningVisitorsCount / uniqueVisitors) * 100 : 0;

    return NextResponse.json({
      range,
      cards: {
        uniqueVisitors,
        sessions: totalSessions,
        diyasLit: totalDiyasLit,
        wishesAttached,
        customWishes,
        creationAttempts,
        successfulCreations: totalDiyasLit > 0 ? totalDiyasLit : successfulCreations,
        shareMenuOpens,
        whatsappInitiated,
        nativeShareCompleted,
        linkCopies,
        cardDownloads,
        returningVisitors: returningVisitorsCount,
      },
      snapshot: {
        visitorsToday,
        diyasToday,
        completionRate: `${completionRate.toFixed(1)}%`,
        avgCreationsPerVisitor,
        shareActionRate: `${shareActionRate.toFixed(1)}%`,
        returningRate: `${returningRate.toFixed(1)}%`,
      },
      topPages,
      trafficSources,
    });
  } catch (err) {
    console.error("Overview stats error:", err);
    return NextResponse.json({ error: "Failed to compute overview stats" }, { status: 500 });
  }
}
