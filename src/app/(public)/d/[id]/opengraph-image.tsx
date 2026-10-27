import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "DiyaVerse Lit Diya Greeting Card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          padding: "50px 80px",
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
            pointerEvents: "none",
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
          <span>🪔</span>
          <span>DIYAVERSE</span>
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
              width: 100,
              height: 100,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 217, 138, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
              marginBottom: 10,
              boxShadow: "0 0 60px rgba(255, 159, 28, 0.5)",
            }}
          >
            🪔
          </div>

          {dedication && (
            <div
              style={{
                fontSize: 20,
                color: "#FFD98A",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              {dedication}
            </div>
          )}

          {/* Wish Content */}
          <div
            style={{
              fontSize: 32,
              textAlign: "center",
              lineHeight: 1.4,
              color: "#FFF8EB",
              maxWidth: 900,
              fontStyle: "italic",
            }}
          >
            &ldquo;{wishText}&rdquo;
          </div>
        </div>

        {/* Bottom invitation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontSize: 16,
            color: "#E9DFC8",
            borderTop: "1px solid rgba(255, 200, 87, 0.2)",
            paddingTop: 16,
          }}
        >
          <span>Happy Diwali • Light India Together</span>
          <span style={{ color: "#FFC857" }}>diyaverse.in</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
