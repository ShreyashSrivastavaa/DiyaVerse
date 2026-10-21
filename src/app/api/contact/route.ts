import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getDailyIpHash } from "@/lib/ratelimit";
import { moderateText } from "@/lib/moderation/moderate";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
  publicId: z.string().max(30).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const identityHash = getDailyIpHash(ip);

    // Rate limit: 5 contact requests per hour
    const rateCheck = await checkRateLimit({
      key: `contact:${identityHash}`,
      max: 5,
      windowMs: 3600 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many contact messages sent. Please wait before reaching out again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide valid contact information and message." },
        { status: 400 }
      );
    }

    const { name, email, message, publicId } = parsed.data;

    // Moderation check on message
    const modCheck = moderateText(message);
    if (!modCheck.ok) {
      return NextResponse.json(
        { error: "Message contains unacceptable characters or offensive content." },
        { status: 422 }
      );
    }

    // In production, this can forward to an email provider or log
    console.info(`[Contact Message Received] From: ${name} <${email}> PublicId: ${publicId || "none"}`);

    return NextResponse.json({
      success: true,
      message: "Your message has been received. Our team will review it shortly.",
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
