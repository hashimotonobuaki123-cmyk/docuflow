-- ============================================================================
-- organizations: enterprise 対応 & サブスクリプション状態を保持
-- ============================================================================
-- 目的:
--  - 世界販売（複数プラン）に合わせて organizations.plan の制約を拡張
--  - Stripe の subscription_status / current_period_end を organizations 側でも保持し、
--    課金画面や制限判定で一貫して参照できるようにする
-- ============================================================================

-- plan の CHECK 制約を拡張（既存の自動命名 organizations_plan_check を想定）
alter table public.organizations
  drop constraint if exists organizations_plan_check;

alter table public.organizations
  add constraint organizations_plan_check
  check (plan in ('free', 'pro', 'team', 'enterprise'));

comment on column public.organizations.plan is '組織プラン: free / pro / team / enterprise';

-- Stripe の状態保持
alter table public.organizations
  add column if not exists subscription_status text
    check (subscription_status in ('active', 'canceled', 'past_due', 'trialing') or subscription_status is null),
  add column if not exists current_period_end timestamptz;

comment on column public.organizations.subscription_status is 'サブスクリプション状態: active / canceled / past_due / trialing';
comment on column public.organizations.current_period_end is '現在の請求期間の終了日時';

create index if not exists organizations_stripe_customer_id_idx
  on public.organizations (stripe_customer_id)
  where stripe_customer_id is not null;


