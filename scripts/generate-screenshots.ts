/**
 * スクリーンショット自動生成スクリプト
 * 
 * 使用方法:
 * 1. ローカルで `npm run dev` を起動
 * 2. 別ターミナルで `npm run screenshots` を実行
 * 
 * 環境変数（オプション）:
 * - BASE_URL: ベースURL（デフォルト: http://localhost:3000）
 * - SCREENSHOT_EMAIL: ログイン用メールアドレス（ログインが必要なページを撮影する場合）
 * - SCREENSHOT_PASSWORD: ログイン用パスワード
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOT_EMAIL = process.env.SCREENSHOT_EMAIL;
const SCREENSHOT_PASSWORD = process.env.SCREENSHOT_PASSWORD;
const SCREENSHOT_DIR = join(process.cwd(), 'docs', 'screenshots');

// スクリーンショットディレクトリを作成
mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function generateScreenshots() {
  console.log('🚀 スクリーンショット生成を開始します...');
  console.log(`📸 ベースURL: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }, // より大きなビューポートで高品質なスクリーンショット
  });
  const page = await context.newPage();

  try {
    // 1. ログインページ
    console.log('📸 ログインページを撮影中...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    // フォームが表示されるまで待機
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.waitForTimeout(500); // レンダリング完了を待つ
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'login.png'),
      fullPage: true,
    });
    console.log('✅ login.png を保存しました');

    // 2. サインアップページ
    console.log('📸 サインアップページを撮影中...');
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    // フォームが表示されるまで待機
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'signup.png'),
      fullPage: true,
    });
    console.log('✅ signup.png を保存しました');

    // 5. ログインが必要なページの撮影
    if (SCREENSHOT_EMAIL && SCREENSHOT_PASSWORD) {
      console.log('\n🔐 ログイン情報が提供されているため、ログインが必要なページを撮影します...');
      
      // ログイン
      console.log('🔑 ログイン中...');
      await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
      await page.fill('input[type="email"]', SCREENSHOT_EMAIL);
      await page.fill('input[type="password"]', SCREENSHOT_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/app`, { timeout: 10000 });
      console.log('✅ ログイン成功');

      // 3. 新規作成ページ（ログイン後に撮影）
      console.log('📸 新規作成ページを撮影中...');
      await page.goto(`${BASE_URL}/new`, { waitUntil: 'networkidle' });
      // フォームが表示されるまで待機
      await page.waitForSelector('input[name="title"], textarea[name="rawContent"]', { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1500); // レンダリング完了を待つ
      // ページの先頭にスクロール
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      await page.screenshot({
        path: join(SCREENSHOT_DIR, 'new-document.png'),
        fullPage: true,
      });
      console.log('✅ new-document.png を保存しました');

      // 4. 設定ページ（ログイン後に撮影）
      console.log('📸 設定ページを撮影中...');
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
      // 設定セクションが表示されるまで待機
      await page.waitForSelector('section, h2', { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1500);
      // ページの先頭にスクロール
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      await page.screenshot({
        path: join(SCREENSHOT_DIR, 'settings.png'),
        fullPage: true,
      });
      console.log('✅ settings.png を保存しました');

      // ダッシュボードから最初のドキュメントを取得
      console.log('📸 ダッシュボードを読み込み中...');
      await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle' });
      // ドキュメントカードまたはメインコンテンツが表示されるまで待機
      await page.waitForSelector('main, article, a[href^="/documents/"]', { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(2000); // データ読み込み待機

      // ドキュメント詳細ページを撮影
      console.log('📸 ドキュメント詳細ページを撮影中...');
      try {
        // 最初のドキュメントカードのリンクを探す
        const firstDocLink = page.locator('a[href^="/documents/"]').first();
        await firstDocLink.waitFor({ state: 'visible', timeout: 5000 });
        const docHref = await firstDocLink.getAttribute('href');
        
        if (docHref) {
          await page.goto(`${BASE_URL}${docHref}`, { waitUntil: 'networkidle' });
          // ドキュメントのタイトルや本文が表示されるまで待機
          await page.waitForSelector('h1, h2, article, main', { state: 'visible', timeout: 10000 });
          await page.waitForTimeout(1500); // レンダリング完了を待つ
          // ページの先頭にスクロール
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(500);
          await page.screenshot({
            path: join(SCREENSHOT_DIR, 'document-detail.png'),
            fullPage: true,
          });
          console.log('✅ document-detail.png を保存しました');

          // 共有リンクを発行して撮影
          console.log('📸 共有リンク閲覧画面を撮影中...');
          try {
            // ページを再読み込みして最新の状態を取得
            await page.reload({ waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);
            
            // 「共有リンクを発行」ボタンを探す（より正確なセレクタ）
            const shareButton = page.locator('button:has-text("共有リンクを発行")').first();
            
            if (await shareButton.count() > 0) {
              const buttonText = await shareButton.textContent();
              console.log(`🔍 共有ボタンを見つけました: ${buttonText}`);
              
              await shareButton.click();
              await page.waitForTimeout(2000);
              
              // フォームが表示されたら、有効期限を選択して送信
              const expiresSelect = page.locator('select[name="expiresIn"]').first();
              if (await expiresSelect.count() > 0) {
                await expiresSelect.selectOption('7');
                await page.waitForTimeout(500);
              }
              
              // フォームを送信（送信ボタンをクリック）
              const submitButton = page.locator('form:has(button:has-text("共有リンクを発行")) button[type="submit"]').first();
              if (await submitButton.count() > 0) {
                console.log('📤 共有リンクフォームを送信中...');
                await submitButton.click();
                await page.waitForTimeout(3000);
                await page.waitForLoadState('networkidle');
                
                // ページを再読み込みして最新の状態を取得
                await page.reload({ waitUntil: 'networkidle' });
                await page.waitForTimeout(1000);
                
                // 共有リンクのトークンを取得（ページ内のテキストから）
                const pageContent = await page.textContent('body');
                const shareTokenMatch = pageContent?.match(/\/share\/([a-zA-Z0-9_-]+)/);
                
                if (shareTokenMatch && shareTokenMatch[1]) {
                  const shareToken = shareTokenMatch[1];
                  console.log(`🔗 共有トークンを見つけました: ${shareToken}`);
                  
                  await page.goto(`${BASE_URL}/share/${shareToken}`, { waitUntil: 'networkidle' });
                  // 共有ビューのコンテンツが表示されるまで待機
                  await page.waitForSelector('article, main, h1, h2', { state: 'visible', timeout: 10000 });
                  await page.waitForTimeout(1500);
                  // ページの先頭にスクロール
                  await page.evaluate(() => window.scrollTo(0, 0));
                  await page.waitForTimeout(500);
                  await page.screenshot({
                    path: join(SCREENSHOT_DIR, 'share-view.png'),
                    fullPage: true,
                  });
                  console.log('✅ share-view.png を保存しました');
                } else {
                  // トークンが見つからない場合、URLから取得を試みる
                  const currentUrl = page.url();
                  if (currentUrl.includes('/share/')) {
                    const token = currentUrl.split('/share/')[1]?.split('?')[0];
                    if (token) {
                      await page.screenshot({
                        path: join(SCREENSHOT_DIR, 'share-view.png'),
                        fullPage: true,
                      });
                      console.log('✅ share-view.png を保存しました（URLから取得）');
                    }
                  } else {
                    console.log('⚠️  共有トークンが見つかりませんでした。手動で撮影してください。');
                  }
                }
              } else {
                console.log('⚠️  送信ボタンが見つかりませんでした。');
              }
            } else {
              // 既に共有リンクが発行されている場合
              const pageContentForToken = await page.textContent('body');
              const existingShareToken = pageContentForToken?.match(/\/share\/([a-zA-Z0-9_-]+)/);
              if (existingShareToken && existingShareToken[1]) {
                const shareToken = existingShareToken[1];
                console.log(`🔗 既存の共有トークンを見つけました: ${shareToken}`);
                await page.goto(`${BASE_URL}/share/${shareToken}`, { waitUntil: 'networkidle' });
                // 共有ビューのコンテンツが表示されるまで待機
                await page.waitForSelector('article, main, h1, h2', { state: 'visible', timeout: 10000 });
                await page.waitForTimeout(1500);
                // ページの先頭にスクロール
                await page.evaluate(() => window.scrollTo(0, 0));
                await page.waitForTimeout(500);
                await page.screenshot({
                  path: join(SCREENSHOT_DIR, 'share-view.png'),
                  fullPage: true,
                });
                console.log('✅ share-view.png を保存しました（既存の共有リンク）');
              } else {
                console.log('⚠️  共有リンクボタンが見つかりませんでした。');
              }
            }
          } catch (e) {
            console.log('⚠️  共有リンクの撮影に失敗しました（手動で撮影してください）:', e);
          }
        } else {
          console.log('⚠️  ドキュメントが見つかりませんでした。document-detail.png は手動で撮影してください。');
        }
      } catch (e) {
        console.log('⚠️  ドキュメント詳細ページの撮影に失敗しました（手動で撮影してください）:', e);
      }
    } else {
      console.log('\n📝 注意: document-detail.png と share-view.png は手動で撮影してください。');
      console.log('   または、環境変数 SCREENSHOT_EMAIL と SCREENSHOT_PASSWORD を設定して自動生成できます。');
    }

    console.log('\n✅ スクリーンショット生成が完了しました！');
    console.log(`📁 保存先: ${SCREENSHOT_DIR}`);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

generateScreenshots();

