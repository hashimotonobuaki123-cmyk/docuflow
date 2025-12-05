-- ============================================================================
-- Row Level Security (RLS) 本番運用ポリシー
-- ============================================================================
-- 実行方法: Supabase Dashboard > SQL Editor でこのファイル全体を実行
-- ============================================================================

-- ============================================================================
-- 1. documents テーブルのRLS
-- ============================================================================

-- RLSを有効化
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（再実行時のため）
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can view shared documents" ON public.documents;

-- ポリシー1: 自分のドキュメントのみ閲覧可能
CREATE POLICY "Users can view own documents"
ON public.documents FOR SELECT
USING (
  -- 認証済みユーザーは自分のドキュメントを閲覧可能
  (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text)
  OR
  -- 共有トークンがある場合は誰でも閲覧可能（共有リンク用）
  (share_token IS NOT NULL)
);

-- ポリシー2: 自分のドキュメントのみ作成可能
CREATE POLICY "Users can insert own documents"
ON public.documents FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
);

-- ポリシー3: 自分のドキュメントのみ更新可能
CREATE POLICY "Users can update own documents"
ON public.documents FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
);

-- ポリシー4: 自分のドキュメントのみ削除可能
CREATE POLICY "Users can delete own documents"
ON public.documents FOR DELETE
USING (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
);

-- ============================================================================
-- 2. document_versions テーブルのRLS
-- ============================================================================

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own document versions" ON public.document_versions;
DROP POLICY IF EXISTS "Users can insert own document versions" ON public.document_versions;
DROP POLICY IF EXISTS "Users can delete own document versions" ON public.document_versions;

-- バージョン履歴: 自分のもののみ閲覧可能
CREATE POLICY "Users can view own document versions"
ON public.document_versions FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
);

-- バージョン作成: 自分のもののみ
CREATE POLICY "Users can insert own document versions"
ON public.document_versions FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
);

-- バージョン削除: 自分のもののみ
CREATE POLICY "Users can delete own document versions"
ON public.document_versions FOR DELETE
USING (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
);

-- ============================================================================
-- 3. activity_logs テーブルのRLS
-- ============================================================================

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.activity_logs;

-- アクティビティログ: 自分のもののみ閲覧可能
CREATE POLICY "Users can view own activity logs"
ON public.activity_logs FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
);

-- アクティビティログ作成: 自分のもののみ
CREATE POLICY "Users can insert own activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
);

-- ============================================================================
-- 4. document_comments テーブルのRLS
-- ============================================================================

ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view comments on accessible documents" ON public.document_comments;
DROP POLICY IF EXISTS "Users can insert comments on own documents" ON public.document_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.document_comments;

-- コメント閲覧: アクセス可能なドキュメントのコメントを閲覧可能
CREATE POLICY "Users can view comments on accessible documents"
ON public.document_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_comments.document_id
    AND (
      (auth.uid() IS NOT NULL AND d.user_id::text = auth.uid()::text)
      OR d.share_token IS NOT NULL
    )
  )
);

-- コメント作成: 自分のドキュメントにのみ
CREATE POLICY "Users can insert comments on own documents"
ON public.document_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_comments.document_id
    AND auth.uid() IS NOT NULL
    AND d.user_id::text = auth.uid()::text
  )
);

-- コメント削除: 自分のコメントのみ
CREATE POLICY "Users can delete own comments"
ON public.document_comments FOR DELETE
USING (
  auth.uid() IS NOT NULL
  AND user_id::text = auth.uid()::text
);

-- ============================================================================
-- 5. 共有リンク用の専用関数
-- ============================================================================

-- share_token でドキュメントを取得する関数（RLSバイパス）
CREATE OR REPLACE FUNCTION get_shared_document(p_share_token TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  raw_content TEXT,
  summary TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER -- RLSをバイパス
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.category,
    d.raw_content,
    d.summary,
    d.tags,
    d.created_at
  FROM public.documents d
  WHERE d.share_token = p_share_token
  AND d.is_archived = FALSE;
END;
$$;

-- 関数の実行権限を付与
GRANT EXECUTE ON FUNCTION get_shared_document(TEXT) TO anon, authenticated;

-- ============================================================================
-- 6. Service Role 用のバイパス設定
-- ============================================================================

-- Service Role Key を使う場合はRLSをバイパスする
-- Supabase では service_role キーを使った接続は自動でRLSをバイパスします。
-- 管理者操作（アカウント削除等）で使用。

-- ============================================================================
-- 確認クエリ（実行後に確認）
-- ============================================================================

-- RLSが有効かどうか確認
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- ポリシー一覧を確認
-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies WHERE schemaname = 'public';
