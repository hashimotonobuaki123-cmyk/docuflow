-- ============================================================================
-- AI usage: 月次のAI呼び出し回数をスコープ単位（個人/組織）で追跡する
-- ============================================================================
-- 目的:
--  - 月間AI呼び出し回数上限を「確実に」強制する（商用SaaS要件）
--  - race condition に強い原子的な消費（consume）を DB 関数で提供する
-- ============================================================================

-- NOTE:
-- Postgres の primary key は対象カラムに NOT NULL を強制するため、
-- (user_id, organization_id) のどちらかを NULL にするスコープ設計とは相性が悪い。
-- そのため scope_type/scope_id に正規化して複合PKを張る。
create table if not exists public.ai_usage_monthly (
  month_start date not null,
  scope_type text not null check (scope_type in ('personal', 'organization')),
  scope_id uuid not null,
  calls integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint ai_usage_monthly_calls_check check (calls >= 0),
  primary key (month_start, scope_type, scope_id)
);

comment on table public.ai_usage_monthly is '月次AI呼び出し回数（個人: user_id, 組織: organization_id）';
comment on column public.ai_usage_monthly.month_start is '月初日（YYYY-MM-01）';
comment on column public.ai_usage_monthly.calls is '当月のAI呼び出し回数';

create index if not exists ai_usage_monthly_scope_idx
  on public.ai_usage_monthly (scope_type, scope_id, month_start desc);

alter table public.ai_usage_monthly enable row level security;

-- ---------------------------------------------------------------------------
-- 原子的な消費: limit を渡して増分できるか判定し、成功時のみカウントを増やす
-- ---------------------------------------------------------------------------
create or replace function public.consume_ai_usage(
  p_user_id uuid,
  p_organization_id uuid,
  p_limit integer,
  p_count integer
)
returns table (
  allowed boolean,
  calls integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month_start date := date_trunc('month', now())::date;
  v_current integer := 0;
  v_scope_type text;
  v_scope_id uuid;
begin
  if p_count is null or p_count <= 0 then
    -- no-op
    return query select true, 0;
    return;
  end if;

  -- ensure exactly one scope key is present
  if (p_user_id is null and p_organization_id is null) or (p_user_id is not null and p_organization_id is not null) then
    raise exception 'invalid ai usage scope';
  end if;

  if p_organization_id is not null then
    v_scope_type := 'organization';
    v_scope_id := p_organization_id;
  else
    v_scope_type := 'personal';
    v_scope_id := p_user_id;
  end if;

  if p_limit is null or p_limit < 0 then
    -- unlimited
    insert into public.ai_usage_monthly (month_start, scope_type, scope_id, calls)
    values (v_month_start, v_scope_type, v_scope_id, p_count)
    on conflict (month_start, scope_type, scope_id)
    do update set calls = public.ai_usage_monthly.calls + excluded.calls,
                  updated_at = now();

    select calls into v_current
      from public.ai_usage_monthly
      where month_start = v_month_start
        and scope_type = v_scope_type
        and scope_id = v_scope_id;

    return query select true, v_current;
    return;
  end if;

  -- upsert base row (so FOR UPDATE works)
  insert into public.ai_usage_monthly (month_start, scope_type, scope_id, calls)
  values (v_month_start, v_scope_type, v_scope_id, 0)
  on conflict (month_start, scope_type, scope_id) do nothing;

  select calls into v_current
    from public.ai_usage_monthly
    where month_start = v_month_start
      and scope_type = v_scope_type
      and scope_id = v_scope_id
    for update;

  if v_current + p_count > p_limit then
    return query select false, v_current;
    return;
  end if;

  update public.ai_usage_monthly
    set calls = calls + p_count,
        updated_at = now()
    where month_start = v_month_start
      and scope_type = v_scope_type
      and scope_id = v_scope_id;

  select calls into v_current
    from public.ai_usage_monthly
    where month_start = v_month_start
      and scope_type = v_scope_type
      and scope_id = v_scope_id;

  return query select true, v_current;
end;
$$;


