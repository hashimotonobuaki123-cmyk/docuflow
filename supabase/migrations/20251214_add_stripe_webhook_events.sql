-- ============================================================================
-- Stripe Webhook 冪等性（重複イベント対策）用テーブル
-- ============================================================================
-- 目的:
--  - Stripe は同一イベントを複数回配送することがある（再試行/ネットワーク等）
--  - Webhook ハンドラは冪等である必要がある
--  - event.id を一意に保存し、二重処理を防ぐ
-- ============================================================================

create table if not exists public.stripe_webhook_events (
  id text primary key, -- Stripe Event ID (evt_...)
  type text not null,
  livemode boolean not null default false,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'processing' check (status in ('processing', 'processed', 'failed', 'ignored')),
  error_message text,
  payload jsonb
);

comment on table public.stripe_webhook_events is 'Stripe Webhook の冪等性（重複イベント対策）と観測のためのイベント保存';
comment on column public.stripe_webhook_events.id is 'Stripe Event ID (evt_...)';
comment on column public.stripe_webhook_events.status is 'processing / processed / failed / ignored';
comment on column public.stripe_webhook_events.payload is '必要最低限のイベントペイロード（デバッグ/監査用、サイズに注意）';

create index if not exists stripe_webhook_events_received_at_idx
  on public.stripe_webhook_events (received_at desc);

create index if not exists stripe_webhook_events_status_idx
  on public.stripe_webhook_events (status);

-- RLS: 通常ユーザーからは参照できない（service_role でのみ操作する想定）
alter table public.stripe_webhook_events enable row level security;


