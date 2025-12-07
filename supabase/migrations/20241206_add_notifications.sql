-- ============================================================================
-- 通知システム & コラボ機能強化
-- ============================================================================
-- 実行方法: Supabase Dashboard > SQL Editor でこのファイル全体を実行
-- ============================================================================

-- ============================================================================
-- 1. notifications テーブル
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                -- 通知を受け取るユーザー
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                   -- 通知タイプ（後述）
  title TEXT NOT NULL,                  -- 通知タイトル
  message TEXT,                         -- 通知本文
  -- 関連リソース
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.document_comments(id) ON DELETE CASCADE,
  -- 送信者情報
  actor_user_id UUID,                   -- アクションを起こしたユーザー
  -- メタデータ
  payload JSONB DEFAULT '{}',           -- 追加情報（柔軟に拡張可能）
  -- 既読管理
  read_at TIMESTAMPTZ,                  -- 既読にした日時（NULLなら未読）
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- インデックス
CREATE INDEX IF NOT EXISTS notifications_user_id_created_at_idx
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_id_read_at_idx
  ON public.notifications (user_id, read_at)
  WHERE read_at IS NULL;  -- 未読のみ高速検索

-- 通知タイプの説明（コメント）
-- type の値:
--   'comment_added'       : ドキュメントにコメントが追加された
--   'comment_mention'     : コメントでメンションされた
--   'share_link_created'  : ドキュメントの共有リンクが作成された
--   'document_shared'     : ドキュメントが共有された
--   'org_invitation'      : 組織への招待
--   'org_member_joined'   : 組織に新メンバーが参加
--   'document_updated'    : ウォッチ中のドキュメントが更新された

-- ============================================================================
-- 2. document_comments にメンション機能を追加
-- ============================================================================

-- メンションされたユーザーIDの配列を追加
ALTER TABLE public.document_comments
  ADD COLUMN IF NOT EXISTS mentioned_user_ids UUID[] DEFAULT '{}';

-- ============================================================================
-- 3. RLS ポリシー
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（再実行時のため）
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- ポリシー1: 自分の通知のみ閲覧可能
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
);

-- ポリシー2: 自分の通知のみ更新可能（既読化）
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
);

-- ポリシー3: Service Role による挿入を許可
-- 通知の作成はサーバーサイドで行うため、INSERT権限はService Roleに限定
-- （認証ユーザーがINSERTすることはない）
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 4. 通知作成用のヘルパー関数
-- ============================================================================

-- 指定ユーザーに通知を送信する関数
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_document_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL,
  p_actor_user_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_payload JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    organization_id,
    type,
    title,
    message,
    document_id,
    comment_id,
    actor_user_id,
    payload
  ) VALUES (
    p_user_id,
    p_organization_id,
    p_type,
    p_title,
    p_message,
    p_document_id,
    p_comment_id,
    p_actor_user_id,
    p_payload
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- 関数の実行権限を付与
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, UUID, UUID, UUID, UUID, JSONB)
  TO authenticated, service_role;

-- ============================================================================
-- 5. 通知を既読にする関数
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET read_at = now()
  WHERE id = p_notification_id
    AND user_id::text = auth.uid()::text
    AND read_at IS NULL;

  RETURN FOUND;
END;
$$;

-- すべての通知を既読にする関数
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET read_at = now()
  WHERE user_id::text = auth.uid()::text
    AND read_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 関数の実行権限を付与
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read() TO authenticated;

-- ============================================================================
-- 6. 未読通知数を取得する関数
-- ============================================================================

CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM public.notifications
  WHERE user_id::text = auth.uid()::text
    AND read_at IS NULL;

  RETURN v_count;
END;
$$;

-- 関数の実行権限を付与
GRANT EXECUTE ON FUNCTION get_unread_notification_count() TO authenticated;

-- ============================================================================
-- 確認クエリ（実行後に確認）
-- ============================================================================

-- テーブル一覧を確認
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- notifications テーブルの構造を確認
-- \d public.notifications

-- RLS ポリシーを確認
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications';






