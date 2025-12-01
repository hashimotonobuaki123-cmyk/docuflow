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

4. **Infrastructure 層**
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

#### 4.3 共有リンク

1. `/documents/[id]` から「共有リンクを発行」を押す
2. Server Action `toggleShare` がランダム文字列で `share_token` を生成
3. `/share/[token]` にアクセスすると、`share_token` で `documents` 行を検索し、閲覧用ページを表示
4. 「共有を停止」で `share_token` を `null` に更新し、`activity_logs` に `disable_share` を残す

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
