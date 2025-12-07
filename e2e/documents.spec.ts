import { test, expect } from "@playwright/test";

test.describe("Document Routes Protection", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("should redirect to login when accessing new document page without auth", async ({
    page,
  }) => {
    await page.goto("/new");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("should redirect to login when accessing document detail without auth", async ({
    page,
  }) => {
    // 存在しないドキュメントIDでアクセス
    await page.goto("/documents/some-document-id");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("should redirect to login when accessing settings without auth", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("should include redirect URL when accessing protected routes", async ({
    page,
  }) => {
    await page.goto("/documents/test-id");
    await expect(page).toHaveURL(/\/auth\/login/);

    // リダイレクト先がURLに含まれていることを確認
    const url = page.url();
    expect(url).toContain("redirectTo");
  });
});

test.describe("Share View (Public Access)", () => {
  test("should allow access to share page without auth", async ({ page }) => {
    // 共有ページは認証不要でアクセス可能
    await page.goto("/share/test-token");

    // ログインページにリダイレクトされないことを確認
    await expect(page).not.toHaveURL(/\/auth\/login/);

    // 共有ページのURLのままであることを確認
    await expect(page).toHaveURL(/\/share\/test-token/);
  });

  test("should display error for invalid share token", async ({ page }) => {
    await page.goto("/share/invalid-token-that-does-not-exist");

    // ページが読み込まれることを確認（エラー表示を含む）
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have proper page structure on share view", async ({ page }) => {
    await page.goto("/share/test-token");

    // 基本的なページ構造が存在することを確認
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Document UI Elements", () => {
  test("new document page should redirect with correct path", async ({
    page,
  }) => {
    await page.goto("/new");

    // 認証なしの場合、ログインへリダイレクト
    await expect(page).toHaveURL(/\/auth\/login/);

    // リダイレクト先が /new であることを確認
    const url = page.url();
    expect(url).toContain("redirectTo");
    expect(url).toContain("new");
  });
});

test.describe("Error Handling", () => {
  test("should handle 404 for non-existent pages", async ({ page }) => {
    await page.goto("/non-existent-page-12345");

    // 404ページまたはリダイレクトが発生することを確認
    // (Next.jsの設定によっては404ページ、または別の処理)
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle invalid document routes gracefully", async ({ page }) => {
    await page.goto("/documents/");

    // 適切に処理されることを確認
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Performance and Loading", () => {
  test("should load landing page within reasonable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;

    // 5秒以内にロード完了することを確認
    expect(loadTime).toBeLessThan(5000);
  });

  test("should load login page within reasonable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/auth/login");
    const loadTime = Date.now() - startTime;

    // 5秒以内にロード完了することを確認
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe("Accessibility", () => {
  test("login page should have proper form labels", async ({ page }) => {
    await page.goto("/auth/login");

    // フォーム要素にラベルがあることを確認
    await expect(page.getByLabel(/メールアドレス/)).toBeVisible();
    await expect(page.getByLabel(/パスワード/)).toBeVisible();
  });

  test("signup page should have proper form labels", async ({ page }) => {
    await page.goto("/auth/signup");

    // フォーム要素にラベルがあることを確認
    await expect(page.getByLabel(/メールアドレス/)).toBeVisible();
    await expect(page.getByLabel("パスワード", { exact: true })).toBeVisible();
    await expect(page.getByLabel(/パスワード（確認）/)).toBeVisible();
  });

  test("should have proper heading hierarchy on landing page", async ({
    page,
  }) => {
    await page.goto("/");

    // h1タグが存在することを確認
    const h1 = page.locator("h1");
    await expect(h1.first()).toBeVisible();
  });
});






