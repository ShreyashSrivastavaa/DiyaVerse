/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const alt = "DiyaVerse Lit Diya Greeting Card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
    console.error("Failed to load diya image for OG:", err);
  }
  return "";
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let diya = null;
  try {
    diya = await prisma.diya.findUnique({
      where: { publicId: id },
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
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#140206",
          backgroundImage: "radial-gradient(circle at 50% 30%, #3B0A17 0%, #140206 70%)",
          color: "#FFF8EB",
          padding: "40px 60px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Subtle decorative border */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: "1px solid rgba(255, 200, 87, 0.3)",
            borderRadius: 16,
            display: "flex",
          }}
        />

        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#FFC857",
            fontSize: 24,
            fontWeight: "bold",
            letterSpacing: "0.05em",
          }}
        >
          <span>DIYAVERSE</span>
          <span style={{ fontSize: 16, color: "#E9DFC8", fontWeight: 400 }}>• Shubh Deepavali</span>
        </div>

        {/* Central Diya Graphic */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            {diyaBase64 ? (
              <img
                src={diyaBase64}
                width="150"
                height="184"
                alt="Lit Diya"
                style={{
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 217, 138, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 60,
                  boxShadow: "0 0 60px rgba(255, 159, 28, 0.5)",
                }}
              >
                🪔
              </div>
            )}
          </div>

          {dedication && (
            <div
              style={{
                fontSize: 20,
                color: "#FFD98A",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 12,
                fontWeight: 600,
                display: "flex",
              }}
            >
              {dedication}
            </div>
          )}

          {/* Wish Content */}
          <div
            style={{
              fontSize: 28,
              textAlign: "center",
              lineHeight: 1.4,
              color: "#FFF8EB",
              maxWidth: 900,
              fontStyle: "italic",
              display: "flex",
            }}
          >
            &ldquo;{wishText}&rdquo;
          </div>
        </div>

        {/* Bottom invitation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderTop: "1px solid rgba(255, 200, 87, 0.2)",
            paddingTop: 16,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <div style={{ fontSize: 16, color: "#FFC857", fontWeight: 600, display: "flex" }}>
            diyaverse.vercel.app
          </div>
          <div style={{ fontSize: 15, color: "#E9DFC8", display: "flex" }}>
            This Diwali, Let&apos;s Light India Together
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
