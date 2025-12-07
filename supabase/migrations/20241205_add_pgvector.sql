-- pgvector 拡張機能を有効化
-- Supabase ダッシュボードの SQL Editor で実行してください

-- 1. pgvector 拡張を有効化
create extension if not exists vector with schema public;

-- 2. documents テーブルに embedding カラムを追加
-- OpenAI text-embedding-3-small モデルは 1536 次元
alter table public.documents
add column if not exists embedding vector(1536);

-- 3. 類似検索用のインデックスを作成（IVFFlat）
-- 小〜中規模データに適したインデックス
create index if not exists documents_embedding_idx
on public.documents
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- 4. 類似検索用の関数を作成
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

-- 5. RPC 関数に実行権限を付与
grant execute on function match_documents to anon, authenticated;

-- 使用例:
-- select * from match_documents(
--   '[0.1, 0.2, ...]'::vector,  -- クエリの埋め込みベクトル
--   0.7,                         -- 類似度の閾値
--   5,                           -- 返す件数
--   'user-uuid-here'             -- ユーザーID（オプション）
-- );






