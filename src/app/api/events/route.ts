import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit, getDailyIpHash } from "@/lib/ratelimit";

// Detect coarse device category and browser family from User-Agent
function parseUserAgent(ua: string | null): { device: string; browser: string; isBot: boolean } {
  if (!ua) return { device: "desktop", browser: "unknown", isBot: false };

  const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(ua);

  let device = "desktop";
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    device = "mobile";
  } else if (/ipad|tablet/i.test(ua)) {
    device = "tablet";
  }

  let browser = "other";
  if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = "chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "safari";
  else if (/firefox/i.test(ua)) browser = "firefox";
  else if (/edg/i.test(ua)) browser = "edge";

  return { device, browser, isBot };
}

// Strict allowlist per event schema - NO FREE TEXT ALLOWED
const singleEventSchema = z.object({
  name: z.enum([
    "page_viewed",
    "cta_light_clicked",
    "creator_opened",
    "style_selected",
    "wish_edited",
    "surprise_me_clicked",
    "diya_submit_attempted",
    "diya_created",
    "diya_creation_failed",
    "wall_opened",
    "wall_filter_changed",
    "diya_opened",
    "share_menu_opened",
    "share_whatsapp_initiated",
    "share_native_completed",
    "link_copied",
    "card_downloaded",
    "language_changed",
    "report_submitted",
    "visitor_returned",
  ]),
  ts: z.number().int().positive(),
  sessionId: z.string().uuid(),
  visitorId: z.string().uuid().optional(),
  path: z.string().max(200),
  referrer: z.string().max(100).optional(),
  utmSource: z.string().max(50).optional(),
  utmMedium: z.string().max(50).optional(),
  utmCampaign: z.string().max(50).optional(),
  locale: z.string().max(10).optional(),
  props: z
    .record(
      z.union([z.string().max(50), z.number(), z.boolean(), z.null()])
    )
    .optional(),
});

const batchEventsSchema = z.object({
  events: z.array(singleEventSchema).max(30),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const identityHash = getDailyIpHash(ip);

    // Rate limiting: 120 requests per minute
    const rateCheck = await checkRateLimit({
      key: `events:${identityHash}`,
      max: 120,
      windowMs: 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = batchEventsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid analytics batch", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { events } = parsed.data;
    if (events.length === 0) {
      return NextResponse.json({ received: 0 });
    }

    const ua = req.headers.get("user-agent");
    const { device, browser, isBot } = parseUserAgent(ua);

    // Group events by session
    const firstEvent = events[0];
    const sessionId = firstEvent.sessionId;
    const visitorId = firstEvent.visitorId;

    // Upsert session
    await prisma.session.upsert({
      where: { id: sessionId },
      update: {
        lastSeenAt: new Date(),
        visitorId: visitorId || undefined,
      },
      create: {
        id: sessionId,
        visitorId: visitorId || null,
        device,
        browser,
        locale: firstEvent.locale || null,
        source: firstEvent.referrer || firstEvent.utmSource || null,
        medium: firstEvent.utmMedium || null,
        campaign: firstEvent.utmCampaign || null,
        landingPath: firstEvent.path,
        isBot,
      },
    });

    // Bulk insert analytics events
    await prisma.analyticsEvent.createMany({
      data: events.map((e) => ({
        sessionId: e.sessionId,
        name: e.name,
        path: e.path,
        props: e.props || {},
        occurredAt: new Date(e.ts),
      })),
    });

    return NextResponse.json({ received: events.length }, { status: 200 });
  } catch (error) {
    console.error("Analytics ingestion error:", error);
    // Silent drop on client side expectation, return standard error
    return NextResponse.json({ error: "Ingestion failure" }, { status: 500 });
  }
}
