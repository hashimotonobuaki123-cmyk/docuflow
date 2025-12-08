export type OrganizationRole = "owner" | "admin" | "member";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export function getRoleDisplayName(role: OrganizationRole): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "member":
      return "Member";
    default:
      return role;
  }
}

export function getRoleBadgeClass(role: OrganizationRole): string {
  switch (role) {
    case "owner":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "admin":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "member":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

/**
 * 指定されたロールがメンバー管理権限を持つかどうかを判定
 */
export function canManageMembers(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}

/**
 * 指定されたロールが組織を削除できるかどうかを判定
 */
export function canDeleteOrganization(role: OrganizationRole): boolean {
  return role === "owner";
}

/**
 * ロール階層の比較（owner > admin > member）
 * 自分より低いロールのみ変更可能
 */
export function canChangeRole(
  actorRole: OrganizationRole,
  targetRole: OrganizationRole
): boolean {
  const hierarchy: Record<OrganizationRole, number> = {
    owner: 3,
    admin: 2,
    member: 1,
  };
  return hierarchy[actorRole] > hierarchy[targetRole];
}






