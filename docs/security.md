## 🔒 Security Design - セキュリティ設計

DocuFlow のセキュリティ方針と実装の要点をまとめます。

---

## 1. セキュリティ方針

- **最小権限**: すべての操作は「必要な権限だけ」を前提に設計する。
- **行レベルの保護 (RLS)**: ビジネスロジックではなく **DB レイヤー** でデータアクセス制御を行う。
- **安全なデフォルト**: 共有や公開はデフォルト OFF。明示的な操作でのみ有効化。
- **観察可能性**: 主要な操作は `activity_logs` と Sentry でトレース可能にする。

---

## 2. 認証・認可モデル

### 2.1 認証 (Authentication)

- **プロバイダ**: Supabase Auth（メール & パスワード / Google OAuth）
- フロー（メール & パスワード）:
  1. `/auth/login` でメール & パスワードを送信
  2. Supabase Auth がトークンを発行
  3. クライアント側で `docuhub_ai_auth=1` / `docuhub_ai_user_id=<uuid>` を Cookie に保存
  4. `proxy.ts` で Cookie を参照し、保護ルートへのアクセスを制御（Next.js 16 以降）
- フロー（Google ログイン）:
  1. `/auth/login` の「Google でログイン」ボタンから `supabase.auth.signInWithOAuth('google')` を実行
  2. Supabase が Google OAuth で認証し、コールバックでトークンを発行
  3. メール & パスワードと同様に Cookie を設定し、`/app` へリダイレクト

### 2.2 認可 (Authorization)

- **アプリケーションレベル**
  - `proxy.ts` によるルート保護
  - `cookies()` で取得した `docuhub_ai_user_id` を使い、Server Action で対象行をフィルタ
- **DB レベル (RLS)**  
  `supabase/migrations/20241205_enable_rls.sql` / `20241206_add_organizations.sql` にてポリシー定義。

#### 主なテーブルと保護範囲

| テーブル | 認可条件 |
|:---------|:---------|
| `documents` | `user_id = auth.uid()` または `organization_id` に紐づくメンバー |
| `document_versions` | 作成ユーザー (`user_id = auth.uid()`) のみ |
| `activity_logs` | 自分の `user_id` のみ |
| `document_comments` | アクセス可能なドキュメントのコメントのみ |
| `organizations` | 自分がメンバーまたは owner の組織のみ |
| `organization_members` | 自分がメンバーの行のみ参照、owner が管理操作 |
| `organization_invitations` | 所属組織の owner/admin のみ管理可能 |
| `notifications` | `user_id = auth.uid()` の通知のみ参照・既読更新 |

---

## 3. 共有リンクと公開範囲

### 3.1 共有リンク (`/share/[token]`)

- `documents.share_token` が設定されている場合のみ共有可能。
- 閲覧は **認証不要** だが、編集・削除・コメントは常に認証済みユーザーのみ。
- `get_shared_document(p_share_token TEXT)` 関数で RLS をバイパスしつつ、閲覧専用の安全なビューを提供。

### 3.2 リスクと緩和策

- **リスク**: トークン URL が漏洩すると誰でも閲覧できる。
- **対策**:
  - トークンは UUID で十分長く推測困難。
  - 共有リンクはいつでも無効化可能（`share_token = null`）。
  - `share_expires_at` は DB 関数側で失効判定し、期限切れは取得できない。

---

## 4. Web アプリケーションレベルの対策

### 4.1 XSS 対策

- React による自動エスケープを前提とし、`dangerouslySetInnerHTML` は使用しない方針。
- ユーザー入力を画面に表示する箇所では、プレーンテキストとして扱う。

### 4.2 CSRF 対策

- 認証状態は Cookie (`docuhub_ai_auth`) だが、  
  Server Action / Supabase 操作は **常にユーザーIDの一致チェック** を行う。
- 将来的に `SameSite=Lax` / `Secure` を厳格化し、CSRF トークン導入も検討。

### 4.3 入力検証

- ファイルアップロード:
  - 対応拡張子: `.pdf`, `.doc`, `.docx`
  - サイズ: 最大 10MB (`MAX_FILE_SIZE_BYTES`)
  - サポート外形式やパース失敗時は安全にエラー扱い。
- フォーム入力:
  - 必須項目（タイトルなど）はサーバー側でも再検証。

---

## 5. インフラ・鍵管理

### 5.1 環境変数

- `.env.local` / Vercel 環境変数で管理し、Git にはコミットしない。
- 代表的な機密値:
  - `NEXT_PUBLIC_SUPABASE_URL`（公開だが変更不可）
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`（公開 anon key）
  - `SUPABASE_SERVICE_ROLE_KEY`（管理用・サーバーのみ）
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_SENTRY_DSN`

### 5.2 Service Role の取り扱い

- `supabaseAdmin` クライアントでのみ使用。
- 用途:
  - アカウント削除などの管理系処理。
- クライアントサイドには絶対に渡さない。

---

## 6. 簡易 Threat Model（脅威モデル）

### 6.1 想定する攻撃パターン

| ID | 脅威 | 内容 | 対策 |
|:--:|:-----|:-----|:-----|
| T1 | 不正アクセス | 他人のドキュメントを閲覧・編集 | RLS + `user_id` / `organization_id` チェック |
| T2 | 共有リンク漏洩 | URL が第三者に共有される | UUID トークン + いつでも無効化可能 |
| T3 | OpenAI API の不正利用 | API キー流出・濫用 | サーバーサイドのみ保持・レート制限 |
| T4 | 権限昇格 | member が owner 操作を行う | RLS + ロールチェック（owner/admin/member） |
| T5 | 認証情報の盗難 | Cookie の奪取 | Secure / HttpOnly / SameSite 設定の強化（今後） |
| T6 | 組織外からの不正ログイン | パスワードリスト攻撃 / なりすまし | 2FA / SSO / IP 制限の導入（設計済み） |

---

## 7. SSO / 2FA 設計（将来導入）

### 7.1 2段階認証 (2FA)

- 手段: TOTP アプリ（Google Authenticator / 1Password など）
- 想定フロー:
  1. `/settings/security` から 2FA を有効化
  2. QR コード（`otpauth://` URI）をスキャン
  3. 初回ワンタイムコードで検証
  4. 以降はログイン時にパスワード + TOTP を要求

バックエンドでは、ユーザーごとに `two_factor_secret` / `two_factor_enabled` を保持する構成を想定。

### 7.2 SSO (Single Sign-On)

- IdP 候補: Google Workspace, Microsoft Entra ID
- 想定フロー:
  1. 組織 owner が `/settings/security` で SSO 設定を開始
  2. IdP 側で OAuth / OIDC クライアントを作成し、クライアントID / シークレットを登録
  3. ログイン画面で「Google Workspace でログイン」ボタンを表示
  4. コールバック時にメールドメインや group claim を元に `organization_members` と紐付け

### 7.3 設計レベルでの位置づけ

- 現時点ではポートフォリオ用途のため、SSO / 2FA は **UI と設計まで** を実装範囲とする。
- 詳細な方針は `docs/adr/0004-auth-hardening-and-sso-2fa.md` に記録。

---

## 8. 今後の発展

- Supabase Realtime + 監査ログテーブルで**変更履歴の完全追跡**（誰が・いつ・何を変更したか）。
- 組織ごとの **IP allow list** / SSO（Google Workspace など）統合。
- セキュリティテスト（OWASP ASVS をベースにしたセルフチェックリスト）の導入。

