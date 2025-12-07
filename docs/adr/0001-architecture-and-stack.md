# ADR 0001: Next.js + Supabase + OpenAI による構成を採用する

## Status

Accepted

## Context

- 小〜中規模のチーム向けドキュメント SaaS を、**個人開発で短期間に構築**したい。
- 認証・DB・ストレージ・RLS などを **自前で全部作るのはコストが高い**。
- 既に Next.js / TypeScript に慣れており、Vercel と相性が良いスタックを優先したい。

## Decision

- **Next.js 16 (App Router)** をフロントエンド兼 BFF として採用
  - Server Components / Server Actions により、API レイヤーを薄くできる。
- **Supabase (PostgreSQL + Auth)** をバックエンドとして採用
  - 認証・Row Level Security・ストレージ・SQL ベースの拡張性。
- **OpenAI API** を AI 要約・タグ・タイトル・ベクトル埋め込み生成に利用
  - モデル選定: `gpt-4.1-mini` + `text-embedding-3-small`

## Consequences

### Pros

- 認証・DB・AI を含む **フルスタック SaaS** を短期間で構築できる。
- Supabase の RLS により、マルチテナント / 組織機能への拡張が容易。
- Vercel + Next.js によるデプロイ・プレビューがシンプル。

### Cons

- ベンダーロックイン（Supabase / OpenAI / Vercel）。
- サーバーサイドでの OpenAI 呼び出しが増えるため、レイテンシに注意が必要。







