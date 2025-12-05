// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 本番環境のみでSentryを有効化
  enabled: process.env.NODE_ENV === "production",

  // サンプリングレート（1.0 = 100%のエラーを送信）
  // 本番では0.1〜0.5程度に調整してコストを抑える
  tracesSampleRate: 0.2,

  // リプレイのサンプリング
  // セッションリプレイは高コストなので低めに設定
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // デバッグモード（開発時のみ有効）
  debug: false,

  // 環境名
  environment: process.env.NODE_ENV,

  // リリースバージョン（Vercelの環境変数から取得）
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // エラーの前処理
  beforeSend(event) {
    // 開発環境ではエラーを送信しない
    if (process.env.NODE_ENV !== "production") {
      return null;
    }

    // 特定のエラーをフィルタリング
    const ignoredErrors = [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Network request failed",
      "Load failed",
      "cancelled",
    ];

    const errorMessage = event.exception?.values?.[0]?.value || "";
    if (ignoredErrors.some((ignored) => errorMessage.includes(ignored))) {
      return null;
    }

    return event;
  },

  // 統合設定
  integrations: [
    Sentry.replayIntegration({
      // プライバシー保護のためテキストをマスク
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

