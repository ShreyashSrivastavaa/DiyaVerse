import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidPublicId } from "@/lib/ids";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;

  if (!isValidPublicId(publicId)) {
    return NextResponse.json({ error: "Invalid Diya ID format" }, { status: 400 });
  }

  let diya = null;
  try {
    diya = await prisma.diya.findUnique({
      where: { publicId },
      include: { wish: true },
    });
  } catch {
    // If local DB is not connected, try fetching from production
    try {
      const prodRes = await fetch(`https://diyaverse.vercel.app/api/diyas/${publicId}`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        return NextResponse.json(prodData);
      }
    } catch {
      // ignore
    }

    // Try mock-wall.json
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const mockPath = path.resolve(process.cwd(), "data/mock-wall.json");
      if (fs.existsSync(mockPath)) {
        const raw = fs.readFileSync(mockPath, "utf-8");
        const parsed = JSON.parse(raw);
        const found = parsed.diyas?.find((d: any) => d.publicId === publicId);
        if (found) {
          return NextResponse.json({
            publicId: found.publicId,
            style: found.style,
            createdAt: found.createdAt,
            locale: found.locale,
            wish: {
              text: found.wishText,
              language: found.locale,
              hidden: false,
            },
            dedication: found.dedication,
            dedicationText: null,
            status: "PUBLISHED",
          });
        }
      }
    } catch {
      // ignore
    }
  }

  if (!diya || diya.status === "DELETED") {
    return NextResponse.json(
      { error: "This diya is resting or could not be found." },
      { status: 404 },
    );
  }

  const isWishHidden = !diya.wishVisible || diya.status === "HIDDEN";

  return NextResponse.json({
    publicId: diya.publicId,
    style: diya.style,
    createdAt: diya.createdAt,
    locale: diya.locale,
    wish: {
      text: isWishHidden ? "A quiet diya" : diya.customWish || diya.wish?.text || "",
      language: diya.locale,
      hidden: isWishHidden,
    },
    dedication: isWishHidden ? null : diya.dedication,
    dedicationText: isWishHidden ? null : diya.dedicationText,
    status: diya.status,
  });
}
