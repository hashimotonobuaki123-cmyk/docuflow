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
  removeOrganizationMember,
  updateOrganizationMemberRole,
  deleteOrganization,
} from "@/lib/organizations";
import {
  getOrganizationSubscription,
  PLAN_LIMITS,
  PLAN_NAMES,
  type SubscriptionPlan,
} from "@/lib/subscription";
import { getSiteUrl } from "@/lib/getSiteUrl";
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
    inviteToken?: string;
    inviteError?: string;
    orgMsg?: string;
    orgError?: string;
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

  const res = await createInvitation(organizationId, email, role, userId);
  if (res.error || !res.invitation?.token) {
    redirect(
      `/settings/organizations?org=${encodeURIComponent(
        organizationId,
      )}&inviteError=${encodeURIComponent(res.error ?? "招待の作成に失敗しました。")}`,
    );
  }

  redirect(
    `/settings/organizations?org=${encodeURIComponent(
      organizationId,
    )}&inviteToken=${encodeURIComponent(res.invitation.token)}`,
  );
}

async function removeMemberAction(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value;
  if (!userId) {
    redirect("/auth/login");
  }

  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  if (!organizationId || !targetUserId) {
    redirect(`/settings/organizations?org=${encodeURIComponent(organizationId)}`);
  }

  const res = await removeOrganizationMember(organizationId, targetUserId, userId);
  if (!res.success) {
    redirect(
      `/settings/organizations?org=${encodeURIComponent(
        organizationId,
      )}&orgError=${encodeURIComponent(res.error ?? "操作に失敗しました。")}`,
    );
  }

  revalidatePath("/settings/organizations");
  redirect(
    `/settings/organizations?org=${encodeURIComponent(
      organizationId,
    )}&orgMsg=${encodeURIComponent("メンバーを削除しました。")}`,
  );
}

async function changeRoleAction(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value;
  if (!userId) {
    redirect("/auth/login");
  }

  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const newRole = String(formData.get("newRole") ?? "").trim() as
    | "admin"
    | "member";

  if (!organizationId || !targetUserId || (newRole !== "admin" && newRole !== "member")) {
    redirect(`/settings/organizations?org=${encodeURIComponent(organizationId)}`);
  }

  const res = await updateOrganizationMemberRole(
    organizationId,
    targetUserId,
    newRole,
    userId,
  );
  if (!res.success) {
    redirect(
      `/settings/organizations?org=${encodeURIComponent(
        organizationId,
      )}&orgError=${encodeURIComponent(res.error ?? "操作に失敗しました。")}`,
    );
  }

  revalidatePath("/settings/organizations");
  redirect(
    `/settings/organizations?org=${encodeURIComponent(
      organizationId,
    )}&orgMsg=${encodeURIComponent("ロールを更新しました。")}`,
  );
}

async function deleteOrganizationAction(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value;
  if (!userId) {
    redirect("/auth/login");
  }

  const organizationId = String(formData.get("organizationId") ?? "").trim();
  if (!organizationId) {
    redirect("/settings/organizations");
  }

  const res = await deleteOrganization(organizationId, userId);
  if (!res.success) {
    redirect(
      `/settings/organizations?org=${encodeURIComponent(
        organizationId,
      )}&orgError=${encodeURIComponent(res.error ?? "削除に失敗しました。")}`,
    );
  }

  // 削除した組織がアクティブならCookieを消す
  cookieStore.delete("docuflow_active_org");

  revalidatePath("/settings/organizations");
  redirect(
    `/settings/organizations?orgMsg=${encodeURIComponent("組織を削除しました。")}`,
  );
}

export default async function OrganizationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const action = params?.action;
  const selectedOrgId = params?.org;
  const locale: Locale = getLocaleFromParam(params?.lang);
  const inviteToken = params?.inviteToken;
  const inviteError = params?.inviteError;
  const orgMsg = params?.orgMsg;
  const orgError = params?.orgError;

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
  let selectedOrgPlan: SubscriptionPlan = "free";
  let selectedOrgLimits = PLAN_LIMITS.free;

  if (selectedOrgId) {
    selectedOrg = organizations.find((o) => o.id === selectedOrgId);
    if (selectedOrg) {
      members = await getOrganizationMembers(selectedOrgId);
      userRole = await getUserRoleInOrganization(userId, selectedOrgId);
      const orgSub = await getOrganizationSubscription(selectedOrgId);
      selectedOrgPlan = orgSub?.plan ?? "free";
      selectedOrgLimits = PLAN_LIMITS[selectedOrgPlan];
      
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
              href={"/"}
              className="hover:opacity-80 transition-opacity"
            >
              <Logo size="sm" />
            </Link>
            <span className="text-sm text-slate-500">
              {"組織設定"}
            </span>
          </div>
          <Link
            href={"/app"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>
              {"ダッシュボードへ戻る"}
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {(orgError || orgMsg) && (
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              お知らせ
            </h2>
            {orgError ? (
              <p className="mt-2 text-sm text-rose-600">
                {orgError}
              </p>
            ) : (
              <p className="mt-2 text-sm text-emerald-700">
                {orgMsg}
              </p>
            )}
          </section>
        )}

        {(inviteError || inviteToken) && (
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              招待リンク
            </h2>
            {inviteError ? (
              <p className="mt-2 text-sm text-rose-600">
                {inviteError}
              </p>
            ) : (
              <>
                <p className="mt-2 text-xs text-slate-600">
                  下のURLをコピーして、招待したい人に送ってください（7日で期限切れ）。
                </p>
                <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[12px] text-slate-800">
                  {`${getSiteUrl()}/invite/${inviteToken}`}
                </p>
              </>
            )}
          </section>
        )}

        {/* 新規作成フォーム */}
        {action === "new" && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {"新しい組織を作成"}
            </h2>
            <form action={createOrgAction} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  {"組織名"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="例: 株式会社ABC"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:ring"
                />
              </div>
              <div>
                <label
                  htmlFor="slug"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  {"スラッグ（URL用・英数字）"}
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  placeholder="例: abc-corp"
                  pattern="[a-z0-9-]+"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:ring"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {"空欄の場合、組織名から自動生成されます"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-400 transition-colors"
                >
                  {"作成する"}
                </button>
                <Link
                  href="/settings/organizations"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  {"キャンセル"}
                </Link>
              </div>
            </form>
          </section>
        )}

        {/* 組織一覧 */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {`所属組織 (${organizations.length})`}
            </h2>
            {action !== "new" && (
              <Link
                href="/settings/organizations?action=new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-400 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>
                  {"新しい組織を作成"}
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
                {"まだ組織に所属していません"}
              </p>
              <p className="mb-4 text-xs text-slate-500">
                {"組織を作成して、チームでドキュメントを共有しましょう"}
              </p>
              <Link
                href="/settings/organizations?action=new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-400 transition-colors"
              >
                <span>
                  {"最初の組織を作成"}
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
                {`あなたは ${getRoleDisplayName(selectedOrg.role)}`}
              </span>
            </div>

            {/* 使用量メーター */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              {(() => {
                const planName = PLAN_NAMES[selectedOrgPlan][locale];
                const docLimit = selectedOrgLimits.documentLimit;
                const seatLimit = selectedOrgLimits.seatLimit;
                const docPercent =
                  docLimit === null
                    ? 100
                    : Math.min(100, (orgDocumentCount / Math.max(1, docLimit)) * 100);
                const seatPercent =
                  seatLimit === null
                    ? 100
                    : Math.min(100, (members.length / Math.max(1, seatLimit)) * 100);

                return (
                  <>
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {"ドキュメント"}
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
                      style={{ width: `${docPercent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {docLimit === null
                      ? `${planName}プラン: 無制限`
                      : `${planName}プラン: ${orgDocumentCount.toLocaleString("ja-JP")}/${docLimit.toLocaleString("ja-JP")} 件`}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {"メンバー"}
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
                      style={{ width: `${seatPercent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {seatLimit === null
                      ? `${planName}プラン: 無制限`
                      : `${planName}プラン: ${members.length.toLocaleString("ja-JP")}/${seatLimit.toLocaleString("ja-JP")} 人`}
                  </p>
                </div>
              </div>
                  </>
                );
              })()}

              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {"アクティビティ (30日)"}
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
                    {"過去30日間の操作数"}
                  </p>
                </div>
              </div>
            </div>

            {/* メンバー一覧 */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                {`メンバー (${members.length}人)`}
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
                          {member.user_id === userId ? "あなた" : `ユーザー ${member.user_id.slice(0, 8)}...`}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(member.created_at).toLocaleDateString("ja-JP")}{" "}
                          {"から参加"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${getRoleBadgeClass(
                          member.role
                        )}`}
                      >
                        {getRoleDisplayName(member.role)}
                      </span>

                      {/* Owner: promote/demote/remove (owner不可) */}
                      {userRole === "owner" &&
                        member.role !== "owner" &&
                        member.user_id !== userId && (
                        <>
                          {member.role === "member" ? (
                            <form action={changeRoleAction}>
                              <input type="hidden" name="organizationId" value={selectedOrg.id} />
                              <input type="hidden" name="targetUserId" value={member.user_id} />
                              <input type="hidden" name="newRole" value="admin" />
                              <button
                                type="submit"
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                              >
                                管理者にする
                              </button>
                            </form>
                          ) : (
                            <form action={changeRoleAction}>
                              <input type="hidden" name="organizationId" value={selectedOrg.id} />
                              <input type="hidden" name="targetUserId" value={member.user_id} />
                              <input type="hidden" name="newRole" value="member" />
                              <button
                                type="submit"
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                              >
                                メンバーに戻す
                              </button>
                            </form>
                          )}

                          <form action={removeMemberAction}>
                            <input type="hidden" name="organizationId" value={selectedOrg.id} />
                            <input type="hidden" name="targetUserId" value={member.user_id} />
                            <button
                              type="submit"
                              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100"
                            >
                              削除
                            </button>
                          </form>
                        </>
                      )}

                      {/* Admin: remove member only */}
                      {userRole === "admin" &&
                        member.role === "member" &&
                        member.user_id !== userId && (
                        <form action={removeMemberAction}>
                          <input type="hidden" name="organizationId" value={selectedOrg.id} />
                          <input type="hidden" name="targetUserId" value={member.user_id} />
                          <button
                            type="submit"
                            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100"
                          >
                            削除
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ロール権限の説明 */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                {"ロールと権限"}
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
                      {"組織の削除"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {"課金設定の管理"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {"全ての管理者権限"}
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
                      {"メンバーの招待"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {"メンバーの削除"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {"全てのメンバー権限"}
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
                      {"ドキュメントの閲覧"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {"ドキュメントの作成"}
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-emerald-500">✓</span>
                      {"コメント・共有"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 招待フォーム（owner/adminのみ） */}
            {userRole && userRole !== "member" && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  {"新しいメンバーを招待"}
                </h3>
                <form action={inviteAction} className="flex gap-2">
                  <input type="hidden" name="organizationId" value={selectedOrg.id} />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="招待するメールアドレス"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 focus:ring"
                  />
                  <select
                    name="role"
                    defaultValue="member"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="member">
                      {"メンバー"}
                    </option>
                    {userRole === "owner" && (
                      <>
                        <option value="admin">
                          {"管理者"}
                        </option>
                        <option value="owner">
                          {"オーナー"}
                        </option>
                      </>
                    )}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-400 transition-colors"
                  >
                    {"招待"}
                  </button>
                </form>
                <p className="mt-2 text-xs text-slate-500">
                  {"招待リンクが生成され、相手がリンクをクリックすると組織に参加できます"}
                </p>
              </div>
            )}

            {/* 危険な操作（ownerのみ） */}
            {userRole === "owner" && (
              <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <h3 className="text-sm font-semibold text-rose-800">
                  危険な操作
                </h3>
                <p className="mt-1 text-xs text-rose-700">
                  組織を削除すると、メンバー・招待・（組織の）データ参照に影響します。元に戻せません。
                </p>
                <form action={deleteOrganizationAction} className="mt-3">
                  <input type="hidden" name="organizationId" value={selectedOrg.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                  >
                    組織を削除する
                  </button>
                </form>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}




