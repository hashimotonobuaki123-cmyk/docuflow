-- ============================================================================
-- AI usage: 月次のAI呼び出し回数をスコープ単位（個人/組織）で追跡する
-- ============================================================================
-- 目的:
--  - 月間AI呼び出し回数上限を「確実に」強制する（商用SaaS要件）
--  - race condition に強い原子的な消費（consume）を DB 関数で提供する
-- ============================================================================

create table if not exists public.ai_usage_monthly (
  month_start date not null,
  user_id uuid,
  organization_id uuid,
  calls integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint ai_usage_monthly_scope_check check (
    (user_id is null) <> (organization_id is null)
  ),
  constraint ai_usage_monthly_calls_check check (calls >= 0),
  primary key (month_start, user_id, organization_id)
);

comment on table public.ai_usage_monthly is '月次AI呼び出し回数（個人: user_id, 組織: organization_id）';
comment on column public.ai_usage_monthly.month_start is '月初日（YYYY-MM-01）';
comment on column public.ai_usage_monthly.calls is '当月のAI呼び出し回数';

create index if not exists ai_usage_monthly_user_idx
  on public.ai_usage_monthly (user_id, month_start desc)
  where user_id is not null;

create index if not exists ai_usage_monthly_org_idx
  on public.ai_usage_monthly (organization_id, month_start desc)
  where organization_id is not null;

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
begin
  if p_count is null or p_count <= 0 then
    -- no-op
    return query select true, 0;
    return;
  end if;

  if p_limit is null or p_limit < 0 then
    -- unlimited
    insert into public.ai_usage_monthly (month_start, user_id, organization_id, calls)
    values (v_month_start, p_user_id, p_organization_id, p_count)
    on conflict (month_start, user_id, organization_id)
    do update set calls = public.ai_usage_monthly.calls + excluded.calls,
                  updated_at = now();

    select calls into v_current
      from public.ai_usage_monthly
      where month_start = v_month_start
        and (user_id is not distinct from p_user_id)
        and (organization_id is not distinct from p_organization_id);

    return query select true, v_current;
    return;
  end if;

  -- ensure exactly one scope key is present
  if (p_user_id is null and p_organization_id is null) or (p_user_id is not null and p_organization_id is not null) then
    raise exception 'invalid ai usage scope';
  end if;

  -- upsert base row (so FOR UPDATE works)
  insert into public.ai_usage_monthly (month_start, user_id, organization_id, calls)
  values (v_month_start, p_user_id, p_organization_id, 0)
  on conflict (month_start, user_id, organization_id) do nothing;

  select calls into v_current
    from public.ai_usage_monthly
    where month_start = v_month_start
      and (user_id is not distinct from p_user_id)
      and (organization_id is not distinct from p_organization_id)
    for update;

  if v_current + p_count > p_limit then
    return query select false, v_current;
    return;
  end if;

  update public.ai_usage_monthly
    set calls = calls + p_count,
        updated_at = now()
    where month_start = v_month_start
      and (user_id is not distinct from p_user_id)
      and (organization_id is not distinct from p_organization_id);

  select calls into v_current
    from public.ai_usage_monthly
    where month_start = v_month_start
      and (user_id is not distinct from p_user_id)
      and (organization_id is not distinct from p_organization_id);

  return query select true, v_current;
end;
$$;


