## DocuFlow アーキテクチャ設計

### 1. 全体構成

- **フロントエンド / BFF**
  - Next.js 16 (App Router)
  - Server Components + Server Actions を中心とした実装
  - 認証情報はクッキーベースで扱い、`proxy.ts` で保護ルートを制御（Next.js 16 以降）

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

4. **Infrastructure 層**
   - `lib/supabaseClient.ts`: anon key での Supabase クライアント
   - `lib/supabaseAdmin.ts`: service_role キーでの管理クライアント（任意）

### 3. 認証・認可フロー

- ログイン成功時、クライアント側で以下のクッキーを設定:
  - `docuhub_ai_auth=1`
  - `docuhub_ai_user_id=<supabase user id>`
- `proxy.ts` が `docuhub_ai_auth` を参照し、以下を制御:
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

#### 4.3 共有リンク

1. `/documents/[id]` から「共有リンクを発行」を押す
2. Server Action `toggleShare` がランダム文字列で `share_token` を生成
3. `/share/[token]` にアクセスすると、RPC `get_shared_document(token)` 経由で閲覧用データを取得（匿名の直接SELECTを禁止）
4. 「共有を停止」で `share_token` を `null` に更新し、`activity_logs` に `disable_share` を残す

#### 4.4 ベクトル検索（pgvector）

1. ドキュメント作成・更新時に OpenAI `text-embedding-3-small` で埋め込みベクトルを生成
2. `documents.embedding` カラムに保存（`vector(1536)` 型）
3. 検索クエリ入力時にクエリも埋め込み化し、Supabase の RPC 関数 `match_documents` を呼び出し
4. pgvector がコサイン類似度 (`<=>`) で類似度スコアを計算し、上位 N 件を返す
5. `/app` の「AI類似検索結果」セクションとして UI に表示

#### 4.5 組織・RBAC

1. ユーザーは `/settings/organizations` で組織を作成（自動的に `owner` ロール）
2. `organization_members` にメンバーが `owner` / `admin` / `member` として追加される
3. `documents.organization_id` により、ドキュメントが「個人」か「組織」かを判別
4. ダッシュボードのヘッダーにある Organization スイッチャーでアクティブ組織を切り替え
5. RLS が `organization_id` とロールに基づいてアクセス可能範囲を制御

#### 4.6 通知・メンション

1. ドキュメントにコメントが追加されると `document_comments` に行を挿入
2. コメント本文から `@メール` / `@名前` をパースし、該当ユーザーIDを `mentioned_user_ids` に保存
3. `notifications` テーブルに `comment_added` / `comment_mention` 通知を作成
4. ヘッダーの 🔔 (`NotificationBell`) が未読数を表示し、ドロップダウンで最近の通知を一覧表示
5. 「すべて既読にする」操作で `read_at` がまとめて更新される

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
- 通知を WebSocket / Supabase Realtime でリアルタイムに配信し、ポーリングを削減する。
- 組織ごとのリソース制限（AI 呼び出し回数 / ストレージ容量）を導入し、マルチテナント運用に備える。

