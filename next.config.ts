import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // パフォーマンス最適化
  images: {
    // 画像の最適化を有効化
    formats: ["image/avif", "image/webp"],
    // リモート画像のドメイン（必要に応じて追加）
    remotePatterns: [],
  },

  // 実験的機能
  experimental: {
    // ビルドサイズの最適化
    optimizePackageImports: ["@supabase/supabase-js"],
  },

  // ヘッダー設定
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        // 静的アセットのキャッシュ
        source: "/icon-:size.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
