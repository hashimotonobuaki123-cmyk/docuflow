-- ============================================================================
-- 週次ドキュメント作成数（直近8週間）を返す関数
-- ============================================================================

create or replace function public.get_weekly_document_counts_last_8_weeks(p_user_id uuid)
returns table (
  week_start text,
  count integer
)
language sql
as $$
  select
    to_char(date_trunc('week', created_at)::date, 'YYYY-MM-DD') as week_start,
    count(*)::integer as count
  from public.documents
  where user_id = p_user_id
    and created_at >= (now() - interval '8 weeks')
  group by date_trunc('week', created_at)
  order by date_trunc('week', created_at) asc;
$$;

grant execute on function public.get_weekly_document_counts_last_8_weeks(uuid)
  to authenticated;


