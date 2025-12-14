import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getActiveOrganizationId } from "./organizations";

type ActivityAction =
  | "create_document"
  | "update_document"
  | "delete_document"
  | "archive_document"
  | "restore_document"
  | "toggle_favorite"
  | "toggle_pinned"
  | "enable_share"
  | "disable_share"
  | "add_comment"
  // organization / admin actions
  | "invite_member"
  | "join_organization"
  | "leave_organization"
  | "remove_member"
  | "change_member_role"
  | "delete_organization"
  | "transfer_ownership";

type ActivityPayload = {
  userId?: string; // override (server actions etc.)
  documentId?: string;
  documentTitle?: string | null;
  details?: string;
  metadata?: Record<string, unknown> | null;
  organizationId?: string | null;
};

export async function logActivity(
  action: ActivityAction,
  payload: ActivityPayload = {}
) {
  const cookieStore = await cookies();
  const userId =
    payload.userId ?? cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) return;

  const { documentId, documentTitle, details, organizationId, metadata } =
    payload;
  
  // organization_idが明示的に渡されていなければ、アクティブな組織から取得
  const orgId = organizationId !== undefined 
    ? organizationId 
    : await getActiveOrganizationId(userId);

  const row = {
    user_id: userId,
    organization_id: orgId,
    action,
    document_id: documentId ?? null,
    document_title: documentTitle ?? null,
    metadata: (metadata ?? null) ?? (details ? { details } : null),
  };

  // RLS が有効でも監査ログが落ちないよう、service_role があれば優先して書き込む
  const client = supabaseAdmin ?? supabase;
  const { error } = await client.from("activity_logs").insert(row);
  if (error) {
    console.error("[logActivity] insert failed:", error);
  }
}





