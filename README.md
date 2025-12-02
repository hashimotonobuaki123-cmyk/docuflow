![DocuFlow ダッシュボード](docs/screenshots/dashboard.png)

**DocuFlow – AI 要約で、PDF / Word 資料を一瞬で整理するドキュメントワークスペース**

![CI](https://github.com/hashimotonobuaki123-cmyk/docuflow/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-local--lcov-green)

本番環境: https://docuflow-azure.vercel.app

## DocuFlow

AI 要約とタグ自動生成で、テキスト / PDF / Word ドキュメントを整理するミニ SaaS です。  
Next.js 16（App Router）+ Supabase + OpenAI で構成された学習・ポートフォリオ向けプロジェクトです。

### デモ / Live

- 本番環境: https://docuflow-azure.vercel.app
  - 初期表示で `/auth/login` にリダイレクトされます（ログイン後は `/app` へ）。
  - README 冒頭と下部の「スクリーンショット」セクションの画像は、本番と同等の UI をローカルで撮影したものです。

### このリポジトリで見せたいポイント

- **フルスタック構成**: Next.js 16 App Router + Supabase + OpenAI を使った、認証 / DB / AI 要約 / ファイルアップロードまで一通りそろったミニ SaaS。
- **実務寄りのユースケース**: 会議メモ・仕様書・企画書など、実際の仕事で扱うドキュメントを AI 要約で整理するワークスペースを想定。
- **SaaS っぽい UI**: ホワイトベースで Money Forward 系の SaaS を意識したダッシュボード / サイドバー / 設定画面。D&D アップロードやインサイトカード、ショートカットヘルプなども実装。ユーザー設定（AI動作、共有リンク、ダッシュボード表示）をカスタマイズ可能。
- **運用を意識した設計**: `documents` / `document_versions` / `activity_logs` と RLS ポリシーを用意し、`docs/architecture.md` に RLS 本番対応プランや環境変数の整理 (`lib/config.ts`) を明文化。
- **品質・テスト**: Vitest によるユニットテスト（AI 生成ロジック / ドキュメント検索）、GitHub Actions による CI（lint / test / coverage / build）を設定し、README 冒頭にバッジで可視化。

### 主な機能

- **メール & パスワード認証**
  - `/auth/signup` サインアップ
  - `/auth/login` ログイン
  - `/auth/forgot` パスワードリセットメール送信
  - `/auth/reset` リセットリンクからのパスワード変更
  - `/auth/logout` ログアウト

- **ドキュメント管理（ログイン後 `/app`）**
  - タイトル・カテゴリ・本文・要約・タグを持つドキュメント一覧
  - フルテキスト検索（タイトル / 要約 / 本文 / タグ）
  - カテゴリフィルタ、作成日の昇順 / 降順ソート
  - 詳細検索（作成日 From/To、共有中だけ、お気に入りだけ、ピンだけ）
  - ★ お気に入り / 📌 ピン留め（ソート時にピン留め優先）
  - `/documents/[id]` で詳細表示、`/documents/[id]/edit` で編集
  - 変更前の内容を `document_versions` テーブルに保存して簡易バージョン履歴
  - アーカイブ / 一括削除 / 一括復元（アーカイブ一覧）による柔らかい削除運用
  - ダッシュボード上のドラッグ＆ドロップで PDF / Word からカードを自動生成
  - インサイトカード（直近30日件数 / カテゴリ Top3 / 共有リンク閲覧合計 など）

- **共有リンク（公開ビュー）**
  - `/documents/[id]` から「共有リンクを発行」すると、ログイン不要の閲覧用 URL（例: `/share/<token>`）を生成
  - 共有リンクはいつでも停止可能（DB 上では `share_token` を null に戻す）
  - 有効期限を 7日 / 30日 / 無期限から選択可能（`share_expires_at` を利用）
  - 閲覧アクセスは `activity_logs` の `view_share` として記録し、ダッシュボードのインサイトで合計閲覧回数を集計
  - 公開ビュー `/share/[token]` では要約・本文のみ閲覧でき、編集や削除は不可

- **AI 連携**
  - **タイトル自動生成**：タイトル欄が空の場合、本文から日本語タイトルを自動生成
  - **要約 & タグ自動生成**：`gpt-4.1-mini` を利用して 3〜5 行の要約と最大 3 タグを生成
  - 日本語ドキュメントを想定したプロンプト設計

- **ファイルアップロード**
  - `/new` で以下のファイルをアップロード可能
    - `.pdf`
    - `.doc` / `.docx`
  - 最大 **10MB** までを許可
  - PDF は `pdf-parse`、Word は `mammoth` を使ってテキスト抽出し、本文として保存
  - タイトル未入力なら、この抽出テキストを元に AI でタイトル生成

- **アカウント削除**
  - `/app` 下部の「アカウントの削除」から
    - ユーザーの `documents` / `document_versions` を削除
    - Supabase Auth のユーザー自体を削除（`service_role` キー使用、開発用途想定）
  - 実行前にブラウザの `confirm` ダイアログで確認

- **アクティビティログ**
  - ドキュメントの新規作成 / 更新 / 削除 / お気に入り・ピンの変更 / 共有リンクの有効化・無効化を `activity_logs` テーブルに記録
  - `/app` の下部に「最近のアクティビティ」として直近 10 件を一覧表示

- **コメント / メモ**
  - 各ドキュメント詳細ページで、自分用のコメントや TODO を追加可能
  - `document_comments` テーブルに保存し、時系列に表示

- **AI 要約の再生成**
  - ドキュメント詳細から「要約を再生成」ボタンを押すと、最新の本文をもとに AI による要約・タグを再作成

- **設定ページ（`/settings`）**
  - **AI 設定**
    - 新規ドキュメント作成時に「保存して要約生成」を既定のおすすめボタンにするかどうか
    - ダッシュボードのファイルアップロード時に AI 要約・タグを自動生成するかどうか
  - **共有リンク設定**
    - 新しく共有リンクを作成する際のデフォルト有効期限（7日 / 30日 / 無期限）
  - **ダッシュボード設定**
    - デフォルトの並び順（新しい順 / 古い順 / ピン留め優先）
    - アーカイブされたドキュメントをデフォルトで表示するかどうか
    - 共有中のドキュメントのみをデフォルトで表示するかどうか
  - **アカウント削除**
    - ユーザー自身のアカウントと関連データを完全に削除

- **その他**
  - ダッシュボードでのキーボードショートカット（例: `/` で検索フォーカス、`Shift + D` でカード削除）とショートカットヘルプモーダル。
  - ドキュメント詳細から Markdown (`.md`) としてエクスポート可能。

---

### 詳細ドキュメント（設計・仕様）

- [機能仕様書（DocuFlow Spec）](docs/spec-docuflow.md)
- [画面一覧 & 画面遷移（UI Flow）](docs/ui-flow.md)
- [DB スキーマ / テーブル定義](docs/db-schema.md)
- [アーキテクチャ設計メモ](docs/architecture.md)
- [デプロイメントガイド](docs/deployment.md)
- [トラブルシューティング](docs/troubleshooting.md)

---

## 技術スタック

- **フロントエンド**
  - Next.js 16 (App Router)
  - React 19
  - TypeScript
  - Tailwind CSS（シンプルな SaaS 風 UI）

- **バックエンド / インフラ**
  - Supabase
    - Auth（メール + パスワード）
    - PostgreSQL（`documents`, `document_versions` など）
  - OpenAI API（`gpt-4.1-mini`）

- **ユーティリティ**
  - `pdf-parse`（PDF → テキスト）
  - `mammoth`（Word → テキスト）

---

## セットアップ

### 1. 依存関係のインストール

```bash
cd "/Users/tanasho/Desktop/作成中ポートフォリオデータ/dooai"
npm install
```

### 2. 環境変数の設定（`.env.local`）

プロジェクト直下に `.env.local` を作成し、次のように設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=（Supabase の Project URL）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（anon public キー）
OPENAI_API_KEY=（OpenAI の API キー）
# アカウント削除機能を有効にする場合のみ
SUPABASE_SERVICE_ROLE_KEY=（Supabase の service_role キー）
```

### 3. Supabase テーブル

最低限、以下のテーブルが必要です（実際のカラムは Supabase ダッシュボードで作成済み想定）。

- `documents`
  - `id` (uuid, PK)
  - `user_id` (uuid)
  - `title` (text)
  - `category` (text)
  - `raw_content` (text)
  - `summary` (text)
  - `tags` (text[])
  - `is_favorite` (boolean)
  - `is_pinned` (boolean)
  - `share_token` (text, nullable) …… 共有リンク用トークン
  - `share_expires_at` (timestamptz, nullable) …… 共有リンクの有効期限（現状は未使用）
  - `created_at` (timestamptz, default now())

- `document_versions`
  - `id` (uuid, PK)
  - `document_id` (uuid, FK → documents.id)
  - `user_id` (uuid)
  - `title` / `category` / `raw_content` / `summary` / `tags`
  - `created_at` (timestamptz, default now())

- `activity_logs`
  - `id` (uuid, PK)
  - `user_id` (uuid)
  - `document_id` (uuid, nullable)
  - `document_title` (text, nullable)
  - `action` (text) …… `create_document` / `update_document` / `delete_document` / `toggle_favorite` / `toggle_pinned` / `enable_share` / `disable_share` / `add_comment` / `view_share` / `archive_document` / `restore_document`
  - `metadata` (jsonb, nullable) …… 追加情報（例: on/off など）
  - `created_at` (timestamptz, default now())

- `user_settings`
  - `user_id` (uuid, PK)
  - `ai_auto_summary_on_new` (boolean, default true) …… 新規作成時の AI 要約デフォルト
  - `ai_auto_summary_on_upload` (boolean, default true) …… アップロード時の AI 要約デフォルト
  - `default_share_expires_in` (text, default '7') …… 共有リンクのデフォルト有効期限
  - `default_sort` (text, default 'desc') …… ダッシュボードのデフォルト並び順
  - `default_show_archived` (boolean, default false) …… アーカイブ表示のデフォルト
  - `default_shared_only` (boolean, default false) …… 共有中のみ表示のデフォルト

- `document_comments`
  - `id` (uuid, PK)
  - `document_id` (uuid, FK → documents.id)
  - `user_id` (uuid, nullable)
  - `content` (text)
  - `created_at` (timestamptz, default now())

### Supabase 側でやってほしい SQL（1回だけ）

以下の SQL を Supabase の SQL Editor で実行してください。

#### `user_settings` テーブルの作成

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

> 既に `user_settings` テーブルが存在する場合は、不足しているカラムだけを追加してください：
> ```sql
> alter table public.user_settings
> add column if not exists default_share_expires_in text not null default '7',
> add column if not exists default_sort text not null default 'desc',
> add column if not exists default_show_archived boolean not null default false,
> add column if not exists default_shared_only boolean not null default false;
> ```

### RLS / マルチテナント設計（Supabase）

本番運用を想定した場合、**各ユーザーが自分のデータだけを読める / 書ける** ようにするため、  
Supabase の Row Level Security（RLS）を前提とした設計にしています。

- 開発中（ローカル）: RLS は **disabled** のままにしておき、挙動確認を優先
- 本番運用時: RLS を **enabled** にし、`auth.uid()` と `user_id` を紐付けるポリシーを有効化

#### 1. RLS の有効化（テーブル単位）

```sql
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.activity_logs enable row level security;
```

#### 2. `documents` テーブル（本人のドキュメントだけフルアクセス）

```sql
create policy "documents_owner_all"
on public.documents
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

#### 3. `documents` の共有リンク閲覧用（誰でも読めるが、share_token 付き行だけ）

```sql
create policy "documents_shared_read"
on public.documents
for select
using (share_token is not null);
```

#### 4. `document_versions` テーブル（本人の履歴だけフルアクセス）

```sql
create policy "document_versions_owner_all"
on public.document_versions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

#### 5. `activity_logs` テーブル（本人のログだけ参照 / 挿入）

```sql
-- 自分のログだけ読める
create policy "activity_logs_owner_read"
on public.activity_logs
for select
using (auth.uid() = user_id);

-- 自分自身としてのみ書き込み可能
create policy "activity_logs_owner_insert"
on public.activity_logs
for insert
with check (auth.uid() = user_id);
```

> メモ: 現状の実装では、サーバー側 Supabase クライアントは anon key ベースで動かしており、  
> `auth.uid()` を正しく解決するには `@supabase/auth-helpers-nextjs` 等でユーザートークン連携が必要です。  
> そのため、ローカル開発では「RLS disabled + ポリシーだけ定義」という状態にしておき、  
> 将来的に Auth Helpers を導入した段階で RLS を enabled に切り替える想定です。

---

## 開発用コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック & Lint
npm run lint

# テスト（Vitest）
npm test

# カバレッジ付きテスト
npm run test:coverage

# 本番ビルド & 起動
npm run build
npm start
```

ブラウザで `http://localhost:3000` を開くと、ログインページ（`/auth/login`）にリダイレクトされます。  
ログイン後は `/app` のワークスペース画面に遷移します。

> 本番環境にデプロイした場合は、`http://localhost:3000` の代わりに  
> Vercel などの発行した URL（例: `https://docuflow.example.com`）にアクセスします。

---

## スクリーンショット（UI イメージ）

GitHub 上で見たときに UI の雰囲気が一目で伝わるよう、`docs/screenshots` 配下の実際の画面キャプチャをそのまま貼っています。

![ダッシュボード画面](docs/screenshots/dashboard.png)

> メインワークスペース画面。左サイドバー、概要カード（ドキュメント総数・ピン留め・お気に入り・インサイト）、カテゴリ別トップ3ミニグラフ、ドラッグ＆ドロップアップロード、詳細検索フォーム（日付範囲・共有中フィルタ含む）、ドキュメントカード一覧、最近のアクティビティを表示。

![新規ドキュメント作成画面](docs/screenshots/new-document.png)

> 2 カラムレイアウトの新規作成画面。左にフォーム（タイトル / カテゴリ / 本文 / ファイルアップロード）、右に AI 要約の説明と使い方ガイド。

![ドキュメント詳細画面](docs/screenshots/document-detail.png)

> AI 要約、メタ情報（文字数・推定読了時間）、コメント欄、共有リンクボタン、バージョン履歴などをまとめた詳細ビュー。

![設定画面](docs/screenshots/settings.png)

> AI設定・共有リンク設定・ダッシュボード設定・アカウント削除セクションを含む設定ページ。

![共有リンク閲覧画面](docs/screenshots/share-view.png)

> 共有リンクからアクセスする公開ビュー。要約と本文のみ閲覧可能（編集不可）。

---

### 📸 スクリーンショットの追加方法

現在、以下のスクリーンショットが必要です。実際の画面をキャプチャして `docs/screenshots/` に保存してください：

| ファイル名 | 説明 | 撮影する画面 |
|-----------|------|------------|
| `dashboard.png` | ✅ 既存 | `/app` ダッシュボード画面 |
| `new-document.png` | ❌ 要追加 | `/new` 新規ドキュメント作成画面 |
| `document-detail.png` | ❌ 要追加 | `/documents/[id]` ドキュメント詳細画面 |
| `settings.png` | ❌ 要追加 | `/settings` 設定画面（AI設定・共有リンク設定・ダッシュボード設定が表示されている状態） |
| `share-view.png` | ❌ 要追加 | `/share/[token]` 共有リンク閲覧画面 |

**撮影手順**:
1. ローカル開発サーバー（`npm run dev`）または本番環境で各画面を開く
2. ブラウザの開発者ツールで適切な画面サイズに調整（推奨: 1920x1080 または 1440x900）
3. スクリーンショットを撮影（macOS: `Cmd + Shift + 4`、Windows: `Win + Shift + S`）
4. `docs/screenshots/` に保存

**動画（オプション）**:
- デモ動画（GIF または MP4）を `docs/screenshots/demo.gif` または `docs/screenshots/demo.mp4` として追加すると、より分かりやすくなります。
- 推奨内容: ドキュメント作成 → AI 要約生成 → 検索 → 共有リンク発行 の一連の流れ

---

## メモ

このリポジトリは「DocuFlow」という名前で、以下を意識した構成になっています。

- SaaS っぽい UI / ページ構成
- 認証まわり（ログイン / サインアップ / パスワードリセット）
- AI を絡めた実用的な機能（タイトル・要約・タグ・ファイルアップロード）
- Next.js 16 App Router + Supabase の素直な組み合わせ

GitHub 上でポートフォリオとして見られても恥ずかしくないレベルの構成を目指しています。  
さらに伸ばしたい場合は、料金プラン風の UI、組織単位のワークスペース、共有リンク機能などを追加していくと SaaS 感が一段と増します。

---

## アーキテクチャ（設計のイメージ）

### 全体像

```text
ブラウザ
  ├─ /auth/*  …… 認証系ページ（ログイン / サインアップ / パスワードリセット）
  ├─ /app     …… ログイン後のワークスペース（検索・一覧・ピン / お気に入り / アクティビティログ）
  ├─ /new     …… 新規ドキュメント作成（テキスト or PDF / Word アップロード）
  ├─ /documents/[id] …… ドキュメント詳細 / 共有リンク発行
  └─ /share/[token] …… 共有リンクからの公開閲覧ページ（認証不要）

Next.js 16 (App Router)
  ├─ Server Components / Server Actions
  │    ├─ Supabase クエリ（documents / document_versions / activity_logs）
  │    └─ OpenAI API 呼び出し（要約 / タグ / タイトル生成）
  └─ Middleware
       └─ クッキー（docuhub_ai_auth / docuhub_ai_user_id）を見て /app, /new, /documents/* をガード

Supabase
  ├─ Auth …… Email + Password
  ├─ DB  …… documents, document_versions, activity_logs
  └─ （任意）service_role …… アカウント削除で auth.users も削除

OpenAI
  └─ gpt-4.1-mini …… 日本語要約・タグ・タイトル生成
```

### 主なフロー

- **ログイン**
  1. `/auth/login` から Supabase Auth にサインイン
  2. 成功したら `docuhub_ai_auth=1` と `docuhub_ai_user_id=<supabase user id>` をクッキーに保存
  3. `middleware.ts` がこれらを見て `/app` / `/new` / `/documents/*` へのアクセスを制御

- **ドキュメント新規作成（テキスト or PDF / Word）**
  1. `/new` でタイトル・カテゴリ・本文、もしくは PDF / Word ファイルを入力
  2. Server Action `createDocument` がフォームを受け取り、必要ならファイルを `pdf-parse` / `mammoth` でテキスト抽出
  3. 抽出された本文を `generateTitleFromContent` / `generateSummaryAndTags` に渡して AI からタイトル・要約・タグを取得
  4. Supabase `documents` に `user_id` 付きで保存
  5. `/` → middleware 経由で `/app` にリダイレクトされ、一覧に反映

- **一覧・検索**
  1. `/app` で `documents` を `user_id` で絞り込み
  2. 取得結果をフロント側でフィルタ（タイトル / 要約 / 本文 / タグ）＋カテゴリ＋並び順
  3. ピン留めされたドキュメントを優先して表示し、★ / 📌 の Server Action で状態を更新

- **編集 & バージョン履歴**
  1. `/documents/[id]/edit` からドキュメントを更新する際、現在の内容を `document_versions` にコピーしてから本体を更新
  2. `/documents/[id]` で最新 5 件のバージョン履歴を一覧表示

- **アカウント削除**
  1. `/app` の「アカウントを完全に削除する」を押すと、ブラウザで確認ダイアログを表示
  2. OK の場合、Server Action `deleteAccount` が `documents` / `document_versions` を削除
  3. `supabaseAdmin`（service_role キー利用）で Supabase Auth のユーザーも削除
  4. `/auth/logout` にリダイレクトし、クッキーを削除してセッション終了

この構成により、「Next.js 16 App Router × Supabase × OpenAI」というよくある技術スタックの中で、  
**認証・AI 要約・タグ付け・ファイルアップロード・共有リンク・アクティビティログ・アカウント削除** までを一通り体験できるサンプルとして使えるようにしています。

---

## 今後の拡張アイデア

- **組織 / チーム対応**: `workspaces` テーブルを追加して、複数ユーザーでドキュメントを共有できる組織単位のワークスペース化
- **料金プラン風 UI**: Free / Pro などのプランを UI 上で表現し、プランによってアップロード上限や AI 実行回数を変える
- **より高度な RLS 運用**: `@supabase/auth-helpers-nextjs` を導入し、`auth.uid()` ベースで RLS を本番レベルで有効化
- **バージョン比較 UI**: `document_versions` 間で差分（diff）を表示する画面を追加し、過去版との比較をしやすくする
- **全文検索エンジン連携**: Supabase の `pgvector` もしくは外部の検索サービスと連携し、ベクトル検索による類似ドキュメント検索を実験
