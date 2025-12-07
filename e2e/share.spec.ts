import { test, expect } from "@playwright/test";

test.describe("Share Page", () => {
  test("should show error for invalid share token", async ({ page }) => {
    // Try to access a share page with invalid token
    await page.goto("/share/invalid-token-12345");

    // Should show error or not found message
    const errorMessage = page.getByText(
      /見つかりません|存在しません|無効|エラー/
    );
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test("should not require authentication", async ({ page }) => {
    await page.context().clearCookies();

    // Try to access a share page - should not redirect to login
    const response = await page.goto("/share/test-token");

    // Should not redirect to login page
    expect(page.url()).not.toContain("/auth/login");
  });
});






