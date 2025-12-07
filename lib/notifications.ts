/**
 * 通知システムユーティリティ
 *
 * - 通知の取得・既読化
 * - 通知の作成
 * - メンション解析
 */

import { supabase } from "@/lib/supabaseClient";

// 通知タイプ
export type NotificationType =
  | "comment_added"       // ドキュメントにコメントが追加された
  | "comment_mention"     // コメントでメンションされた
  | "share_link_created"  // 共有リンクが作成された
  | "document_shared"     // ドキュメントが共有された
  | "org_invitation"      // 組織への招待
  | "org_member_joined"   // 組織に新メンバーが参加
  | "document_updated";   // ウォッチ中のドキュメントが更新された

// 通知の型
export type Notification = {
  id: string;
  user_id: string;
  organization_id: string | null;
  type: NotificationType;
  title: string;
  message: string | null;
  document_id: string | null;
  comment_id: string | null;
  actor_user_id: string | null;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

/**
 * ユーザーの通知一覧を取得
 */
export async function getUserNotifications(
  userId: string,
  limit = 20,
  includeRead = false
): Promise<Notification[]> {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!includeRead) {
    query = query.is("read_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getUserNotifications error:", error);
    return [];
  }

  return (data || []) as Notification[];
}

/**
 * 未読通知数を取得
 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("getUnreadNotificationCount error:", error);
    return 0;
  }

  return count || 0;
}

/**
 * 通知を既読にする
 */
export async function markNotificationRead(
  notificationId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    console.error("markNotificationRead error:", error);
    return false;
  }

  return true;
}

/**
 * すべての通知を既読にする
 */
export async function markAllNotificationsRead(
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null)
    .select("id");

  if (error) {
    console.error("markAllNotificationsRead error:", error);
    return 0;
  }

  return (data || []).length;
}

/**
 * 通知を作成する
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  documentId,
  commentId,
  actorUserId,
  organizationId,
  payload = {},
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  documentId?: string;
  commentId?: string;
  actorUserId?: string;
  organizationId?: string;
  payload?: Record<string, unknown>;
}): Promise<Notification | null> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      organization_id: organizationId || null,
      type,
      title,
      message: message || null,
      document_id: documentId || null,
      comment_id: commentId || null,
      actor_user_id: actorUserId || null,
      payload,
    })
    .select()
    .single();

  if (error) {
    console.error("createNotification error:", error);
    return null;
  }

  return data as Notification;
}

/**
 * コメント本文からメンションを抽出する
 * @メールアドレス または @名前 の形式を検出
 */
export function extractMentions(content: string): string[] {
  // @user@example.com または @名前（スペースまで）を検出
  const mentionRegex = /@([^\s@]+@[^\s@]+\.[^\s@]+|[^\s@]+)/g;
  const matches = content.match(mentionRegex);
  
  if (!matches) return [];

  // @を除去して返す
  return matches.map((m) => m.slice(1));
}

/**
 * 通知タイプに応じたアイコンを取得
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "comment_added":
      return "💬";
    case "comment_mention":
      return "📢";
    case "share_link_created":
      return "🔗";
    case "document_shared":
      return "📤";
    case "org_invitation":
      return "✉️";
    case "org_member_joined":
      return "👋";
    case "document_updated":
      return "📝";
    default:
      return "🔔";
  }
}

/**
 * 通知タイプに応じたバッジカラーを取得
 */
export function getNotificationBadgeClass(type: NotificationType): string {
  switch (type) {
    case "comment_added":
    case "comment_mention":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "share_link_created":
    case "document_shared":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "org_invitation":
    case "org_member_joined":
      return "bg-violet-100 text-violet-700 border-violet-200";
    case "document_updated":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

/**
 * 通知からリンク先URLを生成
 */
export function getNotificationLink(notification: Notification): string {
  if (notification.document_id) {
    return `/documents/${notification.document_id}`;
  }
  
  if (notification.type === "org_invitation") {
    return "/settings/organizations";
  }

  return "/app";
}

/**
 * 相対時間を表示用にフォーマット
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 7) return `${diffDay}日前`;

  return date.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}






