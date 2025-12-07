# ADR 0002: pgvector によるベクトル検索を採用する

## Status

Accepted

## Context

- DocuFlow の価値は「過去ドキュメントの再利用」にあり、**キーワード一致だけでは似た資料を拾いきれない**。
- OpenAI の埋め込みモデル `text-embedding-3-small` を利用することで、意味ベースの類似検索が可能になる。
- 既に Supabase（PostgreSQL）を利用しており、DB 内で完結する検索を実現したい。

## Decision

- Supabase 拡張 **pgvector** を有効化し、`documents.embedding` にベクトルを保存する。
- RPC 関数 `match_documents` を定義し、以下を実装:
  - クエリベクトルとのコサイン類似度計算
  - 類似度閾値 / 最大件数 / user_id フィルタ引数
- Next.js 側では `lib/similarSearch.ts` から Supabase RPC を呼び出し、  
  `/app` の「AI類似検索結果」セクションとして表示する。

## Consequences

### Pros

- タイトルや本文にキーワードが含まれていなくても、**意味的に近いドキュメント**を提案できる。
- すべて DB 内で完結するため、外部のベクトルDB を増やさずに運用できる。
- 将来的にスコア分布や利用傾向を SQL で分析しやすい。

### Cons

- pgvector 拡張に依存するため、DB 移行時の制約が増える。
- 埋め込み生成コスト（OpenAI API 呼び出し）が増えるため、レートリミットと課金管理が必要。
- インデックス（IVFFlat）のチューニングが必要な場合がある。







