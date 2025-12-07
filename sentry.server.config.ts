// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 本番環境のみでSentryを有効化
  enabled: process.env.NODE_ENV === "production",

  // サンプリングレート
  tracesSampleRate: 0.2,

  // デバッグモード
  debug: false,

  // 環境名
  environment: process.env.NODE_ENV,

  // リリースバージョン
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // サーバーサイドのエラー前処理
  beforeSend(event) {
    if (process.env.NODE_ENV !== "production") {
      return null;
    }

    // 機密情報をスクラブ
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }

    return event;
  },

  // 統合設定
  integrations: [
    // プロファイリングを有効化（パフォーマンス分析）
    Sentry.captureConsoleIntegration({
      levels: ["error", "warn"],
    }),
  ],
});






