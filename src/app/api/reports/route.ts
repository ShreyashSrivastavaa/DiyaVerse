import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit, getDailyIpHash } from "@/lib/ratelimit";
import { moderateText } from "@/lib/moderation/moderate";

const reportSchema = z.object({
  diyaPublicId: z.string().min(5).max(30),
  reason: z.enum(["offensive", "personal_info", "spam", "other"]),
  note: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const identityHash = getDailyIpHash(ip);

    // Rate limit: 10 reports per hour
    const rateCheck = await checkRateLimit({
      key: `report:${identityHash}`,
      max: 10,
      windowMs: 3600 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many reports submitted. Please wait before reporting again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid report data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { diyaPublicId, reason, note } = parsed.data;

    // Optional moderation check on note text
    if (note) {
      const modCheck = moderateText(note);
      if (!modCheck.ok) {
        return NextResponse.json(
          { error: "Report note contains disallowed characters or terms." },
          { status: 422 }
        );
      }
    }

    const diya = await prisma.diya.findUnique({
      where: { publicId: diyaPublicId },
    });

    if (!diya) {
      return NextResponse.json(
        { error: "Diya not found" },
        { status: 404 }
      );
    }

    // Insert Report, handling duplicate reports by same reporter hash gracefully
    try {
      await prisma.report.create({
        data: {
          diyaId: diya.id,
          reason,
          note: note ? note.trim() : null,
          reporterHash: identityHash,
        },
      });
    } catch (err: unknown) {
      // Prisma unique violation code P2002
      if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
        return NextResponse.json({
          success: true,
          message: "Report already received for this diya today.",
        });
      }
      throw err;
    }

    // Check Auto-hide rule: 3 or more distinct reports auto-hides the wish
    const reportCount = await prisma.report.count({
      where: { diyaId: diya.id },
    });

    if (reportCount >= 3 && diya.wishVisible) {
      await prisma.diya.update({
        where: { id: diya.id },
        data: { wishVisible: false },
      });
    }

    return NextResponse.json({ success: true, reportCount });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the report" },
      { status: 500 }
    );
  }
}
