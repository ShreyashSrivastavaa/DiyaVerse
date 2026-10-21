import { describe, it, expect } from "vitest";
import { DIYA_STYLES } from "@/components/public/DiyaSprite";

describe("Phase 0 Foundations", () => {
  it("has exactly 5 specified diya styles", () => {
    expect(DIYA_STYLES).toHaveLength(5);
    const styleIds = DIYA_STYLES.map((s) => s.id);
    expect(styleIds).toEqual(["clay", "marigold", "rangoli", "golden", "lotus"]);
  });

  it("exports valid database environment configuration", async () => {
    const { env } = await import("@/lib/env");
    expect(env.DATABASE_URL).toContain("postgres");
    expect(env.DIRECT_URL).toContain("postgres");
    expect(env.SESSION_SECRET).toBeDefined();
    expect(env.IP_HASH_SALT).toBeDefined();
  });
});
