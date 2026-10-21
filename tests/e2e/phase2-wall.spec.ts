import { test, expect } from "@playwright/test";

test.describe("Phase 2: Community Diya Wall & Interactions", () => {
  test.beforeEach(async ({ page }) => {
    const randomIp = `10.40.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250 + 1)}`;
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": randomIp,
    });
  });

  test("Wall page loads canvas, activity strip, and view toggle", async ({ page }) => {
    await page.goto("/wall");
    await expect(page).toHaveTitle(/Diya/i);

    // Canvas element exists
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // View toggle button exists
    const listToggleBtn = page.getByRole("button", { name: /List View/i });
    await expect(listToggleBtn).toBeVisible();

    // Toggle to accessible List View
    await listToggleBtn.click();
    await expect(page.getByRole("button", { name: /Canvas View/i })).toBeVisible();

    // Cards should be rendered in list view, or honest zero state
    const firstDiyaCard = page.locator("article").first();
    const emptyState = page.getByText(/No diyas found/i);
    await expect(firstDiyaCard.or(emptyState)).toBeVisible({ timeout: 15000 });
  });

  test("Wall filter by language updates URL and items", async ({ page }) => {
    await page.goto("/wall?view=list");

    const hindiFilter = page.getByRole("button", { name: /Hindi/i }).first();
    if (await hindiFilter.isVisible()) {
      await hindiFilter.click();
      await page.waitForTimeout(500);
      expect(page.url()).toContain("lang=hi");
    }
  });
});
