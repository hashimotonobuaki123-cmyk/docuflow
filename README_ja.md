<div align="center">

<br />

# 📄 DocuFlow（日本語）

### AI 要約 × 全文検索で「資料が見つかる」ドキュメントワークスペース

**PDF / Word をアップロード → AI 要約・タグ付け → 検索・共有までを最短で。**

<br />

🔗 **Live**

- アプリ（日本語）: `https://docuflow-azure.vercel.app/app?lang=ja`
- アプリ（英語）: `https://docuflow-azure.vercel.app/app?lang=en`
- LP（英語）: `https://docuflow-azure.vercel.app/en`
- デモ（英語 / ログイン不要）: `https://docuflow-azure.vercel.app/demo/en`

<br />

</div>

---

## 🎯 3分でわかる（何ができる？）

- **アップロード**: PDF / Word を投入すると、本文を抽出して保存
- **AI**: 要約・タグ・（必要に応じて）埋め込みを生成し、検索性を上げる
- **検索**: キーワード検索 + 類似検索で「見つかる」導線に寄せる
- **共有**: 期限付きの閲覧専用リンクを発行（匿名列挙を防ぐ設計）
- **組織**: RBAC（owner/admin/member）とRLSでマルチテナントを堅く運用

---

## 🖼️ スクリーンショット（主要導線）

<div align="center">

### Dashboard
<img src="docs/screenshots/dashboard-main.png" alt="Dashboard" width="100%" />

<table>
  <tr>
    <td width="50%">
      <p><strong>新規作成（AI処理）</strong></p>
      <img src="docs/screenshots/new-document-page.png" alt="New document" width="100%" />
    </td>
    <td width="50%">
      <p><strong>詳細（要約・タグ・共有）</strong></p>
      <img src="docs/screenshots/document-detail-view.png" alt="Document detail" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <p><strong>共有ページ（閲覧専用）</strong></p>
      <img src="docs/screenshots/share-view.png" alt="Share view" width="100%" />
    </td>
    <td width="50%">
      <p><strong>設定 / 組織</strong></p>
      <img src="docs/screenshots/settings-page.png" alt="Settings" width="100%" />
    </td>
  </tr>
</table>

</div>

---

## 🔐 セキュリティ / 共有リンクの考え方（要点）

- **共有は閲覧専用**（編集/削除/コメントは常に認証必須）
- **匿名列挙の防止**:
  - 共有ページは `documents` を直接SELECTしない
  - RPC `get_shared_document(token)` 経由のみで取得（tokenを知らないと取れない）
- **期限**: `share_expires_at` は DB 関数側で失効判定し、期限切れは取得不可
- **監査ログ**:
  - `share_access_logs` に閲覧を best-effort で保存
  - **IP / User-Agent は SHA-256 でハッシュ化**（生データは保存しない）
  - **保持は90日**（best-effortで自動削除）

関連ドキュメント: [`docs/security.md`](docs/security.md)

---

## 🌍 言語（EN/JA）挙動

- **優先順位**: `docuflow_lang` Cookie → `Accept-Language`（`ja`なら日本語、それ以外は英語）
- **URLで明示**: `?lang=en` / `?lang=ja`
- **共有ページ**: `?lang` が無い場合は推論で自動判定。右上の **EN/日本語トグル**で切替可能。

---

## 🧑‍💻 ローカルで動かす（最短）

### 1) 依存をインストール

```bash
npm ci
```

### 2) `.env.local` を作成（最低限）

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

任意（管理系機能まで動かす / 監査ログの書き込みなど）:
- `SUPABASE_SERVICE_ROLE_KEY`

### 3) SupabaseのSQLを適用

- `supabase/migrations/` を Supabase Dashboard の **SQL Editor** で適用
- 共有/監査ログ関連の追加分:
  - `20251217_harden_shared_access.sql`
  - `20251218_fix_get_shared_document_tags.sql`
  - `20251218_add_share_access_logs.sql`

### 4) 起動

```bash
npm run dev
```

---

## 🧰 CI / 運用メモ

- `.github/workflows/supabase-migrations.yml` は **`SUPABASE_DB_URL` Secret が無い場合はスキップ**（CIが赤くならない）
- 自動適用したい場合は GitHub Secrets に `SUPABASE_DB_URL` を設定

---

## 📚 さらに読む

- **アーキテクチャ**: [`docs/architecture.md`](docs/architecture.md)
- **DB/RLS**: [`docs/db-schema.md`](docs/db-schema.md)
- **運用**: [`docs/operations.md`](docs/operations.md)
- **API**: [`docs/api.md`](docs/api.md)


