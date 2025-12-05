-- ============================================================================
-- Stripe 連携用のカラムを organizations に追加
-- ============================================================================

alter table public.organizations
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists billing_email text;

comment on column public.organizations.stripe_customer_id is 'Stripe 上の customer ID';
comment on column public.organizations.stripe_subscription_id is 'Stripe 上の subscription ID';
comment on column public.organizations.billing_email is '請求先メールアドレス（Stripe Checkout で入力されたもの）';


