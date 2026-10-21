import { NextRequest, NextResponse } from "next/server";
import { pickWish } from "@/lib/wishes/pick";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const locale = searchParams.get("locale") || "en";
  const excludeParam = searchParams.get("exclude") || "";
  const excludeIds = excludeParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const wish = await pickWish({ locale, excludeIds });

  return NextResponse.json(wish, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
