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
      return "オーナー";
    case "admin":
      return "管理者";
    case "member":
      return "メンバー";
    default:
      return role;
  }
}

export function getRoleBadgeClass(role: OrganizationRole): string {
  switch (role) {
    case "owner":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "admin":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "member":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}




