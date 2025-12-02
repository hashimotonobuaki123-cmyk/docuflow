## DocuFlow DB スキーマ

本プロジェクトで利用している主なテーブルと、そのカラム設計をまとめます。  
実際の定義は Supabase ダッシュボードまたはマイグレーション SQL に準拠します。

---

### 1. `documents` テーブル

**用途**: ユーザーが作成したドキュメント本体を保持する。

| カラム名           | 型          | 必須 | 説明                                                             |
| ------------------ | ----------- | ---- | ---------------------------------------------------------------- |
| `id`               | uuid (PK)   | ✔︎    | ドキュメント ID。`gen_random_uuid()` などで生成。                |
| `user_id`          | uuid        | ✔︎    | 所有ユーザーの Supabase Auth user ID。                           |
| `title`            | text        | ✔︎    | ドキュメントタイトル。空の場合は AI で自動生成。                 |
| `category`         | text        | ✖︎    | カテゴリ（例: 仕様書 / 議事録 / 企画書）。未指定時は「未分類」。 |
| `raw_content`      | text        | ✔︎    | 本文（テキスト / 抽出テキスト）。                                |
| `summary`          | text        | ✖︎    | AI による要約。                                                  |
| `tags`             | text[]      | ✖︎    | AI によるタグ配列（最大 3 件を想定）。                           |
| `is_favorite`      | boolean     | ✔︎    | お気に入りフラグ。デフォルト `false`。                           |
| `is_pinned`        | boolean     | ✔︎    | ピン留めフラグ。デフォルト `false`。                             |
| `is_archived`      | boolean     | ✔︎    | アーカイブフラグ。論理削除用途。デフォルト `false`。             |
| `share_token`      | text        | ✖︎    | 共有リンク用トークン。null のとき共有無効。                      |
| `share_expires_at` | timestamptz | ✖︎    | 共有リンクの有効期限（7日 / 30日 / 無期限）。                    |
| `created_at`       | timestamptz | ✔︎    | 作成日時。デフォルト `now()`。                                   |

---

### 2. `document_versions` テーブル

**用途**: ドキュメント更新前のスナップショットを保存し、簡易バージョン履歴として利用する。

| カラム名      | 型          | 必須 | 説明                                     |
| ------------- | ----------- | ---- | ---------------------------------------- |
| `id`          | uuid (PK)   | ✔︎    | バージョン ID。                          |
| `document_id` | uuid        | ✔︎    | 元ドキュメントの `documents.id`。        |
| `user_id`     | uuid        | ✔︎    | 操作ユーザーの ID。                      |
| `title`       | text        | ✔︎    | 当時のタイトル。                         |
| `category`    | text        | ✖︎    | 当時のカテゴリ。                         |
| `raw_content` | text        | ✖︎    | 当時の本文。                             |
| `summary`     | text        | ✖︎    | 当時の要約。                             |
| `tags`        | text[]      | ✖︎    | 当時のタグ。                             |
| `created_at`  | timestamptz | ✔︎    | バージョン作成日時。デフォルト `now()`。 |

---

### 3. `activity_logs` テーブル

**用途**: ユーザーの主要な操作履歴を保存し、監査と UI 表示に利用する。

| カラム名         | 型          | 必須 | 説明                                                                                                                                                                               |
| ---------------- | ----------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | uuid (PK)   | ✔︎    | アクティビティ ID。                                                                                                                                                                |
| `user_id`        | uuid        | ✔︎    | 操作ユーザー ID。                                                                                                                                                                  |
| `document_id`    | uuid        | ✖︎    | 対象ドキュメント ID（アカウント削除などでは null）。                                                                                                                               |
| `document_title` | text        | ✖︎    | 対象ドキュメントのタイトル（ログ時点のコピー）。                                                                                                                                   |
| `action`         | text        | ✔︎    | アクション種別。例: `create_document`, `update_document`, `delete_document`, `toggle_favorite`, `toggle_pinned`, `enable_share`, `disable_share`, `add_comment`, `view_share` 等。 |
| `metadata`       | jsonb       | ✖︎    | 追加情報（例: `{ "details": "on" }` など）。                                                                                                                                       |
| `created_at`     | timestamptz | ✔︎    | ログ作成日時。デフォルト `now()`。                                                                                                                                                 |

---

### 4. `document_comments` テーブル

**用途**: 各ドキュメントに紐づくコメント（メモ / TODO など）を保存する。

| カラム名      | 型          | 必須 | 説明                                                  |
| ------------- | ----------- | ---- | ----------------------------------------------------- |
| `id`          | uuid (PK)   | ✔︎    | コメント ID。                                         |
| `document_id` | uuid        | ✔︎    | 対象ドキュメントの `documents.id`。                   |
| `user_id`     | uuid        | ✖︎    | コメント投稿者の ID。匿名利用も許容するなら null 可。 |
| `content`     | text        | ✔︎    | コメント本文。                                        |
| `created_at`  | timestamptz | ✔︎    | コメント作成日時。デフォルト `now()`。                |

---

### 5. `user_settings` テーブル

**用途**: ユーザーごとの AI 動作や共有リンク設定など、DocuFlow の挙動をカスタマイズするための設定を保存する。

| カラム名                    | 型      | 必須 | 説明                                                                             |
| --------------------------- | ------- | ---- | -------------------------------------------------------------------------------- |
| `user_id`                   | uuid PK | ✔︎    | 対象ユーザーの Supabase Auth user ID。1 ユーザーにつき 1 行を想定。              |
| `ai_auto_summary_on_new`    | boolean | ✔︎    | 新規作成画面で「保存して要約生成」を既定のおすすめボタンにするかどうか。         |
| `ai_auto_summary_on_upload` | boolean | ✔︎    | ダッシュボードの PDF / Word アップロード時に、AI 要約・タグ生成を自動で行うか。 |
| `default_share_expires_in`   | text    | ✔︎    | 新しく共有リンクを作成する際のデフォルト有効期限。`"7"` / `"30"` / `"none"`。   |
| `default_sort`                | text    | ✔︎    | ダッシュボードのデフォルト並び順。`"desc"` / `"asc"` / `"pinned"`。              |
| `default_show_archived`       | boolean | ✔︎    | ダッシュボードでアーカイブされたドキュメントをデフォルトで表示するか。          |
| `default_shared_only`         | boolean | ✔︎    | ダッシュボードで共有中のドキュメントのみをデフォルトで表示するか。              |

推奨する初期値:

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

---

### 6. 推奨インデックス / 制約（例）

実際の運用負荷は小さい想定だが、以下のインデックス / 制約を推奨する。

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

---

### 7. RLS ポリシー（概要）

RLS を本番で有効化する場合、以下の方針で運用する:

- `documents` / `document_versions` / `activity_logs` はすべて `user_id = auth.uid()` の行のみ参照・更新可能。
- `documents` の `share_token is not null` な行だけは、`/share/[token]` からの閲覧に限り公開。

詳細な SQL は README の「RLS / マルチテナント設計（Supabase）」セクションを参照。
