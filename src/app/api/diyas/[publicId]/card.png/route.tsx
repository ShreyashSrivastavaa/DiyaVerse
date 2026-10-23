import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;

  const diya = await prisma.diya.findUnique({
    where: { publicId },
    include: { wish: true },
  });

  const isVisible = diya && diya.status !== "DELETED" && diya.wishVisible;
  const wishText = isVisible
    ? diya.customWish || diya.wish?.text || "May the festival of lights bring peace and boundless joy."
    : "A quiet diya glowing for Diwali.";

  const dedication =
    isVisible && (diya.dedicationText || (diya.dedication ? `For my ${diya.dedication}` : ""));

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
          backgroundColor: "#0B1030",
          backgroundImage: "radial-gradient(circle at 50% 35%, #1E2660 0%, #0B1030 80%)",
          color: "#FFF8EB",
          padding: "80px 70px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Festive Golden Border */}
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            right: 30,
            bottom: 30,
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
            maxWidth: 880,
          }}
        >
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
              marginBottom: 30,
              boxShadow: "0 0 100px rgba(255, 159, 28, 0.6)",
            }}
          >
            🪔
          </div>

          {dedication ? (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                color: "#FFD98A",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                marginBottom: 24,
                fontWeight: 600,
              }}
            >
              {dedication}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              fontSize: 38,
              textAlign: "center",
              justifyContent: "center",
              lineHeight: 1.45,
              color: "#FFF8EB",
              fontStyle: "italic",
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
            paddingTop: 24,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: "#FFC857", fontWeight: 600 }}>
            Light your own virtual diya at diyaverse.in
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
