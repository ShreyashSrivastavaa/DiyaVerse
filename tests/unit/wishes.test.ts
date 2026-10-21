import { describe, it, expect } from "vitest";
import { pickWish } from "@/lib/wishes/pick";

describe("Wish Picker (pick.ts)", () => {
  it("picks an active English wish for English locale", async () => {
    const wish = await pickWish({ locale: "en" });
    expect(wish).toBeDefined();
    expect(wish.id).toBeDefined();
    expect(wish.text).toBeTruthy();
    expect(wish.language).toBe("en");
  });

  it("picks an active Hindi wish for Hindi locale", async () => {
    const wish = await pickWish({ locale: "hi" });
    expect(wish).toBeDefined();
    expect(wish.id).toBeDefined();
    expect(wish.text).toBeTruthy();
    expect(wish.language).toBe("hi");
  });

  it("respects exclusion list when picking wishes", async () => {
    const firstWish = await pickWish({ locale: "en" });
    const secondWish = await pickWish({ locale: "en", excludeIds: [firstWish.id] });
    expect(secondWish.id).not.toBe(firstWish.id);
  });

  it("falls back gracefully when given non-existent locale or empty pool", async () => {
    const wish = await pickWish({ locale: "nonexistent_locale" });
    expect(wish).toBeDefined();
    expect(wish.text).toBeTruthy();
  });
});
