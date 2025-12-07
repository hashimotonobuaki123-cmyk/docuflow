-- ============================================================================
-- Analytics 用の簡易 RPC 関数
-- ============================================================================

-- 直近30日の、日別ドキュメント作成数を返す
create or replace function public.get_daily_document_counts_last_30_days(p_user_id uuid)
returns table (
  date text,
  count integer
)
language sql
as $$
  select
    to_char(created_at::date, 'YYYY-MM-DD') as date,
    count(*)::integer as count
  from public.documents
  where user_id = p_user_id
    and created_at >= (now() - interval '30 days')
  group by created_at::date
  order by created_at::date asc;
$$;

grant execute on function public.get_daily_document_counts_last_30_days(uuid)
  to authenticated;

-- 直近30日のユーザー別アクティビティ数を返す
create or replace function public.get_user_activity_counts_last_30_days(p_user_id uuid)
returns table (
  user_id uuid,
  count integer
)
language sql
as $$
  select
    user_id,
    count(*)::integer as count
  from public.activity_logs
  where created_at >= (now() - interval '30 days')
    and user_id = p_user_id
  group by user_id;
$$;

grant execute on function public.get_user_activity_counts_last_30_days(uuid)
  to authenticated;







