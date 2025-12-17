"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  PLAN_NAMES,
  PLAN_DESCRIPTIONS,
  PLAN_LIMITS,
  type SubscriptionPlan,
} from "@/lib/subscription";

interface SubscriptionPlansProps {
  currentPlan: SubscriptionPlan;
  subscriptionType: "personal" | "organization";
  locale: Locale;
  stripeConfig: {
    hasSecretKey: boolean;
    hasSiteUrl: boolean;
    pro: boolean;
    team: boolean;
    enterprise: boolean;
  };
  stripePlanPrices?: Partial<
    Record<
      SubscriptionPlan,
      {
        amount: number | null;
        currency: string | null;
        interval: "day" | "week" | "month" | "year" | null;
        intervalCount: number | null;
      }
    >
  >;
}

export function SubscriptionPlans({
  currentPlan,
  subscriptionType,
  locale,
  stripeConfig,
  stripePlanPrices,
}: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (plan === currentPlan || plan === "free") {
      return;
    }

    setLoading(plan);

    try {
      const response = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          type: subscriptionType,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.assign(data.url);
      } else {
        alert(
          data?.error
            ? `チェックアウトセッションの作成に失敗しました: ${data.error}`
            : "チェックアウトセッションの作成に失敗しました",
        );
        setLoading(null);
      }
    } catch (error) {
      console.error("Failed to upgrade:", error);
      alert(
        "エラーが発生しました",
      );
      setLoading(null);
    }
  };

  const plans: SubscriptionPlan[] = ["free", "pro", "team", "enterprise"];
  const baseConfigured = stripeConfig.hasSecretKey && stripeConfig.hasSiteUrl;

  const isPlanConfigured = (plan: SubscriptionPlan) => {
    if (plan === "free") return true;
    if (!baseConfigured) return false;
    if (plan === "pro") return stripeConfig.pro;
    if (plan === "team") return stripeConfig.team;
    if (plan === "enterprise") return stripeConfig.enterprise;
    return false;
  };

  const missingPlanEnvKey = (plan: SubscriptionPlan): string | null => {
    if (plan === "pro") return stripeConfig.pro ? null : "STRIPE_PRICE_PRO_MONTH";
    if (plan === "team") return stripeConfig.team ? null : "STRIPE_PRICE_TEAM_MONTH";
    if (plan === "enterprise")
      return stripeConfig.enterprise ? null : "STRIPE_PRICE_ENTERPRISE_MONTH";
    return null;
  };

  const formatRecurringLabel = (p: {
    interval: "day" | "week" | "month" | "year" | null;
    intervalCount: number | null;
  }) => {
    if (!p.interval) return "";
    const count = p.intervalCount && p.intervalCount > 1 ? p.intervalCount : 1;
    const unit =
      p.interval === "day"
        ? "日"
        : p.interval === "week"
          ? "週"
          : p.interval === "month"
            ? "月"
            : "年";
    return count === 1 ? `/${unit}` : `/${count}${unit}`;
  };

  const formatCurrency = (currency: string, amount: number) => {
    try {
      // Stripe の unit_amount は最小通貨単位（例: USDならセント）なので、通貨の小数桁に合わせて正規化する
      const exp = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).resolvedOptions().maximumFractionDigits ?? 2;
      const major = amount / Math.pow(10, exp);
      return new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(major);
    } catch {
      // fallback
      return `${amount.toLocaleString()} ${currency.toUpperCase()}`;
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => {
        const limits = PLAN_LIMITS[plan];
        const isCurrent = plan === currentPlan;
        const isEnterprise = plan === "enterprise";
        const planConfigured = isPlanConfigured(plan);

        return (
          <div
            key={plan}
            className={`rounded-xl border-2 p-5 ${
              isCurrent
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {PLAN_NAMES[plan][locale]}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {PLAN_DESCRIPTIONS[plan][locale]}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">
                  {plan === "free"
                    ? "無料"
                    : plan === "enterprise"
                      ? "お問合せ"
                      : stripePlanPrices?.[plan]?.amount != null &&
                          stripePlanPrices?.[plan]?.currency
                        ? formatCurrency(
                            stripePlanPrices[plan]!.currency!,
                            stripePlanPrices[plan]!.amount!,
                          )
                        : "価格未設定"}
                </span>
                {plan !== "free" &&
                  plan !== "enterprise" &&
                  stripePlanPrices?.[plan]?.interval && (
                  <span className="text-xs text-slate-500">
                    {formatRecurringLabel({
                      interval: stripePlanPrices[plan]!.interval!,
                      intervalCount: stripePlanPrices[plan]!.intervalCount ?? 1,
                    })}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  {limits.documentLimit === null
                    ? "ドキュメント数無制限"
                    : `${limits.documentLimit} ${"ドキュメント"}`}
                </span>
              </div>
              {subscriptionType === "organization" && (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>
                    {limits.seatLimit === null
                      ? "メンバー数無制限"
                      : `${limits.seatLimit} ${"メンバー"}`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  {limits.monthlyAICalls === null
                    ? "AI呼び出し無制限"
                    : `${limits.monthlyAICalls.toLocaleString()} ${"AI呼び出し/月"}`}
                </span>
              </div>
              {limits.versionHistory && (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>
                    {"バージョン履歴"}
                  </span>
                </div>
              )}
              {limits.prioritySupport && (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>
                    {"優先サポート"}
                  </span>
                </div>
              )}
            </div>

            {isCurrent ? (
              <div className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-700">
                {"現在のプラン"}
              </div>
            ) : plan === "free" ? (
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-700">
                  {"下位プラン（無料）"}
                </div>
                <p className="text-[11px] text-slate-500">
                  {
                    "無料へ戻す（ダウングレード）場合は、請求ポータルでサブスクリプションをキャンセルしてください。"
                  }
                </p>
              </div>
            ) : isEnterprise ? (
              <a
                href="mailto:sales@docuflow.io"
                className="block rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-medium text-white hover:bg-slate-800"
              >
                {"営業に問い合わせ"}
              </a>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={!planConfigured || loading === plan}
                  className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading === plan ? "読み込み中..." : "アップグレード"}
                </button>
                {!planConfigured && (
                  <p className="text-[11px] text-slate-500">
                    {!baseConfigured
                      ? "Stripe の基本設定（STRIPE_SECRET_KEY / NEXT_PUBLIC_SITE_URL）が未設定です。"
                      : missingPlanEnvKey(plan)
                        ? `${missingPlanEnvKey(plan)} が未設定のため、このプランへアップグレードできません。`
                        : "Stripe の環境変数が未設定のためアップグレードできません。"}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

