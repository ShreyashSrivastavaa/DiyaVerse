/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const alt = "DiyaVerse | This Diwali, Let's Light India Together";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  let diyaBase64 = "";
  try {
    const filePath = path.join(process.cwd(), "public", "diya-golden.png");
    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      diyaBase64 = `data:image/png;base64,${buf.toString("base64")}`;
    }
  } catch (err) {
    console.error("Failed to load diya-golden.png for root OG image:", err);
  }

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
          backgroundImage: "radial-gradient(circle at 50% 35%, #420A17 0%, #140206 80%)",
          color: "#FFF8EB",
          padding: "48px 60px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Festive Golden Border */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: "2px solid rgba(255, 200, 87, 0.4)",
            borderRadius: 20,
            display: "flex",
          }}
        />

        {/* Top Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#FFC857",
              fontSize: 34,
              fontWeight: "bold",
              letterSpacing: "0.2em",
            }}
          >
            DIYAVERSE
          </div>
          <div
            style={{
              display: "flex",
              color: "#E9DFC8",
              fontSize: 16,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            अखंड दीप • Shubh Deepavali
          </div>
        </div>

        {/* Central Diya Motif & Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Diya Graphic */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            {diyaBase64 ? (
              <img
                src={diyaBase64}
                width="160"
                height="197"
                alt="Sacred Golden Diya"
                style={{
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 200, 87, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 70,
                }}
              >
                🪔
              </div>
            )}
          </div>

          {/* Main Tagline */}
          <div
            style={{
              display: "flex",
              fontSize: 42,
              fontWeight: 800,
              color: "#FFF8EB",
              textAlign: "center",
              letterSpacing: "-0.01em",
              marginBottom: 10,
            }}
          >
            This Diwali, Let&apos;s Light India Together
          </div>

          {/* Subtitle */}
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#FFD98A",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            Light a virtual diya, attach your wish & illuminate the nation
          </div>
        </div>

        {/* Footer Brand Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 200, 87, 0.25)",
            paddingTop: 16,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <div style={{ display: "flex", fontSize: 18, color: "#FFC857", fontWeight: 600 }}>
            diyaverse.vercel.app
          </div>
          <div style={{ display: "flex", fontSize: 16, color: "#E9DFC8" }}>
            Virtual Diya • Live Diya Wall • Ramayana Quiz
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
