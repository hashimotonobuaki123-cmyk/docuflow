# OSS-Friendly Components and Utilities

DocuFlow は 1 つの SaaS プロダクトですが、**他プロジェクトでも再利用できるコンポーネント / フック / ユーティリティ** がいくつかあります。  
ここでは、将来的に OSS として切り出す候補と、その役割を一覧化します。

---

## 1. i18n & Locale Utilities

### `lib/i18n.ts`

- シンプルな `Locale` 型と翻訳辞書
- `getLocaleFromParam(lang)` で `?lang=` クエリからロケールを判定  
  - クエリが存在すれば `en`、なければ `ja` という **URL ファーストな設計**

### `lib/useLocale.ts`

- `useSearchParams()` から `lang` を読み取り、クライアント側のロケールを返すフック
- Next.js App Router + `?lang=` ベースのアプリでそのまま再利用可能

### OSS 化のイメージ

- パッケージ名例: `@docuflow/next-lang-query`
- 提供 API:
  - `getLocaleFromParam(lang?: string | null): "ja" | "en"`
  - `useLocale(defaultLang?: string): "ja" | "en"`

---

## 2. Global UI Components

### `components/GlobalLanguageToggle.tsx`

- どのページからでも `?lang=ja` / `?lang=en` をトグルできる **言語切り替えボタン**
- Next.js 16 の `useSearchParams` を `Suspense` でラップした安全な実装

### `components/PWAInstallPrompt.tsx`

- PWA のインストールをユーザーに促すトースト / モーダル
- `beforeinstallprompt` イベントを扱うロジックをカプセル化

### `components/NotificationBell.tsx`

- 通知の未読件数バッジ + ドロップダウン UI
- 通知の読み取り / 既読化ロジックを props 経由で差し替え可能

---

## 3. Bulk Operations

### `app/BulkDeleteConfirmButton.tsx`

- チェックボックス + 「すべて削除」ボタン + 確認ダイアログを一体化
- `<form>` の `id` を渡すだけで **任意のリストに対する一括削除 UI** を提供

### `app/BulkRestoreButton.tsx`

- アーカイブ済みアイテムをまとめて復元するコンポーネント
- バルク操作の UX パターンとして汎用的に流用可能

---

## 4. Error & Monitoring Helpers

### `lib/sentry.ts`

- `captureError`, `captureAiError`, `captureAuthError` など、用途別のラッパー関数
- Sentry を使う別プロジェクトでも **そのまま or ほぼそのまま流用可能** な設計

### `lib/webVitals.ts`

- `web-vitals` v4 に追従した型安全なラッパー
- `onCLS`, `onFID`, `onLCP` などをまとめて登録し、`/app/vitals` に送信する設計

---

## 5. 今後の OSS 化ロードマップ

1. 上記コンポーネント / フックを `packages/` ディレクトリに移動し、単体でビルド可能な形に整理
2. `README`・型定義・Storybook などを追加して、**外部から見ても使い方が分かる状態** にする
3. npm / jsr または GitHub Package Registry に公開

このドキュメントは、「DocuFlow を単なる作品ではなく、**再利用可能な OSS コンポーネントの集合**としても育てていく」という方針を示すためのものです。


