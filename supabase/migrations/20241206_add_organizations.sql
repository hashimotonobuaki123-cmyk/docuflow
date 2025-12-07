-- ============================================================================
-- organizations / organization_members / organization_invitations の追加
-- および既存テーブルへの organization_id 付与 + RLS 拡張
-- ============================================================================
-- 実行方法: Supabase Dashboard > SQL Editor でこのファイル全体を実行
-- 注意    : 既存データは organization_id が NULL のまま残ります。
--           個人利用のドキュメントとして引き続き user_id ベースで保護されます。
-- ============================================================================

-- 1. organizations テーブル
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.organizations is 'DocuFlow の組織（チーム）単位。';
comment on column public.organizations.owner_id is '組織のオーナーとなるユーザーの auth.users.id。';

-- 2. organization_members テーブル
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

comment on table public.organization_members is '組織に所属するメンバーと、その権限ロール。';

create index if not exists organization_members_user_id_idx
  on public.organization_members (user_id);

-- 3. organization_invitations テーブル
create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner', 'admin', 'member')),
  token uuid not null default gen_random_uuid(),
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.organization_invitations is '組織への招待情報（メールアドレス & 招待トークン）。';

create unique index if not exists organization_invitations_token_idx
  on public.organization_invitations (token);

-- 4. 既存テーブルへの organization_id 追加
alter table public.documents
  add column if not exists organization_id uuid references public.organizations(id);

alter table public.activity_logs
  add column if not exists organization_id uuid references public.organizations(id);

alter table public.document_comments
  add column if not exists organization_id uuid references public.organizations(id);

-- 便利なインデックス
create index if not exists documents_organization_id_created_at_idx
  on public.documents (organization_id, created_at desc);

create index if not exists activity_logs_org_id_created_at_idx
  on public.activity_logs (organization_id, created_at desc);

create index if not exists document_comments_org_id_created_at_idx
  on public.document_comments (organization_id, created_at asc);

-- 5. organizations / organization_members の RLS 設定
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invitations enable row level security;

drop policy if exists "Users can view own organizations" on public.organizations;
drop policy if exists "Users can manage own organizations" on public.organizations;

create policy "Users can view own organizations"
on public.organizations for select
using (
  auth.uid() is not null
  and (
    owner_id = auth.uid()
    or exists (
      select 1 from public.organization_members m
      where m.organization_id = organizations.id
        and m.user_id = auth.uid()
    )
  )
);

create policy "Users can manage own organizations"
on public.organizations for all
using (
  auth.uid() is not null and owner_id = auth.uid()
)
with check (
  auth.uid() is not null and owner_id = auth.uid()
);

drop policy if exists "Users can view own memberships" on public.organization_members;
drop policy if exists "Owners can manage memberships" on public.organization_members;

create policy "Users can view own memberships"
on public.organization_members for select
using (
  auth.uid() is not null
  and user_id = auth.uid()
);

create policy "Owners can manage memberships"
on public.organization_members for all
using (
  auth.uid() is not null
  and exists (
    select 1
    from public.organizations o
    where o.id = organization_members.organization_id
      and o.owner_id = auth.uid()
  )
)
with check (
  auth.uid() is not null
  and exists (
    select 1
    from public.organizations o
    where o.id = organization_members.organization_id
      and o.owner_id = auth.uid()
  )
);

drop policy if exists "Users can view invitations for their orgs" on public.organization_invitations;
drop policy if exists "Owners can manage invitations" on public.organization_invitations;

create policy "Users can view invitations for their orgs"
on public.organization_invitations for select
using (
  auth.uid() is not null
  and exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_invitations.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "Owners can manage invitations"
on public.organization_invitations for all
using (
  auth.uid() is not null
  and exists (
    select 1
    from public.organizations o
    where o.id = organization_invitations.organization_id
      and o.owner_id = auth.uid()
  )
)
with check (
  auth.uid() is not null
  and exists (
    select 1
    from public.organizations o
    where o.id = organization_invitations.organization_id
      and o.owner_id = auth.uid()
  )
);

-- 6. documents / document_comments の RLS を組織対応に拡張

-- documents: 既存ポリシーを再定義
drop policy if exists "Users can view own documents" on public.documents;
drop policy if exists "Users can insert own documents" on public.documents;
drop policy if exists "Users can update own documents" on public.documents;
drop policy if exists "Users can delete own documents" on public.documents;
drop policy if exists "Anyone can view shared documents" on public.documents;

create policy "Users can view own documents"
on public.documents for select
using (
  -- 認証済みユーザーであり
  auth.uid() is not null
  and (
    -- 自分のドキュメント
    user_id = auth.uid()
    or
    -- もしくは所属組織のドキュメント
    exists (
      select 1
      from public.organization_members m
      where m.organization_id = documents.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin', 'member')
    )
  )
  or
  -- 共有トークン付きドキュメントは誰でも閲覧可
  share_token is not null
);

create policy "Users can insert own documents"
on public.documents for insert
with check (
  auth.uid() is not null
  and user_id = auth.uid()
  and (
    -- 個人ドキュメント（organization_id が NULL）
    organization_id is null
    or
    -- 組織ドキュメント: 所属している組織に対してのみ作成可能
    exists (
      select 1
      from public.organization_members m
      where m.organization_id = documents.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  )
);

create policy "Users can update own documents"
on public.documents for update
using (
  auth.uid() is not null
  and (
    user_id = auth.uid()
    or exists (
      select 1
      from public.organization_members m
      where m.organization_id = documents.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin', 'member')
    )
  )
)
with check (
  auth.uid() is not null
  and (
    user_id = auth.uid()
    or exists (
      select 1
      from public.organization_members m
      where m.organization_id = documents.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin', 'member')
    )
  )
);

create policy "Users can delete own documents"
on public.documents for delete
using (
  auth.uid() is not null
  and (
    user_id = auth.uid()
    or exists (
      select 1
      from public.organization_members m
      where m.organization_id = documents.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  )
);

-- document_comments: 組織メンバーも閲覧・作成可能にする
drop policy if exists "Users can view comments on accessible documents" on public.document_comments;
drop policy if exists "Users can insert comments on own documents" on public.document_comments;
drop policy if exists "Users can delete own comments" on public.document_comments;

create policy "Users can view comments on accessible documents"
on public.document_comments for select
using (
  exists (
    select 1
    from public.documents d
    where d.id = document_comments.document_id
      and (
        -- 自分のドキュメント、または所属組織のドキュメント
        (
          auth.uid() is not null
          and (
            d.user_id = auth.uid()
            or exists (
              select 1
              from public.organization_members m
              where m.organization_id = d.organization_id
                and m.user_id = auth.uid()
                and m.role in ('owner', 'admin', 'member')
            )
          )
        )
        or
        -- 共有リンク（匿名閲覧）
        d.share_token is not null
      )
  )
);

create policy "Users can insert comments on own documents"
on public.document_comments for insert
with check (
  exists (
    select 1
    from public.documents d
    where d.id = document_comments.document_id
      and auth.uid() is not null
      and (
        d.user_id = auth.uid()
        or exists (
          select 1
          from public.organization_members m
          where m.organization_id = d.organization_id
            and m.user_id = auth.uid()
            and m.role in ('owner', 'admin', 'member')
        )
      )
  )
);

create policy "Users can delete own comments"
on public.document_comments for delete
using (
  auth.uid() is not null
  and user_id = auth.uid()
);







