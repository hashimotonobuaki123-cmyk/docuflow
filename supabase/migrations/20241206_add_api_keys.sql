-- ============================================================================
-- API Keys テーブルの追加（外部連携用）
-- ============================================================================
-- 実行方法: Supabase Dashboard > SQL Editor または GitHub Actions 経由で実行
-- ============================================================================

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,                          -- 用途を示すラベル（例: "Zapier Integration"）
  key text not null,                           -- 実際の API キー（十分ランダムな文字列）
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

comment on table public.api_keys is '外部連携向け API キー。ユーザーまたは組織に紐づく。';

create index if not exists api_keys_user_id_idx
  on public.api_keys (user_id, created_at desc);

create index if not exists api_keys_key_idx
  on public.api_keys (key);

alter table public.api_keys enable row level security;

drop policy if exists "Users can manage own api keys" on public.api_keys;

create policy "Users can manage own api keys"
on public.api_keys
for all
using (
  auth.uid() is not null
  and user_id = auth.uid()
)
with check (
  auth.uid() is not null
  and user_id = auth.uid()
);







