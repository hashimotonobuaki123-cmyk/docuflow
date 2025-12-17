-- ============================================================================
-- Harden public share: prevent anonymous enumeration of all shared documents
-- ============================================================================
-- Goal:
-- - Do NOT allow anon/authenticated to "list all shared documents" via RLS condition
-- - Only allow public access via get_shared_document(p_share_token)
--
-- NOTE:
-- - Next.js share page should call RPC get_shared_document()
-- - This migration is safe-by-default; it removes "share_token is not null" from SELECT policies
-- ============================================================================

-- 1) documents: remove anonymous access via share_token IS NOT NULL
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;

CREATE POLICY "Users can view own documents"
ON public.documents FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.organization_members m
      WHERE m.organization_id = documents.organization_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin', 'member')
    )
  )
);

-- 2) document_comments: remove anonymous access on shared docs (token-based sharing is read-only)
DROP POLICY IF EXISTS "Users can view comments on accessible documents" ON public.document_comments;

CREATE POLICY "Users can view comments on accessible documents"
ON public.document_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.documents d
    WHERE d.id = document_comments.document_id
      AND auth.uid() IS NOT NULL
      AND (
        d.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.organization_members m
          WHERE m.organization_id = d.organization_id
            AND m.user_id = auth.uid()
            AND m.role IN ('owner', 'admin', 'member')
        )
      )
  )
);

-- 3) get_shared_document: enforce expiry inside DB (so client can't bypass by querying table)
CREATE OR REPLACE FUNCTION get_shared_document(p_share_token TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  raw_content TEXT,
  summary TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  share_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
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
    d.created_at,
    d.share_expires_at
  FROM public.documents d
  WHERE d.share_token = p_share_token
    AND d.is_archived = FALSE
    AND (d.share_expires_at IS NULL OR d.share_expires_at > NOW());
END;
$$;

GRANT EXECUTE ON FUNCTION get_shared_document(TEXT) TO anon, authenticated;


