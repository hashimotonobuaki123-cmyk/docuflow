import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";

type ActivityAction =
  | "create_document"
  | "update_document"
  | "delete_document"
  | "toggle_favorite"
  | "toggle_pinned"
  | "enable_share"
  | "disable_share"
  | "add_comment"
  | "archive_document"
  | "restore_document";

type ActivityPayload = {
  documentId?: string;
  documentTitle?: string | null;
  details?: string;
};

export async function logActivity(
  action: ActivityAction,
  payload: ActivityPayload = {},
) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) return;

  const { documentId, documentTitle, details } = payload;

  await supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    document_id: documentId ?? null,
    document_title: documentTitle ?? null,
    metadata: details ? { details } : null,
  });
}
