import { test, expect } from "@playwright/test";

test.describe("Phase 1: Core Loop & Public Pages", () => {
  test.beforeEach(async ({ page }) => {
    const randomIp = `10.20.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250 + 1)}`;
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": randomIp,
    });
  });
  test("Homepage loads with truthful zero-or-positive counter and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DiyaVerse/);

    // Hero title
    const heading = page.locator("h1");
    await expect(heading).toContainText("This Diwali, Let's Light India Together");

    // CTA exists (match first instance in header/hero)
    const lightCta = page.getByRole("link", { name: /Light a Diya/i }).first();
    await expect(lightCta).toBeVisible();

    // How it works section exists
    await expect(page.getByText("How DiyaVerse Works")).toBeVisible();
  });

  test("Light-a-Diya blank wish flow with refresh persistence", async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("/light");
    await expect(page.locator("h1")).toContainText("Light Your Sacred Diya");

    // Pick 'Golden Brass' style
    const goldenStyle = page.getByRole("radio", { name: /Golden Brass/i });
    if (await goldenStyle.isVisible()) {
      await goldenStyle.click();
    }

    // Leave wish textarea blank, click submit
    const submitBtn = page.getByRole("button", { name: /Light My Diya/i });
    await submitBtn.click();

    // Wait for lit state and success screen
    await expect(page.getByText(/Share Your Light/i)).toBeVisible({ timeout: 20000 });

    // Ensure URL has ?d=publicId
    expect(page.url()).toContain("/light?d=");
    const urlParts = new URL(page.url());
    const publicId = urlParts.searchParams.get("d");
    expect(publicId).toBeTruthy();

    // Grab the displayed wish text
    const wishQuote = page.locator("blockquote");
    await expect(wishQuote).toBeVisible();
    const wishTextBeforeRefresh = await wishQuote.innerText();
    expect(wishTextBeforeRefresh.length).toBeGreaterThan(10);

    // Refresh the page
    await page.reload();

    // Verify same wish persists without re-rolling
    await expect(page.getByText(/Share Your Light/i)).toBeVisible({ timeout: 20000 });
    const wishTextAfterRefresh = await page.locator("blockquote").innerText();
    expect(wishTextAfterRefresh).toBe(wishTextBeforeRefresh);
  });

  test("Moderation rejects phone number, shows inline message and preserves typed text", async ({ page }) => {
    await page.goto("/light");

    const wishInput = page.locator("#wish-input");
    const badText = "Happy Diwali, please call me at 9876543210 for celebration!";
    await wishInput.fill(badText);

    const submitBtn = page.getByRole("button", { name: /Light My Diya/i });
    await submitBtn.click();

    // Inline moderation alert should appear with phone number warning
    await expect(page.getByText(/phone numbers/i)).toBeVisible({ timeout: 15000 });

    // The user's typed text must remain intact!
    await expect(wishInput).toHaveValue(badText);
  });

  test("Public Diya page /d/[id] renders with openGraph tags and CTA", async ({ page, request }) => {
    // Create a diya via API
    const idempotencyKey = crypto.randomUUID();
    const createRes = await request.post("/api/diyas", {
      headers: {
        "x-forwarded-for": `10.10.1.${Math.floor(Math.random() * 200 + 1)}`,
      },
      data: {
        idempotencyKey,
        style: "lotus",
        locale: "en",
        wishText: "May this festival illuminate your path with wisdom and joy.",
        dedication: "family",
      },
    });
    expect(createRes.status()).toBe(201);
    const { publicId } = await createRes.json();

    // Open public page
    await page.goto(`/d/${publicId}`);
    await expect(page.locator("blockquote")).toContainText("May this festival illuminate your path");
    await expect(page.getByText("For my family")).toBeVisible();

    // Verify OpenGraph meta tags
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute("content", new RegExp(`/d/${publicId}/opengraph-image`));

    // Verify 'Light your own diya' CTA exists
    const lightOwn = page.getByRole("link", { name: /Light your own diya/i });
    await expect(lightOwn).toBeVisible();
    await expect(lightOwn).toHaveAttribute("href", new RegExp(`/light\\?ref=share&src=d_${publicId}`));
  });

  test("Static pages load with expected content", async ({ page }) => {
    test.setTimeout(60000);

    await page.goto("/about");
    await expect(page.locator("h1")).toContainText("About DiyaVerse");

    await page.goto("/privacy");
    await expect(page.locator("h1")).toContainText("Privacy Policy");
    await expect(page.getByText("DPDP Act 2023 Aligned")).toBeVisible();

    await page.goto("/terms");
    await expect(page.locator("h1")).toContainText("Terms of Service");

    await page.goto("/contact");
    await expect(page.locator("h1")).toContainText("Contact Us");
  });
});
