# 🚀 Operations Guide - 運用ガイド

DocuFlow の運用・デプロイに関するガイドラインです。

## 📋 目次

- [デプロイメントフロー](#デプロイメントフロー)
- [環境構成](#環境構成)
- [リリース手順](#リリース手順)
- [ロールバック手順](#ロールバック手順)
- [定期メンテナンス](#定期メンテナンス)

---

## デプロイメントフロー

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Local     │────▶│   GitHub    │────▶│  CI/CD      │────▶│   Vercel    │
│   Dev       │     │   (main)    │     │  (Actions)  │     │   (Prod)    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      │                   │                   │                   │
   Feature            PR Review           Lint/Test/          Auto Deploy
   Branch             & Merge             Build Check          on main
```

### CI/CD パイプライン

1. **Lint** - ESLint によるコード品質チェック
2. **Type Check** - TypeScript の型チェック
3. **Test** - Vitest によるユニットテスト
4. **Build** - Next.js プロダクションビルド
5. **Security Audit** - npm audit によるセキュリティチェック
6. **Deploy** - Vercel への自動デプロイ（main ブランチのみ）

---

## 環境構成

### 本番環境

| サービス | 用途 | URL |
|:---------|:-----|:----|
| Vercel | フロントエンド・API | https://docuflow-azure.vercel.app |
| Supabase | データベース・認証 | https://[project].supabase.co |
| OpenAI | AI 要約・タグ生成 | api.openai.com |

### 環境変数

```env
# 必須
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
OPENAI_API_KEY=sk-...

# オプション（アカウント削除機能用）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# 本番URL（パスワードリセット等）
NEXT_PUBLIC_SITE_URL=https://docuflow-azure.vercel.app
```

### Vercel での環境変数設定

1. Vercel Dashboard → Project → Settings → Environment Variables
2. 各環境変数を `Production` / `Preview` / `Development` で設定
3. Sensitive な値は `Sensitive` フラグをオン

---

## リリース手順

### 1. 通常リリース

```bash
# 1. feature ブランチで開発
git checkout -b feature/new-feature
# ... 開発作業 ...
git commit -m "feat: 新機能追加"

# 2. main にマージ（PR経由推奨）
git checkout main
git pull origin main
git merge feature/new-feature
git push origin main

# 3. CI が自動実行 → 成功すれば Vercel に自動デプロイ
```

### 2. ホットフィックス

```bash
# 1. hotfix ブランチを main から作成
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. 修正をコミット
git commit -m "fix: 緊急バグ修正"

# 3. main に直接マージ
git checkout main
git merge hotfix/critical-bug
git push origin main
```

### 3. リリースタグ

```bash
# セマンティックバージョニング
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

---

## ロールバック手順

### Vercel でのロールバック

1. Vercel Dashboard → Project → Deployments
2. 戻したいデプロイメントを選択
3. 「...」メニュー → 「Promote to Production」

### Git でのロールバック

```bash
# 直前のコミットを取り消し
git revert HEAD
git push origin main

# 特定のコミットまで戻す
git revert --no-commit HEAD~3..HEAD
git commit -m "revert: v1.2.0 の変更を取り消し"
git push origin main
```

---

## 定期メンテナンス

### 週次タスク

- [ ] Dependabot PR のレビュー・マージ
- [ ] セキュリティアラートの確認
- [ ] エラーログの確認

### 月次タスク

- [ ] 依存パッケージの更新
- [ ] パフォーマンスモニタリング確認
- [ ] バックアップの確認

### 依存パッケージ更新

```bash
# 更新可能なパッケージを確認
npm outdated

# パッチバージョンの更新
npm update

# メジャーバージョンの更新（慎重に）
npm install package@latest
```

---

## トラブルシューティング

### ビルドが失敗する場合

1. ローカルで `npm run build` を実行して再現確認
2. `npm ci` で node_modules をクリーンインストール
3. `.next` ディレクトリを削除して再ビルド

### デプロイ後に 500 エラー

1. Vercel Function Logs を確認
2. 環境変数が正しく設定されているか確認
3. Supabase の接続状況を確認

### AI 要約が動作しない

1. OpenAI API キーの有効性を確認
2. API レート制限に達していないか確認
3. リクエストログでエラー内容を確認

---

---

## 🔒 セキュリティ運用

### Row Level Security (RLS)

DocuFlow では Supabase の RLS を本番運用レベルで有効化しています。

#### RLS ポリシー概要

| テーブル | SELECT | INSERT | UPDATE | DELETE |
|:---------|:-------|:-------|:-------|:-------|
| `documents` | 自分のみ + 共有リンク | 自分のみ | 自分のみ | 自分のみ |
| `document_versions` | 自分のみ | 自分のみ | - | 自分のみ |
| `activity_logs` | 自分のみ | 自分のみ | - | - |
| `document_comments` | 自分のドキュメント + 共有 | 自分のドキュメント | - | 自分のコメント |

#### ポリシーの仕組み

```sql
-- 例: documents テーブルの SELECT ポリシー
CREATE POLICY "Users can view own documents"
ON public.documents FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text)
  OR
  (share_token IS NOT NULL)  -- 共有リンク用
);
```

#### 共有リンクの仕組み

- `share_token` が設定されたドキュメントは、認証なしで閲覧可能
- 専用関数 `get_shared_document(token)` で安全に取得
- 編集・削除は常に認証ユーザーのみ

### Service Role の使用

管理者操作（アカウント削除等）では `SUPABASE_SERVICE_ROLE_KEY` を使用：

```typescript
// supabaseAdmin.ts で定義
// RLS をバイパスして管理操作を実行
const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

### セキュリティチェックリスト

#### 週次

- [ ] Supabase Dashboard で不審なクエリログを確認
- [ ] `npm audit` でパッケージの脆弱性を確認
- [ ] RLS ポリシーのログを確認

#### リリース時

- [ ] 新テーブルに RLS が有効か確認
- [ ] 機密情報が環境変数で管理されているか確認
- [ ] API キーのローテーションが必要か確認

---

## 📊 モニタリング & エラートラッキング

### Sentry 統合

DocuFlow は Sentry を使用してエラートラッキングとパフォーマンス監視を行います。

#### 環境変数

```env
# 必須（本番環境）
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=docuflow
SENTRY_AUTH_TOKEN=sntrys_xxx...  # ソースマップアップロード用
```

#### エラーキャプチャの使い方

```typescript
import { captureError, captureAiError, captureAuthError } from "@/lib/sentry";

// 一般的なエラー
captureError(error, {
  tags: { action: "create_document" },
  extra: { documentId: "xxx" },
});

// AI 関連エラー
captureAiError("generate_summary", error, {
  model: "gpt-4.1-mini",
  inputLength: 5000,
});

// 認証エラー
captureAuthError("login", error, { userId: "xxx" });
```

#### サンプリング設定

| 項目 | 設定値 | 理由 |
|:-----|:-------|:-----|
| `tracesSampleRate` | 0.2 (20%) | コスト最適化 |
| `replaysSessionSampleRate` | 0.1 (10%) | 高コストのため |
| `replaysOnErrorSampleRate` | 1.0 (100%) | エラー時は全収集 |

---

## 連絡先

- **緊急時**: GitHub Issues で `priority: critical` ラベルを付けて報告
- **質問**: GitHub Discussions を使用

