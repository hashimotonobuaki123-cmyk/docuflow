## 🛠 Developer Setup - 開発環境セットアップ

DocuFlow をローカルで立ち上げるための手順を、**5〜10分で終わるレベル** まで具体的にまとめます。

---

## 1. 必要なもの

```text
Node.js   : 22.x 以上
npm       : 10.x 以上
Supabase  : 無料プロジェクト1つ
OpenAI    : APIキー（無料枠 or 有料プラン）
```

- 推奨 OS: macOS / Linux / WSL2
- エディタ: VS Code / Cursor

---

## 2. リポジトリの取得

```bash
git clone https://github.com/tanasho/dooai.git
cd dooai

# 依存関係のインストール
npm install
```

---

## 3. Supabase プロジェクトの準備

1. [Supabase](https://supabase.com/) にログインし、新規プロジェクトを作成
2. プロジェクトの **API 設定** から以下を取得:
   - `PROJECT_URL`（例: `https://xxx.supabase.co`）
   - `anon public key`
   - `service_role key`（任意、アカウント削除など管理系で使用）
3. プロジェクトの **Database** 画面から接続情報を確認（CI 用に使う場合は後述）

---

## 4. 環境変数の設定

### 4.1 `.env.example` から `.env.local` を作成

```bash
cp .env.example .env.local
```

`./.env.example` には、必要な環境変数がコメント付きで定義されています。  
最低限、以下を埋めてください:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`（例: `http://localhost:3000`）

Sentry / Resend などは **未設定でも動作** します（モニタリング系のみ無効）。

---

## 5. DB マイグレーションの適用（ローカル or 本番）

### 5.1 Supabase Dashboard から手動適用（シンプルな方法）

1. Supabase ダッシュボード → **SQL Editor**
2. `supabase/migrations/*.sql` を順番に開き、中身をコピペして **Run**
3. `Table editor` で以下のテーブルが存在することを確認:
   - `documents`, `document_versions`, `activity_logs`, `document_comments`
   - `organizations`, `organization_members`, `organization_invitations`
   - `notifications`

### 5.2 GitHub Actions から自動適用（運用フェーズ）

- `.github/workflows/supabase-migrations.yml` が用意されています。
- GitHub Secrets に以下を設定することで、`main` へのマージ時に自動適用されます:

```text
SUPABASE_DB_URL=postgres://postgres:YOUR_PASSWORD@YOUR_PROJECT.supabase.co:5432/postgres
```

---

## 6. 開発サーバーの起動

### 6.1 最速スタート（デモデータ込み・推奨）

新しく参加した開発メンバーは、まずこのコマンドだけ叩けば OK です。

```bash
make dev-seed
```

- `supabase/migrations` のスキーマを前提とした DB
- `scripts/seed-demo-data.ts` によるデモデータ投入
- Next.js 開発サーバー起動（`http://localhost:3000`）

まで、**1 コマンドでまとめて実行** します。

### 6.2 手動で起動する場合

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

- `/` : ランディングページ
- `/auth/signup` : サインアップ
- `/auth/login` : ログイン
- `/app` : ダッシュボード（要ログイン）

---

## 7. Google ログイン（Google OAuth）設定の概要

Google ログインを有効にするための **最小構成の流れ** をまとめます。

### 7.1 Google Cloud Console 側の設定

1. [Google Cloud Console](https://console.cloud.google.com/) で新規プロジェクトを作成
2. 左メニュー「API とサービス」→「OAuth 同意画面」
   - ユーザータイプ: External
   - アプリ名 / サポートメールを入力し保存
3. 「認証情報」→「認証情報を作成」→「OAuth クライアント ID」
   - 種類: ウェブアプリケーション
   - 承認済みリダイレクト URI に Supabase のコールバック URL を登録  
     例: `https://<your-project>.supabase.co/auth/v1/callback`
4. 発行された `クライアント ID` / `クライアント シークレット` を控える

### 7.2 Supabase プロジェクト側の設定

1. Supabase ダッシュボード → Authentication → Settings → External OAuth
2. 「Google」 を有効化し、先ほど控えた
   - Client ID
   - Client Secret
   を入力して保存
3. `NEXT_PUBLIC_SITE_URL` が Vercel の URL（例: `https://docuflow-azure.vercel.app`）になっていることを確認

### 7.3 アプリ側の挙動

- `/auth/login` の「Google でログイン」ボタンから  
  `supabase.auth.signInWithOAuth({ provider: "google", ... })` を実行
- Supabase で OAuth が成功すると `/auth/callback` に戻り、
  - Supabase セッションを取得
  - `docuhub_ai_auth=1` / `docuhub_ai_user_id=<uuid>` を Cookie にセット
  - `/app` にリダイレクト

動作しない場合は、以下を確認してください:

- Supabase の「Site URL」「Redirect URL」が Vercel 側 URL と一致しているか
- Google Cloud Console のリダイレクト URL が Supabase のものと一致しているか
- ブラウザのサードパーティ Cookie ブロック設定

---

## 8. テストの実行

### 8.1 ユニットテスト（Vitest）

```bash
npm test

# カバレッジレポート付き
npm run test:coverage
```

### 8.2 E2E テスト（Playwright）

```bash
# 初回のみブラウザをインストール
npx playwright install

# ヘッドレス実行
npm run test:e2e

# UI 付き（デバッグ用）
npm run test:e2e:ui
```

E2E テストではログイン状態やデモデータの有無に依存するケースがあるため、  
事前に `make dev-seed` で環境を準備してから実行することを推奨します。

