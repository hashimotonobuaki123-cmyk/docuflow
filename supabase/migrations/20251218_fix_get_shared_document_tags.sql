-- ============================================================================
-- Fix get_shared_document(): align return types with actual documents.tags type
-- ============================================================================
-- In some environments `documents.tags` is TEXT (JSON string), not TEXT[].
-- The previous function returned TEXT[] and failed at runtime.
--
-- This migration recreates the function with `tags TEXT` and casts safely.
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_shared_document(TEXT);

CREATE FUNCTION public.get_shared_document(p_share_token TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  raw_content TEXT,
  summary TEXT,
  tags TEXT,
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
    d.tags::text,
    d.created_at,
    d.share_expires_at
  FROM public.documents d
  WHERE d.share_token = p_share_token
    AND d.is_archived = FALSE
    AND (d.share_expires_at IS NULL OR d.share_expires_at > NOW());
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_document(TEXT) TO anon, authenticated;


