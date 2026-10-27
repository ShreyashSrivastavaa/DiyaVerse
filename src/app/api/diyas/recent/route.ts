import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const diyas = await prisma.diya.findMany({
      where: {
        status: "PUBLISHED",
        wishVisible: true,
      },
      include: {
        wish: {
          select: {
            text: true,
            language: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });

    const formatted = diyas.map((d) => ({
      publicId: d.publicId,
      style: d.style,
      wishText: d.customWish || d.wish?.text || "May light triumph over darkness.",
      dedication:
        d.dedicationText ||
        (d.dedication === "family"
          ? "For family"
          : d.dedication === "friends"
          ? "For friends"
          : d.dedication === "loved_ones"
          ? "For loved one"
          : d.dedication === "world"
          ? "For the world"
          : null),
      createdAt: d.createdAt.toISOString(),
    }));

    return NextResponse.json(
      { diyas: formatted },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    try {
      const prodRes = await fetch("https://diyaverse.vercel.app/api/diyas/recent");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        return NextResponse.json(prodData);
      }
    } catch {
      // ignore
    }

    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const mockPath = path.resolve(process.cwd(), "data/mock-wall.json");
      if (fs.existsSync(mockPath)) {
        const raw = fs.readFileSync(mockPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.diyas)) {
          return NextResponse.json({
            diyas: parsed.diyas.slice(0, 6).map((d: any) => ({
              publicId: d.publicId,
              style: d.style,
              wishText: d.wishText,
              dedication: d.dedication,
              createdAt: d.createdAt,
            })),
          });
        }
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ diyas: [] }, { status: 200 });
  }
}
