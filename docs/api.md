## 🌐 DocuFlow API - 外部連携用ドキュメント

DocuFlow のドキュメントを外部サービスから操作するための **簡易 REST API** 仕様です。

---

## 1. 認証方式

- ヘッダーに **API Key** を付与します。

```http
GET /api/documents HTTP/1.1
Host: docuflow-azure.vercel.app
X-API-Key: YOUR_API_KEY_HERE
```

または:

```http
Authorization: Bearer YOUR_API_KEY_HERE
```

API キーはユーザー / 組織に紐づき、**そのスコープ内のドキュメントのみ** 取得できます。

> NOTE: 現在は **読み取り専用 API**（GET のみ）を提供しています。

---

## 2. エンドポイント一覧

### 2.1 GET `/api/documents`

認証ユーザー（API キー）がアクセス可能なドキュメント一覧を返します。

#### Request

```bash
curl -X GET "https://docuflow-azure.vercel.app/api/documents" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

#### Response

```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "API設計仕様書 - ユーザー認証エンドポイント",
      "category": "仕様書",
      "summary": "ユーザー認証 API のエンドポイント仕様の概要...",
      "tags": ["認証", "API", "設計"],
      "created_at": "2024-12-05T10:00:00.000Z"
    }
  ]
}
```

### 2.2 GET `/api/documents/[id]`

指定したドキュメントの詳細を返します。

#### Request

```bash
curl -X GET "https://docuflow-azure.vercel.app/api/documents/your-document-id" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

#### Response

```json
{
  "document": {
    "id": "uuid",
    "title": "API設計仕様書 - ユーザー認証エンドポイント",
    "category": "仕様書",
    "summary": "ユーザー認証 API のエンドポイント仕様の概要...",
    "tags": ["認証", "API", "設計"],
    "raw_content": "# API設計 ...",
    "created_at": "2024-12-05T10:00:00.000Z"
  }
}
```

---

## 3. エラーレスポンス

### 3.1 認証エラー

```json
{
  "error": "Unauthorized: invalid API key"
}
```

HTTP ステータス: `401 Unauthorized`

### 3.2 権限エラー / 存在しないリソース

```json
{
  "error": "Not found"
}
```

HTTP ステータス: `404 Not Found`

### 3.3 サーバーエラー

```json
{
  "error": "Failed to fetch documents"
}
```

HTTP ステータス: `500 Internal Server Error`

---

## 4. OpenAPI / SDK / Playground

### 4.1 OpenAPI 定義

- `docs/openapi.yaml` に `/api/documents` 系エンドポイントの OpenAPI 3.1 定義を用意しています。
- Swagger UI や Stoplight などで読み込めば、そのままインタラクティブドキュメントとして利用可能です。

### 4.2 TypeScript SDK（雛形）

- `sdk/docuflow.ts` に、TypeScript 向けの軽量クライアントを用意しています。

```ts
import { DocuFlowClient } from "./sdk/docuflow";

const client = new DocuFlowClient({
  apiKey: process.env.DOCUFLOW_API_KEY!,
});

const docs = await client.listDocuments();
```

### 4.3 API Playground

- Next.js アプリ内に `/dev/api-console` を用意し、ブラウザから直接 API を試せます。
- Base URL と `X-API-Key` を入力し、`GET /api/documents` / `GET /api/documents/:id` をその場で叩けます。

---

## 5. 今後の拡張予定

- `POST /api/documents` : 外部サービスからのドキュメント作成
- `PATCH /api/documents/[id]` : タイトル・カテゴリ・タグの更新
- `POST /api/documents/[id]/summarize` : AI 要約の再生成 API
- API Key 発行 / ローテーション画面 (`/settings/api-keys`) の UI 実装

これらを実装することで、Zapier / n8n / GitHub Actions などから  
DocuFlow を **チームのナレッジハブとして自動連携** することを想定しています。



