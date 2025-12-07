-- ============================================================================
-- Billing / Plan 用のカラムを organizations に追加
-- ============================================================================
-- 実行方法: Supabase Dashboard > SQL Editor または CI の自動マイグレーション
-- ============================================================================

alter table public.organizations
  add column if not exists plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  add column if not exists seat_limit integer,
  add column if not exists document_limit integer;

comment on column public.organizations.plan is '組織プラン: free / pro / team';
comment on column public.organizations.seat_limit is '組織内の最大メンバー数（null の場合は無制限）';
comment on column public.organizations.document_limit is '組織内で作成可能なドキュメント数の上限（null の場合は無制限）';






