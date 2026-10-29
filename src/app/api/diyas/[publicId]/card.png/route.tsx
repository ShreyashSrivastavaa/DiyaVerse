/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const STYLE_IMAGE_MAP: Record<string, string> = {
  marigold: "diya-marigold.png",
  rangoli: "diya-rangoli.png",
  golden: "diya-golden.png",
  brass: "diya-golden.png",
  lotus: "diya-lotus.png",
  clay: "diya-niche.png",
};

function getDiyaBase64(style?: string | null): string {
  const normalized = (style || "").toLowerCase();
  const filename = STYLE_IMAGE_MAP[normalized] || "diya-niche.png";
  try {
    const filePath = path.join(process.cwd(), "public", filename);
    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      return `data:image/png;base64,${buf.toString("base64")}`;
    }
  } catch (err) {
    console.error("Error loading diya image for card:", err);
  }
  return "";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;

  let diya = null;
  try {
    diya = await prisma.diya.findUnique({
      where: { publicId },
      include: { wish: true },
    });
  } catch {
    // continue with fallback
  }

  const isVisible = Boolean(diya && diya.status !== "DELETED" && diya.wishVisible);
  const wishText = isVisible && diya
    ? diya.customWish || diya.wish?.text || "May the festival of lights bring peace and boundless joy."
    : "A quiet diya glowing for Diwali.";

  const dedication =
    isVisible && diya ? (diya.dedicationText || (diya.dedication ? `For my ${diya.dedication}` : "")) : "";

  const diyaBase64 = getDiyaBase64(diya?.style);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1350,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#140206",
          backgroundImage: "radial-gradient(circle at 50% 35%, #3B0A17 0%, #140206 80%)",
          color: "#FFF8EB",
          padding: "70px 70px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Festive Golden Border */}
        <div
          style={{
            position: "absolute",
            top: 26,
            left: 26,
            right: 26,
            bottom: 26,
            border: "2px solid rgba(255, 200, 87, 0.4)",
            borderRadius: 24,
            display: "flex",
          }}
        />

        {/* Top Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#FFC857",
              fontSize: 32,
              fontWeight: "bold",
              letterSpacing: "0.15em",
            }}
          >
            DIYAVERSE
          </div>
          <div
            style={{
              display: "flex",
              color: "#E9DFC8",
              fontSize: 18,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Shubh Deepavali
          </div>
        </div>

        {/* Centerpiece Diya & Glow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: 900,
          }}
        >
          {/* Diya Image in Niche */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            {diyaBase64 ? (
              <img
                src={diyaBase64}
                width="320"
                height="393"
                alt="Sacred Diya"
                style={{
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 217, 138, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 100,
                  boxShadow: "0 0 100px rgba(255, 159, 28, 0.6)",
                }}
              >
                🪔
              </div>
            )}
          </div>

          {dedication ? (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "#FFD98A",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                marginBottom: 20,
                fontWeight: 600,
              }}
            >
              {dedication}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              fontSize: 34,
              textAlign: "center",
              justifyContent: "center",
              lineHeight: 1.45,
              color: "#FFF8EB",
              fontStyle: "italic",
              maxWidth: 820,
            }}
          >
            {`“${wishText}”`}
          </div>
        </div>

        {/* Card Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            borderTop: "1px solid rgba(255, 200, 87, 0.3)",
            paddingTop: 20,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: "#FFC857", fontWeight: 600 }}>
            Light your own virtual diya at diyaverse.vercel.app
          </div>
          <div style={{ display: "flex", fontSize: 16, color: "#E9DFC8" }}>
            {"This Diwali, Let's Light India Together"}
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
    },
  );
}
