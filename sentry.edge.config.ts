// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
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
});

