import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabaseClient";
import {
  getPersonalSubscription,
  getOrganizationSubscription,
  getEffectivePlan,
} from "@/lib/subscription";
import { getActiveOrganizationId } from "@/lib/organizations";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { PaymentMethodsSection } from "./PaymentMethodsSection";
import { InvoicesSection } from "./InvoicesSection";

type OrganizationRow = {
  id: string;
  name: string;
  plan: "free" | "pro" | "team" | "enterprise";
  seat_limit: number | null;
  document_limit: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_email: string | null;
  subscription_status?: string | null;
  current_period_end?: string | null;
};

export default async function BillingSettingsPage() {

  const locale: Locale = "ja";

  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    const redirectTarget =
      "/settings/billing";
    redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTarget)}`);
  }

  // 個人ユーザーのプラン情報を取得
  const personalSub = await getPersonalSubscription(userId);
  
  // アクティブな組織を取得
  const activeOrgId = await getActiveOrganizationId(userId);
  const orgSub = activeOrgId
    ? await getOrganizationSubscription(activeOrgId)
    : null;

  // 有効なプラン（個人 or 組織）を取得
  const { plan: effectivePlan, type: subscriptionType } =
    await getEffectivePlan(userId, activeOrgId);

  const { data: organizations } = await supabase
    .from("organizations")
    .select(
      "id, name, plan, seat_limit, document_limit, stripe_customer_id, stripe_subscription_id, billing_email, subscription_status, current_period_end",
    )
    .order("created_at", { ascending: true })
    .limit(5);

  const primaryOrg = (organizations ?? [])[0] as OrganizationRow | undefined;
  const activeOrg = (
    (organizations ?? []) as OrganizationRow[]
  ).find((o) => o.id === activeOrgId) ?? primaryOrg;

  // Fetch usage metrics for the primary organization
  let documentCount = 0;
  let memberCount = 0;
  
  if (activeOrg) {
    const [docsResult, membersResult] = await Promise.all([
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", activeOrg.id),
      supabase
        .from("organization_members")
        .select("user_id", { count: "exact", head: true })
        .eq("organization_id", activeOrg.id),
    ]);
    
    documentCount = docsResult.count ?? 0;
    memberCount = membersResult.count ?? 0;
  }

  const stripeConfig = {
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
    pro: !!process.env.STRIPE_PRICE_PRO_MONTH,
    team: !!process.env.STRIPE_PRICE_TEAM_MONTH,
    enterprise: !!process.env.STRIPE_PRICE_ENTERPRISE_MONTH,
  } as const;

  // Stripe の基本設定（キー/サイトURL）が揃っているか
  const stripeBaseConfigured = stripeConfig.hasSecretKey && stripeConfig.hasSiteUrl;
  // いずれかの有料プランが設定されていれば「Stripe設定は一応OK」とみなす
  const stripeConfigured =
    stripeBaseConfigured && (stripeConfig.pro || stripeConfig.team || stripeConfig.enterprise);

  let subscriptionSummary:
    | {
        status: string;
        currentPeriodEnd: string;
      }
    | null = null;

  const subscriptionIdForSummary =
    subscriptionType === "organization"
      ? (orgSub?.stripeSubscriptionId ?? activeOrg?.stripe_subscription_id ?? null)
      : personalSub.stripeSubscriptionId;

  if (
    stripeConfigured &&
    subscriptionIdForSummary &&
    process.env.STRIPE_SECRET_KEY
  ) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-06-20",
      });
      const subscription = await stripe.subscriptions.retrieve(
        subscriptionIdForSummary,
      );
      const currentPeriodEnd = new Date(
        subscription.current_period_end * 1000,
      ).toLocaleString("ja-JP");

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
              {"課金・プラン設定"}
            </p>
          </div>
          <Link
            href={"/settings"}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            {"← 設定トップへ戻る"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {!stripeConfigured && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-amber-900">
              {"Stripe の設定が未完了です"}
            </h2>
            <p className="mt-1 text-xs text-amber-800">
              {"課金（アップグレード）を有効にするには、Vercel の環境変数が揃っている必要があります。"}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-900">
              {!stripeConfig.hasSecretKey && (
                <li>{"STRIPE_SECRET_KEY が未設定です（sk_test_...）"}</li>
              )}
              {!stripeConfig.hasSiteUrl && (
                <li>{"NEXT_PUBLIC_SITE_URL が未設定です（https://...）"}</li>
              )}
              {stripeBaseConfigured && !stripeConfig.pro && !stripeConfig.team && !stripeConfig.enterprise && (
                <li>
                  {
                    "プラン価格IDが未設定です（例: STRIPE_PRICE_TEAM_MONTH / STRIPE_PRICE_PRO_MONTH）"
                  }
                </li>
              )}
              <li className="text-amber-800">
                {
                  "設定後は Vercel の Deployments から Redeploy してください（環境変数の反映が必要です）。"
                }
              </li>
            </ul>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            {"現在のプラン"}
          </h2>
          <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <span className="font-semibold text-slate-900">{"いま有効な課金対象: "}</span>
            {subscriptionType === "organization" ? (
              <span>
                {"組織"}
                {activeOrg?.name ? `（${activeOrg.name}）` : ""}
              </span>
            ) : (
              <span>{"個人"}</span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Personal */}
            <div
              className={`rounded-xl border p-4 ${
                subscriptionType === "personal"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-xs font-semibold text-slate-900">{"個人プラン"}</p>
              <p className="mt-2 text-xs text-slate-700">
                {"プラン: "}
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800">
                  {personalSub.plan.toUpperCase()}
                </span>
              </p>
              <p className="mt-2 text-[11px] text-slate-600">
                {"ステータス: "}
                <span className="font-medium text-slate-900">
                  {personalSub.subscriptionStatus ?? "—"}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                {"請求期間終了: "}
                <span className="font-medium text-slate-900">
                  {personalSub.currentPeriodEnd
                    ? new Date(personalSub.currentPeriodEnd).toLocaleString("ja-JP")
                    : "—"}
                </span>
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                {
                  "※ 今回の Checkout が type=personal の場合、こちら（個人プラン）が更新されます。"
                }
              </p>
            </div>

            {/* Organization */}
            <div
              className={`rounded-xl border p-4 ${
                subscriptionType === "organization"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-xs font-semibold text-slate-900">{"組織プラン"}</p>
              {!activeOrg ? (
                <p className="mt-2 text-xs text-slate-600">
                  {"組織が未作成です。"}
                  <Link
                    href={"/settings/organizations"}
                    className="ml-1 font-medium text-emerald-600 underline-offset-2 hover:underline"
                  >
                    {"組織設定へ"}
                  </Link>
                </p>
              ) : (
                <div className="mt-2 space-y-2 text-xs text-slate-700">
                  <p>
                    {"組織名: "}
                    <span className="font-medium text-slate-900">{activeOrg.name}</span>
                  </p>
                  <p>
                    {"プラン: "}
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800">
                      {activeOrg.plan.toUpperCase()}
                    </span>
                  </p>

                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {/* Member Usage */}
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-slate-600">
                          {"メンバー数"}
                        </p>
                        <span className="text-xs font-medium text-slate-900">
                          {memberCount} / {activeOrg.seat_limit ?? "∞"}
                        </span>
                      </div>
                      {activeOrg.seat_limit ? (
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              memberCount / activeOrg.seat_limit > 0.9
                                ? "bg-red-500"
                                : memberCount / activeOrg.seat_limit > 0.7
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (memberCount / activeOrg.seat_limit) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">{"無制限"}</p>
                      )}
                    </div>

                    {/* Document Usage */}
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-slate-600">
                          {"ドキュメント数"}
                        </p>
                        <span className="text-xs font-medium text-slate-900">
                          {documentCount} / {activeOrg.document_limit ?? "∞"}
                        </span>
                      </div>
                      {activeOrg.document_limit ? (
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              documentCount / activeOrg.document_limit > 0.9
                                ? "bg-red-500"
                                : documentCount / activeOrg.document_limit > 0.7
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (documentCount / activeOrg.document_limit) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">{"無制限"}</p>
                      )}
                      <p className="mt-2 text-[11px] text-slate-500">
                        {activeOrg.document_limit
                          ? `残り ${Math.max(0, activeOrg.document_limit - documentCount)} 件`
                          : "このプランはドキュメント数無制限"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold text-slate-600">
                {"請求先メールアドレス"}
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {subscriptionType === "organization"
                  ? (activeOrg?.billing_email ?? "Stripe 上で管理（Checkout で入力）")
                  : (personalSub.billingEmail ?? "Stripe 上で管理（Checkout で入力）")}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {"Stripe Checkout で入力したメールアドレスが請求通知の送付先になります。"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold text-slate-600">
                {"サブスクリプション状況"}
              </p>
              {subscriptionSummary ? (
                <div className="mt-1 space-y-1 text-sm text-slate-900">
                  <p>
                    {"ステータス: "}
                    {subscriptionSummary.status}
                  </p>
                  <p>
                    {"現在の請求期間の終了:"}
                    {subscriptionSummary.currentPeriodEnd}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-900">
                  {"まだ有効なサブスクリプションはありません。"}
                </p>
              )}
              <p className="mt-1 text-[11px] text-slate-500">
                {"詳細な請求履歴は Stripe ダッシュボードから確認できます。"}
              </p>
            </div>
          </div>
        </section>

        {/* プラン選択セクション */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            {"利用可能なプラン"}
          </h2>
          <p className="mb-4 text-xs text-slate-600">
            {"ニーズに合わせてプランを選択できます。いつでもアップグレードまたはダウングレード可能です。"}
          </p>
          <SubscriptionPlans
            currentPlan={effectivePlan}
            subscriptionType={subscriptionType}
            locale={locale}
            stripeConfig={stripeConfig}
          />
        </section>

        {/* 支払い方法セクション */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <PaymentMethodsSection
            subscriptionType={subscriptionType}
            locale={locale}
          />
        </section>

        {/* 請求履歴セクション */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <InvoicesSection
            subscriptionType={subscriptionType}
            locale={locale}
          />
        </section>

        {/* Billing Portal セクション */}
        {(personalSub.stripeCustomerId || activeOrg?.stripe_customer_id) && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">
              {"サブスクリプション管理"}
            </h2>
            <p className="mb-4 text-xs text-slate-600">
              {"Stripe Customer Portal から支払い方法の更新、請求履歴の確認、サブスクリプションの管理ができます。"}
            </p>
            <form
              action="/api/billing/create-portal-session"
              method="post"
              className="inline"
            >
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
              >
                {"請求ポータルを開く"}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}


