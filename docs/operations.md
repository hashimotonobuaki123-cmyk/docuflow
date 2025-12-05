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

## 連絡先

- **緊急時**: GitHub Issues で `priority: critical` ラベルを付けて報告
- **質問**: GitHub Discussions を使用

