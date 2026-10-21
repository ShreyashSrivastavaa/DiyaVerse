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

  const diya = await prisma.diya.findUnique({
    where: { publicId },
    include: { wish: true },
  });

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
