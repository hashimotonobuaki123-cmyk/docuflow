-- ============================================================================
-- Share access audit logs (server-side, privacy-preserving)
-- ============================================================================
-- Goal:
-- - Public share page views should be auditable without storing raw IP/user-agent.
-- - App inserts logs using service_role (supabaseAdmin). RLS is enabled with no policies.
-- ============================================================================

create table if not exists public.share_access_logs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  accessed_at timestamptz not null default now(),
  locale text null,
  token_prefix text null,
  ip_hash text null,
  user_agent_hash text null,
  referer text null
);

create index if not exists share_access_logs_document_id_idx
  on public.share_access_logs (document_id, accessed_at desc);

alter table public.share_access_logs enable row level security;


