/**
 * 組織管理ユーティリティ
 *
 * - 所属組織一覧の取得
 * - アクティブな組織IDの取得・設定（Cookie管理）
 * - 組織の作成・招待
 */

import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logActivity } from "@/lib/activityLog";
import { captureError, captureEvent } from "@/lib/sentry";
import {
  OrganizationRole,
  Organization,
} from "@/lib/organizationTypes";
import { canAddMember } from "@/lib/subscription";

function getDbClient() {
  // server-side では service_role を優先（RLSや auth セッション未導入でも運用できるようにする）
  // NOTE: client-side からこの関数が呼ばれない前提（Server Actions / Route Handlers / Server Components）
  return supabaseAdmin ?? supabase;
}

// メンバーシップ（所属情報）
export type OrganizationMembership = {
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  created_at: string;
  organization: Organization;
};

// メンバー一覧用の型
export type OrganizationMember = {
  user_id: string;
  role: OrganizationRole;
  created_at: string;
  email?: string;
};

// 招待の型
export type OrganizationInvitation = {
  id: string;
  organization_id: string;
  email: string;
  role: OrganizationRole;
  token: string;
  expires_at: string;
  created_at: string;
};

// Cookie名
const ACTIVE_ORG_COOKIE = "docuflow_active_org";

/**
 * 現在のユーザーが所属する組織一覧を取得
 */
export async function getUserOrganizations(
  userId: string
): Promise<OrganizationMembership[]> {
  // テスト環境ではDBアクセスをスキップ（Vitest用）
  if (process.env.NODE_ENV === "test") {
    return [];
  }

  const client = getDbClient();
  const { data, error } = await client
    .from("organization_members")
    .select(
      `
      organization_id,
      user_id,
      role,
      created_at,
      organization:organizations (
        id,
        name,
        slug,
        created_at
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getUserOrganizations error:", error);
    return [];
  }

  // Supabaseのjoinは配列で返ってくることがあるので正規化
  return (data || []).map((row) => ({
    organization_id: row.organization_id,
    user_id: row.user_id,
    role: row.role as OrganizationRole,
    created_at: row.created_at,
    organization: Array.isArray(row.organization)
      ? row.organization[0]
      : row.organization,
  }));
}

/**
 * アクティブな組織IDを取得（Cookie or デフォルト）
 */
export async function getActiveOrganizationId(
  userId: string
): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

  // Cookieに組織IDがあり、そのユーザーが所属しているか確認
  if (cookieOrgId) {
    const memberships = await getUserOrganizations(userId);
    const isMember = memberships.some(
      (m) => m.organization_id === cookieOrgId
    );
    if (isMember) {
      return cookieOrgId;
    }
  }

  // Cookieがない or 所属していない場合、最初の組織を返す
  const memberships = await getUserOrganizations(userId);
  if (memberships.length > 0) {
    return memberships[0].organization_id;
  }

  return null;
}

/**
 * アクティブな組織を切り替える（サーバーアクション用）
 */
export async function setActiveOrganization(
  userId: string,
  organizationId: string
): Promise<void> {
  if (!organizationId) return;
  // テスト環境ではDBアクセスを避ける（Vitest用）
  if (process.env.NODE_ENV === "test") {
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1年
      path: "/",
    });
    return;
  }

  // Safety: 所属している組織だけを active にできる（cookie 改ざん/将来の参照漏れ対策）
  const memberships = await getUserOrganizations(userId);
  const isMember = memberships.some((m) => m.organization_id === organizationId);
  if (!isMember) {
    throw new Error("Forbidden: not a member of the organization");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1年
    path: "/",
  });
}

/**
 * 組織を新規作成（作成者は自動的にownerになる）
 */
export async function createOrganization(
  userId: string,
  name: string,
  slug?: string
): Promise<{ organization: Organization | null; error: string | null }> {
  const client = getDbClient();

  // slugが未指定の場合、nameからslugを生成
  const orgSlug =
    slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    `org-${Date.now()}`;

  // 組織を作成
  const { data: org, error: orgError } = await client
    .from("organizations")
    .insert({ name, slug: orgSlug, owner_id: userId })
    .select()
    .single();

  if (orgError) {
    console.error("createOrganization org error:", orgError);
    return { organization: null, error: "組織の作成に失敗しました。" };
  }

  // 作成者をownerとして追加
  const { error: memberError } = await client
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: userId,
      role: "owner",
    });

  if (memberError) {
    console.error("createOrganization member error:", memberError);
    // 組織は作成されたがメンバー追加に失敗した場合、組織も削除
    await client.from("organizations").delete().eq("id", org.id);
    return { organization: null, error: "メンバー登録に失敗しました。" };
  }

  return { organization: org as Organization, error: null };
}

/**
 * 組織のメンバー一覧を取得
 */
export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMember[]> {
  const client = getDbClient();
  const { data, error } = await client
    .from("organization_members")
    .select("user_id, role, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getOrganizationMembers error:", error);
    return [];
  }

  return (data || []) as OrganizationMember[];
}

/**
 * 組織での自分のロールを取得
 */
export async function getUserRoleInOrganization(
  userId: string,
  organizationId: string
): Promise<OrganizationRole | null> {
  const client = getDbClient();
  const { data, error } = await client
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role as OrganizationRole;
}

/**
 * 招待を作成
 */
export async function createInvitation(
  organizationId: string,
  email: string,
  role: OrganizationRole = "member",
  invitedBy: string
): Promise<{ invitation: OrganizationInvitation | null; error: string | null }> {
  const client = getDbClient();

  // 招待者のロールを確認（owner/adminのみ招待可能）
  const inviterRole = await getUserRoleInOrganization(invitedBy, organizationId);
  if (!inviterRole || inviterRole === "member") {
    captureEvent(
      "Org invite denied (permission)",
      {
        tags: {
          domain: "org",
          action: "org.invitation.create.denied",
          reason: "permission",
        },
        extra: {
          organizationId,
          actorUserId: invitedBy,
          actorRole: inviterRole ?? "none",
        },
      },
      "warning",
    );
    return { invitation: null, error: "招待する権限がありません。" };
  }

  // adminはmemberのみ招待可能
  if (inviterRole === "admin" && role !== "member") {
    captureEvent(
      "Org invite denied (admin role restriction)",
      {
        tags: {
          domain: "org",
          action: "org.invitation.create.denied",
          reason: "admin_role_restriction",
        },
        extra: {
          organizationId,
          actorUserId: invitedBy,
          actorRole: inviterRole,
          requestedRole: role,
        },
      },
      "warning",
    );
    return { invitation: null, error: "管理者はメンバーのみ招待できます。" };
  }

  // トークン生成（UUID）
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7日後

  const { data, error } = await client
    .from("organization_invitations")
    .insert({
      organization_id: organizationId,
      email,
      role,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("createInvitation error:", error);
    captureError(new Error("createInvitation failed"), {
      tags: { domain: "org", action: "org.invitation.create", type: "org_invite_error" },
      extra: { organizationId, actorUserId: invitedBy, requestedRole: role },
      user: { id: invitedBy },
      level: "error",
    });
    return { invitation: null, error: "招待の作成に失敗しました。" };
  }

  await logActivity("invite_member", {
    userId: invitedBy,
    organizationId,
    metadata: {
      invited_email: email,
      role,
    },
  });

  // SentryにはPII（メール）を送らない
  captureEvent(
    "Org invite created",
    {
      tags: { domain: "org", action: "org.invitation.created" },
      extra: { organizationId, actorUserId: invitedBy, role },
    },
    "info",
  );

  return { invitation: data as OrganizationInvitation, error: null };
}

/**
 * 招待を受諾
 */
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<{ success: boolean; error: string | null; organizationId?: string }> {
  const client = getDbClient();

  // 招待を取得
  const { data: invitation, error: fetchError } = await client
    .from("organization_invitations")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .single();

  if (fetchError || !invitation) {
    captureEvent(
      "Org invite accept failed (not found)",
      {
        tags: { domain: "org", action: "org.invitation.accept.failed", reason: "not_found" },
        extra: { tokenPrefix: String(token).slice(0, 8), userId },
      },
      "warning",
    );
    return { success: false, error: "招待が見つかりません。" };
  }

  // 有効期限チェック
  if (new Date(invitation.expires_at) < new Date()) {
    captureEvent(
      "Org invite accept failed (expired)",
      {
        tags: { domain: "org", action: "org.invitation.accept.failed", reason: "expired" },
        extra: { organizationId: invitation.organization_id, invitationId: invitation.id, userId },
      },
      "warning",
    );
    return { success: false, error: "招待の有効期限が切れています。" };
  }

  // すでにメンバーなら成功扱い（安全・冪等）
  const { data: existingMember } = await client
    .from("organization_members")
    .select("id")
    .eq("organization_id", invitation.organization_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (existingMember?.id) {
    await client
      .from("organization_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);
    await logActivity("join_organization", {
      userId,
      organizationId: invitation.organization_id,
      metadata: { invitation_id: invitation.id, role: invitation.role, already_member: true },
    });
    return { success: true, error: null, organizationId: invitation.organization_id };
  }

  // プラン制限チェック（デフォルトは日本語）
  // NOTE: 招待受諾時はまだメンバーでない可能性があるため requesterUserId は渡さない（招待トークンが前提）
  const limitCheck = await canAddMember(invitation.organization_id, "ja");
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason || "メンバー数の上限に達しています。" };
  }

  // メンバーとして追加
  const { error: memberError } = await client
    .from("organization_members")
    .insert({
      organization_id: invitation.organization_id,
      user_id: userId,
      role: invitation.role,
    });

  if (memberError) {
    console.error("acceptInvitation member error:", memberError);
    captureError(new Error("acceptInvitation failed"), {
      tags: {
        domain: "org",
        action: "org.invitation.accept",
        type: "org_invite_accept_error",
      },
      extra: {
        organizationId: invitation.organization_id,
        invitationId: invitation.id,
      },
      user: { id: userId },
      level: "error",
    });
    // unique制約違反などは成功扱いに寄せる（冪等）
    const msg = (memberError as { message?: string } | null)?.message ?? "";
    if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
      await client
        .from("organization_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);
      await logActivity("join_organization", {
        userId,
        organizationId: invitation.organization_id,
        metadata: { invitation_id: invitation.id, role: invitation.role, already_member: true },
      });
      return { success: true, error: null, organizationId: invitation.organization_id };
    }
    return { success: false, error: "メンバー登録に失敗しました。" };
  }

  // 招待を受諾済みに更新
  await client
    .from("organization_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  await logActivity("join_organization", {
    userId,
    organizationId: invitation.organization_id,
    metadata: { invitation_id: invitation.id, role: invitation.role },
  });

  captureEvent(
    "Org member joined",
    {
      tags: { domain: "org", action: "org.member.joined" },
      extra: { organizationId: invitation.organization_id, userId, role: invitation.role },
    },
    "info",
  );

  return { success: true, error: null, organizationId: invitation.organization_id };
}

/**
 * メンバーを削除（owner/admin のみ）
 * - owner: member/admin を削除可能（owner は削除不可）
 * - admin: member のみ削除可能（admin/owner は不可）
 */
export async function removeOrganizationMember(
  organizationId: string,
  targetUserId: string,
  actorUserId: string,
): Promise<{ success: boolean; error: string | null }> {
  const client = getDbClient();

  const actorRole = await getUserRoleInOrganization(actorUserId, organizationId);
  if (!actorRole || actorRole === "member") {
    captureEvent(
      "Org remove member denied (permission)",
      {
        tags: {
          domain: "org",
          action: "org.member.remove.denied",
          reason: "permission",
        },
        extra: { organizationId, actorUserId, actorRole: actorRole ?? "none", targetUserId },
      },
      "warning",
    );
    return { success: false, error: "メンバーを管理する権限がありません。" };
  }

  if (targetUserId === actorUserId) {
    return { success: false, error: "自分自身を削除することはできません。" };
  }

  const { data: target, error: targetError } = await client
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (targetError) {
    console.error("removeOrganizationMember fetch target error:", targetError);
    return { success: false, error: "メンバー情報の取得に失敗しました。" };
  }

  const targetRole = (target as { role?: OrganizationRole } | null)?.role ?? null;
  if (!targetRole) {
    // すでに存在しないなら成功扱い（冪等）
    return { success: true, error: null };
  }

  if (targetRole === "owner") {
    captureEvent(
      "Org remove member denied (target owner)",
      {
        tags: {
          domain: "org",
          action: "org.member.remove.denied",
          reason: "target_owner",
        },
        extra: { organizationId, actorUserId, actorRole, targetUserId },
      },
      "warning",
    );
    return { success: false, error: "オーナーは削除できません。" };
  }

  if (actorRole === "admin" && targetRole !== "member") {
    captureEvent(
      "Org remove member denied (admin restriction)",
      {
        tags: {
          domain: "org",
          action: "org.member.remove.denied",
          reason: "admin_role_restriction",
        },
        extra: { organizationId, actorUserId, actorRole, targetUserId, targetRole },
      },
      "warning",
    );
    return { success: false, error: "管理者はメンバーのみ削除できます。" };
  }

  const { error } = await client
    .from("organization_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", targetUserId);

  if (error) {
    console.error("removeOrganizationMember delete error:", error);
    captureError(new Error("removeOrganizationMember failed"), {
      tags: {
        domain: "org",
        action: "org.member.remove",
        type: "org_remove_member_error",
      },
      extra: { organizationId, actorUserId, targetUserId },
      user: { id: actorUserId },
      level: "error",
    });
    return { success: false, error: "メンバーの削除に失敗しました。" };
  }

  await logActivity("remove_member", {
    userId: actorUserId,
    organizationId,
    metadata: { target_user_id: targetUserId },
  });

  captureEvent(
    "Org member removed",
    {
      tags: { domain: "org", action: "org.member.removed" },
      extra: { organizationId, actorUserId, targetUserId },
    },
    "info",
  );

  return { success: true, error: null };
}

/**
 * メンバーのロールを変更（owner のみ）
 * - owner -> (admin|member) への変更は不可（オーナーは維持）
 */
export async function updateOrganizationMemberRole(
  organizationId: string,
  targetUserId: string,
  newRole: Exclude<OrganizationRole, "owner">,
  actorUserId: string,
): Promise<{ success: boolean; error: string | null }> {
  const client = getDbClient();

  const actorRole = await getUserRoleInOrganization(actorUserId, organizationId);
  if (actorRole !== "owner") {
    captureEvent(
      "Org change role denied (permission)",
      {
        tags: {
          domain: "org",
          action: "org.member.role_change.denied",
          reason: "permission",
        },
        extra: {
          organizationId,
          actorUserId,
          actorRole: actorRole ?? "none",
          targetUserId,
          newRole,
        },
      },
      "warning",
    );
    return { success: false, error: "ロールを変更する権限がありません。" };
  }

  // 自分自身のownerロールは落とさない（事故防止）
  if (targetUserId === actorUserId) {
    return { success: false, error: "自分自身のロールは変更できません。" };
  }

  const { data: target, error: targetError } = await client
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (targetError) {
    console.error("updateOrganizationMemberRole fetch target error:", targetError);
    return { success: false, error: "メンバー情報の取得に失敗しました。" };
  }

  const targetRole = (target as { role?: OrganizationRole } | null)?.role ?? null;
  if (!targetRole) {
    return { success: false, error: "対象メンバーが見つかりません。" };
  }
  if (targetRole === "owner") {
    captureEvent(
      "Org change role denied (target owner)",
      {
        tags: {
          domain: "org",
          action: "org.member.role_change.denied",
          reason: "target_owner",
        },
        extra: { organizationId, actorUserId, targetUserId },
      },
      "warning",
    );
    return { success: false, error: "オーナーのロールは変更できません。" };
  }

  const { error } = await client
    .from("organization_members")
    .update({ role: newRole })
    .eq("organization_id", organizationId)
    .eq("user_id", targetUserId);

  if (error) {
    console.error("updateOrganizationMemberRole update error:", error);
    captureError(new Error("updateOrganizationMemberRole failed"), {
      tags: {
        domain: "org",
        action: "org.member.role_change",
        type: "org_change_role_error",
      },
      extra: { organizationId, actorUserId, targetUserId, newRole },
      user: { id: actorUserId },
      level: "error",
    });
    return { success: false, error: "ロール変更に失敗しました。" };
  }

  await logActivity("change_member_role", {
    userId: actorUserId,
    organizationId,
    metadata: { target_user_id: targetUserId, new_role: newRole },
  });

  captureEvent(
    "Org member role changed",
    {
      tags: { domain: "org", action: "org.member.role_changed" },
      extra: { organizationId, actorUserId, targetUserId, newRole },
    },
    "info",
  );

  return { success: true, error: null };
}

/**
 * 組織を削除（owner のみ）
 * - organizations 行の削除で、members/invitations は on delete cascade を想定
 */
export async function deleteOrganization(
  organizationId: string,
  actorUserId: string,
): Promise<{ success: boolean; error: string | null }> {
  const client = getDbClient();

  const actorRole = await getUserRoleInOrganization(actorUserId, organizationId);
  if (actorRole !== "owner") {
    captureEvent(
      "Org delete denied (permission)",
      {
        tags: { domain: "org", action: "org.delete.denied", reason: "permission" },
        extra: { organizationId, actorUserId, actorRole: actorRole ?? "none" },
      },
      "warning",
    );
    return { success: false, error: "組織を削除する権限がありません。" };
  }

  const { error } = await client
    .from("organizations")
    .delete()
    .eq("id", organizationId);

  if (error) {
    console.error("deleteOrganization error:", error);
    captureError(new Error("deleteOrganization failed"), {
      tags: { domain: "org", action: "org.delete", type: "org_delete_error" },
      extra: { organizationId, actorUserId },
      user: { id: actorUserId },
      level: "error",
    });
    return { success: false, error: "組織の削除に失敗しました。" };
  }

  await logActivity("delete_organization", {
    userId: actorUserId,
    organizationId,
  });

  captureEvent(
    "Org deleted",
    {
      tags: { domain: "org", action: "org.deleted" },
      extra: { organizationId, actorUserId },
    },
    "warning",
  );

  return { success: true, error: null };
}

/**
 * 組織を退出（admin/member のみ）
 * - owner は退出不可（削除 or オーナー移譲が必要）
 */
export async function leaveOrganization(
  organizationId: string,
  actorUserId: string,
): Promise<{ success: boolean; error: string | null }> {
  const client = getDbClient();

  const actorRole = await getUserRoleInOrganization(actorUserId, organizationId);
  if (!actorRole) {
    // すでに所属していないなら成功扱い（冪等）
    return { success: true, error: null };
  }

  if (actorRole === "owner") {
    captureEvent(
      "Org leave denied (owner)",
      {
        tags: { domain: "org", action: "org.leave.denied", reason: "owner" },
        extra: { organizationId, actorUserId },
      },
      "warning",
    );
    return { success: false, error: "オーナーは組織を退出できません。" };
  }

  const { error } = await client
    .from("organization_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", actorUserId);

  if (error) {
    console.error("leaveOrganization error:", error);
    captureError(new Error("leaveOrganization failed"), {
      tags: { domain: "org", action: "org.leave", type: "org_leave_error" },
      extra: { organizationId, actorUserId },
      user: { id: actorUserId },
      level: "error",
    });
    return { success: false, error: "組織の退出に失敗しました。" };
  }

  await logActivity("leave_organization", {
    userId: actorUserId,
    organizationId,
  });

  captureEvent(
    "Org left",
    {
      tags: { domain: "org", action: "org.left" },
      extra: { organizationId, actorUserId },
    },
    "info",
  );

  return { success: true, error: null };
}

/**
 * オーナーを移譲（owner -> newOwner）
 * - 実行できるのは「現在のownerのみ」
 * - 移譲先は「既存メンバーのみ」
 * - 整合性のため、service_role（supabaseAdmin）を必須にする
 */
export async function transferOrganizationOwnership(
  organizationId: string,
  newOwnerUserId: string,
  actorUserId: string,
): Promise<{ success: boolean; error: string | null }> {
  if (!organizationId || !newOwnerUserId) {
    return { success: false, error: "パラメータが不正です。" };
  }
  if (newOwnerUserId === actorUserId) {
    return { success: false, error: "自分自身に移譲することはできません。" };
  }

  // ここは「確実な移譲」を優先し、service_role 必須にする
  if (!supabaseAdmin) {
    captureEvent(
      "Org transfer ownership denied (server not configured)",
      {
        tags: {
          domain: "org",
          action: "org.ownership.transfer.denied",
          reason: "server_not_configured",
        },
        extra: { organizationId, actorUserId, newOwnerUserId },
      },
      "warning",
    );
    return {
      success: false,
      error:
        "サーバー設定が未完了のためオーナー移譲できません（SUPABASE_SERVICE_ROLE_KEY を設定してください）。",
    };
  }

  // 現在のオーナー確認（organizations.owner_id を正とする）
  const { data: org, error: orgError } = await supabaseAdmin
    .from("organizations")
    .select("owner_id")
    .eq("id", organizationId)
    .maybeSingle();
  if (orgError || !org) {
    console.error("transferOwnership org fetch error:", orgError);
    captureError(new Error("transferOwnership org fetch failed"), {
      tags: { domain: "org", action: "org.ownership.transfer", type: "org_transfer_error" },
      extra: { organizationId, actorUserId, newOwnerUserId },
      user: { id: actorUserId },
      level: "error",
    });
    return { success: false, error: "組織が見つかりません。" };
  }
  const currentOwnerId = (org as { owner_id?: string | null }).owner_id ?? null;
  if (!currentOwnerId || currentOwnerId !== actorUserId) {
    captureEvent(
      "Org transfer ownership denied (permission)",
      {
        tags: {
          domain: "org",
          action: "org.ownership.transfer.denied",
          reason: "permission",
        },
        extra: { organizationId, actorUserId, currentOwnerId, newOwnerUserId },
      },
      "warning",
    );
    return { success: false, error: "オーナーのみ移譲できます。" };
  }

  // 移譲先がメンバーか確認
  const { data: targetMember, error: targetError } = await supabaseAdmin
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", newOwnerUserId)
    .maybeSingle();
  if (targetError) {
    console.error("transferOwnership target fetch error:", targetError);
    captureError(new Error("transferOwnership target fetch failed"), {
      tags: { domain: "org", action: "org.ownership.transfer", type: "org_transfer_error" },
      extra: { organizationId, actorUserId, newOwnerUserId },
      user: { id: actorUserId },
      level: "error",
    });
    return { success: false, error: "移譲先メンバーの確認に失敗しました。" };
  }
  if (!targetMember) {
    captureEvent(
      "Org transfer ownership denied (target not member)",
      {
        tags: {
          domain: "org",
          action: "org.ownership.transfer.denied",
          reason: "target_not_member",
        },
        extra: { organizationId, actorUserId, newOwnerUserId },
      },
      "warning",
    );
    return { success: false, error: "移譲先は組織メンバーである必要があります。" };
  }

  // ロール更新: 旧owner -> admin、移譲先 -> owner
  // NOTE: トランザクションではないが、最後に organizations.owner_id を更新して整合を確保する
  const { error: oldRoleError } = await supabaseAdmin
    .from("organization_members")
    .update({ role: "admin" })
    .eq("organization_id", organizationId)
    .eq("user_id", actorUserId);
  if (oldRoleError) {
    console.error("transferOwnership old role update error:", oldRoleError);
    captureError(new Error("transferOwnership old owner role update failed"), {
      tags: { domain: "org", action: "org.ownership.transfer", type: "org_transfer_error" },
      extra: { organizationId, actorUserId, newOwnerUserId },
      user: { id: actorUserId },
      level: "error",
    });
    return { success: false, error: "オーナー移譲に失敗しました（旧オーナーの更新）。" };
  }

  const { error: newRoleError } = await supabaseAdmin
    .from("organization_members")
    .update({ role: "owner" })
    .eq("organization_id", organizationId)
    .eq("user_id", newOwnerUserId);
  if (newRoleError) {
    console.error("transferOwnership new role update error:", newRoleError);
    // できる限り元に戻す
    await supabaseAdmin
      .from("organization_members")
      .update({ role: "owner" })
      .eq("organization_id", organizationId)
      .eq("user_id", actorUserId);
    captureError(new Error("transferOwnership new owner role update failed"), {
      tags: { domain: "org", action: "org.ownership.transfer", type: "org_transfer_error" },
      extra: { organizationId, actorUserId, newOwnerUserId },
      user: { id: actorUserId },
      level: "error",
    });
    return { success: false, error: "オーナー移譲に失敗しました（新オーナーの更新）。" };
  }

  const { error: ownerIdError } = await supabaseAdmin
    .from("organizations")
    .update({ owner_id: newOwnerUserId })
    .eq("id", organizationId);
  if (ownerIdError) {
    console.error("transferOwnership org owner_id update error:", ownerIdError);
    // できる限り元に戻す
    await supabaseAdmin
      .from("organization_members")
      .update({ role: "owner" })
      .eq("organization_id", organizationId)
      .eq("user_id", actorUserId);
    await supabaseAdmin
      .from("organization_members")
      .update({ role: (targetMember as { role?: OrganizationRole } | null)?.role ?? "member" })
      .eq("organization_id", organizationId)
      .eq("user_id", newOwnerUserId);
    captureError(new Error("transferOwnership organizations.owner_id update failed"), {
      tags: { domain: "org", action: "org.ownership.transfer", type: "org_transfer_error" },
      extra: { organizationId, actorUserId, newOwnerUserId },
      user: { id: actorUserId },
      level: "error",
    });
    return { success: false, error: "オーナー移譲に失敗しました（組織の更新）。" };
  }

  await logActivity("transfer_ownership", {
    userId: actorUserId,
    organizationId,
    metadata: { new_owner_user_id: newOwnerUserId },
  });

  captureEvent(
    "Org ownership transferred",
    {
      tags: { domain: "org", action: "org.ownership.transferred" },
      extra: { organizationId, actorUserId, newOwnerUserId },
    },
    "warning",
  );

  return { success: true, error: null };
}

// getRoleDisplayName / getRoleBadgeClass は organizationTypes から再利用
