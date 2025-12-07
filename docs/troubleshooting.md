# トラブルシューティングガイド

## 概要

DocuFlow の開発・運用中に発生する可能性のある問題と解決方法をまとめています。

## 目次

- [インストール・セットアップ](#インストールセットアップ)
- [開発サーバー](#開発サーバー)
- [ビルド](#ビルド)
- [Supabase接続](#supabase接続)
- [AI機能](#ai機能)
- [認証](#認証)
- [パフォーマンス](#パフォーマンス)
- [デプロイ](#デプロイ)

---

## インストール・セットアップ

### 問題: `npm install` が失敗する

**症状**:
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解決方法**:

```bash
# キャッシュをクリア
npm cache clean --force

# node_modules と package-lock.json を削除
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

または、`--legacy-peer-deps` オプションを使用:

```bash
npm install --legacy-peer-deps
```

### 問題: Node.js のバージョンが古い

**症状**:
```bash
error Unsupported engine
```

**解決方法**:

```bash
# Node.jsのバージョンを確認
node --version

# nvm を使用してアップグレード
nvm install 18
nvm use 18
```

---

## 開発サーバー

### 問題: `npm run dev` が起動しない

**症状**:
```bash
Error: Cannot find module 'next'
```

**解決方法**:

```bash
# 依存関係を再インストール
npm install

# 開発サーバーを起動
npm run dev
```

### 問題: ポート3000が既に使用されている

**症状**:
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**解決方法**:

```bash
# ポートを使用しているプロセスを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>

# または、別のポートを使用
PORT=3001 npm run dev
```

### 問題: Hot Reload が動作しない

**解決方法**:

1. `.next` フォルダを削除:
```bash
rm -rf .next
npm run dev
```

2. ファイル監視の上限を増やす（Mac/Linux）:
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## ビルド

### 問題: `npm run build` が失敗する

**症状**:
```bash
Type error: ...
```

**解決方法**:

```bash
# 型チェック
npm run type-check

# Lint
npm run lint

# エラーを修正後、再ビルド
npm run build
```

### 問題: ビルドサイズが大きすぎる

**解決方法**:

1. Bundle Analyzer で確認:
```bash
npm run analyze
```

2. 大きなパッケージを遅延ロード:
```typescript
// Before
import HeavyComponent from './HeavyComponent';

// After
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

3. 不要なパッケージを削除:
```bash
npm uninstall unused-package
```

---

## Supabase接続

### 問題: Supabaseに接続できない

**症状**:
```bash
Error: Invalid API key
```

**解決方法**:

1. `.env.local` を確認:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

2. Supabaseダッシュボードで設定を確認:
   - Project Settings → API
   - Project URL と anon key をコピー

3. `.env.local` を更新後、サーバーを再起動:
```bash
npm run dev
```

### 問題: RLSポリシーでデータが取得できない

**症状**:
- データが空配列で返ってくる
- 403 Forbidden エラー

**解決方法**:

1. Supabase ダッシュボードで RLS ポリシーを確認
2. ポリシーをテスト:
```sql
-- SQL Editor で実行
SELECT * FROM documents WHERE user_id = auth.uid();
```

3. ポリシーを修正:
```sql
-- 例: documents テーブルの SELECT ポリシー
CREATE POLICY "Users can view their own documents"
ON documents FOR SELECT
USING (auth.uid() = user_id);
```

### 問題: マイグレーションが失敗する

**解決方法**:

```bash
# マイグレーションファイルを確認
cat supabase/migrations/your-migration.sql

# Supabase SQL Editor で手動実行
# エラーメッセージを確認して修正
```

---

## AI機能

### 問題: OpenAI APIキーが無効

**症状**:
```bash
Error: Incorrect API key provided
```

**解決方法**:

1. `.env.local` で API キーを確認:
```bash
OPENAI_API_KEY=sk-...
```

2. OpenAI ダッシュボードで新しいキーを生成
3. `.env.local` を更新して再起動

### 問題: AI要約が生成されない

**症状**:
- 要約が空白
- タグが生成されない

**解決方法**:

1. ログを確認:
```bash
# 開発サーバーのコンソール出力を確認
```

2. APIクォータを確認:
   - OpenAI ダッシュボード → Usage
   - 利用制限に達していないか確認

3. フォールバックが動作しているか確認:
```typescript
// lib/ai.ts
// エラー時はデフォルト値が返される
```

### 問題: ベクトル検索が動作しない

**解決方法**:

1. pgvector拡張が有効か確認:
```sql
-- SQL Editor で実行
CREATE EXTENSION IF NOT EXISTS vector;
```

2. embedding カラムが存在するか確認:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents' AND column_name = 'embedding';
```

---

## 認証

### 問題: ログインできない

**症状**:
- リダイレクトループ
- セッションが保持されない

**解決方法**:

1. Cookie設定を確認:
```typescript
// サーバーコンポーネントで
import { cookies } from 'next/headers';

const cookieStore = await cookies();
const userId = cookieStore.get('docuhub_ai_user_id')?.value;
```

2. ブラウザのCookieをクリア

3. Supabaseの認証設定を確認:
   - Authentication → Settings
   - Site URL が正しいか確認

### 問題: パスワードリセットメールが届かない

**解決方法**:

1. Supabase Authentication設定を確認:
   - Email Templates
   - SMTP設定（カスタムSMTPの場合）

2. スパムフォルダを確認

---

## パフォーマンス

### 問題: ページの読み込みが遅い

**解決方法**:

1. Lighthouse でスコアを確認:
```bash
npm run lighthouse
```

2. 画像を最適化:
```tsx
// Next.js Image コンポーネントを使用
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // LCP要素の場合
/>
```

3. コンポーネントを遅延ロード:
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // CSRのみの場合
});
```

### 問題: Web Vitalsのスコアが悪い

**解決方法**:

1. `/app/vitals` ページで確認

2. LCP（Largest Contentful Paint）を改善:
   - 画像に `priority` 属性を追加
   - フォントを事前読み込み
   - SSRを活用

3. CLS（Cumulative Layout Shift）を改善:
   - 画像に width/height を指定
   - Skeleton ローディングを使用
   - 動的コンテンツのスペースを確保

---

## デプロイ

### 問題: Vercelデプロイが失敗する

**症状**:
```bash
Build failed
```

**解決方法**:

1. ビルドログを確認:
   - Vercel ダッシュボード → Deployments → エラーログ

2. ローカルでビルドテスト:
```bash
npm run build
```

3. 環境変数を確認:
   - Vercel → Settings → Environment Variables
   - すべての必要な変数が設定されているか

### 問題: 本番環境でエラーが発生する

**解決方法**:

1. Sentry でエラーログを確認

2. Vercel のログを確認:
```bash
vercel logs
```

3. 環境変数の値を再確認:
```bash
# Vercel CLI
vercel env pull .env.local
```

---

## よくあるエラーメッセージ

### `Error: Hydration failed`

**原因**: サーバーとクライアントでレンダリング結果が異なる

**解決方法**:
```tsx
// useEffect で client-side のみの処理を実行
useEffect(() => {
  // client-side only code
}, []);

// または suppressHydrationWarning を使用（最終手段）
<div suppressHydrationWarning>
  {typeof window !== 'undefined' && <ClientComponent />}
</div>
```

### `Error: Objects are not valid as a React child`

**原因**: オブジェクトを直接レンダリングしようとしている

**解決方法**:
```tsx
// ❌ Bad
<div>{someObject}</div>

// ✅ Good
<div>{JSON.stringify(someObject)}</div>
// または
<div>{someObject.property}</div>
```

---

## サポート

問題が解決しない場合:

1. **GitHub Issues**: バグ報告や機能提案
2. **GitHub Discussions**: 質問や議論
3. **ドキュメント**: `/docs` フォルダ内の各種ガイド

---

## 緊急時の対応

### データベースがダウンした場合

1. Supabase ダッシュボードで状態を確認
2. バックアップから復元
3. ユーザーに通知

### APIが応答しない場合

1. Vercel のステータスページを確認
2. ログでエラーを特定
3. 必要に応じてロールバック

```bash
# 前のデプロイに戻す
vercel rollback
```

---

このガイドは随時更新されます。新しい問題や解決方法があれば、PRを送ってください！



