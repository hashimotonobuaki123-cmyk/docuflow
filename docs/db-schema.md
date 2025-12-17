## DocuFlow DB スキーマ

本プロジェクトで利用している主なテーブルと、そのカラム設計をまとめます。  
実際の定義は Supabase ダッシュボードまたはマイグレーション SQL に準拠します。

---

### 1. `documents` テーブル

**用途**: ユーザーが作成したドキュメント本体を保持する。

| カラム名           | 型           | 必須 | 説明                                                                                  |
| ------------------ | ------------ | ---- | ------------------------------------------------------------------------------------- |
| `id`               | uuid (PK)    | ✔︎    | ドキュメント ID。`gen_random_uuid()` などで生成。                                     |
| `user_id`          | uuid         | ✔︎    | 所有ユーザーの Supabase Auth user ID。                                                |
| `organization_id`  | uuid         | ✖︎    | 所属組織の ID。null の場合は「個人ドキュメント」として扱う。                          |
| `title`            | text         | ✔︎    | ドキュメントタイトル。空の場合は AI で自動生成。                                      |
| `category`         | text         | ✖︎    | カテゴリ（例: 仕様書 / 議事録 / 企画書）。未指定時は「未分類」。                      |
| `raw_content`      | text         | ✔︎    | 本文（テキスト / 抽出テキスト）。                                                     |
| `summary`          | text         | ✖︎    | AI による要約。                                                                       |
| `tags`             | text[]       | ✖︎    | AI によるタグ配列（最大 3 件を想定）。                                                |
| `is_favorite`      | boolean      | ✔︎    | お気に入りフラグ。デフォルト `false`。                                                |
| `is_pinned`        | boolean      | ✔︎    | ピン留めフラグ。デフォルト `false`。                                                  |
| `is_archived`      | boolean      | ✔︎    | アーカイブフラグ。論理削除用途。デフォルト `false`。                                  |
| `share_token`      | text         | ✖︎    | 共有リンク用トークン。null のとき共有無効。                                           |
| `share_expires_at` | timestamptz  | ✖︎    | 共有リンクの有効期限。期限切れは共有ページで取得できない（DB関数側で判定）。          |
| `embedding`        | vector(1536) | ✖︎    | OpenAI text-embedding-3-small による埋め込みベクトル。類似検索用。                     |
| `created_at`       | timestamptz  | ✔︎    | 作成日時。デフォルト `now()`。                                                        |

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

| カラム名         | 型          | 必須 | 説明                                                                                                                                                                 |
| ---------------- | ----------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | uuid (PK)   | ✔︎    | アクティビティ ID。                                                                                                                                                  |
| `user_id`        | uuid        | ✔︎    | 操作ユーザー ID。                                                                                                                                                    |
| `organization_id`| uuid        | ✖︎    | 対象ドキュメントが属する組織 ID。個人ドキュメントの場合は null。                                                                                                    |
| `document_id`    | uuid        | ✖︎    | 対象ドキュメント ID（アカウント削除などでは null）。                                                                                                                 |
| `document_title` | text        | ✖︎    | 対象ドキュメントのタイトル（ログ時点のコピー）。                                                                                                                     |
| `action`         | text        | ✔︎    | アクション種別。例: `create_document`, `update_document`, `delete_document`, `toggle_favorite`, `toggle_pinned`, `enable_share`, `disable_share`, `add_comment` 等。 |
| `metadata`       | jsonb       | ✖︎    | 追加情報（例: `{ "details": "on" }` など）。                                                                                                                         |
| `created_at`     | timestamptz | ✔︎    | ログ作成日時。デフォルト `now()`。                                                                                                                                   |

---

### 4. `document_comments` テーブル

**用途**: 各ドキュメントに紐づくコメント（メモ / TODO など）を保存する。

| カラム名        | 型          | 必須 | 説明                                                  |
| --------------- | ----------- | ---- | ----------------------------------------------------- |
| `id`            | uuid (PK)   | ✔︎    | コメント ID。                                         |
| `document_id`   | uuid        | ✔︎    | 対象ドキュメントの `documents.id`。                   |
| `user_id`       | uuid        | ✖︎    | コメント投稿者の ID。匿名利用も許容するなら null 可。 |
| `organization_id`| uuid       | ✖︎    | コメント対象ドキュメントが属する組織 ID。             |
| `content`       | text        | ✔︎    | コメント本文。                                        |
| `created_at`    | timestamptz | ✔︎    | コメント作成日時。デフォルト `now()`。                |

---

### 5. `user_settings` テーブル

**用途**: ユーザーごとの設定とサブスクリプション情報を保持する。

| カラム名                    | 型          | 必須 | 説明                                                                                  |
| --------------------------- | ----------- | ---- | ------------------------------------------------------------------------------------- |
| `user_id`                   | uuid (PK)   | ✔︎    | ユーザー ID（`auth.users.id` を参照）。                                              |
| `ai_auto_summary_on_new`    | boolean     | ✖︎    | 新規ドキュメント作成時にAI要約を自動生成するか。デフォルト `true`。                   |
| `ai_auto_summary_on_upload` | boolean     | ✖︎    | ファイルアップロード時にAI要約を自動生成するか。デフォルト `true`。                   |
| `default_share_expires_in`  | text        | ✖︎    | 共有リンクのデフォルト有効期限（`"7"`, `"30"`, `"none"`）。デフォルト `"7"`。          |
| `default_sort`              | text        | ✖︎    | ダッシュボードのデフォルトソート（`"desc"`, `"asc"`, `"pinned"`）。デフォルト `"desc"`。|
| `default_show_archived`      | boolean     | ✖︎    | ダッシュボードでアーカイブ済みをデフォルト表示するか。デフォルト `false`。             |
| `default_shared_only`        | boolean     | ✖︎    | ダッシュボードで共有済みのみをデフォルト表示するか。デフォルト `false`。              |
| `subscription_plan`          | text        | ✔︎    | 個人ユーザーのサブスクリプションプラン（`free`, `pro`, `team`, `enterprise`）。デフォルト `free`。 |
| `stripe_customer_id`        | text        | ✖︎    | Stripe 上の Customer ID（個人ユーザー用）。                                           |
| `stripe_subscription_id`    | text        | ✖︎    | Stripe 上の Subscription ID（個人ユーザー用）。                                       |
| `billing_email`             | text        | ✖︎    | 請求先メールアドレス（Stripe Checkout で入力されたもの）。                             |
| `subscription_status`       | text        | ✖︎    | サブスクリプション状態（`active`, `canceled`, `past_due`, `trialing`）。              |
| `current_period_end`        | timestamptz | ✖︎    | 現在の請求期間の終了日時。                                                             |

---

### 6. `organizations` テーブル（サブスクリプション関連カラム）

**用途**: 組織（チーム）のサブスクリプション情報を保持する。

| カラム名                 | 型         | 必須 | 説明                                                                                  |
| ------------------------ | ---------- | ---- | ------------------------------------------------------------------------------------- |
| `id`                     | uuid (PK)  | ✔︎    | 組織 ID。                                                                             |
| `name`                   | text       | ✔︎    | 組織名。                                                                              |
| `slug`                   | text       | ✖︎    | 組織のスラッグ（URL用）。                                                              |
| `owner_id`               | uuid       | ✔︎    | 組織のオーナーとなるユーザーの ID。                                                    |
| `plan`                   | text       | ✔︎    | 組織のサブスクリプションプラン（`free`, `pro`, `team`, `enterprise`）。デフォルト `free`。 |
| `seat_limit`             | integer    | ✖︎    | 組織内の最大メンバー数（null の場合は無制限）。                                        |
| `document_limit`         | integer    | ✖︎    | 組織内で作成可能なドキュメント数の上限（null の場合は無制限）。                        |
| `stripe_customer_id`     | text       | ✖︎    | Stripe 上の Customer ID（組織用）。                                                   |
| `stripe_subscription_id` | text       | ✖︎    | Stripe 上の Subscription ID（組織用）。                                                |
| `billing_email`          | text       | ✖︎    | 請求先メールアドレス（Stripe Checkout で入力されたもの）。                              |
| `subscription_status`    | text       | ✖︎    | サブスクリプション状態（`active`, `canceled`, `past_due`, `trialing`）。              |
| `current_period_end`     | timestamptz| ✖︎    | 現在の請求期間の終了日時。                                                             |
| `created_at`             | timestamptz| ✔︎    | 作成日時。デフォルト `now()`。                                                         |
| `updated_at`             | timestamptz| ✔︎    | 更新日時。デフォルト `now()`。                                                         |

詳細な組織管理テーブル（`organization_members`, `organization_invitations`）については、  
`supabase/migrations/20241206_add_organizations.sql` を参照。

---

### 7. 推奨インデックス / 制約（例）

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

-- documents: ベクトル類似検索用（IVFFlat インデックス）
create index if not exists documents_embedding_idx
  on public.documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
```

---

### 8. `stripe_webhook_events` テーブル

**用途**: Stripe Webhook の冪等性（重複イベント対策）と観測（失敗時の原因追跡）に利用する。

| カラム名        | 型          | 必須 | 説明 |
| --------------- | ----------- | ---- | ---- |
| `id`            | text (PK)   | ✔︎    | Stripe Event ID（`evt_...`）。重複処理防止のキー。 |
| `type`          | text        | ✔︎    | イベントタイプ（例: `checkout.session.completed`）。 |
| `livemode`      | boolean     | ✔︎    | Stripe の livemode フラグ。 |
| `received_at`   | timestamptz | ✔︎    | 受信日時。 |
| `processed_at`  | timestamptz | ✖︎    | 処理完了日時。 |
| `status`        | text        | ✔︎    | `processing` / `processed` / `failed` / `ignored`。 |
| `error_message` | text        | ✖︎    | 失敗時のエラーメッセージ（短縮）。 |
| `payload`       | jsonb       | ✖︎    | 最小限のペイロード（デバッグ用途）。 |

---

### 9. `ai_usage_monthly` テーブル

**用途**: 月間AI呼び出し回数の上限を強制するための月次カウント（個人/組織スコープ）。

| カラム名           | 型          | 必須 | 説明 |
| ------------------ | ----------- | ---- | ---- |
| `month_start`      | date (PK*)  | ✔︎    | 月初日（YYYY-MM-01）。 |
| `scope_type`       | text (PK*)  | ✔︎    | `personal` / `organization`。 |
| `scope_id`         | uuid (PK*)  | ✔︎    | `scope_type` に対応するID（personal=auth.users.id / organization=organizations.id）。 |
| `calls`            | integer     | ✔︎    | 当月のAI呼び出し回数。 |
| `updated_at`       | timestamptz | ✔︎    | 更新日時。 |

(*) 主キーは `(month_start, scope_type, scope_id)` の複合キー。

---

### 10. RLS ポリシー（概要）

RLS を本番で有効化する場合、以下の方針で運用する:

- `documents` / `document_versions` / `activity_logs` / `document_comments` は  
  - `user_id = auth.uid()` の行、または  
  - `organization_members` 経由で所属している `organization_id` を持つ行  
  のみ参照・更新可能。
- 共有リンクは `get_shared_document(token)` の RPC でのみ公開（匿名の直接SELECTを禁止）。
- `organizations` / `organization_members` / `organization_invitations` は、所属メンバーのみ参照可能で、管理操作はオーナー（`owner_id`）に限定。

詳細な SQL は `supabase/migrations/20241205_enable_rls.sql` および  
`supabase/migrations/20241206_add_organizations.sql` を参照。

---

### 11. ベクトル検索（pgvector）

**用途**: ドキュメントの意味的な類似検索を実現する。

#### 11.1. pgvector 拡張の有効化

```sql
-- Supabase で pgvector を有効化
create extension if not exists vector with schema public;
```

#### 11.2. 類似検索用 RPC 関数

```sql
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  title text,
  category text,
  summary text,
  tags text[],
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    d.id,
    d.title,
    d.category,
    d.summary,
    d.tags,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where
    d.embedding is not null
    and d.is_archived = false
    and (filter_user_id is null or d.user_id = filter_user_id)
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

#### 11.3. 使用例

```sql
-- 類似ドキュメントを検索
select * from match_documents(
  '[0.1, 0.2, ...]'::vector,  -- クエリの埋め込みベクトル（1536次元）
  0.7,                         -- 類似度の閾値
  5,                           -- 返す件数
  'user-uuid-here'             -- ユーザーID（オプション）
);
```
