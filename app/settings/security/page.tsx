import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getLocaleFromParam, type Locale } from "@/lib/i18n";

type SecuritySettingsPageProps = {
  searchParams?:
    | {
        lang?: string;
      }
    | Promise<{
        lang?: string;
      }>;
};

export default async function SecuritySettingsPage({
  searchParams,
}: SecuritySettingsPageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const locale: Locale = getLocaleFromParam(sp?.lang);
  const withLang = (href: string) => {
    if (locale !== "en") return href;
    if (href.includes("lang=en")) return href;
    if (href.includes("?")) return `${href}&lang=en`;
    return `${href}?lang=en`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-600">
              {locale === "en" ? "Security settings" : "セキュリティ設定"}
            </p>
          </div>
          <Link
            href={withLang("/settings")}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            {locale === "en" ? "← Back to settings" : "← 設定トップへ戻る"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* セキュリティチェックリスト */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            {locale === "en" ? "Security checklist" : "セキュリティチェックリスト"}
          </h2>
          <p className="mb-4 text-xs text-slate-600">
            {locale === "en"
              ? "Key security features currently enabled in DocuFlow. For deeper design and RLS policies, see "
              : "DocuFlow で現在有効になっている、主なセキュリティ機能の一覧です。詳細な設計や RLS ポリシーは "}
            <Link
              href="/docs/#/security"
              className="font-medium text-emerald-600 underline-offset-2 hover:underline"
            >
              Security Design
            </Link>
            {locale === "en" ? "." : " を参照してください。"}
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                ✓
              </span>
              <div>
                <p className="font-medium">
                  {locale === "en" ? "Authentication" : "認証"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {locale === "en"
                    ? "Supabase Auth (email/password + Google OAuth), cookie-based session."
                    : "Supabase Auth によるメール & パスワード / Google OAuth ログイン。Cookie ベースのセッション管理。"}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                ✓
              </span>
              <div>
                <p className="font-medium">RLS + RBAC</p>
                <p className="text-[11px] text-slate-500">
                  {locale === "en"
                    ? "Row Level Security on key tables + org roles (owner/admin/member)."
                    : "`documents` / `organizations` などの主要テーブルで Row Level Security を有効化。組織（owner / admin / member）ロールに基づいたアクセス制御。"}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                ✓
              </span>
              <div>
                <p className="font-medium">
                  {locale === "en" ? "Share links" : "共有リンク"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {locale === "en"
                    ? "Read-only links via UUID `share_token` (revocable; edits require auth)."
                    : "UUID ベースの `share_token` により閲覧専用リンクを発行。いつでも無効化可能で、編集は常に認証済みユーザーのみ。"}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                ✓
              </span>
              <div>
                <p className="font-medium">
                  {locale === "en" ? "Audit logs & notifications" : "監査ログ & 通知"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {locale === "en"
                    ? "Critical actions are recorded in `activity_logs`; comments/mentions show in the notification bell."
                    : "主要な操作は `activity_logs` に記録され、コメントやメンションは通知ベルから参照可能。"}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                ✓
              </span>
              <div>
                <p className="font-medium">
                  {locale === "en"
                    ? "Rate limiting & Web Vitals"
                    : "レートリミット & Web Vitals"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {locale === "en"
                    ? "Basic API rate limiting and a `/app/vitals` dashboard."
                    : "API には簡易レートリミットを実装し、`/app/vitals` ページでパフォーマンス指標を可視化。"}
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            {locale === "en" ? "Two-factor authentication (2FA)" : "2段階認証（2FA）"}
          </h2>
          <p className="text-xs text-slate-600">
            {locale === "en"
              ? "Planned: TOTP-based 2FA (e.g., Google Authenticator). Currently design-only."
              : "TOTP アプリ（Google Authenticator など）による 2FA 対応を想定しています。現在は UI の設計のみを行い、実装は今後の拡張として位置付けています。"}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-[11px] text-slate-700">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-[10px] text-white">
              🔒
            </span>
            {locale === "en"
              ? "Coming soon: TOTP-based 2FA"
              : "Coming soon: TOTP ベースの 2段階認証"}
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            {locale === "en" ? "SSO (Single Sign-On)" : "SSO（Single Sign-On）"}
          </h2>
          <p className="text-xs text-slate-600">
            {locale === "en"
              ? "Planned: SSO with IdPs like Google Workspace / Microsoft Entra ID. Designed to be enabled per organization."
              : "Google Workspace / Microsoft Entra ID などの IdP と連携した SSO 対応を想定しています。組織 (`organizations`) 単位で SSO を有効化する設計です。"}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-[11px] text-slate-700">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-[10px] text-white">
              🌐
            </span>
            {locale === "en"
              ? "Coming soon: Google Workspace / Entra ID SSO"
              : "Coming soon: Google Workspace / Entra ID SSO"}
          </div>
        </section>
      </main>
    </div>
  );
}




