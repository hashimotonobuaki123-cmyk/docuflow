## DocuFlow アーキテクチャ設計

### 1. 全体構成

- **フロントエンド / BFF**
  - Next.js 16 (App Router)
  - Server Components + Server Actions を中心とした実装
  - 認証情報はクッキーベースで扱い、`middleware.ts` で保護ルートを制御

- **バックエンド**
  - Supabase (PostgreSQL + Auth)
  - Supabase JS クライアントを Next.js のサーバー側から利用

- **AI サービス**
  - OpenAI API (`gpt-4.1-mini`)
  - `lib/ai.ts` で要約 / タグ / タイトル生成をカプセル化

```text
ブラウザ
  ├─ Next.js (App Router)
  │    ├─ Server Components / Server Actions
  │    ├─ Middleware (認証ガード)
  │    └─ UI コンポーネント (Logo, UserMenu, etc.)
  ├─ Supabase (DB + Auth)
  └─ OpenAI API (gpt-4.1-mini)
```

### 2. レイヤ構造

1. **Presentation 層**
   - `app/` 以下の各ページコンポーネント
   - Tailwind CSS による SaaS 風 UI

2. **Application 層（Server Actions）**
   - `app/new/page.tsx` の `createDocument`
   - `app/documents/[id]/page.tsx` の削除 / 共有トグル
   - `app/documents/[id]/edit/page.tsx` の更新処理
   - `app/app/page.tsx` のピン / お気に入りトグル

3. **Domain / Service 層**
   - `lib/ai.ts`: AI 要約 / タグ / タイトル生成
   - `lib/activityLog.ts`: アクティビティログの記録
   - `lib/userSettings.ts`: ユーザー設定（AI設定・共有リンク設定・ダッシュボード設定）の取得・保存

4. **Infrastructure 層**
   - `lib/config.ts`: 環境変数の一元管理（Supabase / OpenAI / service_role キー）
   - `lib/supabaseClient.ts`: anon key での Supabase クライアント
   - `lib/supabaseAdmin.ts`: service_role キーでの管理クライアント（任意）

### 3. 認証・認可フロー

- ログイン成功時、クライアント側で以下のクッキーを設定:
  - `docuhub_ai_auth=1`
  - `docuhub_ai_user_id=<supabase user id>`
- `middleware.ts` が `docuhub_ai_auth` を参照し、以下を制御:
  - 未認証: `/app`, `/new`, `/documents/*`, `/settings` へのアクセスを `/auth/login` にリダイレクト
  - `/share/[token]` は例外として認証スキップ
- サーバーコンポーネントでは `cookies()` から `docuhub_ai_user_id` を読み取り、`user_id` による行フィルタを行う。

### 4. 主要フロー

#### 4.1 新規ドキュメント作成

1. ユーザーが `/new` でフォーム入力 or ファイルアップロード
2. Server Action `createDocument` がフォームを受け取る
3. ファイルがあれば `pdf-parse` / `mammoth` でテキスト抽出
4. 本文を `generateTitleFromContent`, `generateSummaryAndTags` に渡して AI 呼び出し
5. Supabase `documents` に挿入（`user_id` を付与）
6. `activity_logs` に `create_document` を記録
7. `/app` へリダイレクト

#### 4.2 ドキュメント更新 & バージョン履歴

1. `/documents/[id]/edit` でフォーム送信
2. Server Action `updateDocument` が現在の `documents` 行を取得
3. 取得した内容を `document_versions` にコピー
4. 本文から再度 `generateSummaryAndTags` を呼び出し、`documents` を更新
5. `activity_logs` に `update_document` を記録

#### 4.2.1 新規ドキュメント作成（設定連携）

1. `/new` でフォーム送信
2. Server Action `createDocument` が `getAISettingsForUser` を呼び出し、ユーザーの AI 設定を取得
3. `autoSummaryOnNew` が `true` の場合は AI 要約を生成、`false` の場合はスキップ
4. ダッシュボードの D&D アップロード時も同様に `autoSummaryOnUpload` を参照

#### 4.2.2 ダッシュボード表示（設定連携）

1. `/app` にアクセス
2. Server Component が `getDashboardSettingsForUser` を呼び出し、ユーザーのダッシュボード設定を取得
3. URL パラメータがない場合、設定のデフォルト値（並び順・アーカイブ表示・共有中のみ）を適用
4. ドキュメント一覧を表示

#### 4.3 共有リンク

1. `/documents/[id]` から「共有リンクを発行」を押す
2. Server Action `enableShare` がユーザーの設定（`user_settings.default_share_expires_in`）を読み取り、デフォルト有効期限を適用
3. ランダム文字列で `share_token` を生成し、有効期限があれば `share_expires_at` を設定
4. `/share/[token]` にアクセスすると、`share_token` で `documents` 行を検索し、有効期限をチェックして閲覧用ページを表示
5. 「共有を停止」で `share_token` を `null` に更新し、`activity_logs` に `disable_share` を残す

#### 4.4 ユーザー設定の保存・読み取り

1. `/settings` で各設定フォーム（AI設定・共有リンク設定・ダッシュボード設定）を送信
2. Server Action が `lib/userSettings.ts` の `upsert*SettingsForUser` を呼び出し、`user_settings` テーブルに保存
3. 各機能（新規作成・アップロード・共有リンク発行・ダッシュボード表示）で `get*SettingsForUser` を呼び出し、デフォルト値を取得
4. 設定が存在しない場合は、`DEFAULT_*_SETTINGS` を使用

### 5. エラーハンドリング・ロギング

- Supabase / OpenAI 呼び出しでエラーが発生した場合、`console.error` でサーバーログに出力。
- ユーザー向けには、致命的なエラー時は基本的に「一覧に戻す」リダイレクトでリカバリ。
- アカウント削除時に `supabaseAdmin` が未設定であれば警告ログを出し、処理を中断する。

### 6. テスト戦略（簡易）

- **ユニットテスト（Vitest）**
  - `lib/ai.ts`
    - OpenAI クライアントをモックし、プロンプトが返す JSON のパース / フォールバック要約 / デフォルトタイトル / デフォルトカテゴリの挙動を確認。
  - `app/app/page.tsx` の `filterDocuments`
    - タイトル / 要約 / 本文 / タグを対象としたフルテキスト検索、お気に入り・ピン留め・カテゴリフィルタの組み合わせを検証。
- **カバレッジ**
  - `vitest.config.ts` で `coverage` を有効化し、`npm run test:coverage` でレポートを出力。
  - GitHub Actions の CI では `npm test` を実行し、プルリクごとにユニットテストが自動実行される。

### 7. 今後の改善余地（アーキ観点）

- `@supabase/auth-helpers-nextjs` を導入し、RLS を本番環境でも有効化可能な構成に移行する。
- OpenAI 呼び出し結果をキャッシュするレイヤー（例: Supabase の別テーブル）を設け、再要約のコストを削減する。
- Server Actions をユースケース単位のサービス関数に薄く委譲し、テストしやすい構造に分解する。

### 8. Supabase RLS 本番対応プラン（構想レベル）

現状は「**RLS のポリシー定義は用意しておきつつ、開発環境では RLS disabled**」という状態で運用している。  
本番で RLS を有効にする場合は、次のような段階的ステップを想定している。

1. **RLS を有効にするテーブルのスコープを決める**
   - 第一段階では `documents` / `document_versions` / `activity_logs` の 3 つに限定。
   - `document_comments` や共有リンク用の公開ポリシーは第二段階以降に検討。

2. **Auth Helpers の導入ポイントを限定する**
   - いきなり全ページを `@supabase/auth-helpers-nextjs` に切り替えず、まずは `/app` のみで、
     - Server Actions から `createServerSupabaseClient()` を使って  
       `user.id`（= `auth.uid()`）が正しく取得できることを確認する。
   - 問題がなければ `/new` / `/documents/[id]` へ徐々に適用範囲を広げる。

3. **RLS の有効化手順**
   - すでに README に記載しているポリシーを前提に、以下の順で行う想定。
     1. ステージング環境の Supabase プロジェクトを用意し、そこで RLS を `enable`。
     2. Auth Helpers 経由で `auth.uid()` が意図通り `user_id` と一致するか確認。
     3. 問題なければ本番プロジェクトでも `alter table ... enable row level security;` を実行。

4. **dev / prod の挙動を環境変数で分岐**
   - 例として `DOCUFLOW_ENABLE_RLS=1` などのフラグを用意し、
     - dev: `DOCUFLOW_ENABLE_RLS=0`（RLS disabled 前提、既存のクッキー認証で動作）
     - prod: `DOCUFLOW_ENABLE_RLS=1`（Auth Helpers + RLS 前提）
   - このフラグを見て Supabase クライアントの生成方法を切り替えることで、  
     段階的に RLS を ON にしてもロールバックしやすい構成を目指す。

5. **service_role キーの扱いの明確化**
   - `lib/supabaseAdmin.ts` でのみ service_role キーを扱い、
     - アカウント削除やメンテナンス的な処理 **だけ** を担当させる。
   - 通常のユーザー操作（ドキュメント CRUD・コメント・共有など）は  
     すべて anon key + RLS で完結させる方針とし、誤用を防ぐ。

このように、「まずはクッキーベース認証 + RLS disabled で安定稼働 →  
Auth Helpers + RLS をステージングで検証 → フラグで切り替えながら本番適用」という  
2 段階・3 段階の移行プランを前提とした設計にしている。
