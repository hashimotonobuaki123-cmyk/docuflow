import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabaseClient";
import {
  getUserOrganizations,
  createOrganization,
  getOrganizationMembers,
  getUserRoleInOrganization,
  createInvitation,
} from "@/lib/organizations";
import {
  getRoleDisplayName,
  getRoleBadgeClass,
  OrganizationRole,
} from "@/lib/organizationTypes";
import type { Locale } from "@/lib/i18n";
import { getLocaleFromParam } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{
    action?: string;
    org?: string;
    lang?: string;
  }>;
};

// 組織作成アクション
async function createOrgAction(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value;
  if (!userId) {
    redirect("/auth/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  if (!name) {
    return;
  }

  const { organization, error } = await createOrganization(
    userId,
    name,
    slug || undefined
  );

  if (error) {
    console.error("createOrgAction error:", error);
    return;
  }

  if (organization) {
    // アクティブ組織をCookieに設定
    cookieStore.set("docuflow_active_org", organization.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  revalidatePath("/settings/organizations");
  redirect("/settings/organizations");
}

// 招待作成アクション
async function inviteAction(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value;
  if (!userId) {
    redirect("/auth/login");
  }

  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = (String(formData.get("role") ?? "member") as OrganizationRole);

  if (!organizationId || !email) {
    return;
  }

  await createInvitation(organizationId, email, role, userId);

  revalidatePath("/settings/organizations");
}

export default async function OrganizationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const action = params?.action;
  const selectedOrgId = params?.org;
  const locale: Locale = getLocaleFromParam(params?.lang);

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value;

  if (!userId) {
    redirect("/auth/login");
  }

  const memberships = await getUserOrganizations(userId);
  const organizations = memberships.map((m) => ({
    ...m.organization,
    role: m.role,
  }));

  // 選択された組織のメンバー一覧を取得
  let selectedOrg = null;
  let members: { user_id: string; role: OrganizationRole; created_at: string }[] = [];
  let userRole: OrganizationRole | null = null;
  let orgDocumentCount = 0;
  let orgActivityCount = 0;

  if (selectedOrgId) {
    selectedOrg = organizations.find((o) => o.id === selectedOrgId);
    if (selectedOrg) {
      members = await getOrganizationMembers(selectedOrgId);
      userRole = await getUserRoleInOrganization(userId, selectedOrgId);
      
      // 組織のドキュメント数を取得
      const { count: docCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", selectedOrgId);
      orgDocumentCount = docCount ?? 0;
      
      // 組織のアクティビティ数（直近30日）を取得
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: actCount } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());
      orgActivityCount = actCount ?? 0;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={locale === "en" ? "/app?lang=en" : "/"}
              className="hover:opacity-80 transition-opacity"
            >
              <Logo size="sm" />
            </Link>
            <span className="text-sm text-slate-500">
              {locale === "en" ? "Organization settings" : "組織設定"}
            </span>
          </div>
          <Link
            href={locale === "en" ? "/app?lang=en" : "/app"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>
              {locale === "en" ? "Back to dashboard" : "ダッシュボードへ戻る"}
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* 新規作成フォーム */}
        {action === "new" && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {locale === "en" ? "Create a new organization" : "新しい組織を作成"}
            </h2>
            <form action={createOrgAction} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  {locale === "en" ? "Organization name" : "組織名"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder={
                    locale === "en" ? "e.g. Acme Inc." : "例: 株式会社ABC"
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:ring"
                />
              </div>
              <div>
                <label
                  htmlFor="slug"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  {locale === "en"
                    ? "Slug (for URL, alphanumeric)"
                    : "スラッグ（URL用・英数字）"}
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  placeholder={
                    locale === "en" ? "e.g. acme-corp" : "例: abc-corp"
                  }
                  pattern="[a-z0-9-]+"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:ring"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {locale === "en"
                    ? "If empty, it will be generated automatically from the organization name."
                    : "空欄の場合、組織名から自動生成されます"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-400 transition-colors"
                >
                  {locale === "en" ? "Create" : "作成する"}
                </button>
                <Link
                  href={
                    locale === "en"
                      ? "/settings/organizations?lang=en"
                      : "/settings/organizations"
                  }
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  {locale === "en" ? "Cancel" : "キャンセル"}
                </Link>
              </div>
            </form>
          </section>
        )}

        {/* 組織一覧 */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {locale === "en"
                ? `Organizations you belong to (${organizations.length})`
                : `所属組織 (${organizations.length})`}
            </h2>
            {action !== "new" && (
              <Link
                href={
                  locale === "en"
                    ? "/settings/organizations?action=new&lang=en"
                    : "/settings/organizations?action=new"
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-400 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>
                  {locale === "en"
                    ? "Create new organization"
                    : "新しい組織を作成"}
                </span>
              </Link>
            )}
          </div>

          {organizations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🏢
              </div>
              <p className="mb-2 text-sm font-medium text-slate-900">
                {locale === "en"
                  ? "You don't belong to any organization yet."
                  : "まだ組織に所属していません"}
              </p>
              <p className="mb-4 text-xs text-slate-500">
                {locale === "en"
                  ? "Create an organization to start sharing documents with your team."
                  : "組織を作成して、チームでドキュメントを共有しましょう"}
              </p>
              <Link
                href={
                  locale === "en"
                    ? "/settings/organizations?action=new&lang=en"
                    : "/settings/organizations?action=new"
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-400 transition-colors"
              >
                <span>
                  {locale === "en"
                    ? "Create your first organization"
                    : "最初の組織を作成"}
                </span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {organizations.map((org) => (
                <Link
                  key={org.id}
                  href={`/settings/organizations?org=${org.id}`}
                  className={`group rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    selectedOrgId === org.id
                      ? "border-emerald-500 ring-2 ring-emerald-500/20"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-lg font-bold text-white">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {org.name}
                        </h3>
                  <p className="text-xs text-slate-500">@{org.slug}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${getRoleBadgeClass(
                        org.role
                      )}`}
                    >
                      {getRoleDisplayName(org.role)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 選択された組織の詳細 */}
        {selectedOrg && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-xl font-bold text-white">
                  {selectedOrg.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selectedOrg.name}
                  </h2>
                  <p className="text-xs text-slate-500">@{selectedOrg.slug}</p>
                </div>
              </div>
              <span
                className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getRoleBadgeClass(
                  selectedOrg.role
                )}`}
              >
                {locale === "en"
                  ? `You are ${getRoleDisplayName(selectedOrg.role)}`
                  : `あなたは ${getRoleDisplayName(selectedOrg.role)}`}
              </span>
            </div>

            {/* 使用量メーター */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {locale === "en" ? "Documents" : "ドキュメント"}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{orgDocumentCount}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg">
                    📄
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, (orgDocumentCount / 100) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {locale === "en" ? "No limit on Free plan" : "Free プランは無制限"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {locale === "en" ? "Members" : "メンバー"}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{members.length}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-lg">
                    👥
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-sky-500"
                      style={{ width: `${Math.min(100, (members.length / 10) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {locale === "en" ? "Up to 10 on Free plan" : "Free プランは 10 名まで"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {locale === "en" ? "Activity (30d)" : "アクティビティ (30日)"}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{orgActivityCount}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-lg">
                    📊
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-violet-500"
                      style={{ width: `${Math.min(100, (orgActivityCount / 500) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {locale === "en" ? "Actions in last 30 days" : "過去30日間の操作数"}
                  </p>
                </div>
              </div>
            </div>

            {/* メンバー一覧 */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                {locale === "en"
                  ? `Members (${members.length})`
                  : `メンバー (${members.length}人)`}
              </h3>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                        {member.user_id === userId ? "👤" : "🧑"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {member.user_id === userId
                            ? locale === "en"
                              ? "You"
                              : "あなた"
                            : locale === "en"
                            ? `User ${member.user_id.slice(0, 8)}...`
                            : `ユーザー ${member.user_id.slice(0, 8)}...`}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(member.created_at).toLocaleDateString(
                            locale === "en" ? "en-US" : "ja-JP",
                          )}{" "}
                          {locale === "en" ? "joined" : "から参加"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${getRoleBadgeClass(
                        member.role
                      )}`}
                    >
                      {getRoleDisplayName(member.role)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ロール権限の説明 */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                {locale === "en" ? "Role Permissions" : "ロールと権限"}
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-white p-3 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs">👑</span>
                    <span className="text-xs font-semibold text-emerald-700">Owner</span>
                  </div>
                  <ul className="space-y-1 text-[10px] text-slate-600">
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {locale === "en" ? "Delete organization" : "組織の削除"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {locale === "en" ? "Manage billing" : "課金設定の管理"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {locale === "en" ? "All admin permissions" : "全ての管理者権限"}
                    </li>
                  </ul>
                </div>
                <div className="rounded-lg bg-white p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs">⚙️</span>
                    <span className="text-xs font-semibold text-blue-700">Admin</span>
                  </div>
                  <ul className="space-y-1 text-[10px] text-slate-600">
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {locale === "en" ? "Invite members" : "メンバーの招待"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {locale === "en" ? "Remove members" : "メンバーの削除"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {locale === "en" ? "All member permissions" : "全てのメンバー権限"}
                    </li>
                  </ul>
                </div>
                <div className="rounded-lg bg-white p-3 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs">👤</span>
                    <span className="text-xs font-semibold text-slate-700">Member</span>
                  </div>
                  <ul className="space-y-1 text-[10px] text-slate-600">
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {locale === "en" ? "View all documents" : "ドキュメントの閲覧"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {locale === "en" ? "Create documents" : "ドキュメントの作成"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {locale === "en" ? "Comment & share" : "コメント・共有"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 招待フォーム（owner/adminのみ） */}
            {userRole && userRole !== "member" && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  {locale === "en" ? "Invite new members" : "新しいメンバーを招待"}
                </h3>
                <form action={inviteAction} className="flex gap-2">
                  <input type="hidden" name="organizationId" value={selectedOrg.id} />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={
                      locale === "en"
                        ? "Email address to invite"
                        : "招待するメールアドレス"
                    }
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:ring"
                  />
                  <select
                    name="role"
                    defaultValue="member"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="member">
                      {locale === "en" ? "Member" : "メンバー"}
                    </option>
                    {userRole === "owner" && (
                      <>
                        <option value="admin">
                          {locale === "en" ? "Admin" : "管理者"}
                        </option>
                        <option value="owner">
                          {locale === "en" ? "Owner" : "オーナー"}
                        </option>
                      </>
                    )}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-400 transition-colors"
                  >
                    {locale === "en" ? "Invite" : "招待"}
                  </button>
                </form>
                <p className="mt-2 text-xs text-slate-500">
                  {locale === "en"
                    ? "An invite link will be generated. When the recipient clicks it, they can join the organization."
                    : "招待リンクが生成され、相手がリンクをクリックすると組織に参加できます"}
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}




