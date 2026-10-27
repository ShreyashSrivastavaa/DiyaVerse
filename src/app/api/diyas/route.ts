import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIdentity } from "@/lib/ratelimit";
import { generatePublicId, isValidUUID } from "@/lib/ids";
import { graphemeCount, normalizeText } from "@/lib/text";
import { moderateText } from "@/lib/moderation/moderate";
import { pickWish } from "@/lib/wishes/pick";
import { Prisma } from "@prisma/client";

const diyaCreateSchema = z.object({
  idempotencyKey: z.string().refine(isValidUUID, {
    message: "idempotencyKey must be a valid UUID v4",
  }),
  style: z.enum(["clay", "marigold", "rangoli", "golden", "lotus"]),
  wishText: z
    .string()
    .optional()
    .transform((val) => (val ? normalizeText(val) : undefined))
    .refine((val) => !val || graphemeCount(val) <= 140, {
      message: "Wish cannot exceed 140 characters",
    }),
  previewWishId: z.string().optional(),
  dedication: z
    .enum(["family", "friends", "loved_ones", "love", "world", "custom"])
    .optional()
    .transform((val) => (val === "love" ? "loved_ones" : val)),
  dedicationText: z
    .string()
    .optional()
    .transform((val) => (val ? normalizeText(val) : undefined))
    .refine((val) => !val || graphemeCount(val) <= 30, {
      message: "Dedication cannot exceed 30 characters",
    }),
  locale: z.enum(["en", "hi", "hinglish"]).default("en"),
  sessionId: z.string().optional(),
  attribution: z
    .object({
      utmSource: z.string().optional(),
      utmCampaign: z.string().optional(),
      refPublicId: z.string().optional(),
      ref: z.string().optional(),
    })
    .optional()
    .transform((attr) => {
      if (!attr) return undefined;
      return {
        utmSource: attr.utmSource,
        utmCampaign: attr.utmCampaign,
        refPublicId: attr.refPublicId || attr.ref,
      };
    }),
});

export async function POST(req: NextRequest) {
  // Body size guard (4 KB max)
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 4096) {
    return NextResponse.json(
      { error: "Payload too large. Maximum 4KB allowed." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 1. Zod Validation
  const parseResult = diyaCreateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.format() },
      { status: 400 },
    );
  }

  const data = parseResult.data;

  // 2. Idempotency Check: Return existing diya if idempotencyKey was already processed
  try {
    const existingDiya = await prisma.diya.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
      include: { wish: true },
    });

    if (existingDiya) {
      return NextResponse.json(
        {
          publicId: existingDiya.publicId,
          url: `/d/${existingDiya.publicId}`,
          style: existingDiya.style,
          wish: {
            text: existingDiya.customWish || existingDiya.wish?.text || "",
            language: existingDiya.locale,
            source: existingDiya.wishSource,
          },
          dedication: existingDiya.dedication,
          dedicationText: existingDiya.dedicationText,
        },
        { status: 200 },
      );
    }
  } catch {
    // Continue if local DB is not connected
  }

  // 3. Rate Limiting (10 per hour, 3 per minute per identity)
  const identity = getClientIdentity(req, data.sessionId);

  const hourLimit = await checkRateLimit({
    key: `diya:hour:${identity}`,
    max: 10,
    windowMs: 60 * 60 * 1000,
  });

  const minLimit = await checkRateLimit({
    key: `diya:min:${identity}`,
    max: 3,
    windowMs: 60 * 1000,
  });

  if (!hourLimit.success || !minLimit.success) {
    return NextResponse.json(
      {
        error: "Too many diyas lit recently. Please wait a moment before lighting another.",
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      },
    );
  }

  // 4. Moderation
  if (data.wishText) {
    const modResult = moderateText(data.wishText, data.locale);
    if (!modResult.ok) {
      return NextResponse.json(
        {
          error: modResult.reason || "Wish could not be accepted.",
          code: "WISH_REJECTED",
        },
        { status: 422 },
      );
    }
  }

  if (data.dedicationText) {
    const modResult = moderateText(data.dedicationText, data.locale);
    if (!modResult.ok) {
      return NextResponse.json(
        {
          error: modResult.reason || "Dedication could not be accepted.",
          code: "DEDICATION_REJECTED",
        },
        { status: 422 },
      );
    }
  }

  // 5. Wish Selection
  let assignedWishId: string | null = null;
  let wishTextToReturn = data.wishText || "";
  let wishLangToReturn = data.locale;

  if (!data.wishText) {
    if (data.previewWishId) {
      try {
        const previewWish = await prisma.wish.findFirst({
          where: { id: data.previewWishId, active: true },
        });
        if (previewWish) {
          assignedWishId = previewWish.id;
          wishTextToReturn = previewWish.text;
          wishLangToReturn = previewWish.language as "en" | "hi" | "hinglish";
        }
      } catch {
        // Continue if local DB is not connected
      }
    }

    if (!assignedWishId) {
      const picked = await pickWish({ locale: data.locale });
      assignedWishId = picked.id === "W-FALLBACK" ? null : picked.id;
      wishTextToReturn = picked.text;
      wishLangToReturn = picked.language as "en" | "hi" | "hinglish";
    }
  }

  const publicId = generatePublicId();

  // 6. Transactional Database Insert and Atomic Counter Update
  try {
    const newDiya = await prisma.$transaction(async (tx) => {
      // Insert Diya row
      const diya = await tx.diya.create({
        data: {
          publicId,
          idempotencyKey: data.idempotencyKey,
          style: data.style,
          occasion: "diwali",
          locale: data.locale,
          wishSource: data.wishText ? "CUSTOM" : "LIBRARY",
          wishId: assignedWishId,
          customWish: data.wishText || null,
          wishVisible: true,
          dedication: data.dedication || null,
          dedicationText: data.dedicationText || null,
          status: "PUBLISHED",
          sessionId: data.sessionId || null,
          utmSource: data.attribution?.utmSource || null,
          utmCampaign: data.attribution?.utmCampaign || null,
          refPublicId: data.attribution?.refPublicId || null,
        },
        include: { wish: true },
      });

      // Increment counters atomically
      await tx.counter.upsert({
        where: { key: "diyas_total" },
        update: { value: { increment: 1 } },
        create: { key: "diyas_total", value: BigInt(1) },
      });

      await tx.counter.upsert({
        where: { key: "wishes_shared" },
        update: { value: { increment: 1 } },
        create: { key: "wishes_shared", value: BigInt(1) },
      });

      return diya;
    });

    return NextResponse.json(
      {
        publicId: newDiya.publicId,
        url: `/d/${newDiya.publicId}`,
        style: newDiya.style,
        wish: {
          text: wishTextToReturn,
          language: wishLangToReturn,
          source: newDiya.wishSource,
        },
        dedication: newDiya.dedication,
        dedicationText: newDiya.dedicationText,
      },
      { status: 201 },
    );
  } catch (error) {
    // Unique violation catch on idempotencyKey (race conditions)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      try {
        const racedDiya = await prisma.diya.findUnique({
          where: { idempotencyKey: data.idempotencyKey },
          include: { wish: true },
        });
        if (racedDiya) {
          return NextResponse.json(
            {
              publicId: racedDiya.publicId,
              url: `/d/${racedDiya.publicId}`,
              style: racedDiya.style,
              wish: {
                text: racedDiya.customWish || racedDiya.wish?.text || "",
                language: racedDiya.locale,
                source: racedDiya.wishSource,
              },
              dedication: racedDiya.dedication,
              dedicationText: racedDiya.dedicationText,
            },
            { status: 200 },
          );
        }
      } catch {
        // ignore
      }
    }

    // When local DB is not connected, record into mock-wall.json and return created diya for UI preview
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const mockPath = path.resolve(process.cwd(), "data/mock-wall.json");
      if (fs.existsSync(mockPath)) {
        const raw = fs.readFileSync(mockPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.diyas)) {
          const newMockDiya = {
            id: `local-${publicId}`,
            publicId,
            seq: (parsed.diyas[0]?.seq || 84) + 1,
            style: data.style,
            locale: data.locale,
            wishText: wishTextToReturn,
            dedication: data.dedicationText || (data.dedication ? `For ${data.dedication}` : null),
            createdAt: new Date().toISOString(),
          };
          parsed.diyas.unshift(newMockDiya);
          fs.writeFileSync(mockPath, JSON.stringify(parsed, null, 2), "utf-8");
        }
      }
    } catch {
      // ignore
    }

    return NextResponse.json(
      {
        publicId,
        url: `/d/${publicId}`,
        style: data.style,
        wish: {
          text: wishTextToReturn,
          language: wishLangToReturn,
          source: data.wishText ? "CUSTOM" : "LIBRARY",
        },
        dedication: data.dedication || null,
        dedicationText: data.dedicationText || null,
      },
      { status: 201 },
    );
  }
}
