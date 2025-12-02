## DocuFlow トラブルシューティングガイド

本ドキュメントでは、DocuFlow の開発・デプロイ時に発生する可能性のある問題とその解決方法をまとめています。

---

## 1. ビルドエラー

### 1.1 TypeScript の型エラー

**エラーメッセージ例:**
```
Type error: Type 'typeof import(...)' does not satisfy the constraint 'RouteHandlerConfig<...>'
```

**原因**: Next.js 16 では、Route Handler の `params` が Promise になりました。

**解決方法**: Route Handler で `params` を使用する前に `await` を付けます。

```typescript
// ❌ 間違い
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
}

// ✅ 正しい
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### 1.2 モジュール解決エラー

**エラーメッセージ例:**
```
Module not found: Can't resolve '@/lib/...'
```

**原因**: TypeScript のパスエイリアス（`@/`）が正しく設定されていない。

**解決方法**: `tsconfig.json` を確認し、以下の設定があることを確認してください。

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

その後、開発サーバーを再起動してください。

---

## 2. Supabase 接続エラー

### 2.1 環境変数が設定されていない

**エラーメッセージ例:**
```
Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL
```

**原因**: `.env.local` に環境変数が設定されていない、または Vercel の環境変数が設定されていない。

**解決方法**:

1. **ローカル開発環境**:
   - プロジェクト直下に `.env.local` を作成
   - 以下の環境変数を設定:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     OPENAI_API_KEY=your_openai_key
     ```
   - 開発サーバーを再起動

2. **本番環境（Vercel）**:
   - Vercel Dashboard の「Settings」→「Environment Variables」で環境変数を設定
   - デプロイを再実行

### 2.2 RLS ポリシーエラー

**エラーメッセージ例:**
```
ERROR: new row violates row-level security policy
```

**原因**: RLS が有効になっているが、適切なポリシーが設定されていない。

**解決方法**:

1. **開発環境**: RLS を無効化する（推奨）
   ```sql
   alter table public.documents disable row level security;
   ```

2. **本番環境**: 適切な RLS ポリシーを設定する（`README.md` の「RLS / マルチテナント設計」セクションを参照）

### 2.3 テーブルが存在しない

**エラーメッセージ例:**
```
ERROR: relation "public.user_settings" does not exist
```

**原因**: 必要なテーブルが作成されていない。

**解決方法**: Supabase の SQL Editor で、`docs/db-schema.md` または `docs/deployment.md` に記載されている SQL を実行してください。

---

## 3. OpenAI API エラー

### 3.1 API キーが無効

**エラーメッセージ例:**
```
401 Unauthorized
```

**原因**: OpenAI API キーが正しく設定されていない、または無効になっている。

**解決方法**:

1. [OpenAI Platform](https://platform.openai.com/api-keys) で API キーを確認
2. `.env.local` または Vercel の環境変数に正しいキーを設定
3. API キーに十分なクレジットがあることを確認

### 3.2 レート制限エラー

**エラーメッセージ例:**
```
429 Too Many Requests
```

**原因**: OpenAI API のレート制限に達した。

**解決方法**:

1. しばらく待ってから再試行
2. OpenAI Dashboard で使用量を確認
3. 必要に応じて、API キーのプランをアップグレード

### 3.3 タイムアウトエラー

**エラーメッセージ例:**
```
Request timeout
```

**原因**: OpenAI API の応答が遅い、または Vercel の関数タイムアウトに達した。

**解決方法**:

1. Vercel の関数タイムアウトを延長（Pro プランが必要な場合があります）
2. AI 生成を非同期処理に変更（バックグラウンドジョブの実装を検討）

---

## 4. ファイルアップロードエラー

### 4.1 ファイルサイズ制限エラー

**エラーメッセージ例:**
```
アップロードされたファイルが大きすぎます（最大 10MB まで）
```

**原因**: アップロードされたファイルが 10MB を超えている。

**解決方法**: ファイルサイズを 10MB 以下に圧縮するか、コード内の `MAX_FILE_SIZE_BYTES` を変更してください（ただし、Vercel の関数ペイロードサイズ制限にも注意が必要です）。

### 4.2 ファイル形式エラー

**エラーメッセージ例:**
```
サポートされていないファイル形式です。PDF / DOC / DOCX のみ対応しています。
```

**原因**: サポートされていないファイル形式をアップロードしようとした。

**解決方法**: PDF、DOC、DOCX 形式のファイルのみアップロード可能です。他の形式の場合は、事前に変換してください。

### 4.3 テキスト抽出エラー

**エラーメッセージ例:**
```
ファイルからテキストを抽出できませんでした
```

**原因**: スキャンされた PDF（画像のみ）や、破損したファイルをアップロードした。

**解決方法**: テキストが埋め込まれた PDF または Word ファイルを使用してください。スキャンされた PDF の場合は、OCR ツールでテキスト化してからアップロードしてください。

---

## 5. 認証エラー

### 5.1 ログインできない

**症状**: ログインフォームを送信しても、エラーメッセージが表示される。

**原因**: 
- Supabase の認証設定が正しくない
- 環境変数が設定されていない
- クッキーが正しく設定されていない

**解決方法**:

1. Supabase Dashboard の「Authentication」→「Settings」で、メール認証が有効になっていることを確認
2. `.env.local` または Vercel の環境変数に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しく設定されていることを確認
3. ブラウザの開発者ツールで、クッキー `docuhub_ai_auth` と `docuhub_ai_user_id` が設定されていることを確認

### 5.2 ログアウトできない

**症状**: ログアウトボタンを押しても、ログイン状態が維持される。

**原因**: クッキーの削除が正しく実行されていない。

**解決方法**: `/auth/logout` ページが正しく動作していることを確認し、ブラウザの開発者ツールでクッキーが削除されていることを確認してください。

---

## 6. パフォーマンス問題

### 6.1 ページの読み込みが遅い

**原因**: 
- 大量のドキュメントを一度に取得している
- AI 生成が同期的に実行されている

**解決方法**:

1. ページネーションを実装する
2. AI 生成を非同期処理に変更する
3. Supabase のクエリに `limit()` を追加する

### 6.2 Vercel の関数タイムアウト

**エラーメッセージ例:**
```
Function execution exceeded timeout
```

**原因**: Server Action の実行時間が Vercel の制限（無料プランは 10 秒）を超えた。

**解決方法**:

1. 処理を最適化する（並列処理の削減、不要な処理の削除）
2. Vercel Pro プランにアップグレード（タイムアウトを 60 秒に延長可能）
3. 長時間かかる処理（AI 生成など）をバックグラウンドジョブに変更

---

## 7. その他の問題

### 7.1 開発サーバーが起動しない

**エラーメッセージ例:**
```
Port 3000 is already in use
```

**解決方法**: 別のポートで起動するか、既存のプロセスを終了してください。

```bash
# 別のポートで起動
npm run dev -- -p 3001

# または、既存のプロセスを終了
lsof -ti:3000 | xargs kill -9
```

### 7.2 依存関係のインストールエラー

**エラーメッセージ例:**
```
npm ERR! code ERESOLVE
```

**解決方法**: `package-lock.json` を削除して再インストールしてください。

```bash
rm -rf node_modules package-lock.json
npm install
```

### 7.3 キャッシュの問題

**症状**: コードを変更しても、変更が反映されない。

**解決方法**: Next.js のキャッシュをクリアしてください。

```bash
rm -rf .next
npm run dev
```

---

## 8. ログの確認方法

### 8.1 ローカル開発環境

- **ブラウザのコンソール**: クライアント側のエラーを確認
- **ターミナル**: サーバー側のエラーとログを確認

### 8.2 本番環境（Vercel）

- **Vercel Dashboard**: 「Deployments」→ 各デプロイメントの「Logs」タブで確認
- **Supabase Dashboard**: 「Logs」→「API Logs」でデータベースのクエリログを確認
- **OpenAI Dashboard**: API の使用量とエラーログを確認

---

## 9. サポート

問題が解決しない場合は、以下を確認してください:

1. `README.md` のセットアップ手順を再確認
2. `docs/architecture.md` でアーキテクチャを確認
3. GitHub Issues で既存の issue を検索
4. 新しい issue を作成する際は、エラーメッセージ、環境情報、再現手順を記載してください

