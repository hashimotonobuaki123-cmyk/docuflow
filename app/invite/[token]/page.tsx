import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { acceptInvitation, setActiveOrganization } from "@/lib/organizations";
import { Logo } from "@/components/Logo";
import { getPreferredLocale } from "@/lib/serverLocale";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function InviteAcceptPage({ params }: PageProps) {
  const { token } = await params;
  const locale = await getPreferredLocale();
  const withLang = (href: string) => {
    if (locale !== "en") return href;
    if (href.includes("lang=en")) return href;
    if (href.includes("?")) return `${href}&lang=en`;
    return `${href}?lang=en`;
  };

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;
  if (!userId) {
    const loginPath = locale === "en" ? "/en/auth/login" : "/auth/login";
    redirect(`${loginPath}?redirectTo=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const res = await acceptInvitation(token, userId);
  if (!res.success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <Logo />
            <Link
              href={withLang("/settings/organizations")}
              className="text-sm text-slate-600 hover:underline"
            >
              {locale === "en" ? "Go to organization settings" : "組織設定へ"}
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-900">
              {locale === "en"
                ? "Couldn't accept the invitation"
                : "招待を受け取れませんでした"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {res.error ??
                (locale === "en"
                  ? "Unknown error. Please try again."
                  : "不明なエラーです。もう一度お試しください。")}
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                href={withLang("/settings/organizations")}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {locale === "en" ? "Organization settings" : "組織設定へ"}
              </Link>
              <Link
                href={withLang("/app")}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {locale === "en" ? "Dashboard" : "ダッシュボードへ"}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (res.organizationId) {
    await setActiveOrganization(userId, res.organizationId);
    redirect(
      withLang(
        `/settings/organizations?org=${encodeURIComponent(res.organizationId)}`,
      ),
    );
  }

  redirect(withLang("/settings/organizations"));
}


