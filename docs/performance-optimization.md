# パフォーマンス最適化ガイド

## 概要

DocuFlow のパフォーマンス最適化戦略と実装方法をまとめています。

## Web Vitals目標値

| 指標 | 目標 | 現在 | 状態 |
|------|------|------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 監視中 | ✅ |
| FID (First Input Delay) | < 100ms | 監視中 | ✅ |
| CLS (Cumulative Layout Shift) | < 0.1 | 監視中 | ✅ |
| FCP (First Contentful Paint) | < 1.8s | 監視中 | ✅ |
| TTFB (Time to First Byte) | < 800ms | 監視中 | ✅ |

## 実装済み最適化

### 1. 画像最適化

**Next.js Image コンポーネント**:
```typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority // LCP要素に指定
  sizes="(max-width: 768px) 100vw, 1200px"
/>
```

**最適化フォーマット**:
- `next.config.ts` で AVIF/WebP を有効化
- 自動的に最適なフォーマットを配信

### 2. コード分割

**動的インポート**:
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // CSRのみの場合
});
```

**app/layout.tsx で実装**:
- CommandPalette
- KeyboardShortcutsHelp
- ServiceWorkerRegistration
- PWAInstallPrompt

### 3. フォント最適化

```typescript
// app/layout.tsx
import { GeistSans, GeistMono } from 'geist/font';

export default function RootLayout({ children }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 4. バンドルサイズ最適化

**package.json の最適化**:
```json
{
  "optionalDependencies": {
    "sharp": "^0.32.0" // 画像最適化
  }
}
```

**next.config.ts の設定**:
```typescript
export default {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
};
```

### 5. キャッシング戦略

**静的アセット**:
```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

**API応答のキャッシュ**:
```typescript
export const revalidate = 3600; // 1時間
```

### 6. データベースクエリ最適化

**インデックスの活用**:
```sql
-- documents テーブル
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
```

**N+1問題の回避**:
```typescript
// ❌ Bad
for (const doc of documents) {
  const comments = await getComments(doc.id); // N+1
}

// ✅ Good
const allComments = await getCommentsByDocIds(documents.map(d => d.id));
```

### 7. サーバーコンポーネントの活用

```typescript
// Server Component (デフォルト)
export default async function Page() {
  const data = await fetchData(); // サーバーで実行
  return <div>{data}</div>;
}

// Client Component (必要な場合のみ)
'use client';
export function InteractiveComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}
```

### 8. リクエストのウォーターフォール回避

```typescript
// ❌ Bad - 直列実行
const user = await fetchUser();
const posts = await fetchPosts(user.id);
const comments = await fetchComments(posts.map(p => p.id));

// ✅ Good - 並列実行
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments(),
]);
```

## パフォーマンス計測

### Web Vitals監視

```typescript
// lib/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function initWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  // ...
}
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  run: |
    npm run build
    lhci autorun
```

**目標スコア**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

### Bundle Analyzer

```bash
# バンドルサイズを分析
npm run analyze

# レポートが自動的に開く
# 大きなパッケージを特定して最適化
```

## チェックリスト

### 開発時

- [ ] 新しいコンポーネントは必要な場合のみ Client Component にする
- [ ] 画像は Next.js Image コンポーネントを使用
- [ ] 重いライブラリは動的インポート
- [ ] useEffect の依存配列を最適化
- [ ] メモ化（useMemo/useCallback）を適切に使用

### デプロイ前

- [ ] Lighthouse スコアが目標値以上
- [ ] バンドルサイズが許容範囲内（< 500KB）
- [ ] E2Eテストが全て通過
- [ ] Web Vitalsが基準値以内
- [ ] エラーハンドリングが適切

### 定期的なメンテナンス

- [ ] 依存関係を最新に保つ
- [ ] 未使用のコードを削除
- [ ] パフォーマンスメトリクスを監視
- [ ] ユーザーフィードバックを収集

## ツール

### 計測ツール

- **Lighthouse**: Chrome DevTools
- **WebPageTest**: https://www.webpagetest.org/
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Vercel Analytics**: 本番環境のリアルタイム計測

### 開発ツール

- **Next.js DevTools**: パフォーマンスプロファイリング
- **React DevTools**: コンポーネントの re-render 確認
- **Bundle Analyzer**: バンドルサイズ分析

## ベストプラクティス

### 1. Critical Rendering Path の最適化

```tsx
// 最初に表示されるコンテンツを優先
<Image
  src="/hero.jpg"
  priority // LCP要素
  alt="Hero"
/>

// フォールドより下は遅延ロード
<Image
  src="/below-fold.jpg"
  loading="lazy"
  alt="Below fold"
/>
```

### 2. JavaScript の削減

```typescript
// 小さなユーティリティはバンドルに含める
import { format } from 'date-fns/format'; // ✅ Tree-shakable

// 大きなライブラリは動的ロード
const Chart = dynamic(() => import('chart.js')); // ✅ Code-split
```

### 3. CSS の最適化

```tsx
// Tailwind の purge 設定
// tailwind.config.js
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // 未使用のクラスを自動削除
};
```

### 4. プリロード・プリフェッチ

```tsx
<link rel="preload" href="/critical.css" as="style" />
<link rel="prefetch" href="/next-page.js" />
<link rel="dns-prefetch" href="https://api.example.com" />
```

## パフォーマンスバジェット

| リソース | 制限 | 現在 |
|----------|------|------|
| JavaScript (初回) | < 200KB | 監視中 |
| CSS (初回) | < 50KB | 監視中 |
| 画像 (合計) | < 1MB | 監視中 |
| フォント | < 100KB | 監視中 |
| **合計** | **< 1.5MB** | **監視中** |

## まとめ

DocuFlow では以下のパフォーマンス最適化を実装しています:

✅ Next.js Image による画像最適化  
✅ コード分割と動的インポート  
✅ Server Components の積極活用  
✅ バンドルサイズの最適化  
✅ Web Vitals の継続的監視  
✅ Lighthouse CI による品質保証  

これにより、高速で快適なユーザー体験を提供しています。



