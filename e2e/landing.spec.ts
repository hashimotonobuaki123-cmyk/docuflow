import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should display landing page for unauthenticated users", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/");

    // Check main heading
    await expect(
      page.getByRole("heading", { name: /DocuFlow/ }).first()
    ).toBeVisible();

    // Check CTA buttons
    await expect(page.getByRole("link", { name: /無料で始める/ })).toBeVisible();

    // Check features section
    await expect(page.getByText(/AI 要約/)).toBeVisible();
  });

  test("should have working navigation", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");

    // Click login button
    const loginLink = page.getByRole("link", { name: /ログイン/ }).first();
    await loginLink.click();

    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.context().clearCookies();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Main content should still be visible
    await expect(
      page.getByRole("heading", { name: /DocuFlow/ }).first()
    ).toBeVisible();
  });
});

