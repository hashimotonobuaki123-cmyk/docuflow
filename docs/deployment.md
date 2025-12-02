## DocuFlow デプロイメントガイド

本ドキュメントでは、DocuFlow を Vercel と Supabase を使って本番環境にデプロイする手順を説明します。

---

## 前提条件

- GitHub アカウント
- Vercel アカウント（GitHub と連携済み）
- Supabase アカウント
- OpenAI API キー

---

## 1. Supabase プロジェクトのセットアップ

### 1.1 プロジェクトの作成

1. [Supabase Dashboard](https://app.supabase.com/) にログイン
2. 「New Project」をクリック
3. プロジェクト名、データベースパスワード、リージョンを設定
4. プロジェクト作成完了を待つ（数分かかります）

### 1.2 テーブルの作成

Supabase の SQL Editor で、以下の SQL を順番に実行してください。

#### `documents` テーブル

```sql
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  category text,
  raw_content text not null,
  summary text,
  tags text[],
  is_favorite boolean not null default false,
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  share_token text,
  share_expires_at timestamptz,
  created_at timestamptz not null default now()
);
```

#### `document_versions` テーブル

```sql
create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null,
  title text not null,
  category text,
  raw_content text,
  summary text,
  tags text[],
  created_at timestamptz not null default now()
);
```

#### `activity_logs` テーブル

```sql
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  document_id uuid,
  document_title text,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

#### `document_comments` テーブル

```sql
create table if not exists public.document_comments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid,
  content text not null,
  created_at timestamptz not null default now()
);
```

#### `user_settings` テーブル

```sql
create table if not exists public.user_settings (
  user_id uuid primary key,
  ai_auto_summary_on_new boolean not null default true,
  ai_auto_summary_on_upload boolean not null default true,
  default_share_expires_in text not null default '7',
  default_sort text not null default 'desc',
  default_show_archived boolean not null default false,
  default_shared_only boolean not null default false
);
```

### 1.3 インデックスの作成

```sql
-- documents: ユーザーごとの絞り込みとソート用
create index if not exists documents_user_id_created_at_idx
  on public.documents (user_id, created_at desc);

-- activity_logs: ユーザーごとの時系列参照用
create index if not exists activity_logs_user_id_created_at_idx
  on public.activity_logs (user_id, created_at desc);

-- document_versions: ドキュメント単位の履歴参照用
create index if not exists document_versions_document_id_created_at_idx
  on public.document_versions (document_id, created_at desc);

-- document_comments: ドキュメントごとのコメント参照用
create index if not exists document_comments_document_id_created_at_idx
  on public.document_comments (document_id, created_at asc);
```

### 1.4 API キーの取得

1. Supabase Dashboard の左メニューから「Settings」→「API」を開く
2. 以下の値をメモしておく（後で Vercel の環境変数に設定します）:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** キー (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** キー (`SUPABASE_SERVICE_ROLE_KEY`) - アカウント削除機能を使う場合のみ

---

## 2. GitHub リポジトリの準備

### 2.1 リポジトリの作成

1. GitHub で新しいリポジトリを作成
2. ローカルで以下のコマンドを実行:

```bash
cd "/Users/tanasho/Desktop/作成中ポートフォリオデータ/dooai"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

> **注意**: `.env.local` は `.gitignore` に含まれているため、コミットされません。環境変数は Vercel で設定します。

---

## 3. Vercel へのデプロイ

### 3.1 プロジェクトのインポート

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. 「Add New...」→「Project」をクリック
3. GitHub リポジトリを選択
4. 「Import」をクリック

### 3.2 プロジェクト設定

- **Framework Preset**: Next.js（自動検出されるはず）
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）
- **Install Command**: `npm install`（デフォルト）

### 3.3 環境変数の設定

「Environment Variables」セクションで、以下の環境変数を追加します:

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の Project URL | Supabase Dashboard の Settings → API から取得 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon public キー | 同上 |
| `OPENAI_API_KEY` | OpenAI の API キー | [OpenAI Platform](https://platform.openai.com/api-keys) から取得 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase の service_role キー | アカウント削除機能を使う場合のみ設定 |

> **注意**: `NEXT_PUBLIC_` で始まる変数は、クライアント側でも使用可能になります。機密情報は `NEXT_PUBLIC_` を付けないでください。

### 3.4 デプロイの実行

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待つ（通常 2-5 分）
3. デプロイが成功すると、Vercel が自動的に URL を発行します（例: `https://your-project.vercel.app`）

---

## 4. 本番環境での確認事項

### 4.1 動作確認

1. デプロイされた URL にアクセス
2. `/auth/signup` でアカウントを作成
3. `/app` でダッシュボードが表示されることを確認
4. `/new` でドキュメントを作成し、AI 要約が生成されることを確認

### 4.2 環境変数の確認

Vercel Dashboard の「Settings」→「Environment Variables」で、すべての環境変数が正しく設定されていることを確認してください。

### 4.3 Supabase の接続確認

Supabase Dashboard の「Logs」→「API Logs」で、Vercel からのリクエストが正常に処理されていることを確認してください。

---

## 5. カスタムドメインの設定（オプション）

1. Vercel Dashboard の「Settings」→「Domains」を開く
2. カスタムドメインを入力
3. DNS レコードを設定（Vercel が指示を表示します）
4. DNS の反映を待つ（通常 24-48 時間）

---

## 6. 本番環境での注意点

### 6.1 RLS（Row Level Security）

現状の実装では、RLS は **disabled** のままです。本番環境でも動作しますが、セキュリティを強化する場合は `docs/architecture.md` の「Supabase RLS 本番対応プラン」を参照してください。

### 6.2 環境変数の管理

- **開発環境**: `.env.local` を使用
- **本番環境**: Vercel Dashboard の環境変数を使用
- **機密情報**: `SUPABASE_SERVICE_ROLE_KEY` や `OPENAI_API_KEY` は絶対に GitHub にコミットしないでください

### 6.3 パフォーマンス

- Vercel の無料プランでは、関数の実行時間に制限があります
- OpenAI API の呼び出しは数秒かかる場合があるため、タイムアウトに注意してください
- 大量のドキュメントがある場合は、ページネーションの実装を検討してください

### 6.4 モニタリング

- Vercel Dashboard の「Analytics」で、リクエスト数やエラー率を確認できます
- Supabase Dashboard の「Logs」で、データベースのクエリログを確認できます
- OpenAI Dashboard で、API の使用量とコストを確認できます

---

## 7. トラブルシューティング

デプロイ時に問題が発生した場合は、`docs/troubleshooting.md` を参照してください。

---

## 8. 次のステップ

- カスタムドメインの設定
- RLS の有効化（`docs/architecture.md` 参照）
- モニタリングとアラートの設定
- バックアップ戦略の検討

