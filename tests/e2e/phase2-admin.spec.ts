import { test, expect } from "@playwright/test";

test.describe("Phase 2: Admin Console & Security", () => {
  test.beforeEach(async ({ page }) => {
    const randomIp = `10.50.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250 + 1)}`;
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": randomIp,
    });
  });

  test("Unauthenticated access to /admin redirects to /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("h1")).toContainText(/DiyaVerse Console/i);
  });

  test("Login with invalid password shows authentication failure", async ({ page }) => {
    await page.goto("/admin/login");

    const testEmail = `test-${Date.now()}@diyaverse.in`;
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("Login with owner credentials, view dashboard, navigate tabs, and logout", async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("/admin/login");

    // Live provisioned credentials from admin-create.ts
    await page.fill('input[name="email"]', "shreyashsr2004@gmail.com");
    await page.fill('input[name="password"]', "13579");
    await page.click('button[type="submit"]');

    // Should redirect to /admin dashboard
    await expect(page).toHaveURL("/admin", { timeout: 15000 });
    await expect(page.getByText(/Diwali Overview Dashboard/i)).toBeVisible();

    // Check metric cards present
    await expect(page.getByText(/Unique Visitors/i).first()).toBeVisible();
    await expect(page.getByText(/Diyas Lit/i).first()).toBeVisible();

    // Navigate to Analytics
    await page.goto("/admin/analytics");
    await expect(page.getByText(/Analytics & Trends/i)).toBeVisible({ timeout: 15000 });

    // Navigate to Diyas
    await page.goto("/admin/diyas");
    await expect(page.getByText(/Diya Moderation & Management/i)).toBeVisible({ timeout: 15000 });

    // Navigate to Wishes
    await page.goto("/admin/wishes");
    await expect(page.getByText(/Wish Library Browser/i)).toBeVisible({ timeout: 15000 });

    // Navigate to Health
    await page.goto("/admin/health");
    await expect(page.getByText(/System Health & Data Integrity/i)).toBeVisible({ timeout: 15000 });

    // Sign out
    const signOutBtn = page.getByRole("button", { name: /Sign Out/i }).first();
    await signOutBtn.click();

    // Should redirect back to /admin/login
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
  });
});
