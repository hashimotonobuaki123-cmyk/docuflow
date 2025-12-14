/**
 * 組織管理ユーティリティ
 *
 * - 所属組織一覧の取得
 * - アクティブな組織IDの取得・設定（Cookie管理）
 * - 組織の作成・招待
 */

import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import {
  OrganizationRole,
  Organization,
  getRoleDisplayName,
  getRoleBadgeClass,
} from "@/lib/organizationTypes";
import { canAddMember } from "@/lib/subscription";
import type { Locale } from "@/lib/i18n";

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

  const { data, error } = await supabase
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
  organizationId: string
): Promise<void> {
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
  // slugが未指定の場合、nameからslugを生成
  const orgSlug =
    slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    `org-${Date.now()}`;

  // 組織を作成
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name, slug: orgSlug })
    .select()
    .single();

  if (orgError) {
    console.error("createOrganization org error:", orgError);
    return { organization: null, error: "組織の作成に失敗しました。" };
  }

  // 作成者をownerとして追加
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: userId,
      role: "owner",
    });

  if (memberError) {
    console.error("createOrganization member error:", memberError);
    // 組織は作成されたがメンバー追加に失敗した場合、組織も削除
    await supabase.from("organizations").delete().eq("id", org.id);
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  // 招待者のロールを確認（owner/adminのみ招待可能）
  const inviterRole = await getUserRoleInOrganization(invitedBy, organizationId);
  if (!inviterRole || inviterRole === "member") {
    return { invitation: null, error: "招待する権限がありません。" };
  }

  // adminはmemberのみ招待可能
  if (inviterRole === "admin" && role !== "member") {
    return { invitation: null, error: "管理者はメンバーのみ招待できます。" };
  }

  // トークン生成（UUID）
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7日後

  const { data, error } = await supabase
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
    return { invitation: null, error: "招待の作成に失敗しました。" };
  }

  return { invitation: data as OrganizationInvitation, error: null };
}

/**
 * 招待を受諾
 */
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<{ success: boolean; error: string | null; organizationId?: string }> {
  // 招待を取得
  const { data: invitation, error: fetchError } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .single();

  if (fetchError || !invitation) {
    return { success: false, error: "招待が見つかりません。" };
  }

  // 有効期限チェック
  if (new Date(invitation.expires_at) < new Date()) {
    return { success: false, error: "招待の有効期限が切れています。" };
  }

  // すでにメンバーなら成功扱い（安全・冪等）
  const { data: existingMember } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", invitation.organization_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (existingMember?.id) {
    await supabase
      .from("organization_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);
    return { success: true, error: null, organizationId: invitation.organization_id };
  }

  // プラン制限チェック（デフォルトは日本語）
  const limitCheck = await canAddMember(invitation.organization_id, "ja");
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason || "メンバー数の上限に達しています。" };
  }

  // メンバーとして追加
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: invitation.organization_id,
      user_id: userId,
      role: invitation.role,
    });

  if (memberError) {
    console.error("acceptInvitation member error:", memberError);
    // unique制約違反などは成功扱いに寄せる（冪等）
    const msg = (memberError as { message?: string } | null)?.message ?? "";
    if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
      await supabase
        .from("organization_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);
      return { success: true, error: null, organizationId: invitation.organization_id };
    }
    return { success: false, error: "メンバー登録に失敗しました。" };
  }

  // 招待を受諾済みに更新
  await supabase
    .from("organization_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

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
  const actorRole = await getUserRoleInOrganization(actorUserId, organizationId);
  if (!actorRole || actorRole === "member") {
    return { success: false, error: "メンバーを管理する権限がありません。" };
  }

  if (targetUserId === actorUserId) {
    return { success: false, error: "自分自身を削除することはできません。" };
  }

  const { data: target, error: targetError } = await supabase
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
    return { success: false, error: "オーナーは削除できません。" };
  }

  if (actorRole === "admin" && targetRole !== "member") {
    return { success: false, error: "管理者はメンバーのみ削除できます。" };
  }

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", targetUserId);

  if (error) {
    console.error("removeOrganizationMember delete error:", error);
    return { success: false, error: "メンバーの削除に失敗しました。" };
  }

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
  const actorRole = await getUserRoleInOrganization(actorUserId, organizationId);
  if (actorRole !== "owner") {
    return { success: false, error: "ロールを変更する権限がありません。" };
  }

  // 自分自身のownerロールは落とさない（事故防止）
  if (targetUserId === actorUserId) {
    return { success: false, error: "自分自身のロールは変更できません。" };
  }

  const { data: target, error: targetError } = await supabase
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
    return { success: false, error: "オーナーのロールは変更できません。" };
  }

  const { error } = await supabase
    .from("organization_members")
    .update({ role: newRole })
    .eq("organization_id", organizationId)
    .eq("user_id", targetUserId);

  if (error) {
    console.error("updateOrganizationMemberRole update error:", error);
    return { success: false, error: "ロール変更に失敗しました。" };
  }

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
  const actorRole = await getUserRoleInOrganization(actorUserId, organizationId);
  if (actorRole !== "owner") {
    return { success: false, error: "組織を削除する権限がありません。" };
  }

  const { error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", organizationId);

  if (error) {
    console.error("deleteOrganization error:", error);
    return { success: false, error: "組織の削除に失敗しました。" };
  }

  return { success: true, error: null };
}

// getRoleDisplayName / getRoleBadgeClass は organizationTypes から再利用
