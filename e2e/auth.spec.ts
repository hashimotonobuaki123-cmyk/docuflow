import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies();
  });

  test("should display login page correctly", async ({ page }) => {
    await page.goto("/auth/login");

    // Check page title
    await expect(page).toHaveTitle(/DocuFlow/);

    // Check login form elements
    await expect(page.getByLabel(/メールアドレス/)).toBeVisible();
    await expect(page.getByLabel(/パスワード/)).toBeVisible();
    await expect(page.getByRole("button", { name: /ログイン/ })).toBeVisible();

    // Check links
    await expect(page.getByRole("link", { name: /新規登録/ })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /パスワードを忘れた/ })
    ).toBeVisible();
  });

  test("should display signup page correctly", async ({ page }) => {
    await page.goto("/auth/signup");

    // Check signup form elements
    await expect(page.getByLabel(/メールアドレス/)).toBeVisible();
    await expect(page.getByLabel("パスワード", { exact: true })).toBeVisible();
    await expect(page.getByLabel(/パスワード（確認）/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /アカウントを作成/ })
    ).toBeVisible();

    // Check terms checkbox
    await expect(page.getByRole("checkbox")).toBeVisible();
  });

  test("should show validation error on empty login", async ({ page }) => {
    await page.goto("/auth/login");

    // Click login without entering credentials
    await page.getByRole("button", { name: /ログイン/ }).click();

    // Browser's native validation should prevent submission
    // Check that we're still on the login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("should show password mismatch error on signup", async ({ page }) => {
    await page.goto("/auth/signup");

    // Fill in mismatched passwords
    await page.getByLabel(/メールアドレス/).fill("test@example.com");
    await page.getByLabel("パスワード", { exact: true }).fill("password123");
    await page.getByLabel(/パスワード（確認）/).fill("differentpassword");
    await page.getByRole("checkbox").check();

    // Submit form
    await page.getByRole("button", { name: /アカウントを作成/ }).click();

    // Check for error message
    await expect(page.getByText(/パスワードが一致しません/)).toBeVisible();
  });

  test("should navigate between login and signup", async ({ page }) => {
    await page.goto("/auth/login");

    // Click signup link
    await page.getByRole("link", { name: /新規登録/ }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);

    // Click login link
    await page.getByRole("link", { name: /ログイン/ }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("should display forgot password page", async ({ page }) => {
    await page.goto("/auth/forgot");

    await expect(
      page.getByRole("heading", { name: /パスワードリセット/ })
    ).toBeVisible();
    await expect(page.getByLabel(/メールアドレス/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /リセットメールを送信/ })
    ).toBeVisible();
  });

  test("should redirect unauthenticated users from protected routes", async ({
    page,
  }) => {
    // Try to access dashboard without login
    await page.goto("/app");

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

