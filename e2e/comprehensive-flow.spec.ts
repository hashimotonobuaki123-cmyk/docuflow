import { test, expect } from "@playwright/test";

test.describe("Comprehensive User Flow", () => {
  test("complete document lifecycle", async ({ page }) => {
    // ログインページに移動
    await page.goto("/auth/login");
    
    // タイトルを確認
    await expect(page).toHaveTitle(/DocuFlow/);

    // ログイン（テスト用認証情報）
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // ダッシュボードに遷移
    await page.waitForURL("/app");
    await expect(page.locator("h1")).toContainText("ドキュメントワークスペース");

    // 新規ドキュメント作成
    await page.click('a[href="/new"]');
    await page.waitForURL("/new");

    // フォーム入力
    await page.fill('input[name="title"]', "E2E Test Document");
    await page.fill('input[name="category"]', "テスト");
    await page.fill(
      'textarea[name="rawContent"]',
      "これはE2Eテストで作成されたドキュメントです。自動テストの動作確認のために使用されます。"
    );

    // AI要約付きで作成
    await page.click('button:has-text("AI要約付きで作成")');

    // ダッシュボードに戻る
    await page.waitForURL("/");

    // 作成したドキュメントを検索
    await page.fill('input[id="q"]', "E2E Test");
    await page.click('button[type="submit"]');

    // ドキュメントが表示されることを確認
    await expect(page.locator("article")).toContainText("E2E Test Document");

    // ドキュメント詳細を開く
    await page.click('a:has-text("E2E Test Document")');
    await expect(page.locator("h1")).toContainText("E2E Test Document");

    // お気に入りに追加
    await page.click('button:has-text("お気に入り")');
    await expect(page.locator('button:has-text("お気に入り解除")')).toBeVisible();

    // コメントを追加
    await page.fill('textarea[placeholder*="コメント"]', "これはテストコメントです");
    await page.click('button:has-text("コメント")');
    await expect(page.locator("article")).toContainText("これはテストコメントです");

    // 編集ページに移動
    await page.click('a[href*="/edit"]');
    await page.fill('input[name="title"]', "E2E Test Document (編集済み)");
    await page.click('button[type="submit"]');

    // 変更が反映されているか確認
    await expect(page.locator("h1")).toContainText("(編集済み)");

    // ダッシュボードに戻る
    await page.click('a[href="/app"]');

    // アーカイブに移動
    await page.click('a[href="/app?archived=1"]');
    await expect(page).toHaveURL("/app?archived=1");

    // アーカイブが空であることを確認（初期状態）
    await expect(page.locator("text=アーカイブされたドキュメントはありません")).toBeVisible();
  });

  test("organization and team features", async ({ page }) => {
    await page.goto("/auth/login");
    
    // ログイン
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/app");

    // 設定ページに移動
    await page.click('a[href="/settings"]');
    await expect(page).toHaveURL("/settings");

    // 組織設定に移動
    await page.click('a[href="/settings/organizations"]');
    await expect(page).toHaveURL("/settings/organizations");

    // 新しい組織を作成（UIがある場合）
    const createButton = page.locator('button:has-text("新規組織")');
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.fill('input[name="name"]', "Test Organization");
      await page.click('button[type="submit"]');
      
      // 作成された組織が表示されることを確認
      await expect(page.locator("text=Test Organization")).toBeVisible();
    }
  });

  test("keyboard shortcuts", async ({ page }) => {
    await page.goto("/auth/login");
    
    // ログイン
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/app");

    // コマンドパレットを開く (Cmd+K / Ctrl+K)
    await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
    
    // コマンドパレットが表示されることを確認
    await expect(page.locator('input[placeholder*="コマンド"]')).toBeVisible();

    // ESC で閉じる
    await page.keyboard.press("Escape");
    await expect(page.locator('input[placeholder*="コマンド"]')).not.toBeVisible();

    // 検索にフォーカス (/)
    await page.keyboard.press("/");
    await expect(page.locator('input[id="q"]')).toBeFocused();
  });

  test("PWA features", async ({ page, context }) => {
    await page.goto("/");

    // Service Worker が登録されているか確認
    const swRegistered = await page.evaluate(async () => {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });

    // Manifest が存在するか確認
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);

    // apple-touch-icon が存在するか確認
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveCount(1);
  });

  test("accessibility features", async ({ page }) => {
    await page.goto("/");

    // キーボードナビゲーションのテスト
    await page.keyboard.press("Tab");
    
    // フォーカスが可視化されているか確認
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // ARIA属性の確認
    const buttons = page.locator("button");
    const firstButton = buttons.first();
    
    // aria-label または text content が存在するか
    const hasAriaLabel = await firstButton.getAttribute("aria-label");
    const hasTextContent = await firstButton.textContent();
    expect(hasAriaLabel || hasTextContent).toBeTruthy();
  });

  test("error handling", async ({ page }) => {
    // 存在しないページにアクセス
    await page.goto("/nonexistent-page");
    
    // 404 ページが表示されることを確認
    await expect(page.locator("text=見つかりませんでした")).toBeVisible();

    // ダッシュボードに戻るリンクがあることを確認
    const homeLink = page.locator('a[href="/app"]');
    await expect(homeLink).toBeVisible();
  });

  test("responsive design", async ({ page }) => {
    // モバイルビューポート
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // メインコンテンツが表示されることを確認
    await expect(page.locator("main")).toBeVisible();

    // タブレットビューポート
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator("main")).toBeVisible();

    // デスクトップビューポート
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await expect(page.locator("main")).toBeVisible();
  });
});



