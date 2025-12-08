import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabaseClient";
import type { Locale } from "@/lib/i18n";
import { getLocaleFromParam } from "@/lib/i18n";

type OrganizationRow = {
  id: string;
  name: string;
  plan: "free" | "pro" | "team";
  seat_limit: number | null;
  document_limit: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_email: string | null;
};

type BillingSettingsPageProps = {
  searchParams?: {
    lang?: string;
  };
};

export default async function BillingSettingsPage({
  searchParams,
}: BillingSettingsPageProps) {
  const locale: Locale = getLocaleFromParam(searchParams?.lang);

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    const redirectTarget =
      locale === "en" ? "/settings/billing?lang=en" : "/settings/billing";
    redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTarget)}`);
  }

  const { data: organizations } = await supabase
    .from("organizations")
    .select(
      "id, name, plan, seat_limit, document_limit, stripe_customer_id, stripe_subscription_id, billing_email",
    )
    .order("created_at", { ascending: true })
    .limit(5);

  const primaryOrg = (organizations ?? [])[0] as OrganizationRow | undefined;

  // Fetch usage metrics for the primary organization
  let documentCount = 0;
  let memberCount = 0;
  
  if (primaryOrg) {
    const [docsResult, membersResult] = await Promise.all([
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", primaryOrg.id),
      supabase
        .from("organization_members")
        .select("user_id", { count: "exact", head: true })
        .eq("organization_id", primaryOrg.id),
    ]);
    
    documentCount = docsResult.count ?? 0;
    memberCount = membersResult.count ?? 0;
  }

  const stripeConfigured =
    !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_PRO_MONTH;

  let subscriptionSummary:
    | {
        status: string;
        currentPeriodEnd: string;
      }
    | null = null;

  if (
    stripeConfigured &&
    primaryOrg?.stripe_subscription_id &&
    process.env.STRIPE_SECRET_KEY
  ) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-06-20",
      });
      const subscription = await stripe.subscriptions.retrieve(
        primaryOrg.stripe_subscription_id,
      );
      const currentPeriodEnd = new Date(
        subscription.current_period_end * 1000,
      ).toLocaleString(locale === "en" ? "en-US" : "ja-JP");

      subscriptionSummary = {
        status: subscription.status,
        currentPeriodEnd,
      };
    } catch (error) {
      console.warn("Failed to load Stripe subscription summary:", error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-600">
              {locale === "en" ? "Billing & plan settings" : "課金・プラン設定"}
            </p>
          </div>
          <Link
            href={locale === "en" ? "/settings?lang=en" : "/settings"}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            {locale === "en"
              ? "← Back to settings"
              : "← 設定トップへ戻る"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            {locale === "en" ? "Current plan" : "現在のプラン"}
          </h2>
          {!primaryOrg ? (
            <p className="text-xs text-slate-600">
              {locale === "en"
                ? "No organization has been created yet. Please create a team first from "
                : "まだ組織が作成されていません。まずは "}
              <Link
                href={
                  locale === "en"
                    ? "/settings/organizations?lang=en"
                    : "/settings/organizations"
                }
                className="font-medium text-emerald-600 underline-offset-2 hover:underline"
              >
                {locale === "en" ? "Organization settings" : "組織設定"}
              </Link>
              {locale === "en"
                ? "."
                : "からチームを作成してください。"}
            </p>
          ) : (
            <div className="space-y-3 text-xs text-slate-700">
              <p>
                {locale === "en" ? "Organization:" : "組織名:"}{" "}
                <span className="font-medium">{primaryOrg.name}</span>
              </p>
              <p>
                {locale === "en" ? "Plan:" : "プラン:"}{" "}
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800">
                  {primaryOrg.plan.toUpperCase()}
                </span>
              </p>
              {/* Usage Meters */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Member Usage Meter */}
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold text-slate-600">
                      {locale === "en" ? "Members" : "メンバー数"}
                    </p>
                    <span className="text-xs font-medium text-slate-900">
                      {memberCount} / {primaryOrg.seat_limit ?? "∞"}
                    </span>
                  </div>
                  {primaryOrg.seat_limit && (
                    <div className="relative h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          memberCount / primaryOrg.seat_limit > 0.9
                            ? "bg-red-500"
                            : memberCount / primaryOrg.seat_limit > 0.7
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(100, (memberCount / primaryOrg.seat_limit) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-slate-500">
                    {locale === "en"
                      ? primaryOrg.seat_limit
                        ? `${primaryOrg.seat_limit - memberCount} seats remaining`
                        : "Unlimited seats on this plan"
                      : primaryOrg.seat_limit
                      ? `残り ${primaryOrg.seat_limit - memberCount} 席`
                      : "このプランは席数無制限"}
                  </p>
                </div>

                {/* Document Usage Meter */}
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold text-slate-600">
                      {locale === "en" ? "Documents" : "ドキュメント数"}
                    </p>
                    <span className="text-xs font-medium text-slate-900">
                      {documentCount} / {primaryOrg.document_limit ?? "∞"}
                    </span>
                  </div>
                  {primaryOrg.document_limit && (
                    <div className="relative h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          documentCount / primaryOrg.document_limit > 0.9
                            ? "bg-red-500"
                            : documentCount / primaryOrg.document_limit > 0.7
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(100, (documentCount / primaryOrg.document_limit) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-slate-500">
                    {locale === "en"
                      ? primaryOrg.document_limit
                        ? `${primaryOrg.document_limit - documentCount} documents remaining`
                        : "Unlimited documents on this plan"
                      : primaryOrg.document_limit
                      ? `残り ${primaryOrg.document_limit - documentCount} 件`
                      : "このプランはドキュメント数無制限"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold text-slate-600">
                    {locale === "en"
                      ? "Billing email"
                      : "請求先メールアドレス"}
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    {primaryOrg.billing_email ??
                      (locale === "en"
                        ? "Managed in Stripe (entered at Checkout)"
                        : "Stripe 上で管理（Checkout で入力）")}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {locale === "en"
                      ? "The email entered in Stripe Checkout will receive billing notifications."
                      : "Stripe Checkout で入力したメールアドレスが請求通知の送付先になります。"}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold text-slate-600">
                    {locale === "en"
                      ? "Subscription status"
                      : "サブスクリプション状況"}
                  </p>
                  {subscriptionSummary ? (
                    <div className="mt-1 space-y-1 text-sm text-slate-900">
                      <p>
                        {locale === "en" ? "Status: " : "ステータス: "}
                        {subscriptionSummary.status}
                      </p>
                      <p>
                        {locale === "en"
                          ? "Current billing period ends: "
                          : "現在の請求期間の終了: "}
                        {subscriptionSummary.currentPeriodEnd}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-slate-900">
                      {locale === "en"
                        ? "There is no active subscription yet."
                        : "まだ有効なサブスクリプションはありません。"}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-slate-500">
                    {locale === "en"
                      ? "For detailed billing history, use the Stripe dashboard."
                      : "詳細な請求履歴は Stripe ダッシュボードから確認できます。"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-emerald-900">
            {locale === "en"
              ? "Upgrade to Pro / Team"
              : "Pro / Team プランへのアップグレード"}
          </h2>
          <p className="text-xs text-emerald-900">
            {locale === "en"
              ? "Designed with Stripe Checkout integration in mind. For details, see "
              : "Stripe Checkout 連携を前提とした設計になっています。詳細は "}
            <Link
              href="/docs/#/billing"
              className="font-medium underline underline-offset-2"
            >
              Billing ドキュメント
            </Link>
            {locale === "en" ? "." : " を参照してください。"}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <form
              action="/api/billing/create-checkout-session"
              method="post"
              className="inline"
            >
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                disabled={!stripeConfigured}
              >
                {locale === "en"
                  ? "Upgrade to Pro (Stripe Checkout)"
                  : "Pro にアップグレード（Stripe Checkout）"}
              </button>
            </form>
            {!stripeConfigured && (
              <span className="text-[11px] text-emerald-900">
                {locale === "en"
                  ? "Environment variables "
                  : "環境変数 "}
                <code>STRIPE_SECRET_KEY</code>,{" "}
                <code>STRIPE_PRICE_PRO_MONTH</code>
                {locale === "en"
                  ? " are not set, so this page works as a UI-only demo."
                  : " が未設定のため、現在は UI デモのみ有効です。"}
              </span>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}


